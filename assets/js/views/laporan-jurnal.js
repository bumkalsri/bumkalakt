// File: assets/js/views/laporan-jurnal.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const PAGE_SIZE = 5;

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getJenisLabel(item = {}) {
    const raw = String(item.jenisTransaksi || item.type || "Laporan Jurnal").trim();
    return raw || "Laporan Jurnal";
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan Jurnal</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Rekapitulasi dan rincian seluruh transaksi finansial BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-laporan" type="button" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar (Kata Kunci, Jenis Jurnal, Unit Usaha, Tanggal Mulai, Tanggal Sampai) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs items-end">
                <div class="lg:col-span-2">
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI NO. REF / KETERANGAN</label>
                    <input type="text" id="filter-keyword" placeholder="Ketik kata kunci..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JENIS JURNAL</label>
                    <select id="filter-jenis" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">--Semua Jenis--</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA</label>
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
                <div class="flex gap-2">
                    <div class="flex-1 min-w-0">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                        <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <button id="btn-reset-filter" type="button" title="Reset Filter" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-2 border border-slate-300 dark:border-slate-700 transition cursor-pointer flex-shrink-0">Reset</button>
                </div>
            </div>

            <!-- Card Ringkasan Total -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-[11px] font-bold text-slate-500 uppercase">Total Transaksi Laporan Jurnal</p>
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
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Rincian Data Laporan Jurnal</h3>
                    <span id="total-jurnal-label" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold w-12 text-center">No</th>
                                <th class="py-2.5 px-4 font-semibold">Tanggal</th>
                                <th class="py-2.5 px-4 font-semibold">No. Referensi</th>
                                <th class="py-2.5 px-4 font-semibold">Jenis / Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Uraian / Keterangan &amp; Rincian Akun</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Total (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-laporan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="6" class="py-6 text-center text-slate-400">Memuat laporan dari database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View) -->
                <div id="card-laporan-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat laporan dari database...</div>
                </div>
            </div>

            <!-- PAGINASI (5 BARIS PER HALAMAN) -->
            <div id="jurnal-pagination-bar" class="hidden bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div id="jurnal-page-info" class="text-slate-500 dark:text-slate-400 font-medium">
                    Halaman 1 dari 1 (5 baris / halaman)
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" id="btn-jurnal-prev"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Sebelumnya
                    </button>
                    <span id="jurnal-page-badge" class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold">
                        1 / 1
                    </span>
                    <button type="button" id="btn-jurnal-next"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    `;
}

let laporanJurnalCleanup = null;

export async function initLaporanJurnalHandler() {
    if (typeof laporanJurnalCleanup === "function") {
        laporanJurnalCleanup();
        laporanJurnalCleanup = null;
    }

    const tableBody = document.getElementById('table-laporan-body');
    const cardBody = document.getElementById('card-laporan-body');
    const totalJurnalLabel = document.getElementById('total-jurnal-label');
    const summaryCount = document.getElementById('summary-count');
    const summaryTotalNominal = document.getElementById('summary-total-nominal');

    const filterKeyword = document.getElementById('filter-keyword');
    const filterJenis = document.getElementById('filter-jenis');
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnResetFilter = document.getElementById('btn-reset-filter');
    const btnCetakLaporan = document.getElementById('btn-cetak-laporan');

    const paginationBar = document.getElementById('jurnal-pagination-bar');
    const pageInfoEl = document.getElementById('jurnal-page-info');
    const pageBadgeEl = document.getElementById('jurnal-page-badge');
    const btnPrevPage = document.getElementById('btn-jurnal-prev');
    const btnNextPage = document.getElementById('btn-jurnal-next');

    let allJurnalList = [];
    let currentPage = 1;

    function populateJenisFilterOptions() {
        if (!filterJenis) return;
        const prev = filterJenis.value;
        const uniqueTypes = Array.from(
            new Set(allJurnalList.map((it) => getJenisLabel(it)).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, "id"));

        filterJenis.innerHTML = `<option value="">--Semua Jenis--</option>` + uniqueTypes
            .map((t) => `<option value="${escapeHtml(t)}" ${prev === t ? "selected" : ""}>${escapeHtml(t)}</option>`)
            .join("");
    }

    function computeItemTotal(item = {}) {
        const explicitTotal = parseFloat(item.totalNilai);
        if (!Number.isNaN(explicitTotal) && explicitTotal > 0) return explicitTotal;
        if (Array.isArray(item.rincian)) {
            return item.rincian.reduce((sum, r) => sum + (parseFloat(r.debet) || 0), 0);
        }
        return 0;
    }

    function getFilteredList() {
        const keyword = filterKeyword ? filterKeyword.value.trim().toLowerCase() : "";
        const jenis = filterJenis ? filterJenis.value : "";
        const unit = filterUnit ? filterUnit.value : "";
        const tglMulai = filterTglMulai ? filterTglMulai.value : "";
        const tglSampai = filterTglSampai ? filterTglSampai.value : "";

        return allJurnalList.filter((item) => {
            const jenisLabel = getJenisLabel(item);
            const matchJenis = !jenis || jenisLabel === jenis;
            if (!matchJenis) return false;

            const matchUnit = !unit || item.unitUsaha === unit;
            if (!matchUnit) return false;

            const tglItem = String(item.tglTransaksi || "");
            if (tglItem) {
                if (tglMulai && tglItem < tglMulai) return false;
                if (tglSampai && tglItem > tglSampai) return false;
            }

            if (!keyword) return true;
            const matchRef = String(item.noRef || "").toLowerCase().includes(keyword);
            const matchKet = String(item.keterangan || "").toLowerCase().includes(keyword);
            const matchJenisKw = jenisLabel.toLowerCase().includes(keyword);
            const matchRincian = Array.isArray(item.rincian) && item.rincian.some((r) =>
                String(r.namaAkun || "").toLowerCase().includes(keyword) ||
                String(r.kodeAkun || "").toLowerCase().includes(keyword)
            );
            return matchRef || matchKet || matchJenisKw || matchRincian;
        });
    }

    function renderFilteredData() {
        if (!tableBody || !cardBody) return;

        const filtered = getFilteredList();
        const totalFiltered = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalFiltered);
        const pageItems = filtered.slice(startIdx, endIdx);

        let grandTotal = 0;
        filtered.forEach((item) => {
            grandTotal += computeItemTotal(item);
        });

        if (totalJurnalLabel) {
            totalJurnalLabel.textContent = totalFiltered === 0
                ? "Menampilkan 0 Transaksi"
                : `Menampilkan ${startIdx + 1}-${endIdx} dari ${totalFiltered} Transaksi (5 baris / halaman)`;
        }
        if (summaryCount) summaryCount.textContent = `${totalFiltered} Transaksi`;
        if (summaryTotalNominal) summaryTotalNominal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;

        if (paginationBar) {
            if (totalFiltered > PAGE_SIZE) {
                paginationBar.classList.remove('hidden');
                if (pageInfoEl) pageInfoEl.textContent = `Halaman ${currentPage} dari ${totalPages} (${PAGE_SIZE} baris / halaman)`;
                if (pageBadgeEl) pageBadgeEl.textContent = `${currentPage} / ${totalPages}`;
                if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
                if (btnNextPage) btnNextPage.disabled = currentPage >= totalPages;
            } else {
                paginationBar.classList.add('hidden');
            }
        }

        if (pageItems.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Tidak ada data laporan jurnal yang sesuai dengan filter.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data laporan jurnal yang sesuai dengan filter.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        pageItems.forEach((item, idx) => {
            const nomorUrut = startIdx + idx + 1;
            const jenisLabel = escapeHtml(getJenisLabel(item));
            const totalNilai = computeItemTotal(item);
            let rincianHtml = "";

            if (Array.isArray(item.rincian)) {
                item.rincian.forEach((r) => {
                    const kodeAkun = escapeHtml(r.kodeAkun || "");
                    const namaAkun = escapeHtml(r.namaAkun || "");
                    const debetFmt = (parseFloat(r.debet) || 0).toLocaleString('id-ID');
                    const kreditFmt = (parseFloat(r.kredit) || 0).toLocaleString('id-ID');
                    rincianHtml += `<div class="text-[11px] text-slate-600 dark:text-slate-400">&bull; <span class="font-bold">${kodeAkun}</span> - ${namaAkun}: <span class="text-indigo-600 font-semibold">D: Rp ${debetFmt}</span> | <span class="text-purple-600 font-semibold">K: Rp ${kreditFmt}</span></div>`;
                });
            }

            const ketUraian = escapeHtml(item.keterangan || '-');
            const tglFmt = escapeHtml(item.tglTransaksi || '-');
            const refFmt = escapeHtml(item.noRef || '-');
            const unitFmt = escapeHtml(item.unitUsaha || '-');

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition align-top">
                    <td class="py-3 px-4 text-center text-slate-500 font-medium">${nomorUrut}</td>
                    <td class="py-3 px-4 font-medium whitespace-nowrap">${tglFmt}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">${refFmt}</td>
                    <td class="py-3 px-4 space-y-1">
                        <div><span class="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">${jenisLabel}</span></div>
                        <div><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${unitFmt}</span></div>
                    </td>
                    <td class="py-3 px-4 space-y-1.5">
                        <div class="font-bold text-slate-800 dark:text-slate-200">${ketUraian}</div>
                        <div class="space-y-0.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-2">${rincianHtml}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Rp ${totalNilai.toLocaleString('id-ID')}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">#${nomorUrut} • ${refFmt}</span>
                        <span class="text-[11px] text-slate-500">${tglFmt}</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <span class="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">${jenisLabel}</span>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${unitFmt}</span>
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

    async function loadLaporanData() {
        if (!tableBody || !cardBody) return;
        try {
            const q = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const querySnapshot = await getDocs(q);
            allJurnalList = [];
            querySnapshot.forEach((docSnap) => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });
            populateJenisFilterOptions();
            renderFilteredData();
        } catch (err) {
            console.error("Gagal memuat laporan jurnal:", err);
            if (paginationBar) paginationBar.classList.add('hidden');
            tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    const onFilterChange = () => {
        currentPage = 1;
        renderFilteredData();
    };

    const onPrevClick = () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderFilteredData();
        }
    };

    const onNextClick = () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredList().length / PAGE_SIZE));
        if (currentPage < totalPages) {
            currentPage += 1;
            renderFilteredData();
        }
    };

    const onResetClick = () => {
        if (filterKeyword) filterKeyword.value = "";
        if (filterJenis) filterJenis.value = "";
        if (filterUnit) filterUnit.value = "";
        if (filterTglMulai) filterTglMulai.value = "";
        if (filterTglSampai) filterTglSampai.value = "";
        currentPage = 1;
        renderFilteredData();
    };

    const onPrintClick = () => {
        window.print();
    };

    if (filterKeyword) filterKeyword.addEventListener('input', onFilterChange);
    if (filterJenis) filterJenis.addEventListener('change', onFilterChange);
    if (filterUnit) filterUnit.addEventListener('change', onFilterChange);
    if (filterTglMulai) filterTglMulai.addEventListener('change', onFilterChange);
    if (filterTglSampai) filterTglSampai.addEventListener('change', onFilterChange);
    if (btnPrevPage) btnPrevPage.addEventListener('click', onPrevClick);
    if (btnNextPage) btnNextPage.addEventListener('click', onNextClick);
    if (btnResetFilter) btnResetFilter.addEventListener('click', onResetClick);
    if (btnCetakLaporan) btnCetakLaporan.addEventListener('click', onPrintClick);

    const cleanup = () => {
        if (filterKeyword) filterKeyword.removeEventListener('input', onFilterChange);
        if (filterJenis) filterJenis.removeEventListener('change', onFilterChange);
        if (filterUnit) filterUnit.removeEventListener('change', onFilterChange);
        if (filterTglMulai) filterTglMulai.removeEventListener('change', onFilterChange);
        if (filterTglSampai) filterTglSampai.removeEventListener('change', onFilterChange);
        if (btnPrevPage) btnPrevPage.removeEventListener('click', onPrevClick);
        if (btnNextPage) btnNextPage.removeEventListener('click', onNextClick);
        if (btnResetFilter) btnResetFilter.removeEventListener('click', onResetClick);
        if (btnCetakLaporan) btnCetakLaporan.removeEventListener('click', onPrintClick);
        window.removeEventListener('hashchange', cleanup);
        laporanJurnalCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    laporanJurnalCleanup = cleanup;

    await loadLaporanData();

    return cleanup;
}