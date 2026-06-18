"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/nav/BottomNav";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      const guestHome = pathname === "/" && !user;
      const hide =
        guestHome ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/legal") ||
        /^\/share\/[^/]+$/.test(pathname);
      setShowNav(!hide && Boolean(user));
    });
  }, [pathname]);

  const hideChrome =
    pathname.startsWith("/login") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/legal") ||
    /^\/share\/[^/]+$/.test(pathname) ||
    (pathname === "/" && !showNav);

  return (
    <>
      <div
        className={`flex min-h-full min-w-0 flex-1 flex-col overflow-x-hidden ${
          showNav ? "pb-24" : hideChrome ? "" : "pb-16"
        }`}
      >
        {children}
      </div>
      {showNav ? <BottomNav /> : null}
    </>
  );
}
