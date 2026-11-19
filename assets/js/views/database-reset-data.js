// File: assets/js/views/database-reset-data.js

export function renderResetData() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/database" data-link title="Kembali ke Database" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Reset Data Sistem</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pembersihan dan pengaturan ulang basis data aplikasi.</p>
                    </div>
                </div>
            </div>

            <!-- Panel Reset Data -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <p class="text-xs text-red-600 dark:text-red-400 font-medium">Peringatan: Tindakan ini akan menghapus data operasional sesuai kategori yang dipilih secara permanen.</p>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">PILIH KATEGORI DATA YANG DIRESET</label>
                    <select id="reset-kategori" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="transaksi">Data Transaksi & Jurnal</option>
                        <option value="produk">Data Produk & Inventaris</option>
                        <option value="galeri">Data Galeri & Event</option>
                    </select>
                </div>
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button type="button" id="btn-eksekusi-reset" class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">
                        Eksekusi Reset Data
                    </button>
                </div>
            </div>
        </div>
    `;
}

let databaseResetCleanup = null;

export function initResetDataHandler() {
    if (typeof databaseResetCleanup === 'function') {
        databaseResetCleanup();
        databaseResetCleanup = null;
    }

    const btn = document.getElementById('btn-eksekusi-reset');
    const selectKategori = document.getElementById('reset-kategori');

    const onClick = () => {
        const kategori = selectKategori ? selectKategori.value : 'data';
        if (confirm(`Apakah Anda yakin ingin mereset data kategori "${kategori}"?`)) {
            alert("Data berhasil direset.");
        }
    };

    if (btn) {
        btn.addEventListener('click', onClick);
    }

    const cleanup = () => {
        if (btn) btn.removeEventListener('click', onClick);
        window.removeEventListener('hashchange', cleanup);
        databaseResetCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    databaseResetCleanup = cleanup;

    return cleanup;
}

export const renderDatabaseResetData = renderResetData;
export const initDatabaseResetDataHandler = initResetDataHandler;