"use client";

import { useEffect, useState } from "react";
import {
    Check,
    CreditCard,
    Gauge,
    Infinity,
    Loader2,
    Sparkles,
    Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

type Plan = {
    id: string;
    name: string;
    slug: "free" | "plus" | "pro";
    price_monthly: number;
    max_impressions: number;
    analytics_days: number;
    remove_branding: boolean;
    priority_support: boolean;
};

function getPlanFeatures(plan: Plan) {
    return [
        "Unlimited websites",
        "Unlimited widgets",
        `${plan.max_impressions.toLocaleString()} impressions / month`,
        plan.analytics_days >= 365
            ? "1 year analytics history"
            : `${plan.analytics_days} days analytics history`,
        "Custom events",
        plan.remove_branding
            ? "Remove NudgeProof branding"
            : "NudgeProof branding",
        plan.priority_support ? "Priority support" : "Standard support",
    ];
}

function getPlanIcon(slug: Plan["slug"]) {
    if (slug === "free") {
        return <Sparkles className="size-[18px]" />;
    }

    if (slug === "plus") {
        return <Zap className="size-[18px]" />;
    }

    return <Gauge className="size-[18px]" />;
}

export default function Billing() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    // Temporary until account_subscriptions is connected.
    const [currentPlan] = useState<Plan["slug"]>("free");

    // Temporary until account_usage is connected.
    const impressionsUsed = 0;

    useEffect(() => {
        async function loadPlans() {
            try {
                const response = await fetch("/api/billing/plans", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to load billing plans"
                    );
                }

                setPlans(data.plans ?? []);
            } catch (error) {
                console.error("Failed to load billing plans:", error);
            } finally {
                setPlansLoading(false);
            }
        }

        loadPlans();
    }, []);

    const current = plans.find((plan) => plan.slug === currentPlan);

    const usagePercentage = current
        ? Math.min(
              (impressionsUsed / current.max_impressions) * 100,
              100
          )
        : 0;

    async function handleUpgrade(plan: "plus" | "pro") {
        try {
            setLoadingPlan(plan);

            const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to start checkout"
                );
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
            }

            throw new Error("Checkout URL was not returned");
        } catch (error) {
            console.error("Checkout error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoadingPlan(null);
        }
    }

    if (plansLoading) {
        return (
            <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/[0.04]">
                <div className="mx-auto max-w-[1180px] px-5 py-7 lg:px-8">
                    <PageHeader
                        title="Billing"
                        description="Manage your NudgeProof plan, usage and subscription."
                    />

                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading plans...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!plans.length) {
        return (
            <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/[0.04]">
                <div className="mx-auto max-w-[1180px] px-5 py-7 lg:px-8">
                    <PageHeader
                        title="Billing"
                        description="Manage your NudgeProof plan, usage and subscription."
                    />

                    <div className="rounded-2xl border border-border/60 bg-background/80 p-8 text-center shadow-sm">
                        <p className="text-sm font-medium">
                            No billing plans available
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Please try again later.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <div className="mx-auto max-w-[1180px] px-5 py-7 lg:px-8">
                <PageHeader
                    title="Billing"
                    description="Manage your NudgeProof plan, usage and subscription."
                />

                {/* Current plan + usage */}
                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* Current plan */}
                    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
                        <div className="flex items-start justify-between gap-5 border-b border-border/60 px-6 py-5">
                            <div className="flex items-start gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Sparkles className="size-5" />
                                </div>

                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Current plan
                                        </span>

                                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                            Active
                                        </span>
                                    </div>

                                    <h2 className="text-[22px] font-semibold tracking-[-0.03em]">
                                        {current?.name ?? "Free"}
                                    </h2>

                                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                                        {current
                                            ? "Your current NudgeProof subscription."
                                            : "Get started with NudgeProof."}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[25px] font-semibold tracking-[-0.04em]">
                                    $
                                    {current
                                        ? current.price_monthly / 100
                                        : 0}
                                </div>

                                {current && current.price_monthly > 0 && (
                                    <div className="text-[11px] text-muted-foreground">
                                        / month
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
                            {/* Impressions */}
                            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Gauge className="size-4 text-primary" />

                                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Monthly impressions
                                    </span>
                                </div>

                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <span className="text-[23px] font-semibold tracking-[-0.035em]">
                                            {impressionsUsed.toLocaleString()}
                                        </span>

                                        <span className="ml-1 text-[12px] text-muted-foreground">
                                            /{" "}
                                            {current
                                                ? current.max_impressions.toLocaleString()
                                                : "0"}
                                        </span>
                                    </div>

                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        {Math.round(usagePercentage)}%
                                    </span>
                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: `${usagePercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Websites */}
                            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Infinity className="size-4 text-primary" />

                                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Websites
                                    </span>
                                </div>

                                <div className="text-[23px] font-semibold tracking-[-0.035em]">
                                    Unlimited
                                </div>

                                <p className="mt-1 text-[12px] text-muted-foreground">
                                    No limit on connected websites.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Billing details */}
                    <section className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CreditCard className="size-[18px]" />
                            </div>

                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    Subscription
                                </div>

                                <h2 className="mt-0.5 text-[18px] font-semibold tracking-[-0.025em]">
                                    Billing details
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <span className="text-[13px] text-muted-foreground">
                                    Plan
                                </span>

                                <span className="text-[13px] font-medium">
                                    {current?.name ?? "Free"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <span className="text-[13px] text-muted-foreground">
                                    Billing cycle
                                </span>

                                <span className="text-[13px] font-medium">
                                    {!current || current.price_monthly === 0
                                        ? "No charge"
                                        : "Monthly"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-muted-foreground">
                                    Payment provider
                                </span>

                                <span className="text-[13px] font-medium">
                                    Dodo Payments
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Plans */}
                <section className="mt-10">
                    <div className="mb-5">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />

                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Plans
                            </span>
                        </div>

                        <h2 className="text-[22px] font-semibold tracking-[-0.035em]">
                            Choose the right plan
                        </h2>

                        <p className="mt-1.5 text-[13px] text-muted-foreground">
                            Upgrade when you need more impressions or longer
                            analytics history.
                        </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isCurrent =
                                plan.slug === currentPlan;

                            const isPaid =
                                plan.slug === "plus" ||
                                plan.slug === "pro";

                            const features = getPlanFeatures(plan);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col overflow-hidden rounded-2xl border bg-background/80 shadow-sm backdrop-blur transition-all ${
                                        plan.slug === "plus"
                                            ? "border-primary/40 shadow-primary/5"
                                            : "border-border/60"
                                    }`}
                                >
                                    {/* Popular */}
                                    {plan.slug === "plus" && (
                                        <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                                            Most popular
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            {getPlanIcon(plan.slug)}
                                        </div>

                                        <h3 className="text-[19px] font-semibold tracking-[-0.025em]">
                                            {plan.name}
                                        </h3>

                                        <p className="mt-1.5 min-h-[40px] text-[12px] leading-5 text-muted-foreground">
                                            {plan.slug === "free"
                                                ? "Everything you need to get started with social proof."
                                                : plan.slug === "plus"
                                                  ? "More impressions and longer analytics for growing websites."
                                                  : "Higher limits and advanced support for serious growth."}
                                        </p>

                                        <div className="mt-5 flex items-baseline gap-1">
                                            <span className="text-[32px] font-semibold tracking-[-0.05em]">
                                                $
                                                {plan.price_monthly / 100}
                                            </span>

                                            {plan.price_monthly > 0 && (
                                                <span className="text-[12px] text-muted-foreground">
                                                    / month
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                isCurrent ||
                                                loadingPlan !== null
                                            }
                                            onClick={() => {
                                                if (isPaid) {
                                                    handleUpgrade(
                                                        plan.slug
                                                    );
                                                }
                                            }}
                                            className={`mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[12px] font-semibold transition-all ${
                                                isCurrent
                                                    ? "cursor-default bg-muted text-muted-foreground"
                                                    : plan.slug === "plus"
                                                      ? "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                                                      : "border border-border/70 bg-background hover:bg-muted"
                                            }`}
                                        >
                                            {loadingPlan === plan.slug ? (
                                                <>
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                    Opening checkout...
                                                </>
                                            ) : isCurrent ? (
                                                "Current plan"
                                            ) : (
                                                `Upgrade to ${plan.name}`
                                            )}
                                        </button>
                                    </div>

                                    {/* Features */}
                                    <div className="border-t border-border/50 px-6 py-5">
                                        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Includes
                                        </div>

                                        <ul className="space-y-2.5">
                                            {features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-2.5 text-[12px] text-muted-foreground"
                                                >
                                                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <Check className="size-2.5" />
                                                    </span>

                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Secure billing */}
                <div className="mt-6 rounded-xl border border-border/50 bg-background/60 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CreditCard className="size-3.5" />
                        </div>

                        <div>
                            <p className="text-[12px] font-medium">
                                Secure billing
                            </p>

                            <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                                Payments and subscription management are
                                securely handled by Dodo Payments. You can
                                upgrade or manage your plan at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}