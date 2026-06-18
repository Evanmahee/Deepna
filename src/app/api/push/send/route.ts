import webpush from "web-push";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type Body = { title?: string; body?: string };

type PushKeys = { p256dh?: string; auth?: string };

type SubRow = {
  endpoint: string;
  keys?: PushKeys | null;
  p256dh?: string | null;
  auth_key?: string | null;
};

function extractKeys(row: SubRow): PushKeys | null {
  if (row.keys?.p256dh && row.keys?.auth) {
    return row.keys;
  }
  if (row.p256dh && row.auth_key) {
    return { p256dh: row.p256dh, auth: row.auth_key };
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const title = body.title?.trim() || "Deepna";
  const msg = body.body?.trim() || "";

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:deepna@app.com";

  if (!pub || !priv) {
    return NextResponse.json(
      { error: "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY manquants côté serveur" },
      { status: 500 },
    );
  }

  webpush.setVapidDetails(subject, pub, priv);

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, keys, p256dh, auth_key")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  const payload = JSON.stringify({ title, body: msg });
  let sent = 0;
  const errors: string[] = [];

  for (const row of (rows ?? []) as SubRow[]) {
    if (!row.endpoint) continue;
    const keys = extractKeys(row);
    if (!keys?.p256dh || !keys.auth) continue;
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
        payload,
        { TTL: 60 },
      );
      sent += 1;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return NextResponse.json({ ok: true, sent, errors });
}
