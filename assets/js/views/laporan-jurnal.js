// File: assets/js/views/laporan-jurnal.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const JURNAL_TYPE = "JurnalUmum";

function isJurnalUmumType(item) {
    const rawType = String(item.type || item.jenisTransaksi || "").trim();
    return rawType === JURNAL_TYPE;
}

export function renderLaporanJurnal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                    <a href="#/laporan" data-link title="Kembali ke Menu Laporan"
                        class="w-10 h-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan Jurnal Umum</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Rekapitulasi dan rincian transaksi jurnal finansial BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-laporan" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar (Kata Kunci, Unit Usaha, Tanggal Mulai, Tanggal Sampai) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI NO. REF / KETERANGAN</label>
                    <input type="text" id="filter-keyword" placeholder="Ketik kata kunci..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">--Semua Unit--</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button id="btn-reset-filter" class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 border border-slate-300 dark:border-slate-700 transition cursor-pointer">Reset Filter</button>
                </div>
            </div>

            <!-- Card Ringkasan Total -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-[11px] font-bold text-slate-500 uppercase">Total Transaksi Jurnal</p>
                        <h3 id="summary-count" class="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">0 Transaksi</h3>
                    </div>
                    <div class="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    </div>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-[11px] font-bold text-slate-500 uppercase">Total Nominal Keseluruhan</p>
                        <h3 id="summary-total-nominal" class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Rp 0</h3>
                    </div>
                    <div class="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                </div>
            </div>

            <!-- Daftar Laporan Jurnal (Responsive: Tabel Desktop & Card Mobile) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Rincian Data Laporan Jurnal Umum (${JURNAL_TYPE})</h3>
                    <span id="total-jurnal-label" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">Tanggal</th>
                                <th class="py-2.5 px-4 font-semibold">No. Referensi</th>
                                <th class="py-2.5 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Uraian / Keterangan & Rincian Akun</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Total (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-laporan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="5" class="py-6 text-center text-slate-400">Memuat laporan dari database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View) -->
                <div id="card-laporan-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat laporan dari database...</div>
                </div>
            </div>
        </div>
    `;
}

export async function initLaporanJurnalHandler() {
    const tableBody = document.getElementById('table-laporan-body');
    const cardBody = document.getElementById('card-laporan-body');
    const totalJurnalLabel = document.getElementById('total-jurnal-label');
    const summaryCount = document.getElementById('summary-count');
    const summaryTotalNominal = document.getElementById('summary-total-nominal');

    const filterKeyword = document.getElementById('filter-keyword');
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnResetFilter = document.getElementById('btn-reset-filter');
    const btnCetakLaporan = document.getElementById('btn-cetak-laporan');

    let allJurnalList = [];

    async function loadLaporanData() {
        if (!tableBody || !cardBody) return;
        try {
            const q = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const querySnapshot = await getDocs(q);
            allJurnalList = [];
            querySnapshot.forEach((docSnap) => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });
            renderFilteredData();
        } catch (err) {
            console.error("Gagal memuat laporan jurnal:", err);
            tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    function renderFilteredData() {
        if (!tableBody || !cardBody) return;

        const keyword = filterKeyword ? filterKeyword.value.toLowerCase() : "";
        const unit = filterUnit ? filterUnit.value : "";
        const tglMulai = filterTglMulai ? filterTglMulai.value : "";
        const tglSampai = filterTglSampai ? filterTglSampai.value : "";

        const jurnalUmumOnly = allJurnalList.filter(isJurnalUmumType);

        let filtered = jurnalUmumOnly.filter(item => {
            const matchKeyword = (item.noRef && item.noRef.toLowerCase().includes(keyword)) || 
                                 (item.keterangan && item.keterangan.toLowerCase().includes(keyword)) ||
                                 (item.rincian && item.rincian.some(r => r.namaAkun.toLowerCase().includes(keyword)));
            const matchUnit = unit === "" || item.unitUsaha === unit;
            
            let matchTanggal = true;
            if (item.tglTransaksi) {
                if (tglMulai && item.tglTransaksi < tglMulai) matchTanggal = false;
                if (tglSampai && item.tglTransaksi > tglSampai) matchTanggal = false;
            }

            return matchKeyword && matchUnit && matchTanggal;
        });

        let grandTotal = 0;
        filtered.forEach(item => {
            grandTotal += parseFloat(item.totalNilai) || 0;
        });

        if (totalJurnalLabel) totalJurnalLabel.textContent = `Menampilkan ${filtered.length} Transaksi`;
        if (summaryCount) summaryCount.textContent = `${filtered.length} Transaksi`;
        if (summaryTotalNominal) summaryTotalNominal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Tidak ada data laporan jurnal (${JURNAL_TYPE}) yang sesuai dengan filter.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data laporan jurnal (${JURNAL_TYPE}) yang sesuai dengan filter.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        filtered.forEach(item => {
            let rincianHtml = "";
            let totalNilai = 0;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    totalNilai += parseFloat(r.debet) || 0;
                    rincianHtml += `<div class="text-[11px] text-slate-600 dark:text-slate-400">&bull; <span class="font-bold">${r.kodeAkun}</span> - ${r.namaAkun}: <span class="text-indigo-600 font-semibold">D: Rp ${(r.debet||0).toLocaleString('id-ID')}</span> | <span class="text-purple-600 font-semibold">K: Rp ${(r.kredit||0).toLocaleString('id-ID')}</span></div>`;
                });
            }

            const ketUraian = item.keterangan || '-';

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition align-top">
                    <td class="py-3 px-4 font-medium">${item.tglTransaksi || '-'}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${item.noRef || '-'}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${item.unitUsaha || '-'}</span></td>
                    <td class="py-3 px-4 space-y-1.5">
                        <div class="font-bold text-slate-800 dark:text-slate-200">${ketUraian}</div>
                        <div class="space-y-0.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-2">${rincianHtml}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">Rp ${totalNilai.toLocaleString('id-ID')}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${item.noRef || '-'}</span>
                        <span class="text-[11px] text-slate-500">${item.tglTransaksi || '-'}</span>
                    </div>
                    <div>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${item.unitUsaha || '-'}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">Ket: ${ketUraian}</div>
                    <div class="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800">
                        ${rincianHtml}
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="font-bold text-slate-800 dark:text-slate-100">Total: Rp ${totalNilai.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;
    }

    if (filterKeyword) filterKeyword.oninput = renderFilteredData;
    if (filterUnit) filterUnit.onchange = renderFilteredData;
    if (filterTglMulai) filterTglMulai.onchange = renderFilteredData;
    if (filterTglSampai) filterTglSampai.onchange = renderFilteredData;
    
    if (btnResetFilter) {
        btnResetFilter.onclick = () => {
            if (filterKeyword) filterKeyword.value = "";
            if (filterUnit) filterUnit.value = "";
            if (filterTglMulai) filterTglMulai.value = "";
            if (filterTglSampai) filterTglSampai.value = "";
            renderFilteredData();
        };
    }

    if (btnCetakLaporan) {
        btnCetakLaporan.onclick = () => {
            window.print();
        };
    }

    loadLaporanData();
}