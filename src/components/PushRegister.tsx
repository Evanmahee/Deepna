"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushRegister() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key || typeof window === "undefined") {
      return;
    }
    const vapidKey = key;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        if (cancelled) {
          return;
        }
        const perm = await Notification.requestPermission();
        if (perm !== "granted" || cancelled) {
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
          credentials: "same-origin",
        });
      } catch {
        /* push optionnel */
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
