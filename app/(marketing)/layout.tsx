
import { SiteHeader, SiteFooter } from "@/components/marketing/SiteLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader isLoggedIn={!!user} />

      <div className="min-h-screen">
        {children}
      </div>

      <SiteFooter isLoggedIn={!!user} />
    </>
  );
}