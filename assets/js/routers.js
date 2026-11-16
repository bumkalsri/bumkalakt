import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const routes = {
    '': { title: 'Dashboard', file: './views/dashboard.html', authRequired: true },
    '#': { title: 'Dashboard', file: './views/dashboard.html', authRequired: true },
    '#dashboard': { title: 'Dashboard', file: './views/dashboard.html', authRequired: true },
    '#coa': { title: 'Chart of Accounts (COA)', file: './views/coa.html', authRequired: true },
    '#jurnal': { title: 'Jurnal Transaksi', file: './views/jurnal.html', authRequired: true },
    '#buku-besar': { title: 'Buku Besar', file: './views/buku-besar.html', authRequired: true },
    '#neraca-lajur': { title: 'Neraca Lajur', file: './views/neraca-lajur.html', authRequired: true },
    '#laba-rugi': { title: 'Laporan Laba Rugi', file: './views/laba-rugi.html', authRequired: true },
    '#neraca': { title: 'Laporan Neraca', file: './views/neraca.html', authRequired: true },
    '#pengaturan': { title: 'Pengaturan & Tahun Buku', file: './views/pengaturan.html', authRequired: true },
    '#login': { title: 'Login Akuntansi', file: './views/login.html', authRequired: false }
};

// Fungsi untuk memperbarui Nama, Role, dan Foto Profil dari Firestore & Auth
async function updateProfileUI(user) {
    if (!user) return;

    let nama = user.displayName || "Pengguna";
    let role = "Staff";
    let photoURL = user.photoURL || "";

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.nama) nama = data.nama;
            if (data.role) role = data.role;
        }
    } catch (e) {
        console.error("Gagal mengambil data profil dari Firestore:", e);
    }

    // Perbarui teks Nama dan Role
    document.querySelectorAll('.profile-name').forEach(el => el.textContent = nama);
    document.querySelectorAll('.profile-role').forEach(el => el.textContent = role);
    
    // Perbarui elemen Gambar / Avatar Profil dengan fallback otomatis (mencegah error 429)
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=2563eb&color=fff&size=128`;
    
    document.querySelectorAll('.profile-avatar').forEach(el => {
        if (photoURL) {
            el.src = photoURL;
            el.onerror = function() {
                this.src = fallbackAvatar;
            };
        } else {
            el.src = fallbackAvatar;
        }
    });
}

// Fungsi untuk memuat komponen UI Layout secara responsif dari folder components/
async function loadLayoutComponents(user) {
    try {
        const isMobile = window.innerWidth < 768;

        // 1. Render Sidebar Desktop (Memuat dari folder components/desktop/)
        const desktopSidebar = document.getElementById('desktop-sidebar-container');
        if (desktopSidebar) {
            if (!isMobile) {
                desktopSidebar.style.display = 'flex';
                if (!desktopSidebar.dataset.loaded) {
                    const res = await fetch('./components/desktop/sidebar-desktop.html');
                    if (res.ok) {
                        desktopSidebar.innerHTML = await res.text();
                        desktopSidebar.dataset.loaded = "true";
                    } else {
                        // Fallback inline jika file komponen terlewat
                        desktopSidebar.innerHTML = `
                            <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                                <span id="sidebar-brand-text" class="font-bold text-base text-primary tracking-wide">AKUNTANSI PWA</span>
                                <button onclick="toggleSidebar()" class="text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer" title="Toggle Menu">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                </button>
                            </div>
                            <nav class="p-2 space-y-1 flex-1 bg-white overflow-x-hidden">
                                <a href="#dashboard" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📊 <span class="nav-label">Dashboard</span></a>
                                <a href="#coa" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📑 <span class="nav-label">Master Akun (COA)</span></a>
                                <a href="#jurnal" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📝 <span class="nav-label">Jurnal Umum</span></a>
                                <a href="#buku-besar" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📚 <span class="nav-label">Buku Besar</span></a>
                                <a href="#neraca-lajur" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📋 <span class="nav-label">Neraca Lajur</span></a>
                                <a href="#laba-rugi" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">📈 <span class="nav-label">Laba Rugi</span></a>
                                <a href="#neraca" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">⚖️ <span class="nav-label">Neraca Posisi</span></a>
                                <a href="#pengaturan" class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap">⚙️ <span class="nav-label">Pengaturan</span></a>
                                <button onclick="window.doLogout()" class="w-full mt-4 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 border-t border-slate-100 whitespace-nowrap cursor-pointer">🚪 <span class="nav-label">Keluar (Logout)</span></button>
                            </nav>
                            <div class="p-3 border-t border-slate-200 flex items-center gap-3 bg-slate-50 mt-auto">
                                <img class="profile-avatar w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0 bg-slate-200" src="https://via.placeholder.com/150" alt="Avatar">
                                <div class="overflow-hidden flex-1 nav-label">
                                    <p class="profile-name font-bold text-xs text-slate-800 truncate">Memuat...</p>
                                    <span class="profile-role inline-block px-1.5 py-0.5 mt-0.5 text-[9px] font-bold bg-blue-100 text-primary uppercase tracking-wider">Role</span>
                                </div>
                            </div>
                        `;
                    }
                }
            } else {
                desktopSidebar.style.display = 'none';
            }
        }

        // 2. Render Header (Memuat dari folder components/mobile/)
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.style.display = 'flex';
            if (isMobile) {
                if (!headerContainer.dataset.loaded) {
                    const res = await fetch('./components/mobile/header-mobile.html');
                    if (res.ok) {
                        headerContainer.innerHTML = await res.text();
                        headerContainer.dataset.loaded = "true";
                    } else {
                        headerContainer.innerHTML = `
                            <div class="flex items-center justify-between w-full px-4 h-16 bg-white border-b border-slate-200">
                                <div class="flex items-center gap-3">
                                    <button onclick="toggleMobileDrawer()" class="text-slate-700 p-1 font-bold text-xl cursor-pointer">☰</button>
                                    <span id="page-title" class="font-bold text-slate-800 text-base">Dashboard</span>
                                </div>
                                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 font-medium">Online</span>
                            </div>
                        `;
                    }
                }
            } else {
                headerContainer.innerHTML = `
                    <div class="flex items-center gap-3"><span id="page-title" class="font-semibold text-slate-800 text-base md:text-lg">Dashboard</span></div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 font-medium">Online (Firebase)</span>
                    </div>
                `;
            }
        }

        // 3. Render Bottom Navigation Bar (Memuat dari folder components/mobile/)
        const mobileNav = document.getElementById('mobile-nav-container');
        if (mobileNav) {
            if (isMobile) {
                mobileNav.style.display = 'block';
                if (!mobileNav.dataset.loaded) {
                    const res = await fetch('./components/mobile/nav-bottom.html');
                    if (res.ok) {
                        mobileNav.innerHTML = await res.text();
                        mobileNav.dataset.loaded = "true";
                    } else {
                        mobileNav.innerHTML = `
                            <div class="grid grid-cols-5 h-16 bg-white border-t border-slate-200 text-center w-full shadow-lg">
                                <a href="#dashboard" class="flex flex-col items-center justify-center text-slate-600"><span>📊</span><span class="text-[10px]">Home</span></a>
                                <a href="#coa" class="flex flex-col items-center justify-center text-slate-600"><span>📑</span><span class="text-[10px]">COA</span></a>
                                <a href="#jurnal" class="flex flex-col items-center justify-center text-slate-600"><span>📝</span><span class="text-[10px]">Jurnal</span></a>
                                <a href="#laba-rugi" class="flex flex-col items-center justify-center text-slate-600"><span>📈</span><span class="text-[10px]">Laporan</span></a>
                                <a href="#pengaturan" class="flex flex-col items-center justify-center text-slate-600"><span>⚙️</span><span class="text-[10px]">Setel</span></a>
                            </div>
                        `;
                    }
                }
            } else {
                mobileNav.style.display = 'none';
            }
        }

        // 4. Drawer Menu Mobile (Memuat dari folder components/mobile/)
        if (isMobile && !document.getElementById('mobile-drawer')) {
            const res = await fetch('./components/mobile/drawer-menu.html');
            if (res.ok) {
                const html = await res.text();
                const drawerDiv = document.createElement('div');
                drawerDiv.innerHTML = html;
                document.body.appendChild(drawerDiv.firstElementChild);
            } else {
                const drawerDiv = document.createElement('div');
                drawerDiv.innerHTML = `
                    <div id="mobile-drawer" class="fixed inset-0 z-50 hidden">
                        <div class="absolute inset-0 bg-slate-900/50" onclick="toggleMobileDrawer()"></div>
                        <div class="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-10">
                            <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                <span class="font-bold text-base text-primary">MENU UTAMA</span>
                                <button onclick="toggleMobileDrawer()" class="text-slate-500 font-bold text-lg px-2 cursor-pointer">✕</button>
                            </div>
                            <nav class="p-3 space-y-1 flex-1 overflow-y-auto">
                                <a href="#dashboard" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📊 Dashboard Utama</a>
                                <a href="#coa" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📑 Master Akun (COA)</a>
                                <a href="#jurnal" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📝 Jurnal Transaksi</a>
                                <a href="#buku-besar" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📚 Buku Besar</a>
                                <a href="#neraca-lajur" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📋 Neraca Lajur</a>
                                <a href="#laba-rugi" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">📈 Laporan Laba Rugi</a>
                                <a href="#neraca" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">⚖️ Laporan Neraca</a>
                                <a href="#pengaturan" onclick="toggleMobileDrawer()" class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">⚙️ Pengaturan</a>
                                <button onclick="window.doLogout()" class="w-full mt-4 flex items-center gap-3 px-3 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 border-t border-slate-100 cursor-pointer">🚪 Keluar (Logout)</button>
                            </nav>
                            <div class="p-3 border-t border-slate-200 flex items-center gap-3 bg-slate-50 mt-auto">
                                <img class="profile-avatar w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 bg-slate-200" src="https://via.placeholder.com/150" alt="Avatar">
                                <div class="overflow-hidden flex-1">
                                    <p class="profile-name font-bold text-xs text-slate-800 truncate">Memuat...</p>
                                    <span class="profile-role inline-block px-1.5 py-0.5 mt-0.5 text-[9px] font-bold bg-blue-100 text-primary uppercase tracking-wider">Role</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(drawerDiv.firstElementChild);
            }
        }

        // Terapkan data profil (Foto, Nama, Role)
        await updateProfileUI(user);

    } catch (error) {
        console.error("Layout error:", error);
    }
}

window.toggleSidebar = function() {
    const sidebar = document.getElementById('desktop-sidebar-container');
    if (!sidebar) return;
    const isMinimized = sidebar.classList.contains('md:w-16');
    if (isMinimized) {
        sidebar.classList.remove('md:w-16');
        sidebar.classList.add('md:w-64');
        document.querySelectorAll('.nav-label').forEach(el => el.style.display = 'inline');
        const brand = document.getElementById('sidebar-brand-text');
        if (brand) brand.style.display = 'inline';
    } else {
        sidebar.classList.remove('md:w-64');
        sidebar.classList.add('md:w-16');
        document.querySelectorAll('.nav-label').forEach(el => el.style.display = 'none');
        const brand = document.getElementById('sidebar-brand-text');
        if (brand) brand.style.display = 'none';
    }
}

window.toggleMobileDrawer = function() {
    const drawer = document.getElementById('mobile-drawer');
    if (drawer) drawer.classList.toggle('hidden');
}

window.doLogout = async function() {
    await signOut(auth);
    window.location.hash = '#login';
}

async function renderRoute(route) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = route.title;

    const viewContainer = document.getElementById('app-view');
    if (!viewContainer) return;
    
    viewContainer.innerHTML = `
        <div class="flex items-center justify-center h-64">
            <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p class="mt-2 text-sm text-slate-500">Memuat halaman ${route.title}...</p>
            </div>
        </div>
    `;

    try {
        const response = await fetch(route.file);
        if (!response.ok) throw new Error(`Gagal memuat halaman (${response.status})`);
        
        const html = await response.text();
        viewContainer.innerHTML = html;

        const scripts = viewContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.type = script.type || 'text/javascript';
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
            document.body.removeChild(newScript);
        });

        const hash = window.location.hash || '#dashboard';
        document.querySelectorAll('aside a, nav a').forEach(el => {
            const href = el.getAttribute('href');
            if (href === hash || (hash === '#dashboard' && (href === '' || href === '#dashboard'))) {
                el.classList.add('bg-slate-100', 'text-primary');
            } else {
                el.classList.remove('bg-slate-100', 'text-primary');
            }
        });
    } catch (error) {
        console.error("Router Error:", error);
        viewContainer.innerHTML = `<div class="p-6 text-center text-red-600">Gagal memuat halaman ${route.file}</div>`;
    }
}

function handleRoute() {
    let hash = window.location.hash || '#dashboard';
    if (hash === '#') hash = '#dashboard';

    const route = routes[hash] || { title: '404 - Tidak Ditemukan', file: './views/404.html', authRequired: true };

    const desktopSidebar = document.getElementById('desktop-sidebar-container');
    const mobileNav = document.getElementById('mobile-nav-container');
    const headerContainer = document.getElementById('header-container');

    if (!route.authRequired) {
        if (desktopSidebar) desktopSidebar.style.display = 'none';
        if (mobileNav) mobileNav.style.display = 'none';
        if (headerContainer) headerContainer.style.display = 'none';
        renderRoute(route);
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        await loadLayoutComponents(user);
        renderRoute(route);
    });
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('resize', () => {
    if (window.location.hash !== '#login') {
        const user = auth.currentUser;
        if (user) loadLayoutComponents(user);
    }
});