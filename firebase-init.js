import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYzfW2IFhSInPazldWaDnYK2GCJ71mwyc",
    authDomain: "sync-sport.firebaseapp.com",
    projectId: "sync-sport",
    storageBucket: "sync-sport.appspot.com",
    messagingSenderId: "83820373833",
    appId: "1:83820373833:web:e115eb15779f9cfc81dc98",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register service worker first
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/tv-screen-detector/firebase-messaging-sw.js', {
        scope: '/tv-screen-detector/'
    })
    .then(async (registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Request notification permission only after SW is registered
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Notification permission granted.");
            try {
                const currentToken = await getToken(messaging, {
                    vapidKey: "BAwMBHT-uNz_UDUGCCT2sbLZwzvAO7SvJjfDt4RtPt7Q6dgcnaL4F7NQ-ZI6XT8iONyF6S8IxqEN6YTJcjqqjcM",
                    serviceWorkerRegistration: registration
                });
                if (currentToken) {
                    console.log("FCM Token:", currentToken);
                } else {
                    console.log("No registration token available.");
                }
            } catch (err) {
                console.error("Error retrieving token:", err);
            }
        } else {
            console.log("Notification permission denied.");
        }
    })
    .catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
}

// Handle incoming messages
onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    const { title, body } = payload.notification;
    new Notification(title, { body });
});
