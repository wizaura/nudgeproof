import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redis } from "@/lib/redis/server";
import { corsJson, corsOptions } from "@/lib/cors";

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
                    error:
                        "visitor_id is required",
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
                    error:
                        "Invalid visitor_id",
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
                    error:
                        "Invalid visitor_id",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * --------------------------------------------------------
         * Verify website
         * --------------------------------------------------------
         *
         * We use the admin client because this is a public
         * embed endpoint and there is no Supabase user session.
         */

        const supabase =
            createAdminClient();

        const {
            data: website,
            error: websiteError,
        } = await supabase
            .from("websites")
            .select(
                "id, site_key, status"
            )
            .eq(
                "site_key",
                siteKey
            )
            .single();

        if (
            websiteError ||
            !website
        ) {
            return NextResponse.json(
                {
                    error:
                        "Website not found",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * Inactive websites should not register visitors.
         */

        if (
            website.status !==
            "active"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Website is inactive",
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
         * Add/update visitor timestamp.
         */

        await redis.zadd(
            redisKey,
            {
                score: now,
                member: visitorId,
            }
        );

        /*
         * Remove visitors whose last heartbeat
         * is older than the TTL.
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
         * Keep the Redis key from living forever
         * if traffic disappears completely.
         *
         * This does NOT remove individual visitors;
         * the score cleanup above handles those.
         */

        await redis.expire(
            redisKey,
            VISITOR_TTL_SECONDS + 30
        );

        /*
         * Get current active visitor count.
         */

        const count =
            await redis.zcard(
                redisKey
            );

        /*
         * --------------------------------------------------------
         * CORS
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