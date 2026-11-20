// File: assets/js/views/keuangan-laporan-kas.js
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const PAGE_SIZE = 3;

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function parseDigitsToNumber(val) {
    const cleaned = String(val ?? "").replace(/\D/g, "");
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function formatRibuanInput(val) {
    const raw = String(val ?? "").replace(/\D/g, "");
    if (!raw) return "";
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? Math.round(num).toLocaleString("id-ID") : "";
}

function formatRupiah(num) {
    return "Rp " + Math.max(0, Math.round(Number(num) || 0)).toLocaleString("id-ID");
}

function terbilangIndonesia(rawNum) {
    const num = Math.max(0, Math.floor(Number(rawNum) || 0));
    if (num === 0) return "Nol Rupiah";

    const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

    function eja(n) {
        if (n < 12) return satuan[n];
        if (n < 20) return `${satuan[n - 10]} Belas`;
        if (n < 100) return `${satuan[Math.floor(n / 10)]} Puluh ${eja(n % 10)}`.trim();
        if (n < 200) return `Seratus ${eja(n - 100)}`.trim();
        if (n < 1000) return `${satuan[Math.floor(n / 100)]} Ratus ${eja(n % 100)}`.trim();
        if (n < 2000) return `Seribu ${eja(n - 1000)}`.trim();
        if (n < 1000000) return `${eja(Math.floor(n / 1000))} Ribu ${eja(n % 1000)}`.trim();
        if (n < 1000000000) return `${eja(Math.floor(n / 1000000))} Juta ${eja(n % 1000000)}`.trim();
        if (n < 1000000000000) return `${eja(Math.floor(n / 1000000000))} Miliar ${eja(n % 1000000000)}`.trim();
        return `${eja(Math.floor(n / 1000000000000))} Triliun ${eja(n % 1000000000000)}`.trim();
    }

    return `${eja(num)} Rupiah`.replace(/\s+/g, " ");
}

function renderRincianAkunHtml(rincian = []) {
    const list = Array.isArray(rincian) ? rincian : [];
    if (list.length === 0) return "";

    const rowsHtml = list.map((baris) => {
        const kode = escapeHtml(baris?.kodeAkun || "-");
        const nama = escapeHtml(baris?.namaAkun || "Akun");
        const debetFmt = escapeHtml(formatRupiah(baris?.debet || 0));
        const kreditFmt = escapeHtml(formatRupiah(baris?.kredit || 0));

        return `
            <div class="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                <span class="select-none text-slate-400">&bull;</span>
                <div class="min-w-0 break-words">
                    <span class="font-bold text-slate-800 dark:text-slate-100">${kode}</span>
                    <span> - ${nama}: </span>
                    <span class="font-semibold text-indigo-600 dark:text-indigo-400">D: ${debetFmt}</span>
                    <span class="text-slate-400 mx-0.5">|</span>
                    <span class="font-semibold text-fuchsia-600 dark:text-fuchsia-400">K: ${kreditFmt}</span>
                </div>
            </div>
        `;
    }).join("");

    return `
        <div class="mt-1.5 ml-2 pl-2.5 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-0.5 rounded-none">
            ${rowsHtml}
        </div>
    `;
}

function buildBuktiKasKeluarHtml(item = {}) {
    const rincianArr = Array.isArray(item.rincian) ? item.rincian : [];
    const bebanRows = rincianArr.filter((r) => Number(r?.debet || 0) > 0);
    const sourceRows = bebanRows.length > 0 ? bebanRows : rincianArr;

    const uraianBersih = String(item.keterangan || "")
        .replace(/^\[kas\s*(masuk|keluar)\]\s*/i, "")
        .trim() || String(item.keterangan || "-");

    const entries = sourceRows.length > 0
        ? sourceRows.map((r) => {
            const nilai = Number(r?.debet || 0) > 0 ? Number(r.debet) : Number(r?.kredit || 0);
            return {
                perkiraan: `${r?.kodeAkun || ""} ${r?.namaAkun || ""}`.trim() || "-",
                uraian: uraianBersih,
                jumlah: nilai > 0 ? nilai : Number(item.nominal || 0)
            };
        })
        : [{
            perkiraan: "-",
            uraian: uraianBersih,
            jumlah: Number(item.nominal || 0)
        }];

    const minRows = 7;
    const totalRowsCount = Math.max(minRows, entries.length);
    const rowsHtml = Array.from({ length: totalRowsCount }).map((_, idx) => {
        const entry = entries[idx];
        const hasJumlah = entry && Number(entry.jumlah || 0) > 0;
        return `
            <tr>
                <td class="bkk-col-left"></td>
                <td class="bkk-col-perkiraan">${entry ? escapeHtml(entry.perkiraan) : ""}</td>
                <td class="bkk-col-uraian">${entry ? escapeHtml(entry.uraian) : ""}</td>
                <td class="bkk-col-jumlah">${hasJumlah ? escapeHtml(formatRupiah(entry.jumlah)) : ""}</td>
            </tr>
        `;
    }).join("");

    const totalNilai = Number(item.nominal || 0);
    const terbilangText = terbilangIndonesia(totalNilai);
    const totalFmt = formatRupiah(totalNilai);

    return `
        <div class="bkk-sheet">
            <table class="bkk-top-table">
                <tr>
                    <td class="bkk-dibayar">
                        <div class="bkk-label">Dibayarkan Kepada :</div>
                        <div class="bkk-val">${escapeHtml(item.pihak || "-")}</div>
                    </td>
                    <td class="bkk-judul">
                        <div class="bkk-judul-text">BUKTI KAS KELUAR</div>
                    </td>
                    <td class="bkk-meta">
                        <div class="bkk-meta-row">
                            <span class="bkk-meta-label">Nomor :</span>
                            <span class="bkk-meta-val">${escapeHtml(item.noRef || "-")}</span>
                        </div>
                        <div class="bkk-meta-row bkk-meta-row-last">
                            <span class="bkk-meta-label">Tanggal :</span>
                            <span class="bkk-meta-val">${escapeHtml(item.tgl || "-")}</span>
                        </div>
                    </td>
                </tr>
            </table>

            <table class="bkk-main-table">
                <thead>
                    <tr>
                        <th class="bkk-col-left"></th>
                        <th class="bkk-col-perkiraan">Perkiraan</th>
                        <th class="bkk-col-uraian"><span class="bkk-uraian-spaced">U R A I A N</span></th>
                        <th class="bkk-col-jumlah">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <table class="bkk-summary-table">
                <tr>
                    <td class="bkk-terbilang-cell">
                        <span class="bkk-summary-label">Terbilang :</span>
                        <span class="bkk-terbilang-val">${escapeHtml(terbilangText)}</span>
                    </td>
                    <td class="bkk-total-cell">
                        <span class="bkk-summary-label">Total :</span>
                        <span class="bkk-total-val">${escapeHtml(totalFmt)}</span>
                    </td>
                </tr>
            </table>

            <table class="bkk-footer-table">
                <tr>
                    <td class="bkk-catatan-cell" rowspan="2">
                        <div class="bkk-catatan-title">CATATAN :</div>
                        <div class="bkk-catatan-body">${escapeHtml(`Unit Usaha: ${item.unit || "-"}`)}</div>
                    </td>
                    <th class="bkk-ttd-th">Pembukuan</th>
                    <th class="bkk-ttd-th">Mengetahui</th>
                    <th class="bkk-ttd-th">Kasir</th>
                    <th class="bkk-ttd-th">Penerima</th>
                </tr>
                <tr>
                    <td class="bkk-ttd-box"></td>
                    <td class="bkk-ttd-box"></td>
                    <td class="bkk-ttd-box"></td>
                    <td class="bkk-ttd-box"></td>
                </tr>
            </table>
        </div>
    `;
}

export function renderKeuanganLaporanKas() {
    return `
        <style>
            @keyframes lkSmoothIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes lkRowFade {
                from { opacity: 0.35; }
                to { opacity: 1; }
            }
            .lk-smooth-enter {
                animation: lkSmoothIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .lk-data-fade {
                animation: lkRowFade 0.2s ease-out both;
            }
            #bkk-print-root {
                display: none;
            }
            @media print {
                body > *:not(#bkk-print-root) {
                    display: none !important;
                }
                #bkk-print-root {
                    display: block !important;
                    position: static;
                    width: 100%;
                    margin: 0;
                    padding: 8mm;
                    background: #ffffff !important;
                }
                .bkk-sheet {
                    width: 100%;
                    border: 1.5px solid #c81e1e;
                    color: #111827;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    background: #ffffff;
                }
                .bkk-top-table,
                .bkk-main-table,
                .bkk-summary-table,
                .bkk-footer-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }
                .bkk-top-table td {
                    border-bottom: 1.5px solid #c81e1e;
                    vertical-align: top;
                }
                .bkk-dibayar {
                    width: 28%;
                    padding: 6px 8px;
                    border-right: 1.5px solid #c81e1e;
                }
                .bkk-label {
                    font-size: 11px;
                    color: #111827;
                }
                .bkk-val {
                    margin-top: 4px;
                    font-weight: 700;
                    font-size: 11px;
                }
                .bkk-judul {
                    width: 42%;
                    text-align: center;
                    vertical-align: middle !important;
                    padding: 8px 6px;
                    border-right: 1.5px solid #c81e1e;
                }
                .bkk-judul-text {
                    color: #c81e1e;
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }
                .bkk-meta {
                    width: 30%;
                    padding: 0 !important;
                }
                .bkk-meta-row {
                    display: flex;
                    align-items: center;
                    padding: 5px 8px;
                    border-bottom: 1.5px solid #c81e1e;
                    min-height: 24px;
                }
                .bkk-meta-row-last {
                    border-bottom: none;
                }
                .bkk-meta-label {
                    width: 58px;
                    flex-shrink: 0;
                    color: #111827;
                }
                .bkk-meta-val {
                    font-weight: 600;
                }
                .bkk-main-table th,
                .bkk-main-table td {
                    border-right: 1.5px solid #c81e1e;
                    border-bottom: 1.5px solid #c81e1e;
                    padding: 5px 8px;
                    height: 22px;
                    vertical-align: middle;
                }
                .bkk-main-table th {
                    color: #111827;
                    font-weight: 600;
                    text-align: center;
                }
                .bkk-main-table th:last-child,
                .bkk-main-table td:last-child {
                    border-right: none;
                }
                .bkk-col-left {
                    width: 12%;
                }
                .bkk-col-perkiraan {
                    width: 18%;
                }
                .bkk-col-uraian {
                    width: 50%;
                }
                .bkk-col-jumlah {
                    width: 20%;
                    text-align: right !important;
                    font-weight: 600;
                }
                .bkk-uraian-spaced {
                    word-spacing: 8px;
                }
                .bkk-summary-table td {
                    border-bottom: 1.5px solid #c81e1e;
                    padding: 6px 8px;
                    vertical-align: middle;
                }
                .bkk-terbilang-cell {
                    width: 72%;
                    border-right: 1.5px solid #c81e1e;
                }
                .bkk-total-cell {
                    width: 28%;
                }
                .bkk-summary-label {
                    color: #c81e1e;
                    font-weight: 600;
                    margin-right: 6px;
                }
                .bkk-terbilang-val {
                    font-weight: 600;
                    font-style: italic;
                }
                .bkk-total-val {
                    font-weight: 700;
                    float: right;
                }
                .bkk-catatan-cell {
                    width: 34%;
                    border-right: 1.5px solid #c81e1e;
                    padding: 6px 8px;
                    vertical-align: top;
                }
                .bkk-catatan-title {
                    color: #c81e1e;
                    font-weight: 600;
                    text-decoration: underline;
                    margin-bottom: 4px;
                }
                .bkk-catatan-body {
                    font-size: 10.5px;
                    color: #374151;
                }
                .bkk-ttd-th {
                    width: 16.5%;
                    border-right: 1.5px solid #c81e1e;
                    border-bottom: 1.5px solid #c81e1e;
                    padding: 4px 6px;
                    text-align: center;
                    font-weight: 600;
                    color: #111827;
                }
                .bkk-ttd-th:last-child {
                    border-right: none;
                }
                .bkk-ttd-box {
                    border-right: 1.5px solid #c81e1e;
                    height: 54px;
                }
                .bkk-ttd-box:last-child {
                    border-right: none;
                }
            }
        </style>
        <div class="space-y-6 pb-10 max-w-7xl mx-auto lk-smooth-enter">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <a href="#/keuangan" data-link title="Kembali ke Keuangan" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Laporan Kas Masuk &amp; Kas Keluar</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Rekapitulasi mutasi kas operasional BUMKal berdasarkan periode dan unit usaha (3 baris per halaman).</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <button type="button" id="btn-cetak-laporan-kas" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span>Cetak / Print Laporan</span>
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs items-end">
                <div class="min-w-0">
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition-colors">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div class="min-w-0">
                    <label for="filter-jenis" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JENIS MUTASI</label>
                    <select id="filter-jenis" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition-colors">
                        <option value="">-- Semua (Masuk &amp; Keluar) --</option>
                        <option value="masuk">Kas Masuk Saja</option>
                        <option value="keluar">Kas Keluar Saja</option>
                    </select>
                </div>
                <div class="min-w-0">
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition-colors">
                </div>
                <div class="min-w-0">
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition-colors">
                </div>
                <div class="min-w-0">
                    <button type="button" id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Mutasi Kas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-emerald-800 text-white p-4 sm:p-5 rounded-none shadow-sm min-w-0 transition-colors">
                    <p class="text-[11px] uppercase tracking-widest text-emerald-200 font-semibold">Total Kas Masuk</p>
                    <h2 id="summary-kas-masuk" class="text-lg sm:text-xl font-extrabold mt-1 break-words transition-all duration-200">Rp 0</h2>
                </div>
                <div class="bg-rose-800 text-white p-4 sm:p-5 rounded-none shadow-sm min-w-0 transition-colors">
                    <p class="text-[11px] uppercase tracking-widest text-rose-200 font-semibold">Total Kas Keluar</p>
                    <h2 id="summary-kas-keluar" class="text-lg sm:text-xl font-extrabold mt-1 break-words transition-all duration-200">Rp 0</h2>
                </div>
                <div class="bg-indigo-900 text-white p-4 sm:p-5 rounded-none shadow-sm min-w-0 transition-colors">
                    <p class="text-[11px] uppercase tracking-widest text-indigo-200 font-semibold">Selisih / Saldo Bersih Periode Ini</p>
                    <h2 id="summary-saldo-bersih" class="text-lg sm:text-xl font-extrabold mt-1 break-words transition-all duration-200">Rp 0</h2>
                </div>
            </div>

            <!-- Bagian Rincian Data Mutasi Kas -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <span>RINCIAN MUTASI KAS MASUK &amp; KELUAR</span>
                    <span id="periode-label" class="text-slate-500 font-normal break-words">Periode: Semua Data</span>
                </div>

                <!-- 1. TAMPILAN DESKTOP: Tabel Standar -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-36">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold w-28 text-center">Jenis</th>
                                <th class="py-3 px-4 font-semibold w-36">Pihak Terkait</th>
                                <th class="py-3 px-4 font-semibold">Uraian / Keterangan &amp; Rincian Akun</th>
                                <th class="py-3 px-4 font-semibold text-right w-36">Kas Masuk (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-right w-36">Kas Keluar (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center w-44">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-laporan-kas-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="8" class="py-8 text-center text-slate-400">Memuat data laporan kas...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- 2. TAMPILAN HP: Card Versi Mobile -->
                <div id="card-laporan-kas-body" class="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data laporan kas...</div>
                </div>

                <!-- Navigasi Paginasi (3 Baris / Halaman) -->
                <div id="lk-pagination-bar" class="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span id="lk-page-info" class="text-slate-600 dark:text-slate-400 font-medium">Menampilkan 0 data</span>
                    <div class="flex items-center gap-1.5">
                        <button type="button" id="btn-lk-prev" class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-none transition cursor-pointer">
                            Sebelumnya
                        </button>
                        <span id="lk-page-indicator" class="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold rounded-none">
                            Hal 1 / 1
                        </span>
                        <button type="button" id="btn-lk-next" class="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-none transition cursor-pointer">
                            Berikutnya
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal Edit Transaksi Kas -->
            <div id="modal-edit-lk" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/60 p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
                    <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2">
                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Edit Transaksi Mutasi Kas</h3>
                            <p id="edit-lk-ref-label" class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5"></p>
                        </div>
                        <button type="button" id="btn-close-edit-lk" class="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-none cursor-pointer">
                            ✕
                        </button>
                    </div>
                    <form id="form-edit-lk" class="p-5 space-y-4 text-xs">
                        <input type="hidden" id="edit-lk-id">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="edit-lk-tgl" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                                <input type="date" id="edit-lk-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>
                            <div>
                                <label for="edit-lk-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                                <select id="edit-lk-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="">-- Pilih Unit Usaha --</option>
                                    <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                                    <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                                    <option value="KOMPOS (03)">KOMPOS (03)</option>
                                    <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="edit-lk-pihak" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PIHAK TERKAIT *</label>
                                <input type="text" id="edit-lk-pihak" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>
                            <div>
                                <label for="edit-lk-nominal" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TOTAL NOMINAL (Rp) *</label>
                                <input type="text" inputmode="numeric" id="edit-lk-nominal" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 text-right font-bold rounded-none focus:outline-none focus:border-indigo-600">
                            </div>
                        </div>
                        <div>
                            <label for="edit-lk-keterangan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">URAIAN / KETERANGAN *</label>
                            <input type="text" id="edit-lk-keterangan" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden">
                            <div class="bg-slate-50 dark:bg-slate-950 px-3 py-2 border-b border-slate-200 dark:border-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-200">
                                RINCIAN AKUN (DEBET &amp; KREDIT)
                            </div>
                            <div id="edit-lk-rincian-list" class="p-3 space-y-2 bg-white dark:bg-slate-900"></div>
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" id="btn-batal-edit-lk" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 rounded-none cursor-pointer">
                                Batal
                            </button>
                            <button type="submit" id="btn-simpan-edit-lk" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none cursor-pointer">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Konfirmasi Hapus Transaksi Kas -->
            <div id="modal-hapus-lk" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/60 p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md rounded-none overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-950/50 font-bold text-xs text-rose-700 dark:text-rose-300">
                        KONFIRMASI HAPUS TRANSAKSI
                    </div>
                    <div class="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                        <p>Apakah Mas Ismanto yakin ingin menghapus transaksi kas berikut dari jurnal?</p>
                        <div id="hapus-lk-detail" class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-1"></div>
                        <div class="flex justify-end gap-2 pt-3">
                            <button type="button" id="btn-batal-hapus-lk" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 rounded-none cursor-pointer">
                                Batal
                            </button>
                            <button type="button" id="btn-konfirmasi-hapus-lk" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none cursor-pointer">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-laporan-kas" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <span id="toast-laporan-kas-msg">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let laporanKasHashCleanup = null;
let laporanKasToastTimer = null;

export function initKeuanganLaporanKasHandler() {
    if (typeof laporanKasHashCleanup === 'function') {
        laporanKasHashCleanup();
        laporanKasHashCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterJenis = document.getElementById('filter-jenis');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-laporan-kas');

    const tableBody = document.getElementById('table-laporan-kas-body');
    const cardBody = document.getElementById('card-laporan-kas-body');
    const summaryMasuk = document.getElementById('summary-kas-masuk');
    const summaryKeluar = document.getElementById('summary-kas-keluar');
    const summaryBersih = document.getElementById('summary-saldo-bersih');
    const periodeLabel = document.getElementById('periode-label');

    const pageInfoEl = document.getElementById('lk-page-info');
    const pageIndicatorEl = document.getElementById('lk-page-indicator');
    const btnPrev = document.getElementById('btn-lk-prev');
    const btnNext = document.getElementById('btn-lk-next');

    const modalEdit = document.getElementById('modal-edit-lk');
    const formEdit = document.getElementById('form-edit-lk');
    const editIdInput = document.getElementById('edit-lk-id');
    const editRefLabel = document.getElementById('edit-lk-ref-label');
    const editTglInput = document.getElementById('edit-lk-tgl');
    const editUnitSelect = document.getElementById('edit-lk-unit');
    const editPihakInput = document.getElementById('edit-lk-pihak');
    const editNominalInput = document.getElementById('edit-lk-nominal');
    const editKetInput = document.getElementById('edit-lk-keterangan');
    const editRincianList = document.getElementById('edit-lk-rincian-list');
    const btnCloseEdit = document.getElementById('btn-close-edit-lk');
    const btnBatalEdit = document.getElementById('btn-batal-edit-lk');
    const btnSimpanEdit = document.getElementById('btn-simpan-edit-lk');

    const modalHapus = document.getElementById('modal-hapus-lk');
    const hapusDetailEl = document.getElementById('hapus-lk-detail');
    const btnBatalHapus = document.getElementById('btn-batal-hapus-lk');
    const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus-lk');

    let isDisposed = false;
    let allMutasiList = [];
    let currentFilteredData = [];
    let currentPage = 1;
    let editingItem = null;
    let deletingItem = null;

    function showToast(msg) {
        if (isDisposed) return;
        const toast = document.getElementById('toast-laporan-kas');
        const msgEl = document.getElementById('toast-laporan-kas-msg');
        if (!toast || !msgEl) return;
        if (laporanKasToastTimer) clearTimeout(laporanKasToastTimer);
        msgEl.textContent = msg;
        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');
        laporanKasToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function getOrCreatePrintRoot() {
        let root = document.getElementById('bkk-print-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'bkk-print-root';
            document.body.appendChild(root);
        }
        return root;
    }

    function clearPrintRoot() {
        const root = document.getElementById('bkk-print-root');
        if (root) {
            root.innerHTML = "";
        }
    }

    function cetakBuktiBaris(item) {
        if (!item) return;
        const root = getOrCreatePrintRoot();
        root.innerHTML = buildBuktiKasKeluarHtml(item);
        const onAfterPrint = () => {
            window.removeEventListener('afterprint', onAfterPrint);
            clearPrintRoot();
        };
        window.addEventListener('afterprint', onAfterPrint);
        requestAnimationFrame(() => {
            window.print();
        });
    }

    function openEditModal(item) {
        if (!item || !modalEdit) return;
        editingItem = item;
        if (editIdInput) editIdInput.value = item.id;
        if (editRefLabel) editRefLabel.textContent = `No. Ref: ${item.noRef || "-"} • Jenis: ${item.jenis === "masuk" ? "Kas Masuk" : "Kas Keluar"}`;
        if (editTglInput) editTglInput.value = item.tgl || "";
        if (editUnitSelect) editUnitSelect.value = item.unit || "";
        if (editPihakInput) editPihakInput.value = item.pihak || "";
        if (editNominalInput) editNominalInput.value = item.nominal > 0 ? formatRibuanInput(item.nominal) : "";
        if (editKetInput) editKetInput.value = item.keterangan || "";

        if (editRincianList) {
            const rincianArr = Array.isArray(item.rincian) ? item.rincian : [];
            if (rincianArr.length === 0) {
                editRincianList.innerHTML = `<div class="text-[11px] text-slate-400">Tidak ada rincian akun tersimpan (nominal akan disesuaikan otomatis saat simpan).</div>`;
            } else {
                editRincianList.innerHTML = rincianArr.map((r, idx) => `
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none" data-rincian-idx="${idx}">
                        <div class="sm:col-span-6 min-w-0">
                            <div class="font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(`${r?.kodeAkun || "-"} - ${r?.namaAkun || "Akun"}`)}</div>
                        </div>
                        <div class="sm:col-span-3">
                            <label class="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Debet</label>
                            <input type="text" inputmode="numeric" value="${escapeHtml(formatRibuanInput(r?.debet || 0))}" class="edit-r-debet w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 text-right rounded-none">
                        </div>
                        <div class="sm:col-span-3">
                            <label class="block text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-semibold">Kredit</label>
                            <input type="text" inputmode="numeric" value="${escapeHtml(formatRibuanInput(r?.kredit || 0))}" class="edit-r-kredit w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 text-right rounded-none">
                        </div>
                    </div>
                `).join("");

                editRincianList.querySelectorAll('.edit-r-debet, .edit-r-kredit').forEach((inp) => {
                    inp.addEventListener('input', () => {
                        inp.value = formatRibuanInput(inp.value);
                    });
                });
            }
        }

        modalEdit.classList.remove('hidden');
        modalEdit.classList.add('flex');
    }

    function closeEditModal() {
        editingItem = null;
        if (modalEdit) {
            modalEdit.classList.add('hidden');
            modalEdit.classList.remove('flex');
        }
    }

    function openHapusModal(item) {
        if (!item || !modalHapus) return;
        deletingItem = item;
        if (hapusDetailEl) {
            hapusDetailEl.innerHTML = `
                <div><span class="font-bold">Tanggal:</span> ${escapeHtml(item.tgl || "-")}</div>
                <div><span class="font-bold">Unit:</span> ${escapeHtml(item.unit || "-")}</div>
                <div><span class="font-bold">Pihak:</span> ${escapeHtml(item.pihak || "-")}</div>
                <div><span class="font-bold">Uraian:</span> ${escapeHtml(item.keterangan || "-")}</div>
                <div><span class="font-bold">Nominal:</span> ${escapeHtml(formatRupiah(item.nominal))}</div>
            `;
        }
        modalHapus.classList.remove('hidden');
        modalHapus.classList.add('flex');
    }

    function closeHapusModal() {
        deletingItem = null;
        if (modalHapus) {
            modalHapus.classList.add('hidden');
            modalHapus.classList.remove('flex');
        }
    }

    function triggerSmoothRefresh() {
        if (isDisposed) return;
        [tableBody, cardBody].forEach((el) => {
            if (!el) return;
            el.classList.remove('lk-data-fade');
            void el.offsetWidth;
            el.classList.add('lk-data-fade');
        });
    }

    function renderHalamanAktif() {
        if (isDisposed || !tableBody || !cardBody) return;

        const totalItems = currentFilteredData.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalItems);
        const pageItems = currentFilteredData.slice(startIdx, endIdx);

        if (pageInfoEl) {
            pageInfoEl.textContent = totalItems === 0
                ? "Menampilkan 0 data"
                : `Menampilkan ${startIdx + 1}–${endIdx} dari ${totalItems} transaksi (3 baris / halaman)`;
        }
        if (pageIndicatorEl) {
            pageIndicatorEl.textContent = `Hal ${currentPage} / ${totalPages}`;
        }
        if (btnPrev) {
            btnPrev.disabled = totalItems === 0 || currentPage <= 1;
        }
        if (btnNext) {
            btnNext.disabled = totalItems === 0 || currentPage >= totalPages;
        }

        if (pageItems.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400">Tidak ada data transaksi kas pada filter yang dipilih.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data transaksi kas pada filter yang dipilih.</div>`;
            triggerSmoothRefresh();
            return;
        }

        let htmlTable = "";
        pageItems.forEach((item, idx) => {
            const isMasuk = item.jenis === "masuk";
            const nomFmt = formatRupiah(item.nominal);
            const rincianHtml = renderRincianAkunHtml(item.rincian);
            const dataIdx = startIdx + idx;

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 align-top">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">${escapeHtml(item.tgl || '-')}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">${escapeHtml(item.unit)}</td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <span class="px-2 py-0.5 text-[11px] font-bold rounded-none ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                            ${isMasuk ? 'KAS MASUK' : 'KAS KELUAR'}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">${escapeHtml(item.pihak)}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 break-words">
                        <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(item.keterangan)}</div>
                        ${rincianHtml}
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ${isMasuk ? escapeHtml(nomFmt) : '-'}
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        ${!isMasuk ? escapeHtml(nomFmt) : '-'}
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <div class="inline-flex items-center justify-center gap-1">
                            <button type="button" data-cetak-idx="${dataIdx}" title="Cetak Bukti Kas" class="btn-cetak-baris px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Cetak
                            </button>
                            <button type="button" data-edit-idx="${dataIdx}" title="Edit Transaksi" class="btn-edit-baris px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" data-hapus-idx="${dataIdx}" title="Hapus Transaksi" class="btn-hapus-baris px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = htmlTable;

        let htmlCard = "";
        pageItems.forEach((item, idx) => {
            const isMasuk = item.jenis === "masuk";
            const nomFmt = formatRupiah(item.nominal);
            const rincianHtml = renderRincianAkunHtml(item.rincian);
            const dataIdx = startIdx + idx;

            htmlCard += `
                <div class="p-4 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150 min-w-0">
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-semibold text-slate-500 dark:text-slate-400">${escapeHtml(item.tgl || '-')}</span>
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded-none flex-shrink-0 ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                            ${isMasuk ? 'KAS MASUK' : 'KAS KELUAR'}
                        </span>
                    </div>
                    <div class="flex flex-wrap justify-between items-center gap-1.5">
                        <span class="text-slate-600 dark:text-slate-300 font-medium break-words">Unit: ${escapeHtml(item.unit)}</span>
                        <span class="font-semibold text-indigo-600 dark:text-indigo-400 break-words">${escapeHtml(item.pihak)}</span>
                    </div>
                    <div class="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-none border border-slate-100 dark:border-slate-800 leading-snug break-words">
                        <div class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(item.keterangan)}</div>
                        ${rincianHtml}
                    </div>
                    <div class="flex flex-wrap justify-between items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <span class="font-bold text-sm whitespace-nowrap ${isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                            ${escapeHtml(nomFmt)}
                        </span>
                        <div class="flex items-center gap-1.5">
                            <button type="button" data-cetak-idx="${dataIdx}" class="btn-cetak-baris px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Cetak
                            </button>
                            <button type="button" data-edit-idx="${dataIdx}" class="btn-edit-baris px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" data-hapus-idx="${dataIdx}" class="btn-hapus-baris px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        cardBody.innerHTML = htmlCard;

        [tableBody, cardBody].forEach((container) => {
            container.querySelectorAll('.btn-cetak-baris').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.getAttribute('data-cetak-idx'));
                    cetakBuktiBaris(currentFilteredData[idx]);
                });
            });
            container.querySelectorAll('.btn-edit-baris').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.getAttribute('data-edit-idx'));
                    openEditModal(currentFilteredData[idx]);
                });
            });
            container.querySelectorAll('.btn-hapus-baris').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.getAttribute('data-hapus-idx'));
                    openHapusModal(currentFilteredData[idx]);
                });
            });
        });

        triggerSmoothRefresh();
    }

    async function loadData() {
        try {
            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            if (isDisposed) return;

            allMutasiList = [];

            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data() || {};
                const ket = jData.keterangan ? String(jData.keterangan).toLowerCase() : "";
                const ref = jData.noRef ? String(jData.noRef).toUpperCase() : "";

                if (ref.startsWith("KM-") || ref.startsWith("KK-") || ket.includes("[kas masuk]") || ket.includes("[kas keluar]")) {
                    const jenis = (ref.startsWith("KM-") || ket.includes("[kas masuk]")) ? "masuk" : "keluar";
                    const rincianArr = Array.isArray(jData.rincian) ? jData.rincian : [];

                    let nominal = Number(jData.totalNilai || 0);
                    if (!nominal && rincianArr.length > 0) {
                        nominal = rincianArr.reduce((sum, r) => {
                            const dVal = Number(r?.debet || 0);
                            const kVal = Number(r?.kredit || 0);
                            return Math.max(sum, dVal, kVal);
                        }, 0);
                    }

                    allMutasiList.push({
                        id: docSnap.id,
                        noRef: jData.noRef || "",
                        tgl: jData.tglTransaksi || "",
                        unit: jData.unitUsaha || "-",
                        jenis,
                        pihakField: jData.pemberiDana !== undefined ? "pemberiDana" : "penerimaDana",
                        pihak: jData.pemberiDana || jData.penerimaDana || "-",
                        keterangan: jData.keterangan || "",
                        rincian: rincianArr,
                        nominal: Number.isFinite(nominal) && nominal > 0 ? nominal : 0
                    });
                }
            });

            prosesFilter(false);
        } catch (err) {
            if (isDisposed) return;
            console.error("Gagal memuat data laporan kas:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-rose-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    function prosesFilter(resetPage = true) {
        if (isDisposed || !tableBody || !cardBody) return;

        if (resetPage) {
            currentPage = 1;
        }

        const unitVal = filterUnit ? filterUnit.value : "";
        const jenisVal = filterJenis ? filterJenis.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";

        if (periodeLabel) {
            periodeLabel.textContent = `Periode: ${tglMulaiVal || 'Awal'} s.d. ${tglSampaiVal || 'Sekarang'} ${unitVal ? '(' + unitVal + ')' : ''}`;
        }

        let totalMasuk = 0;
        let totalKeluar = 0;
        const filteredData = [];

        allMutasiList.forEach(item => {
            if (unitVal && item.unit !== unitVal) return;
            if (jenisVal && item.jenis !== jenisVal) return;
            if (tglMulaiVal && item.tgl < tglMulaiVal) return;
            if (tglSampaiVal && item.tgl > tglSampaiVal) return;

            filteredData.push(item);
            if (item.jenis === "masuk") {
                totalMasuk += item.nominal;
            } else {
                totalKeluar += item.nominal;
            }
        });

        currentFilteredData = filteredData;

        const saldoBersih = totalMasuk - totalKeluar;

        if (summaryMasuk) summaryMasuk.textContent = formatRupiah(totalMasuk);
        if (summaryKeluar) summaryKeluar.textContent = formatRupiah(totalKeluar);
        if (summaryBersih) {
            summaryBersih.textContent = formatRupiah(saldoBersih);
            summaryBersih.className = saldoBersih >= 0
                ? "text-lg sm:text-xl font-extrabold mt-1 break-words text-white transition-all duration-200"
                : "text-lg sm:text-xl font-extrabold mt-1 break-words text-rose-300 transition-all duration-200";
        }

        renderHalamanAktif();
    }

    if (editNominalInput) {
        editNominalInput.addEventListener('input', () => {
            editNominalInput.value = formatRibuanInput(editNominalInput.value);
        });
    }

    if (btnCloseEdit) btnCloseEdit.addEventListener('click', closeEditModal);
    if (btnBatalEdit) btnBatalEdit.addEventListener('click', closeEditModal);
    if (btnBatalHapus) btnBatalHapus.addEventListener('click', closeHapusModal);

    if (formEdit) {
        formEdit.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!editingItem || !editingItem.id) return;

            const tglBaru = editTglInput ? editTglInput.value.trim() : "";
            const unitBaru = editUnitSelect ? editUnitSelect.value.trim() : "";
            const pihakBaru = editPihakInput ? editPihakInput.value.trim() : "";
            const ketBaru = editKetInput ? editKetInput.value.trim() : "";
            const nominalBaru = parseDigitsToNumber(editNominalInput ? editNominalInput.value : 0);

            if (!tglBaru || !unitBaru || !pihakBaru || !ketBaru || nominalBaru <= 0) {
                showToast("Lengkapi tanggal, unit usaha, pihak terkait, uraian, dan nominal > 0.");
                return;
            }

            let updatedRincian = Array.isArray(editingItem.rincian) ? [...editingItem.rincian] : [];
            if (editRincianList) {
                const rowEls = Array.from(editRincianList.querySelectorAll('[data-rincian-idx]'));
                if (rowEls.length > 0 && rowEls.length === updatedRincian.length) {
                    updatedRincian = updatedRincian.map((r, i) => {
                        const row = rowEls[i];
                        const dVal = parseDigitsToNumber(row.querySelector('.edit-r-debet')?.value || 0);
                        const kVal = parseDigitsToNumber(row.querySelector('.edit-r-kredit')?.value || 0);
                        return {
                            ...r,
                            debet: dVal,
                            kredit: kVal
                        };
                    });
                }
            }

            const periodeBaru = tglBaru.slice(0, 7);
            const payloadUpdate = {
                tglTransaksi: tglBaru,
                periode: periodeBaru,
                unitUsaha: unitBaru,
                [editingItem.pihakField]: pihakBaru,
                keterangan: ketBaru,
                totalNilai: nominalBaru,
                rincian: updatedRincian,
                updatedAt: new Date().toISOString()
            };

            if (btnSimpanEdit) {
                btnSimpanEdit.disabled = true;
                btnSimpanEdit.textContent = "Menyimpan...";
            }

            try {
                await updateDoc(doc(db, "jurnal_umum", editingItem.id), payloadUpdate);
                if (isDisposed) return;
                closeEditModal();
                showToast("Transaksi berhasil diperbarui.");
                await loadData();
            } catch (err) {
                console.error("Gagal mengupdate transaksi:", err);
                if (!isDisposed) showToast("Gagal menyimpan perubahan transaksi.");
            } finally {
                if (!isDisposed && btnSimpanEdit) {
                    btnSimpanEdit.disabled = false;
                    btnSimpanEdit.textContent = "Simpan Perubahan";
                }
            }
        });
    }

    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.addEventListener('click', async () => {
            if (!deletingItem || !deletingItem.id) return;

            btnKonfirmasiHapus.disabled = true;
            btnKonfirmasiHapus.textContent = "Menghapus...";

            try {
                await deleteDoc(doc(db, "jurnal_umum", deletingItem.id));
                if (isDisposed) return;
                closeHapusModal();
                showToast("Transaksi berhasil dihapus.");
                await loadData();
            } catch (err) {
                console.error("Gagal menghapus transaksi:", err);
                if (!isDisposed) showToast("Gagal menghapus transaksi.");
            } finally {
                if (!isDisposed && btnKonfirmasiHapus) {
                    btnKonfirmasiHapus.disabled = false;
                    btnKonfirmasiHapus.textContent = "Ya, Hapus";
                }
            }
        });
    }

    if (btnTampilkan) {
        btnTampilkan.onclick = () => prosesFilter(true);
    }

    if (btnPrev) {
        btnPrev.onclick = () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderHalamanAktif();
            }
        };
    }

    if (btnNext) {
        btnNext.onclick = () => {
            const totalPages = Math.max(1, Math.ceil(currentFilteredData.length / PAGE_SIZE));
            if (currentPage < totalPages) {
                currentPage += 1;
                renderHalamanAktif();
            }
        };
    }

    if (btnCetak) {
        btnCetak.onclick = () => {
            clearPrintRoot();
            window.print();
        };
    }

    const onHashChangeCleanup = () => {
        isDisposed = true;
        clearPrintRoot();
        if (laporanKasToastTimer) {
            clearTimeout(laporanKasToastTimer);
            laporanKasToastTimer = null;
        }
        window.removeEventListener('hashchange', onHashChangeCleanup);
        laporanKasHashCleanup = null;
    };
    window.addEventListener('hashchange', onHashChangeCleanup);
    laporanKasHashCleanup = onHashChangeCleanup;

    loadData();
}