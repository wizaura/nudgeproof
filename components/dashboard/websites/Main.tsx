import { createClient } from "@/lib/supabase/server";
import {
    Globe,
    Plus,
    ArrowUpRight,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-3">
                    {websites.map((website) => (
                        <Link
                            key={website.id}
                            href={`/dashboard/websites/${website.id}`}
                            className="group block"
                        >
                            <div className="relative overflow-hidden rounded-2xl p-px">
                                {/* Animated border */}
                                <div className="pointer-events-none absolute inset-[-100%] hidden animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_45%,#007fff_50%,transparent_55%,transparent_100%)] opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100" />

                                {/* Card */}
                                <Card
                                    className="
                                        relative rounded-[15px]
                                        border border-2 border-primary/15
                                        shadow-[0_1px_3px_rgba(0,127,255,0.04)]
                                        transition-all duration-300
                                        group-hover:-translate-y-0.5
                                        group-hover:border-primary/40
                                        group-hover:shadow-[0_8px_30px_rgba(0,127,255,0.10)]
                                    "
                                >                                    <div className="flex min-h-[92px] items-center gap-4 px-5 py-4 sm:px-6">
                                        {/* Website icon */}
                                        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.07] transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary/10">
                                            <Globe className="size-5 text-primary transition-transform duration-300 group-hover:scale-105" />
                                        </div>

                                        {/* Website details */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2.5">
                                                <h2 className="truncate text-sm font-semibold tracking-tight">
                                                    {website.name}
                                                </h2>

                                                <StatusBadge
                                                    status={website.status}
                                                />
                                            </div>

                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                {website.url}
                                            </p>
                                        </div>

                                        {/* Site ID */}
                                        <div className="hidden w-[210px] lg:block">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Site ID
                                            </p>

                                            <p className="mt-1 truncate font-mono text-xs text-muted-foreground/80">
                                                {website.site_key}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-300 group-hover:bg-primary/5 group-hover:text-primary">
                                            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
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