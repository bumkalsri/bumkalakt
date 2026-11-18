// File: assets/js/views/data-pagu-anggaran.js
export function renderDataPaguAnggaran() {
    return `
        <div class="space-y-6 max-w-6xl mx-auto pb-10">
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Pagu Anggaran</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola alokasi dan batas pagu anggaran unit usaha.</p>
                </div>
                <a href="#/data" class="text-xs text-indigo-600 hover:underline font-semibold">&larr; Kembali</a>
            </div>

            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                <th class="py-3 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold">Tahun</th>
                                <th class="py-3 px-4 font-semibold">Jumlah Pagu</th>
                                <th class="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td class="py-3 px-4">Kantor Pusat</td>
                                <td class="py-3 px-4">2026</td>
                                <td class="py-3 px-4">Rp 50.000.000</td>
                                <td class="py-3 px-4 text-center">
                                    <button class="text-indigo-600 hover:underline font-semibold">Edit</button>
                                </td>
                            </tr>
                            <tr>
                                <td class="py-3 px-4">Agrowisata</td>
                                <td class="py-3 px-4">2026</td>
                                <td class="py-3 px-4">Rp 35.000.000</td>
                                <td class="py-3 px-4 text-center">
                                    <button class="text-indigo-600 hover:underline font-semibold">Edit</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function initDataPaguAnggaranHandler() {
    // Inisialisasi logika interaksi Pagu Anggaran jika diperlukan
}