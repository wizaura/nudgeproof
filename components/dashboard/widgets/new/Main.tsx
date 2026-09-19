"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Check,
    Globe,
    Loader2,
    Megaphone,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Users,
} from "lucide-react";
import Link from "next/link";

type WidgetType =
    | "recent_sales"
    | "live_visitors"
    | "review"
    | "announcement";

const widgetTypes: {
    type: WidgetType;
    name: string;
    description: string;
    icon: typeof ShoppingBag;
}[] = [
    {
        type: "recent_sales",
        name: "Recent Sales",
        description: "Show recent purchases and customer activity.",
        icon: ShoppingBag,
    },
    {
        type: "live_visitors",
        name: "Live Visitors",
        description: "Show how many people are currently viewing your site.",
        icon: Users,
    },
    {
        type: "review",
        name: "Reviews",
        description: "Display customer reviews and ratings.",
        icon: Star,
    },
    {
        type: "announcement",
        name: "Announcements",
        description: "Display important messages and promotions.",
        icon: Megaphone,
    },
];

export default function NewWidget() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialType =
        searchParams.get("type") as WidgetType | null;

    const [type, setType] = useState<WidgetType>(
        widgetTypes.some((item) => item.type === initialType)
            ? initialType!
            : "recent_sales"
    );

    const [name, setName] = useState("");
    const [websiteId, setWebsiteId] = useState("");

    const [websites, setWebsites] = useState<
        {
            id: string;
            name: string;
            url: string;
        }[]
    >([]);

    const [loadingWebsites, setLoadingWebsites] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadWebsites() {
            try {
                const response = await fetch("/api/websites");
                const data = await response.json();

                if (!response.ok) {
                    setError(
                        data.error || "Failed to load websites"
                    );
                    return;
                }

                setWebsites(data.websites ?? []);

                if (data.websites?.length > 0) {
                    setWebsiteId(data.websites[0].id);
                }
            } catch {
                setError("Failed to load websites");
            } finally {
                setLoadingWebsites(false);
            }
        }

        loadWebsites();
    }, []);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!name.trim()) {
            setError("Please enter a widget name.");
            return;
        }

        if (!websiteId) {
            setError("Please select a website.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/widgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    website_id: websiteId,
                    type,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || "Failed to create widget"
                );
                return;
            }

            router.push(
                `/dashboard/widgets/${data.widget.id}`
            );

            router.refresh();
        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Widgets
                            </span>
                        </div>

                        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[30px]">
                            Create widget
                        </h1>

                        <p className="mt-2.5 text-[13px] leading-5 tracking-[-0.01em] text-muted-foreground">
                            Create a social proof widget for your website.
                        </p>
                    </div>

                    <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3.5 py-2.5 sm:flex">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                            <Sparkles className="size-3.5 text-primary" />
                        </div>

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Setup
                            </p>
                            <p className="text-xs font-semibold">
                                Quick & simple
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Basic information */}
                    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="border-b border-border/60 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                    <Globe className="size-4 text-primary" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Basic information
                                    </h2>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Choose where this widget will appear.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 space-y-6 p-6">
                            {/* Website */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="website"
                                    className="text-xs font-semibold"
                                >
                                    Website
                                </label>

                                {loadingWebsites ? (
                                    <div className="h-11 animate-pulse rounded-xl bg-muted" />
                                ) : websites.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border p-5">
                                        <p className="text-sm font-medium">
                                            No websites found
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Add a website before creating a widget.
                                        </p>

                                        <Link
                                            href="/dashboard/websites/new"
                                            className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                                        >
                                            Add website
                                        </Link>
                                    </div>
                                ) : (
                                    <select
                                        id="website"
                                        value={websiteId}
                                        onChange={(event) =>
                                            setWebsiteId(
                                                event.target.value
                                            )
                                        }
                                        disabled={loading}
                                        className="h-11 w-full rounded-xl border border-border/70 bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                    >
                                        {websites.map((website) => (
                                            <option
                                                key={website.id}
                                                value={website.id}
                                            >
                                                {website.name} — {website.url}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Widget name */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-xs font-semibold"
                                >
                                    Widget name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Recent purchases"
                                    maxLength={100}
                                    disabled={loading}
                                    className="h-11 w-full rounded-xl border border-border/70 bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                                />

                                <p className="text-[11px] leading-5 text-muted-foreground">
                                    Used only to identify the widget in your dashboard.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Widget type */}
                    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="border-b border-border/60 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                    <Sparkles className="size-4 text-primary" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Widget type
                                    </h2>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Choose the type of social proof you want to display.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            {widgetTypes.map((widget) => {
                                const Icon = widget.icon;
                                const selected =
                                    type === widget.type;

                                return (
                                    <button
                                        key={widget.type}
                                        type="button"
                                        onClick={() =>
                                            setType(widget.type)
                                        }
                                        disabled={loading}
                                        className={`group relative rounded-xl border p-4 text-left transition-all ${
                                            selected
                                                ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30"
                                                : "border-border/70 hover:border-primary/30 hover:bg-muted/30"
                                        }`}
                                    >
                                        {selected && (
                                            <div className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                                                <Check className="size-3" />
                                            </div>
                                        )}

                                        <div
                                            className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                                                selected
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                            }`}
                                        >
                                            <Icon className="size-5" />
                                        </div>

                                        <h3 className="mt-3 text-sm font-semibold">
                                            {widget.name}
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {widget.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Info */}
                    <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.035] px-5 py-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheck className="size-4 text-primary" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold">
                                Ready to connect
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                After creating your widget, you can configure
                                its appearance and install it on your website.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-medium text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/dashboard/widgets"
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-border/70 bg-background px-5 text-sm font-medium transition hover:bg-muted"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                loadingWebsites ||
                                websites.length === 0
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}

                            {loading
                                ? "Creating..."
                                : "Create widget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}