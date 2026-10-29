import { ArrowRight, Code2, MousePointer2, Sparkles } from "lucide-react";
import Link from "next/link";

export function HowItWorksSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const steps = [
    {
      n: "01",
      icon: MousePointer2,
      title: "Connect your site",
      text: "Add your website to NudgeProof and create a place for your widgets.",
      tag: "YOUR WEBSITE",
      tint: "bg-[#e7f0d8]",
      symbol: "↗",
    },
    {
      n: "02",
      icon: Sparkles,
      title: "Make it yours",
      text: "Choose your notification type, adjust the design, and preview the result.",
      tag: "YOUR DESIGN",
      tint: "bg-[#f8e3d5]",
      symbol: "✳",
    },
    {
      n: "03",
      icon: Code2,
      title: "Go live",
      text: "Add your embed snippet, verify the connection, and show activity to visitors.",
      tag: "YOUR LAUNCH",
      tint: "bg-[#e4e8fb]",
      symbol: "↗",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 overflow-hidden bg-[#f7f7f2] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Compact editorial heading */}
        <div className="grid gap-5 md:grid-cols-[1fr_0.65fr] md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#69874a]">
              Your setup, simplified
            </p>

            <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#202820] sm:text-5xl lg:text-6xl">
              Three steps.
              <span className="block text-[#7b9856]">
                That's the whole idea.
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8 md:justify-self-end">
            You don't need to rebuild your website or learn a complicated
            platform. Set up a widget, customize it, and publish.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-12 sm:mt-16">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-[#d8ddcf] md:block"
          />

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ n, icon: Icon, title, text, tag, tint, symbol }) => (
              <article key={n} className="relative">
                <div className="flex items-center gap-4 md:flex-col md:items-start">
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#dce2d3] bg-[#f7f7f2]">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-semibold text-[#526a3d] shadow-sm">
                      {n}
                    </span>
                  </div>

                  <span className="text-xs font-semibold tracking-[0.16em] text-neutral-400">
                    STEP {n}
                  </span>
                </div>

                {/* Small, unique illustration rather than a large card */}
                <div
                  className={`relative mt-6 flex h-28 items-center justify-between overflow-hidden rounded-2xl px-5 sm:h-32 sm:px-6 ${tint}`}
                >
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#53644a]/75">
                      {tag}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/80">
                        <Icon className="h-4 w-4 text-[#354a31]" />
                      </span>
                      <span className="text-sm font-semibold text-[#2b352b]">
                        {title}
                      </span>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-5 text-7xl font-light text-black/[0.07] sm:text-8xl"
                  >
                    {symbol}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#252d25] sm:text-2xl">
                  {title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-600">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Simple closing strip, not another CTA card */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[#dedfd7] pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-600">
            Start small. Customize as you grow.
          </p>

          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#354a31] underline decoration-[#a5c477] decoration-2 underline-offset-4 transition hover:text-[#6b8d45]"
          >
            {isLoggedIn ? "Go to your dashboard" : "Create your first widget"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
