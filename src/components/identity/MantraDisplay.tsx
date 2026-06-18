"use client";
import { useState } from "react";

type MantraDisplayProps = {
  value: string;
  onChange: (v: string) => void;
};

export function MantraDisplay({ value, onChange }: MantraDisplayProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écris qui tu veux devenir..."
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onChange(draft); setEditing(false); }}
            className="flex-1 rounded-xl bg-indigo-500 text-white text-sm font-medium py-2"
          >
            Sauvegarder
          </button>
          <button
            onClick={() => { setDraft(value); setEditing(false); }}
            className="flex-1 rounded-xl bg-white/5 text-white/60 text-sm py-2"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="w-full text-left rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 italic"
    >
      {value || "Tape ici qui tu veux devenir..."}
    </button>
  );
}
