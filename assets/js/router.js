import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { renderHome, initHomeHandler } from './views/home.js';
import { renderLogin, initLoginHandler } from './views/login.js';
import { renderManajemen, initManajemenHandler } from './views/manajemen.js';
import { renderTamu, initTamuHandler } from './views/tamu.js';
import { renderStaf, initStafHandler } from './views/staf.js';
import { renderKeuangan, initKeuanganHandler } from './views/keuangan.js';
import { renderAkuntansi, initAkuntansiHandler } from './views/akuntansi.js';
import { renderLaporan, initLaporanHandler } from './views/laporan.js';
import { renderGaleri, initGaleriHandler } from './views/galeri.js';
import { renderEvent, initEventHandler } from './views/event.js';
import { renderMonitoring, initMonitoringHandler } from './views/monitoring.js';
import { renderAnalytics, initAnalyticsHandler } from './views/analytics.js';

const routes = {
    '/': renderHome,
    '/galeri': renderGaleri,
    '/event': renderEvent,
    '/monitoring': renderMonitoring,
    '/analytics': renderAnalytics,
    '/tamu': renderTamu,
    '/staf': renderStaf,
    '/keuangan': renderKeuangan,
    '/akuntansi': renderAkuntansi,
    '/laporan': renderLaporan,
    '/manajemen': renderManajemen,
    '/login': renderLogin
};

// Fungsi Logout Global
window.handleLogout = () => {
    signOut(auth).then(() => {
        location.hash = '#/login';
    }).catch(error => {
        console.error("Gagal keluar:", error);
    });
};

// Fungsi untuk memuat Nama, Informasi/Deskripsi Perusahaan ke Header Atas
async function loadHeaderProfilPerusahaan() {
    try {
        const docRef = doc(db, "pengaturan", "profil_perusahaan");
        const docSnap = await getDoc(docRef);

        const nameEl = document.getElementById('header-company-name');
        const infoEl = document.getElementById('header-company-info');

        if (docSnap.exists()) {
            const data = docSnap.data();
            const nama = data.nama || "Sistem Akuntansi";
            const alamat = data.alamat || "Pengelolaan Keuangan";
            const telepon = data.telepon || "-";

            if (nameEl) nameEl.textContent = nama;
            if (infoEl) infoEl.textContent = `${alamat} | Telp: ${telepon}`;
        } else {
            if (nameEl) nameEl.textContent = "Sistem Akuntansi";
            if (infoEl) infoEl.textContent = "Pengelolaan keuangan dan pencatatan akuntansi";
        }
    } catch (err) {
        console.error("Gagal memuat profil perusahaan untuk header:", err);
    }
}

export async function router() {
    let path = location.hash.slice(1).toLowerCase() || '/';
    const appContainer = document.getElementById('app');

    const sidebar = document.getElementById('sidebar');
    const headerEl = document.querySelector('header');
    const bottomNav = document.getElementById('bottom-nav');

    loadHeaderProfilPerusahaan();

    if (path === '/login') {
        if (sidebar) sidebar.style.display = 'none';
        if (headerEl) headerEl.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
        if (appContainer) {
            appContainer.className = "flex-1 flex flex-col h-screen overflow-hidden p-0 m-0 bg-transparent";
        }
    } else {
        if (sidebar) sidebar.style.display = ''; 
        if (headerEl) headerEl.classList.remove('hidden');
        if (bottomNav) bottomNav.classList.remove('hidden');
        if (appContainer) {
            appContainer.className = "flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-20 md:pb-6";
        }
    }

    // --- RENDER VIEW KE CONTAINER UTAMA ---
    if (appContainer) {
        const renderFunction = routes[path] || renderHome;
        appContainer.innerHTML = renderFunction();

        if (path === '/') {
            initHomeHandler();
        } else if (path === '/login') {
            initLoginHandler();
        } else if (path === '/tamu') {
            initTamuHandler();
        } else if (path === '/staf') {
            initStafHandler();
        } else if (path === '/keuangan') {
            initKeuanganHandler();
        } else if (path === '/akuntansi') {
            initAkuntansiHandler();
        } else if (path === '/laporan') {
            initLaporanHandler();
        } else if (path === '/event') {
            initEventHandler();
        } else if (path === '/galeri') {
            initGaleriHandler();
        } else if (path === '/analytics') {
            initAnalyticsHandler();
        } else if (path === '/manajemen') {
            initManajemenHandler();
        } else if (path === '/monitoring') {
            initMonitoringHandler();
        }
    }

    // --- UPDATE INDIKATOR WARNA KELAS AKTIF PADA SIDEBAR ---
    const sidebarLinks = document.querySelectorAll('#sidebar-nav a');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' + path) {
            link.className = "flex items-center gap-3 px-3 py-2.5 rounded-none text-indigo-700 bg-indigo-50 transition";
        } else {
            link.className = "flex items-center gap-3 px-3 py-2.5 rounded-none text-slate-600 hover:bg-slate-50 transition";
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (!user && path !== '/login') {
            location.hash = '#/login';
            return;
        }

        if (user && path === '/login') {
            location.hash = '#/';
            return;
        }

        let userRole = "User";

        if (user) {
            const email = user.email;
            const photoURL = user.photoURL;

            let displayName = user.displayName || email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.nama) displayName = userData.nama;
                    if (userData.role) userRole = userData.role;
                } else {
                    await setDoc(userDocRef, {
                        uid: user.uid,
                        email: email,
                        nama: displayName,
                        photoURL: photoURL || "",
                        role: "Staf",
                        createdAt: new Date().toISOString()
                    });
                    userRole = "Staf";
                }
            } catch (err) {
                console.error("Gagal memuat data pengguna di Firestore:", err);
            }

            // --- KONTROL VISIBILITAS MENU ADMINISTRATOR & ROUTE GUARD ---
            const adminMenuSection = document.getElementById('admin-menu-section');
            const adminRoutes = ['/analytics', '/tamu', '/staf', '/keuangan', '/akuntansi', '/laporan', '/manajemen'];

            if (userRole === 'Administrator') {
                if (adminMenuSection) adminMenuSection.classList.remove('hidden');
            } else {
                if (adminMenuSection) adminMenuSection.classList.add('hidden');
                
                if (adminRoutes.includes(path)) {
                    location.hash = '#/';
                    return;
                }
            }

            // Update UI Profil Desktop & Mobile
            const userNameEl = document.getElementById('user-name');
            const userEmailEl = document.getElementById('user-email');
            const userRoleEl = document.getElementById('user-role');
            const mobileNameEl = document.getElementById('mobile-dropdown-name');
            const mobileEmailEl = document.getElementById('mobile-dropdown-email');
            const mobileRoleEl = document.getElementById('mobile-user-role');

            if (userNameEl) userNameEl.textContent = displayName;
            if (userEmailEl) userEmailEl.textContent = email;
            if (userRoleEl) userRoleEl.textContent = userRole;
            if (mobileNameEl) mobileNameEl.textContent = displayName;
            if (mobileEmailEl) mobileEmailEl.textContent = email;
            if (mobileRoleEl) mobileRoleEl.textContent = userRole;

            // --- RENDER AVATAR ---
            const userInitialEl = document.getElementById('user-initial');
            if (userInitialEl) {
                const nameParts = displayName.split(' ');
                const initials = nameParts.length > 1 
                    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
                    : displayName.substring(0, 2).toUpperCase();

                if (photoURL && photoURL.trim() !== "") {
                    userInitialEl.innerHTML = `<img src="${photoURL}" alt="Profile" class="w-full h-full object-cover rounded-none" onerror="this.onerror=null; this.parentNode.innerHTML='${initials}';">`;
                    userInitialEl.className = "w-8 h-8 rounded-none overflow-hidden border border-slate-200 flex items-center justify-center bg-indigo-600 text-white font-bold text-xs flex-shrink-0";
                } else {
                    userInitialEl.textContent = initials;
                    userInitialEl.className = "w-8 h-8 rounded-none bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0";
                }
            }

            const mobileAvatarImg = document.getElementById('mobile-user-avatar-img');
            if (mobileAvatarImg) {
                if (photoURL && photoURL.trim() !== "") {
                    mobileAvatarImg.src = photoURL;
                    mobileAvatarImg.onerror = function() {
                        this.style.display = 'none';
                        if (this.parentNode) {
                            const nameParts = displayName.split(' ');
                            this.parentNode.textContent = nameParts.length > 1 
                                ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
                                : displayName.substring(0, 2).toUpperCase();
                        }
                    };
                } else {
                    mobileAvatarImg.style.display = 'none';
                }
            }

            const profileBtn = document.getElementById('mobile-profile-btn');
            const dropdownMenu = document.getElementById('mobile-dropdown-menu');

            if (profileBtn && dropdownMenu) {
                profileBtn.onclick = (e) => {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('hidden');
                };
                dropdownMenu.onclick = (e) => {
                    e.stopPropagation();
                };
            }
        }

        // --- RENDER BOTTOM NAVIGATION ---
        if (bottomNav && path !== '/login') {
            bottomNav.innerHTML = `
                <a href="#/" data-link class="flex flex-col items-center justify-center ${path === '/' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'} flex-1 py-1">
                    <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span class="text-[10px] font-medium">Beranda</span>
                </a>
                <a href="#/galeri" data-link class="flex flex-col items-center justify-center ${path === '/galeri' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'} flex-1 py-1">
                    <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span class="text-[10px] font-medium">Galeri</span>
                </a>
                <a href="#/event" data-link class="flex flex-col items-center justify-center ${path === '/event' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'} flex-1 py-1">
                    <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span class="text-[10px] font-medium">Event</span>
                </a>
                <a href="#/monitoring" data-link class="flex flex-col items-center justify-center ${path === '/monitoring' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'} flex-1 py-1">
                    <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span class="text-[10px] font-medium">Monitoring</span>
                </a>
                <div class="relative flex-1">
                    <button id="mobile-more-btn" class="w-full flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 py-1 focus:outline-none">
                        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
                        <span class="text-[10px] font-medium">More</span>
                    </button>
                    <div id="mobile-more-popup" class="hidden absolute bottom-16 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-xl py-2 z-50">
                        <div class="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menu Navigasi</div>
                        ${userRole === 'Administrator' ? `
                            <a href="#/analytics" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Analytics</a>
                            <a href="#/tamu" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Tamu</a>
                            <a href="#/staf" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Staf</a>
                            <a href="#/keuangan" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Keuangan</a>
                            <a href="#/akuntansi" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Akuntansi</a>
                            <a href="#/laporan" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Laporan</a>
                            <a href="#/manajemen" data-link class="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Manajemen</a>
                        ` : ''}
                        <div class="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                        <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Keluar
                        </button>
                    </div>
                </div>
            `;

            const moreBtn = document.getElementById('mobile-more-btn');
            const morePopup = document.getElementById('mobile-more-popup');

            if (moreBtn && morePopup) {
                moreBtn.onclick = (e) => {
                    e.stopPropagation();
                    morePopup.classList.toggle('hidden');
                };
                morePopup.onclick = (e) => {
                    e.stopPropagation();
                };
            }
        }
    });
}

export function initRouter() {
    window.addEventListener('hashchange', router);
    window.addEventListener('DOMContentLoaded', () => {
        router();
        document.body.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                location.hash = e.target.getAttribute('href');
                const popup = document.getElementById('mobile-more-popup');
                if (popup) popup.classList.add('hidden');
            }
        });

        window.addEventListener('click', (e) => {
            const dropdownMenu = document.getElementById('mobile-dropdown-menu');
            const profileBtn = document.getElementById('mobile-profile-btn');
            const morePopup = document.getElementById('mobile-more-popup');
            const moreBtn = document.getElementById('mobile-more-btn');
            
            if (dropdownMenu && profileBtn) {
                if (!dropdownMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            }
            if (morePopup && moreBtn) {
                if (!morePopup.contains(e.target) && !moreBtn.contains(e.target)) {
                    morePopup.classList.add('hidden');
                }
            }
        });
    });
}