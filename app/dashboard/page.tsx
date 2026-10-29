import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/Main";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (user.user_metadata?.onboarding_completed === false) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .single();

        if (profile?.account_id) {
            const { data: websites } = await supabase
                .from("websites")
                .select("id")
                .eq("account_id", profile.account_id);

            const websiteIds = websites?.map((website) => website.id) ?? [];
            let hasWidgets = false;

            if (websiteIds.length > 0) {
                const { count } = await supabase
                    .from("widgets")
                    .select("id", { count: "exact", head: true })
                    .in("website_id", websiteIds);
                hasWidgets = (count ?? 0) > 0;
            }

            if (!hasWidgets) {
                redirect("/dashboard/getting-started");
            }
        }
    }

    return (
        <div>
            <Dashboard />
        </div>
    )
}
