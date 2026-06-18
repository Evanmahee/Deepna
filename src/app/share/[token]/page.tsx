import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayUtcString } from "@/lib/dates";
import { currentStreak } from "@/lib/habit-stats";
import { normalizeHabitColor } from "@/lib/habit-colors";
import type { HabitLogRow } from "@/types/today";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, share_public")
    .eq("share_token", token)
    .maybeSingle();

  if (!profile?.share_public) {
    return { title: "Partage — Deepna" };
  }

  const name = profile.display_name?.trim() || "Utilisateur";
  return {
    title: `${name} — Deepna`,
    description: `Habitudes publiques de ${name}`,
  };
}

export default async function PublicSharePage({ params }: PageProps) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, share_public")
    .eq("share_token", token)
    .maybeSingle();

  if (!profile?.share_public) {
    notFound();
  }

  const today = todayUtcString();

  const [habitsRes, logsRes] = await Promise.all([
    admin
      .from("habits")
      .select("id, name, icon_emoji, icon_color")
      .eq("user_id", profile.id)
      .eq("archived", false)
      .order("sort_order", { ascending: true }),
    admin.from("habit_logs").select("*").eq("user_id", profile.id),
  ]);

  const habits = habitsRes.data ?? [];
  const logs = (logsRes.data ?? []) as HabitLogRow[];
  const displayName = profile.display_name?.trim() || "Deepna";

  return (
    <div className="min-h-full flex-1">
      <header className="border-b border-white/10 px-4 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
          Deepna
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{displayName}</h1>
        <p className="mt-1 text-sm text-neutral-500">Habitudes publiques</p>
      </header>

      <div className="mx-auto max-w-md px-4 py-6 pb-16">
        {habits.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">
            Aucune habitude publique pour le moment.
          </p>
        ) : (
          <ul className="space-y-3">
            {habits.map((h) => {
              const streak = currentStreak(logs, h.id, today);
              const color = normalizeHabitColor(h.icon_color);
              return (
                <li
                  key={h.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1a1a24] px-4 py-3"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ backgroundColor: `${color}22` }}
                    aria-hidden
                  >
                    {h.icon_emoji || "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{h.name}</p>
                    <p className="text-xs text-neutral-500">
                      {streak > 0
                        ? `${streak} jour${streak > 1 ? "s" : ""} de suite`
                        : "Pas de série en cours"}
                    </p>
                  </div>
                  {streak > 0 ? (
                    <span className="shrink-0 rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                      🔥 {streak}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
