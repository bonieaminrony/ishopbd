importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8",
  authDomain: "i-shop-bd.firebaseapp.com",
  projectId: "i-shop-bd",
  storageBucket: "i-shop-bd.firebasestorage.app",
  messagingSenderId: "858962925513",
  appId: "1:858962925513:web:c3ba3ef774b76fe03ffa18",
  measurementId: "G-VENHHWSZ6V"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // make sure you have logo.png in public folder
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
