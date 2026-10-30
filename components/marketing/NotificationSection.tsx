
"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const examples = [
  {
    id: "sales",
    label: "Recent sales",
    eyebrow: "SOCIAL PROOF",
    title: "Every sale deserves a little spotlight.",
    description:
      "Show real customer activity in a friendly notification that builds confidence and helps visitors take the next step.",
    icon: "🛍️",
    iconBg: "bg-[#ffe4c7]",
    notificationTitle: "A new order just came in!",
    notificationText: "Jordan in Austin purchased Everyday Tote",
    time: "Just now",
    accent: "#ffd9b5",
    person: "J",
    personBg: "bg-[#e8b9a0]",
    footer: "Helping visitors feel confident about buying",
  },
  {
    id: "reviews",
    label: "Customer reviews",
    eyebrow: "TRUST SIGNALS",
    title: "Let happy customers do the talking.",
    description:
      "Bring your best reviews into view with subtle, beautifully styled notifications that make your brand feel more trustworthy.",
    icon: "💛",
    iconBg: "bg-[#fce7f3]",
    notificationTitle: "A lovely review just arrived",
    notificationText: 'Olivia in London · "Absolutely love it!"',
    time: "2 min ago",
    accent: "#f6d9e8",
    person: "O",
    personBg: "bg-[#e9b9cc]",
    footer: "Real feedback. A little more confidence.",
  },
  {
    id: "visitors",
    label: "Live visitors",
    eyebrow: "LIVE ACTIVITY",
    title: "Show that something is happening here.",
    description:
      "Give visitors a gentle signal of activity with a live visitor count that fits naturally into your website.",
    icon: "🌱",
    iconBg: "bg-[#e3f2c8]",
    notificationTitle: "Your store is getting attention",
    notificationText: "18 people are browsing right now",
    time: "Live",
    accent: "#dcedc2",
    person: "↗",
    personBg: "bg-[#c8e3a5]",
    footer: "A little activity goes a long way",
  },
];

export function NotificationShowcase() {
  const [active, setActive] = useState("sales");
  const example = examples.find((item) => item.id === active)!;

  return (
    <section
      id="product"
      aria-label="NudgeProof notification showcase"
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20"
    >
      {/* Subtle background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#c4ff1c]/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#b9e8ff]/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          {/* LEFT CONTENT */}
          <div className="relative z-10 mx-auto w-full max-w-xl lg:mx-0">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 py-2 text-xs font-semibold text-neutral-600 shadow-[0_3px_14px_rgba(0,0,0,0.035)] sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#a4d72b]" />
              Small nudges. Meaningful impact.
            </div>

            {/* Section label */}
            <p className="mt-7 text-[11px] font-bold tracking-[0.2em] text-neutral-400 sm:mt-9">
              {example.eyebrow}
            </p>

            {/* Heading */}
            <h2 className="mt-3 max-w-lg text-[clamp(36px,8vw,58px)] font-medium leading-[1.02] tracking-[-0.065em] text-[#171717] sm:mt-4 sm:text-6xl lg:text-[3.65rem]">
              {example.title}
            </h2>

            {/* Lime accent */}
            <div className="mt-4 h-[5px] w-20 -rotate-[1.5deg] rounded-full bg-[#c4ff1c] sm:mt-5" />

            {/* Description */}
            <p className="mt-5 max-w-lg text-[14px] leading-7 text-neutral-600 sm:mt-6 sm:text-lg sm:leading-8">
              {example.description}
            </p>

            {/* Tabs */}
            <div className="mt-7 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:mt-8 sm:overflow-visible sm:px-0">
              <div
                className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap"
                role="tablist"
                aria-label="Notification types"
              >
                {examples.map((item) => (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active === item.id}
                    aria-controls="notification-preview"
                    onClick={() => setActive(item.id)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                      active === item.id
                        ? "border-[#171717] bg-[#171717] text-white shadow-[0_4px_0_rgba(0,0,0,0.08)]"
                        : "border-black/[0.09] bg-white text-neutral-600 hover:border-black/25 hover:bg-neutral-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Supporting detail */}
            <div className="mt-6 flex items-center gap-3 text-xs font-medium text-neutral-500 sm:mt-8 sm:text-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eff8d9] text-[#4d713e]">
                <Check size={17} strokeWidth={2.5} />
              </span>
              <span>
                Preview your notifications before they go live.
              </span>
            </div>

            {/* Small supporting features */}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-neutral-400 sm:mt-7 sm:gap-x-5 sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc94c]" />
                Easy setup
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc94c]" />
                On-brand design
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9bc94c]" />
                Real activity
              </span>
            </div>
          </div>

          {/* RIGHT: PRODUCT PREVIEW */}
          <div
            id="notification-preview"
            role="tabpanel"
            aria-labelledby={`tab-${example.id}`}
            className="relative isolate min-h-[360px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#f7f5ef] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.045)] sm:min-h-[480px] sm:rounded-[36px] sm:p-8 lg:p-10"
          >
            {/* Background circles */}
            <div
              className="absolute -right-12 -top-16 h-48 w-48 rounded-full blur-[1px] transition-colors duration-500 sm:h-72 sm:w-72"
              style={{ backgroundColor: example.accent }}
              aria-hidden="true"
            />

            <div
              className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#dcebd1] sm:h-72 sm:w-72"
              aria-hidden="true"
            />

            {/* Decorative characters */}
            <div
              className="absolute left-[5%] top-[5%] z-0 rotate-[-12deg] text-2xl sm:left-[12%] sm:top-[10%] sm:text-4xl"
              aria-hidden="true"
            >
              ✳
            </div>

            <div
              className="absolute bottom-[8%] right-[4%] z-0 rotate-12 text-3xl sm:bottom-[16%] sm:right-[8%] sm:text-5xl"
              aria-hidden="true"
            >
              ☀
            </div>

            {/* Small lime decoration */}
            <div className="absolute right-[12%] top-[18%] h-4 w-4 rotate-45 rounded-[5px] bg-[#c4ff1c] shadow-sm sm:h-6 sm:w-6" />

            {/* Browser mockup */}
            <div className="relative z-10 mx-auto max-w-[460px] overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_25px_70px_rgba(46,57,43,0.12)] sm:rounded-2xl">

              {/* Browser top bar */}
              <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-3 sm:px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f5a99c] sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-[#f4d17f] sm:h-2.5 sm:w-2.5" />
                  <span className="h-2 w-2 rounded-full bg-[#a8cf9b] sm:h-2.5 sm:w-2.5" />
                </div>

                <span className="text-[9px] font-semibold tracking-[0.12em] text-neutral-400 sm:text-[11px]">
                  YOUR STORE
                </span>

                <span className="text-xs text-neutral-400">↗</span>
              </div>

              {/* Store preview */}
              <div className="relative flex min-h-[205px] flex-col items-center justify-center overflow-hidden bg-[#fbfaf7] px-4 py-6 text-center sm:min-h-[270px] sm:px-5 sm:py-8">
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-70 sm:h-28 sm:w-28"
                  style={{ backgroundColor: example.accent }}
                  aria-hidden="true"
                />

                <div
                  className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-[#e4eddc] sm:h-32 sm:w-32"
                  aria-hidden="true"
                />

                <div className="relative grid h-12 w-12 place-items-center rounded-[18px] bg-white text-2xl shadow-sm ring-1 ring-black/5 sm:h-14 sm:w-14 sm:text-3xl">
                  {example.icon}
                </div>

                <div className="relative mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:text-[11px]">
                  Made for your brand
                </div>

                <div className="relative mt-2 max-w-xs text-lg font-semibold tracking-tight text-[#27342a] sm:text-2xl">
                  Shopping should feel good.
                </div>

                <div className="relative mt-2 max-w-xs text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                  A thoughtful experience, from the first visit to checkout.
                </div>

                <div className="relative mt-4 rounded-full bg-[#171717] px-5 py-2.5 text-[10px] font-semibold text-white sm:mt-5 sm:text-xs">
                  Discover the collection
                </div>
              </div>

              {/* Notification */}
              <div className="relative border-t border-black/[0.06] p-3 sm:p-5">
                <div className="rounded-xl border border-black/[0.06] bg-white p-3 shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-300 sm:p-5">
                  <div className="flex items-start gap-2.5 sm:gap-3">

                    {/* Avatar */}
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-[#493c34] sm:h-11 sm:w-11 sm:text-sm ${example.personBg}`}
                    >
                      {example.person}
                    </div>

                    {/* Notification content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-5 text-[#252c26] sm:text-sm">
                          {example.notificationTitle}
                        </p>

                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#72a95b]" />
                      </div>

                      <p className="mt-1.5 text-[11px] leading-5 text-neutral-500 sm:text-[13px]">
                        {example.notificationText}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-3">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 sm:text-[10px]">
                          NudgeProof preview
                        </span>

                        <span className="text-[10px] text-neutral-400 sm:text-[11px]">
                          {example.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-center text-[9px] text-neutral-400 sm:text-[11px]">
                  {example.footer}
                </p>
              </div>
            </div>

            {/* Floating sticker */}
            <div className="absolute bottom-5 left-5 z-20 hidden -rotate-6 rounded-2xl border border-black/[0.05] bg-white px-4 py-3 shadow-lg sm:block lg:bottom-8 lg:left-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eff5df] text-lg">
                  ✨
                </span>

                <div>
                  <p className="text-xs font-semibold text-[#29342c]">
                    A little social proof
                  </p>

                  <p className="mt-0.5 text-[10px] text-neutral-400">
                    A more confident customer
                  </p>
                </div>
              </div>
            </div>

            {/* Floating top label */}
            <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[9px] font-semibold text-neutral-500 shadow-sm backdrop-blur-md sm:right-7 sm:top-7 sm:text-[10px]">
              <Sparkles size={12} className="text-[#9abf3e]" />
              LIVE PREVIEW
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}