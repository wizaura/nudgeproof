"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const appOrigin = isLocalDevelopment
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://nudgeproof.com";
      const recoveryUrl = new URL("/auth/callback", appOrigin);
      recoveryUrl.searchParams.set("next", "/reset-password");
      recoveryUrl.searchParams.set("flow", "recovery");

      const { error: requestError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: recoveryUrl.toString(),
      });

      if (requestError) throw requestError;
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address for your account and we’ll send you a secure reset link."
      footer={<p className="text-center text-sm text-neutral-600">Remembered your password? <Link href="/login" className="font-semibold text-[#171717] underline decoration-[#a8cf25] decoration-2 underline-offset-4">Log in</Link></p>}
    >
      {sent ? (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          If an account matches <strong className="font-semibold">{email}</strong>, a password reset link is on its way. Check your inbox and spam folder.
          <p className="mt-2 text-emerald-800">The link expires after one hour. You can request another link if it expires.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="recovery-email" className="block text-sm font-semibold text-neutral-800">Email address</label>
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition placeholder:text-neutral-400 focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15"
            />
          </div>
          {error && <p role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-full bg-[#202b23] px-5 text-base font-semibold text-white transition hover:bg-[#394d3d] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Sending link…" : "Send reset link"}
          </button>
          <p className="text-center text-xs leading-5 text-neutral-500">For your security, this page won’t reveal whether an email address has an account.</p>
        </form>
      )}
    </AuthShell>
  );
}
