import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderAnalytics() {
    return `
        <div class="space-y-6 max-w-6xl mx-auto pb-12">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span class="inline-block bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-none tracking-wide uppercase mb-1">ADMINISTRATOR</span>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Analytics & Statistik Aplikasi</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pemantauan data sistem, aktivitas pengguna, dan integrasi Google Analytics (GA4).</p>
                </div>
                <a href="https://analytics.google.com/" target="_blank" class="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-white text-xs font-semibold transition flex items-center gap-2 rounded-none cursor-pointer border border-indigo-800 dark:border-indigo-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Buka Google Analytics Console
                </a>
            </div>

            <!-- Kartu Statistik Utama -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Status GA4 Tag</div>
                    <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2">
                        <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Terhubung (G-Q7BVR3XNJS)
                    </div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pelacakan rute halaman aktif.</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Titik Branding</div>
                    <div id="stat-branding" class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Memuat...</div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Aset promosi terdaftar di database.</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Staf / Pengguna</div>
                    <div id="stat-staf" class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Memuat...</div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Akun aktif dalam sistem.</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div class="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Keamanan & Sesi</div>
                    <div class="text-xl font-bold text-indigo-900 dark:text-indigo-300 mt-2">Protected</div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Autentikasi Firebase aktif.</p>
                </div>
            </div>

            <!-- Panel Informasi Akses Google Analytics -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Panduan Laporan Trafik Pengunjung
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tag Google Analytics (<code>G-Q7BVR3XNJS</code>) yang terpasang pada aplikasi Anda secara otomatis merekam setiap perpindahan halaman dan interaksi pengguna secara *real-time*.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-200">1. Lihat Trafik Real-Time</div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Pantau siapa saja yang sedang membuka aplikasi saat ini melalui menu <strong>Realtime Analytics</strong> di Google Analytics atau Firebase Console Anda.</p>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-200">2. Analisis Halaman & Perangkat</div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Laporan mendalam mengenai halaman apa saja yang sering dikunjungi (Beranda, Toko, Branding) dapat diakses langsung melalui dasbor web Google Analytics.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function initAnalyticsHandler() {
    // Mengambil data ringkasan dari Firestore untuk melengkapi statistik dashboard
    try {
        const brandingSnap = await getDocs(collection(db, "branding"));
        const statBranding = document.getElementById('stat-branding');
        if (statBranding) statBranding.textContent = `${brandingSnap.size} Aset`;

        const stafSnap = await getDocs(collection(db, "users"));
        const statStaf = document.getElementById('stat-staf');
        if (statStaf) statStaf.textContent = `${stafSnap.size} Akun`;
    } catch (err) {
        console.error("Gagal memuat ringkasan statistik:", err);
    }
}