"use client";

import { useEffect } from "react";
import { ensurePushSubscription } from "@/lib/push-client";

export function PushRegister() {
  useEffect(() => {
    void ensurePushSubscription().catch(() => {
      /* push optionnel */
    });
  }, []);

  return null;
}
