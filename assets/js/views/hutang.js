// File: assets/js/views/hutang.js
export function renderHutang() {
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Hutang</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Modul pengelolaan data kewajiban hutang sedang dalam tahap pengembangan.</p>
                </div>
                <span class="inline-block bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-3 py-1 rounded-none">
                    Segera Hadir
                </span>
            </div>
        </div>
    `;
}

export function initHutangHandler() {
    console.log("Halaman Hutang dimuat.");
}