"use client";

import { FormEvent, useState } from "react";
import {
    ArrowLeft,
    ArrowUpRight,
    Globe,
    Loader2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewWebsite() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
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
                setError(
                    data.error ||
                        "Failed to create website"
                );
                return;
            }

            router.push("/dashboard/websites");
            router.refresh();
        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
                    <ArrowLeft
                        className="
                            size-3.5
                            transition-transform
                            duration-200
                            group-hover:-translate-x-0.5
                        "
                    />
                    Back to websites
                </Link>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mt-7">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />

                        <span
                            className="
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                                text-primary
                            "
                        >
                            Websites
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1
                                className="
                                    text-[30px]
                                    font-semibold
                                    leading-none
                                    tracking-[-0.04em]
                                "
                            >
                                Add website
                            </h1>

                            <p
                                className="
                                    mt-2.5
                                    max-w-xl
                                    text-sm
                                    leading-5
                                    text-muted-foreground
                                "
                            >
                                Connect a website to start using
                                NudgeProof.
                            </p>
                        </div>

                        <div
                            className="
                                hidden
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-border/70
                                bg-white/70
                                px-3
                                py-2
                                text-[10px]
                                font-medium
                                text-muted-foreground
                                sm:flex
                            "
                        >
                            <ShieldCheck className="size-3.5 text-primary" />
                            Secure connection
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM CARD
                ================================================= */}

                <div
                    className="
                        mt-7
                        overflow-hidden
                        rounded-2xl
                        border
                        border-border/70
                        bg-white
                        shadow-[0_8px_35px_rgba(0,0,0,0.04)]
                    "
                >
                    {/* Card header */}

                    <div
                        className="
                            border-b
                            border-border/60
                            px-5
                            py-5
                            sm:px-6
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    size-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-primary/[0.08]
                                    text-primary
                                "
                            >
                                <Globe className="size-[18px]" />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold">
                                    Website details
                                </h2>

                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    Enter the details for the website
                                    you want to connect.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="p-5 sm:p-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6 space-y-6">
                            {/* =================================================
                                WEBSITE NAME
                            ================================================= */}

                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="
                                        block
                                        text-xs
                                        font-semibold
                                        tracking-tight
                                    "
                                >
                                    Website name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="My Store"
                                    required
                                    disabled={loading}
                                    className="
                                        h-11
                                        w-full
                                        rounded-xl
                                        border
                                        border-border/70
                                        bg-background
                                        px-3.5
                                        text-sm
                                        outline-none
                                        transition-all
                                        duration-200
                                        placeholder:text-muted-foreground/60
                                        hover:border-border
                                        focus:border-primary/30
                                        focus:bg-white
                                        focus:ring-4
                                        focus:ring-primary/[0.06]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                />

                                <p className="text-[10px] leading-4 text-muted-foreground">
                                    A name to help you identify this
                                    website inside NudgeProof.
                                </p>
                            </div>

                            {/* =================================================
                                URL
                            ================================================= */}

                            <div className="space-y-2">
                                <label
                                    htmlFor="url"
                                    className="
                                        block
                                        text-xs
                                        font-semibold
                                        tracking-tight
                                    "
                                >
                                    Website URL
                                </label>

                                <div className="relative">
                                    <Globe
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            size-4
                                            -translate-y-1/2
                                            text-muted-foreground
                                        "
                                    />

                                    <input
                                        id="url"
                                        type="url"
                                        value={url}
                                        onChange={(event) =>
                                            setUrl(
                                                event.target.value
                                            )
                                        }
                                        placeholder="https://example.com"
                                        required
                                        disabled={loading}
                                        className="
                                            h-11
                                            w-full
                                            rounded-xl
                                            border
                                            border-border/70
                                            bg-background
                                            pl-10
                                            pr-3.5
                                            text-sm
                                            outline-none
                                            transition-all
                                            duration-200
                                            placeholder:text-muted-foreground/60
                                            hover:border-border
                                            focus:border-primary/30
                                            focus:bg-white
                                            focus:ring-4
                                            focus:ring-primary/[0.06]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    />
                                </div>

                                <p className="text-[10px] leading-4 text-muted-foreground">
                                    Enter the full URL of the website
                                    where NudgeProof will be installed.
                                </p>
                            </div>

                            {/* =================================================
                                PREVIEW
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    md:col-span-2
                                    rounded-xl
                                    border
                                    border-primary/10
                                    bg-primary/[0.035]
                                    px-3.5
                                    py-3
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
                                        bg-primary/[0.08]
                                        text-primary
                                    "
                                >
                                    <Sparkles className="size-3.5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold">
                                        Ready to connect
                                    </p>

                                    <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground">
                                        After adding your website,
                                        you'll receive a unique Site ID
                                        and installation snippet.
                                    </p>
                                </div>

                                <ArrowUpRight className="size-3.5 shrink-0 text-primary/40" />
                            </div>

                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {error && (
                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-destructive/20
                                        bg-destructive/[0.05]
                                        px-3.5
                                        py-3
                                        text-xs
                                        text-destructive
                                    "
                                >
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div
                            className="
                                mt-7
                                flex
                                flex-col-reverse
                                gap-2.5
                                border-t
                                border-border/60
                                pt-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <p className="text-[10px] text-muted-foreground">
                                You can configure widgets after
                                connecting your website.
                            </p>

                            <div className="flex items-center gap-2.5">
                                <Link
                                    href="/dashboard/websites"
                                    className="
                                        inline-flex
                                        h-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-border/70
                                        px-4
                                        text-xs
                                        font-medium
                                        transition
                                        hover:bg-muted/60
                                    "
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        inline-flex
                                        h-10
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-primary
                                        px-4
                                        text-xs
                                        font-semibold
                                        text-primary-foreground
                                        shadow-[0_4px_14px_rgba(0,127,255,0.16)]
                                        transition-all
                                        duration-200
                                        hover:-translate-y-0.5
                                        hover:shadow-[0_6px_18px_rgba(0,127,255,0.22)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        disabled:hover:translate-y-0
                                    "
                                >
                                    {loading && (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    )}

                                    {loading
                                        ? "Creating..."
                                        : "Add website"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}