
import { Webhooks } from "@dodopayments/nextjs";
import { createClient } from "@supabase/supabase-js";
import { dodo } from "@/lib/dodo";
import { planSlugToSubscriptionPlan, subscriptionPlanToPlanSlug } from "@/lib/billing/plans";

export const runtime = "nodejs";

const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

if (!webhookKey) {
    throw new Error("Missing DODO_PAYMENTS_WEBHOOK_KEY");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
}

const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

type DodoPayload = {
    type?: string;
    data?: {
        subscription_id?: string;
        subscription_ids?: string[];
        payment_id?: string;
        customer_id?: string;
        product_id?: string;
        status?: string;
        product_cart?: { product_id: string; quantity: number }[] | null;
        customer?: { customer_id?: string } | null;
        metadata?: Record<string, unknown> | null;
        created_at?: string;
        previous_billing_date?: string | null;
        next_billing_date?: string | null;
        cancel_at_next_billing_date?: boolean;
    };
};

function getPlanFromProductId(productId?: string) {
    if (
        productId &&
        productId === process.env.DODO_PLUS_PRODUCT_ID
    ) {
        return "plus";
    }

    if (
        productId &&
        productId === process.env.DODO_PRO_PRODUCT_ID
    ) {
        return "pro";
    }

    return null;
}

function getSubscriptionStatus(
    eventType: string,
    providerStatus?: string,
    existingStatus?: string | null
) {
    switch (eventType) {
        case "subscription.active":
        case "subscription.renewed":
        case "subscription.unpaused":
            return "active";

        case "subscription.on_hold":
        case "subscription.past_due":
        case "subscription.failed":
            return "past_due";

        case "subscription.paused":
            return "incomplete";

        case "subscription.cancelled":
            return "canceled";

        case "subscription.expired":
            return "canceled";

        default:
            switch (providerStatus?.toLowerCase()) {
                case "active":
                    return "active";
                case "pending":
                    return "incomplete";
                case "on_hold":
                case "past_due":
                    return "past_due";
                case "failed":
                    return "past_due";
                case "paused":
                    return "incomplete";
                case "cancelled":
                    return "canceled";
                case "expired":
                    return "canceled";
                default:
                    // Plan-change/update events can omit a status. Preserve the
                    // current lifecycle state so the new product is still synced.
                    return existingStatus || null;
            }
    }
}

async function handleWebhook(payload: DodoPayload) {
    const eventType = payload.type;
    const data = payload.data;

    if (!eventType || !data) {
        throw new Error("Invalid Dodo webhook payload");
    }

    // Checkout-session metadata belongs to the payment. On initial purchase,
    // use payment.succeeded to associate the verified Dodo subscription with
    // the account, then let subscription events keep it current.
    const subscriptionEvents = [
        "subscription.active",
        "subscription.renewed",
        "subscription.updated",
        "subscription.plan_changed",
        "subscription.on_hold",
        "subscription.past_due",
        "subscription.paused",
        "subscription.unpaused",
        "subscription.cancelled",
        "subscription.failed",
        "subscription.expired",
    ];

    const isSubscriptionPayment =
        eventType === "payment.succeeded" &&
        Boolean(data.subscription_id || data.subscription_ids?.length);

    if (!subscriptionEvents.includes(eventType) && !isSubscriptionPayment) {
        // Other events, such as payment.succeeded, do not directly
        // change the subscription record in this handler.
        return;
    }

    const providerSubscriptionId =
        data.subscription_id ||
        (data.subscription_ids?.length === 1
            ? data.subscription_ids[0]
            : undefined);

    if (!providerSubscriptionId) {
        throw new Error(
            `Missing subscription_id for ${eventType}`
        );
    }

    // Look up by the provider subscription ID first. This makes
    // repeated deliveries update the same database record.
    const { data: subscriptionMatch, error: lookupError } =
        await supabaseAdmin
            .from("subscriptions")
            .select(
                "id, account_id, plan, status, current_period_start, current_period_end"
            )
            .eq("provider", "dodo")
            .eq(
                "provider_subscription_id",
                providerSubscriptionId
            )
            .maybeSingle();

    if (lookupError) {
        throw lookupError;
    }

    const metadata =
        data.metadata &&
        typeof data.metadata === "object"
            ? data.metadata
            : {};

    // Payment metadata is the reliable account mapping for checkout sessions.
    // Retrieve the subscription for its canonical product, status, and dates.
    const remoteSubscription = isSubscriptionPayment
        ? await dodo.subscriptions.retrieve(providerSubscriptionId)
        : null;

    const productId = remoteSubscription?.product_id || data.product_id;
    const providerStatus = remoteSubscription?.status || data.status;
    const providerCustomerId =
        remoteSubscription?.customer?.customer_id ||
        data.customer_id ||
        data.customer?.customer_id ||
        null;
    const subscriptionCreatedAt =
        remoteSubscription?.created_at?.toString() || data.created_at;
    const previousBillingDate =
        remoteSubscription?.previous_billing_date || data.previous_billing_date;
    const nextBillingDate =
        remoteSubscription?.next_billing_date || data.next_billing_date;

    const metadataAccountId =
        typeof metadata.account_id === "string"
            ? metadata.account_id
            : null;

    const accountId =
        subscriptionMatch?.account_id || metadataAccountId;

    if (!accountId) {
        throw new Error(
            `Cannot resolve account for Dodo subscription ${providerSubscriptionId}. ` +
            "Ensure account_id is included in subscription metadata."
        );
    }

    // A free account already has its single subscriptions row. Reuse it for
    // the first paid purchase instead of inserting a second row for account_id.
    let existing = subscriptionMatch;
    if (!existing) {
        const { data: accountSubscription, error: accountSubscriptionError } =
            await supabaseAdmin
                .from("subscriptions")
                .select("id, account_id, plan, status, current_period_start, current_period_end")
                .eq("account_id", accountId)
                .maybeSingle();

        if (accountSubscriptionError) throw accountSubscriptionError;
        existing = accountSubscription;
    }

    // Resolve the plan from trusted product IDs, not from a
    // user-supplied plan name.
    const planSlug =
        getPlanFromProductId(productId) ||
        (typeof metadata.plan === "string" &&
        ["free", "plus", "pro"].includes(metadata.plan)
            ? metadata.plan
            : subscriptionPlanToPlanSlug(existing?.plan));

    if (!planSlug) {
        throw new Error(
            `Cannot resolve plan for Dodo subscription ${providerSubscriptionId}`
        );
    }

    const { data: plan, error: planError } =
        await supabaseAdmin
            .from("plans")
            .select("slug")
            .eq("slug", planSlug)
            .maybeSingle();

    if (planError) {
        throw planError;
    }

    if (!plan) {
        throw new Error(
            `Plan "${planSlug}" does not exist in the plans table`
        );
    }

    const status = getSubscriptionStatus(
        isSubscriptionPayment ? "subscription.updated" : eventType,
        providerStatus,
        existing?.status
    );

    if (!status) {
        // Ignore events whose status is not recognized.
        return;
    }

    const currentPeriodStart =
        previousBillingDate ||
        existing?.current_period_start ||
        subscriptionCreatedAt ||
        new Date().toISOString();

    const currentPeriodEnd =
        nextBillingDate ||
        existing?.current_period_end ||
        null;

    const subscriptionPlan = planSlugToSubscriptionPlan(plan.slug);
    if (!subscriptionPlan) {
        throw new Error(`Plan "${plan.slug}" cannot be stored on subscriptions`);
    }

    const subscriptionRecord = {
        account_id: accountId,
        provider: "dodo",
        provider_customer_id:
            providerCustomerId,
        provider_subscription_id:
            providerSubscriptionId,
        plan: subscriptionPlan,
        status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
    };

    if (existing) {
        const { error: updateError } =
            await supabaseAdmin
                .from("subscriptions")
                .update(subscriptionRecord)
                .eq("id", existing.id);

        if (updateError) {
            throw updateError;
        }
    } else {
        const { error: insertError } =
            await supabaseAdmin
                .from("subscriptions")
                .insert({
                    ...subscriptionRecord,
                    created_at: new Date().toISOString(),
                });

        if (insertError) {
            throw insertError;
        }
    }

    console.info("Dodo subscription synced", {
        eventType,
        providerSubscriptionId,
        plan: plan.slug,
        status,
    });
}

export const POST = Webhooks({
    webhookKey,
    onPayload: async (payload) => {
        await handleWebhook(payload as DodoPayload);
    },
});
