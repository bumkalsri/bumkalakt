import { initRouter } from './router.js';

// 1. Definisikan fungsi global untuk toggle sidebar
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
        } else {
            sidebar.classList.remove('flex');
            sidebar.classList.add('hidden');
        }
    }
};

// 1.5. Inisialisasi Mode Gelap & Cerah Berdasarkan LocalStorage
function initAppTheme() {
    const htmlEl = document.documentElement; // tag <html>
    const savedTheme = localStorage.getItem('maga_theme');
    
    // Jika tersimpan 'dark' atau sistem mendukung mode gelap dan belum ada settingan
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }
}

// Jalankan inisialisasi tema saat aplikasi pertama kali dimuat
initAppTheme();

// 2. Jalankan Router SPA
initRouter();

// 3. Daftarkan Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker berhasil didaftarkan:', reg.scope))
            .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
    });
}