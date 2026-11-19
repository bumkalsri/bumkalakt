// File: assets/js/views/laporan-neraca.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function isDetailAccount(coa) {
    const level = String(coa?.levelAkun || "").trim();
    const tipe = String(coa?.tipeAkun || "").trim().toLowerCase();
    return level === "4" || tipe === "detail";
}

function classifyBalanceAccount(coa) {
    const reportGroup = String(coa?.reportGroup || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const subKategori = String(coa?.subKategori || "").toLowerCase();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kode = String(coa?.kodeAkun || "").trim();

    if (
        reportGroup.includes("aset") ||
        reportGroup.includes("aktiva") ||
        kategori.includes("aset") ||
        kategori.includes("aktiva") ||
        kode.startsWith("1")
    ) {
        const isAsetTetap =
            subKategori.includes("tetap") ||
            kategori.includes("aset tetap") ||
            kategori.includes("aktiva tetap") ||
            nama.includes("tanah") ||
            nama.includes("bangunan") ||
            nama.includes("kendaraan") ||
            nama.includes("peralatan") ||
            nama.includes("inventaris") ||
            nama.includes("mesin") ||
            nama.includes("akumulasi penyusutan") ||
            nama.includes("akumulasi depresiasi") ||
            kode.startsWith("1.02") ||
            kode.startsWith("1.2") ||
            kode.startsWith("1.04") ||
            kode.startsWith("1.4");

        return {
            section: "aset",
            subGroup: isAsetTetap ? "aset_tetap" : "aset_lancar"
        };
    }

    if (
        reportGroup.includes("kewajiban") ||
        reportGroup.includes("liabilitas") ||
        reportGroup.includes("hutang") ||
        reportGroup.includes("utang") ||
        kategori.includes("kewajiban") ||
        kategori.includes("liabilitas") ||
        kategori.includes("hutang") ||
        kategori.includes("utang") ||
        kode.startsWith("2")
    ) {
        return {
            section: "kewajiban",
            subGroup: (
                subKategori.includes("jangka panjang") ||
                nama.includes("jangka panjang") ||
                kode.startsWith("2.02") ||
                kode.startsWith("2.2")
            )
                ? "kewajiban_panjang"
                : "kewajiban_pendek"
        };
    }

    if (
        reportGroup.includes("modal") ||
        reportGroup.includes("ekuitas") ||
        kategori.includes("modal") ||
        kategori.includes("ekuitas") ||
        kode.startsWith("3")
    ) {
        return {
            section: "ekuitas",
            subGroup: "ekuitas"
        };
    }

    if (
        reportGroup.includes("laba") ||
        reportGroup.includes("rugi") ||
        reportGroup.includes("pendapatan") ||
        reportGroup.includes("beban") ||
        reportGroup.includes("biaya") ||
        kategori.includes("pendapatan") ||
        kategori.includes("beban") ||
        kategori.includes("biaya") ||
        kode.startsWith("4") ||
        kode.startsWith("5") ||
        kode.startsWith("6") ||
        kode.startsWith("7")
    ) {
        const isPendapatan =
            reportGroup.includes("pendapatan") ||
            nama.includes("pendapatan") ||
            nama.includes("penjualan") ||
            kategori.includes("pendapatan") ||
            kode.startsWith("4");

        return {
            section: "laba_rugi",
            subGroup: isPendapatan ? "pendapatan" : "beban"
        };
    }

    return null;
}

export function renderLaporanNeraca() {
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan Neraca (Balance Sheet)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Laporan posisi keuangan aset, kewajiban, dan ekuitas BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-neraca" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-end">
                <div>
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PER PERIODE TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Neraca</button>
                </div>
            </div>

            <!-- Status Balance & Ringkasan -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-slate-700 dark:text-slate-300">Status Keseimbangan Neraca:</span>
                    <span id="status-balance-badge" class="px-3 py-1 font-bold uppercase rounded-none bg-slate-200 text-slate-700">Menunggu Proses</span>
                </div>
                <div id="summary-neraca-info" class="font-bold text-slate-600 dark:text-slate-400">
                    Total Aset: Rp 0 | Kewajiban + Ekuitas: Rp 0 | Selisih: Rp 0
                </div>
            </div>

            <!-- Grid Utama Neraca: Kiri (Aset) & Kanan (Kewajiban + Ekuitas) Sejajar -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <!-- KOLOM KIRI: ASET -->
                <div class="flex flex-col">
                    <div class="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                            <span>ASET (ASSETS)</span>
                            <span id="header-total-aset" class="text-indigo-600 dark:text-indigo-400">Rp 0</span>
                        </div>

                        <!-- Tampilan Desktop -->
                        <div class="hidden md:flex flex-1 flex-col justify-between overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/60 dark:bg-slate-950/60">
                                        <th class="py-2.5 px-4 font-semibold w-28">Kode</th>
                                        <th class="py-2.5 px-4 font-semibold">Nama Akun Aset</th>
                                        <th class="py-2.5 px-4 font-semibold text-right w-40">Saldo (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody id="table-aset-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr><td colspan="3" class="py-8 text-center text-slate-400">Memuat data neraca...</td></tr>
                                </tbody>
                            </table>

                            <table class="w-full text-left border-collapse text-xs mt-auto">
                                <tfoot>
                                    <tr class="bg-slate-100 dark:bg-slate-800/80 font-extrabold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                        <td class="py-3.5 px-4 text-right uppercase">Total Aset :</td>
                                        <td id="footer-total-aset" class="py-3.5 px-4 text-right text-indigo-600 dark:text-indigo-400 w-40">Rp 0</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Tampilan Mobile -->
                        <div id="card-aset-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <div class="p-6 text-center text-slate-400 text-xs">Memuat data neraca...</div>
                        </div>
                    </div>
                </div>

                <!-- KOLOM KANAN: KEWAJIBAN & EKUITAS -->
                <div class="flex flex-col gap-6">
                    <!-- Kewajiban -->
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                            <span>KEWAJIBAN / LIABILITAS</span>
                            <span id="header-total-kewajiban" class="text-rose-600 dark:text-rose-400">Rp 0</span>
                        </div>

                        <!-- Tampilan Desktop -->
                        <div class="hidden md:block overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/60 dark:bg-slate-950/60">
                                        <th class="py-2.5 px-4 font-semibold w-28">Kode</th>
                                        <th class="py-2.5 px-4 font-semibold">Nama Akun Kewajiban</th>
                                        <th class="py-2.5 px-4 font-semibold text-right w-40">Saldo (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody id="table-kewajiban-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr><td colspan="3" class="py-6 text-center text-slate-400">Memuat data neraca...</td></tr>
                                </tbody>
                                <tfoot>
                                    <tr class="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                                        <td colspan="2" class="py-3 px-4 text-right uppercase">Total Kewajiban :</td>
                                        <td id="footer-total-kewajiban" class="py-3 px-4 text-right">Rp 0</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Tampilan Mobile -->
                        <div id="card-kewajiban-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <div class="p-6 text-center text-slate-400 text-xs">Memuat data neraca...</div>
                        </div>
                    </div>

                    <!-- Ekuitas / Modal -->
                    <div class="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                        <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                            <span>EKUITAS / MODAL</span>
                            <span id="header-total-ekuitas" class="text-emerald-600 dark:text-emerald-400">Rp 0</span>
                        </div>

                        <!-- Tampilan Desktop -->
                        <div class="hidden md:flex flex-1 flex-col justify-between overflow-x-auto">
                            <table class="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/60 dark:bg-slate-950/60">
                                        <th class="py-2.5 px-4 font-semibold w-28">Kode</th>
                                        <th class="py-2.5 px-4 font-semibold">Nama Akun Ekuitas</th>
                                        <th class="py-2.5 px-4 font-semibold text-right w-40">Saldo (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody id="table-ekuitas-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr><td colspan="3" class="py-6 text-center text-slate-400">Memuat data neraca...</td></tr>
                                </tbody>
                            </table>

                            <table class="w-full text-left border-collapse text-xs mt-auto">
                                <tfoot>
                                    <tr class="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                                        <td class="py-3 px-4 text-right uppercase">Total Ekuitas :</td>
                                        <td id="footer-total-ekuitas" class="py-3 px-4 text-right w-40">Rp 0</td>
                                    </tr>
                                    <tr class="bg-slate-100 dark:bg-slate-800/80 font-extrabold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                        <td class="py-3.5 px-4 text-right uppercase">Total Kewajiban &amp; Ekuitas :</td>
                                        <td id="footer-total-pasiva" class="py-3.5 px-4 text-right text-indigo-600 dark:text-indigo-400 w-40">Rp 0</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Tampilan Mobile -->
                        <div id="card-ekuitas-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <div class="p-6 text-center text-slate-400 text-xs">Memuat data neraca...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let neracaCleanup = null;

export function initLaporanNeracaHandler() {
    if (typeof neracaCleanup === "function") {
        neracaCleanup();
        neracaCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-neraca');

    const statusBalanceBadge = document.getElementById('status-balance-badge');
    const summaryNeracaInfo = document.getElementById('summary-neraca-info');

    const headerTotalAset = document.getElementById('header-total-aset');
    const footerTotalAset = document.getElementById('footer-total-aset');
    const tableAsetBody = document.getElementById('table-aset-body');
    const cardAsetBody = document.getElementById('card-aset-body');

    const headerTotalKewajiban = document.getElementById('header-total-kewajiban');
    const footerTotalKewajiban = document.getElementById('footer-total-kewajiban');
    const tableKewajibanBody = document.getElementById('table-kewajiban-body');
    const cardKewajibanBody = document.getElementById('card-kewajiban-body');

    const headerTotalEkuitas = document.getElementById('header-total-ekuitas');
    const footerTotalEkuitas = document.getElementById('footer-total-ekuitas');
    const footerTotalPasiva = document.getElementById('footer-total-pasiva');
    const tableEkuitasBody = document.getElementById('table-ekuitas-body');
    const cardEkuitasBody = document.getElementById('card-ekuitas-body');

    let coaList = [];
    let saldoAwalList = [];
    let allJurnalList = [];

    async function loadData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaList = [];
            snapCoa.forEach(docSnap => {
                coaList.push({ id: docSnap.id, ...docSnap.data() });
            });

            try {
                const snapSaldo = await getDocs(collection(db, "saldo_awal"));
                saldoAwalList = [];
                snapSaldo.forEach(docSnap => {
                    saldoAwalList.push({ id: docSnap.id, ...docSnap.data() });
                });
            } catch (saldoErr) {
                console.warn("Gagal memuat saldo_awal:", saldoErr);
                saldoAwalList = [];
            }

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allJurnalList = [];
            snapJurnal.forEach(docSnap => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            prosesNeraca();
        } catch (err) {
            console.error("Gagal memuat data laporan neraca:", err);
            if (tableAsetBody) tableAsetBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tableKewajibanBody) tableKewajibanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tableEkuitasBody) tableEkuitasBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderSectionRows(rows, tableEl, cardEl, emptyText) {
        if (!tableEl || !cardEl) return;

        if (!rows || rows.length === 0) {
            tableEl.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-slate-400">${emptyText}</td></tr>`;
            cardEl.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">${emptyText}</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        rows.forEach(row => {
            if (row.isSubHeader) {
                htmlTable += `
                    <tr class="bg-slate-50/80 dark:bg-slate-950/60 font-bold text-slate-700 dark:text-slate-300">
                        <td colspan="3" class="py-2 px-4 text-[11px] uppercase tracking-wider">${row.label}</td>
                    </tr>
                `;
                htmlCard += `
                    <div class="px-4 py-2 bg-slate-50 dark:bg-slate-950 font-bold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        ${row.label}
                    </div>
                `;
                return;
            }

            const saldoFormatted = row.saldo < 0
                ? `(-) Rp ${Math.abs(row.saldo).toLocaleString('id-ID')}`
                : `Rp ${row.saldo.toLocaleString('id-ID')}`;

            const valueClass = row.saldo < 0
                ? "text-rose-600 dark:text-rose-400"
                : row.saldo === 0
                    ? "text-slate-500 dark:text-slate-400"
                    : "text-slate-800 dark:text-slate-100";

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${row.isCalculated ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold' : ''}">
                    <td class="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">${row.kodeAkun}</td>
                    <td class="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">${row.namaAkun}</td>
                    <td class="py-2.5 px-4 text-right font-semibold ${valueClass}">${saldoFormatted}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs">
                    <div class="min-w-0">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${row.kodeAkun}</div>
                        <div class="font-medium text-slate-800 dark:text-slate-200 truncate">${row.namaAkun}</div>
                    </div>
                    <div class="font-semibold text-right flex-shrink-0 ${valueClass}">
                        ${saldoFormatted}
                    </div>
                </div>
            `;
        });

        tableEl.innerHTML = htmlTable;
        cardEl.innerHTML = htmlCard;
    }

    function prosesNeraca() {
        const unitVal = filterUnit ? filterUnit.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        const akunMap = {};

        coaList.forEach(coa => {
            if (!isDetailAccount(coa)) return;
            const kode = String(coa.kodeAkun || "").trim();
            if (!kode) return;

            const cls = classifyBalanceAccount(coa);
            if (!cls) return;

            akunMap[kode] = {
                kodeAkun: kode,
                namaAkun: coa.namaAkun || "-",
                section: cls.section,
                subGroup: cls.subGroup,
                normalBalance: String(coa.normalBalance || coa.saldoNormal || "").trim().toLowerCase(),
                totalDebet: 0,
                totalKredit: 0
            };
        });

        saldoAwalList.forEach(sa => {
            if (unitVal && sa.unitUsaha && sa.unitUsaha !== unitVal) return;
            if (periodeSampai && sa.periode && String(sa.periode) > periodeSampai) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (akunMap[kode]) {
                akunMap[kode].totalDebet += parseFloat(sa.debit) || 0;
                akunMap[kode].totalKredit += parseFloat(sa.kredit) || 0;
            }
        });

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            if (Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (akunMap[kode]) {
                        akunMap[kode].totalDebet += parseFloat(r.debet) || 0;
                        akunMap[kode].totalKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        const asetLancar = [];
        const asetTetap = [];
        const kewajibanPendek = [];
        const kewajibanPanjang = [];
        const ekuitasList = [];

        let totalAset = 0;
        let totalKewajiban = 0;
        let totalEkuitas = 0;
        let totalPendapatan = 0;
        let totalBeban = 0;

        Object.values(akunMap)
            .sort((a, b) => String(a.kodeAkun).localeCompare(String(b.kodeAkun)))
            .forEach(acc => {
                const debitNet = acc.totalDebet - acc.totalKredit;
                const kreditNet = acc.totalKredit - acc.totalDebet;

                if (acc.section === "aset") {
                    const isContra = acc.normalBalance === "kredit" || acc.namaAkun.toLowerCase().includes("akumulasi");
                    const saldo = isContra ? -kreditNet : debitNet;
                    totalAset += saldo;
                    const row = { kodeAkun: acc.kodeAkun, namaAkun: acc.namaAkun, saldo };
                    if (acc.subGroup === "aset_tetap") asetTetap.push(row);
                    else asetLancar.push(row);
                } else if (acc.section === "kewajiban") {
                    const isContra = acc.normalBalance === "debet";
                    const saldo = isContra ? -debitNet : kreditNet;
                    totalKewajiban += saldo;
                    const row = { kodeAkun: acc.kodeAkun, namaAkun: acc.namaAkun, saldo };
                    if (acc.subGroup === "kewajiban_panjang") kewajibanPanjang.push(row);
                    else kewajibanPendek.push(row);
                } else if (acc.section === "ekuitas") {
                    const isContra = acc.normalBalance === "debet" || acc.namaAkun.toLowerCase().includes("prive");
                    const saldo = isContra ? -debitNet : kreditNet;
                    totalEkuitas += saldo;
                    ekuitasList.push({ kodeAkun: acc.kodeAkun, namaAkun: acc.namaAkun, saldo });
                } else if (acc.section === "laba_rugi") {
                    if (acc.subGroup === "pendapatan") totalPendapatan += kreditNet;
                    else totalBeban += debitNet;
                }
            });

        const labaRugiBersih = totalPendapatan - totalBeban;
        totalEkuitas += labaRugiBersih;

        const asetRows = [];
        if (asetLancar.length > 0) {
            asetRows.push({ isSubHeader: true, label: "Aset Lancar" });
            asetRows.push(...asetLancar);
        }
        if (asetTetap.length > 0) {
            asetRows.push({ isSubHeader: true, label: "Aset Tetap" });
            asetRows.push(...asetTetap);
        }

        const kewajibanRows = [];
        if (kewajibanPendek.length > 0) {
            kewajibanRows.push({ isSubHeader: true, label: "Kewajiban Jangka Pendek" });
            kewajibanRows.push(...kewajibanPendek);
        }
        if (kewajibanPanjang.length > 0) {
            kewajibanRows.push({ isSubHeader: true, label: "Kewajiban Jangka Panjang" });
            kewajibanRows.push(...kewajibanPanjang);
        }

        const ekuitasRows = [...ekuitasList];
        ekuitasRows.push({
            kodeAkun: "LR-BJM",
            namaAkun: labaRugiBersih >= 0 ? "Laba Bersih Periode Berjalan" : "Rugi Bersih Periode Berjalan",
            saldo: labaRugiBersih,
            isCalculated: true
        });

        const totalPasiva = totalKewajiban + totalEkuitas;
        const selisih = Math.abs(totalAset - totalPasiva);

        if (headerTotalAset) headerTotalAset.textContent = `Rp ${totalAset.toLocaleString('id-ID')}`;
        if (footerTotalAset) footerTotalAset.textContent = `Rp ${totalAset.toLocaleString('id-ID')}`;

        if (headerTotalKewajiban) headerTotalKewajiban.textContent = `Rp ${totalKewajiban.toLocaleString('id-ID')}`;
        if (footerTotalKewajiban) footerTotalKewajiban.textContent = `Rp ${totalKewajiban.toLocaleString('id-ID')}`;

        if (headerTotalEkuitas) headerTotalEkuitas.textContent = `Rp ${totalEkuitas.toLocaleString('id-ID')}`;
        if (footerTotalEkuitas) footerTotalEkuitas.textContent = `Rp ${totalEkuitas.toLocaleString('id-ID')}`;
        if (footerTotalPasiva) footerTotalPasiva.textContent = `Rp ${totalPasiva.toLocaleString('id-ID')}`;

        if (summaryNeracaInfo) {
            summaryNeracaInfo.textContent = `Total Aset: Rp ${totalAset.toLocaleString('id-ID')} | Kewajiban + Ekuitas: Rp ${totalPasiva.toLocaleString('id-ID')} | Selisih: Rp ${selisih.toLocaleString('id-ID')}`;
        }

        if (statusBalanceBadge) {
            if (totalAset === 0 && totalPasiva === 0) {
                statusBalanceBadge.textContent = "Belum Ada Saldo";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-slate-200 text-slate-700";
            } else if (selisih === 0) {
                statusBalanceBadge.textContent = "Balance (Seimbang)";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-emerald-600 text-white";
            } else {
                statusBalanceBadge.textContent = "Tidak Balance";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-rose-500 text-white";
            }
        }

        renderSectionRows(asetRows, tableAsetBody, cardAsetBody, "Belum ada akun aset Level 4 / Detail di master COA.");
        renderSectionRows(kewajibanRows, tableKewajibanBody, cardKewajibanBody, "Belum ada akun kewajiban Level 4 / Detail di master COA.");
        renderSectionRows(ekuitasRows, tableEkuitasBody, cardEkuitasBody, "Belum ada akun ekuitas Level 4 / Detail di master COA.");
    }

    const onTampilkanClick = () => prosesNeraca();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        neracaCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    neracaCleanup = cleanup;

    loadData();

    return cleanup;
}