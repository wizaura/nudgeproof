import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dodo } from "@/lib/dodo";
import { planSlugToSubscriptionPlan } from "@/lib/billing/plans";

function getPlanFromProductId(productId: string) {
    if (productId === process.env.DODO_PLUS_PRODUCT_ID) return "plus";
    if (productId === process.env.DODO_PRO_PRODUCT_ID) return "pro";
    return null;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const subscriptionId =
            typeof body?.subscription_id === "string"
                ? body.subscription_id.trim()
                : "";
        const paymentId =
            typeof body?.payment_id === "string"
                ? body.payment_id.trim()
                : "";

        if (!subscriptionId || subscriptionId.length > 200) {
            return NextResponse.json(
                { error: "A valid subscription ID is required" },
                { status: 400 }
            );
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile?.account_id) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        // The redirect is not proof of payment. Fetch the subscription directly
        // from Dodo and only sync a live, active subscription for this account.
        const [remoteSubscription, remotePayment] = await Promise.all([
            dodo.subscriptions.retrieve(subscriptionId),
            paymentId ? dodo.payments.retrieve(paymentId) : Promise.resolve(null),
        ]);
        const metadata = remoteSubscription.metadata ?? {};
        const admin = createAdminClient();

        const { data: subscriptionMatch, error: existingError } = await admin
            .from("subscriptions")
            .select("id, account_id")
            .eq("provider", "dodo")
            .eq("provider_subscription_id", subscriptionId)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        // Accounts start with one free subscription row. Reuse it when this is
        // their first paid subscription because account_id is unique.
        let existing = subscriptionMatch;
        if (!existing) {
            const { data: accountSubscription, error: accountSubscriptionError } =
                await admin
                    .from("subscriptions")
                    .select("id, account_id")
                    .eq("account_id", profile.account_id)
                    .maybeSingle();

            if (accountSubscriptionError) throw accountSubscriptionError;
            existing = accountSubscription;
        }

        const metadataAccountId =
            typeof metadata.account_id === "string"
                ? metadata.account_id
                : null;
        const paymentAccountId =
            remotePayment && typeof remotePayment.metadata?.account_id === "string"
                ? remotePayment.metadata.account_id
                : null;
        const paymentMatchesSubscription = remotePayment
            ? remotePayment.status === "succeeded" &&
              (remotePayment.subscription_id === subscriptionId ||
                  remotePayment.subscription_ids?.includes(subscriptionId))
            : false;

        if (remotePayment && !paymentMatchesSubscription) {
            return NextResponse.json(
                { error: "Payment does not match this subscription" },
                { status: 403 }
            );
        }

        const accountClaims = [
            subscriptionMatch?.account_id,
            existing?.account_id,
            metadataAccountId,
            paymentAccountId,
        ].filter((accountId): accountId is string => Boolean(accountId));
        const belongsToAccount =
            accountClaims.length > 0 &&
            accountClaims.every((accountId) => accountId === profile.account_id);

        if (!belongsToAccount) {
            return NextResponse.json(
                { error: "Subscription does not belong to this account" },
                { status: 403 }
            );
        }

        if (remoteSubscription.status !== "active") {
            return NextResponse.json(
                {
                    synced: false,
                    status: remoteSubscription.status,
                },
                { status: 202 }
            );
        }

        const plan = getPlanFromProductId(remoteSubscription.product_id);
        if (!plan) {
            console.error("Unknown Dodo product on subscription", {
                subscriptionId,
                productId: remoteSubscription.product_id,
            });
            return NextResponse.json(
                { error: "Subscription product is not configured" },
                { status: 422 }
            );
        }

        const subscriptionPlan = planSlugToSubscriptionPlan(plan);
        if (!subscriptionPlan) {
            return NextResponse.json(
                { error: "Subscription plan is not supported" },
                { status: 422 }
            );
        }

        const record = {
            account_id: profile.account_id,
            provider: "dodo",
            provider_customer_id:
                remoteSubscription.customer?.customer_id ?? null,
            provider_subscription_id: subscriptionId,
            plan: subscriptionPlan,
            status: "active",
            current_period_start:
                remoteSubscription.previous_billing_date ||
                remoteSubscription.created_at,
            current_period_end: remoteSubscription.next_billing_date || null,
            updated_at: new Date().toISOString(),
        };

        if (existing) {
            const { error: updateError } = await admin
                .from("subscriptions")
                .update(record)
                .eq("id", existing.id);

            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await admin
                .from("subscriptions")
                .insert({
                    ...record,
                    created_at: new Date().toISOString(),
                });

            if (insertError) {
                // A webhook or another sync may have inserted/updated the
                // account row in parallel. Reuse that row rather than fail.
                const { data: concurrentRecord, error: lookupError } = await admin
                    .from("subscriptions")
                    .select("id, account_id")
                    .eq("account_id", profile.account_id)
                    .maybeSingle();

                if (lookupError || !concurrentRecord) throw insertError;
                if (concurrentRecord.account_id !== profile.account_id) {
                    return NextResponse.json(
                        { error: "Subscription does not belong to this account" },
                        { status: 403 }
                    );
                }

                const { error: updateError } = await admin
                    .from("subscriptions")
                    .update(record)
                    .eq("id", concurrentRecord.id);

                if (updateError) throw updateError;
            }
        }

        return NextResponse.json({
            synced: true,
            plan,
            status: "active",
        });
    } catch (error) {
        console.error("Billing subscription sync failed:", error);
        return NextResponse.json(
            { error: "Unable to verify subscription with Dodo Payments" },
            { status: 502 }
        );
    }
}
