// File: assets/js/views/laporan-neraca-saldo.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

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

export function renderLaporanNeracaSaldo() {
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
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Laporan Neraca Saldo (Trial Balance)</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Rekapitulasi saldo akhir seluruh akun perkiraan BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <button id="btn-cetak-neraca-saldo" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span>Cetak / Print Laporan</span>
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
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Neraca Saldo</button>
                </div>
            </div>

            <!-- Status Balance & Ringkasan -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="font-bold text-slate-700 dark:text-slate-300">Status Keseimbangan:</span>
                    <span id="status-balance-badge" class="px-3 py-1 font-bold uppercase rounded-none bg-slate-200 text-slate-700">Menunggu Proses</span>
                </div>
                <div id="summary-info" class="font-bold text-slate-600 dark:text-slate-400 break-words">
                    Total Akun: 0 | Selisih: Rp 0
                </div>
            </div>

            <!-- Tabel Neraca Saldo -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Saldo Akun Perkiraan (Trial Balance)</h3>
                    <span id="total-akun-label" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Nama Akun Perkiraan</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-44">Debet (Rp)</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-44">Kredit (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-neraca-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="4" class="py-8 text-center text-slate-400">Silakan klik "Tampilkan Neraca Saldo" untuk memuat data.</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                                <td colspan="2" class="py-3 px-4 text-right">TOTAL :</td>
                                <td id="footer-total-debet" class="py-3 px-4 text-right">Rp 0</td>
                                <td id="footer-total-kredit" class="py-3 px-4 text-right">Rp 0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View) -->
                <div class="block md:hidden">
                    <div id="card-neraca-body" class="divide-y divide-slate-200 dark:divide-slate-800">
                        <div class="p-6 text-center text-slate-400 text-xs">Silakan klik "Tampilkan Neraca Saldo" untuk memuat data.</div>
                    </div>
                    <div id="card-neraca-footer" class="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
                        <div class="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Total Neraca Saldo</div>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-none min-w-0">
                                <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">TOTAL DEBET</div>
                                <div id="mobile-total-debet" class="font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">Rp 0</div>
                            </div>
                            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-none text-right min-w-0">
                                <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">TOTAL KREDIT</div>
                                <div id="mobile-total-kredit" class="font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">Rp 0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let neracaSaldoCleanup = null;

export function initLaporanNeracaSaldoHandler() {
    if (typeof neracaSaldoCleanup === "function") {
        neracaSaldoCleanup();
        neracaSaldoCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-neraca-saldo');

    const tableBody = document.getElementById('table-neraca-body');
    const cardBody = document.getElementById('card-neraca-body');
    const totalAkunLabel = document.getElementById('total-akun-label');
    const footerTotalDebet = document.getElementById('footer-total-debet');
    const footerTotalKredit = document.getElementById('footer-total-kredit');
    const mobileTotalDebet = document.getElementById('mobile-total-debet');
    const mobileTotalKredit = document.getElementById('mobile-total-kredit');
    const statusBalanceBadge = document.getElementById('status-balance-badge');
    const summaryInfo = document.getElementById('summary-info');

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
            coaList.sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));

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

            prosesNeracaSaldo();
        } catch (err) {
            console.error("Gagal memuat data laporan neraca saldo:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    function prosesNeracaSaldo() {
        if (!tableBody || !cardBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        let akunMap = {};
        coaList.forEach(coa => {
            if (String(coa.levelAkun) === "4" || coa.tipeAkun === "Detail") {
                const kode = String(coa.kodeAkun || "").trim();
                if (!kode) return;
                akunMap[kode] = {
                    kodeAkun: kode,
                    namaAkun: coa.namaAkun || "-",
                    normalBalance: String(coa.normalBalance || coa.saldoNormal || "debet").toLowerCase(),
                    totalDebet: 0,
                    totalKredit: 0
                };
            }
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

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (akunMap[kode]) {
                        akunMap[kode].totalDebet += parseFloat(r.debet) || 0;
                        akunMap[kode].totalKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        let hasilNeraca = [];
        let grandTotalDebet = 0;
        let grandTotalKredit = 0;

        Object.values(akunMap)
            .sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun))
            .forEach(acc => {
                let netDebet = 0;
                let netKredit = 0;

                if (acc.normalBalance === "kredit") {
                    const saldoKredit = acc.totalKredit - acc.totalDebet;
                    if (saldoKredit >= 0) {
                        netKredit = saldoKredit;
                    } else {
                        netDebet = Math.abs(saldoKredit);
                    }
                } else {
                    const saldoDebet = acc.totalDebet - acc.totalKredit;
                    if (saldoDebet >= 0) {
                        netDebet = saldoDebet;
                    } else {
                        netKredit = Math.abs(saldoDebet);
                    }
                }

                if (acc.totalDebet > 0 || acc.totalKredit > 0 || netDebet > 0 || netKredit > 0) {
                    grandTotalDebet += netDebet;
                    grandTotalKredit += netKredit;
                    hasilNeraca.push({
                        kodeAkun: acc.kodeAkun,
                        namaAkun: acc.namaAkun,
                        debet: netDebet,
                        kredit: netKredit
                    });
                }
            });

        const fmtDebet = `Rp ${grandTotalDebet.toLocaleString('id-ID')}`;
        const fmtKredit = `Rp ${grandTotalKredit.toLocaleString('id-ID')}`;

        if (totalAkunLabel) totalAkunLabel.textContent = `Total: ${hasilNeraca.length} Akun Aktif`;
        if (footerTotalDebet) footerTotalDebet.textContent = fmtDebet;
        if (footerTotalKredit) footerTotalKredit.textContent = fmtKredit;
        if (mobileTotalDebet) mobileTotalDebet.textContent = fmtDebet;
        if (mobileTotalKredit) mobileTotalKredit.textContent = fmtKredit;

        const selisih = Math.abs(grandTotalDebet - grandTotalKredit);
        if (summaryInfo) summaryInfo.textContent = `Total Akun: ${hasilNeraca.length} | Selisih: Rp ${selisih.toLocaleString('id-ID')}`;

        if (statusBalanceBadge) {
            if (grandTotalDebet > 0 && selisih === 0) {
                statusBalanceBadge.textContent = "Balance (Seimbang)";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-emerald-600 text-white";
            } else if (grandTotalDebet === 0 && grandTotalKredit === 0) {
                statusBalanceBadge.textContent = "Belum Ada Transaksi";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-slate-200 text-slate-700";
            } else {
                statusBalanceBadge.textContent = "Tidak Balance";
                statusBalanceBadge.className = "px-3 py-1 font-bold uppercase rounded-none bg-rose-500 text-white";
            }
        }

        if (hasilNeraca.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400">Tidak ada saldo akun yang aktif pada periode ini.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada saldo akun yang aktif pada periode ini.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        hasilNeraca.forEach(h => {
            const debetText = h.debet > 0 ? `Rp ${h.debet.toLocaleString('id-ID')}` : '-';
            const kreditText = h.kredit > 0 ? `Rp ${h.kredit.toLocaleString('id-ID')}` : '-';

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${escapeHtml(h.kodeAkun)}</td>
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${escapeHtml(h.namaAkun)}</td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${debetText}</td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${kreditText}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs bg-white dark:bg-slate-900 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600 dark:text-indigo-400 rounded-none">${escapeHtml(h.kodeAkun)}</span>
                        <span class="text-[10px] font-semibold uppercase text-slate-400">Akun Detail</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">${escapeHtml(h.namaAkun)}</div>
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-none min-w-0">
                            <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">DEBET</div>
                            <div class="font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">${debetText}</div>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-none text-right min-w-0">
                            <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">KREDIT</div>
                            <div class="font-bold text-slate-800 dark:text-slate-100 mt-0.5 break-words">${kreditText}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;
    }

    const onTampilkanClick = () => prosesNeracaSaldo();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        neracaSaldoCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    neracaSaldoCleanup = cleanup;

    loadData();

    return cleanup;
}