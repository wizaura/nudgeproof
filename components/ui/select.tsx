// src/components/ui/select.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
    className,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(
                "h-9 w-full rounded-lg border bg-background px-3 text-sm",
                "outline-none transition-colors",
                "focus:border-ring focus:ring-2 focus:ring-ring/20",
                className
            )}
            {...props}
        />
    );
}