import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { HabitLogRow } from "@/types/today";

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [profileRes, habitsRes, goalsRes, checkinsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("identity_checkins").select("*").eq("user_id", user.id),
  ]);

  const habits = habitsRes.data ?? [];
  const habitIds = habits.map((h) => h.id);

  const { data: logs } =
    habitIds.length > 0
      ? await supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", user.id)
          .in("habit_id", habitIds)
      : { data: [] };

  const logRows = (logs ?? []) as HabitLogRow[];
  const logsByHabit = new Map<string, HabitLogRow[]>();
  for (const l of logRows) {
    const arr = logsByHabit.get(l.habit_id) ?? [];
    arr.push(l);
    logsByHabit.set(l.habit_id, arr);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profileRes.data ?? null,
    habits: habits.map((h) => ({
      ...h,
      logs: logsByHabit.get(h.id) ?? [],
    })),
    goals: goalsRes.data ?? [],
    identity_checkins: checkinsRes.data ?? [],
  };

  const filename = `deepna-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
