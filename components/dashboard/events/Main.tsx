import { createClient } from "@/lib/supabase/server";
import EventsPageClient from "./events-page-client";

export default async function DashbaordEvents() {
    const supabase = await createClient();

    const {
        data: {
            user,
        },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    Events
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    No account found.
                </p>
            </div>
        );
    }

    const { data: websites, error: websitesError } =
        await supabase
            .from("websites")
            .select("id, name")
            .eq("account_id", profile.account_id)
            .order("name", {
                ascending: true,
            });

    if (websitesError) {
        console.error(
            "Events websites error:",
            websitesError
        );
    }

    const websiteIds =
        websites?.map((website) => website.id) ?? [];

    let events: any[] = [];

    if (websiteIds.length > 0) {
        const { data, error } = await supabase
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
                ascending: false,
            })
            .limit(100);

        if (error) {
            console.error(
                "Events query error:",
                error
            );
        } else {
            events = data ?? [];
        }
    }

    const websiteMap = new Map(
        (websites ?? []).map((website) => [
            website.id,
            website.name,
        ])
    );

    const eventsWithWebsite =
        events.map((event) => ({
            ...event,
            website_name:
                websiteMap.get(event.website_id) ??
                "Unknown website",
        }));

    return (
        <EventsPageClient
            initialEvents={eventsWithWebsite}
            websites={websites ?? []}
        />
    );
}