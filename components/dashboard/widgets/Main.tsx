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
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Code2,
    Settings,
    ArrowUpRight,
    Zap,
} from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import React from "react";

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

const PAGE_SIZE = 6;

type Props = {
    searchParams: Promise<{
        page?: string;
        search?: string;
        website?: string;
        type?: string;
        status?: string;
    }>;
};

export default async function Widgets({ searchParams }: Props) {
    const params = await searchParams;

    const page = Math.max(
        1,
        Number.parseInt(params.page ?? "1", 10) || 1
    );

    const search = params.search?.trim() ?? "";
    const websiteFilter = params.website ?? "all";
    const typeFilter = params.type ?? "all";
    const statusFilter = params.status ?? "all";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        return null;
    }

    // ---------------------------------------------------------
    // Websites
    // ---------------------------------------------------------

    const { data: websites } = await supabase
        .from("websites")
        .select("id, name, url, status")
        .eq("account_id", profile.account_id)
        .order("created_at", { ascending: false });

    const allWebsites = websites ?? [];

    // ---------------------------------------------------------
    // Widgets
    // ---------------------------------------------------------

    let widgetQuery = supabase
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
            `,
            { count: "exact" }
        )
        .in(
            "website_id",
            allWebsites.map((website) => website.id)
        );

    if (search) {
        widgetQuery = widgetQuery.ilike("name", `%${search}%`);
    }

    if (websiteFilter !== "all") {
        widgetQuery = widgetQuery.eq("website_id", websiteFilter);
    }

    if (typeFilter !== "all") {
        widgetQuery = widgetQuery.eq("type", typeFilter);
    }

    if (statusFilter !== "all") {
        widgetQuery = widgetQuery.eq("status", statusFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const {
        data: widgets,
        count,
    } = await widgetQuery
        .order("website_id", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    const totalWidgets = count ?? 0;
    const totalPages = Math.max(
        1,
        Math.ceil(totalWidgets / PAGE_SIZE)
    );

    const currentPage = Math.min(page, totalPages);

    const websiteMap = new Map(
        allWebsites.map((website) => [
            website.id,
            website,
        ])
    );

    // ---------------------------------------------------------
    // Group widgets by website
    // ---------------------------------------------------------

    const groupedWidgets = new Map<
        string,
        typeof widgets
    >();

    for (const widget of widgets ?? []) {
        const existing =
            groupedWidgets.get(widget.website_id) ?? [];

        existing.push(widget);
        groupedWidgets.set(
            widget.website_id,
            existing
        );
    }

    // ---------------------------------------------------------
    // URL helper
    // ---------------------------------------------------------

    function createQuery(
        overrides: Record<string, string | undefined>
    ) {
        const query = new URLSearchParams();

        if (search) query.set("search", search);

        if (
            websiteFilter &&
            websiteFilter !== "all"
        ) {
            query.set("website", websiteFilter);
        }

        if (
            typeFilter &&
            typeFilter !== "all"
        ) {
            query.set("type", typeFilter);
        }

        if (
            statusFilter &&
            statusFilter !== "all"
        ) {
            query.set("status", statusFilter);
        }

        Object.entries(overrides).forEach(
            ([key, value]) => {
                if (
                    value !== undefined &&
                    value !== ""
                ) {
                    query.set(key, value);
                } else {
                    query.delete(key);
                }
            }
        );

        return query.toString();
    }

    const hasFilters =
        !!search ||
        websiteFilter !== "all" ||
        typeFilter !== "all" ||
        statusFilter !== "all";

    return (
        <PageShell>
            {/* =================================================
                HEADER
            ================================================= */}

            <PageHeader
                title="Widgets"
                description="Create and manage your social proof widgets."
                action={
                    <Link href="/dashboard/widgets/new">
                        <Button className="h-10 px-4">
                            <Plus className="size-4" />
                            Create widget
                        </Button>
                    </Link>
                }
            />

            {/* =================================================
                FILTERS
            ================================================= */}

            <Card className="mb-6 rounded-2xl border-border/70 bg-white/80 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <form
                    method="GET"
                    className="flex flex-col gap-2.5 lg:flex-row"
                >
                    {/* Search */}

                    <div className="relative min-w-0 flex-1">
                        <Search
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                size-4
                                -translate-y-1/2
                                text-muted-foreground
                            "
                        />

                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search widgets..."
                            className="
                                h-10
                                w-full
                                rounded-xl
                                border
                                border-border/70
                                bg-background
                                pl-9
                                pr-3
                                text-sm
                                outline-none
                                transition
                                placeholder:text-muted-foreground/70
                                focus:border-primary/30
                                focus:ring-4
                                focus:ring-primary/[0.06]
                            "
                        />
                    </div>

                    {/* Website */}

                    <div className="relative">
                        <Globe
                            className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                size-3.5
                                -translate-y-1/2
                                text-muted-foreground
                            "
                        />

                        <select
                            name="website"
                            defaultValue={websiteFilter}
                            className="
                                h-10
                                w-full
                                min-w-[180px]
                                appearance-none
                                rounded-xl
                                border
                                border-border/70
                                bg-background
                                pl-9
                                pr-8
                                text-sm
                                outline-none
                                transition
                                focus:border-primary/30
                                focus:ring-4
                                focus:ring-primary/[0.06]
                            "
                        >
                            <option value="all">
                                All websites
                            </option>

                            {allWebsites.map(
                                (website) => (
                                    <option
                                        key={website.id}
                                        value={website.id}
                                    >
                                        {website.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Type */}

                    <div className="relative">
                        <select
                            name="type"
                            defaultValue={typeFilter}
                            className="
                                h-10
                                w-full
                                min-w-[160px]
                                appearance-none
                                rounded-xl
                                border
                                border-border/70
                                bg-background
                                px-3
                                pr-8
                                text-sm
                                outline-none
                                transition
                                focus:border-primary/30
                                focus:ring-4
                                focus:ring-primary/[0.06]
                            "
                        >
                            <option value="all">
                                All types
                            </option>

                            {Object.entries(
                                widgetTypeInfo
                            ).map(
                                ([type, info]) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {info.label}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* Status */}

                    <div className="relative">
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="
                                h-10
                                w-full
                                min-w-[130px]
                                appearance-none
                                rounded-xl
                                border
                                border-border/70
                                bg-background
                                px-3
                                pr-8
                                text-sm
                                outline-none
                                transition
                                focus:border-primary/30
                                focus:ring-4
                                focus:ring-primary/[0.06]
                            "
                        >
                            <option value="all">
                                All status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="paused">
                                Paused
                            </option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className="h-10 rounded-xl px-4"
                    >
                        <Filter className="size-3.5" />
                        Filter
                    </Button>

                    {hasFilters && (
                        <Link
                            href="/dashboard/widgets"
                            className="
                                inline-flex
                                h-10
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-border/70
                                px-4
                                text-sm
                                font-medium
                                text-muted-foreground
                                transition
                                hover:bg-muted/50
                                hover:text-foreground
                            "
                        >
                            Clear
                        </Link>
                    )}
                </form>
            </Card>

            {/* =================================================
                NO WEBSITES
            ================================================= */}

            {allWebsites.length === 0 ? (
                <Card className="overflow-hidden rounded-2xl">
                    <EmptyState
                        icon={
                            <Globe className="size-5" />
                        }
                        title="Add a website first"
                        description="You need to connect a website before you can create a NudgeProof widget."
                        action={
                            <Link href="/dashboard/websites/new">
                                <Button>
                                    <Plus className="size-4" />
                                    Add website
                                </Button>
                            </Link>
                        }
                    />
                </Card>
            ) : widgets && widgets.length > 0 ? (
                <>
                    {/* =================================================
                        WEBSITE GROUPS
                    ================================================= */}

                    <div className="space-y-7">
                        {Array.from(
                            groupedWidgets.entries()
                        ).map(
                            ([
                                websiteId,
                                websiteWidgets,
                            ]) => {
                                const website =
                                    websiteMap.get(
                                        websiteId
                                    );

                                if (!website) {
                                    return null;
                                }

                                return (
                                    <section
                                        key={websiteId}
                                    >
                                        {/* Website heading */}

                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className="
                                                        flex
                                                        size-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-primary/10
                                                        bg-primary/[0.06]
                                                    "
                                                >
                                                    <Globe className="size-4 text-primary" />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="truncate text-sm font-semibold tracking-tight">
                                                            {
                                                                website.name
                                                            }
                                                        </h2>

                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                                                            {
                                                                websiteWidgets?.length
                                                            }{" "}
                                                            {websiteWidgets?.length ===
                                                            1
                                                                ? "widget"
                                                                : "widgets"}
                                                        </span>
                                                    </div>

                                                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                        {
                                                            website.url
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/dashboard/websites/${website.id}`}
                                                className="
                                                    hidden
                                                    items-center
                                                    gap-1
                                                    rounded-lg
                                                    px-2.5
                                                    py-1.5
                                                    text-[10px]
                                                    font-medium
                                                    text-muted-foreground
                                                    transition
                                                    hover:bg-muted
                                                    hover:text-foreground
                                                    sm:inline-flex
                                                "
                                            >
                                                View website
                                                <ArrowUpRight className="size-3" />
                                            </Link>
                                        </div>

                                        {/* Widgets */}

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            {websiteWidgets?.map(
                                                (
                                                    widget
                                                ) => {
                                                    const type =
                                                        widget.type as WidgetType;

                                                    const info =
                                                        widgetTypeInfo[
                                                            type
                                                        ];

                                                    const Icon =
                                                        info?.icon ??
                                                        BarChart3;

                                                    return (
                                                        <Link
                                                            key={
                                                                widget.id
                                                            }
                                                            href={`/dashboard/widgets/${widget.id}`}
                                                            className="group block"
                                                        >
                                                            <Card
                                                                className="
                                                                    overflow-hidden
                                                                    rounded-2xl
                                                                    border-border/70
                                                                    bg-white
                                                                    shadow-[0_1px_3px_rgba(0,0,0,0.03)]
                                                                    transition-all
                                                                    duration-200
                                                                    hover:-translate-y-0.5
                                                                    hover:border-primary/20
                                                                    hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]
                                                                "
                                                            >
                                                                {/* Header */}

                                                                <div className="flex items-start justify-between gap-3 px-4 pt-4">
                                                                    <div className="flex min-w-0 items-center gap-3">
                                                                        <div
                                                                            className="
                                                                                flex
                                                                                size-10
                                                                                shrink-0
                                                                                items-center
                                                                                justify-center
                                                                                rounded-xl
                                                                                border
                                                                                border-primary/10
                                                                                bg-primary/[0.06]
                                                                            "
                                                                        >
                                                                            <Icon className="size-[17px] text-primary" />
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <h3 className="truncate text-[13px] font-semibold tracking-tight">
                                                                                {
                                                                                    widget.name
                                                                                }
                                                                            </h3>

                                                                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                                                {info?.label ??
                                                                                    widget.type}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <span
                                                                        className={`
                                                                            shrink-0
                                                                            rounded-full
                                                                            px-2
                                                                            py-1
                                                                            text-[9px]
                                                                            font-medium
                                                                            ${
                                                                                widget.status ===
                                                                                "active"
                                                                                    ? "bg-green-500/10 text-green-600"
                                                                                    : widget.status ===
                                                                                        "paused"
                                                                                      ? "bg-yellow-500/10 text-yellow-600"
                                                                                      : "bg-muted text-muted-foreground"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            widget.status
                                                                        }
                                                                    </span>
                                                                </div>

                                                                {/* Widget ID */}

                                                                <div className="px-4 pt-4">
                                                                    <div
                                                                        className="
                                                                            rounded-lg
                                                                            border
                                                                            border-border/60
                                                                            bg-muted/[0.3]
                                                                            px-3
                                                                            py-2
                                                                        "
                                                                    >
                                                                        <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                                            Widget ID
                                                                        </p>

                                                                        <p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground">
                                                                            {
                                                                                widget.id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Preview block */}

                                                                <div className="px-4 pt-3">
                                                                    <div
                                                                        className="
                                                                            flex
                                                                            items-center
                                                                            gap-3
                                                                            rounded-xl
                                                                            border
                                                                            border-primary/10
                                                                            bg-primary/[0.035]
                                                                            px-3
                                                                            py-2.5
                                                                        "
                                                                    >
                                                                        <div
                                                                            className="
                                                                                flex
                                                                                size-7
                                                                                shrink-0
                                                                                items-center
                                                                                justify-center
                                                                                rounded-lg
                                                                                bg-primary/10
                                                                            "
                                                                        >
                                                                            <Zap className="size-3.5 text-primary" />
                                                                        </div>

                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate text-[10px] font-medium">
                                                                                {
                                                                                    info?.label
                                                                                }
                                                                            </p>

                                                                            <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
                                                                                {
                                                                                    info?.description
                                                                                }
                                                                            </p>
                                                                        </div>

                                                                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                                                    </div>
                                                                </div>

                                                                {/* Footer */}

                                                                <div className="mx-4 mt-4 border-t border-border/50" />

                                                                {/* <div className="flex items-center justify-between px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="
                                                                                inline-flex
                                                                                items-center
                                                                                gap-1.5
                                                                                rounded-lg
                                                                                border
                                                                                border-border/60
                                                                                px-2.5
                                                                                py-1.5
                                                                                text-[9px]
                                                                                font-medium
                                                                                text-muted-foreground
                                                                            "
                                                                        >
                                                                            <Code2 className="size-3" />
                                                                            Snippet
                                                                        </div>

                                                                        <div
                                                                            className="
                                                                                inline-flex
                                                                                items-center
                                                                                gap-1.5
                                                                                rounded-lg
                                                                                border
                                                                                border-border/60
                                                                                px-2.5
                                                                                py-1.5
                                                                                text-[9px]
                                                                                font-medium
                                                                                text-muted-foreground
                                                                            "
                                                                        >
                                                                            <BarChart3 className="size-3" />
                                                                            Analytics
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        className="
                                                                            flex
                                                                            size-7
                                                                            items-center
                                                                            justify-center
                                                                            rounded-lg
                                                                            text-muted-foreground
                                                                            transition
                                                                            group-hover:bg-primary/5
                                                                            group-hover:text-primary
                                                                        "
                                                                    >
                                                                        <Settings className="size-3.5" />
                                                                    </div>
                                                                </div> */}
                                                            </Card>
                                                        </Link>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </section>
                                );
                            }
                        )}
                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {totalPages > 1 && (
                        <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {from + 1}
                                </span>
                                {" – "}
                                <span className="font-medium text-foreground">
                                    {Math.min(
                                        from +
                                            (widgets?.length ??
                                                0),
                                        totalWidgets
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-foreground">
                                    {totalWidgets}
                                </span>{" "}
                                widgets
                            </p>

                            <div className="flex items-center gap-1.5">
                                <Link
                                    href={`/dashboard/widgets?${createQuery(
                                        {
                                            page:
                                                currentPage >
                                                1
                                                    ? String(
                                                          currentPage -
                                                              1
                                                      )
                                                    : "1",
                                        }
                                    )}`}
                                    className={`
                                        flex
                                        size-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-border/70
                                        transition
                                        ${
                                            currentPage <= 1
                                                ? "pointer-events-none opacity-40"
                                                : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <ChevronLeft className="size-4" />
                                </Link>

                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, index) =>
                                        index + 1
                                )
                                    .filter(
                                        (pageNumber) =>
                                            pageNumber ===
                                                1 ||
                                            pageNumber ===
                                                totalPages ||
                                            Math.abs(
                                                pageNumber -
                                                    currentPage
                                            ) <= 1
                                    )
                                    .map(
                                        (
                                            pageNumber,
                                            index,
                                            pages
                                        ) => {
                                            const previous =
                                                pages[
                                                    index -
                                                        1
                                                ];

                                            const showEllipsis =
                                                previous &&
                                                pageNumber -
                                                    previous >
                                                    1;

                                            return (
                                                <React.Fragment
                                                    key={
                                                        pageNumber
                                                    }
                                                >
                                                    {showEllipsis && (
                                                        <span className="flex size-9 items-center justify-center text-xs text-muted-foreground">
                                                            ...
                                                        </span>
                                                    )}

                                                    <Link
                                                        href={`/dashboard/widgets?${createQuery(
                                                            {
                                                                page: String(
                                                                    pageNumber
                                                                ),
                                                            }
                                                        )}`}
                                                        className={`
                                                            flex
                                                            size-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            text-xs
                                                            font-medium
                                                            transition
                                                            ${
                                                                currentPage ===
                                                                pageNumber
                                                                    ? "border-primary bg-primary text-primary-foreground"
                                                                    : "border-border/70 hover:bg-muted"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </Link>
                                                </React.Fragment>
                                            );
                                        }
                                    )}

                                <Link
                                    href={`/dashboard/widgets?${createQuery(
                                        {
                                            page:
                                                currentPage <
                                                totalPages
                                                    ? String(
                                                          currentPage +
                                                              1
                                                      )
                                                    : String(
                                                          totalPages
                                                      ),
                                        }
                                    )}`}
                                    className={`
                                        flex
                                        size-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-border/70
                                        transition
                                        ${
                                            currentPage >=
                                            totalPages
                                                ? "pointer-events-none opacity-40"
                                                : "hover:bg-muted"
                                        }
                                    `}
                                >
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* =================================================
                   NO RESULTS
                ================================================= */

                <Card className="overflow-hidden rounded-2xl">
                    <EmptyState
                        icon={
                            <Eye className="size-5" />
                        }
                        title={
                            hasFilters
                                ? "No widgets found"
                                : "No widgets yet"
                        }
                        description={
                            hasFilters
                                ? "Try changing your search or filters."
                                : "Create your first social proof widget to start showing customer activity."
                        }
                        action={
                            hasFilters ? (
                                <Link href="/dashboard/widgets">
                                    <Button variant="outline">
                                        Clear filters
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/dashboard/widgets/new">
                                    <Button>
                                        <Plus className="size-4" />
                                        Create widget
                                    </Button>
                                </Link>
                            )
                        }
                    />
                </Card>
            )}
        </PageShell>
    );
}