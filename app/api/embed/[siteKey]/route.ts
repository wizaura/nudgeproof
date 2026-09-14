import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
    params: Promise<{
        siteKey: string;
    }>;
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
         *
         * This endpoint is public because it is called by
         * the customer's website.
         *
         * We therefore use the server-only admin client
         * and explicitly select only safe public data.
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
         * 3. Get active widgets
         * --------------------------------------------------
         */

        const { data: widgets, error: widgetsError } =
            await supabase
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
                .eq("website_id", website.id)
                .eq("status", "active")
                .order("created_at", {
                    ascending: true,
                });

        if (widgetsError) {
            console.error(
                "Embed widgets error:",
                widgetsError
            );

            return NextResponse.json(
                {
                    error: "Failed to load widgets",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 4. Get recent purchase events
         * --------------------------------------------------
         *
         * These are the real sales received through our
         * webhook endpoint.
         *
         * We only select the fields the embed needs.
         */

        const { data: purchaseEvents, error: eventsError } =
            await supabase
                .from("events")
                .select(
                    `
                    id,
                    type,
                    data,
                    created_at
                    `
                )
                .eq("website_id", website.id)
                .eq("type", "purchase")
                .order("created_at", {
                    ascending: false,
                })
                .limit(20);

        if (eventsError) {
            console.error(
                "Embed events error:",
                eventsError
            );

            return NextResponse.json(
                {
                    error: "Failed to load events",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 5. Return public embed configuration + data
         * --------------------------------------------------
         */

        return NextResponse.json(
            {
                site: {
                    id: website.id,
                    name: website.name,
                    url: website.url,
                    site_key: website.site_key,
                },

                widgets: widgets ?? [],

                events: purchaseEvents ?? [],
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
                error: "Internal server error",
            },
            {
                status: 500,
                headers: corsHeaders(),
            }
        );
    }
}