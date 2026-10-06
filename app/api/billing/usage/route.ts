import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();

        // ---------------------------------------------------------
        // Authenticate user
        // ---------------------------------------------------------
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

        const adminSupabase = createAdminClient();

        // ---------------------------------------------------------
        // Get account ID from profile
        // ---------------------------------------------------------

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile?.account_id) {
            console.error("Failed to fetch profile:", profileError);

            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        const accountId = profile.account_id;

        // ---------------------------------------------------------
        // Get current subscription
        // ---------------------------------------------------------
        const { data: subscription, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select(`
                    id,
                    plan,
                    status,
                    current_period_start,
                    current_period_end
                `)
                .eq("account_id", accountId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (subscriptionError) {
            console.error(
                "Failed to fetch subscription:",
                subscriptionError
            );

            return NextResponse.json(
                { error: "Failed to fetch subscription" },
                { status: 500 }
            );
        }

        // ---------------------------------------------------------
        // Resolve plan
        // ---------------------------------------------------------
        const planSlug = subscription?.plan || "free";

        const { data: plan, error: planError } = await supabase
            .from("plans")
            .select(`
                id,
                name,
                slug,
                price_monthly,
                max_impressions,
                analytics_days,
                remove_branding,
                priority_support
            `)
            .eq("slug", planSlug)
            .maybeSingle();

        if (planError) {
            console.error("Failed to fetch plan:", planError);

            return NextResponse.json(
                { error: "Failed to fetch plan" },
                { status: 500 }
            );
        }

        // ---------------------------------------------------------
        // Fallback to free plan
        // ---------------------------------------------------------
        let currentPlan = plan;

        if (!currentPlan) {
            const { data: freePlan, error: freePlanError } =
                await supabase
                    .from("plans")
                    .select(`
                        id,
                        name,
                        slug,
                        price_monthly,
                        max_impressions,
                        analytics_days,
                        remove_branding,
                        priority_support
                    `)
                    .eq("slug", "free")
                    .single();

            if (freePlanError || !freePlan) {
                console.error(
                    "Failed to fetch fallback free plan:",
                    freePlanError
                );

                return NextResponse.json(
                    { error: "Plan configuration not found" },
                    { status: 500 }
                );
            }

            currentPlan = freePlan;
        }

        // ---------------------------------------------------------
        // Get current month's usage
        // ---------------------------------------------------------
        const now = new Date();

        const month = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                1
            )
        )
            .toISOString()
            .split("T")[0];

        const { data: usage, error: usageError } = await adminSupabase
            .from("account_usage")
            .select(`
                month,
                impressions
            `)
            .eq("account_id", accountId)
            .eq("month", month)
            .maybeSingle();

        console.log(usage,'usage', month, accountId)

        if (usageError) {
            console.error("Failed to fetch account usage:", usageError);

            return NextResponse.json(
                { error: "Failed to fetch usage" },
                { status: 500 }
            );
        }

        const impressions = usage?.impressions ?? 0;

        const maxImpressions = currentPlan.max_impressions;

        const remaining = Math.max(
            maxImpressions - impressions,
            0
        );

        const limitReached =
            impressions >= maxImpressions;

        // ---------------------------------------------------------
        // Response
        // ---------------------------------------------------------
        return NextResponse.json({
            success: true,

            plan: currentPlan,

            subscription: subscription
                ? {
                      id: subscription.id,
                      plan: subscription.plan,
                      status: subscription.status,
                      current_period_start:
                          subscription.current_period_start,
                      current_period_end:
                          subscription.current_period_end,
                  }
                : null,

            usage: {
                month,
                impressions,
                max_impressions: maxImpressions,
                remaining,
                limit_reached: limitReached,
            },
        });
    } catch (error) {
        console.error("Billing usage API error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}