// src/components/ui/section-card.tsx

import * as React from "react";
import { Card } from "./card";

type SectionCardProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
};

export function SectionCard({
    title,
    description,
    children,
    action,
}: SectionCardProps) {
    return (
        <Card>
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>

            <div className="p-5">
                {children}
            </div>
        </Card>
    );
}