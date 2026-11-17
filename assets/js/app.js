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
    const htmlEl = document.documentElement; 
    const savedTheme = localStorage.getItem('app_theme');
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
    } else {
        htmlEl.classList.remove('dark');
    }
}
initAppTheme();

// 2. Fungsi Helper Mutlak untuk Memulihkan Profil / User UI dari LocalStorage secara Instan
window.restoreUserProfile = function() {
    const savedName = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    const savedRole = localStorage.getItem('user_role');
    const savedInitial = localStorage.getItem('user_initial');
    const savedAvatar = localStorage.getItem('user_avatar');

    const elName = document.getElementById('user-name');
    const elMobName = document.getElementById('mobile-dropdown-name');
    const elEmail = document.getElementById('user-email');
    const elMobEmail = document.getElementById('mobile-dropdown-email');
    const elInit = document.getElementById('user-initial');
    const elMobAvatar = document.getElementById('mobile-user-avatar-img');

    if (savedName) {
        if (elName) elName.textContent = savedName;
        if (elMobName) elMobName.textContent = savedName;
    }
    if (savedEmail) {
        if (elEmail) elEmail.textContent = savedEmail;
        if (elMobEmail) elMobEmail.textContent = savedEmail;
    }
    if (savedRole) {
        document.querySelectorAll('#user-role').forEach(el => el.textContent = savedRole);
    }
    if (savedInitial) {
        if (elInit) elInit.textContent = savedInitial;
    }
    if (savedAvatar && savedAvatar !== "null" && savedAvatar !== "") {
        if (elMobAvatar && elMobAvatar.src !== savedAvatar) {
            elMobAvatar.src = savedAvatar;
        }
    }
};

// Eksekusi pemulihan profil segera saat skrip dimuat
window.restoreUserProfile();

// 3. Jalankan Router SPA
initRouter();

// 4. Daftarkan Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker berhasil didaftarkan:', reg.scope))
            .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
    });
}