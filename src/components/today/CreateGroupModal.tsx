"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CreateHabitNewSlotFields } from "@/components/today/CreateHabitNewSlotFields";

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [label, setLabel] = useState("Matin");
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setLabel("Matin");
      setStart("07:00");
      setEnd("09:00");
      setErr(null);
    }
  }, [open]);

  async function submit() {
    const title = label.trim();
    if (!title) {
      setErr("Nom du groupe requis");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/time-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          starts_at: start,
          ends_at: end,
          block_date: new Date().toISOString().slice(0, 10),
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? "Création impossible");
      }
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 glass-overlay"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="glass-sheet-dark relative w-full rounded-t-[32px] px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nouveau groupe</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <CreateHabitNewSlotFields
          newLabel={label}
          setNewLabel={setLabel}
          newStart={start}
          setNewStart={setStart}
          newEnd={end}
          setNewEnd={setEnd}
          variant="dark"
        />
        {err ? (
          <p className="mt-3 text-center text-sm text-rose-400">{err}</p>
        ) : null}
        <button
          type="button"
          disabled={loading || !label.trim()}
          onClick={() => void submit()}
          className="mt-6 w-full rounded-2xl bg-indigo-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer le groupe"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
