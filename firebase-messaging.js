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
const messaging = firebase.messaging();

// Request notification permission and retrieve FCM token
Notification.requestPermission()
    .then((permission) => {
        if (permission === "granted") {
            console.log("Notification permission granted.");
            messaging.getToken({ vapidKey: "BAwMBHT-uNz_UDUGCCT2sbLZwzvAO7SvJjfDt4RtPt7Q6dgcnaL4F7NQ-ZI6XT8iONyF6S8IxqEN6YTJcjqqjcM" }) // Replace with your VAPID Key
                .then((currentToken) => {
                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        // Optionally, send the token to your server
                    } else {
                        console.log("No registration token available.");
                    }
                })
                .catch((err) => console.error("Error retrieving token:", err));
        } else {
            console.log("Notification permission denied.");
        }
    });

// Handle incoming messages
messaging.onMessage((payload) => {
    console.log("Message received:", payload);
    const { title, body } = payload.notification;
    new Notification(title, { body });
});

