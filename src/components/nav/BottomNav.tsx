"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Calendar, Clock, User } from "lucide-react";

const items = [
  { href: "/", label: "Aujourd'hui", Icon: Calendar },
  { href: "/stats", label: "Stats", Icon: BarChart2 },
  { href: "/checkin", label: "Heure", Icon: Clock },
  { href: "/profile", label: "Profil", Icon: User },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/profile") {
    return (
      pathname === "/profile" ||
      pathname === "/identity" ||
      pathname === "/goals" ||
      pathname.startsWith("/profile/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) {
    return null;
  }

  return (
    <nav
      aria-label="Navigation principale"
      className="bottom-nav pointer-events-none fixed inset-x-0 z-30 flex justify-center px-3"
    >
      <div className="pointer-events-auto glass-nav flex h-14 w-full max-w-md items-center justify-between rounded-[28px] px-1.5">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] leading-tight transition-colors ${
                active
                  ? "font-semibold text-white"
                  : "font-medium text-white/35 hover:text-white/55"
              }`}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
