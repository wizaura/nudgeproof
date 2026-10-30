import type { Metadata } from "next";
import MarketingMain from "@/components/marketing/Main";

export const metadata: Metadata = {
  title: "Social Proof Notifications for Your Website",
  description: "Show real recent customer activity with lightweight social proof notifications. Set up NudgeProof widgets for your website in minutes.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NudgeProof — Social proof, made human",
    description: "Show recent customer activity in thoughtful, on-brand notifications.",
    url: "/",
    siteName: "NudgeProof",
    type: "website",
  },
};

export default function Page() {
  return <MarketingMain />;
}
