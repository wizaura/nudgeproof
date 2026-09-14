// src/components/ui/textarea.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                "min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm",
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