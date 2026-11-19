// File: assets/js/views/data.js

export function renderData() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Data</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pusat pengelolaan data kontak, aset, dan pagu anggaran unit usaha BUMKal.</p>
                </div>
            </div>

            <!-- Grid Menu Data (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <!-- Card ke Menu Kontak -->
                <a href="#/data-kontak" data-link class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm hover:border-indigo-500 transition group block rounded-none">
                    <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg rounded-none group-hover:bg-indigo-600 group-hover:text-white transition flex-shrink-0">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                        <div class="w-full overflow-hidden">
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm group-hover:text-indigo-600 transition truncate">Data Kontak</h3>
                            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">Kelola relasi, pelanggan, supplier.</p>
                        </div>
                    </div>
                </a>

                <!-- Card ke Menu Aset -->
                <a href="#/data-aset" data-link class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm hover:border-indigo-500 transition group block rounded-none">
                    <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg rounded-none group-hover:bg-indigo-600 group-hover:text-white transition flex-shrink-0">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        </div>
                        <div class="w-full overflow-hidden">
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm group-hover:text-indigo-600 transition truncate">Data Aset</h3>
                            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">Kelola inventaris & aset perusahaan.</p>
                        </div>
                    </div>
                </a>

                <!-- Card ke Menu Pagu Anggaran -->
                <a href="#/data-pagu-anggaran" data-link class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm hover:border-indigo-500 transition group block rounded-none">
                    <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg rounded-none group-hover:bg-indigo-600 group-hover:text-white transition flex-shrink-0">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        </div>
                        <div class="w-full overflow-hidden">
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm group-hover:text-indigo-600 transition truncate">Pagu Anggaran</h3>
                            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">Kelola alokasi pagu anggaran unit.</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;
}

export function initDataHandler() {
    // Handler jika diperlukan interaksi di halaman utama Data
}