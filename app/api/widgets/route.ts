import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_WIDGET_TYPES = [
    "recent_sales",
    "live_visitors",
    "review",
    "announcement",
] as const;

type WidgetType = (typeof ALLOWED_WIDGET_TYPES)[number];

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } = await supabase
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

        const { searchParams } = new URL(request.url);
        const websiteId = searchParams.get("website_id");

        const { data: websites, error: websitesError } = await supabase
            .from("websites")
            .select("id")
            .eq("account_id", profile.account_id);

        console.log(websites,'web')

        if (websitesError) {
            console.error(websitesError);

            return NextResponse.json(
                { error: "Failed to load websites" },
                { status: 500 }
            );
        }

        if (!websites || websites.length === 0) {
            return NextResponse.json({
                widgets: [],
            });
        }

        const websiteIds = websites.map((website) => website.id);

        let query = supabase
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
                updated_at
                `
            )
            .in("website_id", websiteIds);

        if (websiteId) {
            if (!websiteIds.includes(websiteId)) {
                return NextResponse.json(
                    { error: "Website not found" },
                    { status: 404 }
                );
            }

            query = query.eq("website_id", websiteId);
        }

        const { data: widgets, error: widgetsError } = await query.order(
            "created_at",
            {
                ascending: false,
            }
        );

        if (widgetsError) {
            console.error(widgetsError);

            return NextResponse.json(
                { error: "Failed to load widgets" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            widgets: widgets ?? [],
        });
    } catch (error) {
        console.error("GET /api/widgets error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Authenticate user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Get user's account
        const { data: profile, error: profileError } = await supabase
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

        // 3. Read request body
        const body = await request.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        const websiteId =
            typeof body.website_id === "string"
                ? body.website_id
                : "";

        const type =
            typeof body.type === "string"
                ? body.type
                : "";

        // 4. Validate name
        if (!name) {
            return NextResponse.json(
                { error: "Widget name is required" },
                { status: 400 }
            );
        }

        if (name.length > 100) {
            return NextResponse.json(
                { error: "Widget name must be 100 characters or less" },
                { status: 400 }
            );
        }

        // 5. Validate website
        if (!websiteId) {
            return NextResponse.json(
                { error: "Website is required" },
                { status: 400 }
            );
        }

        // 6. Validate widget type
        if (
            !ALLOWED_WIDGET_TYPES.includes(
                type as WidgetType
            )
        ) {
            return NextResponse.json(
                { error: "Invalid widget type" },
                { status: 400 }
            );
        }

        // 7. Make sure website belongs to user's account
        const { data: website, error: websiteError } = await supabase
            .from("websites")
            .select("id")
            .eq("id", websiteId)
            .eq("account_id", profile.account_id)
            .single();

        if (websiteError || !website) {
            return NextResponse.json(
                { error: "Website not found" },
                { status: 404 }
            );
        }

        // 8. Default configuration
        const config = getDefaultConfig(type as WidgetType);

        // 9. Create widget
        const { data: widget, error: widgetError } = await supabase
            .from("widgets")
            .insert({
                website_id: website.id,
                name,
                type,
                config,
                status: "draft",
            })
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

        if (widgetError) {
            console.error("Widget creation error:", widgetError);

            return NextResponse.json(
                { error: "Failed to create widget" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                widget,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/widgets error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

function getDefaultConfig(type: WidgetType) {
    switch (type) {
        case "recent_sales":
            return {
                title: "Recent purchase",
                message: "{name} purchased {product}",
                position: "bottom-left",
                duration: 5000,
                delay: 3000,
            };

        case "live_visitors":
            return {
                message: "{count} people are viewing this page",
                position: "bottom-left",
                duration: 5000,
                delay: 3000,
                minimum_visitors: 2,
            };

        case "review":
            return {
                reviewer: "",
                rating: 5,
                text: "",
                position: "bottom-left",
                duration: 7000,
                delay: 3000,
            };

        case "announcement":
            return {
                title: "Announcement",
                message: "",
                cta_text: "",
                cta_url: "",
                position: "bottom-left",
                duration: 7000,
                delay: 3000,
            };
    }
}