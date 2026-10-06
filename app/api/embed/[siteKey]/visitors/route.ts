import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redis } from "@/lib/redis/server";

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

const VISITOR_TTL_SECONDS = 60;

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, no-cache, must-revalidate",
    };
}

export async function GET(
    _request: Request,
    { params }: Props
) {
    try {
        const { siteKey } = await params;

        if (!siteKey) {
            return NextResponse.json(
                {
                    error: "Missing site key",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------------
         * Supabase
         * --------------------------------------------------------
         */

        const supabase = createAdminClient();

        /*
         * --------------------------------------------------------
         * 1. Verify website
         * --------------------------------------------------------
         */

        const {
            data: website,
            error: websiteError,
        } = await supabase
            .from("websites")
            .select(
                `
                id,
                account_id,
                site_key,
                status
                `
            )
            .eq("site_key", siteKey)
            .single();

        if (websiteError || !website) {
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

        /*
         * --------------------------------------------------------
         * 2. Verify website is active
         * --------------------------------------------------------
         */

        if (website.status !== "active") {
            return NextResponse.json(
                {
                    error: "Website is inactive",
                },
                {
                    status: 403,
                    headers: corsHeaders(),
                }
            );
        }

        /*
 * --------------------------------------------------------
 * 3. Get account subscription
 * --------------------------------------------------------
 */

        const {
            data: subscription,
            error: subscriptionError,
        } = await supabase
            .from("subscriptions")
            .select(
                `
        id,
        status,
        plan,
        current_period_start,
        current_period_end
        `
            )
            .eq(
                "account_id",
                website.account_id
            )
            .maybeSingle();

        if (subscriptionError) {
            console.error(
                "[NudgeProof] Visitor subscription error:",
                subscriptionError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load subscription",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------------
         * 4. Resolve plan
         * --------------------------------------------------------
         */

        let plan: Plan | null = null;

        /*
         * Use the subscription plan when the
         * subscription is active.
         *
         * Example:
         *
         * subscriptions.plan = "plus"
         * subscriptions.plan = "pro"
         */

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
                .select(
                    `
            id,
            name,
            slug,
            max_impressions
            `
                )
                .eq(
                    "slug",
                    subscription.plan
                )
                .single();

            if (
                subscriptionPlanError ||
                !subscriptionPlan
            ) {
                console.error(
                    "[NudgeProof] Visitor subscription plan error:",
                    subscriptionPlanError
                );

                return NextResponse.json(
                    {
                        error:
                            "Failed to load subscription plan",
                    },
                    {
                        status: 500,
                        headers: corsHeaders(),
                    }
                );
            }

            plan = subscriptionPlan;
        }

        /*
         * --------------------------------------------------------
         * 5. Fall back to Free plan
         * --------------------------------------------------------
         */

        if (!plan) {
            const {
                data: freePlan,
                error: freePlanError,
            } = await supabase
                .from("plans")
                .select(
                    `
            id,
            name,
            slug,
            max_impressions
            `
                )
                .eq(
                    "slug",
                    "free"
                )
                .single();

            if (
                freePlanError ||
                !freePlan
            ) {
                console.error(
                    "[NudgeProof] Free plan lookup error:",
                    freePlanError
                );

                return NextResponse.json(
                    {
                        error:
                            "Free plan is not configured",
                    },
                    {
                        status: 500,
                        headers: corsHeaders(),
                    }
                );
            }

            plan = freePlan;
        }

        /*
         * --------------------------------------------------------
         * 5. Get current monthly usage
         * --------------------------------------------------------
         */

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

        const {
            data: usage,
            error: usageError,
        } = await supabase
            .from("account_usage")
            .select("impressions")
            .eq("account_id", website.account_id)
            .eq("month", month)
            .maybeSingle();

        if (usageError) {
            console.error(
                "[NudgeProof] Visitor usage error:",
                usageError
            );

            return NextResponse.json(
                {
                    error: "Failed to load usage",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        const impressionsUsed =
            usage?.impressions ?? 0;

        const maxImpressions =
            plan.max_impressions;

        const remaining = Math.max(
            maxImpressions - impressionsUsed,
            0
        );

        const limitReached =
            impressionsUsed >= maxImpressions;

        /*
         * --------------------------------------------------------
         * 6. Plan limit reached
         * --------------------------------------------------------
         *
         * Visitor tracking itself is not an impression.
         *
         * However, the embed should not expose visitor
         * information when the account's widget usage has
         * reached its monthly limit.
         */

        if (limitReached) {
            return NextResponse.json(
                {
                    count: 0,
                    plan: {
                        name: plan.name,
                        slug: plan.slug,
                        max_impressions:
                            maxImpressions,
                    },
                    usage: {
                        month,
                        impressions:
                            impressionsUsed,
                        remaining,
                        limit_reached:
                            true,
                    },
                },
                {
                    status: 429,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------------
         * 7. Redis
         * --------------------------------------------------------
         */

        const redisKey =
            `np:visitors:${siteKey}`;

        const cutoff =
            now.getTime() -
            VISITOR_TTL_SECONDS * 1000;

        /*
         * Remove stale visitors.
         */

        await redis.zremrangebyscore(
            redisKey,
            0,
            cutoff
        );

        /*
         * Count visitors whose heartbeat
         * is still inside the active window.
         */

        const count =
            await redis.zcard(redisKey);

        /*
         * Keep key alive for a little longer
         * than the visitor TTL.
         */

        if (count > 0) {
            await redis.expire(
                redisKey,
                VISITOR_TTL_SECONDS + 30
            );
        }

        /*
         * --------------------------------------------------------
         * 8. Response
         * --------------------------------------------------------
         */

        return NextResponse.json(
            {
                count,

                plan: {
                    name: plan.name,
                    slug: plan.slug,
                    max_impressions:
                        maxImpressions,
                },

                usage: {
                    month,
                    impressions:
                        impressionsUsed,
                    remaining,
                    limit_reached:
                        false,
                },
            },
            {
                status: 200,
                headers: corsHeaders(),
            }
        );
    } catch (error) {
        console.error(
            "[NudgeProof] Visitor count error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Unable to retrieve visitor count",
            },
            {
                status: 500,
                headers: corsHeaders(),
            }
        );
    }
}

/*
 * ============================================================
 * OPTIONS
 * ============================================================
 */

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "GET, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type",
            "Access-Control-Max-Age": "86400",
        },
    });
}