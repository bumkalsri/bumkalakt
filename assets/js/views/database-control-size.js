// File: assets/js/views/database-control-size.js
import { doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const DEFAULT_COLLECTIONS = [
    "banners",
    "coa",
    "events",
    "galeri",
    "jurnal_umum",
    "kontak",
    "nota_aset",
    "pagu_anggaran",
    "pengaturan",
    "pengaturan_sistem",
    "products",
    "running_text",
    "saldo_awal",
    "tutup_bulan",
    "unit_usaha",
    "users"
];

const DEFAULT_CONFIG = {
    quotaGB: 1,
    warnPercent: 60,
    dangerPercent: 85,
    collections: DEFAULT_COLLECTIONS
};

const STORAGE_CACHE_KEY = "bumkal_firestore_size_estimate_v1";

const CHART_COLORS = [
    "#4f46e5", // indigo-600
    "#0d9488", // teal-600
    "#d97706", // amber-600
    "#e11d48", // rose-600
    "#2563eb", // blue-600
    "#7c3aed", // violet-600
    "#059669", // emerald-600
    "#db2777", // pink-600
    "#475569", // slate-600
    "#ea580c"  // orange-600
];

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function estimateObjectBytes(obj) {
    const encoder = new TextEncoder();
    const serialized = JSON.stringify(obj || {});
    return encoder.encode(serialized).length + 100;
}

function formatBytesToReadable(bytes) {
    if (!bytes || bytes <= 0) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians)
    };
}

function describeDonutArc(cx, cy, outerR, innerR, startAngle, endAngle) {
    const sweep = Math.min(359.999, Math.max(0, endAngle - startAngle));
    const actualEnd = startAngle + sweep;

    const outerStart = polarToCartesian(cx, cy, outerR, actualEnd);
    const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, actualEnd);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArcFlag = sweep > 180 ? "1" : "0";

    return [
        "M", outerStart.x, outerStart.y,
        "A", outerR, outerR, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
    ].join(" ");
}

export function renderControlSize() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4">
                <a href="#/database" data-link title="Kembali ke Database"
                    class="w-10 h-10 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none flex-shrink-0 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                </a>
                <div class="flex-1 min-w-0">
                    <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Control Size</h1>
                    <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Kelola kuota penyimpanan database (1 GB), ambang batas peringatan, dan daftar koleksi Firestore yang dimonitor.</p>
                </div>
            </div>

            <!-- Form Pengaturan Kuota & Ambang Batas -->
            <form id="form-control-size" class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Konfigurasi Kapasitas &amp; Ambang Batas</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div class="min-w-0">
                        <label for="mon-quota-gb" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Batas Kapasitas Database (GB)</label>
                        <input type="number" id="mon-quota-gb" step="0.1" min="0.1" max="100" value="1" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        <span class="text-[10px] text-slate-400 mt-1 block">Standar kuota gratis/dasar: 1 GB</span>
                    </div>

                    <div class="min-w-0">
                        <label for="mon-warn-percent" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ambang Peringatan Kuning (%)</label>
                        <input type="number" id="mon-warn-percent" min="1" max="99" value="60" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        <span class="text-[10px] text-slate-400 mt-1 block">Warna indikator berubah menjadi kuning</span>
                    </div>

                    <div class="min-w-0">
                        <label for="mon-danger-percent" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ambang Kritis Merah (%)</label>
                        <input type="number" id="mon-danger-percent" min="1" max="100" value="85" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        <span class="text-[10px] text-slate-400 mt-1 block">Warna indikator berubah menjadi merah</span>
                    </div>
                </div>

                <!-- Daftar Koleksi Firestore -->
                <div class="space-y-3 pt-2">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <label for="new-collection-input" class="text-xs font-semibold text-slate-700 dark:text-slate-300">Koleksi Firestore yang Diukur</label>
                            <button type="button" id="btn-auto-detect-collections"
                                class="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-none cursor-pointer transition">
                                Deteksi Koleksi Otomatis
                            </button>
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <input type="text" id="new-collection-input" placeholder="Nama koleksi baru..."
                                class="flex-1 sm:w-48 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 min-w-0">
                            <button type="button" id="btn-add-collection"
                                class="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-none cursor-pointer flex-shrink-0">
                                + Tambah
                            </button>
                        </div>
                    </div>

                    <div id="mon-collections-list" class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                        <!-- Diisi via JS -->
                    </div>
                </div>

                <!-- Status Pesan -->
                <div id="mon-config-status" class="hidden text-xs px-3 py-2 rounded-none border break-words"></div>

                <!-- Tombol Aksi -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button type="button" id="btn-reset-default"
                        class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-none border border-slate-200 dark:border-slate-700 cursor-pointer">
                        Reset Default
                    </button>

                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button type="button" id="btn-scan-now"
                            class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none cursor-pointer shadow-sm">
                            Hitung &amp; Perbarui Cache
                        </button>
                        <button type="submit" id="btn-save-control-size-config"
                            class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-none cursor-pointer shadow-sm">
                            Simpan Pengaturan
                        </button>
                    </div>
                </div>
            </form>

            <!-- Ringkasan Rincian Per Koleksi (Tab Tabel & Grafik Lingkaran) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>RINCIAN ESTIMASI UKURAN PER KOLEKSI</span>
                    <span id="mon-scan-total-badge" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 break-words">Belum dihitung</span>
                </div>

                <!-- Bar Tab -->
                <div class="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
                    <button type="button" id="tab-btn-tabel" data-tab="tabel"
                        class="tab-view-btn px-4 py-2.5 border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer transition">
                        Tabel Rincian
                    </button>
                    <button type="button" id="tab-btn-grafik" data-tab="grafik"
                        class="tab-view-btn px-4 py-2.5 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition">
                        Grafik Lingkaran (%)
                    </button>
                </div>

                <!-- Panel Tab Tabel (Desktop Tabel & HP Card) -->
                <div id="tab-panel-tabel">
                    <div class="hidden md:block overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold">Nama Koleksi</th>
                                    <th class="py-2.5 px-4 font-semibold text-right">Jumlah Dokumen</th>
                                    <th class="py-2.5 px-4 font-semibold text-right">Porsi (%)</th>
                                    <th class="py-2.5 px-4 font-semibold text-right">Estimasi Ukuran</th>
                                </tr>
                            </thead>
                            <tbody id="mon-breakdown-tbody" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="4" class="py-6 text-center text-slate-400">Klik "Hitung &amp; Perbarui Cache" untuk melihat rincian per koleksi.</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div id="mon-breakdown-cards" class="block md:hidden divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                        <div class="p-6 text-center text-slate-400">Klik "Hitung &amp; Perbarui Cache" untuk melihat rincian per koleksi.</div>
                    </div>
                </div>

                <!-- Panel Tab Grafik Lingkaran -->
                <div id="tab-panel-grafik" class="hidden p-4 sm:p-6">
                    <div id="mon-pie-chart-container" class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 text-xs">
                        <div class="py-6 text-center text-slate-400">Klik "Hitung &amp; Perbarui Cache" untuk menampilkan grafik lingkaran (%).</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let databaseControlSizeCleanup = null;

export function initControlSizeHandler() {
    if (typeof databaseControlSizeCleanup === "function") {
        databaseControlSizeCleanup();
        databaseControlSizeCleanup = null;
    }

    const formEl = document.getElementById("form-control-size");
    const quotaInput = document.getElementById("mon-quota-gb");
    const warnInput = document.getElementById("mon-warn-percent");
    const dangerInput = document.getElementById("mon-danger-percent");
    const collectionsContainer = document.getElementById("mon-collections-list");
    const newColInput = document.getElementById("new-collection-input");
    const btnAddCol = document.getElementById("btn-add-collection");
    const btnAutoDetect = document.getElementById("btn-auto-detect-collections");
    const btnResetDefault = document.getElementById("btn-reset-default");
    const btnScanNow = document.getElementById("btn-scan-now");
    const statusBox = document.getElementById("mon-config-status");
    const breakdownTbody = document.getElementById("mon-breakdown-tbody");
    const breakdownCards = document.getElementById("mon-breakdown-cards");
    const pieChartContainer = document.getElementById("mon-pie-chart-container");
    const totalBadge = document.getElementById("mon-scan-total-badge");

    const tabBtns = document.querySelectorAll(".tab-view-btn");
    const panelTabel = document.getElementById("tab-panel-tabel");
    const panelGrafik = document.getElementById("tab-panel-grafik");

    let activeCollections = [...DEFAULT_COLLECTIONS];
    let newlyDetectedSet = new Set();
    let latestRows = [];
    let latestTotalBytes = 0;

    function switchTab(tabName) {
        tabBtns.forEach((btn) => {
            const isSelected = btn.getAttribute("data-tab") === tabName;
            btn.classList.toggle("border-indigo-600", isSelected);
            btn.classList.toggle("text-indigo-600", isSelected);
            btn.classList.toggle("dark:text-indigo-400", isSelected);
            btn.classList.toggle("bg-indigo-50/40", isSelected);
            btn.classList.toggle("dark:bg-indigo-950/20", isSelected);

            btn.classList.toggle("border-transparent", !isSelected);
            btn.classList.toggle("text-slate-500", !isSelected);
            btn.classList.toggle("dark:text-slate-400", !isSelected);
        });

        if (panelTabel && panelGrafik) {
            panelTabel.classList.toggle("hidden", tabName !== "tabel");
            panelGrafik.classList.toggle("hidden", tabName !== "grafik");
        }
    }

    const tabListeners = [];
    tabBtns.forEach((btn) => {
        const onTabClick = () => switchTab(btn.getAttribute("data-tab"));
        btn.addEventListener("click", onTabClick);
        tabListeners.push({ btn, onTabClick });
    });

    function showStatus(message, isError = false) {
        if (!statusBox) return;
        statusBox.textContent = message;
        statusBox.classList.remove(
            "hidden",
            "bg-emerald-50",
            "text-emerald-700",
            "border-emerald-200",
            "dark:bg-emerald-950/50",
            "dark:text-emerald-300",
            "dark:border-emerald-900",
            "bg-rose-50",
            "text-rose-700",
            "border-rose-200",
            "dark:bg-rose-950/50",
            "dark:text-rose-300",
            "dark:border-rose-900"
        );
        if (isError) {
            statusBox.classList.add("bg-rose-50", "text-rose-700", "border-rose-200", "dark:bg-rose-950/50", "dark:text-rose-300", "dark:border-rose-900");
        } else {
            statusBox.classList.add("bg-emerald-50", "text-emerald-700", "border-emerald-200", "dark:bg-emerald-950/50", "dark:text-emerald-300", "dark:border-emerald-900");
        }
    }

    let chipListeners = [];

    function clearChipListeners() {
        chipListeners.forEach(({ btn, onRemove }) => {
            btn.removeEventListener("click", onRemove);
        });
        chipListeners = [];
    }

    function renderCollectionsChips() {
        clearChipListeners();
        if (!collectionsContainer) return;
        if (activeCollections.length === 0) {
            collectionsContainer.innerHTML = `<div class="col-span-full text-slate-400 italic py-2">Tidak ada koleksi dipilih.</div>`;
            return;
        }

        collectionsContainer.innerHTML = activeCollections.map((colName) => {
            const safeCol = escapeHtml(colName);
            const isNew = newlyDetectedSet.has(colName);
            return `
                <div class="flex items-center justify-between gap-2 ${isNew ? "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"} border px-2.5 py-1.5 rounded-none min-w-0">
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all inline-flex items-center gap-1.5">
                        <span>${safeCol}</span>
                        ${isNew ? `<span class="px-1 py-0.5 text-[9px] font-sans font-bold uppercase bg-sky-600 text-white">Baru</span>` : ""}
                    </span>
                    <button type="button" data-remove-col="${safeCol}" title="Hapus koleksi"
                        class="text-rose-500 hover:text-rose-700 font-bold text-xs leading-none cursor-pointer flex-shrink-0">&times;</button>
                </div>
            `;
        }).join("");

        collectionsContainer.querySelectorAll("[data-remove-col]").forEach((btn) => {
            const onRemove = () => {
                const target = btn.getAttribute("data-remove-col");
                newlyDetectedSet.delete(target);
                activeCollections = activeCollections.filter((item) => item !== target);
                renderCollectionsChips();
            };
            btn.addEventListener("click", onRemove);
            chipListeners.push({ btn, onRemove });
        });
    }

    async function autoDetectCollections() {
        if (btnAutoDetect) {
            btnAutoDetect.disabled = true;
            btnAutoDetect.textContent = "Mendeteksi...";
        }

        const prevSet = new Set(activeCollections);
        const candidateSet = new Set([...DEFAULT_COLLECTIONS, ...activeCollections]);

        try {
            const sysSnap = await getDoc(doc(db, "pengaturan_sistem", "app_config"));
            if (sysSnap.exists() && Array.isArray(sysSnap.data()?.collections)) {
                sysSnap.data().collections.forEach((c) => {
                    if (typeof c === "string" && c.trim()) candidateSet.add(c.trim());
                });
            }
        } catch (_) {
            // Abaikan jika dokumen tidak ada
        }

        const foundCollections = [];
        const addedNow = [];
        for (const colName of Array.from(candidateSet)) {
            try {
                const snap = await getDocs(collection(db, colName));
                if (!snap.empty) {
                    foundCollections.push(colName);
                    if (!prevSet.has(colName)) {
                        newlyDetectedSet.add(colName);
                        addedNow.push(colName);
                    }
                }
            } catch (_) {
                // Lewati koleksi yang tidak dapat dibaca
            }
        }

        if (foundCollections.length > 0) {
            activeCollections = foundCollections.sort((a, b) => a.localeCompare(b, "id"));
            renderCollectionsChips();
            if (addedNow.length > 0) {
                showStatus(`Deteksi selesai: ${activeCollections.length} koleksi aktif. Koleksi baru ditambahkan: ${addedNow.join(", ")}.`);
            } else {
                showStatus(`Deteksi selesai: ditemukan ${activeCollections.length} koleksi aktif di Firestore.`);
            }
        } else {
            showStatus("Tidak ada koleksi berisi dokumen yang terdeteksi otomatis.", true);
        }

        if (btnAutoDetect) {
            btnAutoDetect.disabled = false;
            btnAutoDetect.textContent = "Deteksi Koleksi Otomatis";
        }
    }

    function renderBreakdownAndChart(rows, totalBytes) {
        const itemsWithPct = rows.map((r, idx) => {
            const sharePct = totalBytes > 0 ? (r.bytes / totalBytes) * 100 : 0;
            return {
                ...r,
                sharePct,
                color: CHART_COLORS[idx % CHART_COLORS.length]
            };
        });

        if (breakdownTbody) {
            breakdownTbody.innerHTML = itemsWithPct.length > 0
                ? itemsWithPct.map((r) => {
                    const safeCol = escapeHtml(r.colName);
                    const safeSize = escapeHtml(formatBytesToReadable(r.bytes));
                    return `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td class="py-2.5 px-4 font-mono text-slate-800 dark:text-slate-200">
                                <span class="inline-flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 inline-block flex-shrink-0" style="background-color: ${r.color};"></span>
                                    <span>${safeCol}</span>
                                </span>
                            </td>
                            <td class="py-2.5 px-4 text-right whitespace-nowrap">${r.docCount}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">${r.sharePct.toFixed(1)}%</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">${safeSize}</td>
                        </tr>
                    `;
                }).join("")
                : `<tr><td colspan="4" class="py-6 text-center text-slate-400">Tidak ada koleksi untuk dihitung.</td></tr>`;
        }

        if (breakdownCards) {
            breakdownCards.innerHTML = itemsWithPct.length > 0
                ? itemsWithPct.map((r) => {
                    const safeCol = escapeHtml(r.colName);
                    const safeSize = escapeHtml(formatBytesToReadable(r.bytes));
                    return `
                        <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-mono font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2 break-all">
                                    <span class="w-2.5 h-2.5 inline-block flex-shrink-0" style="background-color: ${r.color};"></span>
                                    <span>${safeCol}</span>
                                </span>
                                <span class="font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap flex-shrink-0">${safeSize}</span>
                            </div>
                            <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>Dokumen: <strong class="text-slate-700 dark:text-slate-200">${r.docCount}</strong></span>
                                <span>Porsi: <strong class="text-slate-700 dark:text-slate-200">${r.sharePct.toFixed(1)}%</strong></span>
                            </div>
                        </div>
                    `;
                }).join("")
                : `<div class="p-6 text-center text-slate-400">Tidak ada koleksi untuk dihitung.</div>`;
        }

        if (!pieChartContainer) return;

        if (itemsWithPct.length === 0 || totalBytes <= 0) {
            pieChartContainer.innerHTML = `<div class="py-6 text-center text-slate-400">Belum ada data ukuran untuk ditampilkan dalam grafik lingkaran.</div>`;
            return;
        }

        let currentAngle = 0;
        const pathsSvg = itemsWithPct
            .filter((item) => item.bytes > 0)
            .map((item) => {
                const sweepAngle = (item.bytes / totalBytes) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + sweepAngle;
                currentAngle = endAngle;
                const d = describeDonutArc(100, 100, 88, 48, startAngle, endAngle);
                const safeCol = escapeHtml(item.colName);
                const safeSize = escapeHtml(formatBytesToReadable(item.bytes));
                return `<path d="${d}" fill="${item.color}" class="transition-opacity hover:opacity-85"><title>${safeCol}: ${safeSize} (${item.sharePct.toFixed(1)}%)</title></path>`;
            })
            .join("");

        const legendHtml = itemsWithPct.map((item) => {
            const safeCol = escapeHtml(item.colName);
            const safeSize = escapeHtml(formatBytesToReadable(item.bytes));
            return `
                <div class="flex items-center justify-between gap-3 py-1.5 px-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none min-w-0">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-3 h-3 flex-shrink-0" style="background-color: ${item.color};"></span>
                        <span class="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">${safeCol}</span>
                    </div>
                    <div class="flex items-center gap-2.5 flex-shrink-0 text-[11px]">
                        <span class="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">${item.sharePct.toFixed(1)}%</span>
                        <span class="text-slate-500 dark:text-slate-400 whitespace-nowrap">${safeSize}</span>
                    </div>
                </div>
            `;
        }).join("");

        pieChartContainer.innerHTML = `
            <div class="relative w-48 h-48 sm:w-52 sm:h-52 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" class="w-full h-full">
                    ${pathsSvg}
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(formatBytesToReadable(totalBytes))}</span>
                    <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">100.0%</span>
                </div>
            </div>
            <div class="flex-1 w-full max-w-md space-y-1.5 min-w-0">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Persentase per Koleksi</div>
                ${legendHtml}
            </div>
        `;
    }

    async function loadSavedConfig() {
        try {
            const snap = await getDoc(doc(db, "pengaturan", "monitoring_config"));
            if (snap.exists()) {
                const data = snap.data();
                if (quotaInput && typeof data.quotaGB === "number") quotaInput.value = data.quotaGB;
                if (warnInput && typeof data.warnPercent === "number") warnInput.value = data.warnPercent;
                if (dangerInput && typeof data.dangerPercent === "number") dangerInput.value = data.dangerPercent;
                if (Array.isArray(data.collections) && data.collections.length > 0) {
                    activeCollections = [...data.collections];
                }
            }
        } catch (err) {
            console.warn("Gagal memuat konfigurasi control size:", err);
        }
        renderCollectionsChips();
    }

    async function scanCollectionsBreakdown() {
        const quotaGB = Math.max(0.1, parseFloat(quotaInput?.value || DEFAULT_CONFIG.quotaGB) || 1);
        const quotaBytes = quotaGB * 1024 * 1024 * 1024;

        if (breakdownTbody) {
            breakdownTbody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-400">Menghitung ukuran koleksi...</td></tr>`;
        }
        if (breakdownCards) {
            breakdownCards.innerHTML = `<div class="p-6 text-center text-slate-400">Menghitung ukuran koleksi...</div>`;
        }
        if (pieChartContainer) {
            pieChartContainer.innerHTML = `<div class="py-6 text-center text-slate-400">Menghitung grafik lingkaran...</div>`;
        }

        let totalBytes = 0;
        let totalDocs = 0;
        let topCollection = "-";
        let topBytes = 0;
        const rows = [];

        for (const colName of activeCollections) {
            try {
                const snap = await getDocs(collection(db, colName));
                let colBytes = 0;
                snap.forEach((docSnap) => {
                    colBytes += estimateObjectBytes(docSnap.data());
                    totalDocs += 1;
                });
                totalBytes += colBytes;
                if (colBytes > topBytes) {
                    topBytes = colBytes;
                    topCollection = colName;
                }
                rows.push({
                    colName,
                    docCount: snap.size,
                    bytes: colBytes
                });
            } catch (err) {
                console.warn(`Gagal membaca koleksi ${colName}:`, err);
                rows.push({
                    colName,
                    docCount: 0,
                    bytes: 0
                });
            }
        }

        rows.sort((a, b) => b.bytes - a.bytes);
        latestRows = rows;
        latestTotalBytes = totalBytes;

        renderBreakdownAndChart(latestRows, latestTotalBytes);

        const pct = Math.min(100, (totalBytes / quotaBytes) * 100);
        if (totalBadge) {
            totalBadge.textContent = `${formatBytesToReadable(totalBytes)} / ${quotaGB.toFixed(2)} GB (${pct.toFixed(2)}%)`;
        }

        const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        try {
            sessionStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify({
                totalBytes,
                totalDocs,
                topCollection,
                topBytes,
                updatedAt: nowTime
            }));
        } catch (e) {
            // Abaikan error cache
        }

        showStatus(`Perhitungan selesai: ${formatBytesToReadable(totalBytes)} dari ${quotaGB.toFixed(2)} GB (${totalDocs} dokumen). Cache diperbarui.`);
    }

    const onAddColClick = () => {
        if (!newColInput) return;
        const val = newColInput.value.trim();
        if (!val) return;
        if (!activeCollections.includes(val)) {
            newlyDetectedSet.add(val);
            activeCollections.push(val);
            renderCollectionsChips();
        }
        newColInput.value = "";
    };

    const onNewColKeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onAddColClick();
        }
    };

    const onResetDefaultClick = () => {
        newlyDetectedSet.clear();
        if (quotaInput) quotaInput.value = DEFAULT_CONFIG.quotaGB;
        if (warnInput) warnInput.value = DEFAULT_CONFIG.warnPercent;
        if (dangerInput) dangerInput.value = DEFAULT_CONFIG.dangerPercent;
        activeCollections = [...DEFAULT_COLLECTIONS];
        renderCollectionsChips();
        showStatus("Nilai dikembalikan ke pengaturan default (1 GB). Klik Simpan Pengaturan untuk menyimpan.");
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        const quotaGB = Math.max(0.1, parseFloat(quotaInput?.value || DEFAULT_CONFIG.quotaGB) || 1);
        const warnPercent = Math.min(99, Math.max(1, parseInt(warnInput?.value || DEFAULT_CONFIG.warnPercent, 10) || 60));
        const dangerPercent = Math.min(100, Math.max(warnPercent + 1, parseInt(dangerInput?.value || DEFAULT_CONFIG.dangerPercent, 10) || 85));

        if (dangerInput) dangerInput.value = dangerPercent;

        try {
            await setDoc(doc(db, "pengaturan", "monitoring_config"), {
                quotaGB,
                warnPercent,
                dangerPercent,
                collections: activeCollections,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            newlyDetectedSet.clear();
            renderCollectionsChips();

            if (latestRows.length > 0) {
                renderBreakdownAndChart(latestRows, latestTotalBytes);
            }

            showStatus("Pengaturan control size berhasil disimpan ke Firestore.");
        } catch (err) {
            console.error("Gagal menyimpan pengaturan control size:", err);
            showStatus("Gagal menyimpan pengaturan ke Firestore.", true);
        }
    };

    if (btnAddCol && newColInput) {
        btnAddCol.addEventListener("click", onAddColClick);
        newColInput.addEventListener("keydown", onNewColKeydown);
    }

    if (btnAutoDetect) {
        btnAutoDetect.addEventListener("click", autoDetectCollections);
    }

    if (btnResetDefault) {
        btnResetDefault.addEventListener("click", onResetDefaultClick);
    }

    if (btnScanNow) {
        btnScanNow.addEventListener("click", scanCollectionsBreakdown);
    }

    if (formEl) {
        formEl.addEventListener("submit", onFormSubmit);
    }

    const cleanup = () => {
        clearChipListeners();
        tabListeners.forEach(({ btn, onTabClick }) => btn.removeEventListener("click", onTabClick));
        if (btnAddCol) btnAddCol.removeEventListener("click", onAddColClick);
        if (newColInput) newColInput.removeEventListener("keydown", onNewColKeydown);
        if (btnAutoDetect) btnAutoDetect.removeEventListener("click", autoDetectCollections);
        if (btnResetDefault) btnResetDefault.removeEventListener("click", onResetDefaultClick);
        if (btnScanNow) btnScanNow.removeEventListener("click", scanCollectionsBreakdown);
        if (formEl) formEl.removeEventListener("submit", onFormSubmit);
        window.removeEventListener("hashchange", cleanup);
        databaseControlSizeCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    databaseControlSizeCleanup = cleanup;

    loadSavedConfig();

    return cleanup;
}

export const renderDatabaseControlSize = renderControlSize;
export const initDatabaseControlSizeHandler = initControlSizeHandler;