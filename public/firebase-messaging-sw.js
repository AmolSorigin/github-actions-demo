// Service Worker for Firebase Cloud Messaging
// This file is required for FCM web push notifications
// Note: Firebase SDK will automatically initialize this service worker

// Handle background push notifications using native Push API
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Notification',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Parsed payload:', payload);

      // Handle AWS SNS format: { default: "...", FCM: "..." } or { default: "...", GCM: "..." }
      // For web push, FCM/GCM processes the message and sends the platform-specific key content
      let fcmPayload = null;

      // First, try to parse FCM key if it exists (raw SNS format)
      if (payload.FCM) {
        try {
          fcmPayload = JSON.parse(payload.FCM);
        } catch (e) {
          console.error('Error parsing FCM payload:', e);
        }
      }
      // Try to parse GCM key if it exists (raw SNS format for GCM platform)
      else if (payload.GCM) {
        try {
          fcmPayload = JSON.parse(payload.GCM);
        } catch (e) {
          console.error('Error parsing GCM payload:', e);
        }
      }
      // Check if payload is already in FCM/GCM format
      else if (payload.notification) {
        fcmPayload = payload;
      }

      // Extract notification data from FCM payload
      if (fcmPayload && fcmPayload.notification) {
        notificationData.title = fcmPayload.notification.title || notificationData.title;
        notificationData.body = fcmPayload.notification.body || notificationData.body;
        if (fcmPayload.notification.icon) {
          notificationData.icon = fcmPayload.notification.icon;
        }
        if (fcmPayload.data) {
          notificationData.data = fcmPayload.data;
        }
      }
      // Handle SNS default format when FCM/GCM payload is not available
      else if (payload.default) {
        notificationData.body = payload.default;
        // Store the original payload as data (excluding default, FCM, and GCM since we used them)
        const dataCopy = { ...payload };
        delete dataCopy.default;
        delete dataCopy.FCM;
        delete dataCopy.GCM;
        notificationData.data = Object.keys(dataCopy).length > 0 ? dataCopy : {};
      }
      // Handle direct format: { title, body, data }
      else if (payload.title || payload.body) {
        notificationData.title = payload.title || notificationData.title;
        notificationData.body = payload.body || notificationData.body;
        if (payload.data) {
          notificationData.data = payload.data;
        }
      }
      // If payload has data but no clear structure, store it
      else if (payload.data) {
        notificationData.data = payload.data;
      }
    } catch (parseError) {
      // If data is not JSON, try as text
      try {
        const text = event.data.text();
        notificationData.body = text || notificationData.body;
        console.log('Using text data:', text);
      } catch (textError) {
        console.error('Error parsing push data:', textError);
      }
    }
  }

  console.log('Showing notification with data:', notificationData);

  // Store title and body in data so we can retrieve them on click
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: {
      ...notificationData.data,
      title: notificationData.title,
      body: notificationData.body,
    },
    tag: 'fcm-notification',
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationOptions));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  const notification = event.notification;
  const title = notification.title || notification.data?.title || 'Notification';
  const body = notification.body || notification.data?.body || '';

  // Extract custom data (excluding title and body we stored)
  const customData = { ...notification.data };
  delete customData.title;
  delete customData.body;

  event.notification.close();

  // Open the app when notification is clicked and send message data
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and send message
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Send message to the client
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            title: title,
            body: body,
            data: customData,
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/').then((newClient) => {
          // Send message after window opens
          if (newClient) {
            setTimeout(() => {
              newClient.postMessage({
                type: 'NOTIFICATION_CLICKED',
                title: title,
                body: body,
                data: customData,
              });
            }, 500);
          }
        });
      }
    }),
  );
});
