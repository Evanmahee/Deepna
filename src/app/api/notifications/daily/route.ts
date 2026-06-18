import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { toScheduledTimeOnly } from "@/lib/notification-time";
import { serializeSupabaseError } from "@/lib/supabase-errors";

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DEFAULT_TIME = "09:00:00";

type Body = {
  enabled?: boolean;
  scheduled_time?: string;
};

function timeToInput(value: string | null | undefined): string {
  if (!value) return "09:00";
  const m = /^(\d{2}):(\d{2})/.exec(value);
  return m ? `${m[1]}:${m[2]}` : "09:00";
}

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [{ data: row }, { count: pushCount }] = await Promise.all([
    supabase
      .from("notification_settings")
      .select("id, enabled, scheduled_time")
      .eq("user_id", user.id)
      .is("habit_id", null)
      .maybeSingle(),
    supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return NextResponse.json({
    enabled: row?.enabled ?? false,
    scheduled_time: timeToInput(row?.scheduled_time as string | undefined),
    has_push_subscription: (pushCount ?? 0) > 0,
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Body;
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("notification_settings")
    .select("id, enabled, scheduled_time")
    .eq("user_id", user.id)
    .is("habit_id", null)
    .maybeSingle();

  const scheduled_time =
    body.scheduled_time !== undefined
      ? (toScheduledTimeOnly(body.scheduled_time) ?? DEFAULT_TIME)
      : ((existing?.scheduled_time as string | undefined) ?? DEFAULT_TIME);

  const enabled = body.enabled ?? existing?.enabled ?? false;

  if (existing?.id) {
    const { error } = await supabase
      .from("notification_settings")
      .update({ enabled, scheduled_time })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  } else {
    const { error } = await supabase.from("notification_settings").insert({
      user_id: user.id,
      habit_id: null,
      label: "Rappel quotidien",
      message: "🔔 N'oublie pas tes habitudes Deepna",
      scheduled_time,
      days: [...ALL_DAYS],
      enabled,
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
  });
}
