// src/components/ui/empty-state.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center",
                className
            )}
        >
            {icon && (
                <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/50">
                    {icon}
                </div>
            )}

            <h3 className="mt-4 text-sm font-semibold">
                {title}
            </h3>

            {description && (
                <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}