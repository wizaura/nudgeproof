import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GettingStarted from "@/components/dashboard/getting-started/Main";

export default async function GettingStartedPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (user.user_metadata?.onboarding_completed !== false) {
        redirect("/dashboard");
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
        .select("id, name, url")
        .eq("account_id", profile.account_id)
        .order("created_at", { ascending: false });

    return <GettingStarted initialWebsites={websites ?? []} />;
}
