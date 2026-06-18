import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/nav/PageHeader";
import { GoalColumn } from "@/components/goals/GoalColumn";
import { GoalsFloatingAdd } from "@/components/goals/GoalsFloatingAdd";
import type { GoalRow, GoalTerm } from "@/types/goals";

export const metadata: Metadata = {
  title: "Objectifs — Deepna",
};

const STATUS_RANK: Record<string, number> = {
  active: 0,
  completed: 1,
  abandoned: 2,
};

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: raw }, profileRes] = await Promise.all([
    supabase
      .from("goals")
      .select(
        "id, user_id, title, description, target_date, status, created_at, updated_at, term",
      )
      .eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const firstName = profileRes.data?.display_name?.trim() ?? null;

  const goals = (raw ?? []) as GoalRow[];
  goals.sort((a, b) => {
    const ra = STATUS_RANK[a.status] ?? 9;
    const rb = STATUS_RANK[b.status] ?? 9;
    if (ra !== rb) {
      return ra - rb;
    }
    const da = a.target_date ?? "";
    const db = b.target_date ?? "";
    return da.localeCompare(db);
  });

  const byTerm = (t: GoalTerm) => goals.filter((g) => g.term === t);

  return (
    <div className="min-h-full flex-1 bg-[#0a0a0f] text-white">
      <PageHeader title="Objectifs" firstName={firstName} />
      <div className="mx-auto flex max-w-5xl flex-col gap-4 overflow-y-auto px-3 py-4 pb-28 md:flex-row md:items-start md:overflow-visible">
        <GoalColumn term="short" goals={byTerm("short")} />
        <GoalColumn term="mid" goals={byTerm("mid")} />
        <GoalColumn term="long" goals={byTerm("long")} />
      </div>
      <GoalsFloatingAdd />
    </div>
  );
}
