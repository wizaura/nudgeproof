import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProductSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const activities = [
    {
      icon: "🛍️",
      title: "Purchase notification",
      subtitle: "Everyday Tote · Austin, US",
      time: "Just now",
      color: "bg-[#eaf2d9]",
    },
    {
      icon: "✉️",
      title: "New signup",
      subtitle: "Newsletter registration",
      time: "2m ago",
      color: "bg-[#f8e7d8]",
    },
    {
      icon: "👀",
      title: "Visitor activity",
      subtitle: "Visitors browsing your store",
      time: "Live",
      color: "bg-[#e4eaff]",
    },
  ];

  return (
    <section
      id="product"
      className="scroll-mt-24 border-y border-black/[0.06] bg-white px-5 py-20 sm:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        {/* Editorial content */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#617d42]">
            <span className="h-2 w-2 rounded-full bg-[#a5cf54]" />
            A clearer view of your website
          </div>

          <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#191f1b] sm:text-5xl lg:text-[3.6rem]">
            Less guessing.
            <span className="block text-[#78994d]">
              More trust.
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
            NudgeProof turns customer activity into useful social proof.
            Manage what visitors see and understand how your widgets
            are performing, all from one place.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                title: "Choose what visitors see",
                text: "Control the activity types displayed on your website.",
              },
              {
                title: "Make it yours",
                text: "Customize notification styles to fit your brand.",
              },
              {
                title: "Understand your usage",
                text: "Keep track of impressions and widget activity.",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f4e8] text-xs font-semibold text-[#617d42]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#242b25] sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#202b23] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#394d3d]"
          >
            {isLoggedIn ? "Open Dashboard" : "Explore NudgeProof"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product dashboard: deliberately more structured than the showcase */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="absolute -inset-3 -rotate-2 rounded-[1.75rem] bg-[#e9f0dd] sm:-inset-5"
          />

          <div className="relative overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white shadow-[0_20px_60px_rgba(25,35,24,0.09)]">
            {/* Dashboard header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceee9] px-5 py-4 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#dff0c1] text-sm">
                    ✳
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-[#222a23]">
                    NudgeProof
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Your website overview
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce8d3] px-2.5 py-1.5 text-[11px] font-medium text-[#557442]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8bb963]" />
                Website connected
              </span>
            </div>

            <div className="space-y-5 bg-[#fbfcf9] p-4 sm:p-6">
              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#e9ebe5] bg-white p-4">
                  <p className="text-xs text-neutral-500">
                    Impressions this month
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="text-2xl font-semibold tracking-tight text-[#252c26] sm:text-3xl">
                      12,480
                    </span>
                    <span className="mb-1 text-xs text-[#6d8c4d]">
                      Usage
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf0e8]">
                    <div className="h-full w-2/5 rounded-full bg-[#9ac36a]" />
                  </div>
                </div>

                <div className="rounded-xl border border-[#e9ebe5] bg-white p-4">
                  <p className="text-xs text-neutral-500">
                    Active widgets
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="text-2xl font-semibold tracking-tight text-[#252c26] sm:text-3xl">
                      03
                    </span>
                    <span className="mb-1 text-xs text-neutral-400">
                      Configured
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <span className="h-1.5 flex-1 rounded-full bg-[#9ac36a]" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#9ac36a]" />
                    <span className="h-1.5 flex-1 rounded-full bg-[#9ac36a]" />
                  </div>
                </div>
              </div>

              {/* Activity visualization */}
              <div className="rounded-xl border border-[#e9ebe5] bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#252c26]">
                      Widget performance
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Example weekly activity
                    </p>
                  </div>
                  <span className="rounded-lg bg-[#f1f4ec] px-2.5 py-1.5 text-[10px] font-medium text-[#62784d]">
                    7 days
                  </span>
                </div>

                <div
                  className="mt-5 flex h-24 items-end gap-2 sm:h-28 sm:gap-3"
                  aria-label="Illustrative weekly activity bar chart"
                >
                  {[38, 56, 44, 76, 53, 91, 67].map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 items-end"
                    >
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          index === 5
                            ? "bg-[#8fb65c]"
                            : "bg-[#dfe9d2] hover:bg-[#bdd69e]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-neutral-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* Recent activity feed */}
              <div className="overflow-hidden rounded-xl border border-[#e9ebe5] bg-white">
                <div className="flex items-center justify-between border-b border-[#eceee9] px-4 py-3.5">
                  <h3 className="text-sm font-semibold text-[#252c26]">
                    Recent activity
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Preview
                  </span>
                </div>

                <div className="divide-y divide-[#f0f1ed]">
                  {activities.map((activity) => (
                    <div
                      key={activity.title}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base ${activity.color}`}
                      >
                        {activity.icon}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#303730]">
                          {activity.title}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-neutral-500">
                          {activity.subtitle}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] text-neutral-400">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-[10px] text-neutral-400">
                Illustrative dashboard preview · Not live account data
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
