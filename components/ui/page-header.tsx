// src/components/ui/page-header.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export function PageHeader({
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "mb-7 border-b border-border/60 pb-6",
                className
            )}
        >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                {/* Content */}
                <div className="min-w-0">
                    {/* Eyebrow */}
                    <div className="mb-2.5 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Dashboard
                        </span>
                    </div>

                    {/* Title */}
                    <h1
                        className="
                            text-[28px]
                            font-semibold
                            leading-none
                            tracking-[-0.035em]
                            text-foreground
                            sm:text-[30px]
                        "
                    >
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p
                            className="
                                mt-2.5
                                max-w-2xl
                                text-[13px]
                                leading-5
                                tracking-[-0.01em]
                                text-muted-foreground
                            "
                        >
                            {description}
                        </p>
                    )}
                </div>

                {/* Action */}
                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}