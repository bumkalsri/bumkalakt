// File: assets/js/views/laporan.js

export function renderLaporan() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Modul Laporan Keuangan</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih menu laporan di bawah ini untuk melihat rekapitulasi data akuntansi.</p>
            </div>

            <!-- Grid Menu Laporan (Responsif HP & Desktop) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                
                <!-- 1. Jurnal -->
                <div data-url="#/laporan-jurnal" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Jurnal</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan daftar transaksi jurnal</p>
                    </div>
                </div>

                <!-- 2. Buku Besar -->
                <div data-url="#/laporan-buku-besar" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Buku Besar</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan rekapitulasi buku besar</p>
                    </div>
                </div>

                <!-- 3. Neraca Saldo -->
                <div data-url="#/laporan-neraca-saldo" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Neraca Saldo</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan saldo perkiraan akun</p>
                    </div>
                </div>

                <!-- 4. Arus Kas -->
                <div data-url="#/laporan-arus-kas" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Arus Kas</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan arus kas operasional</p>
                    </div>
                </div>

                <!-- 5. Perubahan Modal -->
                <div data-url="#/laporan-perubahan-modal" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Perubahan Modal</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan perubahan ekuitas/modal</p>
                    </div>
                </div>

                <!-- 6. Laba/Rugi -->
                <div data-url="#/laporan-laba-rugi" class="laporan-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Laba/Rugi</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan laba rugi perusahaan</p>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function initLaporanHandler() {
    console.log("Halaman laporan dimuat.");

    const cards = document.querySelectorAll('.laporan-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            if (url) {
                location.hash = url;
            }
        });
    });
}