"use client";

import { useState } from "react";
import WidgetEditor from "./widget-editor";
import WidgetPreview from "./widget-preview";

type WidgetStatus =
    | "draft"
    | "active"
    | "paused";

type WidgetType =
    | "recent_sales"
    | "live_visitors"
    | "review"
    | "announcement";

type WidgetConfig = Record<string, any>;

type WidgetWorkspaceProps = {
    widget: {
        id: string;
        name: string;
        type: WidgetType;
        config: WidgetConfig;
        status: WidgetStatus;
    };
};

export default function WidgetWorkspace({
    widget,
}: WidgetWorkspaceProps) {
    const [name, setName] = useState(widget.name);

    const [config, setConfig] = useState<WidgetConfig>(
        widget.config ?? {}
    );

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Main editor */}
            <div className="min-w-0">
                <WidgetEditor
                    widget={{
                        ...widget,
                        name,
                        config,
                    }}
                    onNameChange={setName}
                    onConfigChange={setConfig}
                />
            </div>

            {/* Preview */}
            <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
                <div className="mb-3">
                    <h2 className="text-sm font-semibold">
                        Preview
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        See how this notification will appear on your website.
                    </p>
                </div>

                <WidgetPreview
                    type={widget.type}
                    config={config}
                />
            </aside>
        </div>
    );
}