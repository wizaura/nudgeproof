"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/app/dashboard/sidebar-context";

const navigation = [
  {
    section: "Overview",
    items: [
      {
        name: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Websites",
        href: "/dashboard/websites",
        icon: Globe,
      },
      {
        name: "Widgets",
        href: "/dashboard/widgets",
        icon: Sparkles,
      },
    ],
  },
  {
    section: "Activity",
    items: [
      {
        name: "Events",
        href: "/dashboard/events",
        icon: Zap,
      },
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    section: "Connect",
    items: [
      {
        name: "Integrations",
        href: "/dashboard/integrations",
        icon: Bell,
      },
      {
        name: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const {
    collapsed,
    toggleSidebar,
  } = useSidebar();

  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== "/dashboard" &&
        pathname.startsWith(href))
    );
  }

  return (
    <>
      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-white/95 px-4 backdrop-blur-xl md:hidden">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-white shadow-[0_4px_14px_rgba(0,127,255,0.18)]">
            <Sparkles className="size-4" />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-tight text-[var(--brand-black)]">
              NudgeProof
            </div>

            <div className="text-[10px] text-muted-foreground">
              Social proof, amplified.
            </div>
          </div>
        </Link>

        {/* Menu */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open navigation"
          className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-white text-foreground transition-colors hover:bg-muted"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {!collapsed && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* =====================================================
          DESKTOP + MOBILE SIDEBAR
      ====================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-[var(--brand-black)]
          text-white
          shadow-2xl
          transition-all duration-300 ease-out

          w-[260px]

          md:shadow-none
          ${collapsed
            ? "md:w-[68px]"
            : "md:w-60"
          }

          ${collapsed
            ? "-translate-x-full md:translate-x-0"
            : "translate-x-0"
          }
        `}
      >
        {/* =================================================
            HEADER
        ================================================== */}
        <div
          className={`
            flex h-16 shrink-0 items-center
            border-b border-white/10
            ${collapsed
              ? "justify-center px-3"
              : "justify-between px-4"
            }
          `}
        >
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => {
              if (window.innerWidth < 768) {
                toggleSidebar();
              }
            }}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-blue)] text-white shadow-[0_0_20px_rgba(0,127,255,0.2)]">
              <Sparkles className="size-4" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-tight">
                  NudgeProof
                </div>

                <div className="truncate text-[10px] text-white/40">
                  Social proof, amplified.
                </div>
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close navigation"
            className="flex size-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-5">
            {navigation.map((group) => (
              <div key={group.section}>
                {!collapsed && (
                  <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
                    {group.section}
                  </div>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={
                          collapsed
                            ? item.name
                            : undefined
                        }
                        onClick={() => {
                          if (
                            window.innerWidth < 768
                          ) {
                            toggleSidebar();
                          }
                        }}
                        className={`
                          group relative flex h-10
                          items-center rounded-lg
                          transition-all duration-150

                          ${collapsed
                            ? "justify-center"
                            : "gap-3 px-3"
                          }

                          ${active
                            ? "bg-[rgba(0,127,255,0.12)] text-white"
                            : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                          }
                        `}
                      >
                        {active && (
                          <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-[var(--brand-blue)]" />
                        )}

                        <Icon
                          className={`
                            size-[17px] shrink-0
                            transition-all duration-150

                            ${active
                              ? "text-[var(--brand-blue)]"
                              : "text-white/45 group-hover:text-white/80"
                            }
                          `}
                        />

                        {!collapsed && (
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* =================================================
            BOTTOM
        ================================================== */}
        <div className="shrink-0 border-t border-white/10 p-2">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            title={
              collapsed
                ? "Settings"
                : undefined
            }
            onClick={() => {
              if (window.innerWidth < 768) {
                toggleSidebar();
              }
            }}
            className={`
              group relative mb-1 flex h-10
              items-center rounded-lg
              text-white/55
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white

              ${collapsed
                ? "justify-center"
                : "gap-3 px-3"
              }

              ${pathname.startsWith(
                "/dashboard/settings"
              )
                ? "bg-[rgba(0,127,255,0.12)] text-white"
                : ""
              }
            `}
          >
            <Settings className="size-[17px] shrink-0" />

            {!collapsed && (
              <span className="text-sm font-medium">
                Settings
              </span>
            )}
          </Link>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed
                ? "Sign out"
                : undefined
            }
            className={`
              group flex h-10 w-full
              items-center rounded-lg
              text-white/45
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white

              ${collapsed
                ? "justify-center"
                : "gap-3 px-3"
              }
            `}
          >
            <LogOut className="size-[17px] shrink-0" />

            {!collapsed && (
              <span className="text-sm font-medium">
                Sign out
              </span>
            )}
          </button>

          {/* Collapse desktop only */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`
              mt-2 hidden h-9 w-full
              items-center rounded-lg
              border border-white/10
              text-white/40
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white
              md:flex

              ${collapsed
                ? "justify-center"
                : "justify-between px-3"
              }
            `}
          >
            {!collapsed && (
              <span className="text-xs">
                Collapse
              </span>
            )}

            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}