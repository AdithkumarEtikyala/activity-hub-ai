// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCJ3zT0m0CqqTBcEQt5vJsdAzb8rUA78g4",
  authDomain: "campusconnect-15.firebaseapp.com",
  projectId: "campusconnect-15",
  storageBucket: "campusconnect-15.firebasestorage.app",
  messagingSenderId: "865980515192",
  appId: "1:865980515192:web:907302705123343578fe8d"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'campus-connect-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Event'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});