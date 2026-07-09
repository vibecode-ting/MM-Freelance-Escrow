// ============================================================
// firebase-config.js — Firebase initialization & exports
// Fails gracefully when config is placeholder
// ============================================================

let app = null;
let auth = null;
let db = null;

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase init failed:", e.message);
  }
} else {
  console.warn("Firebase not configured — running in demo mode. Replace YOUR_API_KEY in js/firebase-config.js");
}

export { app, auth, db, isConfigured };
