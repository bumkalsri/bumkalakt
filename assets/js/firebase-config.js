// Import fungsi yang diperlukan dari SDK Firebase v10 via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyAQ6JnUDDF5tZtw2bIRWcxOCcaXfiBEJls",
    authDomain: "bumkalakt.firebaseapp.com",
    projectId: "bumkalakt",
    storageBucket: "bumkalakt.firebasestorage.app",
    messagingSenderId: "1026115539619",
    appId: "1:1026115539619:web:2c359a88353d61b3af2516",
    measurementId: "G-GH7LNVK3QD"
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Inisialisasi Layanan Firebase yang dibutuhkan untuk Aplikasi Akuntansi
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inisialisasi Analytics secara aman (hanya jika didukung lingkungan browser)
let analytics = null;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

export { app, analytics };