// File: assets/js/views/monitoring.js
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderMonitoring() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Monitoring & Pengawasan BUMKal Srihardono</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih menu pemantauan dan pelaporan untuk keperluan pengawasan Badan Pengawas, Penasehat, dan manajemen.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btn-refresh-monitoring" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Muat Ulang Data
                    </button>
                </div>
            </div>

            <!-- Grid Menu Pilihan Monitoring & Laporan (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Menu Pilihan Monitoring & Laporan</h2>
                    <span class="text-[11px] text-slate-400">Klik menu untuk membuka halaman</span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <!-- 1. Laporan PAGU Anggaran -->
                    <a href="#/laporan-pagu" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">Anggaran</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Laporan PAGU Anggaran</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Pantau realisasi dan sisa pagu anggaran per unit usaha.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Laporan</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 2. Laporan Keuangan -->
                    <a href="#/keuangan-laporan-kas" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">Keuangan</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Laporan Keuangan</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Rekapitulasi kas masuk, kas keluar, dan mutasi saldo kas.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Laporan</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 3. Laporan Laba Rugi -->
                    <a href="#/laporan-laba-rugi" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 hover:border-amber-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">Kinerja</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">Laporan Laba Rugi</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Evaluasi pendapatan, beban operasional, dan surplus/defisit unit.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Laporan</span>
                            <span>&rarr;</span>
                        </div>
                    </a>

                    <!-- 4. Audit Jurnal & Buku Besar -->
                    <a href="#/laporan-jurnal" data-link class="group bg-slate-50 dark:bg-slate-950 hover:bg-sky-50/70 dark:hover:bg-sky-950/30 border border-slate-200 dark:border-slate-800 hover:border-sky-500 p-4 rounded-none transition flex flex-col justify-between gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="w-9 h-9 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200 dark:border-sky-800 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <span class="text-[10px] font-semibold uppercase px-2 py-0.5 bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">Audit</span>
                        </div>
                        <div>
                            <h3 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">Audit Jurnal Umum</h3>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Telusuri seluruh pencatatan jurnal akuntansi secara kronologis.</p>
                        </div>
                        <div class="text-[11px] font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span>Buka Jurnal</span>
                            <span>&rarr;</span>
                        </div>
                    </a>
                </div>
            </div>

            <!-- Kartu Statistik / KPI Ringkasan -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total Saldo Kas & Bank</p>
                    <h2 id="mon-total-saldo" class="text-sm md:text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">Memuat...</h2>
                    <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">Akumulasi Unit Usaha</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Unit Usaha Aktif</p>
                    <h2 class="text-sm md:text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">4 Unit</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Kantor, Agrowisata, Kompos, Greenhouse</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total Transaksi Jurnal</p>
                    <h2 id="mon-total-transaksi" class="text-sm md:text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1">0 Data</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Pencatatan keuangan tercatat</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p class="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Status Pengawasan</p>
                    <h2 class="text-sm md:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Normal / Tertib</h2>
                    <span class="text-[10px] text-slate-500 mt-1 inline-block">Audit trail aktif</span>
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