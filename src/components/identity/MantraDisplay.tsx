"use client";

import { useEffect, useState } from "react";

type MantraDisplayProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MantraDisplay({ value, onChange }: MantraDisplayProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  function save() {
    onChange(draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          className="w-full resize-none rounded-2xl border border-white/10 bg-[#1a1a24] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none"
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écris qui tu veux devenir..."
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-xl bg-[#6366f1] py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={cancel}
            className="flex-1 rounded-xl bg-white/5 py-2 text-sm text-white/60 hover:bg-white/10"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="w-full rounded-2xl border border-white/10 bg-[#1a1a24] px-4 py-3 text-left text-sm italic text-white/80 transition-colors hover:border-white/20"
    >
      {value || "Tape ici qui tu veux devenir..."}
    </button>
  );
}
