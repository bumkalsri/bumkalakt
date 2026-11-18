// File: assets/js/router.js
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { renderHome, initHomeHandler } from './views/home.js';
import { renderLogin, initLoginHandler } from './views/login.js';
import { renderManajemen, initManajemenHandler } from './views/manajemen.js';
import { renderTamu, initTamuHandler } from './views/tamu.js';
import { renderStaf, initStafHandler } from './views/staf.js';
import { renderData, initDataHandler } from './views/data.js';
import { renderKontak, initKontakHandler } from './views/kontak.js';
import { renderAset, initAsetHandler } from './views/aset.js';
import { renderKeuangan, initKeuanganHandler } from './views/keuangan.js';
import { renderAkuntansi, initAkuntansiHandler } from './views/akuntansi.js';
import { renderLaporan, initLaporanHandler } from './views/laporan.js';
import { renderGaleri, initGaleriHandler } from './views/galeri.js';
import { renderEvent, initEventHandler } from './views/event.js';
import { renderMonitoring, initMonitoringHandler } from './views/monitoring.js';
import { renderAnalytics, initAnalyticsHandler } from './views/analytics.js';

// Impor sub-halaman Manajemen
import { renderManajemenPengaturan, initManajemenPengaturanHandler } from './views/manajemen-pengaturan.js';
import { renderManajemenBanner, initManajemenBannerHandler } from './views/manajemen-banner.js';
import { renderManajemenText, initManajemenTextHandler } from './views/manajemen-text.js';
import { renderManajemenGaleri, initManajemenGaleriHandler } from './views/manajemen-galeri.js';
import { renderManajemenEvent, initManajemenEventHandler } from './views/manajemen-event.js';
import { renderManajemenMonitoring, initManajemenMonitoringHandler } from './views/manajemen-monitoring.js';
import { renderManajemenProduk, initManajemenProdukHandler } from './views/manajemen-produk.js';
import { renderManajemenResetData, initManajemenResetDataHandler } from './views/manajemen-reset-data.js';

// Impor sub-halaman Akuntansi
import { renderCoa, initCoaHandler } from './views/coa.js';
import { renderSaldoAwal, initSaldoAwalHandler } from './views/saldo-awal.js';
import { renderAkuntansiEntriJurnal, initAkuntansiEntriJurnalHandler } from './views/akuntansi-entri-jurnal.js';
import { renderModal, initModalHandler } from './views/akuntansi-modal.js';
import { renderPiutang, initPiutangHandler } from './views/piutang.js';
import { renderHutang, initHutangHandler } from './views/hutang.js';
import { renderAkuntansiTutupBulan, initAkuntansiTutupBulanHandler } from './views/akuntansi-tutup-bulan.js';
import { renderAkuntansiTutupTahun, initAkuntansiTutupTahunHandler } from './views/akuntansi-tutup-tahun.js';

// Impor sub-halaman Keuangan
import { renderKasMasuk, initKasMasukHandler } from './views/keuangan-kas-masuk.js';
import { renderKasKeluar, initKasKeluarHandler } from './views/keuangan-kas-keluar.js';
import { renderKeuanganLaporanKas, initKeuanganLaporanKasHandler } from './views/keuangan-laporan-kas.js';

// Impor sub-halaman Data & Laporan
import { renderDataPaguAnggaran, initDataPaguAnggaranHandler } from './views/data-pagu-anggaran.js';
import { renderLaporanPagu, initLaporanPaguHandler } from './views/laporan-pagu.js';
import { renderLaporanJurnal, initLaporanJurnalHandler } from './views/laporan-jurnal.js';
import { renderBukuBesar, initBukuBesarHandler } from './views/buku-besar.js';
import { renderLaporanNeracaSaldo, initLaporanNeracaSaldoHandler } from './views/laporan-neraca-saldo.js';
import { renderLaporanArusKas, initLaporanArusKasHandler } from './views/laporan-arus-kas.js';
import { renderLaporanPerubahanModal, initLaporanPerubahanModalHandler } from './views/laporan-perubahan-modal.js';
import { renderLaporanLabaRugi, initLaporanLabaRugiHandler } from './views/laporan-laba-rugi.js';

const routes = {
    '/': renderHome,
    '/galeri': renderGaleri,
    '/event': renderEvent,
    '/monitoring': renderMonitoring,
    '/analytics': renderAnalytics,
    '/tamu': renderTamu,
    '/staf': renderStaf,
    '/data': renderData,
    '/data-kontak': renderKontak,
    '/data-aset': renderAset,
    '/data-pagu-anggaran': renderDataPaguAnggaran,
    '/keuangan': renderKeuangan,
    '/akuntansi': renderAkuntansi,
    '/laporan': renderLaporan,
    '/manajemen': renderManajemen,
    '/manajemen-pengaturan': renderManajemenPengaturan,
    '/manajemen-banner': renderManajemenBanner,
    '/manajemen-text': renderManajemenText,
    '/manajemen-galeri': renderManajemenGaleri,
    '/manajemen-event': renderManajemenEvent,
    '/manajemen-monitoring': renderManajemenMonitoring,
    '/manajemen-produk': renderManajemenProduk,
    '/manajemen-reset-data': renderManajemenResetData,
    '/akuntansi-coa': renderCoa,
    '/akuntansi-saldo-awal': renderSaldoAwal,
    '/akuntansi-entri-jurnal': renderAkuntansiEntriJurnal,
    '/akuntansi-modal': renderModal,
    '/akuntansi-piutang': renderPiutang,
    '/akuntansi-hutang': renderHutang,
    '/akuntansi-tutup-bulan': renderAkuntansiTutupBulan,
    '/akuntansi-tutup-tahun': renderAkuntansiTutupTahun,
    '/keuangan-kas-masuk': renderKasMasuk,
    '/keuangan-kas-keluar': renderKasKeluar,
    '/keuangan-laporan-kas': renderKeuanganLaporanKas,
    '/laporan-pagu': renderLaporanPagu,
    '/laporan-jurnal': renderLaporanJurnal,
    '/laporan-buku-besar': renderBukuBesar,
    '/laporan-neraca-saldo': renderLaporanNeracaSaldo,
    '/laporan-arus-kas': renderLaporanArusKas,
    '/laporan-perubahan-modal': renderLaporanPerubahanModal,
    '/laporan-laba-rugi': renderLaporanLabaRugi,
    '/login': renderLogin
};

// Fungsi Logout Global
window.handleLogout = () => {
    signOut(auth).then(() => {
        localStorage.clear();
        location.hash = '#/login';
    }).catch(error => {
        console.error("Gagal keluar:", error);
    });
};

export function router() {
    let path = location.hash.slice(1).toLowerCase() || '/';
    
    if (path === '/manajemen.js') {
        path = '/manajemen';
        location.hash = '#/manajemen';
        return;
    }

    const appContainer = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    const headerEl = document.querySelector('header');
    const bottomNav = document.getElementById('bottom-nav');

    const isLoggedIn = localStorage.getItem('user_email');
    if (!isLoggedIn && path !== '/login') {
        if (location.hash !== '#/login') {
            location.hash = '#/login';
        }
        return;
    }

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

    // --- RENDER VIEW KE CONTAINER UTAMA & INISIALISASI HANDLER ---
    if (appContainer) {
        const renderFunction = routes[path] || renderHome;
        appContainer.innerHTML = renderFunction();

        if (path === '/') initHomeHandler();
        else if (path === '/login') initLoginHandler();
        else if (path === '/tamu') initTamuHandler();
        else if (path === '/staf') initStafHandler();
        else if (path === '/data') initDataHandler();
        else if (path === '/data-kontak') initKontakHandler();
        else if (path === '/data-aset') initAsetHandler();
        else if (path === '/data-pagu-anggaran') initDataPaguAnggaranHandler();
        else if (path === '/keuangan') initKeuanganHandler();
        else if (path === '/akuntansi') initAkuntansiHandler();
        else if (path === '/laporan') initLaporanHandler();
        else if (path === '/event') initEventHandler();
        else if (path === '/galeri') initGaleriHandler();
        else if (path === '/analytics') initAnalyticsHandler();
        else if (path === '/manajemen') initManajemenHandler();
        else if (path === '/manajemen-pengaturan') initManajemenPengaturanHandler();
        else if (path === '/manajemen-banner') initManajemenBannerHandler();
        else if (path === '/manajemen-text') initManajemenTextHandler();
        else if (path === '/manajemen-galeri') initManajemenGaleriHandler();
        else if (path === '/manajemen-event') initManajemenEventHandler();
        else if (path === '/manajemen-monitoring') initManajemenMonitoringHandler();
        else if (path === '/manajemen-produk') initManajemenProdukHandler();
        else if (path === '/manajemen-reset-data') initManajemenResetDataHandler();
        else if (path === '/akuntansi-coa') initCoaHandler();
        else if (path === '/akuntansi-saldo-awal') initSaldoAwalHandler();
        else if (path === '/akuntansi-entri-jurnal') initAkuntansiEntriJurnalHandler();
        else if (path === '/akuntansi-modal') initModalHandler();
        else if (path === '/akuntansi-piutang') initPiutangHandler();
        else if (path === '/akuntansi-hutang') initHutangHandler();
        else if (path === '/akuntansi-tutup-bulan') initAkuntansiTutupBulanHandler();
        else if (path === '/akuntansi-tutup-tahun') initAkuntansiTutupTahunHandler();
        else if (path === '/keuangan-kas-masuk') initKasMasukHandler();
        else if (path === '/keuangan-kas-keluar') initKasKeluarHandler();
        else if (path === '/keuangan-laporan-kas') initKeuanganLaporanKasHandler();
        else if (path === '/laporan-pagu') initLaporanPaguHandler();
        else if (path === '/laporan-jurnal') initLaporanJurnalHandler();
        else if (path === '/laporan-buku-besar') initBukuBesarHandler();
        else if (path === '/laporan-neraca-saldo') initLaporanNeracaSaldoHandler();
        else if (path === '/laporan-arus-kas') initLaporanArusKasHandler();
        else if (path === '/laporan-perubahan-modal') initLaporanPerubahanModalHandler();
        else if (path === '/laporan-laba-rugi') initLaporanLabaRugiHandler();
        else if (path === '/monitoring') initMonitoringHandler();
    }

    // --- UPDATE INDIKATOR WARNA KELAS AKTIF PADA SIDEBAR ---
    const sidebarLinks = document.querySelectorAll('#sidebar-nav a');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (
            href === '#' + path || 
            (path.startsWith('/manajemen') && href === '#/manajemen') || 
            (path.startsWith('/akuntansi') && href === '#/akuntansi') ||
            (path.startsWith('/keuangan') && href === '#/keuangan') ||
            (path.startsWith('/laporan') && href === '#/laporan') ||
            (path.startsWith('/data') && href === '#/data')
        ) {
            link.className = "flex items-center gap-3 px-3 py-2.5 rounded-none text-indigo-700 bg-indigo-50 transition";
        } else {
            link.className = "flex items-center gap-3 px-3 py-2.5 rounded-none text-slate-600 hover:bg-slate-50 transition";
        }
    });
}

let isAuthListenerInitialized = false;

export function initRouter() {
    if (!isAuthListenerInitialized) {
        isAuthListenerInitialized = true;
        onAuthStateChanged(auth, async (user) => {
            let path = location.hash.slice(1).toLowerCase() || '/';
            if (!user && path !== '/login') {
                if (location.hash !== '#/login') location.hash = '#/login';
                return;
            }

            if (user && path === '/login') {
                if (location.hash !== '#/') location.hash = '#/';
                return;
            }

            let userRole = "User";

            if (user) {
                const email = user.email;
                let photoURL = user.photoURL || localStorage.getItem('user_avatar') || "";

                let displayName = user.displayName || email.split('@')[0];
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        if (userData.nama) displayName = userData.nama;
                        if (userData.role) userRole = userData.role;
                        if (userData.photoURL) photoURL = userData.photoURL;
                    } else {
                        await setDoc(userDocRef, {
                            uid: user.uid,
                            email: email,
                            nama: displayName,
                            photoURL: photoURL,
                            role: "Staf",
                            createdAt: new Date().toISOString()
                        });
                        userRole = "Staf";
                    }
                } catch (err) {
                    console.error("Gagal memuat data pengguna di Firestore:", err);
                }

                localStorage.setItem('user_name', displayName);
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_role', userRole);
                if (photoURL) {
                    localStorage.setItem('user_avatar', photoURL);
                }

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

                const userInitialEl = document.getElementById('user-initial');
                if (userInitialEl) {
                    const nameParts = displayName.split(' ');
                    const initials = nameParts.length > 1 
                        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
                        : displayName.substring(0, 2).toUpperCase();

                    if (photoURL && photoURL.trim() !== "") {
                        userInitialEl.innerHTML = `<img src="${photoURL}" alt="Profile" class="w-full h-full object-cover rounded-none" onerror="this.onerror=null; this.parentNode.innerHTML='${initials}';">`;
                    } else {
                        userInitialEl.textContent = initials;
                    }
                }

                const mobileAvatarImg = document.getElementById('mobile-user-avatar-img');
                if (mobileAvatarImg) {
                    if (photoURL && photoURL.trim() !== "") {
                        mobileAvatarImg.src = photoURL;
                        mobileAvatarImg.style.display = 'block';
                    } else {
                        mobileAvatarImg.style.display = 'none';
                    }
                }
            }
        });
    }

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
    });
}