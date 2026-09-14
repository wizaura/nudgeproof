import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("account_id")
                .eq("user_id", user.id)
                .single();

        if (profileError || !profile?.account_id) {
            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        const { data: websites, error } = await supabase
            .from("websites")
            .select(
                "id, name, url, site_key, status, created_at"
            )
            .eq("account_id", profile.account_id)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(error);

            return NextResponse.json(
                { error: "Failed to load websites" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            websites: websites ?? [],
        });
    } catch (error) {
        console.error("GET /api/websites error:", error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const url =
      typeof body.url === "string" ? body.url.trim() : "";

    // 3. Validate input
    if (!name) {
      return NextResponse.json(
        { error: "Website name is required" },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid website URL" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Website URL must use HTTP or HTTPS" },
        { status: 400 }
      );
    }

    // 4. Get user's account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile?.account_id) {
      console.error("Profile lookup error:", profileError);

      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // 5. Generate public site key
    const siteKey = `site_${randomBytes(16).toString("hex")}`;

    // 6. Generate private webhook secret
    const webhookSecret = `whsec_${randomBytes(32).toString("hex")}`;

    // 7. Insert website
    const { data: website, error: websiteError } = await supabase
      .from("websites")
      .insert({
        account_id: profile.account_id,
        name,
        url: parsedUrl.toString(),
        site_key: siteKey,
        webhook_secret: webhookSecret,
        status: "active",
      })
      .select()
      .single();

    if (websiteError) {
      console.error("Website creation error:", websiteError);

      return NextResponse.json(
        { error: "Failed to create website" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        website,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected website creation error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}