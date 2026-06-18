/* global self */
self.addEventListener("push", (event) => {
  let data = { title: "Deepna", body: "" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    data.body = event.data ? event.data.text() : "";
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Deepna", {
      body: data.body || "",
      icon: "/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
