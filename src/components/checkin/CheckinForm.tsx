"use client";

import { useEffect, useState } from "react";
import { moodEmoji } from "@/types/hourly";

const MOODS: { v: 1 | 2 | 3 }[] = [{ v: 1 }, { v: 2 }, { v: 3 }];

type CheckinFormProps = {
  onSuccess?: () => void;
};

export function CheckinForm({ onSuccess }: CheckinFormProps) {
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3>(2);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) {
      return;
    }
    const t = window.setTimeout(() => {
      setNote("");
      setMood(2);
      setSuccess(false);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [success]);

  async function send() {
    setErr(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/checkin/hourly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || null, mood }),
      });
      const j = (await res.json()) as {
        error?: string;
        supabase?: Record<string, unknown>;
      };
      if (!res.ok) {
        const parts: string[] = [];
        if (j.error) parts.push(j.error);
        if (j.supabase) parts.push(JSON.stringify(j.supabase));
        throw new Error(parts.length > 0 ? parts.join(" — ") : "Erreur");
      }
      setSuccess(true);
      onSuccess?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-xl p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-neutral-400">Humeur</p>
      <div className="flex gap-2">
        {MOODS.map(({ v }) => (
          <button
            key={v}
            type="button"
            onClick={() => setMood(v)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 text-2xl transition-colors ${
              mood === v
                ? "border-indigo-400/60 bg-indigo-500/20"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
            aria-label={`Humeur ${v}`}
            aria-pressed={mood === v}
          >
            {moodEmoji(v)}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium text-neutral-300">
        Qu&apos;as-tu fait cette heure ?
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
        placeholder="Décris ce que tu as accompli…"
      />
      {success ? (
        <p className="mt-2 text-sm font-medium text-emerald-400" role="status">
          ✓ Enregistré !
        </p>
      ) : null}
      {err ? <p className="mt-2 text-xs text-red-400">{err}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void send()}
        className="mt-4 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </div>
  );
}
