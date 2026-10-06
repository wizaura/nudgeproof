"use client";

import { useState } from "react";
import {
    AlertTriangle,
    Bell,
    Check,
    ChevronRight,
    Code2,
    Copy,
    KeyRound,
    Lock,
    Mail,
    RefreshCw,
    Save,
    Shield,
    User,
} from "lucide-react";

type SettingsProps = {
    user: {
        id: string;
        email: string;
        name: string;
    };
};

export default function Settings({ user }: SettingsProps) {
    const [name, setName] = useState(user.name);
    const [email] = useState(user.email);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [notifications, setNotifications] = useState({
        integrationErrors: true,
        widgetErrors: true,
        weeklySummary: false,
        productUpdates: false,
    });

    const [apiKey, setApiKey] = useState(
        "np_live_xxxxxxxxxxxxxxxxxxxxxxxxx"
    );

    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    async function handleSaveProfile() {
        setSaving(true);
        setSaved(false);

        // Connect this to your profile update API/Supabase mutation.
        await new Promise((resolve) =>
            setTimeout(resolve, 700)
        );

        setSaving(false);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    }

    async function copyApiKey() {
        await navigator.clipboard.writeText(apiKey);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    async function regenerateApiKey() {
        const confirmed = window.confirm(
            "Regenerating your API key will invalidate the current key. Continue?"
        );

        if (!confirmed) return;

        setRegenerating(true);

        // Replace this with your API key regeneration endpoint.
        await new Promise((resolve) =>
            setTimeout(resolve, 700)
        );

        const randomPart = Array.from(
            crypto.getRandomValues(new Uint8Array(18))
        )
            .map((value) =>
                value.toString(16).padStart(2, "0")
            )
            .join("");

        setApiKey(`np_live_${randomPart}`);
        setRegenerating(false);
    }

    function toggleNotification(
        key: keyof typeof notifications
    ) {
        setNotifications((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/[0.04]">
            <div className="mx-auto max-w-5xl space-y-7">
                {/* Header */}
                <div>
                    <div className="mb-2.5 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Account
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.035em] sm:text-[30px]">
                                Settings
                            </h1>

                            <p className="mt-2.5 max-w-2xl text-[13px] leading-5 text-muted-foreground">
                                Manage your account, notifications,
                                security and developer settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <SectionHeader
                        icon={User}
                        title="Account"
                        description="Your personal account information."
                    />

                    <div className="space-y-5 p-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Full name"
                                description="The name shown across your account."
                            >
                                <input
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="Your name"
                                />
                            </Field>

                            <Field
                                label="Email address"
                                description="Used for account and security notifications."
                            >
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

                                    <input
                                        value={email}
                                        disabled
                                        className={`${inputClass} cursor-not-allowed pl-9 opacity-60`}
                                    />
                                </div>
                            </Field>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/50 pt-5">
                            <div>
                                <p className="text-[11px] text-muted-foreground">
                                    Changes are saved to your NudgeProof
                                    account.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saved ? (
                                    <>
                                        <Check className="size-3.5" />
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-3.5" />
                                        {saving
                                            ? "Saving..."
                                            : "Save changes"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <SectionHeader
                        icon={Shield}
                        title="Security"
                        description="Manage your password and account access."
                    />

                    <div className="divide-y divide-border/50">
                        <SettingsRow
                            icon={Lock}
                            title="Password"
                            description="Change the password used to access your account."
                            action={
                                <button
                                    type="button"
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.03]"
                                >
                                    Change password
                                    <ChevronRight className="size-3.5 text-muted-foreground" />
                                </button>
                            }
                        />

                        <SettingsRow
                            icon={KeyRound}
                            title="Active sessions"
                            description="Sign out of your account on other devices."
                            action={
                                <button
                                    type="button"
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.03]"
                                >
                                    Sign out all
                                    <ChevronRight className="size-3.5 text-muted-foreground" />
                                </button>
                            }
                        />
                    </div>
                </section>

                {/* Notifications */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <SectionHeader
                        icon={Bell}
                        title="Notifications"
                        description="Choose what NudgeProof can notify you about."
                    />

                    <div className="divide-y divide-border/50">
                        <NotificationRow
                            title="Integration errors"
                            description="Get notified when an integration stops working."
                            enabled={
                                notifications.integrationErrors
                            }
                            onChange={() =>
                                toggleNotification(
                                    "integrationErrors"
                                )
                            }
                        />

                        <NotificationRow
                            title="Widget errors"
                            description="Get notified when a widget encounters an issue."
                            enabled={
                                notifications.widgetErrors
                            }
                            onChange={() =>
                                toggleNotification(
                                    "widgetErrors"
                                )
                            }
                        />

                        <NotificationRow
                            title="Weekly activity summary"
                            description="Receive a weekly overview of your NudgeProof activity."
                            enabled={
                                notifications.weeklySummary
                            }
                            onChange={() =>
                                toggleNotification(
                                    "weeklySummary"
                                )
                            }
                        />

                        <NotificationRow
                            title="Product updates"
                            description="Receive occasional updates about new NudgeProof features."
                            enabled={
                                notifications.productUpdates
                            }
                            onChange={() =>
                                toggleNotification(
                                    "productUpdates"
                                )
                            }
                        />
                    </div>
                </section>

                {/* Developer */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm">
                    <SectionHeader
                        icon={Code2}
                        title="Developer"
                        description="Manage API access and webhook configuration."
                    />

                    <div className="space-y-6 p-6">
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold">
                                        API key
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        Use this key to authenticate
                                        requests to the NudgeProof API.
                                    </p>
                                </div>

                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-primary">
                                    Live
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="flex h-10 min-w-0 flex-1 items-center rounded-xl border border-border/60 bg-muted/30 px-3">
                                    <code className="truncate text-[11px] text-muted-foreground">
                                        {apiKey}
                                    </code>
                                </div>

                                <button
                                    type="button"
                                    onClick={copyApiKey}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.03]"
                                >
                                    {copied ? (
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

                                <button
                                    type="button"
                                    onClick={regenerateApiKey}
                                    disabled={regenerating}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold transition hover:border-primary/30 hover:bg-primary/[0.03] disabled:opacity-60"
                                >
                                    <RefreshCw
                                        className={`size-3.5 ${
                                            regenerating
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />

                                    {regenerating
                                        ? "Regenerating..."
                                        : "Regenerate"}
                                </button>
                            </div>

                            <p className="mt-2 text-[10px] text-muted-foreground">
                                Keep your API key private. Never expose it
                                in client-side code.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Code2 className="size-3.5" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold">
                                        API & webhook documentation
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                        Connect your application to
                                        NudgeProof using the API or
                                        Custom Webhook integration.
                                    </p>

                                    <a
                                        href="/dashboard/integrations"
                                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                                    >
                                        View integrations
                                        <ChevronRight className="size-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="overflow-hidden rounded-2xl border border-destructive/20 bg-background/80 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start gap-3 border-b border-destructive/10 px-6 py-5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                            <AlertTriangle className="size-4" />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">
                                Danger zone
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                These actions can permanently affect your
                                account and data.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold">
                                Delete account
                            </p>

                            <p className="mt-1 max-w-xl text-[10px] leading-5 text-muted-foreground">
                                Permanently delete your NudgeProof
                                account, websites, widgets and associated
                                data.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                window.alert(
                                    "Account deletion should be connected to your secure account deletion flow."
                                );
                            }}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-destructive/30 px-4 text-xs font-semibold text-destructive transition hover:bg-destructive/5"
                        >
                            Delete account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

const inputClass =
    "h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-xs outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10";

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof User;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border/60 px-6 py-5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>

            <div>
                <h2 className="text-sm font-semibold">
                    {title}
                </h2>

                <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Field({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-semibold">
                {label}
            </label>

            <p className="mb-2 mt-0.5 text-[10px] text-muted-foreground">
                {description}
            </p>

            {children}
        </div>
    );
}

function SettingsRow({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof Lock;
    title: string;
    description: string;
    action: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                </div>

                <div>
                    <p className="text-xs font-semibold">
                        {title}
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            {action}
        </div>
    );
}

function NotificationRow({
    title,
    description,
    enabled,
    onChange,
}: {
    title: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 px-6 py-4">
            <div>
                <p className="text-xs font-semibold">
                    {title}
                </p>

                <p className="mt-0.5 text-[10px] leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={onChange}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    enabled
                        ? "bg-primary"
                        : "bg-muted"
                }`}
            >
                <span
                    className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${
                        enabled
                            ? "left-[18px]"
                            : "left-0.5"
                    }`}
                />
            </button>
        </div>
    );
}