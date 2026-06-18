"use client";

import { useState } from "react";
import { AlignJustify } from "lucide-react";
import { SortHabitsModal } from "@/components/today/SortHabitsModal";

export function HeaderOrganizeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-neutral-300 transition-colors hover:text-white active:scale-95"
        aria-label="Trier les habitudes"
      >
        <AlignJustify className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </button>
      <SortHabitsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
