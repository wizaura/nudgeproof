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

function copyToClipboard(
    value: string
) {
    return navigator.clipboard.writeText(
        value
    );
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

    const selectedWebsite =
        websites.find(
            (website) =>
                website.id ===
                selectedWebsiteId
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
            console.error(
                "Copy failed:",
                error
            );
        }
    }

    const webhookUrl = selectedWebsite
        ? `${appUrl}/api/webhooks/${selectedWebsite.site_key}`
        : "";

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Integrations
                    </h1>

                    <Sparkles className="size-5 text-muted-foreground" />
                </div>

                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Connect your websites and services
                    to send real activity into NudgeProof.
                </p>
            </div>

            {/* Integration cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Custom Webhook */}
                <div className="rounded-xl border bg-card">
                    <div className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted">
                                <Webhook className="size-5" />
                            </div>

                            <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                                Available
                            </span>
                        </div>

                        <div className="mt-5">
                            <h2 className="font-semibold">
                                Custom Webhook
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Send purchases, signups,
                                reviews, and custom events
                                from any backend.
                            </p>
                        </div>

                        <a
                            href="#custom-webhook"
                            className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
                        >
                            Configure
                            <ExternalLink className="size-4" />
                        </a>
                    </div>
                </div>

                {/* Shopify */}
                <IntegrationCard
                    icon={
                        <ShoppingBag className="size-5" />
                    }
                    title="Shopify"
                    description="Automatically turn new Shopify orders into NudgeProof purchase events."
                />

                {/* Stripe */}
                <IntegrationCard
                    icon={
                        <Plug className="size-5" />
                    }
                    title="Stripe"
                    description="Send successful payments and customer activity to your NudgeProof widgets."
                />

                {/* WooCommerce */}
                <IntegrationCard
                    icon={
                        <Globe className="size-5" />
                    }
                    title="WooCommerce"
                    description="Connect your WooCommerce store and display real purchase activity."
                />
            </div>

            {/* Custom webhook */}
            <section
                id="custom-webhook"
                className="scroll-mt-6 rounded-xl border bg-card"
            >
                <div className="border-b p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Webhook className="size-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Custom Webhook
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Connect any website or
                                backend to NudgeProof.
                            </p>
                        </div>
                    </div>
                </div>

                {websites.length === 0 ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Globe className="size-5 text-muted-foreground" />
                        </div>

                        <h3 className="mt-4 font-semibold">
                            Add a website first
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Create a website in NudgeProof
                            before configuring a webhook.
                        </p>

                        <a
                            href="/dashboard/websites/new"
                            className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Add website
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6 p-6">
                        {/* Website selector */}
                        <div className="">
                            <label
                                htmlFor="integration-website"
                                className="text-sm font-medium"
                            >
                                Website
                            </label>

                            <select
                                id="integration-website"
                                value={
                                    selectedWebsiteId
                                }
                                onChange={(event) =>
                                    setSelectedWebsiteId(
                                        event.target
                                            .value
                                    )
                                }
                                className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                {websites.map(
                                    (website) => (
                                        <option
                                            key={
                                                website.id
                                            }
                                            value={
                                                website.id
                                            }
                                        >
                                            {
                                                website.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {selectedWebsite && (
                            <>
                                {/* Status */}
                                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4">
                                    <div
                                        className={`size-2 rounded-full ${selectedWebsite.status ===
                                            "active"
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                            }`}
                                    />

                                    <span className="text-sm">
                                        Website is{" "}
                                        <strong>
                                            {
                                                selectedWebsite.status
                                            }
                                        </strong>
                                    </span>
                                </div>

                                {/* Webhook URL */}
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <Code2 className="size-4" />

                                        <label className="text-sm font-medium">
                                            Webhook URL
                                        </label>
                                    </div>

                                    <div className="flex rounded-md border bg-muted/20">
                                        <code className="min-w-0 flex-1 overflow-x-auto px-3 py-2.5 text-xs">
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
                                            className="flex shrink-0 items-center gap-2 border-l px-3 text-sm hover:bg-muted"
                                        >
                                            {copied ===
                                                "url" ? (
                                                <>
                                                    <Check className="size-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Secret */}
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <KeyRound className="size-4" />

                                        <label className="text-sm font-medium">
                                            Webhook Secret
                                        </label>
                                    </div>

                                    <div className="flex rounded-md border bg-muted/20">
                                        <code className="min-w-0 flex-1 overflow-x-auto px-3 py-2.5 text-xs">
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
                                            className="flex shrink-0 items-center gap-2 border-l px-3 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {copied ===
                                                "secret" ? (
                                                <>
                                                    <Check className="size-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Keep this secret on
                                        your server. Never put
                                        it in frontend
                                        JavaScript.
                                    </p>
                                </div>

                                {/* Supported events */}
                                <div>
                                    <h3 className="text-sm font-medium">
                                        Supported events
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            "purchase",
                                            "signup",
                                            "review",
                                            "custom",
                                        ].map(
                                            (event) => (
                                                <code
                                                    key={
                                                        event
                                                    }
                                                    className="rounded-md border bg-muted px-2.5 py-1.5 text-xs"
                                                >
                                                    {event}
                                                </code>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Example */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-sm font-medium">
                                            Example request
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCopy(
                                                    `curl -X POST "${webhookUrl}" \\\n  -H "Authorization: Bearer ${selectedWebsite.webhook_secret}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "type": "purchase",\n    "data": {\n      "name": "{{CUSTOMER_NAME}}",\n      "product": "{{PRODUCT_NAME}}"\n    }\n  }'`,
                                                    "curl"
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            {copied === "curl" ? (
                                                <>
                                                    <Check className="size-3.5" />
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

                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-6">
                                        <code>
                                            {`curl -X POST "${webhookUrl}" \\
  -H "Authorization: Bearer ${selectedWebsite.webhook_secret}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "purchase",
    "data": {
      "name": "{{CUSTOMER_NAME}}",
      "product": "{{PRODUCT_NAME}}"
    }
  }'`}
                                        </code>
                                    </pre>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Replace the placeholders with values from your own
                                        backend, such as the customer name and product name.
                                    </p>
                                </div>

                                {/* Documentation note */}
                                <div className="rounded-lg border border-dashed p-4">
                                    <div className="flex gap-3">
                                        <Code2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Server-side integration
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Send the webhook from your backend after the
                                                purchase or other action has successfully
                                                completed. The{" "}
                                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                                    {"{{...}}"}
                                                </code>{" "}
                                                values above are documentation placeholders only.
                                                Replace them with your actual data before sending
                                                the request. Never expose the webhook secret in
                                                browser-side JavaScript.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documentation note */}
                                <div className="rounded-lg border border-dashed p-4">
                                    <div className="flex gap-3">
                                        <Code2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Server-side integration
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Send events from
                                                your backend after
                                                the action has
                                                successfully
                                                completed. Do not
                                                send the webhook
                                                secret from the
                                                browser.
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
        <div className="rounded-xl border bg-card">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-lg border bg-muted">
                        {icon}
                    </div>

                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Coming soon
                    </span>
                </div>

                <div className="mt-5">
                    <h2 className="font-semibold">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>

                <button
                    type="button"
                    disabled
                    className="mt-5 inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium opacity-50"
                >
                    Connect
                </button>
            </div>
        </div>
    );
}