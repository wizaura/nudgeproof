"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type UsageResponse = {
    plan?: { slug?: string; name?: string };
    subscription?: { plan?: string; status?: string } | null;
};

export default function BillingSuccessStatus({
    initialPlan,
    initialPlanName,
    requestedPlan,
    subscriptionId,
    paymentId,
    isActive: initiallyActive,
}: {
    initialPlan: string | null;
    initialPlanName: string;
    requestedPlan: string | null;
    subscriptionId: string | null;
    paymentId: string | null;
    isActive: boolean;
}) {
    const [isActive, setIsActive] = useState(initiallyActive);
    const [planName, setPlanName] = useState(initialPlanName);
    const [checking, setChecking] = useState(!initiallyActive);

    useEffect(() => {
        if (initiallyActive) return;

        let cancelled = false;
        let attempts = 0;
        const maxAttempts = 30;
        let didVerifyWithProvider = false;

        async function checkStatus() {
            if (!didVerifyWithProvider && subscriptionId) {
                didVerifyWithProvider = true;
                try {
                    const syncResponse = await fetch("/api/billing/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            subscription_id: subscriptionId,
                            payment_id: paymentId,
                        }),
                        cache: "no-store",
                    });
                    const synced = await syncResponse.json();

                    if (
                        !cancelled &&
                        syncResponse.ok &&
                        synced.synced &&
                        (!requestedPlan || synced.plan === requestedPlan)
                    ) {
                        window.location.reload();
                        return;
                    }
                } catch {
                    // The regular status check below can still see a webhook sync.
                }
            }

            try {
                const response = await fetch("/api/billing/usage", {
                    cache: "no-store",
                });
                const data = (await response.json()) as UsageResponse;
                const planMatches = !requestedPlan || data.plan?.slug === requestedPlan;
                const active = response.ok && data.subscription?.status === "active" && planMatches;

                if (!cancelled && active) {
                    setIsActive(true);
                    setPlanName(data.plan?.name ?? initialPlanName);
                    setChecking(false);
                    // Re-render the server snapshot so the plan and status
                    // summary below reflect the committed subscription row.
                    window.location.reload();
                    return;
                }
            } catch {
                // Keep checking; this page can open before the app API is ready.
            }

            attempts += 1;
            if (!cancelled && attempts < maxAttempts) {
                window.setTimeout(checkStatus, 2000);
            } else if (!cancelled) {
                setChecking(false);
            }
        }

        void checkStatus();
        return () => {
            cancelled = true;
        };
    }, [initialPlanName, initiallyActive, requestedPlan, subscriptionId, paymentId]);

    if (isActive) {
        return (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">
                Your {planName} subscription is active. You can now enjoy your upgraded NudgeProof plan.
            </p>
        );
    }

    return (
        <div aria-live="polite">
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">
                {checking
                    ? "Payment received. We're waiting for Dodo Payments to confirm your plan. This usually takes a few moments."
                    : `We haven't received confirmation for ${requestedPlan ?? initialPlan ?? "your plan"} yet. Your account will update automatically when the payment notification arrives.`}
            </p>
            {checking && (
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Loader2 className="size-4 animate-spin" />
                    Checking subscription status
                </div>
            )}
        </div>
    );
}
