import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type Keys = { p256dh?: string; auth?: string };

type Body = {
  endpoint?: string;
  keys?: Keys;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const endpoint = body.endpoint?.trim();
  const keys = body.keys;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json(
      { error: "endpoint et keys.p256dh / keys.auth requis" },
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

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
