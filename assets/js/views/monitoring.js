// File: assets/js/views/monitoring.js
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderMonitoring() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Monitoring & Pengawasan Sistem BUMKal</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pusat pemantauan kinerja unit usaha, rekapitulasi saldo kas, dan audit trail transaksi secara real-time untuk Dewan Pengawas.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btn-refresh-monitoring" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Muat Ulang Data
                    </button>
                </div>
            </div>

            <!-- Kartu Statistik / KPI Ringkasan -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total Saldo Kas & Bank</p>
                    <h2 id="mon-total-saldo" class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">Memuat...</h2>
                    <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">&uarr; Akumulasi Seluruh Unit Usaha</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Unit Usaha Aktif</p>
                    <h2 class="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">4 Unit</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Pusat, Agrowisata, Kompos, Greenhouse</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total Transaksi Jurnal</p>
                    <h2 id="mon-total-transaksi" class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">0 Data</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Pencatatan keuangan tercatat</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Status Kepatuhan Pengawas</p>
                    <h2 class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Normal / Tertib</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Audit trail aktif & terverifikasi</span>
                </div>
            </div>

            <!-- Status Operasional 4 Unit Usaha BUMKal -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none p-5 space-y-4">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">Status & Kinerja Unit Usaha BUMKal</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="flex justify-between items-center"><span class="font-bold text-slate-800 dark:text-slate-200">KANTOR PUSAT (01)</span><span class="w-2 h-2 rounded-full bg-emerald-500"></span></div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Pengelolaan administrasi, manajemen pusat, dan koordinasi umum.</p>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">Status: Operasional Optimal</div>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="flex justify-between items-center"><span class="font-bold text-slate-800 dark:text-slate-200">AGROWISATA (02)</span><span class="w-2 h-2 rounded-full bg-emerald-500"></span></div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Pengelolaan wisata edukasi, kunjungan, dan wahana rekreasi kalurahan.</p>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">Status: Operasional Optimal</div>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="flex justify-between items-center"><span class="font-bold text-slate-800 dark:text-slate-200">KOMPOS (03)</span><span class="w-2 h-2 rounded-full bg-emerald-500"></span></div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Produksi pupuk organik, pengolahan sampah mandiri, dan distribusi.</p>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">Status: Operasional Optimal</div>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="flex justify-between items-center"><span class="font-bold text-slate-800 dark:text-slate-200">GREENHOUSE (04)</span><span class="w-2 h-2 rounded-full bg-emerald-500"></span></div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Budidaya tanaman hortikultura modern, pembibitan, dan panen raya.</p>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">Status: Operasional Optimal</div>
                    </div>
                </div>
            </div>

            <!-- Audit Trail & Jejak Aktivitas Transaksi Terbaru -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>AUDIT TRAIL & 10 AKTIVITAS TRANSAKSI TERAKHIR</span>
                    <span class="text-slate-500 font-normal text-[11px]">Real-time Database Monitoring</span>
                </div>

                <!-- Tampilan Desktop: Tabel -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-36">No. Referensi</th>
                                <th class="py-3 px-4 font-semibold w-32">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold">Uraian & Keterangan Transaksi</th>
                                <th class="py-3 px-4 font-semibold text-right w-40">Nominal (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-monitoring-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="5" class="py-8 text-center text-slate-400">Memuat data aktivitas sistem...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile: Card Versi HP -->
                <div id="card-monitoring-body" class="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data aktivitas sistem...</div>
                </div>
            </div>
        </div>
    `;
}

export function initMonitoringHandler() {
    const btnRefresh = document.getElementById('btn-refresh-monitoring');
    const tableBody = document.getElementById('table-monitoring-body');
    const cardBody = document.getElementById('card-monitoring-body');
    const totalSaldoEl = document.getElementById('mon-total-saldo');
    const totalTransaksiEl = document.getElementById('mon-total-transaksi');

    async function loadMonitoringData() {
        try {
            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"), limit(10));
            const snapJurnal = await getDocs(qJurnal);
            
            let transaksiList = [];
            let totalTransaksiCount = 0;

            // Hitung total keseluruhan data jurnal
            const snapAll = await getDocs(collection(db, "jurnal_umum"));
            totalTransaksiCount = snapAll.size;

            let estimatedSaldo = 0;

            snapAll.forEach(docSnap => {
                const data = docSnap.data();
                if (data.rincian && Array.isArray(data.rincian) && data.rincian.length >= 1) {
                    const nominal = parseFloat(data.rincian[0].debet || data.rincian[0].kredit || 0);
                    const ket = (data.keterangan || "").toLowerCase();
                    if (ket.includes("[kas masuk]")) {
                        estimatedSaldo += nominal;
                    } else if (ket.includes("[kas keluar]")) {
                        estimatedSaldo -= nominal;
                    }
                }
            });

            snapJurnal.forEach(docSnap => {
                const data = docSnap.data();
                let nominal = 0;
                if (data.rincian && Array.isArray(data.rincian) && data.rincian.length >= 1) {
                    nominal = parseFloat(data.rincian[0].debet || data.rincian[0].kredit || 0);
                }
                transaksiList.push({
                    id: docSnap.id,
                    tgl: data.tglTransaksi || "-",
                    ref: data.noRef || "REF-" + docSnap.id.slice(-6),
                    unit: data.unitUsaha || "-",
                    keterangan: data.keterangan || "-",
                    nominal: isNaN(nominal) ? 0 : nominal
                });
            });

            if (totalSaldoEl) totalSaldoEl.textContent = `Rp ${estimatedSaldo.toLocaleString('id-ID')}`;
            if (totalTransaksiEl) totalTransaksiEl.textContent = `${totalTransaksiCount} Data`;

            if (transaksiList.length === 0) {
                if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada aktivitas transaksi tercatat.</td></tr>`;
                if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Belum ada aktivitas transaksi tercatat.</div>`;
                return;
            }

            // Render Desktop Table
            let htmlTable = "";
            transaksiList.forEach(item => {
                const isMasuk = item.keterangan.toLowerCase().includes("[kas masuk]");
                htmlTable += `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tgl}</td>
                        <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">${item.ref}</td>
                        <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unit}</td>
                        <td class="py-3 px-4 text-slate-700 dark:text-slate-300">${item.keterangan}</td>
                        <td class="py-3 px-4 text-right font-semibold ${isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                            Rp ${item.nominal.toLocaleString('id-ID')}
                        </td>
                    </tr>
                `;
            });
            if (tableBody) tableBody.innerHTML = htmlTable;

            // Render Mobile Card
            let htmlCard = "";
            transaksiList.forEach(item => {
                const isMasuk = item.keterangan.toLowerCase().includes("[kas masuk]");
                htmlCard += `
                    <div class="p-4 space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-slate-500 font-semibold">${item.ref}</span>
                            <span class="text-slate-500">${item.tgl}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600 dark:text-slate-300 font-medium">Unit: ${item.unit}</span>
                        </div>
                        <div class="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-none border border-slate-100 dark:border-slate-800">
                            ${item.keterangan}
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span class="text-slate-500 font-medium">Nominal:</span>
                            <span class="font-bold text-sm ${isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                                Rp ${item.nominal.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                `;
            });
            if (cardBody) cardBody.innerHTML = htmlCard;

        } catch (err) {
            console.error("Gagal memuat data monitoring:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    if (btnRefresh) {
        btnRefresh.onclick = loadMonitoringData;
    }

    loadMonitoringData();
}