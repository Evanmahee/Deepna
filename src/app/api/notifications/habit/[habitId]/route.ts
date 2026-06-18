import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { toScheduledTimeOnly } from "@/lib/notification-time";
import {
  ALL_NOTIFICATION_DAYS,
  normalizeNotificationDays,
} from "@/lib/notification-days";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type RouteContext = { params: Promise<{ habitId: string }> };

type Body = {
  enabled?: boolean;
  scheduled_time?: string;
  days?: string[];
  message?: string;
};

function timeToInput(value: string | null | undefined): string {
  if (!value) return "09:00";
  const m = /^(\d{2}):(\d{2})/.exec(value);
  return m ? `${m[1]}:${m[2]}` : "09:00";
}

export async function GET(_request: Request, context: RouteContext) {
  const { habitId } = await context.params;
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: row } = await supabase
    .from("notification_settings")
    .select("enabled, scheduled_time, days, message, label")
    .eq("user_id", user.id)
    .eq("habit_id", habitId)
    .maybeSingle();

  return NextResponse.json({
    enabled: row?.enabled ?? false,
    scheduled_time: timeToInput(row?.scheduled_time as string | undefined),
    days: normalizeNotificationDays(row?.days as string[] | undefined),
    message: row?.message ?? "",
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { habitId } = await context.params;
  const body = (await request.json()) as Body;
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: habit } = await supabase
    .from("habits")
    .select("id, name, icon_emoji")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!habit) {
    return NextResponse.json({ error: "Habitude introuvable" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("notification_settings")
    .select("id, enabled, scheduled_time, days, message")
    .eq("user_id", user.id)
    .eq("habit_id", habitId)
    .maybeSingle();

  const scheduled_time =
    body.scheduled_time !== undefined
      ? (toScheduledTimeOnly(body.scheduled_time) ?? "09:00:00")
      : ((existing?.scheduled_time as string | undefined) ?? "09:00:00");

  const enabled = body.enabled ?? existing?.enabled ?? false;
  const days =
    body.days !== undefined
      ? normalizeNotificationDays(body.days)
      : normalizeNotificationDays(existing?.days as string[] | undefined);
  const emoji = (habit.icon_emoji as string | null)?.trim() || "⭐";
  const message =
    body.message !== undefined
      ? body.message.trim() || `${emoji} ${habit.name}`
      : ((existing?.message as string | undefined) ?? `${emoji} ${habit.name}`);

  if (existing?.id) {
    const { error } = await supabase
      .from("notification_settings")
      .update({ enabled, scheduled_time, days, message, label: habit.name })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  } else if (enabled) {
    const { error } = await supabase.from("notification_settings").insert({
      user_id: user.id,
      habit_id: habitId,
      label: habit.name,
      message,
      scheduled_time,
      days: days.length ? days : [...ALL_NOTIFICATION_DAYS],
      enabled: true,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    enabled,
    scheduled_time: timeToInput(scheduled_time),
    days,
    message,
  });
}
