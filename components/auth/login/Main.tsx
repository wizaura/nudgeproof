"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your NudgeProof account and pick up where you left off."
      footer={
        <p className="text-center text-sm text-neutral-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[#171717] underline decoration-[#a8cf25] decoration-2 underline-offset-4">Create one</Link>
        </p>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-800">Email address</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3"><label htmlFor="password" className="text-sm font-semibold text-neutral-800">Password</label><a href="mailto:hello@nudgeproof.com?subject=Help%20with%20my%20password" className="text-sm font-medium text-neutral-500 underline underline-offset-4 hover:text-neutral-900">Forgot password?</a></div>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
        </div>
        {error && <p role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#202b23] px-5 text-base font-semibold text-white transition hover:bg-[#394d3d] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Logging in…" : "Log in"}<span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span></button>
      </form>
    </AuthShell>
  );
}
