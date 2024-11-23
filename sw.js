// sw.js
self.addEventListener('push', function(event) {
    const data = event.data.json();
  
    const options = {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png',
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  
    // Enviar mensagem para o cliente
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'NEW_NOTIFICATION',
          data: data,
        });
      });
    });
  });
  