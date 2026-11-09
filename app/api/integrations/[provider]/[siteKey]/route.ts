import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = { params: Promise<{ provider: string; siteKey: string }> };
type Json = Record<string, any>;

function sameSignature(expected: string, received: string) {
    const a = Buffer.from(expected);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
}

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, { params }: Props) {
    try {
        const { provider, siteKey } = await params;
        if (provider !== "shopify" && provider !== "woocommerce") {
            return NextResponse.json({ error: "Unsupported integration" }, { status: 404 });
        }
        const rawBody = await request.text();
        const signatureHeader = provider === "shopify"
            ? request.headers.get("x-shopify-hmac-sha256")
            : request.headers.get("x-wc-webhook-signature");
        const supabase = createAdminClient();
        const { data: website } = await supabase.from("websites")
            .select("id, webhook_secret, status").eq("site_key", siteKey).single();
        if (!website || website.status !== "active") {
            return NextResponse.json({ error: "Website unavailable" }, { status: 404 });
        }

        const signingSecret = provider === "shopify"
            ? process.env.SHOPIFY_API_SECRET
            : website.webhook_secret;
        if (!signingSecret || !signatureHeader) {
            return NextResponse.json({ error: "Webhook signature is missing or verification is not configured" }, { status: 401 });
        }
        const expected = createHmac("sha256", signingSecret).update(rawBody).digest(provider === "shopify" ? "base64" : "base64");
        if (!sameSignature(expected, signatureHeader)) {
            return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
        }

        let payload: Json;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        let eventData: Json;
        if (provider === "shopify") {
            const customer = payload.customer ?? {};
            const name = [getText(customer.first_name), getText(customer.last_name)].filter(Boolean).join(" ") || "Someone";
            const product = Array.isArray(payload.line_items)
                ? payload.line_items.map((item: Json) => getText(item.title) || getText(item.name)).filter(Boolean).slice(0, 3).join(", ")
                : "";
            eventData = { name, product: product || "an order", source: "shopify", order_id: payload.id };
        } else {
            const topic = request.headers.get("x-wc-webhook-topic") || "";
            if (topic !== "order.updated" && topic !== "order.created") {
                return NextResponse.json({ error: "Unsupported WooCommerce webhook topic" }, { status: 400 });
            }
            if (!["processing", "completed"].includes(getText(payload.status))) {
                return NextResponse.json({ success: true, ignored: true, reason: "Order is not paid yet" });
            }
            const billing = payload.billing ?? {};
            const customer = payload.customer ?? {};
            const name = [getText(billing.first_name) || getText(customer.first_name), getText(billing.last_name) || getText(customer.last_name)].filter(Boolean).join(" ") || "Someone";
            const product = Array.isArray(payload.line_items)
                ? payload.line_items.map((item: Json) => getText(item.name)).filter(Boolean).slice(0, 3).join(", ")
                : "";
            eventData = { name, product: product || "an order", source: "woocommerce", order_id: payload.id };
        }

        const { data: event, error } = await supabase.from("events").insert({
            website_id: website.id,
            type: "purchase",
            data: eventData,
        }).select("id, created_at").single();
        if (error) {
            console.error(`${provider} event insert failed:`, error);
            return NextResponse.json({ error: "Could not save order event" }, { status: 500 });
        }
        return NextResponse.json({ success: true, event_id: event.id, created_at: event.created_at }, { status: 201 });
    } catch (error) {
        console.error("Provider webhook failed:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
