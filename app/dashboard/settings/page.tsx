import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Settings from "@/components/dashboard/settings/Main";

export default async function SettingsPage() {
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

    return (
        <Settings
            user={{
                id: user.id,
                email: user.email ?? "",
                name:
                    user.user_metadata?.full_name ||
                    user.email?.split("@")[0] ||
                    "",
            }}
        />
    );
}