import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

console.log("Firebase init script starting...");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYzfW2IFhSInPazldWaDnYK2GCJ71mwyc",
  authDomain: "sync-sport.firebaseapp.com",
  projectId: "sync-sport",
  storageBucket: "sync-sport.appspot.com",
  messagingSenderId: "83820373833",
  appId: "1:83820373833:web:e115eb15779f9cfc81dc98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

async function initializeNotifications() {
  console.log("Starting notification initialization");
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/tv-screen-detector/firebase-messaging-sw.js', {
        scope: '/tv-screen-detector/'
      });
      console.log('Service Worker registered with scope:', registration.scope);

      const permission = await Notification.requestPermission();
      console.log("Notification permission response:", permission);

      if (permission === "granted") {
        try {
          const currentToken = await getToken(messaging, {
            vapidKey: "BAwMBHT-uNz_UDUGCCT2sbLZwzvAO7SvJjfDt4RtPt7Q6dgcnaL4F7NQ-ZI6XT8iONyF6S8IxqEN6YTJcjqqjcM",
            serviceWorkerRegistration: registration
          });
          
          if (currentToken) {
            console.log("FCM Token:", currentToken);
          } else {
            console.log("No registration token available");
          }
        } catch (tokenError) {
          console.error("Error getting token:", tokenError);
        }
      }
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded - starting notifications setup");
  initializeNotifications();
});

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});
