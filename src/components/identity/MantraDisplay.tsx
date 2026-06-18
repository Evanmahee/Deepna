"use client";

import { useState } from "react";

type MantraDisplayProps = {
  value: string;
  onChange: (v: string) => void;
};

export function MantraDisplay({ value, onChange }: MantraDisplayProps) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/identity/statement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_statement: value }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Erreur");
      }
      setMsg("Mantra enregistré.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass rounded-xl p-4 shadow-sm">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Mantra (identité)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="glass-input w-full resize-y rounded-xl px-3 py-3 text-base text-slate-900 placeholder:text-slate-400"
        placeholder="Qui je suis, ce que je deviens…"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "…" : "Enregistrer le mantra"}
        </button>
        {msg ? <span className="text-xs text-slate-500">{msg}</span> : null}
      </div>
    </div>
  );
}
