import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permission and get the token
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    console.log("Notification permission granted.");
    getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" })
      .then((currentToken) => {
        if (currentToken) {
          console.log("FCM Token:", currentToken);
          // Optionally, send the token to your server
        } else {
          console.log("No registration token available.");
        }
      })
      .catch((err) => {
        console.error("An error occurred while retrieving token.", err);
      });
  } else {
    console.log("Notification permission denied.");
  }
});

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});
