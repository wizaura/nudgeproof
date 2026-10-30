import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Code2, MousePointer2, Sparkles } from "lucide-react";

const faqs = [
  { q: "What is NudgeProof?", a: "NudgeProof displays recent customer activity on your website as social proof notifications, giving visitors useful context as they decide what to do." },
  { q: "How do I add it to my website?", a: "Add your website in NudgeProof, choose a widget, and install the script snippet. You can preview and manage it from your dashboard." },
  { q: "Do I need to know how to code?", a: "No. Copy the installation snippet into your website. You can also connect activity through supported integrations or the event API." },
  { q: "Can I control what visitors see?", a: "Yes. Choose the widget style and configure its content and display behavior. Only use activity you have permission to show and that accurately represents real events." },
  { q: "Does NudgeProof guarantee better SEO or AI search rankings?", a: "No. NudgeProof displays social proof. It does not promise higher search rankings or AI citations." },
];

export function UseCasesSection() {
  const uses = [
    {
      emoji: "🛒",
      title: "Online stores",
      text: "Highlight recent purchases and product activity to help shoppers feel confident about buying.",
      tag: "E-COMMERCE",
      bg: "bg-[#e8f3ff]",
      iconBg: "bg-[#d3e8ff]",
      accent: "#80bfff",
      number: "01",
    },
    {
      emoji: "💻",
      title: "SaaS products",
      text: "Show new signups and meaningful product events to make your platform feel active.",
      tag: "SOFTWARE",
      bg: "bg-[#eff6d9]",
      iconBg: "bg-[#dfedb8]",
      accent: "#b7dc65",
      number: "02",
    },
    {
      emoji: "🎓",
      title: "Online courses",
      text: "Highlight new enrollments and community activity to encourage learners to get started.",
      tag: "EDUCATION",
      bg: "bg-[#fceaf2]",
      iconBg: "bg-[#f8d8e6]",
      accent: "#eea5c5",
      number: "03",
    },
    {
      emoji: "🧰",
      title: "Service businesses",
      text: "Show bookings and customer requests to build confidence before someone reaches out.",
      tag: "SERVICES",
      bg: "bg-[#f4f1e8]",
      iconBg: "bg-[#e9e3d3]",
      accent: "#d9c79b",
      number: "04",
    },
  ];

  return (
    <section
      id="use-cases"
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-[#c4ff1c]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">

        {/* SECTION HEADER */}
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end md:gap-12">

          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-[0_3px_14px_rgba(0,0,0,0.035)] sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#c4ff1c]" />
              One tool, many possibilities
            </div>

            <p className="mt-7 text-[11px] font-bold tracking-[0.2em] text-neutral-400 sm:mt-9">
              BUILT FOR DIFFERENT BUSINESSES
            </p>

            <h2 className="mt-3 max-w-2xl text-[clamp(38px,7vw,64px)] font-medium leading-[1.02] tracking-[-0.065em] text-[#171717]">
              Where a little reassurance helps.
            </h2>

            <div className="mt-4 h-[5px] w-20 -rotate-[1.5deg] rounded-full bg-[#c4ff1c]" />
          </div>

          <div className="max-w-lg md:justify-self-end md:pb-1">
            <p className="text-[14px] leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              Use social proof where people are weighing a decision: on a
              product page, signup form, or booking flow.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-neutral-500 sm:text-sm">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eff8d9] text-[#62852e]">
                <ArrowUpRight size={15} />
              </span>
              One simple tool. Multiple ways to build trust.
            </div>
          </div>
        </div>

        {/* USE CASE CARDS */}
        <div className="mt-9 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {uses.map((item) => (
            <article
              key={item.title}
              className={`
                group relative flex min-h-[220px] flex-col overflow-hidden
                rounded-[24px] border border-black/[0.04]
                p-5 transition-all duration-300
                hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]
                sm:min-h-[265px] sm:rounded-[28px] sm:p-6
                ${item.bg}
              `}
            >
              {/* Decorative circle */}
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: item.accent }}
              />

              {/* Card header */}
              <div className="relative flex items-center justify-between">
                <span
                  className={`grid h-14 w-14 place-items-center rounded-[18px] text-[29px] shadow-sm ring-1 ring-black/[0.03] transition-transform duration-300 group-hover:rotate-[-7deg] group-hover:scale-105 ${item.iconBg}`}
                  aria-hidden="true"
                >
                  {item.emoji}
                </span>

                <span className="text-[10px] font-bold tracking-[0.15em] text-black/35">
                  {item.number}
                </span>
              </div>

              {/* Card content */}
              <div className="relative mt-auto pt-8">
                <p className="mb-2 text-[9px] font-bold tracking-[0.17em] text-black/40">
                  {item.tag}
                </p>

                <h3 className="text-[21px] font-semibold tracking-[-0.045em] text-[#171717] sm:text-[23px]">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-xs text-[13px] leading-6 text-neutral-600">
                  {item.text}
                </p>
              </div>

            </article>
          ))}
        </div>

        {/* BOTTOM SUPPORTING LINE */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[11px] font-medium text-neutral-400 sm:mt-9 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a5d44b]" />
            Easy to set up
          </span>

          <span className="hidden h-3 w-px bg-black/10 sm:block" />

          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a5d44b]" />
            Works with your website
          </span>

          <span className="hidden h-3 w-px bg-black/10 sm:block" />

          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a5d44b]" />
            Designed to build trust
          </span>
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return <section id="pricing" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-20"><div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[1.75rem] bg-[#181a1b] p-7 text-white sm:p-12 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-[#d9f467]">Start with what you need</p><h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-.05em] sm:text-5xl">A free plan to get moving. Room to grow when you are.</h2><p className="mt-4 max-w-xl leading-7 text-white/65">See current monthly limits and features before choosing a plan.</p></div><Link href="/pricing" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[#d9f467] px-6 font-semibold text-black transition hover:bg-[#e6ff7c]">Compare plans <ArrowRight className="h-4 w-4" /></Link></div></section>;
}

export function FaqSection() {
  const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return <section id="faq" className="scroll-mt-24 bg-[#f7f7f3] px-5 py-20 sm:px-8 sm:py-24"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} /><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-semibold text-blue-700">A few useful answers</p><h2 className="mt-3 text-4xl font-medium tracking-[-.06em] sm:text-5xl">Before you get started.</h2><p className="mt-4 max-w-sm leading-7 text-neutral-600">More questions? <a className="font-semibold text-neutral-900 underline underline-offset-4" href="mailto:hello@nudgeproof.com">Talk to us</a>.</p></div><div className="divide-y divide-black/10 border-y border-black/10">{faqs.map(({ q, a }) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-lg font-semibold marker:hidden">{q}<span aria-hidden="true" className="text-xl font-normal text-neutral-500 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl pr-8 leading-7 text-neutral-600">{a}</p></details>)}</div></div></section>;
}

export function FinalCtaSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return <section id="contact" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"><div className="mx-auto max-w-7xl rounded-[2rem] bg-[#d9f467] px-7 py-12 sm:px-12 sm:py-16"><p className="text-sm font-semibold text-[#4d6411]">{isLoggedIn ? "Pick up where you left off" : "Your first widget is a few steps away"}</p><div className="mt-3 grid gap-7 md:grid-cols-[1fr_auto] md:items-end"><h2 className="max-w-3xl text-4xl font-medium tracking-[-.06em] sm:text-6xl">Let your real customer activity do the talking.</h2><Link href={isLoggedIn ? "/dashboard" : "/signup"} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#171717] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#303030]">{isLoggedIn ? "Go to Dashboard" : "Try it for free"} <ArrowRight className="h-4 w-4" /></Link></div></div></section>;
}

export function OrganizationSchema() {
  const data = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": "https://nudgeproof.com/#organization", name: "NudgeProof", url: "https://nudgeproof.com", logo: "https://nudgeproof.com/nudgeproof-logo.svg", email: "hello@nudgeproof.com" },
    { "@type": "SoftwareApplication", "@id": "https://nudgeproof.com/#software", name: "NudgeProof", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "A social proof notification platform for displaying recent customer activity on websites.", url: "https://nudgeproof.com", offers: { "@type": "Offer", url: "https://nudgeproof.com/pricing", priceCurrency: "USD", category: "Subscription" } },
  ] };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
