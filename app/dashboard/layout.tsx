import { Sidebar } from "../../components/dashboard/sidebar";
import { SidebarProvider } from "./sidebar-context";
import { DashboardMain } from "./dashboard-main";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <DashboardMain>
          {children}
        </DashboardMain>
      </div>
    </SidebarProvider>
  );
}