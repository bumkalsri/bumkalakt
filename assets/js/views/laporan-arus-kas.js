// File: assets/js/views/laporan-arus-kas.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function isCashOrBankAccount(coa, kodeAkun) {
    const kode = String(kodeAkun || coa?.kodeAkun || "").trim();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const subKategori = String(coa?.subKategori || "").toLowerCase();

    return (
        kode.startsWith("1.01") ||
        kategori.includes("kas") ||
        kategori.includes("bank") ||
        subKategori.includes("kas") ||
        subKategori.includes("bank") ||
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

export function renderLaporanArusKas() {
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan Arus Kas (Cash Flow Statement)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Rekapitulasi arus kas masuk dan kas keluar berdasarkan aktivitas BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-arus-kas" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
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
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Arus Kas Bersih -->
            <div class="bg-indigo-900 text-white p-6 rounded-none shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p class="text-xs uppercase tracking-widest text-indigo-200 font-semibold">Kenaikan / Penurunan Kas Bersih</p>
                    <h2 id="summary-kas-bersih" class="text-2xl font-extrabold mt-1">Rp 0</h2>
                </div>
                <div class="text-right">
                    <span id="badge-arus-kas" class="px-3 py-1 bg-indigo-800 text-indigo-100 font-bold text-xs uppercase">Menunggu Proses</span>
                </div>
            </div>

            <!-- Konten Laporan (Operasi, Investasi, Pendanaan) -->
            <div class="space-y-6">
                <!-- I. Aktivitas Operasi -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                        <span>I. ARUS KAS DARI AKTIVITAS OPERASI</span>
                        <span id="total-operasi" class="text-indigo-600 dark:text-indigo-400">Rp 0</span>
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
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                        <span>II. ARUS KAS DARI AKTIVITAS INVESTASI</span>
                        <span id="total-investasi" class="text-indigo-600 dark:text-indigo-400">Rp 0</span>
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
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                        <span>III. ARUS KAS DARI AKTIVITAS PENDANAAN</span>
                        <span id="total-pendanaan" class="text-indigo-600 dark:text-indigo-400">Rp 0</span>
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

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allJurnalList = [];
            snapJurnal.forEach(docSnap => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            prosesArusKas();
        } catch (err) {
            console.error("Gagal memuat data laporan arus kas:", err);
            if (tableOperasiBody) tableOperasiBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tableInvestasiBody) tableInvestasiBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (tablePendanaanBody) tablePendanaanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function prosesArusKas() {
        if (!tableOperasiBody || !tableInvestasiBody || !tablePendanaanBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";

        const buckets = {
            operasi: {},
            investasi: {},
            pendanaan: {}
        };

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
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
            } else {
                rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    const coa = coaByKode[kode];
                    const kategori = resolveCashFlowCategory(coa);
                    if (!kategori || !buckets[kategori]) return;

                    const d = parseFloat(r.debet) || 0;
                    const k = parseFloat(r.kredit) || 0;
                    const net = d - k;
                    if (net === 0) return;

                    if (!buckets[kategori][kode]) {
                        buckets[kategori][kode] = {
                            kodeAkun: kode,
                            namaAkun: coa?.namaAkun || r.namaAkun || kode,
                            jumlah: 0
                        };
                    }
                    buckets[kategori][kode].jumlah += net;
                });
            }
        });

        const toSortedActiveList = (mapObj) =>
            Object.values(mapObj)
                .filter(row => row.jumlah !== 0)
                .sort((a, b) => String(a.kodeAkun).localeCompare(String(b.kodeAkun)));

        const listOperasi = toSortedActiveList(buckets.operasi);
        const listInvestasi = toSortedActiveList(buckets.investasi);
        const listPendanaan = toSortedActiveList(buckets.pendanaan);

        const sumOperasi = listOperasi.reduce((acc, r) => acc + r.jumlah, 0);
        const sumInvestasi = listInvestasi.reduce((acc, r) => acc + r.jumlah, 0);
        const sumPendanaan = listPendanaan.reduce((acc, r) => acc + r.jumlah, 0);
        const totalKasBersih = sumOperasi + sumInvestasi + sumPendanaan;

        if (totalOperasiEl) totalOperasiEl.textContent = `Rp ${sumOperasi.toLocaleString('id-ID')}`;
        if (totalInvestasiEl) totalInvestasiEl.textContent = `Rp ${sumInvestasi.toLocaleString('id-ID')}`;
        if (totalPendanaanEl) totalPendanaanEl.textContent = `Rp ${sumPendanaan.toLocaleString('id-ID')}`;
        if (summaryKasBersih) summaryKasBersih.textContent = `Rp ${totalKasBersih.toLocaleString('id-ID')}`;

        if (badgeArusKas) {
            if (totalKasBersih > 0) {
                badgeArusKas.textContent = "Surplus Kas";
                badgeArusKas.className = "px-3 py-1 bg-emerald-600 text-white font-bold text-xs uppercase";
            } else if (totalKasBersih < 0) {
                badgeArusKas.textContent = "Defisit Kas";
                badgeArusKas.className = "px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase";
            } else {
                badgeArusKas.textContent = "Impas (Zero)";
                badgeArusKas.className = "px-3 py-1 bg-amber-600 text-white font-bold text-xs uppercase";
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
                            <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${item.kodeAkun}</td>
                            <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.namaAkun}</td>
                            <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
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