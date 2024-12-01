importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYzfW2IFhSInPazldWaDnYK2GCJ71mwyc",
  authDomain: "sync-sport.firebaseapp.com",
  projectId: "sync-sport",
  storageBucket: "sync-sport.appspot.com",
  messagingSenderId: "83820373833",
  appId: "1:83820373833:web:e115eb15779f9cfc81dc98",
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  
  self.clients.matchAll({type: 'window'}).then(clients => {
    console.log('Matching clients count:', clients.length);
    
    if (clients.length === 0) {
      console.warn('No clients found to receive message');
    }
    
    clients.forEach(client => {
      try {
        console.log('Attempting to post message to client:', client);
        client.postMessage({
          type: 'FCM_BACKGROUND_MESSAGE',
          payload: payload
        });
      } catch (error) {
        console.error('Error posting message to client:', error);
      }
    });
  }).catch(error => {
    console.error('Error in matchAll:', error);
  });
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
