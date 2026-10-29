import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f6f7f2] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[1.75rem] border border-black/[.06] bg-white shadow-[0_24px_80px_rgba(25,35,24,.08)] sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] lg:grid-cols-[1.04fr_.96fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#e9f2dd] p-10 lg:flex xl:p-14">
          <div aria-hidden="true" className="absolute -right-12 -top-14 h-64 w-64 rounded-full bg-[#d7e9b5]" />
          <div aria-hidden="true" className="absolute bottom-20 right-12 rotate-12 text-6xl">✨</div>
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NudgeProof home">
              <img src="/nudgeproof-logo.svg" alt="" className="h-9 w-9" />
              <span className="text-xl font-bold tracking-[-.05em]">NudgeProof</span>
            </Link>
            <p className="mt-20 max-w-lg text-5xl font-medium leading-[1.02] tracking-[-.065em] xl:text-6xl">A little proof can go a long way.</p>
            <p className="mt-5 max-w-md text-lg leading-8 text-neutral-600">Give your visitors a clearer picture of the people already choosing you.</p>
          </div>
          <div className="relative rounded-2xl border border-black/[.06] bg-white/90 p-5 shadow-[0_14px_40px_rgba(31,48,58,.08)]">
            <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f0f7d6] text-xl">🛍️</span><div><p className="text-sm font-semibold">A new order just came in</p><p className="mt-1 text-xs text-neutral-500">Example activity · just now</p></div><span className="ml-auto mt-2 h-2 w-2 rounded-full bg-emerald-500" /></div>
            <div className="mt-4 flex items-center gap-2 border-t border-black/[.06] pt-3 text-xs text-neutral-500"><Check className="h-3.5 w-3.5 text-emerald-600" /> A sample of what your widget can look like</div>
          </div>
          <Link href="/" className="relative inline-flex w-fit items-center gap-1 text-sm font-medium text-neutral-600 transition hover:text-black">Back to NudgeProof <ArrowUpRight className="h-4 w-4" /></Link>
        </aside>

        <section className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="NudgeProof home"><img src="/nudgeproof-logo.svg" alt="" className="h-8 w-8" /><span className="text-lg font-bold tracking-[-.05em]">NudgeProof</span></Link>
            <Link href="/" className="text-sm font-medium text-neutral-500 hover:text-black">Home</Link>
          </div>
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold text-blue-700">NudgeProof account</p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-.06em] text-[#171717] sm:text-5xl">{title}</h1>
            <p className="mt-3 text-base leading-7 text-neutral-600">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-black/[.07] pt-6">{footer}</div>
          </div>
          <p className="mt-10 text-center text-xs text-neutral-400">By continuing, you agree to use NudgeProof responsibly and only display activity you’re allowed to share.</p>
        </section>
      </div>
    </main>
  );
}
