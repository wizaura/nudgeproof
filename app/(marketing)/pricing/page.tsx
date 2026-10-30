import type { Metadata } from "next";
import PricingMain from "@/components/marketing/pricing/Main";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare NudgeProof plans for social proof notifications. Start with the free plan and choose a paid plan when you need more impressions and features.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "NudgeProof Pricing — Simple plans for social proof",
    description: "See plan limits, features, and pricing for NudgeProof social proof widgets.",
    url: "/pricing",
    siteName: "NudgeProof",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function PricingPage() {
  return <PricingMain />;
}
