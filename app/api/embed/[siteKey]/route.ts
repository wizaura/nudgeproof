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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=10",
    };
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(),
    });
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
                    error: "Site key is required",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * Admin client
         * --------------------------------------------------
         */

        const supabase = createAdminClient();

        /*
         * --------------------------------------------------
         * 1. Find website
         * --------------------------------------------------
         */

        const { data: website, error: websiteError } =
            await supabase
                .from("websites")
                .select(
                    `
                    id,
                    account_id,
                    name,
                    url,
                    site_key,
                    status
                    `
                )
                .eq("site_key", siteKey)
                .single();

        if (websiteError || !website) {
            console.error(
                "Embed website error:",
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

        /*
         * --------------------------------------------------
         * 2. Make sure website is active
         * --------------------------------------------------
         */

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

        /*
 * --------------------------------------------------
 * 3. Get account subscription
 * --------------------------------------------------
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
            .eq("account_id", website.account_id)
            .maybeSingle();

        if (subscriptionError) {
            console.error(
                "Embed subscription error:",
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

        /*
         * --------------------------------------------------
         * 4. Resolve plan
         * --------------------------------------------------
         */

        type Plan = {
            id: string;
            name: string;
            slug: string;
            max_impressions: number;
        };

        let plan: Plan | null = null;

        /*
         * Use the subscription plan when the subscription
         * is active.
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

            if (subscriptionPlanError) {
                console.error(
                    "Embed subscription plan error:",
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
         * --------------------------------------------------
         * 5. Fall back to Free plan
         * --------------------------------------------------
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

            if (freePlanError || !freePlan) {
                console.error(
                    "Free plan lookup error:",
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
         * --------------------------------------------------
         * 5. Get current monthly usage
         * --------------------------------------------------
         *
         * Usage is tracked by account and calendar month.
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
                "Embed usage error:",
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

        const remaining =
            Math.max(
                maxImpressions -
                impressionsUsed,
                0
            );

        const limitReached =
            impressionsUsed >=
            maxImpressions;

        /*
         * --------------------------------------------------
         * 6. Get active widgets
         * --------------------------------------------------
         */

        const {
            data: widgets,
            error: widgetsError,
        } = await supabase
            .from("widgets")
            .select(
                `
                id,
                name,
                type,
                config,
                status
                `
            )
            .eq(
                "website_id",
                website.id
            )
            .eq(
                "status",
                "active"
            )
            .order(
                "created_at",
                {
                    ascending: true,
                }
            );

        if (widgetsError) {
            console.error(
                "Embed widgets error:",
                widgetsError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load widgets",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 7. Get recent purchase events
         * --------------------------------------------------
         */

        const {
            data: purchaseEvents,
            error: eventsError,
        } = await supabase
            .from("events")
            .select(
                `
                id,
                type,
                data,
                created_at
                `
            )
            .eq(
                "website_id",
                website.id
            )
            .eq(
                "type",
                "purchase"
            )
            .order(
                "created_at",
                {
                    ascending: false,
                }
            )
            .limit(20);

        if (eventsError) {
            console.error(
                "Embed events error:",
                eventsError
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to load events",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 8. Return embed configuration
         * --------------------------------------------------
         *
         * IMPORTANT:
         *
         * We do NOT increment impressions here.
         *
         * This endpoint only tells the embed whether
         * widgets are allowed to load.
         *
         * Actual impression counting will happen through
         * the dedicated impression endpoint.
         */

        return NextResponse.json(
            {
                site: {
                    id: website.id,
                    name: website.name,
                    url: website.url,
                    site_key: website.site_key,
                },

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
                        limitReached,
                },

                /*
                 * When the monthly limit has been reached,
                 * don't send widgets to the customer's
                 * website.
                 */
                widgets: limitReached
                    ? []
                    : widgets ?? [],

                events:
                    purchaseEvents ?? [],
            },
            {
                headers: corsHeaders(),
            }
        );
    } catch (error) {
        console.error(
            "Embed API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Internal server error",
            },
            {
                status: 500,
                headers: corsHeaders(),
            }
        );
    }
}