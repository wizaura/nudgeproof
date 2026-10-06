import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { data: plans, error } = await supabase
            .from("plans")
            .select(`
                id,
                name,
                slug,
                price_monthly,
                max_impressions,
                analytics_days,
                remove_branding,
                priority_support
            `)
            .order("price_monthly", { ascending: true });

        if (error) {
            console.error("Failed to fetch plans:", error);

            return NextResponse.json(
                { error: "Failed to fetch plans" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            plans,
        });
    } catch (error) {
        console.error("Billing plans API error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}