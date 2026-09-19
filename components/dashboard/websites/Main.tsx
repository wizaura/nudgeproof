import { createClient } from "@/lib/supabase/server";
import {
    Globe,
    Plus,
    ArrowUpRight,
    Code2,
    BarChart3,
    Settings,
    Zap,
    ExternalLink,
    Copy,
} from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default async function Websites() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    const { data: websites } = profile?.account_id
        ? await supabase
              .from("websites")
              .select("*")
              .eq("account_id", profile.account_id)
              .order("created_at", { ascending: false })
        : { data: [] };

    return (
        <PageShell>
            <PageHeader
                title="Websites"
                description="Manage the websites using NudgeProof."
                action={
                    <Link href="/dashboard/websites/new">
                        <Button className="h-10 px-4">
                            <Plus className="size-4" />
                            Add website
                        </Button>
                    </Link>
                }
            />

            {websites && websites.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {websites.map((website) => (
                        <Link
                            key={website.id}
                            href={`/dashboard/websites/${website.id}`}
                            className="group block"
                        >
                            <Card
                                className="
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-border/70
                                    bg-white
                                    shadow-[0_1px_3px_rgba(0,0,0,0.03)]
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:border-primary/20
                                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                                "
                            >
                                {/* =========================
                                    HEADER
                                ========================= */}

                                <div className="px-4 pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className="
                                                    flex
                                                    size-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-primary/10
                                                    bg-primary/[0.06]
                                                "
                                            >
                                                <Globe className="size-[18px] text-primary" />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="truncate text-[13px] font-semibold tracking-tight">
                                                        {website.name}
                                                    </h2>

                                                    <ExternalLink className="size-3 shrink-0 text-muted-foreground/60" />
                                                </div>

                                                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                                    Production · NudgeProof
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={website.status} />
                                    </div>
                                </div>

                                {/* =========================
                                    SITE KEY
                                ========================= */}

                                <div className="px-4 pt-4">
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                            rounded-lg
                                            border
                                            border-border/60
                                            bg-muted/[0.35]
                                            px-3
                                            py-2
                                        "
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                                Site key
                                            </p>

                                            <p className="mt-0.5 truncate font-mono text-[10px] text-foreground/70">
                                                {website.site_key}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* =========================
                                    METRICS UI
                                    ========================= */}

                                {/* <div className="grid grid-cols-3 gap-2 px-4 pt-3">
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-border/60
                                            bg-muted/[0.25]
                                            px-3
                                            py-2.5
                                        "
                                    >
                                        <p className="text-[8px] font-medium text-muted-foreground">
                                            Nudges
                                        </p>

                                        <p className="mt-1 text-[16px] font-semibold tracking-tight">
                                            —
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-border/60
                                            bg-muted/[0.25]
                                            px-3
                                            py-2.5
                                        "
                                    >
                                        <p className="text-[8px] font-medium text-muted-foreground">
                                            Conv. Rate
                                        </p>

                                        <p className="mt-1 text-[16px] font-semibold tracking-tight">
                                            —
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-border/60
                                            bg-muted/[0.25]
                                            px-3
                                            py-2.5
                                        "
                                    >
                                        <p className="text-[8px] font-medium text-muted-foreground">
                                            Latency
                                        </p>

                                        <p className="mt-1 text-[16px] font-semibold tracking-tight">
                                            —
                                        </p>

                                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>
                                </div> */}

                                {/* =========================
                                    WIDGET PREVIEW
                                ========================= */}

                                <div className="px-4 pt-3">
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-xl
                                            border
                                            border-primary/10
                                            bg-primary/[0.035]
                                            px-3
                                            py-2.5
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                size-7
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-primary/10
                                            "
                                        >
                                            <Zap className="size-3.5 text-primary" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[10px] font-medium">
                                                NudgeProof Widget
                                            </p>

                                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                                                Ready to configure
                                            </p>
                                        </div>

                                        <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </div>
                                </div>

                                {/* =========================
                                    DIVIDER
                                ========================= */}

                                {/* <div className="mx-4 mt-4 border-t border-border/50" /> */}

                                {/* =========================
                                    FOOTER
                                ========================= */}

                                <div className="flex items-center justify-end px-4 py-3">
                                    {/* <div className="flex items-center gap-2">
                                        <div
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-lg
                                                border
                                                border-border/60
                                                px-2.5
                                                py-1.5
                                                text-[9px]
                                                font-medium
                                                text-muted-foreground
                                                transition-colors
                                                group-hover:border-primary/15
                                                group-hover:text-foreground
                                            "
                                        >
                                            <Code2 className="size-3" />
                                            Get Snippet
                                        </div>

                                        <div
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-lg
                                                border
                                                border-border/60
                                                px-2.5
                                                py-1.5
                                                text-[9px]
                                                font-medium
                                                text-muted-foreground
                                                transition-colors
                                                group-hover:border-primary/15
                                                group-hover:text-foreground
                                            "
                                        >
                                            <BarChart3 className="size-3" />
                                            Analytics
                                        </div>
                                    </div> */}

                                    {/* <div
                                        className="
                                            flex
                                            size-7
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-muted-foreground
                                            transition-colors
                                            group-hover:bg-primary/5
                                            group-hover:text-primary
                                        "
                                    >
                                        <Settings className="size-3.5" />
                                    </div> */}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <EmptyState
                        icon={<Globe className="size-5" />}
                        title="No websites yet"
                        description="Add your first website to start creating NudgeProof widgets."
                        action={
                            <Link href="/dashboard/websites/new">
                                <Button>
                                    <Plus className="size-4" />
                                    Add website
                                </Button>
                            </Link>
                        }
                    />
                </Card>
            )}
        </PageShell>
    );
}