"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Signup() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          onboarding_completed: false,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push("/login");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start turning real activity into social proof for your website."
      footer={
        <p className="text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#171717] underline decoration-[#a8cf25] decoration-2 underline-offset-4">Log in</Link>
        </p>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-semibold text-neutral-800">Full name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-800">Email address</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-neutral-800">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
          <p className="text-xs leading-5 text-neutral-500">Use at least 8 characters.</p>
        </div>
        {error && <p role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#202b23] px-5 text-base font-semibold text-white transition hover:bg-[#394d3d] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create account"}<span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span></button>
      </form>
    </AuthShell>
  );
}
