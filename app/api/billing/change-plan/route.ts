import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dodo } from "@/lib/dodo";
import { subscriptionPlanToPlanSlug } from "@/lib/billing/plans";

export const runtime = "nodejs";

const PRODUCT_IDS = {
    plus: process.env.DODO_PLUS_PRODUCT_ID,
    pro: process.env.DODO_PRO_PRODUCT_ID,
} as const;

const PLAN_RANK = { free: 0, plus: 1, pro: 2 } as const;

export async function POST(request: Request) {
    try {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const body = await request.json();
        const targetPlan = body?.plan as unknown;
        if (targetPlan !== "plus" && targetPlan !== "pro") {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const planSlug = targetPlan as keyof typeof PRODUCT_IDS;
        const productId = PRODUCT_IDS[planSlug];
        if (!productId) {
            return NextResponse.json({ error: "Dodo product is not configured" }, { status: 500 });
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .single();
        if (profileError || !profile?.account_id) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const admin = createAdminClient();
        const { data: subscription, error: subscriptionError } = await admin
            .from("subscriptions")
            .select("provider, provider_subscription_id, plan, status")
            .eq("account_id", profile.account_id)
            .maybeSingle();
        if (subscriptionError) throw subscriptionError;

        const currentPlan = subscriptionPlanToPlanSlug(subscription?.plan);
        if (
            !subscription || subscription.provider !== "dodo" ||
            !subscription.provider_subscription_id || !currentPlan ||
            currentPlan === "free" || subscription.status !== "active"
        ) {
            return NextResponse.json({ error: "An active paid subscription is required to change plans" }, { status: 409 });
        }
        if (targetPlan === currentPlan) {
            return NextResponse.json({ error: "This is already your current plan" }, { status: 409 });
        }

        const remote = await dodo.subscriptions.retrieve(subscription.provider_subscription_id);
        if (remote.status !== "active") {
            return NextResponse.json({ error: "The Dodo subscription is not active" }, { status: 409 });
        }

        // A scheduled cancellation and a scheduled downgrade cannot both be active.
        if (remote.cancel_at_next_billing_date) {
            await dodo.subscriptions.update(subscription.provider_subscription_id, {
                cancel_at_next_billing_date: false,
            });
        }

        const isDowngrade = PLAN_RANK[planSlug] < PLAN_RANK[currentPlan];
        const changed = await dodo.subscriptions.changePlan(subscription.provider_subscription_id, {
            product_id: productId,
            quantity: 1,
            effective_at: isDowngrade ? "next_billing_date" : "immediately",
            proration_billing_mode: isDowngrade ? "do_not_bill" : "prorated_immediately",
            cancel_scheduled_change_plan: true,
        });

        const updated = await dodo.subscriptions.retrieve(subscription.provider_subscription_id);
        return NextResponse.json({
            success: true,
            effectiveAt: updated.scheduled_change?.effective_at ?? "immediately",
            scheduledPlan: updated.scheduled_change?.product_name ?? null,
            paymentLink: changed.payment_link ?? null,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Billing plan change failed:", error);
        return NextResponse.json({ error: "Unable to change subscription plan" }, { status: 502 });
    }
}
