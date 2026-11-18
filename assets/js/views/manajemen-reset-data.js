// File: assets/js/views/manajemen-reset-data.js
export function renderManajemenResetData() {
    return `
        <div class="space-y-6 max-w-4xl mx-auto pb-10">
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Reset Data Sistem</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pembersihan dan pengaturan ulang basis data aplikasi.</p>
                </div>
                <a href="#/manajemen" class="text-xs text-indigo-600 hover:underline font-semibold">&larr; Kembali</a>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <p class="text-xs text-red-600 dark:text-red-400 font-medium">Peringatan: Tindakan ini akan menghapus data operasional sesuai kategori yang dipilih secara permanen.</p>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Kategori Data yang Direset</label>
                    <select id="reset-kategori" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="transaksi">Data Transaksi & Jurnal</option>
                        <option value="produk">Data Produk & Inventaris</option>
                        <option value="galeri">Data Galeri & Event</option>
                    </select>
                </div>
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button id="btn-eksekusi-reset" class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-none transition cursor-pointer">
                        Eksekusi Reset Data
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function initManajemenResetDataHandler() {
    const btn = document.getElementById('btn-eksekusi-reset');
    if (btn) {
        btn.onclick = () => {
            if (confirm("Apakah Anda yakin ingin mereset data ini?")) {
                alert("Data berhasil direset.");
            }
        };
    }
}