import { initRouter } from './router.js';

// 1. Pastikan fungsi global toggleSidebar tersedia (tanpa menimpa versi di index.html)
if (typeof window.toggleSidebar !== 'function') {
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (!sidebar) return;

        if (window.innerWidth < 768) {
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                sidebar.classList.add('-translate-x-full');
                if (backdrop) backdrop.classList.add('hidden');
            } else {
                sidebar.classList.remove('-translate-x-full');
                if (backdrop) backdrop.classList.remove('hidden');
            }
        } else {
            if (sidebar.style.display === 'none') {
                sidebar.style.display = 'flex';
                sidebar.classList.remove('-translate-x-full');
            } else {
                sidebar.style.display = 'none';
            }
        }
    };
}

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

// 1.6. Sinkronisasi Posisi Running Text (bottom-0 saat di halaman login, bottom-16 saat di menu utama HP)
window.syncRunningTextPosition = function(forceLoginState = null) {
    const runningContainer = document.getElementById('global-running-text-container');
    const appContainer = document.getElementById('app');
    if (!runningContainer) return;

    let isLoginPage = false;

    if (typeof forceLoginState === 'boolean') {
        isLoginPage = forceLoginState;
    } else {
        const hash = (window.location.hash || '').toLowerCase();
        const hasLoginEl = appContainer ? Boolean(appContainer.querySelector('[data-login-page], #btn-google')) : false;
        isLoginPage = hash.includes('login') || hasLoginEl;
    }

    if (isLoginPage) {
        runningContainer.classList.remove('bottom-16');
        runningContainer.classList.add('bottom-0');
        if (appContainer) {
            appContainer.classList.remove('pb-28');
            appContainer.classList.add('pb-12');
        }
    } else {
        runningContainer.classList.remove('bottom-0');
        runningContainer.classList.add('bottom-16');
        if (appContainer) {
            appContainer.classList.remove('pb-12');
            appContainer.classList.add('pb-28');
        }
    }
};

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
        document.querySelectorAll('#user-role').forEach(el => {
            el.textContent = savedRole;
        });
    }
    if (savedInitial) {
        if (elInit) elInit.textContent = savedInitial;
    }
    if (savedAvatar && savedAvatar !== 'null' && savedAvatar !== '') {
        if (elMobAvatar && elMobAvatar.src !== savedAvatar) {
            elMobAvatar.src = savedAvatar;
        }
    }
};

// Eksekusi pemulihan profil & sinkronisasi posisi segera saat skrip dimuat
window.restoreUserProfile();
window.syncRunningTextPosition();

window.addEventListener('hashchange', () => {
    window.syncRunningTextPosition();
});

window.addEventListener('DOMContentLoaded', () => {
    window.restoreUserProfile();
    window.syncRunningTextPosition();
});

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