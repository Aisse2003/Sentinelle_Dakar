/* Simple service worker for Web Push notifications */
self.addEventListener("push", function (event) {
  const data = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();
  const title = data.title || "Alerte Sentinel Dakar";
  const body = data.body || "Nouvelle notification";
  const url = data.url || "/alertes";
  const options = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    data: { url },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});


