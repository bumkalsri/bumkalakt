// File: assets/js/views/keuangan.js

export function renderKeuangan() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Modul Keuangan</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih menu di bawah ini untuk mengelola transaksi kas masuk, kas keluar, serta laporan keuangan harian.</p>
            </div>

            <!-- Grid Menu Keuangan (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

                <!-- 1. Penerimaan Kas -->
                <div data-url="#/keuangan-kas-masuk" class="keuangan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Penerimaan Kas</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola transaksi kas masuk</p>
                    </div>
                </div>

                <!-- 2. Pengeluaran Kas -->
                <div data-url="#/keuangan-kas-keluar" class="keuangan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Pengeluaran Kas</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola transaksi kas keluar</p>
                    </div>
                </div>

                <!-- 3. Laporan Kas Masuk & Kas Keluar -->
                <div data-url="#/keuangan-laporan-kas" class="keuangan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Laporan Kas Masuk/Keluar</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi & cetak mutasi kas</p>
                    </div>
                </div>

            </div>
        </div>
    `;
}

let keuanganCleanup = null;

export function initKeuanganHandler() {
    if (typeof keuanganCleanup === 'function') {
        keuanganCleanup();
        keuanganCleanup = null;
    }

    const cards = document.querySelectorAll('.keuangan-card');
    const handlers = [];

    cards.forEach(card => {
        const onClick = () => {
            const url = card.getAttribute('data-url');
            if (url) {
                location.hash = url;
            }
        };
        card.addEventListener('click', onClick);
        handlers.push({ card, onClick });
    });

    const cleanup = () => {
        handlers.forEach(({ card, onClick }) => {
            card.removeEventListener('click', onClick);
        });
        window.removeEventListener('hashchange', cleanup);
        keuanganCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    keuanganCleanup = cleanup;

    return cleanup;
}