// src/components/ui/status-badge.tsx

import { Badge } from "./badge";

type StatusBadgeProps = {
    status: string;
};

export function StatusBadge({
    status,
}: StatusBadgeProps) {
    const normalized = status.toLowerCase();

    if (normalized === "active") {
        return (
            <Badge variant="success">
                <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                Active
            </Badge>
        );
    }

    if (normalized === "draft") {
        return (
            <Badge variant="secondary">
                Draft
            </Badge>
        );
    }

    if (
        normalized === "paused" ||
        normalized === "inactive"
    ) {
        return (
            <Badge variant="warning">
                {status}
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            {status}
        </Badge>
    );
}