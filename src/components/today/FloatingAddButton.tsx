"use client";

import { useState } from "react";
import { CreateHabitModal } from "@/components/today/CreateHabitModal";

type FloatingAddButtonProps = {
  initialView?: "templates" | "custom";
};

export function FloatingAddButton({
  initialView = "templates",
}: FloatingAddButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#6366f1] text-3xl font-light text-white shadow-lg shadow-indigo-900/50 transition-transform hover:scale-105 active:scale-95"
        aria-label="Ajouter une habitude"
      >
        +
      </button>
      <CreateHabitModal
        open={open}
        onClose={() => setOpen(false)}
        initialView={initialView}
      />
    </>
  );
}
