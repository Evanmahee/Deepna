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
        pathname.startsWith("/legal");
      setShowNav(!hide && Boolean(user));
    });
  }, [pathname]);

  const hideChrome =
    pathname.startsWith("/login") ||
    pathname.startsWith("/legal") ||
    (pathname === "/" && !showNav);

  return (
    <>
      <div
        className={`flex min-h-full flex-1 flex-col ${
          showNav ? "pb-16" : hideChrome ? "" : "pb-16"
        }`}
      >
        {children}
      </div>
      {showNav ? <BottomNav /> : null}
    </>
  );
}
