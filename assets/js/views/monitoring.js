// File: assets/js/views/monitoring.js

export function renderMonitoring() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Monitoring & Pengawasan Sistem BUMKal</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih menu pemantauan dan pelaporan untuk keperluan pengawasan Badan Pengawas, Penasehat, dan manajemen.</p>
                </div>
            </div>

            <!-- Grid Menu Pilihan (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Menu Pilihan Monitoring & Laporan</h2>
                    <span class="text-[11px] text-slate-400">Klik menu untuk membuka</span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <!-- 1. Laporan PAGU Anggaran -->
                    <a href="#/monitoring-laporan-pagu" data-link class="group bg-white dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 p-4 rounded-none transition flex flex-col justify-between gap-3 shadow-sm">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center rounded-none border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-none border border-indigo-100 dark:border-indigo-900">ANGGARAN</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Laporan PAGU Anggaran</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Pantau realisasi dan sisa pagu anggaran per unit usaha.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Buka Laporan</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 2. Laporan Keuangan -->
                    <a href="#/monitoring-keuangan" data-link class="group bg-white dark:bg-slate-950 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 p-4 rounded-none transition flex flex-col justify-between gap-3 shadow-sm">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center rounded-none border border-emerald-100 dark:border-emerald-800 flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-none border border-emerald-100 dark:border-emerald-900">KEUANGAN</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Laporan Keuangan</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Rekapitulasi kas masuk, kas keluar, dan mutasi saldo kas.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Buka Laporan</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 3. CALK -->
                    <a href="#/monitoring-calk" data-link class="group bg-white dark:bg-slate-950 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 hover:border-amber-500 p-4 rounded-none transition flex flex-col justify-between gap-3 shadow-sm">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center rounded-none border border-amber-100 dark:border-amber-800 flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 rounded-none border border-amber-100 dark:border-amber-900">CALK</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">CALK</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Catatan atas laporan keuangan, rincian pos, dan kebijakan akuntansi.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span>Buka CALK</span>
                            <span>&rarr;</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    `;
}

let monitoringCleanup = null;

export function initMonitoringHandler() {
    if (typeof monitoringCleanup === "function") {
        monitoringCleanup();
        monitoringCleanup = null;
    }

    const cleanup = () => {
        window.removeEventListener("hashchange", cleanup);
        monitoringCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    monitoringCleanup = cleanup;

    return cleanup;
}