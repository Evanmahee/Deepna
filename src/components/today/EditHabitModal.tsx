"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { HabitRowData } from "@/types/today";

import { glassInputClass } from "@/lib/glass";

const inputClass = glassInputClass;
const textareaClass = `${inputClass} min-h-[5.5rem] resize-y`;

type EditHabitModalProps = {
  habit: HabitRowData | null;
  onClose: () => void;
};

export function EditHabitModal({ habit, onClose }: EditHabitModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setTitle(habit.name);
      setEmoji(habit.icon_emoji || "⭐");
      setDescription(habit.description ?? "");
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
          description: description.trim() || null,
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
    <div className="glass-overlay fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="glass-sheet max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Modifier l&apos;habitude
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Titre
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Emoji
            </label>
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Description{" "}
              <span className="font-normal text-slate-400">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClass}
              placeholder="Pourquoi cette habitude ? Une anecdote, une raison d'arrêter…"
              rows={3}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Visible uniquement via « Inspecter » sur l&apos;habitude.
            </p>
          </div>
          {err ? <p className="text-sm text-neutral-700">{err}</p> : null}
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={() => void submit()}
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-md shadow-neutral-900/10 hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
