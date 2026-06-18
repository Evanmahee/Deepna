"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GoalTerm } from "@/types/goals";

type CreateGoalModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateGoalModal({ open, onClose }: CreateGoalModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [term, setTerm] = useState<GoalTerm>("short");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl border border-[#333] bg-[#0a0a0f] px-4 pb-8 pt-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-600" />
        <h3 className="mb-3 text-lg font-semibold text-white">Nouvel objectif</h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white"
          />
          <div className="flex gap-2">
            {(["short", "mid", "long"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium ${
                  term === t
                    ? "border-[#6366f1] bg-[#6366f1]/20 text-white"
                    : "border-[#333] text-zinc-400"
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
            className="w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white"
          />
          {err ? <p className="text-xs text-red-400">{err}</p> : null}
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={() => void submit()}
            className="w-full rounded-lg bg-[#6366f1] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "…" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
