import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(requestUrl.hostname);
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nudgeproof.com";
  const origin = isLocalDevelopment ? requestUrl.origin : new URL(configuredAppUrl).origin;
  const code = requestUrl.searchParams.get("code");
  const authError = requestUrl.searchParams.get("error");

  if (authError || !code) {
    return NextResponse.redirect(new URL("/forgot-password?error=recovery_link", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase password recovery callback failed:", error.message);
    return NextResponse.redirect(new URL("/forgot-password?error=recovery_link", origin));
  }

  return NextResponse.redirect(new URL("/reset-password", origin));
}
