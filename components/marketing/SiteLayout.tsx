
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

type AuthAwareProps = { isLoggedIn: boolean };

export function SiteHeader({ isLoggedIn }: AuthAwareProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { label: "Product", href: "/#product" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:h-[76px] sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5"
          aria-label="NudgeProof home"
        >
          <img src="/nudgeproof-logo.svg" alt="" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-[-0.05em]">
            NudgeProof
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm font-medium text-neutral-600 lg:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-black"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
          {!isLoggedIn && (
            <Link
              href="/login"
              className="rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-100"
            >
              Log in
            </Link>
          )}

          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#303030]"
          >
            {isLoggedIn ? "Dashboard" : "Get started"}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#141414] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#303030] sm:text-sm"
          >
            {isLoggedIn ? "Dashboard" : "Get started"}
            <ArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-black/[0.06] bg-white transition-all duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen
            ? "visible max-h-[360px] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-black/[0.05] py-4 text-sm font-medium text-neutral-700 transition hover:text-black"
            >
              {link.label}
              <ArrowUpRight size={15} className="text-neutral-400" />
            </Link>
          ))}

          {!isLoggedIn && (
            <Link
              href="/login"
              onClick={closeMenu}
              className="py-4 text-sm font-semibold text-neutral-600 transition hover:text-black"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ isLoggedIn }: AuthAwareProps) {
  return (
    <footer className="border-t border-black/10 bg-[#f8f8f5]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="NudgeProof home"
        >
          <img src="/nudgeproof-logo.svg" alt="" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-[-0.05em]">
            NudgeProof
          </span>
        </Link>

        <p className="max-w-md text-sm leading-6 text-neutral-600">
          Simple social proof notifications that help visitors feel more
          confident about taking the next step.
        </p>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-neutral-600"
        >
          <Link href="/pricing" className="hover:text-black">
            Pricing
          </Link>
          <Link href="/#product" className="hover:text-black">
            Product
          </Link>
          <a href="mailto:hello@nudgeproof.com" className="hover:text-black">
            Contact
          </a>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="hover:text-black"
          >
            {isLoggedIn ? "Dashboard" : "Log in"}
          </Link>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl border-t border-black/[0.06] px-5 py-5 text-xs text-neutral-500 sm:px-8">
        © {new Date().getFullYear()} NudgeProof. Built to make trust feel
        natural.
      </div>
    </footer>
  );
}