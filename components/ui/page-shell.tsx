// src/components/dashboard/page-shell.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
    children: React.ReactNode;
    className?: string;
};

export function PageShell({
    children,
    className,
}: PageShellProps) {
    return (
        <main
            className={cn(
                "mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8",
                className
            )}
        >
            {children}
        </main>
    );
}