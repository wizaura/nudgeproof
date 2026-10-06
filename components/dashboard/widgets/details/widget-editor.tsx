"use client";

import { useState } from "react";
import {
    Loader2,
    Save,
    Trash2,
    Play,
    Pause,
    ShoppingBag,
    Users,
    Star,
    Megaphone,
    Palette,
    Settings2,
    MapPin,
    Sparkles,
    Eye,
    SlidersHorizontal,
    Check,
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
            {/* =========================================================
                General
            ========================================================= */}
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <EditorSectionHeader
                    icon={Settings2}
                    title="General"
                    description="Basic settings for this widget."
                />

                <div className="p-6">
                    <TextInput
                        label="Widget name"
                        value={widget.name}
                        onChange={onNameChange}
                        placeholder="My social proof widget"
                        description="This name is only used inside your dashboard."
                        disabled={saving}
                    />
                </div>
            </section>

            {/* =========================================================
                Recent Sales
            ========================================================= */}
            {widget.type === "recent_sales" && (
                <RecentSalesEditor
                    config={widget.config}
                    updateConfig={updateConfig}
                />
            )}

            {/* =========================================================
                Live Visitors
            ========================================================= */}
            {widget.type === "live_visitors" && (
                <LiveVisitorsEditor
                    config={widget.config}
                    updateConfig={updateConfig}
                />
            )}

            {/* =========================================================
                Review
            ========================================================= */}
            {widget.type === "review" && (
                <ReviewEditor
                    config={widget.config}
                    updateConfig={updateConfig}
                />
            )}

            {/* =========================================================
                Announcement
            ========================================================= */}
            {widget.type === "announcement" && (
                <AnnouncementEditor
                    config={widget.config}
                    updateConfig={updateConfig}
                />
            )}

            {/* =========================================================
                Appearance
            ========================================================= */}
            <AppearanceEditor
                config={widget.config}
                updateConfig={updateConfig}
            />

            {/* =========================================================
                Messages
            ========================================================= */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <div className="mt-0.5 size-2 shrink-0 rounded-full bg-destructive" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="size-2.5" />
                    </div>

                    <span>{success}</span>
                </div>
            )}

            {/* =========================================================
                Save
            ========================================================= */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={saveWidget}
                    disabled={saving}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}

                    {saving
                        ? "Saving..."
                        : "Save changes"}
                </button>
            </div>

            {/* =========================================================
                Status + Danger
            ========================================================= */}
            <aside className="grid gap-4 sm:grid-cols-2">
                <section className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Eye className="size-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Widget status
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Control whether this widget is displayed on your website.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-5">
                        {status === "active" ? (
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus("paused")
                                }
                                disabled={saving}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-background text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                            >
                                <Pause className="size-4" />
                                Pause widget
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    changeStatus("active")
                                }
                                disabled={saving}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                            >
                                <Play className="size-4" />
                                Activate widget
                            </button>
                        )}
                    </div>
                </section>

                <section className="flex flex-col rounded-2xl border border-destructive/20 bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                            <Trash2 className="size-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Danger zone
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Permanently delete this widget.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-5">
                        <button
                            type="button"
                            onClick={deleteWidget}
                            disabled={deleting}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
                        >
                            {deleting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Trash2 className="size-4" />
                            )}

                            {deleting
                                ? "Deleting..."
                                : "Delete widget"}
                        </button>
                    </div>
                </section>
            </aside>
        </div>
    );
}

/* ==========================================================================
   Recent Sales
========================================================================== */

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
        <WidgetTypeSection
            icon={ShoppingBag}
            iconClassName="bg-blue-500/10 text-blue-600"
            title="Recent Sales"
            description="Turn recent purchases into social proof and build buyer confidence."
            eyebrow="Social proof"
        >
            <div className="grid gap-5">
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
                    value={config.message ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "message",
                            value
                        )
                    }
                    placeholder="{name} purchased {product}"
                    description="Available placeholders: {name}, {product}"
                />

                <div className="grid gap-5 sm:grid-cols-2">
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
            </div>

            <WidgetPoweredBy />
        </WidgetTypeSection>
    );
}

/* ==========================================================================
   Live Visitors
========================================================================== */

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
        <WidgetTypeSection
            icon={Users}
            iconClassName="bg-emerald-500/10 text-emerald-600"
            title="Live Visitors"
            description="Create urgency by showing how many people are currently viewing your website."
            eyebrow="Real-time activity"
        >
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.035] p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500" />
                        <Users className="size-4" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold">
                            Live activity
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Visitor count updates automatically.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-5">
                <TextInput
                    label="Message"
                    value={config.message ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "message",
                            value
                        )
                    }
                    placeholder="{count} people are viewing this page"
                    description="Use {count} to display the visitor count."
                />

                <div className="grid gap-5 sm:grid-cols-3">
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
            </div>

            <WidgetPoweredBy />
        </WidgetTypeSection>
    );
}

/* ==========================================================================
   Review
========================================================================== */

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
    const rating = Math.min(
        5,
        Math.max(1, config.rating ?? 5)
    );

    return (
        <WidgetTypeSection
            icon={Star}
            iconClassName="bg-amber-500/10 text-amber-600"
            title="Customer Review"
            description="Show genuine-looking customer feedback with a clear rating and review."
            eyebrow="Trust & credibility"
        >
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.035] p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                        <Star className="size-4 fill-current" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1">
                            {Array.from({
                                length: 5,
                            }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={[
                                        "size-3.5",
                                        index < rating
                                            ? "fill-amber-500 text-amber-500"
                                            : "text-muted-foreground/25",
                                    ].join(" ")}
                                />
                            ))}
                        </div>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Highlight your strongest customer feedback.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
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
                        value={rating}
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
                </div>

                <TextareaInput
                    label="Review text"
                    value={config.text ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "text",
                            value
                        )
                    }
                    rows={4}
                    placeholder="Amazing product and fast delivery!"
                />

                <div className="grid gap-5 sm:grid-cols-2">
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
            </div>

            <WidgetPoweredBy />
        </WidgetTypeSection>
    );
}

/* ==========================================================================
   Announcement
========================================================================== */

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
        <WidgetTypeSection
            icon={Megaphone}
            iconClassName="bg-primary/10 text-primary"
            title="Announcement"
            description="Promote an offer, launch, update, or important message with a clear call to action."
            eyebrow="Promotion & messaging"
        >
            <div className="rounded-xl border border-primary/20 bg-primary/[0.035] p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Megaphone className="size-4" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold">
                            Promotional notification
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Keep your message short and action-focused.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-5">
                <TextInput
                    label="Title"
                    value={config.title ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "title",
                            value
                        )
                    }
                    placeholder="Special offer"
                />

                <TextareaInput
                    label="Message"
                    value={config.message ?? ""}
                    onChange={(value) =>
                        updateConfig(
                            "message",
                            value
                        )
                    }
                    rows={4}
                    placeholder="Get 20% off your first order."
                />

                <div className="grid gap-5 sm:grid-cols-2">
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
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
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
            </div>

            <WidgetPoweredBy />
        </WidgetTypeSection>
    );
}

/* ==========================================================================
   Shared widget section
========================================================================== */

function WidgetTypeSection({
    icon: Icon,
    iconClassName,
    title,
    description,
    eyebrow,
    children,
}: {
    icon: React.ElementType;
    iconClassName: string;
    title: string;
    description: string;
    eyebrow: string;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/60 px-6 py-5">
                <div className="flex items-start gap-4">
                    <div
                        className={[
                            "flex size-11 shrink-0 items-center justify-center rounded-xl",
                            iconClassName,
                        ].join(" ")}
                    >
                        <Icon className="size-5" />
                    </div>

                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                {eyebrow}
                            </span>
                        </div>

                        <h2 className="text-base font-semibold tracking-tight">
                            {title}
                        </h2>

                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {children}
            </div>
        </section>
    );
}

/* ==========================================================================
   Powered by
========================================================================== */

function WidgetPoweredBy() {
    return (
        <div className="flex items-center justify-between border-t border-border/50 pt-5">
            <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles className="size-3.5" />
                </div>

                <span className="text-[11px] text-muted-foreground">
                    Powered by{" "}
                    <strong className="font-bold text-foreground">
                        NudgeProof
                    </strong>
                </span>
            </div>

            <span className="text-[10px] text-muted-foreground/60">
                Social proof
            </span>
        </div>
    );
}

/* ==========================================================================
   Appearance
========================================================================== */

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
    const appearance = config.appearance ?? {};

    const updateAppearance = (
        key: string,
        value: any
    ) => {
        updateConfig("appearance", {
            ...appearance,
            [key]: value,
        });
    };

    const positions = [
        {
            value: "top-left",
            label: "Top left",
        },
        {
            value: "top-right",
            label: "Top right",
        },
        {
            value: "bottom-left",
            label: "Bottom left",
        },
        {
            value: "bottom-right",
            label: "Bottom right",
        },
    ];

    const presets = [
        {
            value: "clean",
            label: "Clean",
            description: "Simple and minimal",
            preview: {
                background: "#ffffff",
                textColor: "#111827",
                secondaryColor: "#6b7280",
                accentColor: "#007fff",
                radius: 16,
                shadow:
                    "0 20px 40px rgba(15, 23, 42, 0.16)",
            },
        },
        {
            value: "modern",
            label: "Modern",
            description: "Soft and polished",
            preview: {
                background: "#ffffff",
                textColor: "#111827",
                secondaryColor: "#64748b",
                accentColor: "#007fff",
                radius: 20,
                shadow:
                    "0 24px 60px rgba(15, 23, 42, 0.18)",
            },
        },
        {
            value: "dark",
            label: "Dark",
            description: "Bold dark notification",
            preview: {
                background: "#141414",
                textColor: "#ffffff",
                secondaryColor: "#a1a1aa",
                accentColor: "#007fff",
                radius: 16,
                shadow:
                    "0 24px 60px rgba(0, 0, 0, 0.35)",
            },
        },
        {
            value: "glass",
            label: "Glass",
            description: "Light glass effect",
            preview: {
                background:
                    "rgba(255,255,255,0.82)",
                textColor: "#111827",
                secondaryColor: "#64748b",
                accentColor: "#007fff",
                radius: 20,
                shadow:
                    "0 24px 60px rgba(15,23,42,0.14)",
            },
        },
    ];

    const applyPreset = (
        preset: (typeof presets)[number]
    ) => {
        updateConfig("appearance", {
            ...appearance,
            preset: preset.value,
            ...preset.preview,
        });
    };

    const shadowOptions = [
        {
            value: "none",
            label: "None",
            css: "none",
        },
        {
            value: "soft",
            label: "Soft",
            css: "0 12px 30px rgba(15, 23, 42, 0.10)",
        },
        {
            value: "medium",
            label: "Medium",
            css: "0 20px 40px rgba(15, 23, 42, 0.16)",
        },
        {
            value: "strong",
            label: "Strong",
            css: "0 24px 60px rgba(15, 23, 42, 0.22)",
        },
    ];

    const currentShadow =
        appearance.shadow ??
        "0 20px 40px rgba(15, 23, 42, 0.16)";

    return (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            {/* Header */}
            <div className="border-b border-border/60 px-6 py-5">
                <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Palette className="size-5" />
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                Customization
                            </span>
                        </div>

                        <h2 className="text-base font-semibold tracking-tight">
                            Appearance
                        </h2>

                        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                            Customize the look and feel of your notification.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8 p-6">
                {/* Presets */}
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">
                            Design style
                        </label>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Start with a preset or customize everything below.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {presets.map((preset) => {
                            const active =
                                appearance.preset ===
                                preset.value;

                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() =>
                                        applyPreset(
                                            preset
                                        )
                                    }
                                    className={[
                                        "group rounded-xl border p-3 text-left transition",
                                        active
                                            ? "border-primary bg-primary/[0.05] ring-1 ring-primary"
                                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/30",
                                    ].join(" ")}
                                >
                                    <div
                                        className="mb-3 flex h-16 items-end rounded-lg border p-2"
                                        style={{
                                            background:
                                                preset.value ===
                                                "dark"
                                                    ? "#27272a"
                                                    : "#f8fafc",
                                        }}
                                    >
                                        <div
                                            className="w-full p-2"
                                            style={{
                                                background:
                                                    preset
                                                        .preview
                                                        .background,
                                                borderRadius:
                                                    Math.min(
                                                        preset
                                                            .preview
                                                            .radius,
                                                        10
                                                    ),
                                                boxShadow:
                                                    preset
                                                        .preview
                                                        .shadow,
                                            }}
                                        >
                                            <div className="flex gap-2">
                                                <div
                                                    className="size-5 shrink-0 rounded-full"
                                                    style={{
                                                        background:
                                                            preset
                                                                .preview
                                                                .accentColor,
                                                    }}
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div
                                                        className="h-1.5 w-14 rounded-full"
                                                        style={{
                                                            background:
                                                                preset
                                                                    .preview
                                                                    .textColor,
                                                        }}
                                                    />

                                                    <div
                                                        className="mt-1.5 h-1 w-20 rounded-full opacity-50"
                                                        style={{
                                                            background:
                                                                preset
                                                                    .preview
                                                                    .secondaryColor,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs font-semibold">
                                        {preset.label}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        {preset.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Position */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />

                        <div>
                            <label className="text-sm font-medium">
                                Position
                            </label>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Choose where the notification appears.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {positions.map((item) => {
                            const active =
                                config.position ===
                                    item.value ||
                                (!config.position &&
                                    item.value ===
                                        "bottom-left");

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() =>
                                        updateConfig(
                                            "position",
                                            item.value
                                        )
                                    }
                                    className={[
                                        "relative h-24 overflow-hidden rounded-xl border-2 transition",
                                        active
                                            ? "border-primary bg-primary/[0.04]"
                                            : "border-border bg-muted/20 hover:border-muted-foreground/40",
                                    ].join(" ")}
                                >
                                    <div className="absolute inset-2 rounded-lg border bg-background">
                                        <div
                                            className={[
                                                "absolute h-5 w-12 rounded-md transition",
                                                item.value.includes(
                                                    "top"
                                                )
                                                    ? "top-2"
                                                    : "bottom-2",
                                                item.value.includes(
                                                    "left"
                                                )
                                                    ? "left-2"
                                                    : "right-2",
                                                active
                                                    ? "bg-primary"
                                                    : "bg-slate-300",
                                            ].join(" ")}
                                        />
                                    </div>

                                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-medium text-muted-foreground">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Size */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-primary" />

                        <div>
                            <label className="text-sm font-medium">
                                Size & spacing
                            </label>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Control the overall proportions of the widget.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <NumberInput
                            label="Width"
                            value={
                                appearance.width ??
                                340
                            }
                            min={280}
                            max={500}
                            suffix="px"
                            onChange={(value) =>
                                updateAppearance(
                                    "width",
                                    value
                                )
                            }
                        />

                        <NumberInput
                            label="Corner radius"
                            value={
                                appearance.radius ??
                                16
                            }
                            min={0}
                            max={32}
                            suffix="px"
                            onChange={(value) =>
                                updateAppearance(
                                    "radius",
                                    value
                                )
                            }
                        />

                        <NumberInput
                            label="Font size"
                            value={
                                appearance.fontSize ??
                                14
                            }
                            min={11}
                            max={18}
                            suffix="px"
                            onChange={(value) =>
                                updateAppearance(
                                    "fontSize",
                                    value
                                )
                            }
                        />
                    </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Palette className="size-4 text-primary" />

                        <div>
                            <label className="text-sm font-medium">
                                Colors
                            </label>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Match the notification to your brand.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <ColorInput
                            label="Background"
                            value={
                                appearance.background ??
                                "#ffffff"
                            }
                            onChange={(value) =>
                                updateAppearance(
                                    "background",
                                    value
                                )
                            }
                        />

                        <ColorInput
                            label="Accent"
                            value={
                                appearance.accentColor ??
                                "#007fff"
                            }
                            onChange={(value) =>
                                updateAppearance(
                                    "accentColor",
                                    value
                                )
                            }
                        />

                        <ColorInput
                            label="Text"
                            value={
                                appearance.textColor ??
                                "#111827"
                            }
                            onChange={(value) =>
                                updateAppearance(
                                    "textColor",
                                    value
                                )
                            }
                        />

                        <ColorInput
                            label="Secondary text"
                            value={
                                appearance.secondaryColor ??
                                "#6b7280"
                            }
                            onChange={(value) =>
                                updateAppearance(
                                    "secondaryColor",
                                    value
                                )
                            }
                        />
                    </div>
                </div>

                {/* Shadow */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />

                        <div>
                            <label className="text-sm font-medium">
                                Shadow
                            </label>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Control the depth of the notification.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {shadowOptions.map(
                            (option) => {
                                const active =
                                    currentShadow ===
                                    option.css;

                                return (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            updateAppearance(
                                                "shadow",
                                                option.css
                                            )
                                        }
                                        className={[
                                            "rounded-xl border px-3 py-3 text-left transition",
                                            active
                                                ? "border-primary bg-primary/[0.05] ring-1 ring-primary"
                                                : "border-border hover:bg-muted/40",
                                        ].join(" ")}
                                    >
                                        <div
                                            className="mb-2 h-7 rounded-lg border bg-background"
                                            style={{
                                                boxShadow:
                                                    option.css,
                                            }}
                                        />

                                        <p className="text-xs font-medium">
                                            {option.label}
                                        </p>
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* Display options */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="size-4 text-primary" />

                        <div>
                            <label className="text-sm font-medium">
                                Display options
                            </label>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Choose which supporting elements appear.
                            </p>
                        </div>
                    </div>

                    <div className="divide-y overflow-hidden rounded-xl border">
                        <ToggleRow
                            label="Show close button"
                            description="Allow visitors to dismiss the notification."
                            checked={
                                appearance.closeButton !==
                                false
                            }
                            onChange={(checked) =>
                                updateAppearance(
                                    "closeButton",
                                    checked
                                )
                            }
                        />

                        <ToggleRow
                            label="Show timestamp"
                            description="Display when the activity happened."
                            checked={
                                appearance.showTimestamp !==
                                false
                            }
                            onChange={(checked) =>
                                updateAppearance(
                                    "showTimestamp",
                                    checked
                                )
                            }
                        />

                        <ToggleRow
                            label="Show avatar"
                            description="Display the customer or activity avatar."
                            checked={
                                appearance.showAvatar !==
                                false
                            }
                            onChange={(checked) =>
                                updateAppearance(
                                    "showAvatar",
                                    checked
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ==========================================================================
   Text Input
========================================================================== */

function TextInput({
    label,
    value,
    onChange,
    placeholder,
    description,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
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
                disabled={disabled}
                className="h-11 w-full rounded-xl border border-border/70 bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {description && (
                <p className="text-[11px] leading-4 text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}

/* ==========================================================================
   Textarea
========================================================================== */

function TextareaInput({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}
            </label>

            <textarea
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                rows={rows}
                placeholder={placeholder}
                className="w-full resize-none rounded-xl border border-border/70 bg-background px-3.5 py-3 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
        </div>
    );
}

/* ==========================================================================
   Number Input
========================================================================== */

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
                    className={[
                        "h-11 w-full rounded-xl border border-border/70 bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10",
                        suffix
                            ? "pr-12"
                            : "",
                    ].join(" ")}
                />

                {suffix && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ==========================================================================
   Color Input
========================================================================== */

function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}
            </label>

            <div className="flex h-11 items-center gap-2 rounded-xl border border-border/70 bg-background px-2.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <input
                    type="color"
                    value={
                        /^#[0-9A-Fa-f]{6}$/.test(
                            value
                        )
                            ? value
                            : "#ffffff"
                    }
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="size-7 cursor-pointer rounded-md border-0 bg-transparent p-0"
                />

                <input
                    type="text"
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                    placeholder="#ffffff"
                />
            </div>
        </div>
    );
}

/* ==========================================================================
   Toggle
========================================================================== */

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0">
                <p className="text-sm font-medium">
                    {label}
                </p>

                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() =>
                    onChange(!checked)
                }
                className={[
                    "relative h-6 w-11 shrink-0 rounded-full transition",
                    checked
                        ? "bg-primary"
                        : "bg-muted",
                ].join(" ")}
            >
                <span
                    className={[
                        "absolute top-1 size-4 rounded-full bg-white shadow-sm transition",
                        checked
                            ? "left-6"
                            : "left-1",
                    ].join(" ")}
                />
            </button>
        </div>
    );
}

/* ==========================================================================
   Section Header
========================================================================== */

function EditorSectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-border/60 px-6 py-5">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
                    <Icon className="size-4" />
                </div>

                <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}