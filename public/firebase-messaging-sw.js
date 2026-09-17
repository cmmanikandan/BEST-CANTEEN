// Best Canteen V1 - Firebase Messaging Service Worker
/* eslint-disable no-restricted-globals */

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBVff67QrHHLQcsmEkO3Ds9hjlJ_OAKK20",
  authDomain: "best-canteen.firebaseapp.com",
  projectId: "best-canteen",
  storageBucket: "best-canteen.firebasestorage.app",
  messagingSenderId: "965582375662",
  appId: "1:965582375662:web:e5cdbdad8573e9aecd01ff",
  measurementId: "G-35KJQDHBGH"
};

firebase.initializeApp(firebaseConfig);

try {
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);
    const notificationTitle = payload.notification?.title || 'Best Canteen Notification';
    const notificationOptions = {
      body: payload.notification?.body || 'You have an update regarding your canteen order.',
      icon: '/logo new.png',
      badge: '/logo new.png',
      data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('[firebase-messaging-sw.js] Messaging init note: ', e);
}
