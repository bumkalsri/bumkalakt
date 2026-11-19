// File: assets/js/views/monitoring-keuangan.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function isLevel4Account(coa) {
    const level = String(coa?.levelAkun ?? coa?.level ?? "").trim();
    const tipe = String(coa?.tipeAkun ?? coa?.tipe ?? "").trim().toLowerCase();
    return level === "4" || tipe === "detail";
}

function isKasOrBankAccount(coa) {
    if (!isLevel4Account(coa)) return false;

    const kode = String(coa?.kodeAkun || "").trim();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const subKategori = String(coa?.subKategori || "").toLowerCase();

    return (
        kode.startsWith("1.01") ||
        kode.startsWith("1.1") ||
        nama.includes("kas") ||
        nama.includes("bank") ||
        kategori.includes("kas") ||
        subKategori.includes("kas")
    );
}

export function renderMonitoringKeuangan() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                    <a href="#/monitoring" data-link title="Kembali ke Menu Monitoring"
                        class="w-10 h-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Monitoring Laporan Keuangan</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Rekapitulasi kas masuk, kas keluar, dan mutasi saldo kas per unit usaha BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-monitoring-keuangan" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
                <div>
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-emerald-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-emerald-600">
                </div>
                <div>
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-emerald-600">
                </div>
                <div>
                    <button id="btn-tampilkan" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Ringkasan Kas & Bank -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase">Saldo Awal Kas &amp; Bank</p>
                    <p id="mk-saldo-awal" class="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Kas Masuk</p>
                    <p id="mk-kas-masuk" class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Kas Keluar</p>
                    <p id="mk-kas-keluar" class="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-1">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase">Saldo Akhir Kas &amp; Bank</p>
                    <p id="mk-saldo-akhir" class="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">Rp 0</p>
                </div>
            </div>

            <!-- Rekapitulasi Akun Kas & Bank (Level 4) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>REKAPITULASI MUTASI AKUN KAS &amp; BANK (LEVEL 4)</span>
                    <span id="mk-periode-label" class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Semua Unit • Seluruh Periode</span>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/60 dark:bg-slate-950/60">
                                <th class="py-2.5 px-4 font-semibold w-28">Kode</th>
                                <th class="py-2.5 px-4 font-semibold">Nama Akun Kas / Bank</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Saldo Awal</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Kas Masuk</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Kas Keluar</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-40">Saldo Akhir</th>
                            </tr>
                        </thead>
                        <tbody id="mk-rekap-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data kas &amp; bank...</td></tr>
                        </tbody>
                        <tfoot>
                            <tr class="bg-slate-100 dark:bg-slate-800/80 font-extrabold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <td colspan="2" class="py-3.5 px-4 text-right uppercase">Total Kas &amp; Bank :</td>
                                <td id="mk-foot-awal" class="py-3.5 px-4 text-right">Rp 0</td>
                                <td id="mk-foot-masuk" class="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400">Rp 0</td>
                                <td id="mk-foot-keluar" class="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400">Rp 0</td>
                                <td id="mk-foot-akhir" class="py-3.5 px-4 text-right text-indigo-600 dark:text-indigo-400">Rp 0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="mk-rekap-card" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div class="p-6 text-center text-slate-400">Memuat data kas &amp; bank...</div>
                </div>
            </div>

            <!-- Rincian Transaksi Kas Masuk & Kas Keluar -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>RINCIAN TRANSAKSI KAS MASUK &amp; KAS KELUAR</span>
                    <span id="mk-tx-count" class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">0 transaksi</span>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50/60 dark:bg-slate-950/60">
                                <th class="py-2.5 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-2.5 px-4 font-semibold w-36">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Uraian Transaksi</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Kas Masuk</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Kas Keluar</th>
                            </tr>
                        </thead>
                        <tbody id="mk-tx-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="5" class="py-8 text-center text-slate-400">Memuat rincian transaksi...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="mk-tx-card" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div class="p-6 text-center text-slate-400">Memuat rincian transaksi...</div>
                </div>
            </div>
        </div>
    `;
}

let monitoringKeuanganCleanup = null;

export function initMonitoringKeuanganHandler() {
    if (typeof monitoringKeuanganCleanup === "function") {
        monitoringKeuanganCleanup();
        monitoringKeuanganCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-monitoring-keuangan');

    const saldoAwalEl = document.getElementById('mk-saldo-awal');
    const kasMasukEl = document.getElementById('mk-kas-masuk');
    const kasKeluarEl = document.getElementById('mk-kas-keluar');
    const saldoAkhirEl = document.getElementById('mk-saldo-akhir');
    const periodeLabelEl = document.getElementById('mk-periode-label');

    const rekapBody = document.getElementById('mk-rekap-body');
    const rekapCard = document.getElementById('mk-rekap-card');
    const footAwal = document.getElementById('mk-foot-awal');
    const footMasuk = document.getElementById('mk-foot-masuk');
    const footKeluar = document.getElementById('mk-foot-keluar');
    const footAkhir = document.getElementById('mk-foot-akhir');

    const txBody = document.getElementById('mk-tx-body');
    const txCard = document.getElementById('mk-tx-card');
    const txCountEl = document.getElementById('mk-tx-count');

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

            prosesMonitoringKeuangan();
        } catch (err) {
            console.error("Gagal memuat data monitoring keuangan:", err);
            if (rekapBody) rekapBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
            if (txBody) txBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function prosesMonitoringKeuangan() {
        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        const kasMap = {};
        coaList.forEach(coa => {
            if (!isKasOrBankAccount(coa)) return;
            const kode = String(coa.kodeAkun || "").trim();
            if (!kode) return;

            kasMap[kode] = {
                kodeAkun: kode,
                namaAkun: coa.namaAkun || "-",
                saldoAwal: 0,
                kasMasuk: 0,
                kasKeluar: 0,
                saldoAkhir: 0
            };
        });

        saldoAwalList.forEach(sa => {
            if (unitVal && sa.unitUsaha && sa.unitUsaha !== unitVal) return;
            if (periodeSampai && sa.periode && String(sa.periode) > periodeSampai) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (kasMap[kode]) {
                const debit = parseFloat(sa.debit) || 0;
                const kredit = parseFloat(sa.kredit) || 0;
                kasMap[kode].saldoAwal += (debit - kredit);
            }
        });

        const txRows = [];

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            const inRange = (!tglMulaiVal || !item.tglTransaksi || item.tglTransaksi >= tglMulaiVal);
            let rowMasuk = 0;
            let rowKeluar = 0;

            if (Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (!kasMap[kode]) return;

                    const debet = parseFloat(r.debet) || 0;
                    const kredit = parseFloat(r.kredit) || 0;

                    if (!inRange) {
                        kasMap[kode].saldoAwal += (debet - kredit);
                    } else {
                        kasMap[kode].kasMasuk += debet;
                        kasMap[kode].kasKeluar += kredit;
                        rowMasuk += debet;
                        rowKeluar += kredit;
                    }
                });
            }

            if (inRange && (rowMasuk > 0 || rowKeluar > 0)) {
                txRows.push({
                    tglTransaksi: item.tglTransaksi || "-",
                    unitUsaha: item.unitUsaha || "-",
                    uraian: item.uraian || item.keterangan || "Transaksi Kas / Bank",
                    kasMasuk: rowMasuk,
                    kasKeluar: rowKeluar
                });
            }
        });

        const rekapList = Object.values(kasMap).sort((a, b) => String(a.kodeAkun).localeCompare(String(b.kodeAkun)));

        let totalAwal = 0;
        let totalMasuk = 0;
        let totalKeluar = 0;
        let totalAkhir = 0;

        rekapList.forEach(acc => {
            acc.saldoAkhir = acc.saldoAwal + acc.kasMasuk - acc.kasKeluar;
            totalAwal += acc.saldoAwal;
            totalMasuk += acc.kasMasuk;
            totalKeluar += acc.kasKeluar;
            totalAkhir += acc.saldoAkhir;
        });

        if (saldoAwalEl) saldoAwalEl.textContent = `Rp ${totalAwal.toLocaleString('id-ID')}`;
        if (kasMasukEl) kasMasukEl.textContent = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
        if (kasKeluarEl) kasKeluarEl.textContent = `Rp ${totalKeluar.toLocaleString('id-ID')}`;
        if (saldoAkhirEl) saldoAkhirEl.textContent = `Rp ${totalAkhir.toLocaleString('id-ID')}`;

        if (footAwal) footAwal.textContent = `Rp ${totalAwal.toLocaleString('id-ID')}`;
        if (footMasuk) footMasuk.textContent = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
        if (footKeluar) footKeluar.textContent = `Rp ${totalKeluar.toLocaleString('id-ID')}`;
        if (footAkhir) footAkhir.textContent = `Rp ${totalAkhir.toLocaleString('id-ID')}`;

        if (periodeLabelEl) {
            const unitLabel = unitVal || "Semua Unit";
            const periodeLabel = tglMulaiVal || tglSampaiVal
                ? `${tglMulaiVal || "Awal"} s/d ${tglSampaiVal || "Sekarang"}`
                : "Seluruh Periode";
            periodeLabelEl.textContent = `${unitLabel} • ${periodeLabel}`;
        }

        if (rekapBody && rekapCard) {
            if (rekapList.length === 0) {
                rekapBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada akun kas/bank level 4 pada COA.</td></tr>`;
                rekapCard.innerHTML = `<div class="p-6 text-center text-slate-400">Belum ada akun kas/bank level 4 pada COA.</div>`;
            } else {
                let htmlTable = "";
                let htmlCard = "";

                rekapList.forEach(acc => {
                    htmlTable += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">${acc.kodeAkun}</td>
                            <td class="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">${acc.namaAkun}</td>
                            <td class="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">Rp ${acc.saldoAwal.toLocaleString('id-ID')}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">Rp ${acc.kasMasuk.toLocaleString('id-ID')}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">Rp ${acc.kasKeluar.toLocaleString('id-ID')}</td>
                            <td class="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">Rp ${acc.saldoAkhir.toLocaleString('id-ID')}</td>
                        </tr>
                    `;

                    htmlCard += `
                        <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <div class="flex justify-between items-start gap-2">
                                <div>
                                    <span class="font-bold text-indigo-600 dark:text-indigo-400">${acc.kodeAkun}</span>
                                    <div class="font-semibold text-slate-800 dark:text-slate-200">${acc.namaAkun}</div>
                                </div>
                                <div class="text-right font-bold text-slate-900 dark:text-slate-100">
                                    Rp ${acc.saldoAkhir.toLocaleString('id-ID')}
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                                <div>Awal: <span class="font-semibold">Rp ${acc.saldoAwal.toLocaleString('id-ID')}</span></div>
                                <div class="text-emerald-600 dark:text-emerald-400">Masuk: <span class="font-semibold">Rp ${acc.kasMasuk.toLocaleString('id-ID')}</span></div>
                                <div class="text-rose-600 dark:text-rose-400">Keluar: <span class="font-semibold">Rp ${acc.kasKeluar.toLocaleString('id-ID')}</span></div>
                            </div>
                        </div>
                    `;
                });

                rekapBody.innerHTML = htmlTable;
                rekapCard.innerHTML = htmlCard;
            }
        }

        if (txCountEl) {
            txCountEl.textContent = `${txRows.length} transaksi`;
        }

        if (txBody && txCard) {
            if (txRows.length === 0) {
                txBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">Tidak ada transaksi kas pada filter yang dipilih.</td></tr>`;
                txCard.innerHTML = `<div class="p-6 text-center text-slate-400">Tidak ada transaksi kas pada filter yang dipilih.</div>`;
            } else {
                let htmlTxTable = "";
                let htmlTxCard = "";

                txRows.forEach(tx => {
                    htmlTxTable += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-2.5 px-4 text-slate-600 dark:text-slate-400">${tx.tglTransaksi}</td>
                            <td class="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">${tx.unitUsaha}</td>
                            <td class="py-2.5 px-4 text-slate-800 dark:text-slate-200">${tx.uraian}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">${tx.kasMasuk > 0 ? `Rp ${tx.kasMasuk.toLocaleString('id-ID')}` : '-'}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">${tx.kasKeluar > 0 ? `Rp ${tx.kasKeluar.toLocaleString('id-ID')}` : '-'}</td>
                        </tr>
                    `;

                    htmlTxCard += `
                        <div class="p-4 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <div class="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                                <span>${tx.tglTransaksi}</span>
                                <span class="font-semibold">${tx.unitUsaha}</span>
                            </div>
                            <div class="font-medium text-slate-800 dark:text-slate-200">${tx.uraian}</div>
                            <div class="flex justify-between items-center text-xs pt-1">
                                <span class="text-emerald-600 dark:text-emerald-400 font-semibold">${tx.kasMasuk > 0 ? `+ Rp ${tx.kasMasuk.toLocaleString('id-ID')}` : ''}</span>
                                <span class="text-rose-600 dark:text-rose-400 font-semibold">${tx.kasKeluar > 0 ? `- Rp ${tx.kasKeluar.toLocaleString('id-ID')}` : ''}</span>
                            </div>
                        </div>
                    `;
                });

                txBody.innerHTML = htmlTxTable;
                txCard.innerHTML = htmlTxCard;
            }
        }
    }

    const onTampilkanClick = () => prosesMonitoringKeuangan();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        monitoringKeuanganCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    monitoringKeuanganCleanup = cleanup;

    loadData();

    return cleanup;
}