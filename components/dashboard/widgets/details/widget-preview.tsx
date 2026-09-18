"use client";

import { useEffect, useState } from "react";

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
        positionClasses[position] ?? positionClasses["bottom-left"];

    return (
        <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border bg-slate-100 shadow-sm">
            <FakeWebsite />

            <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full border bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur">
                Live Preview
            </div>

            <div
                className={`absolute z-20 transition-all duration-500 ${currentPosition} ${
                    visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0"
                }`}
            >
                <Notification
                    type={type}
                    config={config}
                />
            </div>
        </div>
    );
}

function FakeWebsite() {
    return (
        <div className="absolute inset-0 bg-white">
            <div className="border-b bg-white px-6 py-4">
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

function NotificationContainer({
    children,
    config,
}: {
    children: React.ReactNode;
    config: WidgetConfig;
}) {
    const appearance = config.appearance ?? {};

    const width = appearance.width ?? 340;
    const radius = appearance.radius ?? 16;
    const background = appearance.background ?? "#ffffff";
    const textColor = appearance.textColor ?? "#111827";
    const secondaryColor =
        appearance.secondaryColor ?? "#6b7280";
    const shadow =
        appearance.shadow ??
        "0 20px 40px rgba(15, 23, 42, 0.16)";

    return (
        <div
            className="border"
            style={{
                width,
                maxWidth: "calc(100vw - 40px)",
                borderRadius: radius,
                background,
                color: textColor,
                boxShadow: shadow,
            }}
        >
            <div
                className="p-4"
                style={{
                    color: textColor,
                }}
            >
                {children}
            </div>
        </div>
    );
}

function RecentSales({
    config,
}: {
    config: WidgetConfig;
}) {
    const title = config.title || "Recent purchase";

    const message =
        config.message ||
        "{name} purchased {product}";

    const renderedMessage = message
        .replace("{name}", "John")
        .replace("{product}", "Premium Package");

    return (
        <NotificationContainer config={config}>
            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">
                    J
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                        {title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {renderedMessage}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                        Just now
                    </p>
                </div>
            </div>
        </NotificationContainer>
    );
}

function LiveVisitors({
    config,
}: {
    config: WidgetConfig;
}) {
    const message =
        config.message ||
        "{count} people are viewing this page";

    const renderedMessage = message.replace(
        "{count}",
        String(Math.max(config.minimum_visitors ?? 2, 12))
    );

    return (
        <NotificationContainer config={config}>
            <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>

                <div>
                    <p className="text-sm font-medium">
                        {renderedMessage}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                        Live activity
                    </p>
                </div>
            </div>
        </NotificationContainer>
    );
}

function Review({
    config,
}: {
    config: WidgetConfig;
}) {
    const reviewer = config.reviewer || "Sarah";

    const rating = Math.min(
        Math.max(config.rating ?? 5, 1),
        5
    );

    const text =
        config.text ||
        "Amazing experience. I would definitely recommend this!";

    return (
        <NotificationContainer config={config}>
            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">
                    {reviewer.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">
                            {reviewer}
                        </p>

                        <div className="flex gap-0.5 text-sm">
                            {Array.from({ length: 5 }).map(
                                (_, index) => (
                                    <span
                                        key={index}
                                        className={
                                            index < rating
                                                ? "text-amber-400"
                                                : "text-slate-200"
                                        }
                                    >
                                        ★
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-slate-500">
                        {text}
                    </p>
                </div>
            </div>
        </NotificationContainer>
    );
}

function Announcement({
    config,
}: {
    config: WidgetConfig;
}) {
    const title = config.title || "Announcement";

    const message =
        config.message ||
        "We have something exciting to share with you.";

    return (
        <NotificationContainer config={config}>
            <div>
                <p className="text-sm font-semibold">
                    {title}
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                    {message}
                </p>

                {config.cta_text && (
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                    >
                        {config.cta_text}
                    </button>
                )}
            </div>
        </NotificationContainer>
    );
}