// src/components/ui/input.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn(
                "flex h-9 w-full rounded-lg border bg-background px-3 text-sm",
                "placeholder:text-muted-foreground",
                "outline-none transition-colors",
                "focus:border-ring focus:ring-2 focus:ring-ring/20",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}