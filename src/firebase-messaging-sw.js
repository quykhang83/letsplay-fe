importScripts("https://www.gstatic.com/firebasejs/9.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/9.16.0/firebase-messaging-sw.js");

const firebaseConfig = {
  apiKey: "AIzaSyDb8hMhMeZBG_0uobMmHxCjF7sditTKXo8",
  authDomain: "ctu-letsplay.firebaseapp.com",
  projectId: "ctu-letsplay",
  storageBucket: "ctu-letsplay.appspot.com",
  messagingSenderId: "669968732330",
  appId: "1:669968732330:web:98afc1f3a3be9893ce80d3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  // const notification = JSON.parse(payload);
  // const notificationTitle = 'Background Message ApproveMe';
  const notificationOptions = {
    actions: [
      { action: "view", title: "View" },
      { action: "close", title: "Close" },
    ],
    data: {
      url: payload.data.url,
    },
    body: payload.data.body,
    icon: 'https://fms-laravel-images.s3.ap-southeast-1.amazonaws.com/images/logoAxonActive.png',
    // requireInteraction: true,
    silent: true
  };

  self.registration.showNotification(payload.data.title,
    notificationOptions);
});

// const cacheName = "v1";

// const cacheAssets = [
//   "src/index.html",
//   "Request.html",
//   "css/style.css",
//   "css/request.css",
//   "js/main.js",
//   "js/request.js",
// ];

// Call Install Event
self.addEventListener("install", (e) => {
  console.log("Service Worker: Installed");
  // e.waitUntil(
  //   caches
  //     .open(cacheName)
  //     .then((cache) => {
  //       console.log("Service Worker: Caching Files");
  //       cache.addAll(cacheAssets);
  //     })
  //     .then(() => self.skipWaiting())
  // );
});

// Call Activate Event
self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activated");
  // Remove unwanted caches
  // e.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cache) => {
  //         if (cache !== cacheName) {
  //           console.log("Service Worker: Clearing Old Cache");
  //           return caches.delete(cache);
  //         }
  //       })
  //     );
  //   })
  // );
});

// Call Fetch Event
self.addEventListener("fetch", (e) => {
  console.log("Service Worker: Fetching");
  // setInterval(() => {
  //   self.registration.showNotification("Hello SW!!!!!!!!!!!!!")
  // }, 5000);
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// self.addEventListener("push", (e) => {
//   const notification = e.data.json();
//   console.log('[firebase-messaging-sw.js] Received background message ', notification);
//   // Customize notification here
//   // const notification = JSON.parse(payload);
//   // const notificationTitle = 'Background Message ApproveMe';
//   const notificationOptions = {
//     actions: [
//       { action: "view", title: "View" },
//       { action: "close", title: "Close" },
//     ],
//     data: {
//       url: notification.fcmOptions.link,
//     },
//     body: notification.notification.body,
//     icon: 'https://fms-laravel-images.s3.ap-southeast-1.amazonaws.com/images/logoAxonActive.png',
//     requireInteraction: true,
//     silent: true
//   };

//   e.waitUntil(self.registration.showNotification("Test again!", notificationOptions));
// });

self.addEventListener("notificationclick", (e) => {
  let payload = e.notification;
  if (e.action === "view") {
    clients.openWindow(payload.data.url);
  }
});

// Fetch Message Event
// self.addEventListener("message", (e) => {
//   //message from web page ev.data.
//   //Extendable Event
// });
