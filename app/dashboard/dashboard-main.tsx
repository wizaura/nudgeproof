"use client";

import { useSidebar } from "./sidebar-context";

export function DashboardMain({
    children,
}: {
    children: React.ReactNode;
}) {
    const { collapsed } = useSidebar();

    return (
        <main
            className={`
                min-h-screen
                pt-16 sm:pt-0
                transition-[padding-left]
                duration-200
                ease-in-out

                ${
                    collapsed
                        ? "md:pl-[68px]"
                        : "md:pl-60"
                }
            `}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    );
}