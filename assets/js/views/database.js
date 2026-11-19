// File: assets/js/views/database.js
export function renderDatabase() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Database & Utilitas Penyimpanan</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola pemantauan ukuran penyimpanan (1 GB) serta pembersihan/reset data koleksi database aplikasi.</p>
                </div>
                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-white text-xs font-semibold transition flex items-center gap-2 rounded-none cursor-pointer border border-indigo-800 dark:border-indigo-900 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Buka Google Analytics Console
                </a>
            </div>

            <!-- Grid Menu Pilihan Database (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Menu Pilihan Database</h2>
                    <span class="text-[11px] text-slate-400">Klik menu untuk membuka</span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <!-- 1. Control Size -->
                    <a href="#/database-control-size" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8-1.79 8-4"/>
                                </svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">Kapasitas</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Control Size</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Pantau pemakaian penyimpanan dari batas 1 GB dan rincian ukuran tiap koleksi.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Control Size</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 2. Reset Data -->
                    <a href="#/database-reset-data" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center border border-rose-200 dark:border-rose-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900">Reset</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">Reset Data</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Bersihkan atau reset data pada koleksi database tertentu dengan konfirmasi aman.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Reset Data</span>
                            <span>&rarr;</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    `;
}

export function initDatabaseHandler() {
    console.log("Halaman Database dimuat.");
}