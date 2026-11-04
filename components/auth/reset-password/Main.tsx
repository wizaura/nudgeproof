"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";

type RecoveryState = "checking" | "ready" | "invalid" | "updated";

export default function ResetPassword() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("error") === "recovery_link") {
      setRecoveryState("invalid");
      return;
    }

    let active = true;
    createClient().auth.getUser()
      .then(({ data, error: userError }) => {
        if (!active) return;
        setRecoveryState(!userError && data.user ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setRecoveryState("invalid");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don’t match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;

      setPassword("");
      setConfirmPassword("");
      setRecoveryState("updated");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update your password. Please request a new link and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={recoveryState === "updated" ? "Password updated" : "Choose a new password"}
      description={recoveryState === "updated" ? "Your password has been changed. You can now log in with it." : "Set a new password for your NudgeProof account."}
      footer={<p className="text-center text-sm text-neutral-600">Back to <Link href="/login" className="font-semibold text-[#171717] underline decoration-[#a8cf25] decoration-2 underline-offset-4">Log in</Link></p>}
    >
      {recoveryState === "checking" ? (
        <p role="status" className="text-center text-sm text-neutral-600">Checking your reset link…</p>
      ) : recoveryState === "invalid" ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          This reset link is invalid, expired, or has already been used. Request a new link to continue.
          <Link href="/forgot-password" className="mt-4 inline-flex font-semibold underline underline-offset-4">Request a new reset link</Link>
        </div>
      ) : recoveryState === "updated" ? (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
          Your password is ready to use.
          <Link href="/login" className="mt-4 inline-flex font-semibold underline underline-offset-4">Continue to log in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-semibold text-neutral-800">New password</label>
            <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-neutral-800">Confirm new password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base outline-none transition focus:border-[#7fa83b] focus:ring-4 focus:ring-[#9bc85d]/15" />
          </div>
          {error && <p role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-full bg-[#202b23] px-5 text-base font-semibold text-white transition hover:bg-[#394d3d] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Updating password…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
