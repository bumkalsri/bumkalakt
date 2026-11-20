// File: assets/js/views/laporan-arus-kas.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const DEFAULT_UNIT = "KANTOR PUSAT (01)";

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function compareKodeAkun(a, b) {
    const segA = String(a ?? "").trim().split(".");
    const segB = String(b ?? "").trim().split(".");
    const maxLen = Math.max(segA.length, segB.length);

    for (let i = 0; i < maxLen; i++) {
        const partA = segA[i];
        const partB = segB[i];
        if (partA === undefined) return -1;
        if (partB === undefined) return 1;

        const numA = Number(partA);
        const numB = Number(partB);
        const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB) && partA.trim() !== "" && partB.trim() !== "";

        if (bothNumeric && numA !== numB) {
            return numA - numB;
        }
        const cmp = String(partA).localeCompare(String(partB), undefined, { numeric: true, sensitivity: "base" });
        if (cmp !== 0) return cmp;
    }
    return 0;
}

function isCashOrBankAccount(coa, kodeAkun) {
    const kode = String(kodeAkun || coa?.kodeAkun || "").trim();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const subKategori = String(coa?.subKategori || "").toLowerCase();
    const reportGroup = String(coa?.reportGroup || "").toLowerCase();

    return (
        kode.startsWith("1.01") ||
        kategori.includes("kas") ||
        kategori.includes("bank") ||
        subKategori.includes("kas") ||
        subKategori.includes("bank") ||
        reportGroup.includes("kas") ||
        nama.includes("kas ") ||
        nama.startsWith("kas") ||
        nama.includes("bank")
    );
}

function resolveCashFlowCategory(coa) {
    const raw = String(coa?.cashFlowGroup || coa?.arusKas || "").trim().toLowerCase();
    if (!raw || raw === "-") return "";
    if (raw.includes("operasi")) return "operasi";
    if (raw.includes("investasi")) return "investasi";
    if (raw.includes("pendanaan") || raw.includes("modal")) return "pendanaan";
    return "";
}

function normalizePeriodKey(val) {
    const s = String(val || "").trim();
    const m = s.match(/^(\d{4}-\d{2})/);
    return m ? m[1] : "";
}

function matchesUnitFilter(docUnitRaw, selectedUnit) {
    if (!selectedUnit) return true;
    const docUnit = String(docUnitRaw || "").trim();
    if (!docUnit) return selectedUnit === DEFAULT_UNIT;
    return docUnit === selectedUnit;
}

function formatRupiah(num) {
    const rounded = Math.round(Number(num) || 0);
    return (rounded < 0 ? "-Rp " : "Rp ") + Math.abs(rounded).toLocaleString("id-ID");
}

export function renderLaporanArusKas() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <a href="#/laporan" data-link title="Kembali ke Menu Laporan"
                        class="w-10 h-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Laporan Arus Kas (Cash Flow Statement)</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Rekapitulasi saldo awal kas, arus kas masuk/keluar per aktivitas, dan saldo kas akhir BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <button id="btn-cetak-arus-kas" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span>Cetak / Print Laporan</span>
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs items-end">
                <div class="min-w-0">
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div class="min-w-0">
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div class="min-w-0">
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div class="min-w-0">
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Arus Kas Bersih & Saldo Kas -->
            <div class="bg-indigo-900 text-white p-4 sm:p-6 rounded-none shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div class="min-w-0">
                        <p class="text-[11px] sm:text-xs uppercase tracking-widest text-indigo-200 font-semibold">Kenaikan / Penurunan Kas Bersih</p>
                        <h2 id="summary-kas-bersih" class="text-xl sm:text-2xl font-extrabold mt-1 break-words">Rp 0</h2>
                    </div>
                    <div>
                        <span id="badge-arus-kas" class="inline-block px-3 py-1 bg-indigo-800 text-indigo-100 font-bold text-xs uppercase rounded-none">Menunggu Proses</span>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-800/80 text-xs">
                    <div class="bg-indigo-950/60 border border-indigo-800 p-3 rounded-none min-w-0">
                        <span class="block text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Saldo Kas Awal (Saldo Awal)</span>
                        <span id="summary-saldo-awal-kas" class="text-sm font-bold text-white mt-0.5 block break-words">Rp 0</span>
                    </div>
                    <div class="bg-indigo-950/60 border border-indigo-800 p-3 rounded-none min-w-0">
                        <span class="block text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Mutasi Kas Bersih Periode</span>
                        <span id="summary-mutasi-kas" class="text-sm font-bold text-emerald-300 mt-0.5 block break-words">Rp 0</span>
                    </div>
                    <div class="bg-indigo-950/60 border border-indigo-800 p-3 rounded-none min-w-0">
                        <span class="block text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">Saldo Kas Akhir</span>
                        <span id="summary-saldo-akhir-kas" class="text-sm font-bold text-amber-300 mt-0.5 block break-words">Rp 0</span>
                    </div>
                </div>
            </div>

            <!-- Rincian Saldo Awal Kas & Bank -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                    <span class="break-words">SALDO AWAL KAS &amp; BANK (SUMBER: SALDO AWAL)</span>
                    <span id="total-saldo-awal-kas" class="text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Rp 0</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Nama Akun Kas / Bank</th>
                                <th class="py-2.5 px-4 font-semibold w-36">Periode / Basis</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-44">Saldo Awal (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-saldo-awal-kas-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="4" class="py-6 text-center text-slate-400">Memuat data saldo awal kas...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Konten Laporan (Operasi, Investasi, Pendanaan) -->
            <div class="space-y-6">
                <!-- I. Aktivitas Operasi -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <span>I. ARUS KAS DARI AKTIVITAS OPERASI</span>
                        <span id="total-operasi" class="text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Rp 0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                    <th class="py-2.5 px-4 font-semibold">Nama Akun Operasional</th>
                                    <th class="py-2.5 px-4 font-semibold text-right w-44">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody id="table-operasi-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="3" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- II. Aktivitas Investasi -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <span>II. ARUS KAS DARI AKTIVITAS INVESTASI</span>
                        <span id="total-investasi" class="text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Rp 0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                    <th class="py-2.5 px-4 font-semibold">Nama Akun Investasi</th>
                                    <th class="py-2.5 px-4 font-semibold text-right w-44">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody id="table-investasi-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="3" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- III. Aktivitas Pendanaan -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                        <span>III. ARUS KAS DARI AKTIVITAS PENDANAAN</span>
                        <span id="total-pendanaan" class="text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Rp 0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                    <th class="py-2.5 px-4 font-semibold">Nama Akun Pendanaan</th>
                                    <th class="py-2.5 px-4 font-semibold text-right w-44">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody id="table-pendanaan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="3" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let arusKasCleanup = null;

export function initLaporanArusKasHandler() {
    if (typeof arusKasCleanup === "function") {
        arusKasCleanup();
        arusKasCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-arus-kas');

    const tableSaldoAwalKasBody = document.getElementById('table-saldo-awal-kas-body');
    const totalSaldoAwalKasEl = document.getElementById('total-saldo-awal-kas');
    const summarySaldoAwalKasEl = document.getElementById('summary-saldo-awal-kas');
    const summaryMutasiKasEl = document.getElementById('summary-mutasi-kas');
    const summarySaldoAkhirKasEl = document.getElementById('summary-saldo-akhir-kas');

    const tableOperasiBody = document.getElementById('table-operasi-body');
    const tableInvestasiBody = document.getElementById('table-investasi-body');
    const tablePendanaanBody = document.getElementById('table-pendanaan-body');

    const totalOperasiEl = document.getElementById('total-operasi');
    const totalInvestasiEl = document.getElementById('total-investasi');
    const totalPendanaanEl = document.getElementById('total-pendanaan');
    const summaryKasBersih = document.getElementById('summary-kas-bersih');
    const badgeArusKas = document.getElementById('badge-arus-kas');

    let coaByKode = {};
    let allJurnalList = [];
    let allSaldoAwalList = [];

    async function loadData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaByKode = {};
            snapCoa.forEach(docSnap => {
                const d = docSnap.data();
                const kode = String(d.kodeAkun || "").trim();
                if (kode) {
                    coaByKode[kode] = { id: docSnap.id, ...d };
                }
            });

            const snapSaldoAwal = await getDocs(collection(db, "saldo_awal"));
            allSaldoAwalList = [];
            snapSaldoAwal.forEach(docSnap => {
                allSaldoAwalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allJurnalList = [];
            snapJurnal.forEach(docSnap => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            prosesArusKas();
        } catch (err) {
            console.error("Gagal memuat data laporan arus kas:", err);
            if (tableSaldoAwalKasBody) tableSaldoAwalKasBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-red-500">Gagal memuat data saldo awal.</td></tr>`;
            if (tableOperasiBody) tableOperasiBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tableInvestasiBody) tableInvestasiBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tablePendanaanBody) tablePendanaanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function hitungSaldoAwalKas(unitVal, tglMulaiVal, tglSampaiVal) {
        const endPeriod = normalizePeriodKey(tglSampaiVal);
        const byKode = {};

        allSaldoAwalList.forEach(item => {
            if (!matchesUnitFilter(item.unitUsaha, unitVal)) return;

            const kode = String(item.kodeAkun || "").trim();
            if (!kode || !isCashOrBankAccount(coaByKode[kode], kode)) return;

            const periode = normalizePeriodKey(item.periode);
            if (endPeriod && periode && periode > endPeriod) return;

            const coa = coaByKode[kode];
            const debit = parseFloat(item.debit) || 0;
            const kredit = parseFloat(item.kredit) || 0;
            const saldoNormal = String(item.saldoNormal || coa?.saldoNormal || "Debit").toLowerCase();
            const saldo = saldoNormal.includes("kredit") ? (kredit - debit) : (debit - kredit);

            if (!byKode[kode]) {
                byKode[kode] = {
                    kodeAkun: kode,
                    namaAkun: coa?.namaAkun || item.namaAkun || kode,
                    periodeLabel: periode || "-",
                    jumlah: 0
                };
            }
            byKode[kode].jumlah += saldo;
            if (periode) {
                byKode[kode].periodeLabel = periode;
            }
        });

        if (tglMulaiVal) {
            allJurnalList.forEach(item => {
                if (!matchesUnitFilter(item.unitUsaha, unitVal)) return;
                if (!item.tglTransaksi || item.tglTransaksi >= tglMulaiVal) return;

                const rincian = Array.isArray(item.rincian) ? item.rincian : [];
                rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (!kode || !isCashOrBankAccount(coaByKode[kode], kode)) return;

                    const d = parseFloat(r.debet) || 0;
                    const k = parseFloat(r.kredit) || 0;
                    const netCash = d - k;
                    if (netCash === 0) return;

                    const coa = coaByKode[kode];
                    if (!byKode[kode]) {
                        byKode[kode] = {
                            kodeAkun: kode,
                            namaAkun: coa?.namaAkun || r.namaAkun || kode,
                            periodeLabel: `s/d ${tglMulaiVal}`,
                            jumlah: 0
                        };
                    }
                    byKode[kode].jumlah += netCash;
                });
            });
        }

        return Object.values(byKode)
            .filter(r => r.jumlah !== 0)
            .sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));
    }

    function prosesArusKas() {
        if (!tableOperasiBody || !tableInvestasiBody || !tablePendanaanBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";

        const saldoAwalKasList = hitungSaldoAwalKas(unitVal, tglMulaiVal, tglSampaiVal);
        const totalSaldoAwalKas = saldoAwalKasList.reduce((acc, r) => acc + r.jumlah, 0);

        const buckets = {
            operasi: {},
            investasi: {},
            pendanaan: {}
        };

        allJurnalList.forEach(item => {
            if (!matchesUnitFilter(item.unitUsaha, unitVal)) return;
            if (tglMulaiVal && item.tglTransaksi && item.tglTransaksi < tglMulaiVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            const rincian = Array.isArray(item.rincian) ? item.rincian : [];
            if (rincian.length === 0) return;

            const cashLines = rincian.filter(r => {
                const kode = String(r.kodeAkun || "").trim();
                return isCashOrBankAccount(coaByKode[kode], kode);
            });

            const nonCashLines = rincian.filter(r => !cashLines.includes(r));

            if (cashLines.length > 0 && nonCashLines.length > 0) {
                const netCashImpact = cashLines.reduce((acc, r) => {
                    const d = parseFloat(r.debet) || 0;
                    const k = parseFloat(r.kredit) || 0;
                    return acc + (d - k);
                }, 0);

                if (netCashImpact === 0) return;

                const targetLine = nonCashLines[0];
                const targetKode = String(targetLine.kodeAkun || "").trim();
                const targetCoa = coaByKode[targetKode];
                const kategori = resolveCashFlowCategory(targetCoa);

                if (kategori && buckets[kategori]) {
                    if (!buckets[kategori][targetKode]) {
                        buckets[kategori][targetKode] = {
                            kodeAkun: targetKode,
                            namaAkun: targetCoa?.namaAkun || targetLine.namaAkun || targetKode,
                            jumlah: 0
                        };
                    }
                    buckets[kategori][targetKode].jumlah += netCashImpact;
                }
            }
        });

        const toSortedActiveList = (mapObj) =>
            Object.values(mapObj)
                .filter(row => row.jumlah !== 0)
                .sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));

        const listOperasi = toSortedActiveList(buckets.operasi);
        const listInvestasi = toSortedActiveList(buckets.investasi);
        const listPendanaan = toSortedActiveList(buckets.pendanaan);

        const sumOperasi = listOperasi.reduce((acc, r) => acc + r.jumlah, 0);
        const sumInvestasi = listInvestasi.reduce((acc, r) => acc + r.jumlah, 0);
        const sumPendanaan = listPendanaan.reduce((acc, r) => acc + r.jumlah, 0);
        const totalMutasiKas = sumOperasi + sumInvestasi + sumPendanaan;
        const saldoKasAkhir = totalSaldoAwalKas + totalMutasiKas;

        if (totalSaldoAwalKasEl) totalSaldoAwalKasEl.textContent = formatRupiah(totalSaldoAwalKas);
        if (summarySaldoAwalKasEl) summarySaldoAwalKasEl.textContent = formatRupiah(totalSaldoAwalKas);
        if (summaryMutasiKasEl) summaryMutasiKasEl.textContent = formatRupiah(totalMutasiKas);
        if (summarySaldoAkhirKasEl) summarySaldoAkhirKasEl.textContent = formatRupiah(saldoKasAkhir);

        if (totalOperasiEl) totalOperasiEl.textContent = formatRupiah(sumOperasi);
        if (totalInvestasiEl) totalInvestasiEl.textContent = formatRupiah(sumInvestasi);
        if (totalPendanaanEl) totalPendanaanEl.textContent = formatRupiah(sumPendanaan);
        if (summaryKasBersih) summaryKasBersih.textContent = formatRupiah(saldoKasAkhir);

        if (badgeArusKas) {
            if (saldoKasAkhir > 0) {
                badgeArusKas.textContent = "Surplus Kas";
                badgeArusKas.className = "inline-block px-3 py-1 bg-emerald-600 text-white font-bold text-xs uppercase rounded-none";
            } else if (saldoKasAkhir < 0) {
                badgeArusKas.textContent = "Defisit Kas";
                badgeArusKas.className = "inline-block px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase rounded-none";
            } else {
                badgeArusKas.textContent = "Impas (Zero)";
                badgeArusKas.className = "inline-block px-3 py-1 bg-amber-600 text-white font-bold text-xs uppercase rounded-none";
            }
        }

        if (tableSaldoAwalKasBody) {
            if (saldoAwalKasList.length === 0) {
                tableSaldoAwalKasBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-400">Tidak ada data saldo awal kas/bank pada periode ini.</td></tr>`;
            } else {
                tableSaldoAwalKasBody.innerHTML = saldoAwalKasList.map(row => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">${escapeHtml(row.kodeAkun)}</td>
                        <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${escapeHtml(row.namaAkun)}</td>
                        <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${escapeHtml(row.periodeLabel)}</td>
                        <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">${escapeHtml(formatRupiah(row.jumlah))}</td>
                    </tr>
                `).join("");
            }
        }

        const renderRows = (list, element) => {
            if (list.length === 0) {
                element.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-slate-400">Tidak ada data transaksi pada aktivitas ini.</td></tr>`;
            } else {
                let html = "";
                list.forEach(item => {
                    html += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">${escapeHtml(item.kodeAkun)}</td>
                            <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${escapeHtml(item.namaAkun)}</td>
                            <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">${escapeHtml(formatRupiah(item.jumlah))}</td>
                        </tr>
                    `;
                });
                element.innerHTML = html;
            }
        };

        renderRows(listOperasi, tableOperasiBody);
        renderRows(listInvestasi, tableInvestasiBody);
        renderRows(listPendanaan, tablePendanaanBody);
    }

    const onTampilkanClick = () => prosesArusKas();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        arusKasCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    arusKasCleanup = cleanup;

    loadData();

    return cleanup;
}