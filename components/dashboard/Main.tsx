import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Activity,
    ArrowRight,
    Globe,
    Megaphone,
    Plus,
    ShoppingBag,
    Star,
    UserPlus,
    Zap,
} from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "there";

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        redirect("/dashboard");
    }

    /* -------------------------------------------------
       Websites
    ------------------------------------------------- */

    const { data: websites } = await supabase
        .from("websites")
        .select("id, name, url, status")
        .eq("account_id", profile.account_id)
        .order("created_at", {
            ascending: false,
        });

    const websiteIds =
        websites?.map((website) => website.id) ?? [];

    /* -------------------------------------------------
       Widgets
    ------------------------------------------------- */

    let widgets: {
        id: string;
        website_id: string;
        name: string;
        type: string;
        status: string;
    }[] = [];

    if (websiteIds.length > 0) {
        const { data } = await supabase
            .from("widgets")
            .select(
                "id, website_id, name, type, status"
            )
            .in("website_id", websiteIds)
            .order("created_at", {
                ascending: false,
            });

        widgets = data ?? [];
    }

    /* -------------------------------------------------
       Events
    ------------------------------------------------- */

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
                ascending: false,
            })
            .limit(100);

        events = data ?? [];
    }

    /* -------------------------------------------------
       Current month
    ------------------------------------------------- */

    const now = new Date();

    const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const monthEvents = events.filter(
        (event) =>
            new Date(event.created_at) >=
            monthStart
    );

    const totalEvents = events.length;

    const activeWidgets = widgets.filter(
        (widget) => widget.status === "active"
    ).length;

    const monthlyPurchases =
        monthEvents.filter(
            (event) =>
                event.type === "purchase"
        ).length;

    const monthlySignups =
        monthEvents.filter(
            (event) =>
                event.type === "signup"
        ).length;

    const monthlyReviews =
        monthEvents.filter(
            (event) =>
                event.type === "review"
        ).length;

    const monthlyCustom =
        monthEvents.filter(
            (event) =>
                event.type === "custom"
        ).length;

    /* -------------------------------------------------
       Website activity
    ------------------------------------------------- */

    const websiteMap = new Map(
        (websites ?? []).map((website) => [
            website.id,
            website,
        ])
    );

    const websiteActivity = websiteIds
        .map((websiteId) => {
            const website =
                websiteMap.get(websiteId);

            const count = events.filter(
                (event) =>
                    event.website_id ===
                    websiteId
            ).length;

            const widgetCount = widgets.filter(
                (widget) =>
                    widget.website_id ===
                    websiteId
            ).length;

            const activeWidgetCount =
                widgets.filter(
                    (widget) =>
                        widget.website_id ===
                            websiteId &&
                        widget.status ===
                            "active"
                ).length;

            return {
                id: websiteId,
                name:
                    website?.name ??
                    "Unknown website",
                url: website?.url ?? "",
                status:
                    website?.status ?? "",
                count,
                widgetCount,
                activeWidgetCount,
            };
        })
        .sort(
            (a, b) =>
                b.count - a.count
        );

    /* -------------------------------------------------
       Recent events
    ------------------------------------------------- */

    const recentEvents = events
        .slice(0, 6)
        .map((event) => ({
            ...event,
            websiteName:
                websiteMap.get(
                    event.website_id
                )?.name ??
                "Unknown website",
        }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/[0.04]">
            <div className="space-y-7">
                {/* Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Overview
                            </span>
                        </div>

                        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] sm:text-[30px]">
                            Good to see you, {name}
                        </h1>

                        <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">
                            Here's what's happening with your
                            NudgeProof setup.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/websites/new"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                        <Plus className="size-3.5" />
                        Add website
                    </Link>
                </div>

                {/* Main stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Websites"
                        value={websites?.length ?? 0}
                        description="Connected websites"
                        icon={Globe}
                    />

                    <StatCard
                        title="Active widgets"
                        value={activeWidgets}
                        description={`${widgets.length} total widgets`}
                        icon={Zap}
                    />

                    <StatCard
                        title="Events this month"
                        value={monthEvents.length}
                        description={`${totalEvents} events received`}
                        icon={Activity}
                    />

                    <StatCard
                        title="Purchases"
                        value={monthlyPurchases}
                        description="This month"
                        icon={ShoppingBag}
                    />
                </div>

                {/* Secondary stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <SmallStat
                        title="Signups"
                        value={monthlySignups}
                        icon={UserPlus}
                    />

                    <SmallStat
                        title="Reviews"
                        value={monthlyReviews}
                        icon={Star}
                    />

                    <SmallStat
                        title="Custom events"
                        value={monthlyCustom}
                        icon={Megaphone}
                    />
                </div>

                {/* Main content */}
                <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                    {/* Recent activity */}
                    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Recent activity
                                </h2>

                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Latest events received from your websites.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/events"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            >
                                View all
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        {recentEvents.length === 0 ? (
                            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                                    <Activity className="size-5 text-primary" />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold">
                                    No activity yet
                                </h3>

                                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                    Once your website starts sending
                                    events, you'll see them here.
                                </p>

                                <Link
                                    href="/dashboard/integrations"
                                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                >
                                    Configure integration
                                    <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {recentEvents.map(
                                    (event) => {
                                        const Icon =
                                            getEventIcon(
                                                event.type
                                            );

                                        return (
                                            <div
                                                key={
                                                    event.id
                                                }
                                                className="flex items-center gap-3 px-6 py-4 transition hover:bg-primary/[0.02]"
                                            >
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Icon className="size-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-semibold">
                                                            {formatEventType(
                                                                event.type
                                                            )}
                                                        </p>

                                                        <span className="text-[10px] text-muted-foreground">
                                                            •
                                                        </span>

                                                        <p className="truncate text-[11px] text-muted-foreground">
                                                            {
                                                                event.websiteName
                                                            }
                                                        </p>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                                        {formatEventData(
                                                            event.data
                                                        )}
                                                    </p>
                                                </div>

                                                <span className="shrink-0 text-[10px] text-muted-foreground">
                                                    {formatRelativeTime(
                                                        event.created_at
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>

                    {/* Website activity */}
                    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Your websites
                                </h2>

                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Activity across your websites.
                                </p>
                            </div>

                            <Link
                                href="/dashboard/websites"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            >
                                Manage
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        {websiteActivity.length === 0 ? (
                            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                                    <Globe className="size-5 text-primary" />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold">
                                    No websites yet
                                </h3>

                                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                    Connect your first website to start
                                    using NudgeProof.
                                </p>

                                <Link
                                    href="/dashboard/websites/new"
                                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                                >
                                    <Plus className="size-3.5" />
                                    Add website
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {websiteActivity
                                    .slice(0, 5)
                                    .map(
                                        (
                                            website
                                        ) => (
                                            <Link
                                                key={
                                                    website.id
                                                }
                                                href={`/dashboard/websites/${website.id}`}
                                                className="block px-6 py-4 transition hover:bg-primary/[0.02]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                                                        <Globe className="size-4 text-muted-foreground" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-xs font-semibold">
                                                                {
                                                                    website.name
                                                                }
                                                            </p>

                                                            <span
                                                                className={`size-1.5 rounded-full ${
                                                                    website.status ===
                                                                    "active"
                                                                        ? "bg-green-500"
                                                                        : "bg-yellow-500"
                                                                }`}
                                                            />
                                                        </div>

                                                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                            {
                                                                website.url
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold">
                                                            {
                                                                website.count
                                                            }
                                                        </p>

                                                        <p className="text-[9px] text-muted-foreground">
                                                            events
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center gap-4 pl-12 text-[10px] text-muted-foreground">
                                                    <span>
                                                        {
                                                            website.activeWidgetCount
                                                        }{" "}
                                                        active widgets
                                                    </span>

                                                    <span>
                                                        {
                                                            website.widgetCount
                                                        }{" "}
                                                        total widgets
                                                    </span>
                                                </div>
                                            </Link>
                                        )
                                    )}
                            </div>
                        )}
                    </section>
                </div>

                {/* Quick actions */}
                <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-sm">
                    <div className="mb-5">
                        <h2 className="text-sm font-semibold">
                            Quick actions
                        </h2>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Manage your NudgeProof setup.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <QuickAction
                            href="/dashboard/websites/new"
                            icon={Globe}
                            title="Add website"
                            description="Connect a new website"
                        />

                        <QuickAction
                            href="/dashboard/widgets/new"
                            icon={Zap}
                            title="Create widget"
                            description="Add social proof"
                        />

                        <QuickAction
                            href="/dashboard/integrations"
                            icon={Activity}
                            title="Integrations"
                            description="Connect your backend"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: number;
    description: string;
    icon: typeof Activity;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {title}
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight">
                {value.toLocaleString()}
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function SmallStat({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: typeof Activity;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {title}
                </p>

                <p className="mt-1 text-lg font-semibold">
                    {value.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: typeof Activity;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background p-4 transition hover:border-primary/30 hover:bg-primary/[0.025]"
        >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">
                    {title}
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {description}
                </p>
            </div>

            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
    );
}

function formatEventType(type: string) {
    switch (type) {
        case "purchase":
            return "Purchase";
        case "signup":
            return "Signup";
        case "review":
            return "Review";
        case "custom":
            return "Custom";
        default:
            return type
                .replace(/_/g, " ")
                .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                );
    }
}

function getEventIcon(type: string) {
    switch (type) {
        case "purchase":
            return ShoppingBag;
        case "signup":
            return UserPlus;
        case "review":
            return Star;
        default:
            return Activity;
    }
}

function formatEventData(
    data: Record<string, unknown> | null
) {
    if (!data) {
        return "Activity received";
    }

    if (
        typeof data.name === "string" &&
        typeof data.product === "string"
    ) {
        return `${data.name} purchased ${data.product}`;
    }

    if (
        typeof data.name === "string" &&
        typeof data.message === "string"
    ) {
        return `${data.name}: ${data.message}`;
    }

    const values = Object.entries(data)
        .slice(0, 2)
        .map(([key, value]) => {
            if (
                typeof value === "string" ||
                typeof value === "number"
            ) {
                return `${key}: ${value}`;
            }

            return `${key}: ${JSON.stringify(value)}`;
        });

    return values.join(" · ") || "Activity received";
}

function formatRelativeTime(
    date: string
) {
    const diff =
        Date.now() -
        new Date(date).getTime();

    const seconds = Math.floor(
        diff / 1000
    );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(
        seconds / 60
    );

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 7) {
        return `${days}d ago`;
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            month: "short",
            day: "numeric",
        }
    ).format(new Date(date));
}