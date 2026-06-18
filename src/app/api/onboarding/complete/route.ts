import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { toScheduledTimeOnly } from "@/lib/notification-time";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type HabitInput = { name: string; icon_emoji: string };

type Body = {
  habits?: HabitInput[];
  wakeTime?: string;
  sleepTime?: string;
};

function morningEndTime(wakeTime: string): string {
  const wake = toScheduledTimeOnly(wakeTime);
  if (!wake) return "12:00:00";
  const [h] = wake.split(":").map(Number);
  if (h >= 10) {
    const endH = Math.min(h + 4, 23);
    return `${String(endH).padStart(2, "0")}:00:00`;
  }
  return "12:00:00";
}

function eveningStartTime(sleepTime: string): string {
  const sleep = toScheduledTimeOnly(sleepTime);
  if (!sleep) return "18:00:00";
  const [h] = sleep.split(":").map(Number);
  const startH = Math.max(18, h - 4);
  return `${String(startH).padStart(2, "0")}:00:00`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const habits = body.habits ?? [];
  const wakeTime = toScheduledTimeOnly(body.wakeTime) ?? "07:00:00";
  const sleepTime = toScheduledTimeOnly(body.sleepTime) ?? "23:00:00";

  if (habits.length === 0) {
    return NextResponse.json(
      { error: "Sélectionne au moins une habitude" },
      { status: 400 },
    );
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const blockDate = new Date().toISOString().slice(0, 10);
  const morningEnd = morningEndTime(wakeTime);
  const eveningStart = eveningStartTime(sleepTime);

  const { data: morningBlock, error: morningErr } = await supabase
    .from("time_blocks")
    .insert({
      user_id: user.id,
      title: "Matin",
      icon_emoji: "🌅",
      starts_at: wakeTime,
      ends_at: morningEnd,
      block_date: blockDate,
      sort_order: 0,
    })
    .select("id")
    .single();

  if (morningErr) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(morningErr) },
      { status: 500 },
    );
  }

  const { error: eveningErr } = await supabase.from("time_blocks").insert({
    user_id: user.id,
    title: "Soir",
    icon_emoji: "🌙",
    starts_at: eveningStart,
    ends_at: sleepTime,
    block_date: blockDate,
    sort_order: 1,
  });

  if (eveningErr) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(eveningErr) },
      { status: 500 },
    );
  }

  for (let i = 0; i < habits.length; i++) {
    const h = habits[i];
    const name = h.name?.trim();
    if (!name) continue;
    const { error } = await supabase.from("habits").insert({
      user_id: user.id,
      name,
      icon_emoji: h.icon_emoji?.trim() || "⭐",
      habit_type: "good",
      time_block_id: morningBlock.id,
      sort_order: i,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ onboarding_done: true })
    .eq("id", user.id);

  if (profileErr) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(profileErr) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
