import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

/**
 * GET /api/widgets/[id]
 */
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const supabase = await createClient();

        // Authenticate
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get account
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("account_id")
                .eq("user_id", user.id)
                .single();

        if (profileError || !profile?.account_id) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        // Get widget through user's websites
        const { data: widget, error: widgetError } =
            await supabase
                .from("widgets")
                .select(
                    `
                    id,
                    website_id,
                    name,
                    type,
                    config,
                    status,
                    created_at,
                    updated_at,
                    websites!inner (
                        id,
                        account_id,
                        name,
                        url,
                        site_key
                    )
                    `
                )
                .eq("id", id)
                .eq(
                    "websites.account_id",
                    profile.account_id
                )
                .single();

        if (widgetError || !widget) {
            return NextResponse.json(
                { error: "Widget not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            widget,
        });
    } catch (error) {
        console.error("GET /api/widgets/[id] error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/widgets/[id]
 */
export async function PATCH(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const supabase = await createClient();

        // Authenticate
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get account
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("account_id")
                .eq("user_id", user.id)
                .single();

        if (profileError || !profile?.account_id) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        // Make sure widget belongs to user's account
        const { data: existingWidget, error: existingError } =
            await supabase
                .from("widgets")
                .select(
                    `
                    id,
                    website_id,
                    websites!inner (
                        account_id
                    )
                    `
                )
                .eq("id", id)
                .eq(
                    "websites.account_id",
                    profile.account_id
                )
                .single();

        if (existingError || !existingWidget) {
            return NextResponse.json(
                { error: "Widget not found" },
                { status: 404 }
            );
        }

        // Read body
        const body = await request.json();

        const updates: {
            name?: string;
            config?: Record<string, unknown>;
            status?: "draft" | "active" | "paused";
        } = {};

        // Name
        if (body.name !== undefined) {
            if (
                typeof body.name !== "string" ||
                !body.name.trim()
            ) {
                return NextResponse.json(
                    { error: "Widget name is required" },
                    { status: 400 }
                );
            }

            if (body.name.trim().length > 100) {
                return NextResponse.json(
                    {
                        error:
                            "Widget name must be 100 characters or less",
                    },
                    { status: 400 }
                );
            }

            updates.name = body.name.trim();
        }

        // Config
        if (body.config !== undefined) {
            if (
                typeof body.config !== "object" ||
                body.config === null ||
                Array.isArray(body.config)
            ) {
                return NextResponse.json(
                    { error: "Invalid widget configuration" },
                    { status: 400 }
                );
            }

            updates.config = body.config;
        }

        // Status
        if (body.status !== undefined) {
            if (
                !["draft", "active", "paused"].includes(
                    body.status
                )
            ) {
                return NextResponse.json(
                    { error: "Invalid widget status" },
                    { status: 400 }
                );
            }

            updates.status = body.status;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No changes provided" },
                { status: 400 }
            );
        }

        // Update
        const { data: widget, error: updateError } =
            await supabase
                .from("widgets")
                .update(updates)
                .eq("id", id)
                .select(
                    `
                    id,
                    website_id,
                    name,
                    type,
                    config,
                    status,
                    created_at,
                    updated_at
                    `
                )
                .single();

        if (updateError || !widget) {
            console.error(
                "Widget update error:",
                updateError
            );

            return NextResponse.json(
                { error: "Failed to update widget" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            widget,
        });
    } catch (error) {
        console.error("PATCH /api/widgets/[id] error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/widgets/[id]
 */
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const supabase = await createClient();

        // Authenticate
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get account
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("account_id")
                .eq("user_id", user.id)
                .single();

        if (profileError || !profile?.account_id) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        const { data: widget, error: widgetError } =
            await supabase
                .from("widgets")
                .select(
                    `
                    id,
                    websites!inner (
                        account_id
                    )
                    `
                )
                .eq("id", id)
                .eq(
                    "websites.account_id",
                    profile.account_id
                )
                .single();

        if (widgetError || !widget) {
            return NextResponse.json(
                { error: "Widget not found" },
                { status: 404 }
            );
        }

        // Delete
        const { error: deleteError } =
            await supabase
                .from("widgets")
                .delete()
                .eq("id", id);

        if (deleteError) {
            console.error(
                "Widget deletion error:",
                deleteError
            );

            return NextResponse.json(
                { error: "Failed to delete widget" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "DELETE /api/widgets/[id] error:",
            error
        );

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}