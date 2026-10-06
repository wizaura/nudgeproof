import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redis } from "@/lib/redis/server";
import { corsOptions } from "@/lib/cors";

type Props = {
    params: Promise<{
        siteKey: string;
    }>;
};

const VISITOR_TTL_SECONDS = 60;
const MAX_VISITOR_ID_LENGTH = 100;

export async function POST(
    request: Request,
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
                }
            );
        }

        /*
         * --------------------------------------------------------
         * Validate request body
         * --------------------------------------------------------
         */

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: "Invalid JSON body",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid request body",
                },
                {
                    status: 400,
                }
            );
        }

        const visitorId =
            "visitor_id" in body &&
            typeof body.visitor_id === "string"
                ? body.visitor_id.trim()
                : "";

        if (!visitorId) {
            return NextResponse.json(
                {
                    error: "visitor_id is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            visitorId.length >
            MAX_VISITOR_ID_LENGTH
        ) {
            return NextResponse.json(
                {
                    error: "Invalid visitor_id",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Only allow a simple anonymous visitor ID.
         *
         * Example:
         *
         * v_abc123xyz
         */

        if (
            !/^v_[a-zA-Z0-9_-]+$/.test(
                visitorId
            )
        ) {
            return NextResponse.json(
                {
                    error: "Invalid visitor_id",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * --------------------------------------------------------
         * Supabase
         * --------------------------------------------------------
         *
         * This is a public embed endpoint, so there is no
         * Supabase user session. We use the admin client to
         * verify the website.
         */

        const supabase =
            createAdminClient();

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

        if (
            websiteError ||
            !website
        ) {
            return NextResponse.json(
                {
                    error: "Website not found",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * --------------------------------------------------------
         * 2. Verify website is active
         * --------------------------------------------------------
         */

        if (
            website.status !==
            "active"
        ) {
            return NextResponse.json(
                {
                    error: "Website is inactive",
                },
                {
                    status: 403,
                }
            );
        }

        /*
         * --------------------------------------------------------
         * 3. Verify account exists
         * --------------------------------------------------------
         *
         * We don't need to check the subscription or
         * impression usage here.
         *
         * Visitor tracking is independent from the
         * widget impression quota.
         */

        if (!website.account_id) {
            return NextResponse.json(
                {
                    error: "Website account not found",
                },
                {
                    status: 403,
                }
            );
        }

        /*
         * --------------------------------------------------------
         * Redis
         * --------------------------------------------------------
         *
         * One sorted set per website:
         *
         * np:visitors:{siteKey}
         *
         * member = anonymous visitor ID
         * score  = last heartbeat timestamp
         */

        const redisKey =
            `np:visitors:${siteKey}`;

        const now =
            Date.now();

        /*
         * --------------------------------------------------------
         * 4. Add/update visitor timestamp
         * --------------------------------------------------------
         */

        await redis.zadd(
            redisKey,
            {
                score: now,
                member: visitorId,
            }
        );

        /*
         * --------------------------------------------------------
         * 5. Remove stale visitors
         * --------------------------------------------------------
         */

        const cutoff =
            now -
            VISITOR_TTL_SECONDS *
                1000;

        await redis.zremrangebyscore(
            redisKey,
            0,
            cutoff
        );

        /*
         * --------------------------------------------------------
         * 6. Keep Redis key alive
         * --------------------------------------------------------
         *
         * The key itself expires slightly after the visitor
         * TTL. Individual visitors are removed using their
         * heartbeat timestamp above.
         */

        await redis.expire(
            redisKey,
            VISITOR_TTL_SECONDS + 30
        );

        /*
         * --------------------------------------------------------
         * 7. Get current active visitor count
         * --------------------------------------------------------
         */

        const count =
            await redis.zcard(
                redisKey
            );

        /*
         * --------------------------------------------------------
         * 8. Response
         * --------------------------------------------------------
         */

        return NextResponse.json(
            {
                success: true,
                visitor_id: visitorId,
                count,
            },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin":
                        "*",
                    "Access-Control-Allow-Methods":
                        "POST, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type",
                    "Cache-Control":
                        "no-store",
                },
            }
        );
    } catch (error) {
        console.error(
            "[NudgeProof] Visitor heartbeat error:",
            error
        );

        /*
         * Never expose internal Redis/Supabase
         * errors to the customer's website.
         */

        return NextResponse.json(
            {
                error:
                    "Unable to register visitor",
            },
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin":
                        "*",
                    "Cache-Control":
                        "no-store",
                },
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
    return corsOptions();
}