import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createClient } from "@/lib/supabase/server";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment:
        process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
            ? "live_mode"
            : "test_mode",
});

const PRODUCT_IDS = {
    plus: process.env.DODO_PLUS_PRODUCT_ID!,
    pro: process.env.DODO_PRO_PRODUCT_ID!,
} as const;

type Plan = keyof typeof PRODUCT_IDS;

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const plan = body?.plan as Plan;

        if (plan !== "plus" && plan !== "pro") {
            return NextResponse.json(
                { error: "Invalid plan" },
                { status: 400 }
            );
        }

        const productId = PRODUCT_IDS[plan];

        if (!productId) {
            return NextResponse.json(
                { error: "Dodo product is not configured" },
                { status: 500 }
            );
        }

        /*
         * Get the account belonging to the authenticated user.
         */
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile?.account_id) {
            console.error("Profile/account lookup error:", profileError);

            return NextResponse.json(
                { error: "Account not found" },
                { status: 404 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!appUrl) {
            return NextResponse.json(
                { error: "NEXT_PUBLIC_APP_URL is not configured" },
                { status: 500 }
            );
        }

        const session = await dodo.checkoutSessions.create({
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                },
            ],

            customer: {
                email: user.email!,
            },

            metadata: {
                account_id: profile.account_id,
                user_id: user.id,
                plan,
            },

            return_url: `${appUrl}/dashboard/settings/billing`,
        });

        if (!session.checkout_url) {
            return NextResponse.json(
                { error: "Checkout URL was not returned" },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            checkoutUrl: session.checkout_url,
        });
    } catch (error) {
        console.error("Dodo checkout error:", error);

        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}