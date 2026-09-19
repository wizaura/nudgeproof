import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-page-client";

export default async function Analytics() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        redirect("/dashboard");
    }

    const { data: websites } = await supabase
        .from("websites")
        .select("id, name")
        .eq("account_id", profile.account_id)
        .order("created_at", {
            ascending: false,
        });

    const websiteIds =
        websites?.map((website) => website.id) ?? [];

    let events: {
        id: string;
        website_id: string;
        type: string;
        data: Record<string, unknown> | null;
        created_at: string;
    }[] = [];

    if (websiteIds.length > 0) {
        const { data } = await supabase
            .from("events")
            .select(
                `
                id,
                website_id,
                type,
                data,
                created_at
                `
            )
            .in("website_id", websiteIds)
            .order("created_at", {
                ascending: true,
            });

        events = data ?? [];
    }

    const { count: widgetCount } = await supabase
        .from("widgets")
        .select("id", {
            count: "exact",
            head: true,
        })
        .in(
            "website_id",
            websiteIds.length > 0
                ? websiteIds
                : ["00000000-0000-0000-0000-000000000000"]
        );

    const { count: activeWidgetCount } =
        await supabase
            .from("widgets")
            .select("id", {
                count: "exact",
                head: true,
            })
            .in(
                "website_id",
                websiteIds.length > 0
                    ? websiteIds
                    : ["00000000-0000-0000-0000-000000000000"]
            )
            .eq("status", "active");

    const websiteMap = new Map(
        (websites ?? []).map((website) => [
            website.id,
            website.name,
        ])
    );

    const analyticsEvents = events.map((event) => ({
        ...event,
        website_name:
            websiteMap.get(event.website_id) ??
            "Unknown website",
    }));

    return (
        <AnalyticsClient
            initialEvents={analyticsEvents}
            websites={websites ?? []}
            widgetCount={widgetCount ?? 0}
            activeWidgetCount={activeWidgetCount ?? 0}
        />
    );
}