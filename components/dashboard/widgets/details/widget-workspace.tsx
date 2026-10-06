"use client";

import { useState } from "react";
import {
    Eye,
    Monitor,
    Smartphone,
    Sparkles,
} from "lucide-react";

import WidgetEditor from "./widget-editor";
import WidgetPreview from "./widget-preview";

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

type WidgetWorkspaceProps = {
    widget: {
        id: string;
        name: string;
        type: WidgetType;
        config: WidgetConfig;
        status: WidgetStatus;
    };
};

const widgetTypeMeta: Record<
    WidgetType,
    {
        label: string;
        description: string;
    }
> = {
    recent_sales: {
        label: "Recent Sales",
        description:
            "Show recent purchases and product activity to build social proof.",
    },

    live_visitors: {
        label: "Live Visitors",
        description:
            "Create urgency by showing how many people are currently viewing your website.",
    },

    review: {
        label: "Customer Review",
        description:
            "Highlight customer feedback with ratings and review content.",
    },

    announcement: {
        label: "Announcement",
        description:
            "Promote an offer, update, launch, or important message with a clear call to action.",
    },
};

export default function WidgetWorkspace({
    widget,
}: WidgetWorkspaceProps) {
    const [name, setName] = useState(widget.name);

    const [config, setConfig] = useState<WidgetConfig>(
        widget.config ?? {}
    );

    const [previewMode, setPreviewMode] = useState<
        "desktop" | "mobile"
    >("desktop");

    const meta = widgetTypeMeta[widget.type];

    return (
        <div className="space-y-8">
            {/* =========================================================
                Workspace header
            ========================================================= */}
            <div className="border-b border-border/60 pb-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Widget editor
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[30px]">
                                {name || "Untitled widget"}
                            </h1>

                            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                {meta.label}
                            </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-[13px] leading-5 text-muted-foreground">
                            {meta.description}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/80 p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewMode("desktop")
                                }
                                className={[
                                    "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition",
                                    previewMode === "desktop"
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                ].join(" ")}
                            >
                                <Monitor className="size-3.5" />
                                Desktop
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewMode("mobile")
                                }
                                className={[
                                    "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition",
                                    previewMode === "mobile"
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                ].join(" ")}
                            >
                                <Smartphone className="size-3.5" />
                                Mobile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                Main workspace
            ========================================================= */}
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
                {/* =====================================================
                    Editor
                ===================================================== */}
                <main className="min-w-0">
                    <WidgetEditor
                        widget={{
                            ...widget,
                            name,
                            config,
                        }}
                        onNameChange={setName}
                        onConfigChange={setConfig}
                    />
                </main>

                {/* =====================================================
                    Preview
                ===================================================== */}
                <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
                        {/* Preview header */}
                        <div className="border-b border-border/60 px-5 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Eye className="size-3.5" />
                                        </span>

                                        <h2 className="text-sm font-semibold tracking-tight">
                                            Live preview
                                        </h2>
                                    </div>

                                    <p className="text-[11px] leading-4 text-muted-foreground">
                                        Changes appear instantly.
                                    </p>
                                </div>

                                <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1.5 sm:flex">
                                    <span className="relative flex size-1.5">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                                    </span>

                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        Live
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Preview stage */}
                        <div
                            className={[
                                "relative overflow-hidden transition-all duration-300",
                                previewMode === "mobile"
                                    ? "mx-auto w-[375px] max-w-full"
                                    : "w-full",
                            ].join(" ")}
                        >
                            {/* Fake browser chrome */}
                            <div className="border-b border-border/50 bg-muted/20 px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-red-400/70" />
                                    <span className="size-2 rounded-full bg-amber-400/70" />
                                    <span className="size-2 rounded-full bg-emerald-400/70" />

                                    <div className="ml-2 flex h-6 min-w-0 flex-1 items-center rounded-md border border-border/50 bg-background/70 px-2.5">
                                        <span className="truncate text-[9px] text-muted-foreground">
                                            yourwebsite.com
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actual preview */}
                            <div className="p-3 sm:p-4">
                                <WidgetPreview
                                    type={widget.type}
                                    config={config}
                                />
                            </div>
                        </div>

                        {/* Preview footer */}
                        <div className="border-t border-border/60 bg-muted/[0.18] px-5 py-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Sparkles className="size-3" />
                                    </span>

                                    <p className="truncate text-[10px] leading-4 text-muted-foreground">
                                        Customize the design from Appearance.
                                    </p>
                                </div>

                                <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                                    {previewMode === "mobile"
                                        ? "375px"
                                        : "Desktop"}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}