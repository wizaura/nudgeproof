import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dodo } from "@/lib/dodo";
import { subscriptionPlanToPlanSlug } from "@/lib/billing/plans";

export const runtime = "nodejs";

async function getOwnedSubscription() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (profileError || !profile?.account_id) {
        return { response: NextResponse.json({ error: "Account not found" }, { status: 404 }) };
    }

    const admin = createAdminClient();
    const { data: subscription, error: subscriptionError } = await admin
        .from("subscriptions")
        .select("id, account_id, provider, provider_subscription_id, plan, status, current_period_end")
        .eq("account_id", profile.account_id)
        .maybeSingle();

    if (subscriptionError) throw subscriptionError;

    return { admin, subscription, response: null };
}

export async function GET() {
    try {
        const owned = await getOwnedSubscription();
        if (owned.response) return owned.response;

        const { subscription } = owned;
        const planSlug = subscriptionPlanToPlanSlug(subscription?.plan);
        if (
            !subscription ||
            subscription.provider !== "dodo" ||
            !subscription.provider_subscription_id ||
            !planSlug ||
            planSlug === "free" ||
            subscription.status !== "active"
        ) {
            return NextResponse.json({ active: false, cancelAtPeriodEnd: false });
        }

        const remote = await dodo.subscriptions.retrieve(subscription.provider_subscription_id);
        return NextResponse.json({
            active: remote.status === "active",
            cancelAtPeriodEnd: remote.cancel_at_next_billing_date,
            currentPeriodEnd: remote.next_billing_date || subscription.current_period_end,
            scheduledPlan: remote.scheduled_change?.product_name ?? null,
            scheduledPlanAt: remote.scheduled_change?.effective_at ?? null,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Billing subscription status lookup failed:", error);
        return NextResponse.json({ error: "Unable to load subscription status" }, { status: 502 });
    }
}

export async function POST(request: Request) {
    try {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const owned = await getOwnedSubscription();
        if (owned.response) return owned.response;

        const { subscription } = owned;
        const planSlug = subscriptionPlanToPlanSlug(subscription?.plan);
        if (
            !subscription ||
            subscription.provider !== "dodo" ||
            !subscription.provider_subscription_id ||
            !planSlug ||
            planSlug === "free" ||
            subscription.status !== "active"
        ) {
            return NextResponse.json({ error: "No active paid subscription to cancel" }, { status: 409 });
        }

        const remote = await dodo.subscriptions.retrieve(subscription.provider_subscription_id);
        if (remote.status !== "active") {
            return NextResponse.json({ error: "The Dodo subscription is not active" }, { status: 409 });
        }

        const updated = remote.cancel_at_next_billing_date
            ? remote
            : await dodo.subscriptions.update(subscription.provider_subscription_id, {
                  cancel_at_next_billing_date: true,
                  cancel_reason: "cancelled_by_customer",
              });

        return NextResponse.json({
            success: true,
            cancelAtPeriodEnd: updated.cancel_at_next_billing_date,
            currentPeriodEnd: updated.next_billing_date || subscription.current_period_end,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Billing subscription cancellation failed:", error);
        return NextResponse.json({ error: "Unable to schedule subscription cancellation" }, { status: 502 });
    }
}
