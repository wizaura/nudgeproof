import { SiteFooter, SiteHeader } from "@/components/marketing/SiteLayout";
import { HeroSection } from "@/components/marketing/hero-section";
import { FaqSection, FinalCtaSection, OrganizationSchema, PricingSection, UseCasesSection } from "@/components/marketing/sections";
import { NotificationShowcase } from "./NotificationSection";
import { ProductSection } from "./ProductSection";
import { HowItWorksSection } from "./HowItWorks";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingMain() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171717]">
      <OrganizationSchema />
      <HeroSection isLoggedIn={isLoggedIn} />
      <NotificationShowcase />
      <ProductSection isLoggedIn={isLoggedIn} />
      <HowItWorksSection isLoggedIn={isLoggedIn} />
      <UseCasesSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection isLoggedIn={isLoggedIn} />
    </main>
  );
}
