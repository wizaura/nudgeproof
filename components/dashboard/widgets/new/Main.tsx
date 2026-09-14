"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Check,
    Megaphone,
    ShoppingBag,
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
            description:
                "Show recent purchases and customer activity.",
            icon: ShoppingBag,
        },
        {
            type: "live_visitors",
            name: "Live Visitors",
            description:
                "Show how many people are currently viewing your site.",
            icon: Users,
        },
        {
            type: "review",
            name: "Reviews",
            description:
                "Display customer reviews and ratings.",
            icon: Star,
        },
        {
            type: "announcement",
            name: "Announcements",
            description:
                "Display important messages and promotions.",
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

    /*
     * Load websites when the page opens.
     */
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
        <div className="mx-auto max-w-3xl space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/widgets"
                    className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to widgets
                </Link>

                <h1 className="text-2xl font-semibold tracking-tight">
                    Create widget
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Create a social proof widget for your website.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Basic information */}
                <section className="rounded-xl border bg-card">
                    <div className="border-b px-6 py-5">
                        <h2 className="font-semibold">
                            Basic information
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose where this widget will appear.
                        </p>
                    </div>

                    <div className="space-y-6 p-6">
                        {/* Website */}
                        <div className="space-y-2">
                            <label
                                htmlFor="website"
                                className="text-sm font-medium"
                            >
                                Website
                            </label>

                            {loadingWebsites ? (
                                <div className="h-11 animate-pulse rounded-lg bg-muted" />
                            ) : websites.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-4">
                                    <p className="text-sm font-medium">
                                        No websites found
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add a website before creating
                                        a widget.
                                    </p>

                                    <Link
                                        href="/dashboard/websites/new"
                                        className="mt-3 inline-flex text-sm font-medium underline"
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
                                    className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                                >
                                    {websites.map((website) => (
                                        <option
                                            key={website.id}
                                            value={website.id}
                                        >
                                            {website.name} —{" "}
                                            {website.url}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Widget name */}
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium"
                            >
                                Widget name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Recent purchases"
                                maxLength={100}
                                disabled={loading}
                                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground disabled:opacity-50"
                            />

                            <p className="text-xs text-muted-foreground">
                                This is only used to identify the
                                widget in your dashboard.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Widget type */}
                <section className="rounded-xl border bg-card">
                    <div className="border-b px-6 py-5">
                        <h2 className="font-semibold">
                            Widget type
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose the type of social proof you want
                            to display.
                        </p>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2">
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
                                    className={`relative rounded-xl border p-5 text-left transition-all ${selected
                                        ? "border-foreground ring-1 ring-foreground"
                                        : "hover:bg-muted/30"
                                        }`}
                                >
                                    {selected && (
                                        <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-4 font-medium">
                                        {widget.name}
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                                        {widget.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/dashboard/widgets"
                        className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
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
                        className="inline-flex h-10 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create widget"}
                    </button>
                </div>
            </form>
        </div>
    );
}