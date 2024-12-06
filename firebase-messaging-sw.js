importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

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

// Set up the Google provider
const provider = new firebase.auth.GoogleAuthProvider();

// Optional: Specify additional OAuth 2.0 scopes
provider.addScope("https://www.googleapis.com/auth/firebase.messaging");

// Sign in with a pop-up window
// Sign-in function
const signInWithGoogle = () => {
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      // User signed in successfully.
      const user = result.user;
      console.log(`Welcome ${user.displayName}!`);
    })
    .catch((error) => {
      // Handle Errors here.
      console.error(error);
    });
};

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((clients) => {
      console.log("Clients");
      clients.forEach((client) => {
        console.log(client);
        client.postMessage({
          type: "FIREBASE_DATA",
          data: payload,
        });
      });
    });
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
