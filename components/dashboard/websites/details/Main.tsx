import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    Code2,
    Copy,
    Globe,
    ShieldCheck,
    Sparkles,
    ExternalLink,
    Settings,
} from "lucide-react";

import { CopyButton } from "./copy-button";
import { InstallationStatus } from "./installation-status";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";

type Props = {
    id: string;
};

export default async function WebsiteDetails({ id }: Props) {
    const supabase = await createClient();

    // ------------------------------------------------------------
    // Authentication
    // ------------------------------------------------------------

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // ------------------------------------------------------------
    // Account
    // ------------------------------------------------------------

    const { data: profile } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("user_id", user.id)
        .single();

    if (!profile?.account_id) {
        notFound();
    }

    // ------------------------------------------------------------
    // Website
    // ------------------------------------------------------------

    const { data: website, error } = await supabase
        .from("websites")
        .select(
            `
                id,
                name,
                url,
                site_key,
                status,
                created_at,
                installation_status,
                installation_checked_at
            `
        )
        .eq("id", id)
        .eq("account_id", profile.account_id)
        .single();

    if (error || !website) {
        notFound();
    }

    // ------------------------------------------------------------
    // Installation snippet
    // ------------------------------------------------------------

    const installationCode = `<script
  src="https://cdn.nudgeproof.com/v1.js"
  data-site="${website.site_key}"
  async
></script>`;

    return (
        <PageShell>
            <div className="space-y-7 pb-10">
                {/* =================================================
                    BACK
                ================================================= */}

                <Link
                    href="/dashboard/websites"
                    className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        text-xs
                        font-medium
                        text-muted-foreground
                        transition-colors
                        hover:text-foreground
                    "
                >
                    <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Back to websites
                </Link>

                {/* =================================================
                    WEBSITE HEADER
                ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-border/70
                        bg-white
                        shadow-[0_1px_3px_rgba(0,0,0,0.03)]
                    "
                >
                    {/* subtle background glow */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-24
                            size-64
                            rounded-full
                            bg-primary/[0.055]
                            blur-3xl
                        "
                    />

                    <div className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            {/* Identity */}

                            <div className="flex min-w-0 items-center gap-4">
                                <div
                                    className="
                                        flex
                                        size-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-primary/[0.08]
                                        text-primary
                                    "
                                >
                                    <Globe className="size-5" />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1
                                            className="
                                                truncate
                                                text-xl
                                                font-semibold
                                                tracking-[-0.025em]
                                            "
                                        >
                                            {website.name}
                                        </h1>

                                        <StatusBadge
                                            status={website.status}
                                        />
                                    </div>

                                    <a
                                        href={website.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                            group
                                            mt-1
                                            inline-flex
                                            max-w-full
                                            items-center
                                            gap-1.5
                                            text-xs
                                            text-muted-foreground
                                            transition-colors
                                            hover:text-primary
                                        "
                                    >
                                        <span className="truncate">
                                            {website.url}
                                        </span>

                                        <ExternalLink className="size-3 shrink-0 opacity-50 transition-all group-hover:opacity-100" />
                                    </a>
                                </div>
                            </div>

                            {/* Metadata */}

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    gap-x-8
                                    gap-y-3
                                    border-t
                                    border-border/60
                                    pt-4
                                    lg:border-t-0
                                    lg:pt-0
                                "
                            >
                                <MetaItem
                                    label="Site ID"
                                    value={website.site_key}
                                    mono
                                />

                                <MetaItem
                                    label="Created"
                                    value={new Date(
                                        website.created_at
                                    ).toLocaleDateString(
                                        undefined,
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <QuickAction
                        icon={Code2}
                        title="Installation"
                        description="Add NudgeProof to your site"
                        href="#installation"
                    />

                    <QuickAction
                        icon={CheckCircle2}
                        title="Connection"
                        description="Check installation status"
                        href="#connection"
                    />

                    <QuickAction
                        icon={Settings}
                        title="Website settings"
                        description="Manage this website"
                        href="#settings"
                    />
                </div>

                {/* =================================================
                    SITE ID
                ================================================= */}

                <section>
                    <SectionIntro
                        eyebrow="IDENTITY"
                        icon={Globe}
                        title="Site identity"
                        description="The identifier NudgeProof uses to connect this website to your account."
                    />

                    <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border/70 bg-white p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sm:flex-row sm:items-center">
                        <div
                            className="
                                min-w-0
                                flex-1
                                rounded-xl
                                bg-muted/[0.55]
                                px-4
                                py-3
                            "
                        >
                            <code
                                className="
                                    block
                                    break-all
                                    font-mono
                                    text-xs
                                    font-medium
                                    text-foreground/80
                                "
                            >
                                {website.site_key}
                            </code>
                        </div>

                        <CopyButton
                            value={website.site_key}
                            label="Copy Site ID"
                        />
                    </div>
                </section>

                {/* =================================================
                    INSTALLATION
                ================================================= */}

                <section id="installation">
                    <SectionIntro
                        eyebrow="INSTALLATION"
                        icon={Code2}
                        title="Connect your website"
                        description={
                            <>
                                Add one lightweight script before the closing{" "}
                                <code
                                    className="
                                        rounded-md
                                        bg-muted
                                        px-1.5
                                        py-0.5
                                        font-mono
                                        text-[11px]
                                        text-foreground
                                    "
                                >
                                    &lt;/body&gt;
                                </code>{" "}
                                tag.
                            </>
                        }
                    />

                    <div
                        className="
                            mt-4
                            overflow-hidden
                            rounded-2xl
                            border
                            border-black/[0.08]
                            bg-[#141414]
                            shadow-[0_10px_35px_rgba(0,0,0,0.08)]
                        "
                    >
                        {/* Terminal header */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-white/[0.08]
                                px-4
                                py-3
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <span className="size-2 rounded-full bg-white/20" />
                                    <span className="size-2 rounded-full bg-white/20" />
                                    <span className="size-2 rounded-full bg-white/20" />
                                </div>

                                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                                    installation.html
                                </span>
                            </div>

                            <CopyButton
                                value={installationCode}
                                label="Copy"
                            />
                        </div>

                        {/* Code */}

                        <div className="overflow-x-auto">
                            <pre className="p-5 text-[12px] leading-6 text-white/75 sm:p-6 sm:text-[13px]">
                                <code>{installationCode}</code>
                            </pre>
                        </div>

                        {/* Steps */}

                        <div className="grid border-t border-white/[0.08] sm:grid-cols-3">
                            <InstallStep
                                number="01"
                                title="Copy"
                                description="Copy the installation snippet."
                            />

                            <InstallStep
                                number="02"
                                title="Paste"
                                description="Add it to your website."
                            />

                            <InstallStep
                                number="03"
                                title="Verify"
                                description="Confirm NudgeProof is connected."
                                last
                            />
                        </div>
                    </div>
                </section>

                {/* =================================================
                    CONNECTION
                ================================================= */}

                <section id="connection">
                    <SectionIntro
                        eyebrow="CONNECTION"
                        icon={CheckCircle2}
                        title="Installation status"
                        description="Check whether NudgeProof can detect the script on your website."
                    />

                    <div className="mt-4">
                        <InstallationStatus
                            websiteId={website.id}
                            initialStatus={
                                website.installation_status ||
                                "pending"
                            }
                            initialCheckedAt={
                                website.installation_checked_at
                            }
                        />
                    </div>
                </section>

                {/* =================================================
                    SECURITY
                ================================================= */}

                <section
                    id="settings"
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-border/70
                        bg-white
                        shadow-[0_1px_3px_rgba(0,0,0,0.02)]
                    "
                >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-start gap-3.5">
                            <div
                                className="
                                    flex
                                    size-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-primary/[0.07]
                                    text-primary
                                "
                            >
                                <ShieldCheck className="size-4" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Lightweight by design
                                </p>

                                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                                    NudgeProof runs asynchronously so your
                                    website can load normally without waiting
                                    for the dashboard.
                                </p>
                            </div>
                        </div>

                        <div
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                bg-primary/[0.06]
                                px-2.5
                                py-1.5
                                text-[9px]
                                font-semibold
                                text-primary
                            "
                        >
                            <Sparkles className="size-3" />
                            Built for conversion
                        </div>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}

/* =============================================================
   SECTION INTRO
============================================================= */

function SectionIntro({
    eyebrow,
    icon: Icon,
    title,
    description,
}: {
    eyebrow: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
    title: string;
    description: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="
                    flex
                    size-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-primary/[0.07]
                    text-primary
                "
            >
                <Icon className="size-3.5" />
            </div>

            <div className="min-w-0">
                <p
                    className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-primary
                    "
                >
                    {eyebrow}
                </p>

                <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight">
                    {title}
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* =============================================================
   META ITEM
============================================================= */

function MetaItem({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </p>

            <p
                className={`mt-1 max-w-[220px] truncate text-[11px] text-foreground/80 ${
                    mono ? "font-mono" : "font-medium"
                }`}
            >
                {value}
            </p>
        </div>
    );
}

/* =============================================================
   QUICK ACTION
============================================================= */

function QuickAction({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-border/70
                bg-white
                px-3.5
                py-3
                shadow-[0_1px_3px_rgba(0,0,0,0.02)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-primary/20
                hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)]
            "
        >
            <div
                className="
                    flex
                    size-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-muted
                    text-muted-foreground
                    transition-colors
                    group-hover:bg-primary/[0.08]
                    group-hover:text-primary
                "
            >
                <Icon className="size-3.5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                    {description}
                </p>
            </div>

            <ArrowUpRight
                className="
                    size-3.5
                    shrink-0
                    text-muted-foreground/50
                    transition-transform
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-primary
                "
            />
        </Link>
    );
}

/* =============================================================
   INSTALL STEP
============================================================= */

function InstallStep({
    number,
    title,
    description,
    last = false,
}: {
    number: string;
    title: string;
    description: string;
    last?: boolean;
}) {
    return (
        <div
            className={`p-4 ${
                !last
                    ? "border-b border-white/[0.08] sm:border-b-0 sm:border-r"
                    : ""
            }`}
        >
            <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-primary">
                    {number}
                </span>

                <span className="text-xs font-semibold text-white">
                    {title}
                </span>
            </div>

            <p className="mt-1.5 text-[10px] leading-4 text-white/35">
                {description}
            </p>
        </div>
    );
}