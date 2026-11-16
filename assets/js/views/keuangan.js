export function renderKeuangan() {
    return `
        <div class="space-y-6 pb-10">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <div class="w-12 h-12 rounded-none bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Modul Keuangan</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Halaman ini sedang dalam tahap pengembangan (*Under Development*).</p>
                </div>
                <div class="pt-2">
                    <span class="inline-block bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[11px] font-semibold px-3 py-1 rounded-none">
                        Segera Hadir
                    </span>
                </div>
            </div>
        </div>
    `;
}

export function initKeuanganHandler() {
    console.log("Halaman keuangan dimuat.");
}