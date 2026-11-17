export function renderData() {
    return `
        <div class="space-y-6">
            <div>
                <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">Manajemen Data</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pusat pengelolaan data kontak dan aset unit usaha.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Card ke Menu Kontak -->
                <a href="#/data-kontak" data-link class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-500 transition group block rounded-none">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg rounded-none group-hover:bg-indigo-600 group-hover:text-white transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 transition">Data Kontak</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola data relasi, pelanggan, supplier, dan mitra.</p>
                        </div>
                    </div>
                </a>

                <!-- Card ke Menu Aset -->
                <a href="#/data-aset" data-link class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-500 transition group block rounded-none">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg rounded-none group-hover:bg-indigo-600 group-hover:text-white transition">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 transition">Data Aset</h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola inventaris, sarana, prasarana, dan aset perusahaan.</p>
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