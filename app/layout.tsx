import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nudgeproof.com"),
  title: {
    default: "NudgeProof — Social proof that feels human",
    template: "%s | NudgeProof",
  },
  description:
    "Show recent customer activity with lightweight social proof notifications for your website.",
  applicationName: "NudgeProof",
  keywords: [
    "social proof notifications",
    "website social proof",
    "social proof widgets",
    "purchase notifications",
    "website conversion tools",
  ],
  openGraph: {
    title: "NudgeProof — Social proof that feels human",
    description:
      "Show recent customer activity in thoughtful, on-brand website notifications.",
    siteName: "NudgeProof",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NudgeProof — Social proof that feels human",
    description:
      "Show recent customer activity in thoughtful, on-brand website notifications.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
