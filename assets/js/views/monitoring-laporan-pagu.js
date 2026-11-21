// File: assets/js/views/monitoring-laporan-pagu.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const NAMA_BULAN = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

const ROWS_PER_PAGE = 5;

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

function buildYm(tahun, bulan) {
    const y = String(tahun || "").trim();
    const m = String(bulan || "").padStart(2, "0");
    if (!/^\d{4}$/.test(y) || !/^(0[1-9]|1[0-2])$/.test(m)) {
        return getCurrentMonthYm();
    }
    return `${y}-${m}`;
}

function formatRupiah(angka) {
    const nilai = Number(angka) || 0;
    return `Rp ${nilai.toLocaleString("id-ID")}`;
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

function formatPeriodeBulanJudul(periodeYm) {
    const fallbackYm = getCurrentMonthYm();
    const match = String(periodeYm || fallbackYm).match(/^(\d{4})-(\d{2})$/) || fallbackYm.match(/^(\d{4})-(\d{2})$/);
    if (!match) return "PERIODE BULAN INI";
    const tahun = match[1];
    const bulanIdx = Number(match[2]) - 1;
    const namaBulan = NAMA_BULAN[bulanIdx] || "JANUARI";
    return `PERIODE BULAN ${namaBulan} ${tahun}`;
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

function normalizeDateSortKey(dateStr) {
    const raw = String(dateStr || "").trim();
    if (!raw) return "9999-99-99";
    const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
    }
    const idMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (idMatch) {
        return `${idMatch[3]}-${idMatch[2].padStart(2, "0")}-${idMatch[1].padStart(2, "0")}`;
    }
    return raw.toLowerCase();
}

function compareByTanggalMasukAsc(a, b) {
    const dA = a.tglTransaksi || a.tanggal || "";
    const dB = b.tglTransaksi || b.tanggal || "";
    const kA = normalizeDateSortKey(dA);
    const kB = normalizeDateSortKey(dB);
    if (kA !== kB) {
        return kA.localeCompare(kB, "id");
    }
    const uA = String(a.keterangan || a.uraian || "").trim();
    const uB = String(b.keterangan || b.uraian || "").trim();
    return uA.localeCompare(uB, "id");
}

function extractYearFromDateStr(dateStr) {
    if (!dateStr) return null;
    const match = String(dateStr).match(/^(\d{4})/);
    if (match) return parseInt(match[1], 10);
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

function extractYmFromDateStr(dateStr) {
    const match = String(dateStr || "").match(/^(\d{4}-\d{2})/);
    return match ? match[1] : "";
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
        const ref = String(jurnalDoc.noRef || "").toUpperCase();
        const ket = String(jurnalDoc.keterangan || "").toLowerCase();
        if (
            jenis.includes("keluar") ||
            jenis.includes("beban") ||
            jenis.includes("expense") ||
            ref.startsWith("KK-") ||
            ket.includes("[kas keluar]")
        ) {
            total = parseFloat(jurnalDoc.totalDebet || jurnalDoc.total || jurnalDoc.totalNilai || jurnalDoc.nominal || 0) || 0;
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

function hitungRincianBulananUnit({ paguItem, jurnalList, periodeYm }) {
    const jumlahPagu = Number(paguItem.jumlahPagu) || 0;
    const startYear = Number(paguItem.tahunMulai) || Number(paguItem.tahun) || new Date().getFullYear();
    const endYear = Number(paguItem.tahunSelesai) || startYear;
    const pUnitUpper = String(paguItem.unitUsaha || "").trim().toUpperCase();

    let pengeluaranBulanSebelumnya = 0;
    let totalPengeluaranBulanIni = 0;
    let realisasiSampaiBulanIni = 0;
    const mutasiBulanIni = [];

    jurnalList.forEach((j) => {
        const jUnitUpper = String(j.unitUsaha || "").trim().toUpperCase();
        if (pUnitUpper && jUnitUpper && jUnitUpper !== pUnitUpper) return;

        const dateStr = j.tglTransaksi || j.tanggal || "";
        const jYm = extractYmFromDateStr(dateStr);
        const expenseVal = extractExpenseFromJurnal(j);

        if (expenseVal <= 0) return;

        if (periodeYm && jYm) {
            if (jYm < periodeYm) {
                pengeluaranBulanSebelumnya += expenseVal;
            } else if (jYm === periodeYm) {
                totalPengeluaranBulanIni += expenseVal;
                mutasiBulanIni.push({
                    ...j,
                    nilaiPengeluaran: expenseVal
                });
            }
            if (jYm <= periodeYm) {
                realisasiSampaiBulanIni += expenseVal;
            }
        } else if (!periodeYm) {
            totalPengeluaranBulanIni += expenseVal;
            realisasiSampaiBulanIni += expenseVal;
            mutasiBulanIni.push({
                ...j,
                nilaiPengeluaran: expenseVal
            });
        }
    });

    mutasiBulanIni.sort(compareByTanggalMasukAsc);

    const sisaBulanLalu = Math.max(0, jumlahPagu - pengeluaranBulanSebelumnya);
    const saldoAkhir = Math.max(0, sisaBulanLalu - totalPengeluaranBulanIni);

    return {
        unitUsaha: paguItem.unitUsaha || "-",
        startYear,
        endYear,
        periodeYm,
        jumlahPagu,
        sisaBulanLalu,
        totalPengeluaranBulanIni,
        realisasiSampaiBulanIni,
        saldoAkhir,
        mutasiBulanIni
    };
}

function buildAllPopRows({ jumlahPagu, sisaBulanLalu, mutasiBulanIni }) {
    const sortedMutasi = [...(mutasiBulanIni || [])].sort(compareByTanggalMasukAsc);
    const allRows = [];
    let runningSaldo = sisaBulanLalu;

    // Baris 1: Pagu Anggaran
    allRows.push({
        no: 1,
        tanggal: "",
        uraian: "Pagu Anggaran 2025/2026",
        pagu: jumlahPagu,
        pembelian: 0,
        sisaLalu: 0,
        saldo: null,
        boldUraian: true,
        boldPagu: true
    });

    // Baris 2: Sisa Anggaran Bulan Lalu
    allRows.push({
        no: 2,
        tanggal: "",
        uraian: "Sisa Anggaran Bulan Lalu",
        pagu: 0,
        pembelian: 0,
        sisaLalu: sisaBulanLalu,
        saldo: null,
        boldUraian: true,
        boldSisaLalu: true
    });

    // Baris 3 dst: Seluruh mutasi transaksi bulan terpilih (urutan A-Z tanggal masuk)
    sortedMutasi.forEach((trx) => {
        const pembelian = trx.nilaiPengeluaran || 0;
        runningSaldo = Math.max(0, runningSaldo - pembelian);
        const uraianBersih = String(trx.keterangan || trx.uraian || "-")
            .replace(/^\[kas\s*(masuk|keluar)\]\s*/i, "")
            .trim() || "-";

        allRows.push({
            no: allRows.length + 1,
            tanggal: trx.tglTransaksi || trx.tanggal || "",
            uraian: uraianBersih,
            pagu: 0,
            pembelian,
            sisaLalu: 0,
            saldo: runningSaldo
        });
    });

    return allRows;
}

function buildPopLaporanBulananHtml({
    unitUsaha,
    periodeYm,
    jumlahPagu,
    sisaBulanLalu,
    mutasiBulanIni,
    realisasiSampaiBulanIni,
    totalPengeluaranBulanIni,
    saldoAkhir,
    page = 1
}) {
    const unitTitle = String(unitUsaha || "SEMUA UNIT USAHA").toUpperCase();
    const periodeJudul = formatPeriodeBulanJudul(periodeYm);

    const allRows = buildAllPopRows({ jumlahPagu, sisaBulanLalu, mutasiBulanIni });
    const totalPages = Math.max(1, Math.ceil(allRows.length / ROWS_PER_PAGE));
    const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);

    const startIdx = (safePage - 1) * ROWS_PER_PAGE;
    const endIdx = Math.min(startIdx + ROWS_PER_PAGE, allRows.length);
    const pageRows = allRows.slice(startIdx, endIdx);

    // Akumulasi kumulatif dari halaman 1 sampai baris terakhir pada halaman aktif
    const rowsUpToCurrentPage = allRows.slice(0, endIdx);
    const totalPaguAkumulasi = rowsUpToCurrentPage.reduce((s, r) => s + (r.pagu || 0), 0);
    const totalPembelianAkumulasi = rowsUpToCurrentPage.reduce((s, r) => s + (r.pembelian || 0), 0);
    const totalSisaLaluAkumulasi = rowsUpToCurrentPage.reduce((s, r) => s + (r.sisaLalu || 0), 0);

    let lastSaldoAkumulasi = null;
    for (let i = rowsUpToCurrentPage.length - 1; i >= 0; i--) {
        if (rowsUpToCurrentPage[i].saldo !== null && rowsUpToCurrentPage[i].saldo !== undefined) {
            lastSaldoAkumulasi = rowsUpToCurrentPage[i].saldo;
            break;
        }
    }
    if (lastSaldoAkumulasi === null) {
        lastSaldoAkumulasi = sisaBulanLalu;
    }

    // Pastikan tiap halaman genap 5 baris
    while (pageRows.length < ROWS_PER_PAGE) {
        pageRows.push({
            no: "",
            tanggal: "",
            uraian: "",
            pagu: 0,
            pembelian: 0,
            sisaLalu: 0,
            saldo: null
        });
    }

    let bodyRowsHtml = "";
    pageRows.forEach((r) => {
        bodyRowsHtml += `
            <tr class="border-b border-slate-300">
                <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-center font-bold">${r.no ? escapeHtml(String(r.no)) : ""}</td>
                <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-center">${escapeHtml(r.tanggal)}</td>
                <td class="border-r-[1.5px] border-black px-3 py-2.5 ${r.boldUraian ? "font-bold" : ""}">${escapeHtml(r.uraian)}</td>
                <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right ${r.boldPagu ? "font-bold" : ""}">${escapeHtml(formatAngkaKosongJikaNol(r.pagu))}</td>
                <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right">${escapeHtml(formatAngkaKosongJikaNol(r.pembelian))}</td>
                <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right ${r.boldSisaLalu ? "font-bold" : ""}">${escapeHtml(formatAngkaKosongJikaNol(r.sisaLalu))}</td>
                <td class="px-2.5 py-2.5 text-right">${r.saldo !== null && r.saldo !== undefined ? escapeHtml(formatAngka(r.saldo)) : ""}</td>
            </tr>
        `;
    });

    bodyRowsHtml += `
        <tr class="border-t-[1.5px] border-black font-bold">
            <td class="border-r-[1.5px] border-black px-2.5 py-2.5"></td>
            <td class="border-r-[1.5px] border-black px-2.5 py-2.5"></td>
            <td class="border-r-[1.5px] border-black px-3 py-2.5">TOTAL</td>
            <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right">${escapeHtml(formatAngka(totalPaguAkumulasi))}</td>
            <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right">${escapeHtml(formatAngka(totalPembelianAkumulasi))}</td>
            <td class="border-r-[1.5px] border-black px-2.5 py-2.5 text-right">${escapeHtml(formatAngka(totalSisaLaluAkumulasi))}</td>
            <td class="px-2.5 py-2.5 text-right">${escapeHtml(formatAngka(lastSaldoAkumulasi))}</td>
        </tr>
    `;

    const navHtml = totalPages > 1 ? `
        <div class="mt-4 flex items-center justify-between text-xs border-t border-slate-200 pt-3">
            <span class="text-slate-600 font-semibold">Halaman ${safePage} dari ${totalPages} (Maks. ${ROWS_PER_PAGE} baris/halaman)</span>
            <div class="flex items-center gap-2">
                <button type="button" id="btn-pop-mlp-prev" ${safePage <= 1 ? "disabled" : ""}
                    class="px-3 py-1.5 border border-slate-400 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-none cursor-pointer">
                    Sebelumnya
                </button>
                <button type="button" id="btn-pop-mlp-next" ${safePage >= totalPages ? "disabled" : ""}
                    class="px-3 py-1.5 border border-slate-400 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-none cursor-pointer">
                    Berikutnya
                </button>
            </div>
        </div>
    ` : "";

    return `
        <div class="lp-pop-sheet min-w-[760px] text-black font-sans">
            <div class="text-center font-extrabold text-[13px] sm:text-[14px] leading-snug uppercase tracking-tight mb-5">
                <div>BUMKAL SINAR MITRA DESA</div>
                <div>LAPORAN BULANAN UNIT USAHA ${escapeHtml(unitTitle)}</div>
                <div>${escapeHtml(periodeJudul)}</div>
            </div>

            <table class="w-full border-collapse border-[1.5px] border-black text-[12px]">
                <thead>
                    <tr class="border-b-[1.5px] border-black font-bold text-center">
                        <th class="border-r-[1.5px] border-black px-2.5 py-2.5 w-10">NO</th>
                        <th class="border-r-[1.5px] border-black px-2.5 py-2.5 w-24">TANGGAL</th>
                        <th class="border-r-[1.5px] border-black px-3 py-2.5 text-center">URAIAN</th>
                        <th class="border-r-[1.5px] border-black px-2.5 py-2.5 w-28">PAGU<br>ANGGARAN</th>
                        <th class="border-r-[1.5px] border-black px-2.5 py-2.5 w-28">TOTAL<br>PEMBELIAN</th>
                        <th class="border-r-[1.5px] border-black px-2.5 py-2.5 w-32">SISA<br>ANGGARAN<br>BULAN LALU</th>
                        <th class="px-2.5 py-2.5 w-28">SALDO<br>ANGGARAN</th>
                    </tr>
                </thead>
                <tbody>
                    ${bodyRowsHtml}
                </tbody>
            </table>

            <div class="mt-4 mb-2 grid grid-cols-12 text-[12px] leading-relaxed">
                <div class="col-span-7 pl-12 pr-4 space-y-1">
                    <div>Pagu Anggaran</div>
                    <div>Saldo Anggaran</div>
                    <div>Realisasi Sampai Bulan ini</div>
                    <div>Total Pengeluaran Biaya Bulan ini</div>
                </div>
                <div class="col-span-3 pr-2 text-right font-semibold space-y-1">
                    <div>${escapeHtml(formatAngka(jumlahPagu))}</div>
                    <div class="border-b-[1.5px] border-black pb-0.5">${escapeHtml(formatAngka(saldoAkhir))}</div>
                    <div class="pt-0.5">${escapeHtml(formatAngka(realisasiSampaiBulanIni))}</div>
                    <div class="border-b-[1.5px] border-black pb-0.5">${escapeHtml(formatAngka(totalPengeluaranBulanIni))}</div>
                </div>
                <div class="col-span-2"></div>
            </div>

            ${navHtml}
        </div>
    `;
}

export function renderMonitoringLaporanPagu() {
    const currentYm = getCurrentMonthYm();

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
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Monitoring Pagu Anggaran</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">Pemantauan pagu multi-tahun/tahunan, sisa bulan lalu, realisasi, dan sisa anggaran per unit usaha.</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button type="button" id="btn-refresh-monitoring-pagu"
                        class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2 sm:py-2.5 rounded-none border border-slate-200 dark:border-slate-700 transition cursor-pointer text-center">
                        Muat Ulang
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-xs items-end">
                <div>
                    <label for="mon-pagu-filter-bulan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER BULAN TAHUN</label>
                    <input type="month" id="mon-pagu-filter-bulan" value="${escapeHtml(currentYm)}"
                        class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>

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
                                <th class="py-2.5 px-4 font-semibold text-right">Sisa Bulan Lalu</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Realisasi</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Sisa Pagu</th>
                                <th class="py-2.5 px-4 font-semibold">Serapan (%)</th>
                                <th class="py-2.5 px-4 font-semibold text-center">Status &amp; Detail</th>
                            </tr>
                        </thead>
                        <tbody id="table-monitoring-pagu-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="9" class="py-8 text-center text-slate-400">Memuat data monitoring pagu anggaran...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="card-monitoring-pagu-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data monitoring pagu anggaran...</div>
                </div>
            </div>

            <!-- POP / Modal Monitoring Bulanan Unit Usaha (5 Baris per Halaman) -->
            <div id="modal-pop-mlp" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/65 p-3 sm:p-6">
                <div class="bg-white text-black border border-slate-300 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col rounded-none overflow-hidden">
                    <div class="px-4 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div id="pop-mlp-header-title" class="text-xs font-bold uppercase tracking-wide truncate">
                            POP RINCIAN PAGU UNIT USAHA
                        </div>
                        <div class="flex flex-wrap items-center gap-2 text-xs flex-shrink-0">
                            <select id="pop-mlp-filter-bulan" aria-label="Filter Bulan POP"
                                class="bg-slate-800 border border-slate-600 text-white px-2.5 py-1.5 text-xs rounded-none focus:outline-none focus:border-indigo-400">
                                <option value="">--Pilih Bulan--</option>
                                <option value="01">Januari</option>
                                <option value="02">Februari</option>
                                <option value="03">Maret</option>
                                <option value="04">April</option>
                                <option value="05">Mei</option>
                                <option value="06">Juni</option>
                                <option value="07">Juli</option>
                                <option value="08">Agustus</option>
                                <option value="09">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>
                            <select id="pop-mlp-filter-tahun" aria-label="Filter Tahun POP"
                                class="bg-slate-800 border border-slate-600 text-white px-2.5 py-1.5 text-xs rounded-none focus:outline-none focus:border-indigo-400">
                            </select>
                            <button type="button" id="btn-pop-mlp-tutup"
                                class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-none transition cursor-pointer">
                                Tutup
                            </button>
                        </div>
                    </div>
                    <div id="pop-mlp-body" class="p-4 sm:p-6 overflow-auto flex-1 bg-white"></div>
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

    const filterBulanEl = document.getElementById("mon-pagu-filter-bulan");
    const filterUnitEl = document.getElementById("mon-pagu-filter-unit");
    const filterPeriodeEl = document.getElementById("mon-pagu-filter-periode");
    const filterStatusEl = document.getElementById("mon-pagu-filter-status");
    const btnResetFilter = document.getElementById("btn-reset-filter-pagu");
    const btnRefresh = document.getElementById("btn-refresh-monitoring-pagu");

    const kpiTotalPagu = document.getElementById("kpi-total-pagu");
    const kpiTotalRealisasi = document.getElementById("kpi-total-realisasi");
    const kpiSisaPagu = document.getElementById("kpi-sisa-pagu");
    const kpiPersenSerapan = document.getElementById("kpi-persen-serapan");
    const countLabel = document.getElementById("mon-pagu-count-label");

    const tableBody = document.getElementById("table-monitoring-pagu-body");
    const cardBody = document.getElementById("card-monitoring-pagu-body");

    const popModal = document.getElementById("modal-pop-mlp");
    const popHeaderTitle = document.getElementById("pop-mlp-header-title");
    const popFilterBulan = document.getElementById("pop-mlp-filter-bulan");
    const popFilterTahun = document.getElementById("pop-mlp-filter-tahun");
    const popBody = document.getElementById("pop-mlp-body");
    const btnPopTutup = document.getElementById("btn-pop-mlp-tutup");

    const currentYm = getCurrentMonthYm();
    if (filterBulanEl && !filterBulanEl.value) {
        filterBulanEl.value = currentYm;
    }

    let isDisposed = false;
    let paguDocs = [];
    let jurnalDocs = [];
    let currentFilteredRows = [];
    let activePopPaguItem = null;
    let activePopPage = 1;

    function populatePopYearOptions(baseYm) {
        if (!popFilterTahun) return;
        const nowYear = new Date().getFullYear();
        const yearSet = new Set([nowYear - 2, nowYear - 1, nowYear, nowYear + 1, nowYear + 2]);

        paguDocs.forEach((p) => {
            if (p.tahun) yearSet.add(Number(p.tahun));
            if (p.tahunMulai) yearSet.add(Number(p.tahunMulai));
            if (p.tahunSelesai) yearSet.add(Number(p.tahunSelesai));
        });

        jurnalDocs.forEach((j) => {
            const yr = extractYearFromDateStr(j.tglTransaksi || j.tanggal || "");
            if (yr) yearSet.add(yr);
        });

        const matchYm = String(baseYm || getCurrentMonthYm()).match(/^(\d{4})-(\d{2})$/);
        const activeYear = matchYm ? Number(matchYm[1]) : nowYear;
        yearSet.add(activeYear);

        const sortedYears = Array.from(yearSet)
            .filter((y) => !Number.isNaN(y) && y > 1990 && y < 2100)
            .sort((a, b) => b - a);

        popFilterTahun.innerHTML = sortedYears
            .map((y) => `<option value="${y}">${y}</option>`)
            .join("");
        popFilterTahun.value = String(activeYear);
    }

    function renderPopContent() {
        if (isDisposed || !activePopPaguItem || !popModal || !popBody) return;

        const fallbackYm = getCurrentMonthYm();
        const [defYear, defMonth] = fallbackYm.split("-");
        const chosenMonth = (popFilterBulan && popFilterBulan.value) ? popFilterBulan.value : defMonth;
        const chosenYear = (popFilterTahun && popFilterTahun.value) ? popFilterTahun.value : defYear;
        const ym = buildYm(chosenYear, chosenMonth);

        const rincian = hitungRincianBulananUnit({
            paguItem: activePopPaguItem,
            jurnalList: jurnalDocs,
            periodeYm: ym
        });

        const allRows = buildAllPopRows(rincian);
        const totalPages = Math.max(1, Math.ceil(allRows.length / ROWS_PER_PAGE));
        if (activePopPage > totalPages) activePopPage = totalPages;
        if (activePopPage < 1) activePopPage = 1;

        if (popHeaderTitle) {
            popHeaderTitle.textContent = `POP RINCIAN — ${rincian.unitUsaha} (${formatPeriodeBulanJudul(ym)})`;
        }

        popBody.innerHTML = buildPopLaporanBulananHtml({
            ...rincian,
            page: activePopPage
        });

        document.getElementById("btn-pop-mlp-prev")?.addEventListener("click", () => {
            if (activePopPage > 1) {
                activePopPage -= 1;
                renderPopContent();
            }
        });

        document.getElementById("btn-pop-mlp-next")?.addEventListener("click", () => {
            if (activePopPage < totalPages) {
                activePopPage += 1;
                renderPopContent();
            }
        });
    }

    function openPopLaporanRow(rowItem) {
        if (isDisposed || !rowItem || !popModal || !popBody) return;
        activePopPaguItem = rowItem.rawPagu || rowItem;
        activePopPage = 1;

        const activeYm = (filterBulanEl && filterBulanEl.value) ? filterBulanEl.value : getCurrentMonthYm();
        const matchYm = String(activeYm).match(/^(\d{4})-(\d{2})$/) || getCurrentMonthYm().match(/^(\d{4})-(\d{2})$/);

        populatePopYearOptions(activeYm);
        if (popFilterBulan && matchYm) {
            popFilterBulan.value = matchYm[2];
        }
        if (popFilterTahun && matchYm) {
            popFilterTahun.value = matchYm[1];
        }

        renderPopContent();
        popModal.classList.remove("hidden");
        popModal.classList.add("flex");
    }

    function closePopLaporan() {
        activePopPaguItem = null;
        activePopPage = 1;
        if (popModal) {
            popModal.classList.add("hidden");
            popModal.classList.remove("flex");
        }
    }

    function populatePeriodeOptions(rows) {
        if (!filterPeriodeEl) return;
        const currentVal = filterPeriodeEl.value;
        const setPeriode = new Set();

        rows.forEach((r) => {
            if (r.periodeLabel) setPeriode.add(r.periodeLabel);
        });

        const sorted = Array.from(setPeriode).sort((a, b) => b.localeCompare(a));
        filterPeriodeEl.innerHTML = `<option value="">-- Semua Periode --</option>` +
            sorted.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join("");

        if (currentVal && setPeriode.has(currentVal)) {
            filterPeriodeEl.value = currentVal;
        }
    }

    function computeMonitoringRows() {
        const selectedYm = (filterBulanEl && filterBulanEl.value) ? filterBulanEl.value : "";

        return paguDocs
            .map((p) => {
                const jumlahPagu = Number(p.jumlahPagu) || 0;
                const startYear = Number(p.tahunMulai) || Number(p.tahun) || new Date().getFullYear();
                const endYear = Number(p.tahunSelesai) || startYear;
                const periodeLabel = formatPeriodeTahun(startYear, endYear, p.tahun);
                const pUnitUpper = String(p.unitUsaha || "").trim().toUpperCase();

                let pengeluaranBulanSebelumnya = 0;
                let totalPengeluaranBulanIni = 0;
                let realisasiSampaiBulanIni = 0;
                let realisasiRentangTahun = 0;

                jurnalDocs.forEach((j) => {
                    const jUnitUpper = String(j.unitUsaha || "").trim().toUpperCase();
                    if (pUnitUpper && jUnitUpper && jUnitUpper !== pUnitUpper) return;

                    const dateStr = j.tglTransaksi || j.tanggal || "";
                    const jYear = extractYearFromDateStr(dateStr);
                    const jYm = extractYmFromDateStr(dateStr);
                    const expenseVal = extractExpenseFromJurnal(j);

                    if (expenseVal <= 0) return;

                    if (jYear === null || (jYear >= startYear && jYear <= endYear)) {
                        realisasiRentangTahun += expenseVal;
                    }

                    if (selectedYm && jYm) {
                        if (jYm < selectedYm) {
                            pengeluaranBulanSebelumnya += expenseVal;
                        } else if (jYm === selectedYm) {
                            totalPengeluaranBulanIni += expenseVal;
                        }
                        if (jYm <= selectedYm) {
                            realisasiSampaiBulanIni += expenseVal;
                        }
                    } else if (!selectedYm) {
                        totalPengeluaranBulanIni += expenseVal;
                        realisasiSampaiBulanIni += expenseVal;
                    }
                });

                const sisaBulanLalu = Math.max(0, jumlahPagu - pengeluaranBulanSebelumnya);
                const realisasi = selectedYm ? realisasiSampaiBulanIni : realisasiRentangTahun;
                const sisaPagu = jumlahPagu - realisasi;
                const pct = jumlahPagu > 0 ? (realisasi / jumlahPagu) * 100 : 0;
                const statusKey = pct >= 90 ? "kritis" : pct >= 70 ? "perhatian" : "aman";
                const badge = getStatusBadge(pct);

                return {
                    id: p.id,
                    rawPagu: p,
                    unitUsaha: p.unitUsaha || "-",
                    tahunMulai: startYear,
                    tahunSelesai: endYear,
                    periodeLabel,
                    jumlahPagu,
                    sisaBulanLalu,
                    totalPengeluaranBulanIni,
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
        if (isDisposed) return;

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

        currentFilteredRows = filtered;

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
                tableBody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-400">Tidak ada data pagu anggaran sesuai filter.</td></tr>`;
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
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">${escapeHtml(r.unitUsaha)}</td>
                    <td class="py-3 px-4">${escapeHtml(r.periodeLabel)}</td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${formatRupiah(r.jumlahPagu)}</td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">${formatRupiah(r.sisaBulanLalu)}</td>
                    <td class="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">${formatRupiah(r.realisasi)}</td>
                    <td class="py-3 px-4 text-right ${sisaClass}">${formatRupiah(r.sisaPagu)}</td>
                    <td class="py-3 px-4 min-w-[120px]">
                        <div class="flex items-center justify-between text-[11px] font-semibold mb-1">
                            <span>${r.pct.toFixed(1)}%</span>
                        </div>
                        <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                            <div class="h-full ${r.badge.barCls}" style="width: ${clampedBar}%;"></div>
                        </div>
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <div class="inline-flex items-center justify-center gap-1.5">
                            <span class="px-2 py-0.5 text-[10px] font-bold rounded-none ${r.badge.cls}">${escapeHtml(r.badge.label)}</span>
                            <button type="button" data-pop-idx="${idx}" class="btn-detail-pop-mlp px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-none transition cursor-pointer">
                                Detail
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-3.5 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div class="flex items-start justify-between gap-2">
                        <span class="font-bold text-slate-800 dark:text-slate-100 break-words">${escapeHtml(r.unitUsaha)}</span>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <span class="px-2 py-0.5 text-[10px] font-bold rounded-none ${r.badge.cls}">${escapeHtml(r.badge.label)}</span>
                            <button type="button" data-pop-idx="${idx}" class="btn-detail-pop-mlp px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold rounded-none transition cursor-pointer">
                                Detail
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Periode: <strong class="text-slate-700 dark:text-slate-200">${escapeHtml(r.periodeLabel)}</strong></span>
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
                            <span class="text-slate-500">Sisa Bulan Lalu</span>
                            <span class="font-bold text-slate-700 dark:text-slate-200">${formatRupiah(r.sisaBulanLalu)}</span>
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

        [tableBody, cardBody].forEach((container) => {
            if (!container) return;
            container.querySelectorAll(".btn-detail-pop-mlp").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const idx = Number(btn.getAttribute("data-pop-idx"));
                    openPopLaporanRow(currentFilteredRows[idx]);
                });
            });
        });
    }

    async function loadAllData() {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-400">Memuat data pagu &amp; jurnal...</td></tr>`;
        }
        if (cardBody) {
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Memuat data pagu &amp; jurnal...</div>`;
        }

        try {
            const paguQuery = query(collection(db, "pagu_anggaran"), orderBy("tahun", "desc"));
            const paguSnap = await getDocs(paguQuery);
            if (isDisposed) return;
            const loadedPagu = [];
            paguSnap.forEach((docSnap) => {
                const d = docSnap.data() || {};
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
            if (isDisposed) return;
            const loadedJurnal = [];
            jurnalSnap.forEach((docSnap) => {
                loadedJurnal.push({ id: docSnap.id, ...(docSnap.data() || {}) });
            });
            jurnalDocs = loadedJurnal;
        } catch (err) {
            console.warn("Gagal memuat koleksi jurnal_umum:", err);
            jurnalDocs = [];
        }

        renderMonitoringView();
        if (activePopPaguItem) {
            renderPopContent();
        }
    }

    const onFilterChange = () => renderMonitoringView();
    const onPopFilterChange = () => {
        activePopPage = 1;
        renderPopContent();
    };
    const onResetClick = () => {
        if (filterBulanEl) filterBulanEl.value = getCurrentMonthYm();
        if (filterUnitEl) filterUnitEl.value = "";
        if (filterPeriodeEl) filterPeriodeEl.value = "";
        if (filterStatusEl) filterStatusEl.value = "";
        renderMonitoringView();
    };
    const onRefreshClick = () => loadAllData();

    filterBulanEl?.addEventListener("change", onFilterChange);
    filterUnitEl?.addEventListener("change", onFilterChange);
    filterPeriodeEl?.addEventListener("change", onFilterChange);
    filterStatusEl?.addEventListener("change", onFilterChange);
    popFilterBulan?.addEventListener("change", onPopFilterChange);
    popFilterTahun?.addEventListener("change", onPopFilterChange);
    btnResetFilter?.addEventListener("click", onResetClick);
    btnRefresh?.addEventListener("click", onRefreshClick);
    btnPopTutup?.addEventListener("click", closePopLaporan);

    const cleanup = () => {
        isDisposed = true;
        closePopLaporan();
        filterBulanEl?.removeEventListener("change", onFilterChange);
        filterUnitEl?.removeEventListener("change", onFilterChange);
        filterPeriodeEl?.removeEventListener("change", onFilterChange);
        filterStatusEl?.removeEventListener("change", onFilterChange);
        popFilterBulan?.removeEventListener("change", onPopFilterChange);
        popFilterTahun?.removeEventListener("change", onPopFilterChange);
        btnResetFilter?.removeEventListener("click", onResetClick);
        btnRefresh?.removeEventListener("click", onRefreshClick);
        btnPopTutup?.removeEventListener("click", closePopLaporan);
        window.removeEventListener("hashchange", cleanup);
        monitoringLaporanPaguCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    monitoringLaporanPaguCleanup = cleanup;

    loadAllData();

    return cleanup;
}