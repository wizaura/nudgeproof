import type { ReactNode } from "react";
import { AuthNav } from "@/components/auth/auth-nav";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7f2]">
      <AuthNav />
      {children}
    </div>
  );
}
