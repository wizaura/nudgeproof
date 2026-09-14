// src/components/ui/button.tsx

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: "sm" | "default" | "lg" | "icon";
};

export function Button({
    className,
    variant = "primary",
    size = "default",
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",

                variant === "primary" &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",

                variant === "secondary" &&
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",

                variant === "outline" &&
                    "border bg-background hover:bg-muted",

                variant === "ghost" &&
                    "hover:bg-muted",

                variant === "destructive" &&
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",

                size === "sm" && "h-8 px-3 text-xs",
                size === "default" && "h-9 px-3.5 text-sm",
                size === "lg" && "h-10 px-4 text-sm",
                size === "icon" && "size-9",

                className
            )}
            {...props}
        />
    );
}