"use client";

import { useEffect, useState } from "react";
import {
    Megaphone,
    ShoppingBag,
    Users,
    Star,
    X,
    CheckCircle2,
    Activity,
    ArrowRight,
    Sparkles,
} from "lucide-react";

type WidgetType =
    | "recent_sales"
    | "live_visitors"
    | "review"
    | "announcement";

type WidgetConfig = {
    title?: string;
    message?: string;
    position?: string;
    duration?: number;
    delay?: number;
    minimum_visitors?: number;

    reviewer?: string;
    rating?: number;
    text?: string;

    cta_text?: string;
    cta_url?: string;

    appearance?: {
        width?: number;
        radius?: number;
        background?: string;
        textColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        shadow?: string;
        fontSize?: number;
        closeButton?: boolean;
        showAvatar?: boolean;
        showTimestamp?: boolean;
    };
};

type WidgetPreviewProps = {
    type: WidgetType;
    config: WidgetConfig;
};

export default function WidgetPreview({
    type,
    config,
}: WidgetPreviewProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(false);

        const timer = window.setTimeout(() => {
            setVisible(true);
        }, Math.min(config.delay ?? 0, 1500));

        return () => window.clearTimeout(timer);
    }, [type, config]);

    const position = config.position ?? "bottom-left";

    const positionClasses: Record<string, string> = {
        "bottom-left": "bottom-5 left-5",
        "bottom-right": "bottom-5 right-5",
        "top-left": "top-5 left-5",
        "top-right": "top-5 right-5",
    };

    const currentPosition =
        positionClasses[position] ??
        positionClasses["bottom-left"];

    return (
        <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-border/60 bg-slate-100 shadow-sm">
            <FakeWebsite />

            {/* Preview label */}
            <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/60 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur">
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>

                Live Preview
            </div>

            {/* Notification */}
            <div
                className={[
                    "absolute z-20 transition-all duration-500",
                    currentPosition,
                    visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0",
                ].join(" ")}
            >
                <Notification
                    type={type}
                    config={config}
                />
            </div>
        </div>
    );
}

/* ==========================================================================
   Fake website
========================================================================== */

function FakeWebsite() {
    return (
        <div className="absolute inset-0 bg-white">
            <div className="border-b border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-28 rounded-md bg-slate-200" />

                    <div className="hidden items-center gap-5 sm:flex">
                        <div className="h-2.5 w-12 rounded bg-slate-200" />
                        <div className="h-2.5 w-12 rounded bg-slate-200" />
                        <div className="h-2.5 w-12 rounded bg-slate-200" />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-8 py-14">
                <div className="mx-auto mb-8 h-8 w-64 rounded-lg bg-slate-200" />

                <div className="mx-auto mb-3 h-3 w-full max-w-xl rounded bg-slate-200" />
                <div className="mx-auto mb-3 h-3 w-full max-w-lg rounded bg-slate-200" />
                <div className="mx-auto h-3 w-full max-w-md rounded bg-slate-200" />

                <div className="mx-auto mt-10 h-40 w-full max-w-2xl rounded-2xl bg-slate-100" />

                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="h-20 rounded-xl bg-slate-100" />
                    <div className="h-20 rounded-xl bg-slate-100" />
                    <div className="h-20 rounded-xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   Notification router
========================================================================== */

function Notification({
    type,
    config,
}: {
    type: WidgetType;
    config: WidgetConfig;
}) {
    switch (type) {
        case "recent_sales":
            return <RecentSales config={config} />;

        case "live_visitors":
            return <LiveVisitors config={config} />;

        case "review":
            return <Review config={config} />;

        case "announcement":
            return <Announcement config={config} />;

        default:
            return null;
    }
}

/* ==========================================================================
   Shared notification container
========================================================================== */

function NotificationContainer({
    children,
    config,
    type,
}: {
    children: React.ReactNode;
    config: WidgetConfig;
    type: WidgetType;
}) {
    const appearance = config.appearance ?? {};

    const width = appearance.width ?? 340;
    const radius = appearance.radius ?? 16;
    const background =
        appearance.background ?? "#ffffff";
    const textColor =
        appearance.textColor ?? "#111827";
    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";
    const accentColor =
        appearance.accentColor ?? "#007fff";
    const shadow =
        appearance.shadow ??
        "0 20px 40px rgba(15, 23, 42, 0.16)";
    const fontSize =
        appearance.fontSize ?? 14;

    const showCloseButton =
        appearance.closeButton !== false;

    const typeLabel: Record<WidgetType, string> = {
        recent_sales: "Recent activity",
        live_visitors: "Live activity",
        review: "Customer review",
        announcement: "Announcement",
    };

    return (
        <div
            className="group overflow-hidden border backdrop-blur-xl"
            style={{
                width,
                maxWidth: "calc(100vw - 40px)",
                borderRadius: radius,
                background,
                color: textColor,
                boxShadow: shadow,
                fontSize,
                borderColor: `${accentColor}20`,
            }}
        >
            {/* Top accent line */}
            <div
                className="h-[2px] w-full"
                style={{
                    background: accentColor,
                }}
            />

            <div className="relative p-4">
                {/* Small widget label */}
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div
                        className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                        style={{
                            color: secondaryColor,
                        }}
                    >
                        <span
                            className="size-1.5 rounded-full"
                            style={{
                                background:
                                    accentColor,
                            }}
                        />

                        {typeLabel[type]}
                    </div>

                    {showCloseButton && (
                        <button
                            type="button"
                            aria-label="Close preview"
                            className="flex size-5 items-center justify-center rounded-md transition hover:bg-black/5"
                            style={{
                                color: secondaryColor,
                            }}
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>

                {children}

                {/* Powered by */}
                <div
                    className="mt-3 flex items-center justify-between border-t pt-3"
                    style={{
                        borderColor: `${accentColor}18`,
                    }}
                >
                    <div
                        className="flex items-center gap-1.5 text-[9px]"
                        style={{
                            color: secondaryColor,
                        }}
                    >
                        <Sparkles
                            className="size-2.5"
                            style={{
                                color: accentColor,
                            }}
                        />

                        <span>
                            Powered by{" "}
                            <strong
                                className="font-bold"
                                style={{
                                    color: textColor,
                                }}
                            >
                                NudgeProof
                            </strong>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   Recent Sales
========================================================================== */

function RecentSales({
    config,
}: {
    config: WidgetConfig;
}) {
    const appearance = config.appearance ?? {};

    const accentColor =
        appearance.accentColor ?? "#007fff";

    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";

    const textColor =
        appearance.textColor ?? "#111827";

    const title =
        config.title || "Recent purchase";

    const message =
        config.message ||
        "{name} purchased {product}";

    const renderedMessage = message
        .replace("{name}", "John")
        .replace("{product}", "Premium Package");

    const showAvatar =
        appearance.showAvatar !== false;

    const showTimestamp =
        appearance.showTimestamp !== false;

    return (
        <NotificationContainer
            config={config}
            type="recent_sales"
        >
            <div className="flex gap-3">
                {showAvatar && (
                    <div
                        className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                            background: `${accentColor}12`,
                            color: accentColor,
                        }}
                    >
                        J

                        <span
                            className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2"
                            style={{
                                background:
                                    accentColor,
                                borderColor:
                                    appearance
                                        .background ??
                                    "#ffffff",
                            }}
                        >
                            <CheckCircle2 className="size-2.5 text-white" />
                        </span>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p
                                className="truncate text-[13px] font-bold"
                                style={{
                                    color: textColor,
                                }}
                            >
                                {title}
                            </p>

                            <p
                                className="mt-1 text-[12px] leading-[1.45]"
                                style={{
                                    color: secondaryColor,
                                }}
                            >
                                {renderedMessage}
                            </p>
                        </div>

                        <ShoppingBag
                            className="mt-0.5 size-4 shrink-0"
                            style={{
                                color: accentColor,
                            }}
                        />
                    </div>

                    {showTimestamp && (
                        <div
                            className="mt-2.5 flex items-center gap-1.5 text-[10px]"
                            style={{
                                color: secondaryColor,
                            }}
                        >
                            <span
                                className="size-1 rounded-full"
                                style={{
                                    background:
                                        accentColor,
                                }}
                            />

                            Just now
                        </div>
                    )}
                </div>
            </div>
        </NotificationContainer>
    );
}

/* ==========================================================================
   Live Visitors
========================================================================== */

function LiveVisitors({
    config,
}: {
    config: WidgetConfig;
}) {
    const appearance = config.appearance ?? {};

    const accentColor =
        appearance.accentColor ?? "#007fff";

    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";

    const textColor =
        appearance.textColor ?? "#111827";

    const message =
        config.message ||
        "{count} people are viewing this page";

    const count = Math.max(
        config.minimum_visitors ?? 2,
        12
    );

    const renderedMessage = message.replace(
        "{count}",
        String(count)
    );

    return (
        <NotificationContainer
            config={config}
            type="live_visitors"
        >
            <div
                className="rounded-xl p-3"
                style={{
                    background: `${accentColor}08`,
                    border: `1px solid ${accentColor}15`,
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="relative flex size-11 shrink-0 items-center justify-center rounded-xl"
                        style={{
                            background: `${accentColor}14`,
                            color: accentColor,
                        }}
                    >
                        <Activity className="size-5" />

                        <span className="absolute right-1 top-1 flex size-2">
                            <span
                                className="absolute inline-flex size-full animate-ping rounded-full opacity-50"
                                style={{
                                    background:
                                        accentColor,
                                }}
                            />

                            <span
                                className="relative inline-flex size-2 rounded-full"
                                style={{
                                    background:
                                        accentColor,
                                }}
                            />
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                            <span
                                className="text-xl font-bold tracking-tight"
                                style={{
                                    color: textColor,
                                }}
                            >
                                {count}
                            </span>

                            <span
                                className="text-[10px] font-semibold uppercase tracking-wide"
                                style={{
                                    color: secondaryColor,
                                }}
                            >
                                live now
                            </span>
                        </div>

                        <p
                            className="mt-0.5 text-[11px] leading-4"
                            style={{
                                color: secondaryColor,
                            }}
                        >
                            {renderedMessage.replace(
                                `${count} `,
                                ""
                            )}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/5">
                        <div
                            className="h-full w-[72%] rounded-full"
                            style={{
                                background:
                                    accentColor,
                            }}
                        />
                    </div>

                    <span
                        className="text-[9px] font-medium"
                        style={{
                            color: secondaryColor,
                        }}
                    >
                        Active
                    </span>
                </div>
            </div>
        </NotificationContainer>
    );
}

/* ==========================================================================
   Review
========================================================================== */

function Review({
    config,
}: {
    config: WidgetConfig;
}) {
    const appearance = config.appearance ?? {};

    const accentColor =
        appearance.accentColor ?? "#007fff";

    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";

    const textColor =
        appearance.textColor ?? "#111827";

    const reviewer =
        config.reviewer || "Sarah";

    const rating = Math.min(
        Math.max(config.rating ?? 5, 1),
        5
    );

    const text =
        config.text ||
        "Amazing experience. I would definitely recommend this!";

    const showAvatar =
        appearance.showAvatar !== false;

    return (
        <NotificationContainer
            config={config}
            type="review"
        >
            <div>
                {/* Reviewer */}
                <div className="flex items-center gap-3">
                    {showAvatar && (
                        <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                            style={{
                                background: `${accentColor}12`,
                                color: accentColor,
                            }}
                        >
                            {reviewer
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p
                                className="truncate text-[13px] font-bold"
                                style={{
                                    color: textColor,
                                }}
                            >
                                {reviewer}
                            </p>

                            <CheckCircle2
                                className="size-3.5 shrink-0"
                                style={{
                                    color: accentColor,
                                }}
                            />
                        </div>

                        <div className="mt-1 flex items-center gap-1">
                            {Array.from({
                                length: 5,
                            }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={[
                                        "size-3",
                                        index < rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-200",
                                    ].join(" ")}
                                />
                            ))}

                            <span
                                className="ml-1 text-[9px] font-medium"
                                style={{
                                    color: secondaryColor,
                                }}
                            >
                                {rating}.0
                            </span>
                        </div>
                    </div>
                </div>

                {/* Review */}
                <div
                    className="mt-3 rounded-xl p-3"
                    style={{
                        background: `${accentColor}06`,
                        border: `1px solid ${accentColor}12`,
                    }}
                >
                    <span
                        className="text-xl font-serif leading-none"
                        style={{
                            color: accentColor,
                        }}
                    >
                        “
                    </span>

                    <p
                        className="mt-0.5 text-[12px] leading-[1.55]"
                        style={{
                            color: secondaryColor,
                        }}
                    >
                        {text}
                    </p>
                </div>

                <div
                    className="mt-2.5 text-[9px]"
                    style={{
                        color: secondaryColor,
                    }}
                >
                    Verified customer review
                </div>
            </div>
        </NotificationContainer>
    );
}

/* ==========================================================================
   Announcement
========================================================================== */

function Announcement({
    config,
}: {
    config: WidgetConfig;
}) {
    const appearance = config.appearance ?? {};

    const accentColor =
        appearance.accentColor ?? "#007fff";

    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";

    const textColor =
        appearance.textColor ?? "#111827";

    const title =
        config.title || "Announcement";

    const message =
        config.message ||
        "We have something exciting to share with you.";

    return (
        <NotificationContainer
            config={config}
            type="announcement"
        >
            <div>
                <div className="flex items-start gap-3">
                    <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                        style={{
                            background: `${accentColor}12`,
                            color: accentColor,
                        }}
                    >
                        <Megaphone className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p
                            className="text-[14px] font-bold tracking-tight"
                            style={{
                                color: textColor,
                            }}
                        >
                            {title}
                        </p>

                        <p
                            className="mt-1 text-[12px] leading-[1.55]"
                            style={{
                                color: secondaryColor,
                            }}
                        >
                            {message}
                        </p>
                    </div>
                </div>

                {config.cta_text && (
                    <button
                        type="button"
                        className="group mt-4 flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[11px] font-semibold text-white transition hover:opacity-90"
                        style={{
                            background: accentColor,
                        }}
                    >
                        <span>
                            {config.cta_text}
                        </span>

                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                )}
            </div>
        </NotificationContainer>
    );
}