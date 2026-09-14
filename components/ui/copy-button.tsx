// src/components/ui/copy-button.tsx

"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
    value: string;
    className?: string;
};

export function CopyButton({
    value,
    className,
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error("Copy failed:", error);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                "flex shrink-0 items-center gap-2 border-l px-3 text-sm transition-colors hover:bg-muted",
                className
            )}
        >
            {copied ? (
                <>
                    <Check className="size-4" />
                    Copied
                </>
            ) : (
                <>
                    <Copy className="size-4" />
                    Copy
                </>
            )}
        </button>
    );
}