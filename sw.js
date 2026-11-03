// התראות בטלפון לבעל העסק (Web Push): פנייה/הזמנה חדשה ← התראה; לחיצה ← מסך הפניות
self.addEventListener('push', e => { const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'פנייה חדשה', { body: d.body || '', tag: d.tag, data: { url: d.url || 'leads.html' }, icon: 'icon-192.png', badge: 'icon-192.png', dir: 'rtl', lang: 'he' })); });
self.addEventListener('notificationclick', e => { e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(w => { const c = w.find(x => x.url.includes('leads.html')); return c ? c.focus() : clients.openWindow(e.notification.data.url); })); });
