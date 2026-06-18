"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { GoalTerm } from "@/types/goals";

import { glassInputClass } from "@/lib/glass";

const inputClass = `${glassInputClass} placeholder:text-neutral-500`;

type CreateGoalModalProps = {
  open: boolean;
  onClose: () => void;
  initialTerm?: GoalTerm;
};

export function CreateGoalModal({
  open,
  onClose,
  initialTerm = "short",
}: CreateGoalModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState<GoalTerm>(initialTerm);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTerm(initialTerm);
    }
  }, [open, initialTerm]);

  if (!open) {
    return null;
  }

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          term,
          target_date: targetDate || null,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Erreur");
      }
      setTitle("");
      setDescription("");
      setTargetDate("");
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
      <div className="glass-sheet-dark max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <h3 className="mb-3 text-lg font-semibold text-white">Nouvel objectif</h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className={inputClass}
          />
          <div className="flex gap-2">
            {(["short", "mid", "long"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold ${
                  term === t
                    ? "border-indigo-400/60 bg-indigo-500/20 text-white"
                    : "glass-pill text-neutral-400"
                }`}
              >
                {t === "short" ? "Court" : t === "mid" ? "Moyen" : "Long"}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={inputClass}
          />
          {err ? <p className="text-xs text-red-400">{err}</p> : null}
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={() => void submit()}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? "…" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
