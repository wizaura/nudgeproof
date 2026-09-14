import { createClient } from "@/lib/supabase/server";
import {
    BarChart3,
    Eye,
    Globe,
    Plus,
    ShoppingBag,
    Star,
    Users,
    Megaphone,
} from "lucide-react";
import Link from "next/link";

type WidgetType =
    | "recent_sales"
    | "live_visitors"
    | "review"
    | "announcement";

const widgetTypeInfo: Record<
    WidgetType,
    {
        label: string;
        description: string;
        icon: typeof ShoppingBag;
    }
> = {
    recent_sales: {
        label: "Recent Sales",
        description: "Show recent purchases and customer activity.",
        icon: ShoppingBag,
    },
    live_visitors: {
        label: "Live Visitors",
        description: "Show how many people are currently viewing your site.",
        icon: Users,
    },
    review: {
        label: "Reviews",
        description: "Display customer reviews and ratings.",
        icon: Star,
    },
    announcement: {
        label: "Announcements",
        description: "Display important messages and promotions.",
        icon: Megaphone,
    },
};

export default async function Widgets() {
    const supabase = await createClient();

    // Check authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get account
    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        return null;
    }

    // Get websites
    const { data: websites } = await supabase
        .from("websites")
        .select("id, name, url")
        .eq("account_id", profile.account_id)
        .order("created_at", { ascending: false });

    const websiteIds = websites?.map((website) => website.id) ?? [];

    // Get widgets
    const { data: widgets } =
        websiteIds.length > 0
            ? await supabase
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
                .in("website_id", websiteIds)
                .order("created_at", { ascending: false })
            : { data: [] };

    const websiteMap = new Map(
        (websites ?? []).map((website) => [
            website.id,
            website,
        ])
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Widgets
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create and manage your social proof widgets.
                    </p>
                </div>

                <Link
                    href="/dashboard/widgets/new"
                    className="inline-flex w-fit items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Create widget
                </Link>
            </div>

            {/* No websites */}
            {websites && websites.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Globe className="h-5 w-5" />
                    </div>

                    <h2 className="mt-4 font-semibold">
                        Add a website first
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        You need to connect a website before you can create
                        a NudgeProof widget.
                    </p>

                    <Link
                        href="/dashboard/websites/new"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Add website
                    </Link>
                </div>
            ) : widgets && widgets.length > 0 ? (
                /* Widget list */
                <div className="grid gap-4">
                    {widgets.map((widget) => {
                        const type =
                            widget.type as WidgetType;

                        const info =
                            widgetTypeInfo[type];

                        const Icon =
                            info?.icon ?? BarChart3;

                        const website =
                            websiteMap.get(widget.website_id);

                        return (
                            <Link
                                key={widget.id}
                                href={`/dashboard/widgets/${widget.id}`}
                                className="block rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Main information */}
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-medium">
                                            {widget.name}
                                        </h2>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {info?.label ??
                                                widget.type}
                                        </p>

                                        {website && (
                                            <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {website.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
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
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* Empty widgets */
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Eye className="h-5 w-5" />
                    </div>

                    <h2 className="mt-4 font-semibold">
                        No widgets yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Create your first social proof widget to start
                        showing real customer activity on your website.
                    </p>

                    <Link
                        href="/dashboard/widgets/new"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Create widget
                    </Link>
                </div>
            )}

            {/* Widget types */}
            {websites && websites.length > 0 && (
                <section>
                    <div className="mb-4">
                        <h2 className="font-semibold">
                            Available widget types
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose the type of social proof you want to
                            display.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {(
                            Object.entries(
                                widgetTypeInfo
                            ) as [
                                WidgetType,
                                (typeof widgetTypeInfo)[WidgetType]
                            ][]
                        ).map(([type, info]) => {
                            const Icon = info.icon;

                            return (
                                <Link
                                    key={type}
                                    href={`/dashboard/widgets/new?type=${type}`}
                                    className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-4 font-medium">
                                        {info.label}
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        {info.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}