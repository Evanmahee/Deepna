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
    <div className="rounded-xl border border-[#333] bg-[#111] p-4">
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        Mantra (identité)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full resize-y rounded-lg border border-[#333] bg-[#0a0a0f] px-3 py-3 text-base text-white placeholder:text-zinc-600 focus:border-[#6366f1] focus:outline-none"
        placeholder="Qui je suis, ce que je deviens…"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "…" : "Enregistrer le mantra"}
        </button>
        {msg ? <span className="text-xs text-zinc-400">{msg}</span> : null}
      </div>
    </div>
  );
}
