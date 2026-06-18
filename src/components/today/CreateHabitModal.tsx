"use client";

import type { TimeBlockRow } from "@/types/today";
import { CreateHabitModalSheet } from "@/components/today/CreateHabitModalSheet";

type CreateHabitModalProps = {
  open: boolean;
  onClose: () => void;
  timeBlocks: TimeBlockRow[];
};

export function CreateHabitModal({
  open,
  onClose,
  timeBlocks,
}: CreateHabitModalProps) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />
      <CreateHabitModalSheet onClose={onClose} timeBlocks={timeBlocks} />
    </div>
  );
}
