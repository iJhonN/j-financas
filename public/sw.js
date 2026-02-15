// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'J Finanças', body: 'Tens um novo lembrete!' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png', // Garanta que tens um ícone nesta pasta
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200]
    })
  );
});