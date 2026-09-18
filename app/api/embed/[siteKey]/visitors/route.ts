import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redis } from "@/lib/redis/server";

type Props = {
    params: Promise<{
        siteKey: string;
    }>;
};

const VISITOR_TTL_SECONDS = 60;

export async function GET(
    request: Request,
    { params }: Props
) {
    try {
        const { siteKey } = await params;

        if (!siteKey) {
            return NextResponse.json(
                {
                    error:
                        "Missing site key",
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
         * Do not expose visitor information for
         * inactive websites.
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
         */

        const redisKey =
            `np:visitors:${siteKey}`;

        const now =
            Date.now();

        const cutoff =
            now -
            VISITOR_TTL_SECONDS *
                1000;

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
            await redis.zcard(
                redisKey
            );

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
         * Response
         * --------------------------------------------------------
         */

        return NextResponse.json(
            {
                count,
            },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin":
                        "*",
                    "Cache-Control":
                        "no-store, no-cache, must-revalidate",
                },
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
    return new NextResponse(
        null,
        {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin":
                    "*",
                "Access-Control-Allow-Methods":
                    "GET, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type",
                "Access-Control-Max-Age":
                    "86400",
            },
        }
    );
}