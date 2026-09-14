import { createClient } from "@/lib/supabase/server";
import IntegrationsPageClient from "./integrations-page-client";

export default async function DashboardIntegrations() {
    const supabase = await createClient();

    const {
        data: {
            user,
        },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">
                    Integrations
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    No account found.
                </p>
            </div>
        );
    }

    const { data: websites, error } =
        await supabase
            .from("websites")
            .select(
                `
                id,
                name,
                url,
                site_key,
                webhook_secret,
                status
                `
            )
            .eq(
                "account_id",
                profile.account_id
            )
            .order("name", {
                ascending: true,
            });

    if (error) {
        console.error(
            "Integrations websites error:",
            error
        );
    }

    return (
        <IntegrationsPageClient
            websites={websites ?? []}
            appUrl={appUrl}
        />
    );
}