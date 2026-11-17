// File: assets/js/views/manajemen-produk.js
export function renderManajemenProduk() {
    return `
        <div class="space-y-6 pb-10 max-w-4xl mx-auto animate-fade-in">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <div class="w-12 h-12 rounded-none bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                    <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Produk</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Modul manajemen data produk sedang dalam tahap pengembangan.</p>
                </div>
                <span class="inline-block bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-3 py-1 rounded-none">
                    Segera Hadir
                </span>
            </div>
        </div>
    `;
}

export function initManajemenProdukHandler() {
    console.log("Halaman Manajemen Produk dimuat.");
}