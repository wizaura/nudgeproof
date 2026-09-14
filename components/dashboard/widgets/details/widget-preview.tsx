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

        const delay = config.delay ?? 0;

        const timer = window.setTimeout(() => {
            setVisible(true);
        }, Math.min(delay, 1500));

        return () => window.clearTimeout(timer);
    }, [type, config]);

    const position = config.position ?? "bottom-left";

    const positionClasses: Record<string, string> = {
        "bottom-left": "bottom-6 left-6",
        "bottom-right": "bottom-6 right-6",
        "top-left": "top-6 left-6",
        "top-right": "top-6 right-6",
    };

    const currentPosition =
        positionClasses[position] ?? positionClasses["bottom-left"];

    return (
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl border bg-muted/30">
            {/* Fake website background */}
            <div className="absolute inset-0">
                <div className="border-b bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-28 rounded bg-muted" />

                        <div className="flex gap-4">
                            <div className="h-3 w-12 rounded bg-muted" />
                            <div className="h-3 w-12 rounded bg-muted" />
                            <div className="h-3 w-12 rounded bg-muted" />
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-8 py-12">
                    <div className="mx-auto mb-8 h-8 w-64 rounded bg-muted" />

                    <div className="mx-auto mb-3 h-4 w-full max-w-xl rounded bg-muted" />
                    <div className="mx-auto mb-3 h-4 w-full max-w-lg rounded bg-muted" />

                    <div className="mx-auto mt-8 h-40 w-full max-w-2xl rounded-xl bg-muted/70" />
                </div>
            </div>

            {/* Preview label */}
            <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
                Live Preview
            </div>

            {/* Notification */}
            <div
                className={`absolute z-10 transition-all duration-500 ${currentPosition} ${
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
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-[340px] max-w-[calc(100vw-3rem)] rounded-xl border bg-background p-4 shadow-xl">
            {children}
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
        config.message || "{name} purchased {product}";

    const renderedMessage = message
        .replace("{name}", "John")
        .replace("{product}", "Premium Package");

    return (
        <NotificationContainer>
            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    J
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                        {title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {renderedMessage}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
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
        <NotificationContainer>
            <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                </div>

                <div>
                    <p className="text-sm font-medium">
                        {renderedMessage}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
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
    const rating = Math.min(Math.max(config.rating ?? 5, 1), 5);

    const text =
        config.text ||
        "Amazing experience. I would definitely recommend this!";

    return (
        <NotificationContainer>
            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {reviewer.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">
                            {reviewer}
                        </p>

                        <div className="flex gap-0.5 text-sm">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <span
                                    key={index}
                                    className={
                                        index < rating
                                            ? "text-yellow-500"
                                            : "text-muted-foreground/30"
                                    }
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
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
        <NotificationContainer>
            <div>
                <p className="text-sm font-semibold">
                    {title}
                </p>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {message}
                </p>

                {config.cta_text && (
                    <button
                        type="button"
                        className="mt-3 inline-flex rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                        {config.cta_text}
                    </button>
                )}
            </div>
        </NotificationContainer>
    );
}