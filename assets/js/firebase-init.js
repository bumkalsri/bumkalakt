// Import the functions you need from the SDKs you need via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Konfigurasi Firebase Anda yang baru (bumkalakt)
const firebaseConfig = {
    apiKey: "AIzaSyAQ6JnUDDF5tZtw2bIRWcxOCcaXfiBEJls",
    authDomain: "bumkalakt.firebaseapp.com",
    projectId: "bumkalakt",
    storageBucket: "bumkalakt.firebasestorage.app",
    messagingSenderId: "1026115539619",
    appId: "1:1026115539619:web:2c359a88353d61b3af2516",
    measurementId: "G-GH7LNVK3QD"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Ekspor auth dan db agar dapat diimpor oleh router.js atau file lainnya
export const auth = getAuth(app);
export const db = getFirestore(app);