// Import konfigurasi Firebase & Router
import './firebase-config.js';
import './routers.js';

// Registrasi Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker terdaftar:', reg.scope))
            .catch(err => console.log('Gagal mendaftarkan Service Worker:', err));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Aplikasi Akuntansi siap dijalankan (Mode Responsive HP & Desktop).");
});