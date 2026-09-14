"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSubmitted(true);
      setEmail("");

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative h-screen min-h-[680px] w-screen overflow-hidden bg-white text-black">

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

        <img
          src="/nudge_proof.avif"
          alt=""
          className="
            absolute
            left-0
            lg:-top-36
            bottom-0

            block
            w-full
            h-auto
            max-w-none

            mix-blend-screen
          "
        />

        {/* Soft white fade where landscape meets hero */}

        <div
          className="
            absolute
            left-0
            right-0
            top-2
            h-[22%]

            bg-gradient-to-b
            from-white
            via-white/75
            to-transparent
          "
        />

      </div>


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
    absolute
    left-0
    right-0
    top-0
    z-30

    flex
    h-[78px]
    items-center
    justify-between

    px-7

    animate-header
  "
      >

        {/* =====================================================
      BRAND
  ===================================================== */}

        <a
          href="/"
          aria-label="NudgeProof"
          className="
      flex
      items-center
      gap-2.5

      transition-opacity
      duration-200

      hover:opacity-70
    "
        >

          {/* LOGO IMAGE */}

          <div
            className="
        relative
        flex
        h-[28px]
        w-[28px]
        shrink-0
        items-center
        justify-center
      "
          >
            <img
              src="/nudgeproof-logo.svg"
              alt="NudgeProof"
              className="
          h-full
          w-full
          object-contain
        "
            />
          </div>


          {/* BRAND NAME */}

          <span
            className="
        text-[17px]
        font-bold
        tracking-[-0.045em]
      "
          >
            Nudgeproof
          </span>

        </a>


        {/* =====================================================
      SOCIAL LINKS
  ===================================================== */}

        <nav
          aria-label="Social media"
          className="
      absolute
      left-1/2
      top-1/2

      flex
      -translate-x-1/2
      -translate-y-1/2

      items-center
      gap-[2px]

      rounded-full
      bg-[#f1f1f1]

      px-[6px]
      py-[5px]
    "
        >

          {/* Instagram */}

          <a
            href="#"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="
        flex
        h-[28px]
        w-[28px]
        items-center
        justify-center

        rounded-full

        text-black

        transition-all
        duration-200

        hover:bg-white
        hover:-translate-y-[1px]
      "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] fill-none stroke-current"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
              />

              <circle
                cx="12"
                cy="12"
                r="4.2"
              />

              <circle
                cx="17.4"
                cy="6.6"
                r="1"
                className="fill-current stroke-none"
              />
            </svg>
          </a>

        </nav>


        {/* =====================================================
      CONTACT
  ===================================================== */}

        <button
          type="button"
          onClick={() => {
            document.getElementById("email")?.focus();
          }}
          className="
      rounded-[14px]

      bg-[#ededed]

      px-[17px]
      py-[10px]

      text-[14px]
      font-semibold
      tracking-[-0.02em]

      transition-all
      duration-200

      hover:-translate-y-0.5
      hover:bg-[#e5e5e5]

      active:translate-y-0
    "
        >
          Contact
        </button>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative
          z-20

          flex
          h-full
          w-full
          max-w-lg
          mx-auto

          flex-col
          items-center

          px-6
          pt-36

          text-center
        "
      >

        {/* ================= LAUNCH BADGE ================= */}

        <div
          className="
    animate-fade-up
    rounded-full
    bg-[#eeeeee]
    px-[14px]
    py-[9px]
    text-[17px]
    font-medium
    leading-none
    tracking-[-0.025em]
  "
          style={{
            fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
          }}
        >
          We're Launching Soon
        </div>


        {/* ================= TITLE ================= */}

        <h1
          className="
    animate-fade-up-delay-1
    mt-7
    whitespace-nowrap
    text-[clamp(56px,6vw,84px)]
    font-medium
    leading-[0.93]
    tracking-[-0.065em]
  "
          style={{
            fontFamily: '"Instrument Serif", "Instrument Serif Placeholder", serif',
          }}
        >
          Join the Waitlist
        </h1>


        {/* ================= DESCRIPTION ================= */}

        <p
          className="
            animate-fade-up-delay-2

            mt-3

            max-w-[530px]

            text-[17px]
            font-medium
            leading-[1.35]

            tracking-[-0.025em]

            text-[#888888]
          "
        >
          Join the waitlist to get early access and be the first to
          <br className="hidden sm:block" />
          hear when we officially launch.
        </p>


        {/* =================================================
            WAITLIST FORM
        ================================================= */}

        {!submitted ? (
          <>

            <form
              onSubmit={handleSubmit}
              className="
                animate-fade-up-delay-3

                mt-7

                flex

                w-[min(480px,calc(100vw-40px))]

                gap-[5px]
              "
            >

              {/* EMAIL */}

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="me@nudgeproof.com"
                required
                className="
                  h-12

                  min-w-0
                  flex-1

                  rounded-[13px]

                  border
                  border-transparent

                  bg-[#eeeeee]

                  px-4

                  text-[15px]
                  text-black

                  outline-none

                  placeholder:text-[#999999]

                  transition-all
                  duration-200

                  focus:border-[#d0d0d0]
                  focus:bg-[#f7f7f7]

                  focus:ring-4
                  focus:ring-black/[0.035]
                "
              />


              {/* JOIN */}

              <button
                type="submit"
                disabled={loading}
                className="
                  h-12

                  rounded-[13px]

                  bg-black

                  px-[29px]

                  text-[15px]
                  font-bold
                  text-white

                  transition-all
                  duration-200

                  hover:-translate-y-0.5

                  disabled:cursor-wait
                  disabled:opacity-50
                "
              >
                {loading ? "Joining..." : "Join"}
              </button>

            </form>


            {/* =================================================
                SOCIAL PROOF
            ================================================= */}

            {/* <div
              className="
    animate-fade-up-delay-4
    mt-[22px]
    text-[14px]
    tracking-[-0.015em]
    text-[#777777]
  "
            >
              Joined by <strong className="font-semibold text-black">1,200+</strong> people
            </div> */}

          </>

        ) : (

          /* =================================================
             SUCCESS
          ================================================= */

          <div
            className="
              mt-7
              animate-success
              text-center
            "
          >

            <div
              className="
                mx-auto
                mb-[15px]

                grid
                h-[58px]
                w-[58px]
                place-items-center

                rounded-full

                bg-[#eeeeee]

                text-[25px]
                text-green-500
              "
            >
              ✓
            </div>


            <h2
              className="
                font-serif

                text-[40px]
                font-medium

                tracking-[-0.05em]
              "
            >
              You're on the list.
            </h2>


            <p className="text-[15px] text-[#888888]">
              We'll let you know when we officially launch.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}