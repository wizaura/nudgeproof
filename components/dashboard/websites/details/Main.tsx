import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Globe,
  ShieldCheck,
  Sparkles,
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
      <div className="space-y-10 pb-10">
        {/* =====================================================
            BACK
        ====================================================== */}

        <Link
          href="/dashboard/websites"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to websites
        </Link>

        {/* =====================================================
            WEBSITE HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#F8FAFC] px-6 py-7 sm:px-8 sm:py-8">
          {/* ambient blue light */}

          <div className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full bg-primary/[0.08] blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-180px] left-[25%] size-72 rounded-full bg-primary/[0.035] blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              {/* identity */}

              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#141414] text-white shadow-[0_8px_25px_rgba(20,20,20,0.12)]">
                  <Globe className="size-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="truncate text-2xl font-semibold tracking-[-0.025em] text-[#141414] sm:text-[28px]">
                      {website.name}
                    </h1>

                    <StatusBadge status={website.status} />
                  </div>

                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="truncate">
                      {website.url}
                    </span>

                    <ArrowUpRight className="size-3.5 shrink-0 opacity-50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </a>
                </div>
              </div>

              {/* site metadata */}

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 border-t border-black/[0.07] pt-5 sm:flex sm:border-t-0 sm:pt-0">
                <MetaItem
                  label="Site ID"
                  value={website.site_key}
                  mono
                />

                <MetaItem
                  label="Created"
                  value={new Date(
                    website.created_at
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        <section>
          <SectionIntro
            eyebrow="IDENTITY"
            icon={Globe}
            title="Site identity"
            description="The identifier NudgeProof uses to connect this website to your account."
          />

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-black/[0.07] bg-[#FAFBFC] p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 rounded-xl bg-[#F1F4F7] px-4 py-3.5">
              <code className="block break-all font-mono text-[13px] font-medium text-[#141414]">
                {website.site_key}
              </code>
            </div>

            <CopyButton
              value={website.site_key}
              label="Copy Site ID"
            />
          </div>
        </section>

        {/* =====================================================
            INSTALLATION
        ====================================================== */}

        <section>
          <SectionIntro
            eyebrow="INSTALLATION"
            icon={Code2}
            title="Connect your website"
            description={
              <>
                Add one lightweight script before the closing{" "}
                <code className="rounded-md bg-[#F1F4F7] px-1.5 py-0.5 font-mono text-xs text-[#141414]">
                  &lt;/body&gt;
                </code>{" "}
                tag.
              </>
            }
          />

          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#222]/10 bg-[#141414] shadow-[0_16px_50px_rgba(20,20,20,0.10)]">
            {/* terminal header */}

            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                </div>

                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
                  installation.html
                </span>
              </div>

              <CopyButton
                value={installationCode}
                label="Copy"
              />
            </div>

            {/* code */}

            <div className="overflow-x-auto">
              <pre className="p-5 text-[13px] leading-7 text-white/75 sm:p-7 sm:text-sm">
                <code>{installationCode}</code>
              </pre>
            </div>

            {/* quick steps */}

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

        {/* =====================================================
            STATUS
        ====================================================== */}

        <section>
          <SectionIntro
            eyebrow="CONNECTION"
            icon={CheckCircle2}
            title="Installation status"
            description="Check whether NudgeProof can detect the script on your website."
          />

          <div className="mt-5">
            <InstallationStatus
              websiteId={website.id}
              initialStatus={
                website.installation_status || "pending"
              }
              initialCheckedAt={
                website.installation_checked_at
              }
            />
          </div>
        </section>

        {/* =====================================================
            SECURITY / TRUST
        ====================================================== */}

        <section className="overflow-hidden rounded-[22px] border border-black/[0.07] bg-[#F8FAFC]">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#141414] text-white">
                <ShieldCheck className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#141414]">
                  Lightweight by design
                </p>

                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  NudgeProof runs asynchronously so your website can
                  load normally without waiting for the dashboard.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
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
    <div className="flex items-start gap-3.5">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#141414] text-white">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-semibold tracking-[-0.015em] text-[#141414]">
          {title}
        </h2>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 max-w-[220px] truncate text-xs text-[#141414] ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
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
      className={`p-5 ${
        !last
          ? "border-b border-white/[0.08] sm:border-b-0 sm:border-r"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-primary">
          {number}
        </span>

        <span className="text-sm font-semibold text-white">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-white/40">
        {description}
      </p>
    </div>
  );
}
