"use client";

import {
    Code2,
    Copy,
    ExternalLink,
    Globe,
    KeyRound,
    Plug,
    ShoppingBag,
    Sparkles,
    Webhook,
    Check,
} from "lucide-react";
import { useState } from "react";

type Website = {
    id: string;
    name: string;
    url: string;
    site_key: string;
    webhook_secret: string | null;
    status: string;
};

type Props = {
    websites: Website[];
    appUrl: string;
};

function copyToClipboard(value: string) {
    return navigator.clipboard.writeText(value);
}

export default function IntegrationsPageClient({
    websites,
    appUrl,
}: Props) {
    const [selectedWebsiteId, setSelectedWebsiteId] =
        useState(
            websites.length > 0
                ? websites[0].id
                : ""
        );

    const [copied, setCopied] =
        useState<string | null>(null);

    const selectedWebsite = websites.find(
        (website) =>
            website.id === selectedWebsiteId
    );

    async function handleCopy(
        value: string,
        key: string
    ) {
        try {
            await copyToClipboard(value);

            setCopied(key);

            window.setTimeout(() => {
                setCopied(null);
            }, 1500);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    }

    const webhookUrl = selectedWebsite
        ? `${appUrl}/api/webhooks/${selectedWebsite.site_key}`
        : "";

    const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Authorization: Bearer ${selectedWebsite?.webhook_secret ?? ""}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "purchase",
    "data": {
      "name": "{{CUSTOMER_NAME}}",
      "product": "{{PRODUCT_NAME}}"
    }
  }'`;

    return (
        <div className="min-h-screen">
            <div className="space-y-7 p-6">
                {/* Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Developer
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-[30px]">
                                Integrations
                            </h1>

                            <Sparkles className="size-4 text-primary" />
                        </div>

                        <p className="mt-2.5 max-w-2xl text-[13px] leading-5 tracking-[-0.01em] text-muted-foreground">
                            Connect your websites and services to send
                            real activity into NudgeProof.
                        </p>
                    </div>

                    <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3.5 py-2.5 sm:flex">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                            <Plug className="size-3.5 text-primary" />
                        </div>

                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Connections
                            </p>

                            <p className="text-xs font-semibold">
                                {websites.length} website
                                {websites.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Integration cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Custom Webhook */}
                    <div className="rounded-2xl border border-primary/30 bg-background/80 shadow-sm backdrop-blur-sm">
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Webhook className="size-4.5" />
                                </div>

                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                    Available
                                </span>
                            </div>

                            <div className="mt-5">
                                <h2 className="text-sm font-semibold">
                                    Custom Webhook
                                </h2>

                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                    Send purchases, signups, reviews,
                                    and custom events from any backend.
                                </p>
                            </div>

                            <a
                                href="#custom-webhook"
                                className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                Configure
                                <ExternalLink className="size-3.5" />
                            </a>
                        </div>
                    </div>

                    <IntegrationCard
                        icon={
                            <ShoppingBag className="size-4.5" />
                        }
                        title="Shopify"
                        description="Automatically turn new Shopify orders into NudgeProof purchase events."
                    />

                    <IntegrationCard
                        icon={
                            <Plug className="size-4.5" />
                        }
                        title="Stripe"
                        description="Send successful payments and customer activity to your NudgeProof widgets."
                    />

                    <IntegrationCard
                        icon={
                            <Globe className="size-4.5" />
                        }
                        title="WooCommerce"
                        description="Connect your WooCommerce store and display real purchase activity."
                    />
                </div>

                {/* Custom webhook */}
                <section
                    id="custom-webhook"
                    className="scroll-mt-6 overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm"
                >
                    <div className="border-b border-border/60 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Webhook className="size-4" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Custom Webhook
                                </h2>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Connect any website or backend to
                                    NudgeProof.
                                </p>
                            </div>
                        </div>
                    </div>

                    {websites.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                                <Globe className="size-5 text-primary" />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold">
                                Add a website first
                            </h3>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                                Create a website in NudgeProof before
                                configuring a webhook.
                            </p>

                            <a
                                href="/dashboard/websites/new"
                                className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                Add website
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-7 p-6">
                            {/* Website selector */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="integration-website"
                                    className="text-xs font-semibold"
                                >
                                    Website
                                </label>

                                <select
                                    id="integration-website"
                                    value={selectedWebsiteId}
                                    onChange={(event) =>
                                        setSelectedWebsiteId(
                                            event.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-xl border border-border/70 bg-background px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                >
                                    {websites.map((website) => (
                                        <option
                                            key={website.id}
                                            value={website.id}
                                        >
                                            {website.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedWebsite && (
                                <>
                                    {/* Status */}
                                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-lg ${
                                                    selectedWebsite.status ===
                                                    "active"
                                                        ? "bg-green-500/10"
                                                        : "bg-yellow-500/10"
                                                }`}
                                            >
                                                <span
                                                    className={`size-2 rounded-full ${
                                                        selectedWebsite.status ===
                                                        "active"
                                                            ? "bg-green-500"
                                                            : "bg-yellow-500"
                                                    }`}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Website status
                                                </p>

                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    This website is{" "}
                                                    <span className="font-medium text-foreground">
                                                        {
                                                            selectedWebsite.status
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <span className="rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                            {selectedWebsite.status}
                                        </span>
                                    </div>

                                    {/* Webhook URL */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code2 className="size-3.5 text-primary" />

                                                <label className="text-xs font-semibold">
                                                    Webhook URL
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                                            <code className="min-w-0 flex-1 overflow-x-auto px-3.5 py-3 text-[11px] leading-5">
                                                {webhookUrl}
                                            </code>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        webhookUrl,
                                                        "url"
                                                    )
                                                }
                                                className="flex shrink-0 items-center gap-2 border-l border-border/70 px-3.5 text-xs font-medium transition hover:bg-muted"
                                            >
                                                {copied === "url" ? (
                                                    <>
                                                        <Check className="size-3.5 text-primary" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="size-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Secret */}
                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <KeyRound className="size-3.5 text-primary" />

                                            <label className="text-xs font-semibold">
                                                Webhook Secret
                                            </label>
                                        </div>

                                        <div className="flex overflow-hidden rounded-xl border border-border/70 bg-muted/20">
                                            <code className="min-w-0 flex-1 overflow-x-auto px-3.5 py-3 text-[11px] leading-5">
                                                {
                                                    selectedWebsite.webhook_secret
                                                }
                                            </code>

                                            <button
                                                type="button"
                                                disabled={
                                                    !selectedWebsite.webhook_secret
                                                }
                                                onClick={() =>
                                                    selectedWebsite.webhook_secret &&
                                                    handleCopy(
                                                        selectedWebsite.webhook_secret,
                                                        "secret"
                                                    )
                                                }
                                                className="flex shrink-0 items-center gap-2 border-l border-border/70 px-3.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {copied === "secret" ? (
                                                    <>
                                                        <Check className="size-3.5 text-primary" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="size-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                            Keep this secret on your server.
                                            Never put it in frontend JavaScript.
                                        </p>
                                    </div>

                                    {/* Supported events */}
                                    <div>
                                        <h3 className="text-xs font-semibold">
                                            Supported events
                                        </h3>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {[
                                                "purchase",
                                                "signup",
                                                "review",
                                                "custom",
                                            ].map((event) => (
                                                <code
                                                    key={event}
                                                    className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium"
                                                >
                                                    {event}
                                                </code>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Example */}
                                    <div>
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <h3 className="text-xs font-semibold">
                                                Example request
                                            </h3>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        curlExample,
                                                        "curl"
                                                    )
                                                }
                                                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                                            >
                                                {copied === "curl" ? (
                                                    <>
                                                        <Check className="size-3.5 text-primary" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="size-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <pre className="overflow-x-auto rounded-xl border border-border/60 bg-[#111] p-4 text-[11px] leading-5 text-white/90">
                                            <code>
                                                {curlExample}
                                            </code>
                                        </pre>

                                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                            Replace the placeholders with values
                                            from your own backend, such as the
                                            customer name and product name.
                                        </p>
                                    </div>

                                    {/* Server-side integration */}
                                    <div className="rounded-xl border border-primary/10 bg-primary/[0.035] p-4">
                                        <div className="flex gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <Code2 className="size-3.5 text-primary" />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold">
                                                    Server-side integration
                                                </p>

                                                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                                    Send the webhook from your
                                                    backend after the purchase
                                                    or other action has
                                                    successfully completed.
                                                    Never expose the webhook
                                                    secret in browser-side
                                                    JavaScript.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function IntegrationCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
                        {icon}
                    </div>

                    <span className="rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Coming soon
                    </span>
                </div>

                <div className="mt-5">
                    <h2 className="text-sm font-semibold">
                        {title}
                    </h2>

                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>

                <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex h-9 items-center justify-center rounded-xl border border-border/70 px-3.5 text-xs font-semibold opacity-50"
                >
                    Connect
                </button>
            </div>
        </div>
    );
}