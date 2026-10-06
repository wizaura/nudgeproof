"use client";

import { Star } from "lucide-react";

export default function Home() {
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
          HEADER
      ========================================================= */}
      <header
        className="
          relative
          z-20
          mx-auto
          flex
          h-[86px]
          w-full
          max-w-[1280px]
          items-center
          justify-between
          px-6
          lg:px-10
        "
      >
        {/* Logo */}
        <a
          href="/"
          aria-label="NudgeProof home"
          className="
            flex
            items-center
            gap-2.5
            transition-opacity
            duration-200
            hover:opacity-70
          "
        >
          <img
            src="/nudgeproof-logo.svg"
            alt="NudgeProof"
            className="h-8 w-8 object-contain"
          />

          <span
            className="
              text-[19px]
              font-bold
              tracking-[-0.045em]
            "
          >
            Nudgeproof
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="
            absolute
            left-1/2
            hidden
            -translate-x-1/2
            items-center
            gap-7
            lg:flex
          "
        >
          <a
            href="#product"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            Product
          </a>

          <a
            href="#case-studies"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            Case studies
          </a>

          <a
            href="#pricing"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            Pricing
          </a>

          <a
            href="#blog"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            Blog
          </a>

          <a
            href="#about"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            About
          </a>

          <a
            href="#contact"
            className="text-[14px] font-medium transition-opacity hover:opacity-50"
          >
            Contact
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="
              hidden
              rounded-full
              bg-[#f0efed]
              px-6
              py-3
              text-[14px]
              font-semibold
              transition-all
              duration-200
              hover:bg-[#e6e5e3]
              sm:block
            "
          >
            Login
          </a>

          <a
            href="/login"
            className="
              group
              flex
              items-center
              gap-3
              text-[14px]
              font-semibold
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#171717]
                text-white
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            >
              →
            </span>

            <span className="hidden sm:block">
              Try for free
            </span>
          </a>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[calc(100vh-86px)]
          w-full
          max-w-[1280px]
          flex-col
          items-center
          px-6
          pt-[110px]
          text-center
          sm:pt-[125px]
          lg:pt-[145px]
        "
      >
        {/* Reviews */}
        <div
          className="
            hero-content-1
            flex
            items-center
            gap-2
            text-[14px]
            text-[#5d5d5d]
          "
        >
          <div className="flex items-center gap-[2px]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="h-[15px] w-[15px] fill-[#555] text-[#555]"
                strokeWidth={1.5}
              />
            ))}
          </div>

          <span>1200+ Reviews</span>
        </div>

        {/* Main heading */}
        <h1
          className="
            hero-content-2
            mt-8
            max-w-[950px]
            text-[clamp(54px,7vw,92px)]
            font-medium
            leading-[0.94]
            tracking-[-0.065em]
          "
        >
          Turn visitors into
          <br />
          <span className="relative inline-block">
            customers
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            hero-content-3
            mt-7
            max-w-[610px]
            text-[17px]
            font-medium
            leading-[1.45]
            tracking-[-0.025em]
            text-[#777]
            sm:text-[18px]
          "
        >
          Build trust instantly with social proof that makes
          <br className="hidden sm:block" />
          your website feel active, trusted, and alive.
        </p>

        {/* CTA */}
        <div
          className="
            hero-content-4
            mt-9
            flex
            items-center
            gap-3
          "
        >
          {/* Primary */}
          <a
            href="/login"
            className="
              group
              flex
              items-center
              gap-3
              rounded-full
              bg-[#171717]
              py-2
              pl-6
              pr-2
              text-[14px]
              font-semibold
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]
            "
          >
            <span>Try for free</span>

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white
                text-black
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            >
              →
            </span>
          </a>

          {/* Secondary */}
          <a
            href="mailto:hello@nudgeproof.com"
            className="
              rounded-full
              bg-[#eeeeec]
              px-7
              py-3.5
              text-[14px]
              font-semibold
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#e5e4e2]
            "
          >
            Contact us
          </a>
        </div>
      </section>
    </main>
  );
}