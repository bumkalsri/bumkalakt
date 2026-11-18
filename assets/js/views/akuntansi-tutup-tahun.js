// File: assets/js/views/akuntansi-tutup-tahun.js
export function renderAkuntansiTutupTahun() {
    return `
        <div class="space-y-6 max-w-4xl mx-auto pb-10">
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Proses Tutup Tahun</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lakukan proses penutupan buku tahunan dan transfer saldo laba/rugi.</p>
                </div>
                <a href="#/akuntansi" class="text-xs text-indigo-600 hover:underline font-semibold">&larr; Kembali</a>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Buku</label>
                    <select id="tutup-tahun-buku" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option>
                    </select>
                </div>
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button id="btn-proses-tutup-tahun" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-none transition cursor-pointer">
                        Proses Tutup Tahun
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function initAkuntansiTutupTahunHandler() {
    const btn = document.getElementById('btn-proses-tutup-tahun');
    if (btn) {
        btn.onclick = () => {
            alert("Fitur Tutup Tahun berhasil diproses.");
        };
    }
}