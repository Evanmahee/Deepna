import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isValidHabitColor, normalizeHabitColor } from "@/lib/habit-colors";
import { toScheduledTimeOnly } from "@/lib/notification-time";

type Body = {
  name?: string;
  icon_emoji?: string | null;
  icon_color?: string | null;
  habit_type?: "good" | "bad" | "neutral";
  description?: string | null;
  time_block_id?: string | null;
  notification?: {
    enabled?: boolean;
    scheduled_time?: string;
    days?: string[];
    message?: string;
  };
  duration_minutes?: number | null;
};

import {
  ALL_NOTIFICATION_DAYS,
  normalizeNotificationDays,
} from "@/lib/notification-days";

async function supabaseRoute() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const habit_type = body.habit_type ?? "good";
  if (!["good", "bad", "neutral"].includes(habit_type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const description = body.description?.trim() || null;
  const icon_color = body.icon_color
    ? isValidHabitColor(body.icon_color)
      ? body.icon_color.toUpperCase()
      : null
    : null;

  const supabase = await supabaseRoute();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (body.time_block_id) {
    const { data: block } = await supabase
      .from("time_blocks")
      .select("id")
      .eq("id", body.time_block_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!block) {
      return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
    }
  }

  const { data: maxRow } = await supabase
    .from("habits")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = ((maxRow?.sort_order as number | undefined) ?? -1) + 1;

  const { data: row, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name,
      icon_emoji: body.icon_emoji?.trim() || "⭐",
      habit_type,
      description,
      icon_color,
      sort_order: nextSort,
      ...(body.time_block_id ? { time_block_id: body.time_block_id } : {}),
      ...(body.duration_minutes != null
        ? { duration_minutes: body.duration_minutes }
        : {}),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.notification?.enabled) {
    const scheduled_time = toScheduledTimeOnly(body.notification.scheduled_time);
    if (!scheduled_time) {
      return NextResponse.json(
        { error: "Heure de notification invalide" },
        { status: 400 },
      );
    }

    const emoji = body.icon_emoji?.trim() || "⭐";
    const days = normalizeNotificationDays(body.notification.days);
    const message =
      body.notification.message?.trim() || `${emoji} ${name}`;
    const { error: notifErr } = await supabase.from("notification_settings").insert({
      user_id: user.id,
      habit_id: row.id,
      label: name,
      message,
      scheduled_time,
      days,
      enabled: true,
    });

    if (notifErr) {
      return NextResponse.json({ error: notifErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: row.id });
}
