// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// Project: bumkalakt
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQ6JnUDDF5tZtw2bIRWcxOCcaXfiBEJls",
  authDomain: "bumkalakt.firebaseapp.com",
  projectId: "bumkalakt",
  storageBucket: "bumkalakt.firebasestorage.app",
  messagingSenderId: "1026115539619",
  appId: "1:1026115539619:web:2c359a88353d61b3af2516",
  measurementId: "G-GH7LNVK3QD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };