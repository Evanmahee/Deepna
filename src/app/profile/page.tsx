import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayUtcString } from "@/lib/dates";
import { IdentityClient } from "@/components/identity/IdentityClient";
import { GoalColumn } from "@/components/goals/GoalColumn";
import { PageHeader } from "@/components/nav/PageHeader";
import type { IdentityCheckinRow } from "@/types/identity";
import type { GoalRow, GoalTerm } from "@/types/goals";

export const metadata: Metadata = {
  title: "Profil — Deepna",
};

const STATUS_RANK: Record<string, number> = {
  active: 0,
  completed: 1,
  abandoned: 2,
};

function byTerm(goals: GoalRow[], t: GoalTerm) {
  return goals.filter((g) => g.term === t);
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const today = todayUtcString();

  const [profileRes, checkinsRes, goalsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("identity_statement, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("identity_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", today),
    supabase
      .from("goals")
      .select(
        "id, user_id, title, description, target_date, status, created_at, updated_at, term",
      )
      .eq("user_id", user.id),
  ]);

  const initialStatement = profileRes.data?.identity_statement ?? null;
  const checkins = (checkinsRes.data ?? []) as IdentityCheckinRow[];
  const firstName = profileRes.data?.display_name?.trim() ?? null;
  const greeting = firstName ? `Bonjour ${firstName} 👋` : null;

  const goals = (goalsRes.data ?? []) as GoalRow[];
  goals.sort((a, b) => {
    const ra = STATUS_RANK[a.status] ?? 9;
    const rb = STATUS_RANK[b.status] ?? 9;
    if (ra !== rb) return ra - rb;
    return (a.target_date ?? "").localeCompare(b.target_date ?? "");
  });

  return (
    <div className="min-h-full flex-1">
      <PageHeader title="Profil" greeting={greeting} showAdd />
      <div className="pb-28">
        <section id="identity" className="scroll-mt-2">
          <IdentityClient
            embedded
            initialStatement={initialStatement}
            checkins={checkins}
          />
        </section>

        <section id="goals" className="scroll-mt-2 border-t border-white/10">
          <div className="px-4 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Mes objectifs
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-3 pb-4 sm:grid-cols-3">
            <GoalColumn term="short" goals={byTerm(goals, "short")} />
            <GoalColumn term="mid" goals={byTerm(goals, "mid")} />
            <GoalColumn term="long" goals={byTerm(goals, "long")} />
          </div>
        </section>
      </div>
    </div>
  );
}
