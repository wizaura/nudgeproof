"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Check,
    Globe,
    Loader2,
    Megaphone,
    ShoppingBag,
    Sparkles,
    Star,
    Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Website = { id: string; name: string; url: string };
type WidgetType = "recent_sales" | "live_visitors" | "review" | "announcement";

const widgetTypes: {
    type: WidgetType;
    name: string;
    description: string;
    icon: typeof ShoppingBag;
}[] = [
    {
        type: "recent_sales",
        name: "Recent sales",
        description: "Show recent purchases and customer activity.",
        icon: ShoppingBag,
    },
    {
        type: "live_visitors",
        name: "Live visitors",
        description: "Show how many people are browsing your site.",
        icon: Users,
    },
    {
        type: "review",
        name: "Reviews",
        description: "Display customer reviews and ratings.",
        icon: Star,
    },
    {
        type: "announcement",
        name: "Announcements",
        description: "Share an update, offer, or promotion.",
        icon: Megaphone,
    },
];

export default function GettingStarted({
    initialWebsites,
}: {
    initialWebsites: Website[];
}) {
    const router = useRouter();
    const [websites, setWebsites] = useState(initialWebsites);
    const [step, setStep] = useState<1 | 2>(initialWebsites.length ? 2 : 1);
    const [websiteName, setWebsiteName] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [selectedWebsite, setSelectedWebsite] = useState(initialWebsites[0]?.id ?? "");
    const [widgetName, setWidgetName] = useState("Recent activity");
    const [widgetType, setWidgetType] = useState<WidgetType>("recent_sales");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function createWebsite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/websites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: websiteName, url: websiteUrl }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "We couldn't add that website. Please try again.");
                return;
            }

            const website: Website = {
                id: data.website.id,
                name: data.website.name,
                url: data.website.url,
            };
            setWebsites((current) => [website, ...current]);
            setSelectedWebsite(website.id);
            setStep(2);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function createWidget(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/widgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: widgetName.trim(),
                    website_id: selectedWebsite,
                    type: widgetType,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "We couldn't create your widget. Please try again.");
                return;
            }

            await finishOnboarding();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function finishOnboarding() {
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
            data: { onboarding_completed: true },
        });

        if (updateError) {
            setError("Your setup is saved, but we couldn't save this step. Please try again.");
            setLoading(false);
            return;
        }

        router.replace("/dashboard");
        router.refresh();
    }

    return (
        <main className="mx-auto max-w-5xl py-4 sm:py-8">
            <div className="overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                    <aside className="relative overflow-hidden bg-slate-950 px-7 py-9 text-white sm:px-10 sm:py-12">
                        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-500/25 blur-3xl" />
                        <div className="relative">
                            <div className="mb-10 flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                                <Sparkles className="size-6 text-blue-300" />
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                                Your quick start
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                Let’s get your social proof working.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-slate-300">
                                Follow two simple steps to connect your site and add your first NudgeProof widget.
                            </p>

                            <div className="mt-10 space-y-4">
                                <StepMarker number="1" label="Add your website" active={step === 1} complete={step === 2} />
                                <div className="ml-5 h-6 border-l border-white/20" />
                                <StepMarker number="2" label="Create your first widget" active={step === 2} complete={false} />
                            </div>

                            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-400/15 text-blue-200">
                                        <Globe className="size-5" />
                                    </div>
                                    <p className="text-sm leading-6 text-slate-200">
                                        You can customize your widget and install it on your site whenever you’re ready.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="px-6 py-8 sm:px-10 sm:py-12">
                        {step === 1 ? (
                            <form onSubmit={createWebsite} className="mx-auto max-w-xl">
                                <p className="text-sm font-semibold text-primary">STEP 1 OF 2</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Add your website
                                </h2>
                                <p className="mt-3 text-base leading-7 text-muted-foreground">
                                    Tell us where you want to show social proof. You can add more websites later.
                                </p>

                                <div className="mt-8 space-y-5">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-semibold">Website name</span>
                                        <input
                                            value={websiteName}
                                            onChange={(event) => setWebsiteName(event.target.value)}
                                            placeholder="My online store"
                                            required
                                            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-semibold">Website URL</span>
                                        <input
                                            type="url"
                                            value={websiteUrl}
                                            onChange={(event) => setWebsiteUrl(event.target.value)}
                                            placeholder="https://example.com"
                                            required
                                            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                        <span className="block text-sm leading-6 text-muted-foreground">
                                            Include https:// at the start of your address.
                                        </span>
                                    </label>
                                </div>

                                {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
                                >
                                    {loading ? <Loader2 className="size-5 animate-spin" /> : <>Continue <ArrowRight className="size-5" /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={createWidget} className="mx-auto max-w-xl">
                                <p className="text-sm font-semibold text-primary">STEP 2 OF 2</p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Create your first widget
                                </h2>
                                <p className="mt-3 text-base leading-7 text-muted-foreground">
                                    Choose the kind of activity you want visitors to see. You can edit the design later.
                                </p>

                                <fieldset className="mt-7">
                                    <legend className="mb-3 text-sm font-semibold">Choose a widget</legend>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {widgetTypes.map(({ type, name, description, icon: Icon }) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setWidgetType(type)}
                                                aria-pressed={widgetType === type}
                                                className={`rounded-2xl border p-4 text-left transition ${widgetType === type ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${widgetType === type ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                                        <Icon className="size-5" />
                                                    </span>
                                                    <span className="text-base font-semibold">{name}</span>
                                                </div>
                                                <span className="mt-3 block text-sm leading-6 text-muted-foreground">{description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <label className="block space-y-2">
                                        <span className="text-sm font-semibold">Widget name</span>
                                        <input
                                            value={widgetName}
                                            onChange={(event) => setWidgetName(event.target.value)}
                                            required
                                            maxLength={100}
                                            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-sm font-semibold">Add it to</span>
                                        <select
                                            value={selectedWebsite}
                                            onChange={(event) => setSelectedWebsite(event.target.value)}
                                            required
                                            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        >
                                            {websites.map((website) => (
                                                <option key={website.id} value={website.id}>{website.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

                                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {websites.length > 0 && initialWebsites.length === 0 ? (
                                        <button type="button" onClick={() => setStep(1)} className="h-12 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                                            Back
                                        </button>
                                    ) : <span />}
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedWebsite}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
                                    >
                                        {loading ? <Loader2 className="size-5 animate-spin" /> : <>Create my widget <ArrowRight className="size-5" /></>}
                                    </button>
                                </div>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={finishOnboarding}
                            disabled={loading}
                            className="mx-auto mt-8 block text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline sm:mx-0"
                        >
                            I’ll do this later
                        </button>
                    </section>
                </div>
            </div>
        </main>
    );
}

function StepMarker({
    number,
    label,
    active,
    complete,
}: {
    number: string;
    label: string;
    active: boolean;
    complete: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-full border text-sm font-semibold ${complete ? "border-emerald-300 bg-emerald-400 text-slate-950" : active ? "border-white bg-white text-slate-950" : "border-white/25 bg-white/5 text-white/60"}`}>
                {complete ? <Check className="size-5" /> : number}
            </span>
            <span className={`text-base font-medium ${active || complete ? "text-white" : "text-white/50"}`}>{label}</span>
        </div>
    );
}
