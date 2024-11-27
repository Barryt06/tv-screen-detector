import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle sign in and notification setup
async function initializeNotifications() {
  try {
    // First sign in with Google
    await signInWithPopup(auth, provider);
    
    // Then register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/tv-screen-detector/firebase-messaging-sw.js', {
        scope: '/tv-screen-detector/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        
        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: "BAwMBHT-uNz_UDUGCCT2sbLZwzvAO7SvJjfDt4RtPt7Q6dgcnaL4F7NQ-ZI6XT8iONyF6S8IxqEN6YTJcjqqjcM",
          serviceWorkerRegistration: registration
        });
        
        if (currentToken) {
          console.log("FCM Token:", currentToken);
        } else {
          console.log("No registration token available.");
        }
      }
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

// Add a button or call this function when needed
document.addEventListener('DOMContentLoaded', () => {
  const notifyButton = document.createElement('button');
  notifyButton.textContent = 'Enable Notifications';
  notifyButton.onclick = initializeNotifications;
  document.body.appendChild(notifyButton);
});

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});
