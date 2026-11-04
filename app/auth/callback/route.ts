import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(requestUrl.hostname);
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nudgeproof.com";
  const origin = isLocalDevelopment ? requestUrl.origin : new URL(configuredAppUrl).origin;
  const flow = requestUrl.searchParams.get("flow");
  const errorPath = flow === "recovery" ? "/reset-password" : flow === "signup" ? "/signup" : "/login";
  const errorCode = flow === "recovery" ? "recovery_link" : "google_auth";
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError || !code) {
    const target = new URL(errorPath, origin);
    target.searchParams.set("error", errorCode);
    return NextResponse.redirect(target);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase auth callback failed:", error.message);
    const target = new URL(errorPath, origin);
    target.searchParams.set("error", errorCode);
    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(new URL(getSafeNextPath(requestUrl.searchParams.get("next")), origin));
}
