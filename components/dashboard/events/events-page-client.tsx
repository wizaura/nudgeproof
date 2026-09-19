"use client";

import { useMemo, useState } from "react";
import {
    Activity,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Globe,
    RefreshCw,
    ShoppingBag,
    Star,
    UserPlus,
    X,
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
};

const PAGE_SIZE = 24;

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
        .slice(0, 3)
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

function formatDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

export default function EventsPageClient({
    initialEvents,
    websites,
}: Props) {
    const [events] = useState<Event[]>(initialEvents);

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [websiteFilter, setWebsiteFilter] =
        useState("all");

    const [selectedEvent, setSelectedEvent] =
        useState<Event | null>(null);

    const [currentPage, setCurrentPage] =
        useState(1);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesType =
                typeFilter === "all" ||
                event.type === typeFilter;

            const matchesWebsite =
                websiteFilter === "all" ||
                event.website_id === websiteFilter;

            return matchesType && matchesWebsite;
        });
    }, [events, typeFilter, websiteFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredEvents.length / PAGE_SIZE)
    );

    const paginatedEvents = useMemo(() => {
        const start =
            (currentPage - 1) * PAGE_SIZE;

        return filteredEvents.slice(
            start,
            start + PAGE_SIZE
        );
    }, [filteredEvents, currentPage]);

    const eventTypes = useMemo(() => {
        return Array.from(
            new Set(events.map((event) => event.type))
        );
    }, [events]);

    const purchaseCount = useMemo(
        () =>
            events.filter(
                (event) => event.type === "purchase"
            ).length,
        [events]
    );

    function refresh() {
        window.location.reload();
    }

    function handleTypeFilterChange(value: string) {
        setTypeFilter(value);
        setCurrentPage(1);
    }

    function handleWebsiteFilterChange(value: string) {
        setWebsiteFilter(value);
        setCurrentPage(1);
    }

    return (
        <div className="min-h-screen">
            <div className="space-y-7 p-6">
                {/* Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Activity
                            </span>
                        </div>

                        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[30px]">
                            Events
                        </h1>

                        <p className="mt-2.5 text-[13px] leading-5 tracking-[-0.01em] text-muted-foreground">
                            View activity received from your websites.
                        </p>
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

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <Activity className="size-3.5" />
                            Total events
                        </div>

                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                            {events.length}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Received activity
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <ShoppingBag className="size-3.5" />
                            Purchases
                        </div>

                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                            {purchaseCount}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Purchase events
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <Globe className="size-3.5" />
                            Websites
                        </div>

                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                            {websites.length}
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Connected websites
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur-sm sm:flex-row">
                    <div className="relative w-full sm:w-52">
                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                handleTypeFilterChange(
                                    event.target.value
                                )
                            }
                            className="h-10 w-full appearance-none rounded-xl border border-border/70 bg-background px-3.5 pr-9 text-xs font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="all">
                                All event types
                            </option>

                            {eventTypes.map((type) => (
                                <option
                                    key={type}
                                    value={type}
                                >
                                    {formatEventType(type)}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="relative w-full sm:w-52">
                        <select
                            value={websiteFilter}
                            onChange={(event) =>
                                handleWebsiteFilterChange(
                                    event.target.value
                                )
                            }
                            className="h-10 w-full appearance-none rounded-xl border border-border/70 bg-background px-3.5 pr-9 text-xs font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="all">
                                All websites
                            </option>

                            {websites.map((website) => (
                                <option
                                    key={website.id}
                                    value={website.id}
                                >
                                    {website.name}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    <div className="ml-auto flex items-center px-1 text-[11px] text-muted-foreground">
                        {filteredEvents.length}{" "}
                        {filteredEvents.length === 1
                            ? "event"
                            : "events"}
                    </div>
                </div>

                {/* Events */}
                {filteredEvents.length === 0 ? (
                    <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                                <Activity className="size-5 text-primary" />
                            </div>

                            <h2 className="mt-4 text-sm font-semibold">
                                No events found
                            </h2>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                Events will appear here when your website
                                sends activity to NudgeProof.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border/60 bg-muted/20">
                                    <tr>
                                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                            Event
                                        </th>

                                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                            Website
                                        </th>

                                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                            Data
                                        </th>

                                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                            Received
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-border/50">
                                    {paginatedEvents.map(
                                        (event) => {
                                            const Icon =
                                                getEventIcon(
                                                    event.type
                                                );

                                            return (
                                                <tr
                                                    key={event.id}
                                                    onClick={() =>
                                                        setSelectedEvent(
                                                            event
                                                        )
                                                    }
                                                    className="cursor-pointer transition-colors hover:bg-primary/[0.025]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                                <Icon className="size-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold">
                                                                    {formatEventType(
                                                                        event.type
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                                                    {event.id.slice(
                                                                        0,
                                                                        8
                                                                    )}
                                                                    ...
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="size-3.5 shrink-0 text-muted-foreground" />

                                                            <span className="text-xs font-medium">
                                                                {
                                                                    event.website_name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="max-w-md px-5 py-4">
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {formatEventData(
                                                                event.data
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[11px] text-muted-foreground">
                                    Showing{" "}
                                    <span className="font-medium text-foreground">
                                        {(currentPage - 1) *
                                            PAGE_SIZE +
                                            1}
                                    </span>
                                    –
                                    <span className="font-medium text-foreground">
                                        {Math.min(
                                            currentPage *
                                                PAGE_SIZE,
                                            filteredEvents.length
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-foreground">
                                        {filteredEvents.length}
                                    </span>
                                </p>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === 1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page - 1
                                                    )
                                            )
                                        }
                                        className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>

                                    {Array.from(
                                        {
                                            length: totalPages,
                                        },
                                        (_, index) =>
                                            index + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage(
                                                    page
                                                )
                                            }
                                            className={`flex size-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                                                currentPage ===
                                                page
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "border border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page + 1
                                                    )
                                            )
                                        }
                                        className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Event details */}
                {selectedEvent && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
                        onClick={() =>
                            setSelectedEvent(null)
                        }
                    >
                        <div
                            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {(() => {
                                                const Icon =
                                                    getEventIcon(
                                                        selectedEvent.type
                                                    );

                                                return (
                                                    <Icon className="size-4" />
                                                );
                                            })()}
                                        </div>

                                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Event details
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-semibold tracking-tight">
                                        {formatEventType(
                                            selectedEvent.type
                                        )}
                                    </h2>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {
                                            selectedEvent.website_name
                                        }
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedEvent(
                                            null
                                        )
                                    }
                                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="space-y-5 p-6">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Event ID
                                    </p>

                                    <p className="mt-1.5 break-all rounded-lg bg-muted/50 p-2.5 font-mono text-[11px]">
                                        {selectedEvent.id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Received
                                    </p>

                                    <p className="mt-1.5 text-xs">
                                        {formatDate(
                                            selectedEvent.created_at
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        Event data
                                    </p>

                                    <pre className="max-h-80 overflow-auto rounded-xl border border-border/60 bg-muted/40 p-4 text-[11px] leading-5">
                                        {JSON.stringify(
                                            selectedEvent.data,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}