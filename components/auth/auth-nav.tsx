"use client";

import Link from "next/link";
import { ArrowRight, House } from "lucide-react";
import { usePathname } from "next/navigation";

export function AuthNav() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const action = isLoginPage
    ? { label: "Create account", href: "/signup" }
    : { label: "Log in", href: "/login" };

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <nav aria-label="Account navigation" className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NudgeProof home">
          <img src="/nudgeproof-logo.svg" alt="" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-[-.05em] text-[#171717]">NudgeProof</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-[#171717] sm:px-4">
            <House className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link href={action.href} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#202b23] px-4 text-sm font-semibold text-white transition hover:bg-[#394d3d] sm:px-5">
            {action.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
