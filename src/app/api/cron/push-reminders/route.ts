import webpush from "web-push";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type NotifRow = {
  id: string;
  user_id: string;
  message: string | null;
  label: string;
  scheduled_time: string;
};

type SubRow = {
  user_id: string;
  endpoint: string;
  keys?: { p256dh?: string; auth?: string } | null;
};

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

function scheduledMinutes(time: string): number {
  const m = /^(\d{2}):(\d{2})/.exec(time);
  if (!m) return -1;
  return Number(m[1]) * 60 + Number(m[2]);
}

function withinWindow(scheduledTime: string, now: Date): boolean {
  const target = scheduledMinutes(scheduledTime);
  if (target < 0) return false;
  const current = now.getUTCHours() * 60 + now.getUTCMinutes();
  const diff = Math.abs(current - target);
  return diff <= 5;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const pub =
    process.env.VAPID_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:deepna@app.com";

  if (!pub || !priv) {
    return NextResponse.json(
      { error: "Clés VAPID manquantes" },
      { status: 500 },
    );
  }

  webpush.setVapidDetails(subject, pub, priv);

  const admin = createAdminClient();
  const now = new Date();

  const { data: settings, error: setErr } = await admin
    .from("notification_settings")
    .select("id, user_id, message, label, scheduled_time")
    .eq("enabled", true);

  if (setErr) {
    return NextResponse.json({ error: setErr.message }, { status: 500 });
  }

  const due = (settings ?? []).filter((row) =>
    withinWindow(String((row as NotifRow).scheduled_time), now),
  ) as NotifRow[];

  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, results: [] });
  }

  const userIds = [...new Set(due.map((r) => r.user_id))];

  const { data: subs, error: subErr } = await admin
    .from("push_subscriptions")
    .select("user_id, endpoint, keys")
    .in("user_id", userIds);

  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  const subsByUser = new Map<string, SubRow[]>();
  for (const s of (subs ?? []) as SubRow[]) {
    const arr = subsByUser.get(s.user_id) ?? [];
    arr.push(s);
    subsByUser.set(s.user_id, arr);
  }

  const results: {
    user_id: string;
    ok: boolean;
    detail?: string;
  }[] = [];

  let sent = 0;
  let failed = 0;

  for (const notif of due) {
    const userSubs = subsByUser.get(notif.user_id) ?? [];
    if (userSubs.length === 0) {
      results.push({ user_id: notif.user_id, ok: false, detail: "no subscription" });
      failed += 1;
      continue;
    }

    const title = notif.label || "Deepna";
    const body =
      notif.message?.trim() || "🔔 N'oublie pas tes habitudes aujourd'hui";
    const payload = JSON.stringify({ title, body });

    for (const sub of userSubs) {
      const keys = sub.keys;
      if (!keys?.p256dh || !keys?.auth) continue;
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
          },
          payload,
          { TTL: 120 },
        );
        sent += 1;
        results.push({ user_id: notif.user_id, ok: true });
      } catch (e) {
        failed += 1;
        results.push({
          user_id: notif.user_id,
          ok: false,
          detail: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }

  console.info("[cron/push-reminders]", { sent, failed, due: due.length });

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    due_count: due.length,
    results,
  });
}
