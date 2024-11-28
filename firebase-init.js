import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage, subscribeToTopic } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyBYzfW2IFhSInPazldWaDnYK2GCJ71mwyc",
  authDomain: "sync-sport.firebaseapp.com",
  projectId: "sync-sport",
  storageBucket: "sync-sport.appspot.com",
  messagingSenderId: "83820373833",
  appId: "1:83820373833:web:e115eb15779f9cfc81dc98"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

async function initializeNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.register('/tv-screen-detector/firebase-messaging-sw.js');
      
      // Subscribe to topic
      messaging.subscribeToTopic('test-notifications')
        .then(() => {
          console.log('Subscribed to test-notifications topic');
        })
        .catch((error) => {
          console.error('Error subscribing to topic:', error);
        });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

initializeNotifications();

onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
});
