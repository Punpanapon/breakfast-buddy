self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('notificationclick', async (event) => {
  event.notification.close();
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  const url = '/';
  for (const client of allClients) {
    if ('focus' in client) { 
      client.focus(); 
      return; 
    }
  }
  if (clients.openWindow) await clients.openWindow(url);
});