// File: assets/js/views/monitoring-laporan-pagu.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function formatRupiah(angka) {
    const nilai = Number(angka) || 0;
    return `Rp ${nilai.toLocaleString("id-ID")}`;
}

function formatPeriodeTahun(tahunMulai, tahunSelesai, tahunFallback) {
    const start = Number(tahunMulai) || Number(tahunFallback) || new Date().getFullYear();
    const end = Number(tahunSelesai) || start;
    if (end <= start) {
        return `${start}`;
    }
    return `${start} - ${end}`;
}

function extractUnitCodeSortKey(unitUsaha) {
    const str = String(unitUsaha || "").trim();
    const match = str.match(/\(([^)]+)\)\s*$/);
    const code = match ? match[1].trim() : str;
    const num = parseInt(code.replace(/\D/g, ""), 10);
    return {
        hasNum: !Number.isNaN(num),
        num: Number.isNaN(num) ? Number.MAX_SAFE_INTEGER : num,
        codeStr: code.toUpperCase(),
        fullStr: str.toUpperCase()
    };
}

function compareByKodeUnitAsc(a, b) {
    const ka = extractUnitCodeSortKey(a.unitUsaha);
    const kb = extractUnitCodeSortKey(b.unitUsaha);

    if (ka.hasNum && kb.hasNum && ka.num !== kb.num) {
        return ka.num - kb.num;
    }
    if (ka.hasNum !== kb.hasNum) {
        return ka.hasNum ? -1 : 1;
    }
    if (ka.codeStr !== kb.codeStr) {
        return ka.codeStr.localeCompare(kb.codeStr, "id");
    }
    return ka.fullStr.localeCompare(kb.fullStr, "id");
}

function extractYearFromDateStr(dateStr) {
    if (!dateStr) return null;
    const match = String(dateStr).match(/^(\d{4})/);
    if (match) return parseInt(match[1], 10);
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

function extractExpenseFromJurnal(jurnalDoc) {
    let total = 0;

    if (Array.isArray(jurnalDoc.rincian) && jurnalDoc.rincian.length > 0) {
        jurnalDoc.rincian.forEach((r) => {
            const kode = String(r.kodeAkun || "").trim();
            const nama = String(r.namaAkun || "").toLowerCase();
            const debet = parseFloat(r.debet) || 0;
            const kredit = parseFloat(r.kredit) || 0;

            const isBebanAkun =
                kode.startsWith("5") ||
                nama.includes("beban") ||
                nama.includes("biaya");

            if (isBebanAkun) {
                total += (debet - kredit);
            }
        });
    }

    if (total === 0) {
        const jenis = String(jurnalDoc.jenis || jurnalDoc.tipe || "").toLowerCase();
        if (jenis.includes("keluar") || jenis.includes("beban") || jenis.includes("expense")) {
            total = parseFloat(jurnalDoc.totalDebet || jurnalDoc.total || jurnalDoc.nominal || 0) || 0;
        }
    }

    return Math.max(0, total);
}

function getStatusBadge(pct) {
    if (pct >= 90) {
        return {
            label: "Kritis / Hampir Habis",
            cls: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900",
            barCls: "bg-rose-600"
        };
    }
    if (pct >= 70) {
        return {
            label: "Perlu Perhatian",
            cls: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900",
            barCls: "bg-amber-500"
        };
    }
    return {
        label: "Aman",
        cls: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900",
        barCls: "bg-emerald-600"
    };
}

export function renderMonitoringLaporanPagu() {
    return `
        <div class="space-y-4 sm:space-y-6 pb-10 max-w-7xl mx-auto overflow-x-hidden animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div class="flex items-start sm:items-center gap-3 min-w-0">
                    <a href="#/monitoring" data-link title="Kembali ke Menu Monitoring"
                        class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0 mt-0.5 sm:mt-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0 flex-1">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Monitoring &amp; Laporan Pagu Anggaran</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">Pemantauan pagu multi-tahun/tahunan, realisasi penyerapan, dan sisa anggaran per unit usaha.</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button type="button" id="btn-refresh-monitoring-pagu"
                        class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 sm:py-2.5 rounded-none border border-slate-200 dark:border-slate-700 transition cursor-pointer text-center">
                        Muat Ulang
                    </button>
                    <button type="button" id="btn-cetak-monitoring-pagu"
                        class="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 sm:py-2.5 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        <span>Cetak / Print</span>
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs items-end">
                <div>
                    <label for="mon-pagu-filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="mon-pagu-filter-unit"
                        class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>

                <div>
                    <label for="mon-pagu-filter-periode" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PERIODE TAHUN</label>
                    <select id="mon-pagu-filter-periode"
                        class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Periode --</option>
                    </select>
                </div>

                <div>
                    <label for="mon-pagu-filter-status" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">STATUS SERAPAN</label>
                    <select id="mon-pagu-filter-status"
                        class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Status --</option>
                        <option value="aman">Aman (&lt; 70%)</option>
                        <option value="perhatian">Perlu Perhatian (70% - 89%)</option>
                        <option value="kritis">Kritis (&ge; 90%)</option>
                    </select>
                </div>

                <div>
                    <button type="button" id="btn-reset-filter-pagu"
                        class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-none border border-slate-200 dark:border-slate-700 transition cursor-pointer">
                        Reset Filter
                    </button>
                </div>
            </div>

            <!-- Kartu Ringkasan KPI (2 Kolom HP, 4 Kolom Desktop) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                    <p class="font-bold text-slate-500 uppercase text-[10px] tracking-wide">Total Pagu Anggaran</p>
                    <h2 id="kpi-total-pagu" class="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1 break-words">Rp 0</h2>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                    <p class="font-bold text-slate-500 uppercase text-[10px] tracking-wide">Total Realisasi</p>
                    <h2 id="kpi-total-realisasi" class="text-xs sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 break-words">Rp 0</h2>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                    <p class="font-bold text-slate-500 uppercase text-[10px] tracking-wide">Sisa Pagu Tersedia</p>
                    <h2 id="kpi-sisa-pagu" class="text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 break-words">Rp 0</h2>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
                    <p class="font-bold text-slate-500 uppercase text-[10px] tracking-wide">Rata-Rata Serapan</p>
                    <h2 id="kpi-persen-serapan" class="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1 break-words">0.0%</h2>
                </div>
            </div>

            <!-- Tabel & Card Monitoring Pagu Anggaran -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Rincian Monitoring Pagu &amp; Realisasi per Unit</h3>
                    <span id="mon-pagu-count-label" class="text-[11px] text-slate-500 font-medium">Menampilkan 0 Data</span>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">No</th>
                                <th class="py-2.5 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Periode Tahun</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Jumlah Pagu</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Realisasi</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Sisa Pagu</th>
                                <th class="py-2.5 px-4 font-semibold">Serapan (%)</th>
                                <th class="py-2.5 px-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody id="table-monitoring-pagu-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="8" class="py-8 text-center text-slate-400">Memuat data monitoring pagu anggaran...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="card-monitoring-pagu-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data monitoring pagu anggaran...</div>
                </div>
            </div>
        </div>
    `;
}

let monitoringLaporanPaguCleanup = null;

export function initMonitoringLaporanPaguHandler() {
    if (typeof monitoringLaporanPaguCleanup === "function") {
        monitoringLaporanPaguCleanup();
        monitoringLaporanPaguCleanup = null;
    }

    const filterUnitEl = document.getElementById("mon-pagu-filter-unit");
    const filterPeriodeEl = document.getElementById("mon-pagu-filter-periode");
    const filterStatusEl = document.getElementById("mon-pagu-filter-status");
    const btnResetFilter = document.getElementById("btn-reset-filter-pagu");
    const btnRefresh = document.getElementById("btn-refresh-monitoring-pagu");
    const btnCetak = document.getElementById("btn-cetak-monitoring-pagu");

    const kpiTotalPagu = document.getElementById("kpi-total-pagu");
    const kpiTotalRealisasi = document.getElementById("kpi-total-realisasi");
    const kpiSisaPagu = document.getElementById("kpi-sisa-pagu");
    const kpiPersenSerapan = document.getElementById("kpi-persen-serapan");
    const countLabel = document.getElementById("mon-pagu-count-label");

    const tableBody = document.getElementById("table-monitoring-pagu-body");
    const cardBody = document.getElementById("card-monitoring-pagu-body");

    let paguDocs = [];
    let jurnalDocs = [];

    function populatePeriodeOptions(rows) {
        if (!filterPeriodeEl) return;
        const currentVal = filterPeriodeEl.value;
        const setPeriode = new Set();

        rows.forEach((r) => {
            if (r.periodeLabel) setPeriode.add(r.periodeLabel);
        });

        const sorted = Array.from(setPeriode).sort((a, b) => b.localeCompare(a));
        filterPeriodeEl.innerHTML = `<option value="">-- Semua Periode --</option>` +
            sorted.map((p) => `<option value="${p}">${p}</option>`).join("");

        if (currentVal && setPeriode.has(currentVal)) {
            filterPeriodeEl.value = currentVal;
        }
    }

    function computeMonitoringRows() {
        return paguDocs
            .map((p) => {
                const jumlahPagu = Number(p.jumlahPagu) || 0;
                const startYear = Number(p.tahunMulai) || Number(p.tahun) || new Date().getFullYear();
                const endYear = Number(p.tahunSelesai) || startYear;
                const periodeLabel = formatPeriodeTahun(startYear, endYear, p.tahun);

                let realisasi = 0;
                jurnalDocs.forEach((j) => {
                    const jUnit = String(j.unitUsaha || "").trim();
                    if (p.unitUsaha && jUnit && jUnit !== p.unitUsaha) return;

                    const jYear = extractYearFromDateStr(j.tglTransaksi || j.tanggal || "");
                    if (jYear !== null && (jYear < startYear || jYear > endYear)) return;

                    realisasi += extractExpenseFromJurnal(j);
                });

                const sisaPagu = jumlahPagu - realisasi;
                const pct = jumlahPagu > 0 ? (realisasi / jumlahPagu) * 100 : 0;
                const statusKey = pct >= 90 ? "kritis" : pct >= 70 ? "perhatian" : "aman";
                const badge = getStatusBadge(pct);

                return {
                    id: p.id,
                    unitUsaha: p.unitUsaha || "-",
                    tahunMulai: startYear,
                    tahunSelesai: endYear,
                    periodeLabel,
                    jumlahPagu,
                    realisasi,
                    sisaPagu,
                    pct,
                    statusKey,
                    badge
                };
            })
            .sort(compareByKodeUnitAsc);
    }

    function renderMonitoringView() {
        const allRows = computeMonitoringRows();
        populatePeriodeOptions(allRows);

        const unitVal = filterUnitEl ? filterUnitEl.value : "";
        const periodeVal = filterPeriodeEl ? filterPeriodeEl.value : "";
        const statusVal = filterStatusEl ? filterStatusEl.value : "";

        const filtered = allRows.filter((r) => {
            if (unitVal && r.unitUsaha !== unitVal) return false;
            if (periodeVal && r.periodeLabel !== periodeVal) return false;
            if (statusVal && r.statusKey !== statusVal) return false;
            return true;
        });

        const totalPagu = filtered.reduce((acc, r) => acc + r.jumlahPagu, 0);
        const totalRealisasi = filtered.reduce((acc, r) => acc + r.realisasi, 0);
        const totalSisa = totalPagu - totalRealisasi;
        const avgPct = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;

        if (kpiTotalPagu) kpiTotalPagu.textContent = formatRupiah(totalPagu);
        if (kpiTotalRealisasi) kpiTotalRealisasi.textContent = formatRupiah(totalRealisasi);
        if (kpiSisaPagu) {
            kpiSisaPagu.textContent = formatRupiah(totalSisa);
            kpiSisaPagu.className = totalSisa < 0
                ? "text-xs sm:text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1 break-words"
                : "text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 break-words";
        }
        if (kpiPersenSerapan) kpiPersenSerapan.textContent = `${avgPct.toFixed(1)}%`;
        if (countLabel) countLabel.textContent = `Menampilkan ${filtered.length} Data`;

        if (filtered.length === 0) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">Tidak ada data pagu anggaran sesuai filter.</td></tr>`;
            }
            if (cardBody) {
                cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data pagu anggaran sesuai filter.</div>`;
            }
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        filtered.forEach((r, idx) => {
            const clampedBar = Math.min(100, Math.max(0, r.pct));
            const sisaClass = r.sisaPagu < 0
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : "text-emerald-600 dark:text-emerald-400 font-bold";

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 text-slate-500">${idx + 1}</td>
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">${r.unitUsaha}</td>
                    <td class="py-3 px-4">${r.periodeLabel}</td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${formatRupiah(r.jumlahPagu)}</td>
                    <td class="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">${formatRupiah(r.realisasi)}</td>
                    <td class="py-3 px-4 text-right ${sisaClass}">${formatRupiah(r.sisaPagu)}</td>
                    <td class="py-3 px-4 min-w-[130px]">
                        <div class="flex items-center justify-between text-[11px] font-semibold mb-1">
                            <span>${r.pct.toFixed(1)}%</span>
                        </div>
                        <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                            <div class="h-full ${r.badge.barCls}" style="width: ${clampedBar}%;"></div>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded-none ${r.badge.cls}">${r.badge.label}</span>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-3.5 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div class="flex items-start justify-between gap-2">
                        <span class="font-bold text-slate-800 dark:text-slate-100 break-words">${r.unitUsaha}</span>
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded-none flex-shrink-0 ${r.badge.cls}">${r.badge.label}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Periode: <strong class="text-slate-700 dark:text-slate-200">${r.periodeLabel}</strong></span>
                        <span>Serapan: <strong class="text-slate-800 dark:text-slate-100">${r.pct.toFixed(1)}%</strong></span>
                    </div>
                    <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                        <div class="h-full ${r.badge.barCls}" style="width: ${clampedBar}%;"></div>
                    </div>
                    <div class="grid grid-cols-1 gap-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-slate-500">Pagu Anggaran</span>
                            <span class="font-bold text-slate-800 dark:text-slate-100">${formatRupiah(r.jumlahPagu)}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-slate-500">Realisasi</span>
                            <span class="font-bold text-indigo-600 dark:text-indigo-400">${formatRupiah(r.realisasi)}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span class="text-slate-500">Sisa Pagu</span>
                            <span class="${sisaClass}">${formatRupiah(r.sisaPagu)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        if (tableBody) tableBody.innerHTML = htmlTable;
        if (cardBody) cardBody.innerHTML = htmlCard;
    }

    async function loadAllData() {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">Memuat data pagu &amp; jurnal...</td></tr>`;
        }
        if (cardBody) {
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Memuat data pagu &amp; jurnal...</div>`;
        }

        try {
            const paguQuery = query(collection(db, "pagu_anggaran"), orderBy("tahun", "desc"));
            const paguSnap = await getDocs(paguQuery);
            const loadedPagu = [];
            paguSnap.forEach((docSnap) => {
                const d = docSnap.data();
                const fallbackYear = Number(d.tahun) || new Date().getFullYear();
                const tahunMulai = Number(d.tahunMulai) || fallbackYear;
                const tahunSelesai = Number(d.tahunSelesai) || tahunMulai;
                loadedPagu.push({
                    id: docSnap.id,
                    unitUsaha: d.unitUsaha || "-",
                    tahun: fallbackYear,
                    tahunMulai,
                    tahunSelesai,
                    jumlahPagu: Number(d.jumlahPagu) || 0
                });
            });
            paguDocs = loadedPagu;
        } catch (err) {
            console.error("Gagal memuat koleksi pagu_anggaran:", err);
            paguDocs = [];
        }

        try {
            const jurnalSnap = await getDocs(collection(db, "jurnal_umum"));
            const loadedJurnal = [];
            jurnalSnap.forEach((docSnap) => {
                loadedJurnal.push({ id: docSnap.id, ...docSnap.data() });
            });
            jurnalDocs = loadedJurnal;
        } catch (err) {
            console.warn("Gagal memuat koleksi jurnal_umum:", err);
            jurnalDocs = [];
        }

        renderMonitoringView();
    }

    const onFilterChange = () => renderMonitoringView();
    const onResetClick = () => {
        if (filterUnitEl) filterUnitEl.value = "";
        if (filterPeriodeEl) filterPeriodeEl.value = "";
        if (filterStatusEl) filterStatusEl.value = "";
        renderMonitoringView();
    };
    const onRefreshClick = () => loadAllData();
    const onPrintClick = () => window.print();

    if (filterUnitEl) filterUnitEl.addEventListener("change", onFilterChange);
    if (filterPeriodeEl) filterPeriodeEl.addEventListener("change", onFilterChange);
    if (filterStatusEl) filterStatusEl.addEventListener("change", onFilterChange);
    if (btnResetFilter) btnResetFilter.addEventListener("click", onResetClick);
    if (btnRefresh) btnRefresh.addEventListener("click", onRefreshClick);
    if (btnCetak) btnCetak.addEventListener("click", onPrintClick);

    const cleanup = () => {
        if (filterUnitEl) filterUnitEl.removeEventListener("change", onFilterChange);
        if (filterPeriodeEl) filterPeriodeEl.removeEventListener("change", onFilterChange);
        if (filterStatusEl) filterStatusEl.removeEventListener("change", onFilterChange);
        if (btnResetFilter) btnResetFilter.removeEventListener("click", onResetClick);
        if (btnRefresh) btnRefresh.removeEventListener("click", onRefreshClick);
        if (btnCetak) btnCetak.removeEventListener("click", onPrintClick);
        window.removeEventListener("hashchange", cleanup);
        monitoringLaporanPaguCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    monitoringLaporanPaguCleanup = cleanup;

    loadAllData();

    return cleanup;
}