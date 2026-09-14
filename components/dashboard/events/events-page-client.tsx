"use client";

import { useMemo, useState } from "react";
import {
    Activity,
    ChevronDown,
    Clock,
    Globe,
    RefreshCw,
    ShoppingBag,
    Star,
    UserPlus,
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
    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(date));
}

export default function EventsPageClient({
    initialEvents,
    websites,
}: Props) {
    const [events, setEvents] =
        useState<Event[]>(initialEvents);

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [websiteFilter, setWebsiteFilter] =
        useState("all");

    const [selectedEvent, setSelectedEvent] =
        useState<Event | null>(null);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesType =
                typeFilter === "all" ||
                event.type === typeFilter;

            const matchesWebsite =
                websiteFilter === "all" ||
                event.website_id === websiteFilter;

            return (
                matchesType &&
                matchesWebsite
            );
        });
    }, [
        events,
        typeFilter,
        websiteFilter,
    ]);

    const eventTypes = useMemo(() => {
        return Array.from(
            new Set(
                events.map(
                    (event) => event.type
                )
            )
        );
    }, [events]);

    function refresh() {
        window.location.reload();
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Events
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        View activity received from your websites.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refresh}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                    <RefreshCw className="size-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="size-4" />
                        Total events
                    </div>

                    <p className="mt-2 text-2xl font-semibold">
                        {events.length}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShoppingBag className="size-4" />
                        Purchases
                    </div>

                    <p className="mt-2 text-2xl font-semibold">
                        {
                            events.filter(
                                (event) =>
                                    event.type ===
                                    "purchase"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="size-4" />
                        Websites
                    </div>

                    <p className="mt-2 text-2xl font-semibold">
                        {websites.length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                        className="h-9 appearance-none rounded-md border bg-background py-1 pl-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">
                            All event types
                        </option>

                        {eventTypes.map(
                            (type) => (
                                <option
                                    key={type}
                                    value={type}
                                >
                                    {formatEventType(
                                        type
                                    )}
                                </option>
                            )
                        )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="relative">
                    <select
                        value={websiteFilter}
                        onChange={(event) =>
                            setWebsiteFilter(
                                event.target.value
                            )
                        }
                        className="h-9 appearance-none rounded-md border bg-background py-1 pl-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
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

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </div>

            {/* Events */}
            {filteredEvents.length === 0 ? (
                <div className="rounded-xl border bg-card">
                    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Activity className="size-5 text-muted-foreground" />
                        </div>

                        <h2 className="mt-4 text-base font-semibold">
                            No events yet
                        </h2>

                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Events will appear here when
                            your website sends activity
                            to NudgeProof.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/30">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Event
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Website
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Data
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Received
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredEvents.map(
                                    (event) => {
                                        const Icon =
                                            getEventIcon(
                                                event.type
                                            );

                                        return (
                                            <tr
                                                key={
                                                    event.id
                                                }
                                                onClick={() =>
                                                    setSelectedEvent(
                                                        event
                                                    )
                                                }
                                                className="cursor-pointer transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                            <Icon className="size-4" />
                                                        </div>

                                                        <div>
                                                            <p className="font-medium">
                                                                {formatEventType(
                                                                    event.type
                                                                )}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {event.id.slice(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="size-4 text-muted-foreground" />

                                                        <span>
                                                            {
                                                                event.website_name
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="max-w-md px-4 py-4">
                                                    <p className="truncate text-muted-foreground">
                                                        {formatEventData(
                                                            event.data
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4" />

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
                </div>
            )}

            {/* Event details */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() =>
                        setSelectedEvent(null)
                    }
                >
                    <div
                        className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {formatEventType(
                                        selectedEvent.type
                                    )}
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
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
                                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Event ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs">
                                    {
                                        selectedEvent.id
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Received
                                </p>

                                <p className="mt-1 text-sm">
                                    {formatDate(
                                        selectedEvent.created_at
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Event data
                                </p>

                                <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-4 text-xs">
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
    );
}