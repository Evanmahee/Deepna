"use client";

import { useEffect, useState } from "react";

const MOODS: { v: 1 | 2 | 3; label: string }[] = [
  { v: 1, label: "Productif" },
  { v: 2, label: "Neutre" },
  { v: 3, label: "Perdu" },
];

type CheckinFormProps = {
  onSuccess?: () => void;
};

export function CheckinForm({ onSuccess }: CheckinFormProps) {
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3>(2);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const now = new Date();
  const timeLabel = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

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
      <p className="text-center text-3xl font-mono font-semibold text-slate-900">
        {timeLabel}
      </p>
      <label className="mt-4 block text-sm font-medium text-slate-600">
        Qu&apos;as-tu fait cette heure ?
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-slate-900"
        placeholder="Notes…"
      />
      <p className="mt-3 text-xs text-slate-500">Tag</p>
      <div className="mt-1 flex gap-2">
        {MOODS.map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => setMood(v)}
            className={`flex-1 rounded-xl border py-2 text-xs font-semibold ${
              mood === v
                ? "glass-subtle border-neutral-900/40 text-neutral-900"
                : "glass-pill text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {success ? (
        <p className="mt-2 text-sm font-medium text-neutral-900" role="status">
          ✓ Enregistré !
        </p>
      ) : null}
      {err ? <p className="mt-2 text-xs text-neutral-700">{err}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void send()}
        className="mt-4 w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </div>
  );
}
