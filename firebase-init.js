import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


console.log("Firebase init script starting..."); // Add this log

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

console.log("Firebase initialized"); // Add this log

// Function to handle sign in and notification setup
async function initializeNotifications() {
  console.log("Initialize notifications function called"); // Add this log
  try {
    // Add right after the Google sign-in attempt:
    await signInWithPopup(auth, provider).then((result) => {
      console.log("Sign in successful, user:", result.user.email);
    }).catch((error) => {
      console.error("Sign in error:", error.code, error.message);
      // Log the specific auth error
      if (error.code === 'auth/configuration-not-found') {
        console.error("Auth configuration error - check Firebase Console Auth settings");
      }
    });
    
    // Then register service worker
    if ('serviceWorker' in navigator) {
      console.log("Service Worker registration starting..."); // Add this log
      const registration = await navigator.serviceWorker.register('/tv-screen-detector/firebase-messaging-sw.js', {
        scope: '/tv-screen-detector/'
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      console.log("Notification permission response:", permission); // Add this log
      
      if (permission === "granted") {
        console.log("Notification permission granted.");
        
        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: "BAwMBHT-uNz_UDUGCCT2sbLZwzvAO7SvJjfDt4RtPt7Q6dgcnaL4F7NQ-ZI6XT8iONyF6S8IxqEN6YTJcjqqjcM",
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
    console.error("Error details:", error.message); // Add this log
  }
}

console.log("Setting up notification button..."); // Add this log

// Remove the button creation code and just call initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded - starting notification setup");
  initializeNotifications();
});

// Handle incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});
