// File: assets/js/views/laporan-laba-rugi.js
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

export function renderLaporanLabaRugi() {
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
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Laporan Laba / Rugi (Income Statement)</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Rekapitulasi pendapatan, HPP, dan beban operasional BUMKal urut kode akun per level.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto flex-wrap flex-shrink-0">
                    <button id="btn-toggle-all-level" type="button" class="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-none transition cursor-pointer">
                        Buka / Tutup Detail
                    </button>
                    <button id="btn-cetak-laba-rugi" type="button" class="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span>Cetak / Print Laporan</span>
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs items-end">
                <div class="min-w-0">
                    <label for="filter-level" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">LEVEL RINCIAN</label>
                    <select id="filter-level" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="1" selected>Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                    </select>
                </div>
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
                    <button id="btn-tampilkan" type="button" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Laba / Rugi Bersih -->
            <div id="summary-card" class="bg-indigo-900 text-white p-4 sm:p-6 rounded-none shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="min-w-0">
                    <p id="label-status-laba" class="text-[11px] sm:text-xs uppercase tracking-widest text-indigo-200 font-semibold">Hasil Usaha Bersih (Laba / Rugi)</p>
                    <h2 id="summary-laba-rugi-val" class="text-xl sm:text-2xl font-extrabold mt-1 break-words">Rp 0</h2>
                </div>
                <div>
                    <span id="badge-status-laba" class="inline-block px-3 py-1 bg-indigo-800 text-indigo-100 font-bold text-xs uppercase rounded-none">Menunggu Proses</span>
                </div>
            </div>

            <!-- Tabel Laporan Struktur Level & Kode Akun -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                <th class="py-3 px-4 sm:px-5 font-semibold">URAIAN / NAMA AKUN</th>
                                <th class="py-3 px-4 sm:px-5 font-semibold text-right w-40 sm:w-52">BULAN BERJALAN</th>
                            </tr>
                        </thead>
                        <tbody id="table-laba-rugi-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="2" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

let labaRugiCleanup = null;

export function initLaporanLabaRugiHandler() {
    if (typeof labaRugiCleanup === "function") {
        labaRugiCleanup();
        labaRugiCleanup = null;
    }

    const filterLevel = document.getElementById('filter-level');
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnToggleAllLevel = document.getElementById('btn-toggle-all-level');
    const btnCetak = document.getElementById('btn-cetak-laba-rugi');

    const tableBody = document.getElementById('table-laba-rugi-body');
    const summaryLabaRugiVal = document.getElementById('summary-laba-rugi-val');
    const badgeStatusLaba = document.getElementById('badge-status-laba');
    const labelStatusLaba = document.getElementById('label-status-laba');

    let coaList = [];
    let saldoAwalList = [];
    let allJurnalList = [];
    const collapsedHeaders = new Set();

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

            prosesLabaRugi();
        } catch (err) {
            console.error("Gagal memuat data laporan laba rugi:", err);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="2" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            }
        }
    }

    function inferLevel(coa) {
        const explicitLevel = parseInt(coa.levelAkun, 10);
        if (!Number.isNaN(explicitLevel) && explicitLevel >= 1 && explicitLevel <= 4) {
            return explicitLevel;
        }
        const segCount = String(coa.kodeAkun || "").trim().split(".").filter(Boolean).length;
        return Math.min(Math.max(segCount || 1, 1), 4);
    }

    function classifyGroup(coa) {
        const reportGroup = String(coa.reportGroup || "").toLowerCase();
        const namaLower = String(coa.namaAkun || "").toLowerCase();
        const kategori = String(coa.kategori || "").toLowerCase();
        const kode = String(coa.kodeAkun || "").trim();
        const root = kode.split(".")[0] || "";

        if (
            reportGroup.includes("hpp") ||
            reportGroup.includes("harga pokok") ||
            namaLower.includes("hpp") ||
            namaLower.includes("harga pokok") ||
            kategori.includes("hpp") ||
            root === "5"
        ) {
            return "hpp";
        }

        if (
            reportGroup.includes("pendapatan") ||
            namaLower.includes("pendapatan") ||
            namaLower.includes("penjualan") ||
            kategori.includes("pendapatan") ||
            root === "4" ||
            root === "8"
        ) {
            return "pendapatan";
        }

        const isExpense =
            reportGroup.includes("beban") ||
            reportGroup.includes("biaya") ||
            reportGroup.includes("laba") ||
            reportGroup.includes("rugi") ||
            namaLower.includes("beban") ||
            namaLower.includes("biaya") ||
            kategori.includes("beban") ||
            kategori.includes("biaya") ||
            ["6", "7", "9"].includes(root);

        return isExpense ? "beban" : "";
    }

    function formatNominalPersen(amount, basePendapatan) {
        const amt = Number(amount) || 0;
        const pct = basePendapatan > 0 ? ((amt / basePendapatan) * 100).toFixed(1) : "0.0";
        return `${amt.toLocaleString('id-ID')} <span class="text-slate-400 dark:text-slate-500 font-normal">(${pct}%)</span>`;
    }

    function prosesLabaRugi() {
        if (!tableBody) return;

        const selectedLevel = filterLevel ? parseInt(filterLevel.value, 10) || 1 : 1;
        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        const sortedCoa = [...coaList].sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));
        const nodesByCode = {};

        sortedCoa.forEach(coa => {
            const kode = String(coa.kodeAkun || "").trim();
            if (!kode) return;
            const group = classifyGroup(coa);
            if (!group) return;

            nodesByCode[kode] = {
                kodeAkun: kode,
                namaAkun: coa.namaAkun || `Akun ${kode}`,
                level: inferLevel(coa),
                group: group,
                headerInduk: String(coa.headerInduk || "").trim(),
                rawDebet: 0,
                rawKredit: 0,
                aggDebet: 0,
                aggKredit: 0,
                saldo: 0
            };
        });

        // Akumulasi saldo awal
        saldoAwalList.forEach(sa => {
            if (unitVal && sa.unitUsaha && sa.unitUsaha !== unitVal) return;
            if (periodeSampai && sa.periode && String(sa.periode) > periodeSampai) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (nodesByCode[kode]) {
                nodesByCode[kode].rawDebet += parseFloat(sa.debit) || 0;
                nodesByCode[kode].rawKredit += parseFloat(sa.kredit) || 0;
            }
        });

        // Akumulasi jurnal umum
        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglMulaiVal && item.tglTransaksi && item.tglTransaksi < tglMulaiVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (nodesByCode[kode]) {
                        nodesByCode[kode].rawDebet += parseFloat(r.debet) || 0;
                        nodesByCode[kode].rawKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        const allNodes = Object.values(nodesByCode).sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));

        function findParentCode(node) {
            if (node.headerInduk && nodesByCode[node.headerInduk] && node.headerInduk !== node.kodeAkun) {
                return node.headerInduk;
            }
            const parts = node.kodeAkun.split(".");
            for (let len = parts.length - 1; len >= 1; len--) {
                const prefix = parts.slice(0, len).join(".");
                if (nodesByCode[prefix] && prefix !== node.kodeAkun) {
                    return prefix;
                }
            }
            return "";
        }

        allNodes.forEach(n => {
            n.aggDebet = n.rawDebet;
            n.aggKredit = n.rawKredit;
        });

        const byDeepestFirst = [...allNodes].sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return compareKodeAkun(b.kodeAkun, a.kodeAkun);
        });

        byDeepestFirst.forEach(n => {
            const pCode = findParentCode(n);
            if (pCode && nodesByCode[pCode]) {
                nodesByCode[pCode].aggDebet += n.aggDebet;
                nodesByCode[pCode].aggKredit += n.aggKredit;
            }
        });

        allNodes.forEach(n => {
            n.saldo = n.group === "pendapatan"
                ? (n.aggKredit - n.aggDebet)
                : (n.aggDebet - n.aggKredit);
        });

        const level1Nodes = allNodes.filter(n => n.level === 1);
        const sumByGroup = (grpName) => {
            const lv1Matches = level1Nodes.filter(n => n.group === grpName);
            if (lv1Matches.length > 0) {
                return lv1Matches.reduce((acc, item) => acc + item.saldo, 0);
            }
            return allNodes
                .filter(n => n.group === grpName && !findParentCode(n))
                .reduce((acc, item) => acc + item.saldo, 0);
        };

        const totalPendapatan = sumByGroup("pendapatan");
        const totalHpp = sumByGroup("hpp");
        const labaKotor = totalPendapatan - totalHpp;
        const totalBeban = sumByGroup("beban");
        const labaRugiBersih = labaKotor - totalBeban;

        if (summaryLabaRugiVal) {
            summaryLabaRugiVal.textContent = `Rp ${Math.abs(labaRugiBersih).toLocaleString('id-ID')}`;
        }

        if (badgeStatusLaba && labelStatusLaba) {
            if (labaRugiBersih > 0) {
                labelStatusLaba.textContent = "KEUNTUNGAN BERSIH (LABA)";
                badgeStatusLaba.textContent = "LABA";
                badgeStatusLaba.className = "inline-block px-3 py-1 bg-emerald-600 text-white font-bold text-xs uppercase rounded-none";
            } else if (labaRugiBersih < 0) {
                labelStatusLaba.textContent = "KERUGIAN BERSIH (RUGI)";
                badgeStatusLaba.textContent = "RUGI";
                badgeStatusLaba.className = "inline-block px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase rounded-none";
            } else {
                labelStatusLaba.textContent = "HASIL USAHA BERSIH (IMPAS)";
                badgeStatusLaba.textContent = "BREAK EVEN";
                badgeStatusLaba.className = "inline-block px-3 py-1 bg-amber-600 text-white font-bold text-xs uppercase rounded-none";
            }
        }

        const childrenMap = {};
        allNodes.forEach(n => {
            const pCode = findParentCode(n);
            if (!childrenMap[pCode]) childrenMap[pCode] = [];
            childrenMap[pCode].push(n);
        });
        Object.keys(childrenMap).forEach(k => {
            childrenMap[k].sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));
        });

        // Kumpulkan semua turunan di bawah rootNode lalu saring agar HANYA level === selectedLevel yang tampil
        function getExactLevelDescendants(rootKode) {
            const result = [];
            function traverse(parentCode) {
                const kids = childrenMap[parentCode] || [];
                kids.forEach(kid => {
                    if (kid.level === selectedLevel) {
                        result.push(kid);
                    }
                    if (kid.level < selectedLevel) {
                        traverse(kid.kodeAkun);
                    }
                });
            }
            traverse(rootKode);
            return result.sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));
        }

        function renderHeaderAndAccounts(rootNode) {
            const isCollapsed = collapsedHeaders.has(rootNode.kodeAkun);
            const exactAccounts = selectedLevel >= 2 ? getExactLevelDescendants(rootNode.kodeAkun) : [];
            const hasToggle = selectedLevel >= 2 && exactAccounts.length > 0;
            const toggleIcon = hasToggle ? (isCollapsed ? "+" : "-") : "";

            let rowsHtml = `
                <tr class="bg-white dark:bg-slate-900">
                    <td colspan="2" class="pt-4 pb-2 px-4 sm:px-5">
                        <button type="button" data-collapse-code="${escapeHtml(rootNode.kodeAkun)}" class="btn-collapse-header inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left">
                            ${toggleIcon ? `<span class="w-4 h-4 inline-flex items-center justify-center border border-slate-300 dark:border-slate-700 text-[10px] font-bold rounded-none flex-shrink-0">${toggleIcon}</span>` : ""}
                            <span class="break-words">${escapeHtml(rootNode.namaAkun)}</span>
                        </button>
                    </td>
                </tr>
            `;

            if (!isCollapsed && exactAccounts.length > 0) {
                exactAccounts.forEach((acc, idx) => {
                    const zebraClass = idx % 2 === 1 ? "bg-slate-50/80 dark:bg-slate-950/40" : "bg-white dark:bg-slate-900";
                    rowsHtml += `
                        <tr class="${zebraClass} hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition">
                            <td class="py-2.5 pl-6 sm:pl-8 pr-3 sm:pr-4 text-slate-700 dark:text-slate-300 break-words">
                                <span class="text-sky-600 dark:text-sky-400 font-semibold mr-1.5">${escapeHtml(acc.kodeAkun)}</span>
                                <span>${escapeHtml(acc.namaAkun)}</span>
                            </td>
                            <td class="py-2.5 px-4 sm:px-5 text-right font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                ${formatNominalPersen(acc.saldo, totalPendapatan)}
                            </td>
                        </tr>
                    `;
                });
            }

            rowsHtml += `
                <tr class="bg-slate-50/60 dark:bg-slate-950/60 font-bold text-slate-900 dark:text-slate-100">
                    <td class="py-3 px-4 sm:px-5 break-words">Total ${escapeHtml(rootNode.namaAkun)}</td>
                    <td class="py-3 px-4 sm:px-5 text-right whitespace-nowrap">${formatNominalPersen(rootNode.saldo, totalPendapatan)}</td>
                </tr>
            `;

            return rowsHtml;
        }

        const topRoots = (childrenMap[""] || [])
            .filter(n => n.level === 1)
            .sort((a, b) => compareKodeAkun(a.kodeAkun, b.kodeAkun));

        if (topRoots.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="2" class="py-6 text-center text-slate-400">Belum ada akun Level 1 Laba / Rugi di master COA.</td></tr>`;
            return;
        }

        let html = "";
        let insertedLabaKotor = false;
        const hasHppGroup = topRoots.some(r => r.group === "hpp");

        topRoots.forEach(rootNode => {
            html += renderHeaderAndAccounts(rootNode);

            if (hasHppGroup && rootNode.group === "hpp" && !insertedLabaKotor) {
                insertedLabaKotor = true;
                html += `
                    <tr class="bg-slate-100/80 dark:bg-slate-800/70 font-extrabold text-slate-900 dark:text-slate-100">
                        <td class="py-3 px-4 sm:px-5 uppercase tracking-wide">LABA KOTOR</td>
                        <td class="py-3 px-4 sm:px-5 text-right whitespace-nowrap">${formatNominalPersen(labaKotor, totalPendapatan)}</td>
                    </tr>
                `;
            }
        });

        html += `
            <tr class="bg-indigo-50/80 dark:bg-indigo-950/50 font-extrabold text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
                <td class="py-3.5 px-4 sm:px-5 uppercase tracking-wide">LABA / RUGI BERSIH</td>
                <td class="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">${formatNominalPersen(labaRugiBersih, totalPendapatan)}</td>
            </tr>
        `;

        tableBody.innerHTML = html;

        document.querySelectorAll('.btn-collapse-header').forEach(btn => {
            btn.onclick = () => {
                const code = btn.getAttribute('data-collapse-code');
                if (!code) return;
                if (collapsedHeaders.has(code)) {
                    collapsedHeaders.delete(code);
                } else {
                    collapsedHeaders.add(code);
                }
                prosesLabaRugi();
            };
        });
    }

    const onTampilkanClick = () => prosesLabaRugi();
    const onFilterLevelChange = () => {
        collapsedHeaders.clear();
        prosesLabaRugi();
    };
    const onToggleAllClick = () => {
        const lv1Codes = coaList
            .filter(c => inferLevel(c) === 1 && classifyGroup(c))
            .map(c => String(c.kodeAkun || "").trim())
            .filter(Boolean);

        const allCollapsed = lv1Codes.length > 0 && lv1Codes.every(k => collapsedHeaders.has(k));
        collapsedHeaders.clear();
        if (!allCollapsed) {
            if (filterLevel && parseInt(filterLevel.value, 10) === 1) {
                filterLevel.value = "4";
            }
            lv1Codes.forEach(k => collapsedHeaders.add(k));
        } else if (filterLevel && parseInt(filterLevel.value, 10) === 1) {
            filterLevel.value = "4";
        }
        prosesLabaRugi();
    };

    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (filterLevel) filterLevel.addEventListener('change', onFilterLevelChange);
    if (btnToggleAllLevel) btnToggleAllLevel.addEventListener('click', onToggleAllClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (filterLevel) filterLevel.removeEventListener('change', onFilterLevelChange);
        if (btnToggleAllLevel) btnToggleAllLevel.removeEventListener('click', onToggleAllClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        labaRugiCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    labaRugiCleanup = cleanup;

    loadData();

    return cleanup;
}