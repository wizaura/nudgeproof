import Link from "next/link";
import { ArrowRight, Check, HelpCircle, Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_impressions: number;
  analytics_days: number;
  remove_branding: boolean;
  priority_support: boolean;
};

const faqs = [
  {
    question: "Can I start without paying?",
    answer: "Yes. Start with the free plan, connect a website, and explore NudgeProof before choosing a paid plan.",
  },
  {
    question: "What counts as an impression?",
    answer: "An impression is counted when a social proof widget is displayed on your website. You can check usage in your dashboard.",
  },
  {
    question: "Can I change or cancel my plan?",
    answer: "Yes. Manage your subscription in Billing. Paid plans renew monthly; downgrades and cancellation take effect at the end of the current billing period.",
  },
  {
    question: "Are the listed prices monthly?",
    answer: "Yes. Paid plans are billed monthly. Dodo Payments shows the final amount and payment details before you confirm checkout.",
  },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("plans")
      .select("id, name, slug, price_monthly, max_impressions, analytics_days, remove_branding, priority_support")
      .order("price_monthly", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Plan[];
  } catch (error) {
    console.error("Unable to load public pricing plans:", error);
    return [];
  }
}

export default async function PricingMain() {
  const supabase = await createClient();
  const [
    { data: { user } },
    plans,
  ] = await Promise.all([supabase.auth.getUser(), getPlans()]);
  const isLoggedIn = Boolean(user);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NudgeProof",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://nudgeproof.com/pricing",
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: (plan.price_monthly / 100).toFixed(2),
      priceCurrency: "USD",
      url: "https://nudgeproof.com/pricing",
      category: "Subscription",
    })),
  };

  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="relative isolate overflow-hidden px-5 pb-14 pt-28 text-center sm:px-8 sm:pb-20 sm:pt-36">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_10%,#eef7db_0%,white_62%)]" />
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/80 px-4 py-2 text-sm font-medium text-neutral-600">
          <Sparkles className="h-4 w-4 text-blue-700" /> Simple, transparent pricing
        </span>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-medium tracking-[-.07em] sm:text-7xl">
          A plan for every stage of your growth.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
          Start free, see what works, and move up when you need more room. Compare the monthly limits and features below.
        </p>
      </section>

      <section aria-label="NudgeProof plans" className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {plans.length ? plans.map((plan) => {
            const featured = plan.slug === "plus";
            const features = [
              `${plan.max_impressions.toLocaleString()} widget impressions / month`,
              `${plan.analytics_days.toLocaleString()} days of analytics history`,
              plan.remove_branding ? "Remove NudgeProof branding" : "NudgeProof branding included",
              plan.priority_support ? "Priority support" : "Standard support",
            ];

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-[1.8rem] border p-7 sm:p-8 ${featured ? "border-[#141414] bg-[#141414] text-white shadow-[0_24px_70px_rgba(0,0,0,.16)] md:-translate-y-3" : "border-black/[0.08] bg-white"}`}
              >
                {featured && <span className="absolute right-6 top-6 rounded-full bg-[#d9f467] px-3 py-1 text-xs font-bold text-black">Most popular</span>}
                <p className={`text-sm font-semibold ${featured ? "text-white/65" : "text-neutral-500"}`}>
                  {plan.slug === "free" ? "A simple place to begin" : plan.slug === "plus" ? "For growing websites" : "For higher activity"}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-.05em]">{plan.name}</h2>
                <p className={`mt-5 flex items-baseline gap-2 ${featured ? "text-white" : "text-black"}`}>
                  <span className="text-5xl font-medium tracking-[-.07em]">{formatPrice(plan.price_monthly)}</span>
                  {plan.price_monthly > 0 && <span className={featured ? "text-white/60" : "text-neutral-500"}>/ month</span>}
                </p>
                <p className={`mt-3 min-h-12 text-sm leading-6 ${featured ? "text-white/65" : "text-neutral-600"}`}>
                  {plan.slug === "free" ? "Explore social proof and get your first widget live." : `More capacity and tools for your ${plan.slug === "plus" ? "growing" : "established"} website.`}
                </p>
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${featured ? "bg-[#d9f467] text-black hover:bg-[#e5ff7a]" : "bg-[#141414] text-white hover:bg-[#303030]"}`}
                >
                  {isLoggedIn ? "Go to Dashboard" : plan.slug === "free" ? "Start for free" : `Choose ${plan.name}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className={`my-7 h-px ${featured ? "bg-white/15" : "bg-black/[0.08]"}`} />
                <p className={`mb-4 text-xs font-bold uppercase tracking-[.16em] ${featured ? "text-white/55" : "text-neutral-500"}`}>Plan includes</p>
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${featured ? "text-white/85" : "text-neutral-700"}`}>
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-[#d9f467]" : "text-emerald-600"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            );
          }) : (
            <div className="col-span-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900">
              Pricing is temporarily unavailable. Please try again shortly or contact <a className="font-semibold underline" href="mailto:hello@nudgeproof.com">hello@nudgeproof.com</a>.
            </div>
          )}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-neutral-500">
          Paid plans renew monthly. You can review usage, change plans, or schedule cancellation from your dashboard.
        </p>
      </section>

      <section className="bg-[#f8f8f5] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <HelpCircle className="mx-auto h-7 w-7 text-blue-700" />
            <h2 className="mt-4 text-4xl font-medium tracking-[-.06em]">Pricing, without the fine-print hunt.</h2>
            <p className="mt-4 text-base leading-7 text-neutral-600">A few quick answers about choosing a NudgeProof plan.</p>
          </div>
          <div className="mt-9 space-y-3">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-black/[0.07] bg-white p-5 open:shadow-sm sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  {question}<span className="text-2xl font-normal text-neutral-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-7 text-neutral-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="text-3xl font-medium tracking-[-.05em] sm:text-4xl">Need help choosing?</h2>
        <p className="mt-3 text-base text-neutral-600">Tell us what you’re building and we’ll point you in the right direction.</p>
        <a href="mailto:hello@nudgeproof.com" className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 font-semibold transition hover:bg-neutral-50">
          Contact us <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </main>
  );
}
