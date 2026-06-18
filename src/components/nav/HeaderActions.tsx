"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CreateHabitModal } from "@/components/today/CreateHabitModal";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";

type HeaderActionsProps = {
  showSearch?: boolean;
  onSearchClick?: () => void;
};

export function HeaderActions({
  showSearch = true,
  onSearchClick,
}: HeaderActionsProps) {
  const pathname = usePathname();
  const isProfile =
    pathname === "/profile" ||
    pathname === "/identity" ||
    pathname === "/goals" ||
    pathname.startsWith("/profile/");

  const [habitOpen, setHabitOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  function onAdd() {
    if (isProfile) {
      setGoalOpen(true);
    } else {
      setHabitOpen(true);
    }
  }

  return (
    <>
      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="glass-primary flex h-11 w-11 items-center justify-center rounded-full text-2xl font-light leading-none transition-transform active:scale-95"
          aria-label={isProfile ? "Ajouter un objectif" : "Ajouter une habitude"}
        >
          +
        </button>
        {showSearch ? (
          <button
            type="button"
            onClick={onSearchClick}
            className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-neutral-300 transition-colors hover:text-white active:scale-95"
            aria-label="Rechercher"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        ) : null}
      </div>
      <CreateHabitModal open={habitOpen} onClose={() => setHabitOpen(false)} />
      <CreateGoalModal open={goalOpen} onClose={() => setGoalOpen(false)} />
    </>
  );
}
