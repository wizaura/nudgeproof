import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
    params: Promise<{
        siteKey: string;
    }>;
};

type WebhookPayload = {
    type: string;
    data: Record<string, unknown>;
};

const ALLOWED_EVENT_TYPES = [
    "purchase",
    "signup",
    "review",
    "custom",
];

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
            "Content-Type, Authorization",
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

        /*
         * --------------------------------------------------
         * 1. Get webhook secret from Authorization header
         * --------------------------------------------------
         */

        const authorization =
            request.headers.get("authorization");

        if (!authorization) {
            return NextResponse.json(
                {
                    error: "Authorization header is required",
                },
                {
                    status: 401,
                    headers: corsHeaders(),
                }
            );
        }

        if (!authorization.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    error: "Invalid authorization format",
                },
                {
                    status: 401,
                    headers: corsHeaders(),
                }
            );
        }

        const webhookSecret =
            authorization.substring("Bearer ".length).trim();

        if (!webhookSecret) {
            return NextResponse.json(
                {
                    error: "Webhook secret is required",
                },
                {
                    status: 401,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 2. Create admin Supabase client
         * --------------------------------------------------
         */

        const supabase = createAdminClient();

        /*
         * --------------------------------------------------
         * 3. Find website
         * --------------------------------------------------
         */

        const { data: website, error: websiteError } =
            await supabase
                .from("websites")
                .select(
                    `
                    id,
                    site_key,
                    webhook_secret,
                    status
                    `
                )
                .eq("site_key", siteKey)
                .single();

        if (websiteError || !website) {
            console.error(
                "Webhook website lookup error:",
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
         * 4. Make sure website is active
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
         * 5. Verify webhook secret
         * --------------------------------------------------
         */

        if (
            !website.webhook_secret ||
            webhookSecret !== website.webhook_secret
        ) {
            return NextResponse.json(
                {
                    error: "Invalid webhook secret",
                },
                {
                    status: 401,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 6. Read request body
         * --------------------------------------------------
         */

        let body: WebhookPayload;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: "Invalid JSON body",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 7. Validate event type
         * --------------------------------------------------
         */

        if (
            !body ||
            typeof body.type !== "string" ||
            !body.type.trim()
        ) {
            return NextResponse.json(
                {
                    error: "Event type is required",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        const eventType = body.type.trim();

        if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
            return NextResponse.json(
                {
                    error: "Unsupported event type",
                    allowed_types: ALLOWED_EVENT_TYPES,
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 8. Validate event data
         * --------------------------------------------------
         */

        if (
            body.data === undefined ||
            body.data === null ||
            typeof body.data !== "object" ||
            Array.isArray(body.data)
        ) {
            return NextResponse.json(
                {
                    error: "Event data must be an object",
                },
                {
                    status: 400,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 9. Insert event
         * --------------------------------------------------
         */

        const { data: event, error: eventError } =
            await supabase
                .from("events")
                .insert({
                    website_id: website.id,
                    type: eventType,
                    data: body.data,
                })
                .select("id, type, created_at")
                .single();

        if (eventError) {
            console.error(
                "Webhook event insert error:",
                eventError
            );

            return NextResponse.json(
                {
                    error: "Failed to store event",
                },
                {
                    status: 500,
                    headers: corsHeaders(),
                }
            );
        }

        /*
         * --------------------------------------------------
         * 10. Return success
         * --------------------------------------------------
         */

        return NextResponse.json(
            {
                success: true,
                event_id: event.id,
                type: event.type,
                created_at: event.created_at,
            },
            {
                status: 201,
                headers: corsHeaders(),
            }
        );
    } catch (error) {
        console.error(
            "Webhook API error:",
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