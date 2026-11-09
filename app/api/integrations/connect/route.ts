import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Provider = "shopify" | "woocommerce";

function normalizeHost(value: unknown) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
        const url = new URL(value.includes("://") ? value : `https://${value}`);
        return url.hostname.toLowerCase();
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const provider = body.provider as Provider;
        const websiteId = typeof body.websiteId === "string" ? body.websiteId : "";
        if (!["shopify", "woocommerce"].includes(provider) || !websiteId) {
            return NextResponse.json({ error: "Choose a supported integration and website." }, { status: 400 });
        }

        const { data: profile } = await supabase.from("profiles").select("account_id").eq("user_id", user.id).single();
        if (!profile?.account_id) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        const { data: website } = await supabase.from("websites")
            .select("id, url, site_key, webhook_secret")
            .eq("id", websiteId).eq("account_id", profile.account_id).single();
        if (!website) return NextResponse.json({ error: "Website not found" }, { status: 404 });

        const host = normalizeHost(body.storeUrl);
        if (!host) return NextResponse.json({ error: "Enter a valid store URL." }, { status: 400 });
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");

        if (provider === "shopify") {
            if (!host.endsWith(".myshopify.com")) {
                return NextResponse.json({ error: "Use your store’s .myshopify.com domain." }, { status: 400 });
            }
            const token = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
            if (!token) return NextResponse.json({ error: "Shopify Admin API access token is required." }, { status: 400 });
            const secret = process.env.SHOPIFY_API_SECRET;
            if (!secret) return NextResponse.json({ error: "Shopify webhook verification is not configured yet. Set SHOPIFY_API_SECRET." }, { status: 503 });

            const response = await fetch(`https://${host}/admin/api/2026-10/graphql.json`, {
                method: "POST",
                headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `mutation CreateOrderWebhook($topic: WebhookSubscriptionTopic!, $subscription: WebhookSubscriptionInput!) { webhookSubscriptionCreate(topic: $topic, webhookSubscription: $subscription) { userErrors { field message } webhookSubscription { id } } }`,
                    variables: {
                        topic: "ORDERS_PAID",
                        subscription: { uri: `${appUrl}/api/integrations/shopify/${website.site_key}`, format: "JSON" },
                    },
                }),
                cache: "no-store",
            });
            const result = await response.json().catch(() => ({}));
            const userErrors = result.data?.webhookSubscriptionCreate?.userErrors ?? [];
            if (!response.ok || result.errors?.length || userErrors.length) {
                return NextResponse.json({ error: userErrors[0]?.message || result.errors?.[0]?.message || "Shopify could not register the order webhook. Check the token has write_webhooks permission." }, { status: 502 });
            }
            return NextResponse.json({ success: true, message: `Shopify orders are now connected to ${website.url}.` });
        }

        const consumerKey = typeof body.consumerKey === "string" ? body.consumerKey.trim() : "";
        const consumerSecret = typeof body.consumerSecret === "string" ? body.consumerSecret.trim() : "";
        if (!consumerKey || !consumerSecret) return NextResponse.json({ error: "WooCommerce consumer key and secret are required." }, { status: 400 });
        const websiteHost = normalizeHost(website.url);
        const canonicalHost = (value: string) => value.replace(/^www\./, "");
        if (!websiteHost || canonicalHost(host) !== canonicalHost(websiteHost)) {
            return NextResponse.json({ error: "For security, the WooCommerce store URL must use the same domain as the selected NudgeProof website." }, { status: 400 });
        }

        const target = `https://${host}/wp-json/wc/v3/webhooks`;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
        const existingResponse = await fetch(`${target}?per_page=100`, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
        const existingWebhooks = existingResponse.ok ? await existingResponse.json().catch(() => []) : [];
        const deliveryUrl = `${appUrl}/api/integrations/woocommerce/${website.site_key}`;
        if (Array.isArray(existingWebhooks) && existingWebhooks.some((item: { delivery_url?: string; topic?: string }) => item.delivery_url === deliveryUrl && (item.topic === "order.updated" || item.topic === "order.created"))) {
            return NextResponse.json({ success: true, message: `WooCommerce is already connected to ${website.url}.` });
        }
        const response = await fetch(target, {
            method: "POST",
            headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
            body: JSON.stringify({ name: "NudgeProof orders", topic: "order.updated", delivery_url: deliveryUrl, secret: website.webhook_secret, status: "active" }),
            cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return NextResponse.json({ error: result.message || "WooCommerce could not register its order webhook. Check that the REST key has write access." }, { status: 502 });
        return NextResponse.json({ success: true, message: `WooCommerce orders are now connected to ${website.url}.` });
    } catch (error) {
        console.error("Integration connection failed:", error);
        return NextResponse.json({ error: "Could not connect this integration." }, { status: 500 });
    }
}
