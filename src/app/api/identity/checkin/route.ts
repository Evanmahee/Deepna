import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { todayUtcString } from "@/lib/dates";
import { serializeSupabaseError } from "@/lib/supabase-errors";
import type { IdentityPeriod } from "@/types/identity";

type Body = {
  period?: IdentityPeriod;
  text_snapshot?: string | null;
};

const PERIODS: IdentityPeriod[] = ["morning", "afternoon", "evening"];

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const period = body.period;
  if (!period || !PERIODS.includes(period)) {
    return NextResponse.json({ error: "period invalide" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const todayUtc = todayUtcString();
  const checked_at = new Date().toISOString();
  const row = {
    user_id: user.id,
    logged_on: todayUtc,
    period,
    prompt: body.text_snapshot || "",
    reflection: "",
    checked_at,
  };

  const { data: existing, error: selectErr } = await supabase
    .from("identity_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("logged_on", todayUtc)
    .eq("period", period)
    .maybeSingle();

  if (selectErr) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(selectErr) },
      { status: 500 },
    );
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("identity_checkins")
      .update({ prompt: row.prompt, reflection: "", checked_at: row.checked_at })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  } else {
    const { error } = await supabase.from("identity_checkins").insert(row);
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
