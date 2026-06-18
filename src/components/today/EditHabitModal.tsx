"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { HabitRowData } from "@/types/today";
import { CreateHabitTypePicker } from "@/components/today/CreateHabitTypePicker";

const inputClass =
  "w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white";

type EditHabitModalProps = {
  habit: HabitRowData | null;
  onClose: () => void;
};

export function EditHabitModal({ habit, onClose }: EditHabitModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [type, setType] = useState<"good" | "bad" | "neutral">("good");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setTitle(habit.name);
      setEmoji(habit.icon_emoji || "⭐");
      setType(habit.habit_type);
      setErr(null);
    }
  }, [habit]);

  if (!habit) {
    return null;
  }

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
          habit_type: type,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Mise à jour impossible");
      }
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl border border-[#333] bg-[#0a0a0f] px-4 pb-8 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-600" />
        <h3 className="mb-4 text-lg font-semibold text-white">
          Modifier l&apos;habitude
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Emoji</label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={inputClass}
            />
          </div>
          <CreateHabitTypePicker value={type} onChange={setType} />
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={() => void submit()}
            className="w-full rounded-lg bg-[#6366f1] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
