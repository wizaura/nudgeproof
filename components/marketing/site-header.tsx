import Link from "next/link";

type AuthAwareProps = { isLoggedIn: boolean };

export function SiteHeader({ isLoggedIn }: AuthAwareProps) {
  return (
    <header className="fixed w-full top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="NudgeProof home">
          <img src="/nudgeproof-logo.svg" alt="" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-[-0.05em]">NudgeProof</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-neutral-600 lg:flex">
          <Link className="transition hover:text-black" href="/#product">Product</Link>
          <Link className="transition hover:text-black" href="/#how-it-works">How it works</Link>
          <Link className="transition hover:text-black" href="/pricing">Pricing</Link>
          <Link className="transition hover:text-black" href="/#faq">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn && <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-100 sm:inline-flex">Log in</Link>}
          <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#303030] sm:px-5">
            {isLoggedIn ? "Dashboard" : "Get started"} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ isLoggedIn }: AuthAwareProps) {
  return (
    <footer className="border-t border-black/10 bg-[#f8f8f5]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="NudgeProof home">
          <img src="/nudgeproof-logo.svg" alt="" className="h-8 w-8" />
          <span className="text-lg font-bold tracking-[-0.05em]">NudgeProof</span>
        </Link>
        <p className="max-w-md text-sm leading-6 text-neutral-600">Simple social proof notifications that help visitors feel more confident about taking the next step.</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-neutral-600">
          <Link href="/pricing" className="hover:text-black">Pricing</Link>
          <Link href="/#product" className="hover:text-black">Product</Link>
          <a href="mailto:hello@nudgeproof.com" className="hover:text-black">Contact</a>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-black">{isLoggedIn ? "Dashboard" : "Log in"}</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t border-black/[0.06] px-5 py-5 text-xs text-neutral-500 sm:px-8">© {new Date().getFullYear()} NudgeProof. Built to make trust feel natural.</div>
    </footer>
  );
}
