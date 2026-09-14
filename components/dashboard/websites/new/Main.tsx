"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewWebsite() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create website");
        return;
      }

      router.push("/dashboard/websites");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/websites"
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to websites
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">
          Add website
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Connect a website to start using NudgeProof.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Website name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Website name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My Store"
              required
              disabled={loading}
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-foreground focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />

            <p className="text-xs text-muted-foreground">
              A name to help you identify this website inside
              NudgeProof.
            </p>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label
              htmlFor="url"
              className="text-sm font-medium"
            >
              Website URL
            </label>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-foreground focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Enter the full URL of the website where NudgeProof
              will be installed.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t pt-6">
            <Link
              href="/dashboard/websites"
              className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading ? "Creating..." : "Add website"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}