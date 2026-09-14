import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good to see you, {name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your NudgeProof widgets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Websites"
          value="0"
          description="Connected websites"
        />

        <StatCard
          title="Active Widgets"
          value="0"
          description="Currently running"
        />

        <StatCard
          title="Impressions"
          value="0"
          description="This month"
        />

        <StatCard
          title="Clicks"
          value="0"
          description="This month"
        />
      </div>

      {/* Empty state */}
      <div className="rounded-xl border bg-card p-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <span className="text-xl">✦</span>
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Connect your first website
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add your website to get your NudgeProof site ID and start
            creating social proof widgets.
          </p>

          <a
            href="/dashboard/websites"
            className="mt-6 inline-flex items-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add website
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}