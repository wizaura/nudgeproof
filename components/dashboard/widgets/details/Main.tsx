import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Globe,
    Sparkles,
} from "lucide-react";
import WidgetWorkspace from "./widget-workspace";

type Props = {
    id: string;
};

export default async function WidgetDetails({ id }: Props) {
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
        notFound();
    }

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
        .eq("websites.account_id", profile.account_id)
        .single();

    if (error || !widget) {
        notFound();
    }

    const website = Array.isArray(widget.websites)
        ? widget.websites[0]
        : widget.websites;

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl space-y-7">
                {/* Back */}
                <Link
                    href="/dashboard/widgets"
                    className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to widgets
                </Link>

                {/* Header */}
                <div className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-sm sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-primary" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Widget
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[30px]">
                                    {widget.name}
                                </h1>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                        widget.status === "active"
                                            ? "bg-green-500/10 text-green-600"
                                            : widget.status === "paused"
                                                ? "bg-yellow-500/10 text-yellow-600"
                                                : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {widget.status}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted-foreground">
                                <Globe className="size-3.5" />

                                <span className="font-medium text-foreground/80">
                                    {website?.name}
                                </span>

                                <span className="text-border">•</span>

                                <span>
                                    {getWidgetTypeLabel(widget.type)}
                                </span>

                                {website?.url && (
                                    <>
                                        <span className="text-border">•</span>

                                        <span className="truncate">
                                            {website.url}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Type indicator */}
                        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                                <Sparkles className="size-3.5 text-primary" />
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    Widget type
                                </p>
                                <p className="text-xs font-semibold text-foreground">
                                    {getWidgetTypeLabel(widget.type)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workspace */}
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