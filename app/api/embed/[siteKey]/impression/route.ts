import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
    params: Promise<{
        siteKey: string;
    }>;
};

type Plan = {
    id: string;
    name: string;
    slug: string;
    max_impressions: number;
};

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store",
    };
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

export async function POST(
    request: Request,
    { params }: Props
) {
    try {
        const { siteKey } = await params;

        if (!siteKey) {
            return NextResponse.json(
                {
                    error: "Site key is required",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        const supabase = createAdminClient();

        // --------------------------------------------------
        // 1. Find website
        // --------------------------------------------------

        const { data: website, error: websiteError } =
            await supabase
                .from("websites")
                .select(`
                    id,
                    account_id,
                    site_key,
                    status
                `)
                .eq("site_key", siteKey)
                .single();

        if (websiteError || !website) {
            console.error(
                "[NudgeProof] Impression website error:",
                websiteError
            );

            return NextResponse.json(
                {
                    error: "Website not found",
                },
                {
                    status: 404,
                    headers: corsHeaders(),
                }
            );
        }

        // --------------------------------------------------
        // 2. Verify website is active
        // --------------------------------------------------

        if (website.status !== "active") {
            return NextResponse.json(
                {
                    error: "Website is not active",
                },
                {
                    status: 403,
                    headers: corsHeaders(),
                }
            );
        }

        // --------------------------------------------------
        // 3. Get subscription
        // --------------------------------------------------

        const {
            data: subscription,
            error: subscriptionError,
        } = await supabase
            .from("subscriptions")
            .select(`
                id,
                status,
                plan,
                current_period_start,
                current_period_end
            `)
            .eq("account_id", website.account_id)
            .maybeSingle();

        if (subscriptionError) {
            console.error(
                "[NudgeProof] Impression subscription error:",
                subscriptionError
            );

            return NextResponse.json(
                {
                    error: "Failed to load subscription",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        // --------------------------------------------------
        // 4. Resolve plan
        // --------------------------------------------------

        let plan: Plan | null = null;

        if (
            subscription &&
            subscription.status === "active" &&
            subscription.plan
        ) {
            const {
                data: subscriptionPlan,
                error: subscriptionPlanError,
            } = await supabase
                .from("plans")
                .select(`
                    id,
                    name,
                    slug,
                    max_impressions
                `)
                .eq("slug", subscription.plan)
                .single();

            if (
                subscriptionPlanError ||
                !subscriptionPlan
            ) {
                console.error(
                    "[NudgeProof] Impression plan error:",
                    subscriptionPlanError
                );

                return NextResponse.json(
                    {
                        error: "Failed to load subscription plan",
                    },
                    {
                        status: 500,
                        headers: corsHeaders(),
                    }
                );
            }

            plan = subscriptionPlan;
        }

        // --------------------------------------------------
        // 5. Fall back to Free plan
        // --------------------------------------------------

        if (!plan) {
            const {
                data: freePlan,
                error: freePlanError,
            } = await supabase
                .from("plans")
                .select(`
                    id,
                    name,
                    slug,
                    max_impressions
                `)
                .eq("slug", "free")
                .single();

            if (freePlanError || !freePlan) {
                console.error(
                    "[NudgeProof] Free plan error:",
                    freePlanError
                );

                return NextResponse.json(
                    {
                        error: "Free plan is not configured",
                    },
                    {
                        status: 500,
                        headers: corsHeaders(),
                    }
                );
            }

            plan = freePlan;
        }

        // --------------------------------------------------
        // 6. Current month
        // --------------------------------------------------

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

        // --------------------------------------------------
        // 7. Atomically increment impression
        // --------------------------------------------------

        const { data, error: incrementError } =
            await supabase.rpc(
                "increment_account_impression",
                {
                    p_account_id: website.account_id,
                    p_month: month,
                    p_max_impressions: plan.max_impressions,
                }
            );

        if (incrementError) {
            console.error(
                "[NudgeProof] Impression increment error:",
                incrementError
            );

            return NextResponse.json(
                {
                    error: "Failed to record impression",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        const result = Array.isArray(data)
            ? data[0]
            : data;

        if (!result) {
            return NextResponse.json(
                {
                    error: "Failed to record impression",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        // --------------------------------------------------
        // 8. Limit reached
        // --------------------------------------------------

        if (!result.allowed) {
            return NextResponse.json(
                {
                    allowed: false,
                    plan: {
                        name: plan.name,
                        slug: plan.slug,
                        max_impressions:
                            plan.max_impressions,
                    },
                    usage: {
                        month,
                        impressions:
                            result.impressions,
                        remaining:
                            result.remaining,
                        limit_reached: true,
                    },
                },
                {
                    status: 429,
                    headers: corsHeaders(),
                }
            );
        }

        // --------------------------------------------------
        // 9. Success
        // --------------------------------------------------

        return NextResponse.json(
            {
                allowed: true,
                plan: {
                    name: plan.name,
                    slug: plan.slug,
                    max_impressions:
                        plan.max_impressions,
                },
                usage: {
                    month,
                    impressions:
                        result.impressions,
                    remaining:
                        result.remaining,
                    limit_reached: false,
                },
            },
            {
                status: 200,
                headers: corsHeaders(),
            }
        );
    } catch (error) {
        console.error(
            "[NudgeProof] Impression API error:",
            error
        );

        return NextResponse.json(
            {
                error: "Internal server error",
            },
            {
                status: 500,
                headers: corsHeaders(),
            }
        );
    }
}