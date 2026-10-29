
"use client";

import { useState } from "react";

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
    notificationText: "Olivia in London · “Absolutely love it!”",
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
      aria-label="NudgeProof notification showcase"
      className="relative overflow-hidden px-5 pb-20 pt-12 sm:px-8 sm:pt-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left: copy and interaction */}
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dce8d5] bg-[#f4f8ef] px-3.5 py-2 text-sm font-medium text-[#456b37]">
              <span className="h-2 w-2 rounded-full bg-[#72a95b]" />
              Small nudges. Meaningful impact.
            </div>

            <p className="mt-8 text-xs font-bold tracking-[0.2em] text-neutral-500">
              {example.eyebrow}
            </p>

            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#202b25] sm:text-5xl lg:text-[3.65rem]">
              {example.title}
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              {example.description}
            </p>

            <div
              className="mt-8 flex flex-wrap gap-2"
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
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active === item.id
                      ? "border-[#263b2d] bg-[#263b2d] text-white shadow-sm"
                      : "border-black/10 bg-white text-neutral-600 hover:border-black/25 hover:bg-neutral-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-neutral-500">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9f2df] text-[#4d713e]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Preview your notifications before they go live.</span>
            </div>
          </div>

          {/* Right: playful product preview */}
          <div
            id="notification-preview"
            role="tabpanel"
            aria-labelledby={`tab-${example.id}`}
            className="relative isolate min-h-[390px] overflow-hidden rounded-[2rem] border border-black/[0.05] bg-[#f4eee2] p-5 sm:min-h-[480px] sm:p-9 lg:p-11"
          >
            {/* Soft decorative shapes */}
            <div
              className="absolute -right-14 -top-16 h-56 w-56 rounded-full blur-[1px] transition-colors duration-500 sm:h-72 sm:w-72"
              style={{ backgroundColor: example.accent }}
              aria-hidden="true"
            />

            <div
              className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-[#dcebd1] sm:h-72 sm:w-72"
              aria-hidden="true"
            />

            <div
              className="absolute left-[12%] top-[13%] text-3xl sm:text-4xl"
              aria-hidden="true"
            >
              ✳
            </div>

            <div
              className="absolute bottom-[16%] right-[8%] rotate-12 text-4xl sm:text-5xl"
              aria-hidden="true"
            >
              ☀
            </div>

            {/* Browser-style canvas */}
            <div className="relative mx-auto max-w-[460px] overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_25px_70px_rgba(46,57,43,0.12)]">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f5a99c]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f4d17f]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a8cf9b]" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  YOUR STORE
                </span>
                <span className="text-xs text-neutral-400">↗</span>
              </div>

              <div className="relative flex min-h-[230px] flex-col items-center justify-center overflow-hidden bg-[#fbfaf7] px-5 py-8 text-center sm:min-h-[270px]">
                <div
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-70"
                  style={{ backgroundColor: example.accent }}
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[#e4eddc]"
                  aria-hidden="true"
                />

                <div className="relative grid h-14 w-14 place-items-center rounded-[1.25rem] bg-white text-3xl shadow-sm ring-1 ring-black/5">
                  {example.icon}
                </div>

                <div className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Made for your brand
                </div>

                <div className="relative mt-2 max-w-xs text-xl font-semibold tracking-tight text-[#27342a] sm:text-2xl">
                  Shopping should feel good.
                </div>

                <div className="relative mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                  A thoughtful experience, from the first visit to checkout.
                </div>

                <div className="relative mt-5 rounded-full bg-[#293e30] px-5 py-2.5 text-xs font-medium text-white">
                  Discover the collection
                </div>
              </div>

              {/* Notification card */}
              <div className="relative border-t border-black/[0.06] p-4 sm:p-5">
                <div className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.06)] transition-all duration-300 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${example.personBg} text-sm font-semibold text-[#493c34]`}
                    >
                      {example.person}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-5 text-[#252c26]">
                          {example.notificationTitle}
                        </p>
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#72a95b]" />
                      </div>

                      <p className="mt-1.5 text-xs leading-5 text-neutral-500 sm:text-[13px]">
                        {example.notificationText}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                          NudgeProof preview
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {example.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11px] text-neutral-400">
                  {example.footer}
                </p>
              </div>
            </div>

            {/* Floating decorative sticker */}
            <div className="absolute bottom-5 left-5 hidden -rotate-6 rounded-2xl border border-black/[0.05] bg-white px-4 py-3 shadow-lg sm:block lg:bottom-8 lg:left-7">
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
          </div>
        </div>
      </div>
    </section>
  );
}
