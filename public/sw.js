self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification',
    icon: '/favicon.png',
    sound: '/notification-sound.mp3'
  };

  event.waitUntil(
    self.registration.showNotification('GuestIT Portal', options)
  );
});