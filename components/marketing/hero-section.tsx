"use client";

import { ArrowRight, Check, Mail, Star } from "lucide-react";

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#171717]">
      {/* =========================================================
          FLOATING HERO OBJECTS
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* =====================================================
            GREEN HAPPY ORB
        ===================================================== */}
        <div
          className="
            hero-orb
            absolute
            left-[6%]
            top-[29%]
            hidden
            h-[128px]
            w-[128px]
            lg:block
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              rounded-full
              bg-gradient-to-br
              from-[#e2ff47]
              via-[#c4ff1c]
              to-[#b3eb19]
              shadow-[0_22px_45px_rgba(170,220,20,0.25)]
            "
          >
            {/* Highlight */}
            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.7),transparent_32%)]
              "
            />

            {/* Subtle grain */}
            <div
              className="
                absolute
                inset-0
                rounded-full
                opacity-20
                [background-image:radial-gradient(rgba(255,255,255,0.7)_0.7px,transparent_0.7px)]
                [background-size:4px_4px]
              "
            />

            {/* Left eye */}
            <span
              className="
                absolute
                left-[42px]
                top-[41px]
                h-[8px]
                w-[15px]
                rounded-full
                border-t-[3px]
                border-[#526c12]
              "
            />

            {/* Right eye */}
            <span
              className="
                absolute
                right-[42px]
                top-[41px]
                h-[8px]
                w-[15px]
                rounded-full
                border-t-[3px]
                border-[#526c12]
              "
            />

            {/* Smile */}
            <span
              className="
                absolute
                left-1/2
                top-[57px]
                h-[22px]
                w-[40px]
                -translate-x-1/2
                rounded-b-full
                border-b-[4px]
                border-[#526c12]
              "
            />
          </div>
        </div>

        {/* =====================================================
            BLUE FLOATING BUBBLE
        ===================================================== */}
        <div
          className="
            hero-blue-orb
            absolute
            right-[43%]
            top-[18%]
            h-[46px]
            w-[46px]
            rounded-full
            bg-gradient-to-br
            from-[#91ddff]
            to-[#55b9f7]
            shadow-[0_15px_35px_rgba(65,175,245,0.35)]
          "
        >
          <div
            className="
              absolute
              inset-[6px]
              rounded-full
              bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_45%)]
            "
          />
        </div>

        {/* =====================================================
            PINK HAPPY CRESCENT
        ===================================================== */}
        <div
          className="
            hero-pink
            absolute
            right-[10%]
            top-[36%]
            hidden
            h-[98px]
            w-[98px]
            lg:block
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
              rounded-full
              bg-gradient-to-br
              from-[#ff9fd4]
              via-[#f68fc9]
              to-[#ffc3a7]
              shadow-[0_22px_40px_rgba(240,130,190,0.25)]
            "
          >
            {/* White cutout */}
            <div
              className="
                absolute
                -bottom-1
                -right-1
                h-[55px]
                w-[55px]
                rounded-tl-full
                bg-white
              "
            />

            {/* Highlight */}
            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_35%)]
              "
            />

            {/* Left eye */}
            <span
              className="
                absolute
                left-[28px]
                top-[28px]
                h-[9px]
                w-[16px]
                rounded-full
                border-t-[2.5px]
                border-[#8b1872]
              "
            />

            {/* Right eye */}
            <span
              className="
                absolute
                left-[53px]
                top-[28px]
                h-[9px]
                w-[16px]
                rounded-full
                border-t-[2.5px]
                border-[#8b1872]
              "
            />

            {/* Smile */}
            <span
              className="
                absolute
                left-[36px]
                top-[43px]
                h-[11px]
                w-[27px]
                rounded-b-full
                border-b-[2.5px]
                border-[#8b1872]
              "
            />
          </div>
        </div>

        {/* =====================================================
            GREEN DIAMOND
        ===================================================== */}
        <div
          className="
            hero-diamond
            absolute
            bottom-[17%]
            left-[28%]
            hidden
            h-[42px]
            w-[42px]
            rotate-45
            rounded-[9px]
            bg-gradient-to-br
            from-[#76ffa2]
            to-[#3de982]
            shadow-[0_15px_30px_rgba(60,235,130,0.3)]
            lg:block
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-[9px]
              bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_40%)]
            "
          />
        </div>

        {/* =====================================================
            BLUE / PURPLE HAPPY CRESCENT
        ===================================================== */}
        <div
          className="
            hero-purple
            absolute
            bottom-[7%]
            right-[18%]
            hidden
            h-[118px]
            w-[118px]
            lg:block
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              rotate-[18deg]
              overflow-hidden
              rounded-full
              bg-gradient-to-br
              from-[#54c5ff]
              via-[#699fff]
              to-[#d76cff]
              shadow-[0_22px_45px_rgba(90,150,255,0.3)]
            "
          >
            {/* White cutout */}
            <div
              className="
                absolute
                -right-1
                -top-1
                h-[75px]
                w-[75px]
                rounded-bl-full
                bg-white
              "
            />

            {/* Highlight */}
            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-[radial-gradient(circle_at_28%_68%,rgba(255,255,255,0.35),transparent_30%)]
              "
            />

            {/* Left eye */}
            <span
              className="
                absolute
                bottom-[43px]
                left-[30px]
                h-[9px]
                w-[18px]
                rounded-full
                border-t-[3px]
                border-[#416b90]
              "
            />

            {/* Right eye */}
            <span
              className="
                absolute
                bottom-[43px]
                left-[57px]
                h-[9px]
                w-[18px]
                rounded-full
                border-t-[3px]
                border-[#416b90]
              "
            />

            {/* Smile */}
            <span
              className="
                absolute
                bottom-[29px]
                left-[40px]
                h-[17px]
                w-[42px]
                rounded-b-full
                border-b-[3px]
                border-[#416b90]
              "
            />
          </div>
        </div>
      </div>

      {/* =========================================================
          HERO
      ========================================================= */}

      {/* =========================================================
    HERO CONTENT
========================================================= */}
      <section
        className="
    relative z-10 mx-auto flex min-h-[calc(100svh-86px)]
    w-full max-w-[1280px] flex-col items-center
    px-5 pb-12 pt-8 text-center
    sm:px-6 sm:pt-24
    lg:pt-32
  "
      >
        {/* Social proof */}
        <div
          className="
      hero-content-1 inline-flex items-center gap-2.5
      rounded-full border border-black/[0.07]
      bg-white/90 px-4 py-2.5
      shadow-[0_3px_14px_rgba(0,0,0,0.035)]
    "
        >
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-[14px] w-[14px] fill-[#f4b740] text-[#f4b740]"
                strokeWidth={1.5}
              />
            ))}
          </div>

          <span className="h-4 w-px bg-black/10" />

          <span className="text-[12px] font-medium text-[#555] sm:text-[13px]">
            1200+ Reviews
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="
      hero-content-2 mt-6 max-w-[1000px]
      text-[clamp(48px,7.2vw,92px)]
      font-medium leading-[0.96]
      tracking-[-0.068em] text-[#171717]
      sm:mt-7
    "
        >
          Turn visitors into
          <br />

          <span className="relative inline-block">
            <span className="relative z-10">customers</span>

            {/* Keep the existing minimal style, with a playful lime accent */}
            <span
              aria-hidden="true"
              className="
          absolute -bottom-[1px] left-[3%] z-0
          h-[7px] w-[94%] -rotate-[1.5deg]
          rounded-full bg-[#c4ff1c]
          sm:-bottom-[3px] sm:h-[10px]
        "
            />
          </span>
        </h1>

        {/* Description */}
        <p
          className="
      hero-content-3 mt-5 max-w-[570px]
      text-[15px] font-medium leading-7
      tracking-[-0.02em] text-[#737373]
      sm:mt-6 sm:text-[17px] sm:leading-[1.7]
    "
        >
          Build trust instantly with social proof that makes
          <br className="hidden sm:block" />
          your website feel active, trusted, and alive.
        </p>

        {/* CTA buttons */}
        <div
          className="
      hero-content-4 mt-7 flex w-full max-w-md
      flex-col items-stretch justify-center gap-3
      sm:mt-8 sm:w-auto sm:max-w-none sm:flex-row
      sm:items-center sm:gap-3
    "
        >
          {/* Primary CTA */}
          <a
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="
        group inline-flex min-h-[54px] items-center
        justify-center gap-4 rounded-full
        border border-[#171717] bg-[#171717]
        py-1.5 pl-6 pr-1.5
        text-[14px] font-semibold text-white
        shadow-[0_5px_0_rgba(0,0,0,0.08)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:bg-[#303030]
        hover:shadow-[0_9px_22px_rgba(0,0,0,0.14)]
        active:translate-y-0
      "
          >
            <span>{isLoggedIn ? "Go to Dashboard" : "Get started for free"}</span>

            <span
              className="
          grid h-[40px] w-[40px] shrink-0
          place-items-center rounded-full
          bg-[#c4ff1c] text-[#171717]
          transition-transform duration-200
          group-hover:rotate-[-35deg]
        "
            >
              <ArrowRight className="h-[18px] w-[18px]" />
            </span>
          </a>

          {/* Secondary CTA */}
          <a
            href="mailto:hello@nudgeproof.com"
            className="
        group inline-flex min-h-[54px] items-center
        justify-center gap-2.5 rounded-full
        border border-black/[0.09] bg-white
        px-6 py-3.5 text-[14px] font-semibold
        text-[#292929]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-black/20 hover:bg-[#fafaf8]
        hover:shadow-[0_5px_18px_rgba(0,0,0,0.055)]
      "
          >
            <Mail className="h-4 w-4 text-neutral-500 transition-transform group-hover:-rotate-6" />
            Contact us
          </a>
        </div>

        {/* Supporting detail */}
        <div
          className="
      hero-content-4 mt-5 flex flex-wrap
      items-center justify-center gap-x-4 gap-y-2
      text-[11px] font-medium text-[#858585]
      sm:gap-x-5 sm:text-xs
    "
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8fba54]" />
            Simple setup
          </span>

          <span className="h-3 w-px bg-black/10" />

          <span>Built for your brand</span>

          <span className="h-3 w-px bg-black/10" />

          <span>Real activity, real trust</span>
        </div>
      </section>
    </main>
  );
}
