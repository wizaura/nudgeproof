"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  disabled?: boolean;
  onError: (message: string) => void;
  onStart: () => void;
  onFinish: () => void;
};

export function GoogleAuthButton({ disabled, onError, onStart, onFinish }: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    onError("");
    onStart();

    try {
      const supabase = createClient();
      const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const appOrigin = isLocalDevelopment
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://nudgeproof.com";
      const callbackUrl = new URL("/auth/callback", appOrigin);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) throw error;
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to start Google sign-in. Please try again.");
      setLoading(false);
      onFinish();
    }
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={disabled || loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 text-base font-semibold text-[#202124] shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bc85d]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-5 w-5 animate-spin text-neutral-500" />
      ) : (
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.65 5.94c4.47-4.13 7.12-10.2 7.12-17.59Z" />
          <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.65-5.94c-2.12 1.42-4.84 2.26-8.25 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
        </svg>
      )}
      {loading ? "Connecting to Google…" : "Continue with Google"}
    </button>
  );
}
