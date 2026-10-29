import Link from "next/link";
import { ArrowRight, Check, Code2, MousePointer2, Sparkles } from "lucide-react";

const faqs = [
  { q: "What is NudgeProof?", a: "NudgeProof displays recent customer activity on your website as social proof notifications, giving visitors useful context as they decide what to do." },
  { q: "How do I add it to my website?", a: "Add your website in NudgeProof, choose a widget, and install the script snippet. You can preview and manage it from your dashboard." },
  { q: "Do I need to know how to code?", a: "No. Copy the installation snippet into your website. You can also connect activity through supported integrations or the event API." },
  { q: "Can I control what visitors see?", a: "Yes. Choose the widget style and configure its content and display behavior. Only use activity you have permission to show and that accurately represents real events." },
  { q: "Does NudgeProof guarantee better SEO or AI search rankings?", a: "No. NudgeProof displays social proof. It does not promise higher search rankings or AI citations." },
];

export function UseCasesSection() {
  const uses = [{ emoji: "🛒", title: "Online stores", text: "Recent purchases and product activity." }, { emoji: "💻", title: "SaaS products", text: "Signups and meaningful product events." }, { emoji: "🎓", title: "Courses", text: "Enrollment activity from your community." }, { emoji: "🧰", title: "Services", text: "Bookings and customer requests." }];
  return <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-6 md:grid-cols-[.8fr_1.2fr] md:items-end"><div><p className="text-sm font-semibold text-blue-700">One tool, many storefronts</p><h2 className="mt-3 text-4xl font-medium tracking-[-.06em] sm:text-5xl">Where a little reassurance helps.</h2></div><p className="max-w-xl leading-7 text-neutral-600">Use social proof where people are weighing a decision: on a product page, signup form, or booking flow.</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{uses.map(({ emoji, title, text }, i) => <article key={title} className={`min-h-48 rounded-[1.5rem] p-6 ${i === 0 ? "bg-[#dff0ff]" : i === 1 ? "bg-[#eaf3c8]" : i === 2 ? "bg-[#fae6ef]" : "bg-[#f4f1e8]"}`}><span aria-hidden="true" className="text-3xl">{emoji}</span><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p></article>)}</div></div></section>;
}

export function PricingSection() {
  return <section id="pricing" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-28"><div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[1.75rem] bg-[#181a1b] p-7 text-white sm:p-12 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-medium text-[#d9f467]">Start with what you need</p><h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-.05em] sm:text-5xl">A free plan to get moving. Room to grow when you are.</h2><p className="mt-4 max-w-xl leading-7 text-white/65">See current monthly limits and features before choosing a plan.</p></div><Link href="/pricing" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[#d9f467] px-6 font-semibold text-black transition hover:bg-[#e6ff7c]">Compare plans <ArrowRight className="h-4 w-4" /></Link></div></section>;
}

export function FaqSection() {
  const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return <section id="faq" className="scroll-mt-24 bg-[#f7f7f3] px-5 py-20 sm:px-8 sm:py-28"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} /><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-sm font-semibold text-blue-700">A few useful answers</p><h2 className="mt-3 text-4xl font-medium tracking-[-.06em] sm:text-5xl">Before you get started.</h2><p className="mt-4 max-w-sm leading-7 text-neutral-600">More questions? <a className="font-semibold text-neutral-900 underline underline-offset-4" href="mailto:hello@nudgeproof.com">Talk to us</a>.</p></div><div className="divide-y divide-black/10 border-y border-black/10">{faqs.map(({ q, a }) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-lg font-semibold marker:hidden">{q}<span aria-hidden="true" className="text-xl font-normal text-neutral-500 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl pr-8 leading-7 text-neutral-600">{a}</p></details>)}</div></div></section>;
}

export function FinalCtaSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return <section id="contact" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-7xl rounded-[2rem] bg-[#d9f467] px-7 py-12 sm:px-12 sm:py-16"><p className="text-sm font-semibold text-[#4d6411]">{isLoggedIn ? "Pick up where you left off" : "Your first widget is a few steps away"}</p><div className="mt-3 grid gap-7 md:grid-cols-[1fr_auto] md:items-end"><h2 className="max-w-3xl text-4xl font-medium tracking-[-.06em] sm:text-6xl">Let your real customer activity do the talking.</h2><Link href={isLoggedIn ? "/dashboard" : "/signup"} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#171717] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#303030]">{isLoggedIn ? "Go to Dashboard" : "Try it for free"} <ArrowRight className="h-4 w-4" /></Link></div></div></section>;
}

export function OrganizationSchema() {
  const data = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": "https://nudgeproof.com/#organization", name: "NudgeProof", url: "https://nudgeproof.com", logo: "https://nudgeproof.com/nudgeproof-logo.svg", email: "hello@nudgeproof.com" },
    { "@type": "SoftwareApplication", "@id": "https://nudgeproof.com/#software", name: "NudgeProof", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "A social proof notification platform for displaying recent customer activity on websites.", url: "https://nudgeproof.com", offers: { "@type": "Offer", url: "https://nudgeproof.com/pricing", priceCurrency: "USD", category: "Subscription" } },
  ] };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
