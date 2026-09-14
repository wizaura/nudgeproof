import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Globe,
    Pause,
    Play,
} from "lucide-react";
import WidgetEditor from "./widget-editor";
import WidgetPreview from "./widget-preview";
import WidgetWorkspace from "./widget-workspace";

type Props = {
    id: string;
};

export default async function WidgetDetails({
    id,
}: Props) {

    const supabase = await createClient();

    // Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Account
    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        notFound();
    }

    // Widget + website
    const { data: widget, error } = await supabase
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
                name,
                url,
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

    if (error || !widget) {
        notFound();
    }

    const website = Array.isArray(widget.websites)
        ? widget.websites[0]
        : widget.websites;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/widgets"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to widgets
                </Link>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {widget.name}
                            </h1>

                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${widget.status === "active"
                                    ? "bg-green-500/10 text-green-600"
                                    : widget.status ===
                                        "paused"
                                        ? "bg-yellow-500/10 text-yellow-600"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {widget.status}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />

                            <span>
                                {website?.name}
                            </span>

                            <span>·</span>

                            <span>
                                {getWidgetTypeLabel(
                                    widget.type
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <WidgetWorkspace
                widget={{
                    id: widget.id,
                    name: widget.name,
                    type: widget.type,
                    config: widget.config ?? {},
                    status: widget.status,
                }}
            />
        </div>
    );
}

function getWidgetTypeLabel(type: string) {
    switch (type) {
        case "recent_sales":
            return "Recent Sales";

        case "live_visitors":
            return "Live Visitors";

        case "review":
            return "Reviews";

        case "announcement":
            return "Announcements";

        default:
            return type;
    }
}