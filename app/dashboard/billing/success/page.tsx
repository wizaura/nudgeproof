import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BillingSuccessStatus from "@/components/dashboard/billing/success-status";
import { subscriptionPlanToPlanSlug } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    subscription_id?: string;
    payment_id?: string;
    status?: string;
    email?: string;
    plan?: string;
  }>;
};

export default async function BillingSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subscription: {
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null = null;

  let planName = "Your selected plan";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.account_id) {
      let query = supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("account_id", profile.account_id)
        .eq("provider", "dodo")
        .order("updated_at", { ascending: false })
        .limit(1);

      if (params.subscription_id) {
        query = query.eq(
          "provider_subscription_id",
          params.subscription_id
        );
      }

      const { data } = await query.maybeSingle();

      if (data) {
        const planSlug = subscriptionPlanToPlanSlug(data.plan) ?? data.plan;
        subscription = { ...data, plan: planSlug };

        const { data: plan } = await supabase
          .from("plans")
          .select("name")
          .eq("slug", planSlug)
          .maybeSingle();

        if (plan?.name) {
          planName = plan.name;
        } else {
          planName =
            data.plan.charAt(0).toUpperCase() + data.plan.slice(1);
        }
      }
    }
  }

  const isActive =
    subscription?.status === "active" &&
    (!params.plan || subscription.plan === params.plan);

  return (
    <main className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#111] sm:p-10">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
          }`}
        >
          {isActive ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-8 w-8"
            >
              <path
                d="m5 12 4 4L19 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-8 w-8"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 8v4m0 4h.01"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-gray-500">
          NudgeProof Billing
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {isActive ? "You're all set!" : "Confirming your subscription"}
        </h1>

        <BillingSuccessStatus
          initialPlan={subscription?.plan ?? null}
          initialPlanName={planName}
          requestedPlan={params.plan ?? null}
          subscriptionId={params.subscription_id ?? null}
          paymentId={params.payment_id ?? null}
          isActive={isActive}
        />

        <div className="my-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-sm text-gray-500">Plan</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {isActive ? planName : "Awaiting confirmation"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-sm text-gray-500">Status</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
              }`}
            >
              {isActive ? "Active" : "Pending confirmation"}
            </span>
          </div>

          {subscription?.current_period_end && (
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="text-sm text-gray-500">
                Current period ends
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(
                  subscription.current_period_end
                ).toLocaleDateString("en", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {params.payment_id && (
          <p className="mb-6 break-all text-xs text-gray-400">
            Payment reference: {params.payment_id}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/dashboard/billing"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Manage Billing
          </Link>

          {!isActive && (
            <Link
              href={`/dashboard/billing/success?${new URLSearchParams({
                ...(params.subscription_id && { subscription_id: params.subscription_id }),
                ...(params.payment_id && { payment_id: params.payment_id }),
                ...(params.status && { status: params.status }),
                ...(params.email && { email: params.email }),
                ...(params.plan && { plan: params.plan }),
              }).toString()}`}
              className="mt-1 text-sm text-gray-500 underline underline-offset-4 hover:text-gray-900 dark:hover:text-white"
            >
              Check subscription status again
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
