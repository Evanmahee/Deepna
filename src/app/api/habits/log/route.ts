import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseLoggedOnParam, todayUtcString } from "@/lib/dates";

type Body = {
  habitId?: string;
  loggedOn?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const habitId = body.habitId;
  if (!habitId) {
    return NextResponse.json({ error: "habitId requis" }, { status: 400 });
  }

  const loggedOn = body.loggedOn
    ? parseLoggedOnParam(body.loggedOn)
    : todayUtcString();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: habit, error: habitErr } = await supabase
    .from("habits")
    .select("id, user_id, missed_days_count")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .single();

  if (habitErr || !habit) {
    return NextResponse.json({ error: "Habitude introuvable" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id, completed")
    .eq("habit_id", habitId)
    .eq("logged_on", loggedOn)
    .maybeSingle();

  const nextCompleted = existing ? !existing.completed : true;
  const n = habit.missed_days_count ?? 0;
  const newMissed = nextCompleted ? Math.max(0, n - 1) : n + 1;

  const { error: upsertErr } = await supabase.from("habit_logs").upsert(
    {
      habit_id: habitId,
      user_id: user.id,
      logged_on: loggedOn,
      completed: nextCompleted,
      ...(nextCompleted
        ? { completed_at: new Date().toISOString() }
        : { completed_at: null }),
    },
    { onConflict: "habit_id,logged_on" },
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  const { error: habitUpdateErr } = await supabase
    .from("habits")
    .update({ missed_days_count: newMissed })
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (habitUpdateErr) {
    return NextResponse.json({ error: habitUpdateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    completed: nextCompleted,
    missed_days_count: newMissed,
  });
}
