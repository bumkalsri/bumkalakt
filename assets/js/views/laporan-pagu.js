// File: assets/js/views/laporan-pagu.js
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

function getCurrentMonthYm() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function formatAngka(num) {
    const val = Number(num) || 0;
    if (val === 0) return "-";
    return Math.round(val).toLocaleString("id-ID");
}

function formatAngkaKosongJikaNol(num) {
    const val = Number(num) || 0;
    if (!val) return "";
    return Math.round(val).toLocaleString("id-ID");
}

function formatPeriodeJudul(periodeYm) {
    const fallbackYm = getCurrentMonthYm();
    const match = String(periodeYm || fallbackYm).match(/^(\d{4})-(\d{2})$/) || fallbackYm.match(/^(\d{4})-(\d{2})$/);
    if (!match) return "PERIODE BULAN INI";
    const tahun = match[1];
    const bulanIdx = Number(match[2]) - 1;
    const namaBulan = [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
    ][bulanIdx] || "JANUARI";
    return `PERIODE BULAN ${namaBulan} ${tahun}`;
}

function formatTanggalTtd(periodeYm) {
    const fallbackYm = getCurrentMonthYm();
    const match = String(periodeYm || fallbackYm).match(/^(\d{4})-(\d{2})$/) || fallbackYm.match(/^(\d{4})-(\d{2})$/);
    if (!match) return "Srihardono";
    const tahun = Number(match[1]);
    const bulanNum = Number(match[2]);
    const akhirBulan = new Date(tahun, bulanNum, 0).getDate();
    const namaBulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ][bulanNum - 1] || "Januari";
    return `Srihardono, ${akhirBulan} ${namaBulan} ${tahun}`;
}

export function renderLaporanPagu() {
    const currentYm = getCurrentMonthYm();

    return `
        <style>
            @keyframes lpSmoothIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .lp-smooth-enter {
                animation: lpSmoothIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            @media print {
                body > *:not(#lp-print-root) {
                    display: none !important;
                }
                #lp-print-root {
                    display: block !important;
                    position: static;
                    width: 100%;
                    padding: 6mm;
                    background: #ffffff !important;
                    color: #000000 !important;
                }
            }
        </style>
        <div class="space-y-6 pb-10 max-w-7xl mx-auto lp-smooth-enter">
            <!-- Header & Kontrol Filter -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs rounded-none flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    <a href="#/laporan" data-link title="Kembali ke Laporan" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition rounded-none flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan PAGU &amp; Anggaran Unit</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">BUMKAL SINAR MITRA DESA — Rekapitulasi pagu anggaran, realisasi, dan saldo anggaran.</p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2.5 text-xs">
                    <div class="w-full sm:w-40">
                        <input type="month" id="filter-pagu-periode" value="${escapeHtml(currentYm)}" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="w-full sm:w-52">
                        <select id="filter-pagu-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">Semua Unit Usaha</option>
                        </select>
                    </div>
                    <div class="relative flex-1 sm:w-44">
                        <input type="text" id="search-pagu" placeholder="Cari uraian..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <button type="button" id="btn-cetak-pagu" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-none transition cursor-pointer">
                        Cetak Laporan
                    </button>
                </div>
            </div>

            <!-- Lembar Laporan Format BUMKal -->
            <div id="lp-sheet-container" class="bg-white text-black p-4 sm:p-8 border border-slate-300 shadow-xs rounded-none overflow-x-auto">
                <div id="lp-printable-area" class="min-w-[780px] text-black font-sans">
                    <!-- Judul Kop Laporan -->
                    <div class="text-center font-extrabold text-[13px] sm:text-[14px] leading-snug uppercase tracking-tight mb-4">
                        <div>BUMKAL SINAR MITRA DESA</div>
                        <div id="lp-judul-unit">LAPORAN BULANAN UNIT USAHA SEMUA UNIT USAHA</div>
                        <div id="lp-judul-periode">${escapeHtml(formatPeriodeJudul(currentYm))}</div>
                    </div>

                    <!-- Tabel Utama 7 Kolom -->
                    <table class="w-full border-collapse border-[1.5px] border-black text-[11.5px]">
                        <thead>
                            <tr class="border-b-[1.5px] border-black font-bold text-center">
                                <th class="border-r-[1.5px] border-black px-2 py-2 w-10">NO</th>
                                <th class="border-r-[1.5px] border-black px-2 py-2 w-24">TANGGAL</th>
                                <th class="border-r-[1.5px] border-black px-3 py-2 text-center">URAIAN</th>
                                <th class="border-r-[1.5px] border-black px-2 py-2 w-28">PAGU<br>ANGGARAN</th>
                                <th class="border-r-[1.5px] border-black px-2 py-2 w-28">TOTAL<br>PEMBELIAN</th>
                                <th class="border-r-[1.5px] border-black px-2 py-2 w-32">SISA<br>ANGGARAN<br>BULAN LALU</th>
                                <th class="px-2 py-2 w-28">SALDO<br>ANGGARAN</th>
                            </tr>
                        </thead>
                        <tbody id="pagu-sheet-tbody">
                            <tr>
                                <td colspan="7" class="p-6 text-center text-slate-500">Memuat data laporan PAGU...</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Ringkasan Bawah -->
                    <div class="mt-3 grid grid-cols-12 text-[11.5px] leading-relaxed">
                        <div class="col-span-7 pl-12 pr-4 space-y-0.5">
                            <div>Pagu Anggaran</div>
                            <div>Saldo Anggaran</div>
                            <div>Realisasi Sampai Bulan ini</div>
                            <div>Total Pengeluaran Biaya Bulan ini</div>
                        </div>
                        <div class="col-span-3 pr-2 text-right font-semibold space-y-0.5">
                            <div id="lp-rekap-pagu">-</div>
                            <div id="lp-rekap-saldo" class="border-b-[1.5px] border-black pb-0.5">-</div>
                            <div id="lp-rekap-realisasi" class="pt-0.5">-</div>
                            <div id="lp-rekap-pengeluaran" class="border-b-[1.5px] border-black pb-0.5">-</div>
                        </div>
                        <div class="col-span-2"></div>
                    </div>

                    <!-- Tanggal & Tanda Tangan -->
                    <div class="mt-6 text-[11.5px]">
                        <div class="grid grid-cols-12">
                            <div class="col-span-6"></div>
                            <div id="lp-ttd-tanggal" class="col-span-6 text-center">${escapeHtml(formatTanggalTtd(currentYm))}</div>
                        </div>

                        <div class="grid grid-cols-12 mt-3 text-center">
                            <div class="col-span-6">
                                <div class="font-medium">Pengawas BUMKal</div>
                                <div class="h-16 flex items-center justify-center italic text-[11px] text-slate-600 font-serif select-none">
                                    Khozimatul Luthfiah
                                </div>
                                <div class="font-semibold underline">KHOZIMATUL LUTHFIAH, S.AP</div>
                            </div>
                            <div class="col-span-6">
                                <div class="font-medium">Direktur BUMKal</div>
                                <div class="h-16 flex items-center justify-center italic text-[11px] text-slate-600 font-serif select-none">
                                    Heriyadi
                                </div>
                                <div class="font-semibold underline">HERIYADI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let laporanPaguCleanup = null;

export function initLaporanPaguHandler() {
    if (typeof laporanPaguCleanup === "function") {
        laporanPaguCleanup();
        laporanPaguCleanup = null;
    }

    const filterPeriode = document.getElementById('filter-pagu-periode');
    const filterUnit = document.getElementById('filter-pagu-unit');
    const searchInput = document.getElementById('search-pagu');
    const btnCetak = document.getElementById('btn-cetak-pagu');
    const tbody = document.getElementById('pagu-sheet-tbody');

    const judulUnitEl = document.getElementById('lp-judul-unit');
    const judulPeriodeEl = document.getElementById('lp-judul-periode');
    const rekapPaguEl = document.getElementById('lp-rekap-pagu');
    const rekapSaldoEl = document.getElementById('lp-rekap-saldo');
    const rekapRealisasiEl = document.getElementById('lp-rekap-realisasi');
    const rekapPengeluaranEl = document.getElementById('lp-rekap-pengeluaran');
    const ttdTanggalEl = document.getElementById('lp-ttd-tanggal');

    const currentYm = getCurrentMonthYm();
    if (filterPeriode && !filterPeriode.value) {
        filterPeriode.value = currentYm;
    }

    let isDisposed = false;
    let paguMasterList = [];
    let jurnalList = [];
    let selectedPeriode = filterPeriode ? (filterPeriode.value || currentYm) : currentYm;
    let selectedUnit = filterUnit ? filterUnit.value : "";
    let searchQuery = "";

    function getOrCreatePrintRoot() {
        let root = document.getElementById('lp-print-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'lp-print-root';
            document.body.appendChild(root);
        }
        return root;
    }

    function clearPrintRoot() {
        const root = document.getElementById('lp-print-root');
        if (root) root.innerHTML = "";
    }

    function renderLaporanSheet() {
        if (isDisposed || !tbody) return;

        const unitLabel = selectedUnit ? selectedUnit.toUpperCase() : "SEMUA UNIT USAHA";
        if (judulUnitEl) judulUnitEl.textContent = `LAPORAN BULANAN UNIT USAHA ${unitLabel}`;
        if (judulPeriodeEl) judulPeriodeEl.textContent = formatPeriodeJudul(selectedPeriode);
        if (ttdTanggalEl) ttdTanggalEl.textContent = formatTanggalTtd(selectedPeriode);

        const unitFilterUpper = selectedUnit.trim().toUpperCase();

        const matchingPagu = paguMasterList.filter((item) => {
            const unitItem = String(item.unit || item.unitUsaha || item.namaUnit || "").trim().toUpperCase();
            return !unitFilterUpper || unitItem === unitFilterUpper || unitItem.includes(unitFilterUpper);
        });

        const totalPagu = matchingPagu.reduce((sum, p) => sum + (Number(p.pagu ?? p.jumlahPagu ?? p.nominal ?? 0) || 0), 0);

        // Hitung pengeluaran seluruh unit/unit terpilih sebelum bulan aktif (YYYY-MM < selectedPeriode)
        const pengeluaranBulanSebelumnya = jurnalList
            .filter((j) => {
                const tgl = String(j.tglTransaksi || "");
                const ym = tgl.slice(0, 7);
                const unitJ = String(j.unitUsaha || "").trim().toUpperCase();
                const matchUnit = !unitFilterUpper || unitJ === unitFilterUpper || unitJ.includes(unitFilterUpper);
                const matchBeforeMonth = Boolean(selectedPeriode) && ym !== "" && ym < selectedPeriode;
                return matchUnit && matchBeforeMonth;
            })
            .reduce((sum, j) => sum + (Number(j.totalNilai || 0) || 0), 0);

        const sisaBulanLalu = Math.max(0, totalPagu - pengeluaranBulanSebelumnya);

        const qLower = searchQuery.trim().toLowerCase();

        // Transaksi pengeluaran pada bulan terpilih (YYYY-MM === selectedPeriode)
        const mutasiBulanIni = jurnalList.filter((j) => {
            const tgl = String(j.tglTransaksi || "");
            const ym = tgl.slice(0, 7);
            const unitJ = String(j.unitUsaha || "").trim().toUpperCase();
            const uraianJ = String(j.keterangan || j.uraian || "").toLowerCase();
            const matchPeriode = !selectedPeriode || ym === selectedPeriode;
            const matchUnit = !unitFilterUpper || unitJ === unitFilterUpper || unitJ.includes(unitFilterUpper);
            const matchSearch = !qLower || uraianJ.includes(qLower);
            return matchPeriode && matchUnit && matchSearch;
        });

        const totalPengeluaranBulanIni = jurnalList
            .filter((j) => {
                const tgl = String(j.tglTransaksi || "");
                const ym = tgl.slice(0, 7);
                const unitJ = String(j.unitUsaha || "").trim().toUpperCase();
                const matchPeriode = !selectedPeriode || ym === selectedPeriode;
                const matchUnit = !unitFilterUpper || unitJ === unitFilterUpper || unitJ.includes(unitFilterUpper);
                return matchPeriode && matchUnit;
            })
            .reduce((sum, j) => sum + (Number(j.totalNilai || 0) || 0), 0);

        const realisasiSampaiBulanIni = pengeluaranBulanSebelumnya + totalPengeluaranBulanIni;

        const rows = [];
        let runningSaldo = sisaBulanLalu;

        const tahunPaguText = "2025/2026";
        if (!qLower || `pagu anggaran ${tahunPaguText}`.includes(qLower)) {
            rows.push({
                no: "1",
                tanggal: "",
                uraian: `Pagu Anggaran ${tahunPaguText}`,
                pagu: totalPagu,
                pembelian: 0,
                sisaLalu: 0,
                saldo: null,
                boldUraian: true,
                boldPagu: true
            });
        }

        if (!qLower || "sisa anggaran bulan lalu".includes(qLower)) {
            rows.push({
                no: "2",
                tanggal: "",
                uraian: "Sisa Anggaran Bulan Lalu",
                pagu: 0,
                pembelian: 0,
                sisaLalu: sisaBulanLalu,
                saldo: null,
                boldUraian: true,
                boldSisaLalu: true
            });
        }

        mutasiBulanIni.forEach((trx) => {
            const pembelian = Number(trx.totalNilai || 0) || 0;
            runningSaldo = Math.max(0, runningSaldo - pembelian);
            const uraianBersih = String(trx.keterangan || trx.uraian || "")
                .replace(/^\[kas\s*(masuk|keluar)\]\s*/i, "")
                .trim();

            rows.push({
                no: String(rows.length + 1),
                tanggal: trx.tglTransaksi || "",
                uraian: uraianBersih,
                pagu: 0,
                pembelian,
                sisaLalu: 0,
                saldo: runningSaldo
            });
        });

        while (rows.length < 5) {
            const idx = rows.length + 1;
            const saldoBaris = idx >= 3 ? runningSaldo : null;
            rows.push({
                no: String(idx),
                tanggal: "",
                uraian: "",
                pagu: 0,
                pembelian: 0,
                sisaLalu: 0,
                saldo: saldoBaris
            });
        }

        rows.push({
            no: "",
            tanggal: "",
            uraian: "",
            pagu: 0,
            pembelian: 0,
            sisaLalu: 0,
            saldo: null,
            isSpacer: true
        });

        const totalPembelianKolom = rows.reduce((s, r) => s + (r.pembelian || 0), 0);
        const totalSisaLaluKolom = rows.reduce((s, r) => s + (r.sisaLalu || 0), 0);
        const saldoAkhirKolom = Math.max(0, sisaBulanLalu - totalPembelianKolom);

        let html = "";
        rows.forEach((r) => {
            html += `
                <tr class="border-b border-slate-300">
                    <td class="border-r-[1.5px] border-black px-2 py-1 text-center font-bold">${escapeHtml(r.no)}</td>
                    <td class="border-r-[1.5px] border-black px-2 py-1 text-center">${escapeHtml(r.tanggal)}</td>
                    <td class="border-r-[1.5px] border-black px-3 py-1 ${r.boldUraian ? 'font-bold' : ''}">${escapeHtml(r.uraian)}</td>
                    <td class="border-r-[1.5px] border-black px-2 py-1 text-right ${r.boldPagu ? 'font-bold' : ''}">${escapeHtml(formatAngkaKosongJikaNol(r.pagu))}</td>
                    <td class="border-r-[1.5px] border-black px-2 py-1 text-right">${escapeHtml(formatAngkaKosongJikaNol(r.pembelian))}</td>
                    <td class="border-r-[1.5px] border-black px-2 py-1 text-right ${r.boldSisaLalu ? 'font-bold' : ''}">${escapeHtml(formatAngkaKosongJikaNol(r.sisaLalu))}</td>
                    <td class="px-2 py-1 text-right">${r.saldo !== null ? escapeHtml(formatAngka(r.saldo)) : ''}</td>
                </tr>
            `;
        });

        html += `
            <tr class="border-t-[1.5px] border-black font-bold">
                <td class="border-r-[1.5px] border-black px-2 py-1.5"></td>
                <td class="border-r-[1.5px] border-black px-2 py-1.5"></td>
                <td class="border-r-[1.5px] border-black px-3 py-1.5">TOTAL</td>
                <td class="border-r-[1.5px] border-black px-2 py-1.5 text-right">${escapeHtml(formatAngka(totalPagu))}</td>
                <td class="border-r-[1.5px] border-black px-2 py-1.5 text-right">${escapeHtml(formatAngka(totalPembelianKolom))}</td>
                <td class="border-r-[1.5px] border-black px-2 py-1.5 text-right">${escapeHtml(formatAngka(totalSisaLaluKolom))}</td>
                <td class="px-2 py-1.5 text-right">${escapeHtml(formatAngka(saldoAkhirKolom))}</td>
            </tr>
        `;

        tbody.innerHTML = html;

        if (rekapPaguEl) rekapPaguEl.textContent = formatAngka(totalPagu);
        if (rekapSaldoEl) rekapSaldoEl.textContent = formatAngka(saldoAkhirKolom);
        if (rekapRealisasiEl) rekapRealisasiEl.textContent = formatAngka(realisasiSampaiBulanIni);
        if (rekapPengeluaranEl) rekapPengeluaranEl.textContent = formatAngka(totalPengeluaranBulanIni);
    }

    async function fetchUnitsFromDB() {
        try {
            const snap = await getDocs(collection(db, "unit_usaha"));
            if (isDisposed || !filterUnit) return;
            const prevVal = filterUnit.value;
            const units = [];
            snap.forEach((docSnap) => {
                const d = docSnap.data() || {};
                const nama = String(d.namaUnit || d.nama || "").trim();
                if (nama && nama.toUpperCase() !== "PRODUKSI AGROWISATA") {
                    units.push(nama);
                }
            });
            if (units.length > 0) {
                const opts = [
                    `<option value="" ${prevVal === "" ? "selected" : ""}>Semua Unit Usaha</option>`
                ];
                units.forEach((u) => {
                    opts.push(`<option value="${escapeHtml(u)}" ${prevVal === u ? "selected" : ""}>${escapeHtml(u)}</option>`);
                });
                filterUnit.innerHTML = opts.join("");
            }
        } catch (err) {
            console.warn("Gagal memuat unit_usaha:", err);
        }
    }

    async function fetchPaguAndJurnal() {
        const fallbackPagu = [
            { id: "1", uraian: "Pagu Anggaran 2025/2026", unit: "", pagu: 186471000 }
        ];

        try {
            const [paguSnap, jurnalSnap] = await Promise.all([
                getDocs(query(collection(db, "laporan_pagu"), orderBy("createdAt", "desc"))).catch(() => getDocs(collection(db, "laporan_pagu"))),
                getDocs(query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"))).catch(() => getDocs(collection(db, "jurnal_umum")))
            ]);
            if (isDisposed) return;

            paguMasterList = [];
            paguSnap.forEach((d) => {
                paguMasterList.push({ id: d.id, ...(d.data() || {}) });
            });
            if (paguMasterList.length === 0) {
                paguMasterList = fallbackPagu;
            }

            jurnalList = [];
            jurnalSnap.forEach((d) => {
                const data = d.data() || {};
                const ket = String(data.keterangan || "").toLowerCase();
                const ref = String(data.noRef || "").toUpperCase();
                if (ref.startsWith("KK-") || ket.includes("[kas keluar]")) {
                    jurnalList.push({ id: d.id, ...data });
                }
            });

            renderLaporanSheet();
        } catch (err) {
            if (isDisposed) return;
            console.warn("Menggunakan data pagu bawaan:", err);
            paguMasterList = fallbackPagu;
            jurnalList = [];
            renderLaporanSheet();
        }
    }

    const onPeriodeChange = (e) => {
        selectedPeriode = e.target.value || getCurrentMonthYm();
        renderLaporanSheet();
    };

    const onUnitChange = (e) => {
        selectedUnit = e.target.value;
        renderLaporanSheet();
    };

    const onSearchInput = (e) => {
        searchQuery = e.target.value;
        renderLaporanSheet();
    };

    const onCetakClick = () => {
        const printable = document.getElementById('lp-printable-area');
        if (!printable) return;
        const root = getOrCreatePrintRoot();
        root.innerHTML = printable.outerHTML;
        const onAfterPrint = () => {
            window.removeEventListener('afterprint', onAfterPrint);
            clearPrintRoot();
        };
        window.addEventListener('afterprint', onAfterPrint);
        requestAnimationFrame(() => window.print());
    };

    filterPeriode?.addEventListener('change', onPeriodeChange);
    filterUnit?.addEventListener('change', onUnitChange);
    searchInput?.addEventListener('input', onSearchInput);
    btnCetak?.addEventListener('click', onCetakClick);

    const cleanup = () => {
        isDisposed = true;
        clearPrintRoot();
        filterPeriode?.removeEventListener('change', onPeriodeChange);
        filterUnit?.removeEventListener('change', onUnitChange);
        searchInput?.removeEventListener('input', onSearchInput);
        btnCetak?.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        laporanPaguCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    laporanPaguCleanup = cleanup;

    renderLaporanSheet();
    Promise.all([fetchUnitsFromDB(), fetchPaguAndJurnal()]);

    return cleanup;
}