// File: assets/js/views/keuangan.js

export function renderKeuangan() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Modul Keuangan</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih menu di bawah ini untuk mengelola transaksi kas masuk dan kas keluar.</p>
            </div>

            <!-- Grid Menu Keuangan (Responsif HP & Desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                
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

            </div>
        </div>
    `;
}

export function initKeuanganHandler() {
    console.log("Halaman keuangan dimuat.");

    const cards = document.querySelectorAll('.keuangan-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            if (url) {
                location.hash = url;
            }
        });
    });
}