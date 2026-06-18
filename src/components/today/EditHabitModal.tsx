"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { HabitRowData, TimeBlockRow } from "@/types/today";
import { HabitGroupPicker } from "@/components/today/HabitGroupPicker";
import { HabitNotificationPicker } from "@/components/today/HabitNotificationPicker";
import { glassInputDarkClass } from "@/lib/glass";
import {
  ALL_NOTIFICATION_DAYS,
  type NotificationDayId,
} from "@/lib/notification-days";

const inputClass = glassInputDarkClass;
const textareaClass = `${inputClass} min-h-[5.5rem] resize-y`;

type EditHabitModalProps = {
  habit: HabitRowData | null;
  onClose: () => void;
};

type Panel = "main" | "group" | "notifications";

export function EditHabitModal({ habit, onClose }: EditHabitModalProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("main");
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [description, setDescription] = useState("");
  const [blockId, setBlockId] = useState("");
  const [newLabel, setNewLabel] = useState("Nouveau groupe");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlockRow[]>([]);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyTime, setNotifyTime] = useState("09:00");
  const [notifyDays, setNotifyDays] = useState<NotificationDayId[]>([
    ...ALL_NOTIFICATION_DAYS,
  ]);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) return;
    setPanel("main");
    setTitle(habit.name);
    setEmoji(habit.icon_emoji || "⭐");
    setDescription(habit.description ?? "");
    setBlockId(habit.time_block_id ?? "");
    setDurationMinutes(habit.duration_minutes ?? "");
    setErr(null);

    void (async () => {
      const [tbRes, notifRes] = await Promise.all([
        fetch("/api/time-blocks"),
        fetch(`/api/notifications/habit/${habit.id}`),
      ]);
      const tbJson = (await tbRes.json()) as { time_blocks?: TimeBlockRow[] };
      setTimeBlocks(tbJson.time_blocks ?? []);
      if (notifRes.ok) {
        const n = (await notifRes.json()) as {
          enabled?: boolean;
          scheduled_time?: string;
          days?: NotificationDayId[];
          message?: string;
        };
        setNotifyEnabled(n.enabled ?? false);
        setNotifyTime(n.scheduled_time ?? "09:00");
        setNotifyDays(n.days ?? [...ALL_NOTIFICATION_DAYS]);
        setNotifyMessage(n.message ?? "");
      }
    })();
  }, [habit]);

  if (!habit) return null;

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          icon_emoji: emoji.trim() || "⭐",
          description: description.trim() || null,
          time_block_id: blockId || null,
          duration_minutes:
            durationMinutes === "" ? null : Number(durationMinutes),
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Mise à jour impossible");

      const notifRes = await fetch(`/api/notifications/habit/${habit!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: notifyEnabled,
          scheduled_time: notifyTime,
          days: notifyDays,
          message: notifyMessage.trim() || `${emoji} ${title.trim()}`,
        }),
      });
      const nj = (await notifRes.json()) as { error?: string };
      if (!notifRes.ok) throw new Error(nj.error ?? "Notifications impossible");

      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (panel === "group") {
    return (
      <div className="fixed inset-0 z-[250] flex flex-col justify-end">
        <button type="button" className="flex-1 bg-black/60" onClick={() => setPanel("main")} aria-label="Retour" />
        <div className="glass-sheet-dark max-h-[85vh] overflow-y-auto rounded-t-[32px]">
          <HabitGroupPicker
            timeBlocks={timeBlocks}
            blockId={blockId}
            onBlockIdChange={setBlockId}
            newLabel={newLabel}
            setNewLabel={setNewLabel}
            newStart={newStart}
            setNewStart={setNewStart}
            newEnd={newEnd}
            setNewEnd={setNewEnd}
            onBack={() => setPanel("main")}
          />
        </div>
      </div>
    );
  }

  if (panel === "notifications") {
    return (
      <div className="fixed inset-0 z-[250] flex flex-col justify-end">
        <button type="button" className="flex-1 bg-black/60" onClick={() => setPanel("main")} aria-label="Retour" />
        <div className="glass-sheet-dark max-h-[85vh] overflow-y-auto rounded-t-[32px]">
          <HabitNotificationPicker
            enabled={notifyEnabled}
            onEnabledChange={setNotifyEnabled}
            time={notifyTime}
            onTimeChange={setNotifyTime}
            days={notifyDays}
            onDaysChange={setNotifyDays}
            message={notifyMessage || `${emoji} ${title}`.trim()}
            onMessageChange={setNotifyMessage}
            habitName={title}
            onBack={() => setPanel("main")}
          />
        </div>
      </div>
    );
  }

  const groupLabel =
    timeBlocks.find((b) => b.id === blockId)?.title ?? (blockId ? "Groupe" : "Aucun");

  return (
    <div className="fixed inset-0 z-[250] flex flex-col justify-end">
      <button type="button" className="flex-1 bg-black/60" aria-label="Fermer" onClick={onClose} />
      <div className="glass-sheet-dark relative max-h-[85vh] w-full overflow-y-auto rounded-t-[32px] px-4 pb-8 pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <h3 className="mb-4 text-lg font-semibold text-white">Modifier l&apos;habitude</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Emoji</label>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={inputClass} maxLength={4} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClass} />
          </div>
          <button type="button" onClick={() => setPanel("group")} className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-left text-sm text-white">
            <span>Groupe</span>
            <span className="text-neutral-400">{groupLabel}</span>
          </button>
          <button type="button" onClick={() => setPanel("notifications")} className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-left text-sm text-white">
            <span>Notifications</span>
            <span className="text-neutral-400">{notifyEnabled ? notifyTime : "Off"}</span>
          </button>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">Durée timer (minutes)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={durationMinutes}
              placeholder="Ex: 25"
              onChange={(e) =>
                setDurationMinutes(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={inputClass}
            />
          </div>
        </div>
        {err ? <p className="mt-3 text-sm text-rose-400">{err}</p> : null}
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-neutral-300">Annuler</button>
          <button type="button" disabled={loading || !title.trim()} onClick={() => void submit()} className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-medium text-white disabled:opacity-50">
            {loading ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
