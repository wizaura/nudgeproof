// src/components/ui/badge.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline" | "success" | "warning";
};

export function Badge({
    className,
    variant = "default",
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

                variant === "default" &&
                    "bg-primary text-primary-foreground",

                variant === "secondary" &&
                    "bg-secondary text-secondary-foreground",

                variant === "outline" &&
                    "border bg-background",

                variant === "success" &&
                    "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

                variant === "warning" &&
                    "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",

                className
            )}
            {...props}
        />
    );
}