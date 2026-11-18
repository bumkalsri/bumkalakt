// File: assets/js/views/akuntansi.js

export function renderAkuntansi() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Modul Akuntansi</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih menu di bawah ini untuk mengelola data akuntansi dan pencatatan keuangan.</p>
            </div>

            <!-- Grid Menu Akuntansi (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <!-- 1. COA -->
                <div data-url="#/akuntansi-coa" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">COA (Chart of Accounts)</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola daftar akun perkiraan</p>
                    </div>
                </div>

                <!-- 2. Saldo Awal -->
                <div data-url="#/akuntansi-saldo-awal" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Saldo Awal</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Input saldo awal perkiraan</p>
                    </div>
                </div>

                <!-- 3. Entri Jurnal -->
                <div data-url="#/akuntansi-entri-jurnal" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Entri Jurnal</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan transaksi jurnal umum</p>
                    </div>
                </div>

                <!-- 4. Modal -->
                <div data-url="#/akuntansi-modal" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Modal</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pengelolaan ekuitas dan modal</p>
                    </div>
                </div>

                <!-- 5. Piutang -->
                <div data-url="#/akuntansi-piutang" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Piutang</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola data tagihan piutang</p>
                    </div>
                </div>

                <!-- 6. Hutang -->
                <div data-url="#/akuntansi-hutang" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Hutang</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola data kewajiban hutang</p>
                    </div>
                </div>

                <!-- 7. Tutup Bulan -->
                <div data-url="#/akuntansi-tutup-bulan" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Tutup Bulan</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Proses penutupan siklus bulanan</p>
                    </div>
                </div>

                <!-- 8. Tutup Tahun -->
                <div data-url="#/akuntansi-tutup-tahun" class="akuntansi-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Tutup Tahun</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Proses penutupan siklus tahunan</p>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function initAkuntansiHandler() {
    console.log("Halaman akuntansi dimuat.");

    const cards = document.querySelectorAll('.akuntansi-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            if (url) {
                location.hash = url;
            }
        });
    });
}