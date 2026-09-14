"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

type InstallationStatus =
  | "pending"
  | "installed"
  | "failed";

type Props = {
  websiteId: string;
  initialStatus: InstallationStatus;
  initialCheckedAt: string | null;
};

export function InstallationStatus({
  websiteId,
  initialStatus,
  initialCheckedAt,
}: Props) {
  const [status, setStatus] =
    useState<InstallationStatus>(
      initialStatus
    );

  const [checkedAt, setCheckedAt] =
    useState<string | null>(
      initialCheckedAt
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  async function verifyInstallation() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/websites/${websiteId}/verify`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Verification failed."
        );
      }

      setStatus(data.status);
      setCheckedAt(data.checked_at);
      setMessage(data.message);
    } catch (error) {
      setStatus("failed");

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while verifying the installation."
      );
    } finally {
      setLoading(false);
    }
  }

  const isInstalled =
    status === "installed";

  const isFailed =
    status === "failed";

  return (
    <div
      className={`
        relative overflow-hidden mt-3 rounded-2xl
        border p-px
        ${
          isInstalled
            ? "border-emerald-500/20"
            : isFailed
              ? "border-red-500/15"
              : "border-primary/15"
        }
      `}
    >
      <div
        className={`
          relative rounded-[15px] p-5 sm:p-6
          ${
            isInstalled
              ? "bg-emerald-500/[0.025]"
              : isFailed
                ? "bg-red-500/[0.025]"
                : "bg-primary/[0.025]"
          }
        `}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {/* Icon */}
            <div
              className={`
                flex size-11 shrink-0 items-center
                justify-center rounded-xl border bg-white
                ${
                  isInstalled
                    ? "border-emerald-500/15"
                    : isFailed
                      ? "border-red-500/15"
                      : "border-primary/15"
                }
              `}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : isInstalled ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : isFailed ? (
                <AlertCircle className="size-5 text-red-500" />
              ) : (
                <CheckCircle2 className="size-5 text-primary" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight">
                  {loading
                    ? "Checking installation..."
                    : isInstalled
                      ? "Installation verified"
                      : isFailed
                        ? "Installation not detected"
                        : "Installation pending"}
                </h3>

                {!loading && (
                  <StatusPill
                    status={status}
                  />
                )}
              </div>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {loading
                  ? "We're checking your website for the NudgeProof installation."
                  : isInstalled
                    ? "NudgeProof is successfully installed and ready to display your widgets."
                    : isFailed
                      ? message ||
                        "We couldn't find the NudgeProof script on your website. Check the installation and try again."
                      : "Add the script to your website, then verify the installation."}
              </p>

              {checkedAt && !loading && (
                <p className="mt-2 text-xs text-muted-foreground/70">
                  Last checked{" "}
                  {formatDate(checkedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Action */}
          {!isInstalled && (
            <button
              type="button"
              onClick={verifyInstallation}
              disabled={loading}
              className="
                inline-flex h-9 shrink-0
                items-center justify-center gap-2
                rounded-lg bg-[var(--brand-blue)]
                px-3.5 text-xs font-semibold
                text-white
                shadow-[0_3px_10px_rgba(0,127,255,0.15)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[0_5px_16px_rgba(0,127,255,0.2)]
                disabled:pointer-events-none
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Checking...
                </>
              ) : isFailed ? (
                <>
                  <RotateCcw className="size-3.5" />
                  Try again
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Verify installation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: InstallationStatus;
}) {
  if (status === "installed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-600">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Verified
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-red-600">
        <span className="size-1.5 rounded-full bg-red-500" />
        Not found
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-amber-600">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}