"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Calendar, Clock, Sparkles, Target } from "lucide-react";

const items = [
  { href: "/", label: "Aujourd'hui", Icon: Calendar },
  { href: "/identity", label: "Identité", Icon: Sparkles },
  { href: "/goals", label: "Objectifs", Icon: Target },
  { href: "/checkin", label: "Heure", Icon: Clock },
  { href: "/stats", label: "Stats", Icon: BarChart2 },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-[#222] bg-[#0a0a0f]/95 pb-safe backdrop-blur">
      <div className="mx-auto flex h-full max-w-lg items-center justify-between px-1">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] leading-tight ${
                active
                  ? "bg-[#6366f1]/10 text-[#6366f1]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
