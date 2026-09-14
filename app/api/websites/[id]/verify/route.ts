import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Props
) {
  const { id } = await params;

  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get account
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

  if (
    profileError ||
    !profile?.account_id
  ) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 404 }
    );
  }

  // Get website belonging to this account
  const { data: website, error: websiteError } =
    await supabase
      .from("websites")
      .select(
        "id, name, url, site_key, installation_status"
      )
      .eq("id", id)
      .eq("account_id", profile.account_id)
      .single();

  if (
    websiteError ||
    !website
  ) {
    return NextResponse.json(
      { error: "Website not found" },
      { status: 404 }
    );
  }

  let installed = false;

  try {
    const response = await fetch(website.url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "NudgeProof-Installation-Checker/1.0",
        Accept: "text/html",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `Website returned ${response.status}`
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error(
        "Website did not return HTML"
      );
    }

    const html = await response.text();

    const scriptPattern =
      /<script\b[^>]*src=["'][^"']*\/v1\.js(?:\?[^"']*)?["'][^>]*>/i;

    const sitePattern = new RegExp(
      `(?:data-site|data-site-key)=["']${escapeRegExp(
        website.site_key
      )}["']`,
      "i"
    );

    installed =
      scriptPattern.test(html) &&
      sitePattern.test(html);
  } catch (error) {
    console.error(
      "Installation verification failed:",
      error
    );

    await supabase
      .from("websites")
      .update({
        installation_status: "failed",
        installation_checked_at:
          new Date().toISOString(),
      })
      .eq("id", website.id);

    return NextResponse.json({
      installed: false,
      status: "failed",
      message:
        "We couldn't access your website. Make sure the URL is publicly accessible and try again.",
      checked_at:
        new Date().toISOString(),
    });
  }

  const status = installed
    ? "installed"
    : "failed";

  const checkedAt =
    new Date().toISOString();

  await supabase
    .from("websites")
    .update({
      installation_status: status,
      installation_checked_at: checkedAt,
    })
    .eq("id", website.id);

  return NextResponse.json({
    installed,
    status,
    checked_at: checkedAt,
    message: installed
      ? "NudgeProof is installed correctly."
      : "We couldn't find the NudgeProof installation on your website.",
  });
}

function escapeRegExp(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}