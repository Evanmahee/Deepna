"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TimeBlockRow } from "@/types/today";
import { CreateHabitTypePicker } from "@/components/today/CreateHabitTypePicker";
import { CreateHabitNewSlotFields } from "@/components/today/CreateHabitNewSlotFields";

export const NEW_TIME_BLOCK = "__new__";

const inputClass =
  "w-full rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white";

type SheetProps = {
  onClose: () => void;
  timeBlocks: TimeBlockRow[];
};

export function CreateHabitModalSheet({ onClose, timeBlocks }: SheetProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("⭐");
  const [type, setType] = useState<"good" | "bad" | "neutral">("good");
  const [blockId, setBlockId] = useState("");
  const [newLabel, setNewLabel] = useState("Nouveau créneau");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      let resolved: string | null = blockId || null;
      if (blockId === NEW_TIME_BLOCK) {
        const block_date = new Date().toISOString().slice(0, 10);
        const tb = await fetch("/api/time-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newLabel.trim() || "Créneau",
            block_date,
            starts_at: `${block_date}T${newStart}:00.000Z`,
            ends_at: `${block_date}T${newEnd}:00.000Z`,
          }),
        });
        const tbJson = (await tb.json()) as { id?: string; error?: string };
        if (!tb.ok) {
          throw new Error(tbJson.error ?? "Créneau impossible");
        }
        resolved = tbJson.id ?? null;
      } else if (!resolved) {
        resolved = null;
      }
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          icon_emoji: emoji.trim() || "⭐",
          habit_type: type,
          time_block_id: resolved,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Création impossible");
      }
      setTitle("");
      setEmoji("⭐");
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl border border-[#333] bg-[#0a0a0f] px-4 pb-8 pt-4">
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-600" />
      <h3 className="mb-4 text-lg font-semibold text-white">Nouvelle habitude</h3>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Ex. Méditation"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className={inputClass}
            placeholder="🧘"
          />
        </div>
        <CreateHabitTypePicker value={type} onChange={setType} />
        <div>
          <label className="mb-1 block text-xs text-zinc-400">
            Créneau horaire
          </label>
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            className={inputClass}
          >
            <option value="">Aucun</option>
            {timeBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                {(b.icon_emoji ? `${b.icon_emoji} ` : "") + b.title}
              </option>
            ))}
            <option value={NEW_TIME_BLOCK}>+ Nouveau créneau</option>
          </select>
        </div>
        {blockId === NEW_TIME_BLOCK ? (
          <CreateHabitNewSlotFields
            newLabel={newLabel}
            setNewLabel={setNewLabel}
            newStart={newStart}
            setNewStart={setNewStart}
            newEnd={newEnd}
            setNewEnd={setNewEnd}
          />
        ) : null}
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="button"
          disabled={loading || !title.trim()}
          onClick={() => void submit()}
          className="w-full rounded-lg bg-[#6366f1] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer"}
        </button>
      </div>
    </div>
  );
}
