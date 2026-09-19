"use client";

import { useMemo, useState } from "react";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    Clock,
    Globe,
    RefreshCw,
    ShoppingBag,
    Star,
    UserPlus,
    Zap,
} from "lucide-react";

type Event = {
    id: string;
    website_id: string;
    website_name: string;
    type: string;
    data: Record<string, unknown> | null;
    created_at: string;
};

type Website = {
    id: string;
    name: string;
};

type Props = {
    initialEvents: Event[];
    websites: Website[];
    widgetCount: number;
    activeWidgetCount: number;
};

type Range = "7" | "30" | "90" | "all";

const PAGE_SIZE = 8;

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
        return "—";
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

    return values.join(" · ");
}

function formatShortDate(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
    }).format(date);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

function getStartDate(range: Range) {
    if (range === "all") {
        return null;
    }

    const date = new Date();

    date.setHours(0, 0, 0, 0);

    date.setDate(
        date.getDate() -
            (Number(range) - 1)
    );

    return date;
}

function getDateKey(date: Date) {
    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
}

export default function AnalyticsClient({
    initialEvents,
    websites,
    widgetCount,
    activeWidgetCount,
}: Props) {
    const [range, setRange] =
        useState<Range>("30");

    const [websiteFilter, setWebsiteFilter] =
        useState("all");

    const [currentPage, setCurrentPage] =
        useState(1);

    const filteredEvents = useMemo(() => {
        const startDate = getStartDate(range);

        return initialEvents.filter((event) => {
            const eventDate =
                new Date(event.created_at);

            const matchesDate =
                !startDate ||
                eventDate >= startDate;

            const matchesWebsite =
                websiteFilter === "all" ||
                event.website_id === websiteFilter;

            return (
                matchesDate &&
                matchesWebsite
            );
        });
    }, [
        initialEvents,
        range,
        websiteFilter,
    ]);

    const previousEvents = useMemo(() => {
        if (range === "all") {
            return [];
        }

        const days = Number(range);

        const currentStart =
            getStartDate(range);

        if (!currentStart) {
            return [];
        }

        const previousStart =
            new Date(currentStart);

        previousStart.setDate(
            previousStart.getDate() - days
        );

        return initialEvents.filter((event) => {
            const eventDate =
                new Date(event.created_at);

            const matchesDate =
                eventDate >= previousStart &&
                eventDate < currentStart;

            const matchesWebsite =
                websiteFilter === "all" ||
                event.website_id === websiteFilter;

            return (
                matchesDate &&
                matchesWebsite
            );
        });
    }, [
        initialEvents,
        range,
        websiteFilter,
    ]);

    const totalEvents =
        filteredEvents.length;

    const purchases =
        filteredEvents.filter(
            (event) =>
                event.type === "purchase"
        ).length;

    const signups =
        filteredEvents.filter(
            (event) =>
                event.type === "signup"
        ).length;

    const reviews =
        filteredEvents.filter(
            (event) =>
                event.type === "review"
        ).length;

    const customEvents =
        filteredEvents.filter(
            (event) =>
                event.type === "custom"
        ).length;

    const previousTotal =
        previousEvents.length;

    const eventChange =
        previousTotal > 0
            ? Math.round(
                  ((totalEvents -
                      previousTotal) /
                      previousTotal) *
                      100
              )
            : null;

    const chartData = useMemo(() => {
        if (range === "all") {
            const grouped =
                new Map<string, number>();

            filteredEvents.forEach((event) => {
                const date = new Date(
                    event.created_at
                );

                const key = getDateKey(date);

                grouped.set(
                    key,
                    (grouped.get(key) ?? 0) + 1
                );
            });

            return Array.from(
                grouped.entries()
            ).map(([date, value]) => ({
                date,
                value,
                label: formatShortDate(
                    new Date(date)
                ),
            }));
        }

        const days = Number(range);
        const result: {
            date: string;
            value: number;
            label: string;
        }[] = [];

        const start =
            getStartDate(range) ??
            new Date();

        for (
            let i = 0;
            i < days;
            i++
        ) {
            const date = new Date(start);

            date.setDate(
                start.getDate() + i
            );

            const key =
                getDateKey(date);

            const value =
                filteredEvents.filter(
                    (event) =>
                        getDateKey(
                            new Date(
                                event.created_at
                            )
                        ) === key
                ).length;

            result.push({
                date: key,
                value,
                label: formatShortDate(
                    date
                ),
            });
        }

        return result;
    }, [filteredEvents, range]);

    const maxChartValue = Math.max(
        ...chartData.map(
            (item) => item.value
        ),
        1
    );

    const eventBreakdown = [
        {
            label: "Purchases",
            type: "purchase",
            value: purchases,
            icon: ShoppingBag,
        },
        {
            label: "Signups",
            type: "signup",
            value: signups,
            icon: UserPlus,
        },
        {
            label: "Reviews",
            type: "review",
            value: reviews,
            icon: Star,
        },
        {
            label: "Custom",
            type: "custom",
            value: customEvents,
            icon: Activity,
        },
    ];

    const websiteBreakdown = useMemo(() => {
        const map = new Map<
            string,
            {
                name: string;
                count: number;
            }
        >();

        filteredEvents.forEach((event) => {
            const existing =
                map.get(event.website_id);

            map.set(event.website_id, {
                name:
                    event.website_name,
                count:
                    (existing?.count ?? 0) + 1,
            });
        });

        return Array.from(
            map.entries()
        )
            .map(([id, value]) => ({
                id,
                ...value,
            }))
            .sort(
                (a, b) =>
                    b.count - a.count
            );
    }, [filteredEvents]);

    const recentEvents =
        filteredEvents
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.created_at
                    ).getTime() -
                    new Date(
                        a.created_at
                    ).getTime()
            );

    const totalPages = Math.max(
        1,
        Math.ceil(
            recentEvents.length /
                PAGE_SIZE
        )
    );

    const paginatedEvents =
        recentEvents.slice(
            (currentPage - 1) *
                PAGE_SIZE,
            currentPage *
                PAGE_SIZE
        );

    function handleRangeChange(
        value: Range
    ) {
        setRange(value);
        setCurrentPage(1);
    }

    function handleWebsiteChange(
        value: string
    ) {
        setWebsiteFilter(value);
        setCurrentPage(1);
    }

    function refresh() {
        window.location.reload();
    }

    return (
        <div className="min-h-screen">
            <div className="space-y-7 p-6">
                {/* Header */}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Overview
                            </span>
                        </div>

                        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] sm:text-[30px]">
                            Analytics
                        </h1>

                        <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground">
                            Understand how your websites are sending
                            activity into NudgeProof.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                            <select
                                value={range}
                                onChange={(event) =>
                                    handleRangeChange(
                                        event.target
                                            .value as Range
                                    )
                                }
                                className="h-10 appearance-none rounded-xl border border-border/70 bg-background pl-9 pr-9 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="7">
                                    Last 7 days
                                </option>

                                <option value="30">
                                    Last 30 days
                                </option>

                                <option value="90">
                                    Last 90 days
                                </option>

                                <option value="all">
                                    All time
                                </option>
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>

                        <button
                            type="button"
                            onClick={refresh}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-4 text-xs font-semibold transition hover:bg-muted"
                        >
                            <RefreshCw className="size-3.5" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Website filter */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Globe className="size-3.5 text-primary" />

                        <span className="text-xs font-semibold">
                            Website
                        </span>
                    </div>

                    <div className="relative sm:w-64">
                        <select
                            value={websiteFilter}
                            onChange={(event) =>
                                handleWebsiteChange(
                                    event.target.value
                                )
                            }
                            className="h-10 w-full appearance-none rounded-xl border border-border/70 bg-background px-3.5 pr-9 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="all">
                                All websites
                            </option>

                            {websites.map(
                                (website) => (
                                    <option
                                        key={
                                            website.id
                                        }
                                        value={
                                            website.id
                                        }
                                    >
                                        {website.name}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <span className="text-[11px] text-muted-foreground sm:ml-auto">
                        {totalEvents} events in selected period
                    </span>
                </div>

                {/* KPI cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Total events"
                        value={totalEvents}
                        icon={Activity}
                        change={eventChange}
                    />

                    <MetricCard
                        label="Purchases"
                        value={purchases}
                        icon={ShoppingBag}
                    />

                    <MetricCard
                        label="Signups"
                        value={signups}
                        icon={UserPlus}
                    />

                    <MetricCard
                        label="Reviews"
                        value={reviews}
                        icon={Star}
                    />
                </div>

                {/* Secondary metrics */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <SmallMetric
                        label="Custom events"
                        value={customEvents}
                        icon={Zap}
                    />

                    <SmallMetric
                        label="Connected websites"
                        value={websites.length}
                        icon={Globe}
                    />

                    <SmallMetric
                        label="Active widgets"
                        value={activeWidgetCount}
                        icon={Activity}
                        suffix={`/ ${widgetCount}`}
                    />
                </div>

                {/* Activity chart */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-2 border-b border-border/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Event activity
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Events received over the selected period.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                            <span className="size-2 rounded-full bg-primary" />
                            Events
                        </div>
                    </div>

                    <div className="p-6">
                        {chartData.length === 0 ? (
                            <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
                                No event data available.
                            </div>
                        ) : (
                            <div className="h-64">
                                <div className="flex h-52 items-end gap-1 sm:gap-2">
                                    {chartData.map(
                                        (item) => {
                                            const height =
                                                Math.max(
                                                    (item.value /
                                                        maxChartValue) *
                                                        100,
                                                    item.value >
                                                        0
                                                        ? 4
                                                        : 0
                                                );

                                            return (
                                                <div
                                                    key={
                                                        item.date
                                                    }
                                                    className="group relative flex h-full flex-1 items-end"
                                                >
                                                    <div
                                                        className="w-full rounded-t-md bg-primary/70 transition-all group-hover:bg-primary"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                    />

                                                    {item.value >
                                                        0 && (
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 transition group-hover:opacity-100">
                                                            {
                                                                item.value
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                <div className="mt-3 flex justify-between overflow-hidden text-[9px] text-muted-foreground">
                                    {chartData
                                        .filter(
                                            (_, index) =>
                                                index ===
                                                    0 ||
                                                index ===
                                                    Math.floor(
                                                        chartData.length /
                                                            2
                                                    ) ||
                                                index ===
                                                    chartData.length -
                                                        1
                                        )
                                        .map(
                                            (
                                                item
                                            ) => (
                                                <span
                                                    key={
                                                        item.date
                                                    }
                                                >
                                                    {
                                                        item.label
                                                    }
                                                </span>
                                            )
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Breakdown */}
                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Event types */}
                    <section className="rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="border-b border-border/60 px-6 py-5">
                            <h2 className="text-sm font-semibold">
                                Event breakdown
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Activity by event type.
                            </p>
                        </div>

                        <div className="space-y-3 p-6">
                            {eventBreakdown.map(
                                (item) => {
                                    const Icon =
                                        item.icon;

                                    const percentage =
                                        totalEvents >
                                        0
                                            ? Math.round(
                                                  (item.value /
                                                      totalEvents) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                item.type
                                            }
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Icon className="size-3.5" />
                                                    </div>

                                                    <span className="text-xs font-medium">
                                                        {
                                                            item.label
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold">
                                                        {
                                                            item.value
                                                        }
                                                    </span>

                                                    <span className="w-8 text-right text-[10px] text-muted-foreground">
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>

                    {/* Websites */}
                    <section className="rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="border-b border-border/60 px-6 py-5">
                            <h2 className="text-sm font-semibold">
                                Activity by website
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Which websites are sending the most events.
                            </p>
                        </div>

                        <div className="p-6">
                            {websiteBreakdown.length ===
                            0 ? (
                                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
                                    No website activity yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {websiteBreakdown
                                        .slice(
                                            0,
                                            6
                                        )
                                        .map(
                                            (
                                                website
                                            ) => {
                                                const percentage =
                                                    totalEvents >
                                                    0
                                                        ? Math.round(
                                                              (website.count /
                                                                  totalEvents) *
                                                                  100
                                                          )
                                                        : 0;

                                                return (
                                                    <div
                                                        key={
                                                            website.id
                                                        }
                                                        className="space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex min-w-0 items-center gap-2.5">
                                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                                    <Globe className="size-3.5 text-muted-foreground" />
                                                                </div>

                                                                <span className="truncate text-xs font-medium">
                                                                    {
                                                                        website.name
                                                                    }
                                                                </span>
                                                            </div>

                                                            <span className="ml-3 shrink-0 text-xs font-semibold">
                                                                {
                                                                    website.count
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-primary/70"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Recent activity */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-2 border-b border-border/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Recent activity
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Latest events received from your websites.
                            </p>
                        </div>

                        <span className="text-[10px] text-muted-foreground">
                            {recentEvents.length} total
                        </span>
                    </div>

                    {paginatedEvents.length ===
                    0 ? (
                        <div className="flex min-h-[240px] items-center justify-center text-xs text-muted-foreground">
                            No activity in this period.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border/50 bg-muted/20">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Event
                                            </th>

                                            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Website
                                            </th>

                                            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Data
                                            </th>

                                            <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Received
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-border/50">
                                        {paginatedEvents.map(
                                            (
                                                event
                                            ) => {
                                                const Icon =
                                                    getEventIcon(
                                                        event.type
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            event.id
                                                        }
                                                        className="transition hover:bg-primary/[0.025]"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                    <Icon className="size-3.5" />
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs font-semibold">
                                                                        {formatEventType(
                                                                            event.type
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                                                                        {event.id.slice(
                                                                            0,
                                                                            8
                                                                        )}
                                                                        ...
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Globe className="size-3.5 text-muted-foreground" />

                                                                <span className="text-xs">
                                                                    {
                                                                        event.website_name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="max-w-sm px-6 py-4">
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {formatEventData(
                                                                    event.data
                                                                )}
                                                            </p>
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                <Clock className="size-3.5" />

                                                                {formatDate(
                                                                    event.created_at
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages >
                                1 && (
                                <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
                                    <p className="text-[11px] text-muted-foreground">
                                        Showing{" "}
                                        <span className="font-medium text-foreground">
                                            {(currentPage -
                                                1) *
                                                PAGE_SIZE +
                                                1}
                                        </span>
                                        –
                                        <span className="font-medium text-foreground">
                                            {Math.min(
                                                currentPage *
                                                    PAGE_SIZE,
                                                recentEvents.length
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium text-foreground">
                                            {
                                                recentEvents.length
                                            }
                                        </span>
                                    </p>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            disabled={
                                                currentPage ===
                                                1
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    (
                                                        page
                                                    ) =>
                                                        Math.max(
                                                            1,
                                                            page -
                                                                1
                                                        )
                                                )
                                            }
                                            className="rounded-lg border border-border/70 px-3 py-1.5 text-[11px] font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-2 text-[11px] text-muted-foreground">
                                            {
                                                currentPage
                                            }{" "}
                                            /{" "}
                                            {
                                                totalPages
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                currentPage ===
                                                totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    (
                                                        page
                                                    ) =>
                                                        Math.min(
                                                            totalPages,
                                                            page +
                                                                1
                                                        )
                                                )
                                            }
                                            className="rounded-lg border border-border/70 px-3 py-1.5 text-[11px] font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    change,
}: {
    label: string;
    value: number;
    icon: typeof Activity;
    change?: number | null;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                </div>

                {change !== undefined &&
                    change !== null && (
                        <span
                            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                change >= 0
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-red-500/10 text-red-600"
                            }`}
                        >
                            {change >= 0 ? (
                                <ArrowUpRight className="size-3" />
                            ) : (
                                <ArrowDownRight className="size-3" />
                            )}

                            {Math.abs(change)}%
                        </span>
                    )}
            </div>

            <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight">
                {value.toLocaleString()}
            </p>
        </div>
    );
}

function SmallMetric({
    label,
    value,
    icon: Icon,
    suffix,
}: {
    label: string;
    value: number;
    icon: typeof Activity;
    suffix?: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>

                <p className="mt-1 text-lg font-semibold">
                    {value.toLocaleString()}
                    {suffix && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                            {suffix}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}