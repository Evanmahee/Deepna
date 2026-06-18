"use client";

import { useState } from "react";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";

export function GoalsFloatingAdd() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#6366f1] text-3xl font-light text-white shadow-lg"
        aria-label="Nouvel objectif"
      >
        +
      </button>
      <CreateGoalModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
