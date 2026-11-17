// File: assets/js/views/entri-jurnal.js
export function renderEntriJurnal() {
    return `
        <div class="space-y-6 pb-10 max-w-4xl mx-auto animate-fade-in">
            <div class="flex items-center justify-between">
                <a href="#/akuntansi" class="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm hover:bg-slate-50 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Kembali ke Akuntansi
                </a>
            </div>
            <div class="bg-white dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <div class="w-12 h-12 rounded-none bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                    <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Entri Jurnal</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Modul pencatatan transaksi jurnal umum sedang dalam tahap pengembangan.</p>
                </div>
                <span class="inline-block bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-3 py-1 rounded-none">
                    Segera Hadir
                </span>
            </div>
        </div>
    `;
}

export function initEntriJurnalHandler() {
    console.log("Halaman Entri Jurnal dimuat.");
}