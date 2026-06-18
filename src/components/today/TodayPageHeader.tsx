"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { HeaderActions } from "@/components/nav/HeaderActions";
import { HeaderOrganizeButton } from "@/components/nav/HeaderOrganizeButton";
import { formatTodaySubtitle } from "@/lib/today-display";

const DURATION_MS = 320;

type TodayPageHeaderProps = {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  subtitle: string;
};

export function TodayPageHeader({
  searchQuery,
  onSearchQueryChange,
  subtitle,
}: TodayPageHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function closeSearch() {
    setSearchOpen(false);
    window.setTimeout(() => onSearchQueryChange(""), DURATION_MS);
  }

  function openSearch() {
    setSearchOpen(true);
  }

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), DURATION_MS / 2);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  return (
    <header className="px-3 pt-3 pb-1">
      <div className="relative mx-auto min-h-[3.25rem] w-full max-w-md">
        <div
          className={[
            "absolute inset-0 flex items-center justify-between transition-all ease-out",
            searchOpen
              ? "pointer-events-none scale-[0.97] opacity-0"
              : "scale-100 opacity-100",
          ].join(" ")}
          style={{ transitionDuration: `${DURATION_MS}ms` }}
        >
          <div
            className="relative z-10 shrink-0 transition-all ease-out"
            style={{
              transitionDuration: `${DURATION_MS}ms`,
              transitionDelay: searchOpen ? "0ms" : "80ms",
              opacity: searchOpen ? 0 : 1,
              transform: searchOpen ? "translateX(-8px)" : "translateX(0)",
            }}
          >
            <HeaderOrganizeButton />
          </div>

          <h1
            className="pointer-events-none absolute inset-x-2 flex flex-col items-center justify-center text-center transition-all ease-out"
            style={{
              transitionDuration: `${DURATION_MS}ms`,
              transitionDelay: searchOpen ? "40ms" : "60ms",
              opacity: searchOpen ? 0 : 1,
              transform: searchOpen ? "translateY(-4px) scale-95" : "translateY(0) scale-100",
            }}
          >
            <span className="text-xl font-semibold text-white">Aujourd&apos;hui</span>
            <span className="mt-0.5 truncate text-[11px] font-normal text-neutral-400">
              {subtitle}
            </span>
          </h1>

          <div
            className="relative z-10 flex shrink-0 items-center gap-2 transition-all ease-out"
            style={{
              transitionDuration: `${DURATION_MS}ms`,
              transitionDelay: searchOpen ? "60ms" : "0ms",
              opacity: searchOpen ? 0 : 1,
              transform: searchOpen ? "translateX(8px)" : "translateX(0)",
            }}
          >
            <HeaderActions showSearch={false} habitInitialView="custom" />
            <button
              type="button"
              onClick={openSearch}
              className="glass-pill flex h-11 w-11 items-center justify-center rounded-full text-neutral-300 transition-colors hover:text-white active:scale-95"
              aria-label="Rechercher"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div
          className={[
            "absolute inset-0 flex items-center gap-2 transition-all ease-out",
            searchOpen
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-6 opacity-0",
          ].join(" ")}
          style={{
            transitionDuration: `${DURATION_MS}ms`,
            transitionDelay: searchOpen ? "100ms" : "0ms",
          }}
          aria-hidden={!searchOpen}
        >
          <label
            className={[
              "glass-dark flex h-11 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full px-4 transition-all ease-out",
              searchOpen ? "max-w-full opacity-100" : "max-w-[44px] opacity-0",
            ].join(" ")}
            style={{
              transitionDuration: `${DURATION_MS}ms`,
              transitionDelay: searchOpen ? "120ms" : "0ms",
            }}
          >
            <Search className="h-[18px] w-[18px] shrink-0 text-white" strokeWidth={2.2} />
            <input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Rechercher une habitude…"
              tabIndex={searchOpen ? 0 : -1}
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={closeSearch}
            tabIndex={searchOpen ? 0 : -1}
            className={[
              "glass-pill flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-300 transition-all ease-out hover:text-white active:scale-95",
              searchOpen ? "scale-100 opacity-100" : "scale-90 opacity-0",
            ].join(" ")}
            style={{
              transitionDuration: `${DURATION_MS}ms`,
              transitionDelay: searchOpen ? "180ms" : "0ms",
            }}
            aria-label="Fermer la recherche"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
}
