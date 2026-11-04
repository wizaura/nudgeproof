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
  const flow = requestUrl.searchParams.get("flow") === "signup" ? "signup" : "login";
  const loginPath = flow === "signup" ? "/signup" : "/login";
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError || !code) {
    return NextResponse.redirect(new URL(`${loginPath}?error=google_auth`, origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Google OAuth callback failed:", error.message);
    return NextResponse.redirect(new URL(`${loginPath}?error=google_auth`, origin));
  }

  return NextResponse.redirect(new URL(getSafeNextPath(requestUrl.searchParams.get("next")), origin));
}
