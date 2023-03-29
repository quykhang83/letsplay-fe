// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging.js";
// import { onBackgroundMessage } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging-sw.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
// import { getFirestore } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDb8hMhMeZBG_0uobMmHxCjF7sditTKXo8",
  authDomain: "ctu-letsplay.firebaseapp.com",
  projectId: "ctu-letsplay",
  storageBucket: "ctu-letsplay.appspot.com",
  messagingSenderId: "669968732330",
  appId: "1:669968732330:web:98afc1f3a3be9893ce80d3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const applicationServerPublicKey =
  "BBgVQ5DpzOSbUSJowRkYha1s-TjWlbkdyjLfVH9SFJ3jPo38g3BxxFskMzTKnRyFTSWyBNCeNEvciL3ezr6JPQQ";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging(app);

getToken(messaging, { vapidKey: applicationServerPublicKey })
  .then((currentToken) => {
    if (currentToken) {
      console.log("Current token: ", currentToken);

      // Send the token to your server and update the UI if necessary
      // fetch('push-subscription', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token: currentToken })
      // });
      $.ajax({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + keycloak.token,
        },
        data: {
          username: keycloak.idTokenParsed.preferred_username,
          token: currentToken,
        },
        url: "/push-subscription",
        method: "GET",
      });
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
      // ...
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
    // ...
  });

var swRegistration = null;

// Make sure sw are supported
if ("serviceWorker" in navigator && "PushManager" in window) {
  askPermission();
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("firebase-messaging-sw.js")
      .then((reg) => {
        swRegistration = reg;
        console.log("Service Worker: Registered (Pages)");
      })
      .catch((err) => console.log(`Service Worker: Error: ${err}`));
  });
}

function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  }).then(function (permissionResult) {
    if (permissionResult !== "granted") {
      throw new Error("We weren't granted permission.");
    }
  });
}

onMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received foreground message ",
    payload
  );
  // const notificationTitle = 'Foreground Message ApproveMe';
  const notificationOptions = {
    actions: [
      { action: "view", title: "View" },
      { action: "close", title: "Close" },
    ],
    data: {
      url: payload.data.url,
    },
    body: payload.data.body,
    icon: "https://fms-laravel-images.s3.ap-southeast-1.amazonaws.com/images/logoAxonActive.png",
    badge:
      "https://a.fsdn.com/allura/s/axon-ivy-bpm-suite/icon?cfd4dad994c0069c939c8e0210d9f26e5ddca99004deb49724c28ef73412ddf7?&w=120",
  };

  if (!window.Notification) {
    console.log("Browser does not support notifications.");
  } else {
    // check if permission is already granted
    if (Notification.permission === "granted") {
      swRegistration.showNotification(payload.data.title, notificationOptions);
    } else {
      // request permission from user
      Notification.requestPermission()
        .then(function (p) {
          if (p === "granted") {
            swRegistration.showNotification(
              notificationTitle,
              notificationOptions
            );
          } else {
            console.log("User blocked notifications.");
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    }
    addEventListener("notificationclick", (e) => {
      let payload = e.notification;
      clients.openWindow(payload.data.url);
      if (e.action === "view") {
      }
    });
  }
});
