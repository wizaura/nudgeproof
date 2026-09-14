"use client";

import { useState } from "react";
import {
    Loader2,
    Save,
    Trash2,
    Play,
    Pause,
} from "lucide-react";
import { useRouter } from "next/navigation";

type WidgetStatus =
    | "draft"
    | "active"
    | "paused";

type WidgetType =
    | "recent_sales"
    | "live_visitors"
    | "review"
    | "announcement";

type WidgetConfig = Record<string, any>;

type WidgetEditorProps = {
    widget: {
        id: string;
        name: string;
        type: WidgetType;
        config: WidgetConfig;
        status: WidgetStatus;
    };

    onNameChange: (name: string) => void;

    onConfigChange: (
        config: WidgetConfig
    ) => void;
};

export default function WidgetEditor({
    widget,
    onNameChange,
    onConfigChange,
}: WidgetEditorProps) {
    const router = useRouter();

    const [status, setStatus] =
        useState<WidgetStatus>(widget.status);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    function updateConfig(
        key: string,
        value: any
    ) {
        onConfigChange({
            ...widget.config,
            [key]: value,
        });
    }

    async function saveWidget() {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `/api/widgets/${widget.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: widget.name,
                        config: widget.config,
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ??
                        "Failed to save widget"
                );

                return;
            }

            setSuccess(
                "Widget saved successfully."
            );

            router.refresh();

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    async function changeStatus(
        newStatus: WidgetStatus
    ) {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `/api/widgets/${widget.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ??
                        "Failed to update status"
                );

                return;
            }

            setStatus(newStatus);

            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteWidget() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this widget? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            const response = await fetch(
                `/api/widgets/${widget.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ??
                        "Failed to delete widget"
                );

                return;
            }

            router.push("/dashboard/widgets");
            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="grid gap-6">
            {/* Main editor */}
            <div className="space-y-6">
                {/* General */}
                <section className="rounded-xl border bg-card">
                    <div className="border-b px-6 py-5">
                        <h2 className="font-semibold">
                            General
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Basic widget settings.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="widget-name"
                                className="text-sm font-medium"
                            >
                                Widget name
                            </label>

                            <input
                                id="widget-name"
                                type="text"
                                value={widget.name}
                                onChange={(event) =>
                                    onNameChange(
                                        event.target.value
                                    )
                                }
                                maxLength={100}
                                disabled={saving}
                                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground disabled:opacity-50"
                            />

                            <p className="text-xs text-muted-foreground">
                                This name is only used
                                inside your dashboard.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Recent Sales */}
                {widget.type ===
                    "recent_sales" && (
                    <RecentSalesEditor
                        config={widget.config}
                        updateConfig={updateConfig}
                    />
                )}

                {/* Live Visitors */}
                {widget.type ===
                    "live_visitors" && (
                    <LiveVisitorsEditor
                        config={widget.config}
                        updateConfig={updateConfig}
                    />
                )}

                {/* Review */}
                {widget.type ===
                    "review" && (
                    <ReviewEditor
                        config={widget.config}
                        updateConfig={updateConfig}
                    />
                )}

                {/* Announcement */}
                {widget.type ===
                    "announcement" && (
                    <AnnouncementEditor
                        config={widget.config}
                        updateConfig={updateConfig}
                    />
                )}

                {/* Appearance */}
                <AppearanceEditor
                    config={widget.config}
                    updateConfig={updateConfig}
                />

                {/* Error */}
                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 text-sm text-green-600">
                        {success}
                    </div>
                )}

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={saveWidget}
                        disabled={saving}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}

                        {saving
                            ? "Saving..."
                            : "Save changes"}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col sm:flex-row w-full gap-4 space-y-6">
                {/* Status */}
                <section className="w-full rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">
                        Widget status
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Control whether this widget is
                        displayed on your website.
                    </p>

                    <div className="mt-5">
                        {status === "active" ? (
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus(
                                        "paused"
                                    )
                                }
                                disabled={saving}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                            >
                                <Pause className="h-4 w-4" />
                                Pause widget
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus(
                                        "active"
                                    )
                                }
                                disabled={saving}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                            >
                                <Play className="h-4 w-4" />
                                Activate widget
                            </button>
                        )}
                    </div>
                </section>

                {/* Delete */}
                <section className="w-full rounded-xl border border-destructive/20 bg-card p-5">
                    <h2 className="font-semibold">
                        Danger zone
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Permanently delete this widget.
                    </p>

                    <button
                        type="button"
                        onClick={deleteWidget}
                        disabled={deleting}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}

                        {deleting
                            ? "Deleting..."
                            : "Delete widget"}
                    </button>
                </section>
            </aside>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Recent Sales                                                               */
/* -------------------------------------------------------------------------- */

function RecentSalesEditor({
    config,
    updateConfig,
}: {
    config: WidgetConfig;
    updateConfig: (
        key: string,
        value: any
    ) => void;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="border-b px-6 py-5">
                <h2 className="font-semibold">
                    Recent Sales
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Configure recent purchase
                    notifications.
                </p>
            </div>

            <div className="space-y-6 p-6">
                <TextInput
                    label="Title"
                    value={config.title ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "title",
                            value
                        )
                    }
                    placeholder="Recent purchase"
                />

                <TextInput
                    label="Message"
                    value={
                        config.message ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "message",
                            value
                        )
                    }
                    placeholder="{name} purchased {product}"
                    description="Available placeholders: {name}, {product}"
                />

                <NumberInput
                    label="Display duration"
                    value={
                        config.duration ?? 5000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "duration",
                            value
                        )
                    }
                    suffix="ms"
                />

                <NumberInput
                    label="Initial delay"
                    value={
                        config.delay ?? 3000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "delay",
                            value
                        )
                    }
                    suffix="ms"
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Live Visitors                                                              */
/* -------------------------------------------------------------------------- */

function LiveVisitorsEditor({
    config,
    updateConfig,
}: {
    config: WidgetConfig;
    updateConfig: (
        key: string,
        value: any
    ) => void;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="border-b px-6 py-5">
                <h2 className="font-semibold">
                    Live Visitors
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Configure your live visitor
                    notification.
                </p>
            </div>

            <div className="space-y-6 p-6">
                <TextInput
                    label="Message"
                    value={
                        config.message ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "message",
                            value
                        )
                    }
                    placeholder="{count} people are viewing this page"
                    description="Use {count} to display the visitor count."
                />

                <NumberInput
                    label="Minimum visitors"
                    value={
                        config.minimum_visitors ??
                        2
                    }
                    onChange={(value) =>
                        updateConfig(
                            "minimum_visitors",
                            value
                        )
                    }
                    min={1}
                />

                <NumberInput
                    label="Display duration"
                    value={
                        config.duration ?? 5000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "duration",
                            value
                        )
                    }
                    suffix="ms"
                />

                <NumberInput
                    label="Initial delay"
                    value={
                        config.delay ?? 3000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "delay",
                            value
                        )
                    }
                    suffix="ms"
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

function ReviewEditor({
    config,
    updateConfig,
}: {
    config: WidgetConfig;
    updateConfig: (
        key: string,
        value: any
    ) => void;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="border-b px-6 py-5">
                <h2 className="font-semibold">
                    Review
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Configure the customer review.
                </p>
            </div>

            <div className="space-y-6 p-6">
                <TextInput
                    label="Reviewer"
                    value={
                        config.reviewer ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "reviewer",
                            value
                        )
                    }
                    placeholder="Sarah"
                />

                <NumberInput
                    label="Rating"
                    value={
                        config.rating ?? 5
                    }
                    onChange={(value) =>
                        updateConfig(
                            "rating",
                            Math.min(
                                5,
                                Math.max(
                                    1,
                                    value
                                )
                            )
                        )
                    }
                    min={1}
                    max={5}
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Review text
                    </label>

                    <textarea
                        value={
                            config.text ?? ""
                        }
                        onChange={(event) =>
                            updateConfig(
                                "text",
                                event.target.value
                            )
                        }
                        rows={4}
                        placeholder="Amazing product and fast delivery!"
                        className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                    />
                </div>

                <NumberInput
                    label="Display duration"
                    value={
                        config.duration ?? 7000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "duration",
                            value
                        )
                    }
                    suffix="ms"
                />

                <NumberInput
                    label="Initial delay"
                    value={
                        config.delay ?? 3000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "delay",
                            value
                        )
                    }
                    suffix="ms"
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Announcements                                                              */
/* -------------------------------------------------------------------------- */

function AnnouncementEditor({
    config,
    updateConfig,
}: {
    config: WidgetConfig;
    updateConfig: (
        key: string,
        value: any
    ) => void;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="border-b px-6 py-5">
                <h2 className="font-semibold">
                    Announcement
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Configure your announcement or
                    promotion.
                </p>
            </div>

            <div className="space-y-6 p-6">
                <TextInput
                    label="Title"
                    value={
                        config.title ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "title",
                            value
                        )
                    }
                    placeholder="Special offer"
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Message
                    </label>

                    <textarea
                        value={
                            config.message ?? ""
                        }
                        onChange={(event) =>
                            updateConfig(
                                "message",
                                event.target.value
                            )
                        }
                        rows={4}
                        placeholder="Get 20% off your first order."
                        className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                    />
                </div>

                <TextInput
                    label="Button text"
                    value={
                        config.cta_text ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "cta_text",
                            value
                        )
                    }
                    placeholder="Shop now"
                />

                <TextInput
                    label="Button URL"
                    value={
                        config.cta_url ?? ""
                    }
                    onChange={(value) =>
                        updateConfig(
                            "cta_url",
                            value
                        )
                    }
                    placeholder="https://example.com/offer"
                />

                <NumberInput
                    label="Display duration"
                    value={
                        config.duration ?? 7000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "duration",
                            value
                        )
                    }
                    suffix="ms"
                />

                <NumberInput
                    label="Initial delay"
                    value={
                        config.delay ?? 3000
                    }
                    onChange={(value) =>
                        updateConfig(
                            "delay",
                            value
                        )
                    }
                    suffix="ms"
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Appearance                                                                 */
/* -------------------------------------------------------------------------- */

function AppearanceEditor({
    config,
    updateConfig,
}: {
    config: WidgetConfig;
    updateConfig: (
        key: string,
        value: any
    ) => void;
}) {
    return (
        <section className="rounded-xl border bg-card">
            <div className="border-b px-6 py-5">
                <h2 className="font-semibold">
                    Appearance
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Choose where the widget appears.
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-2">
                    <label
                        htmlFor="position"
                        className="text-sm font-medium"
                    >
                        Position
                    </label>

                    <select
                        id="position"
                        value={
                            config.position ??
                            "bottom-left"
                        }
                        onChange={(event) =>
                            updateConfig(
                                "position",
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                    >
                        <option value="bottom-left">
                            Bottom left
                        </option>

                        <option value="bottom-right">
                            Bottom right
                        </option>

                        <option value="top-left">
                            Top left
                        </option>

                        <option value="top-right">
                            Top right
                        </option>
                    </select>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */

function TextInput({
    label,
    value,
    onChange,
    placeholder,
    description,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}
            </label>

            <input
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
            />

            {description && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}

function NumberInput({
    label,
    value,
    onChange,
    min,
    max,
    suffix,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}
            </label>

            <div className="relative">
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    onChange={(event) =>
                        onChange(
                            Number(
                                event.target.value
                            )
                        )
                    }
                    className="h-11 w-full rounded-lg border bg-background px-3 pr-12 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                />

                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}