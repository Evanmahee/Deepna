import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type Body = {
  note?: string | null;
  mood?: number;
  slot_hour?: number;
};

/** Heure UTC courante (0–23), colonne `slot_hour` smallint. */
function currentUtcHour(): number {
  return new Date().getUTCHours();
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const mood = Number(body.mood);
  if (![1, 2, 3].includes(mood)) {
    return NextResponse.json(
      { error: "mood doit être 1, 2 ou 3" },
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

  const slot_hour =
    typeof body.slot_hour === "number" &&
    body.slot_hour >= 0 &&
    body.slot_hour <= 23
      ? body.slot_hour
      : currentUtcHour();

  const { data: existing, error: selectErr } = await supabase
    .from("hourly_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("slot_hour", slot_hour)
    .maybeSingle();

  if (selectErr) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(selectErr) },
      { status: 500 },
    );
  }

  const payload = {
    note: body.note?.trim() || null,
    mood,
  };

  if (existing?.id) {
    const { data: row, error } = await supabase
      .from("hourly_checkins")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("id")
      .single();
    if (error) {
      return NextResponse.json(
        { ok: false, supabase: serializeSupabaseError(error) },
        { status: 500 },
      );
    }
    return NextResponse.json({ id: row.id });
  }

  const { data: row, error } = await supabase
    .from("hourly_checkins")
    .insert({
      user_id: user.id,
      slot_hour,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: row.id });
}
