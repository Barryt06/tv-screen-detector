
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

// Request notification permission and retrieve FCM token
Notification.requestPermission()
    .then((permission) => {
        if (permission === "granted") {
            console.log("Notification permission granted.");
            messaging.getToken({ vapidKey: "YOUR_VAPID_KEY" })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        // Send the token to your server (if needed)
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
onMessage(messaging, (payload) => {
  console.log("Message received:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});
