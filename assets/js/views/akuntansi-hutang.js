// File: assets/js/views/akuntansi-hutang.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

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
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatRibuanInput(val) {
    const raw = String(val ?? "").replace(/\D/g, "");
    if (!raw) return "";
    const num = Number(raw);
    return Number.isFinite(num) ? num.toLocaleString("id-ID") : "";
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

export function renderHutang() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <a href="#/akuntansi" data-link title="Kembali ke Akuntansi" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Pengelolaan Hutang Usaha</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words">Catat kewajiban hutang, pantau jatuh tempo, dan proses pelunasan hutang BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Ringkasan Hutang -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <span class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Hutang Tercatat</span>
                    <span id="total-hutang-semua" class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-1 block break-words">Rp 0</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <span class="block text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Sisa Kewajiban Belum Lunas</span>
                    <span id="total-hutang-sisa" class="text-sm sm:text-base font-bold text-rose-700 dark:text-rose-300 mt-1 block break-words">Rp 0</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <span class="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Sudah Dilunasi</span>
                    <span id="total-hutang-lunas" class="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-1 block break-words">Rp 0</span>
                </div>
            </div>

            <!-- Form Input Hutang Baru -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Pencatatan Hutang Baru</h2>
                <form id="form-hutang" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div class="min-w-0">
                        <label for="hutang-tgl" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="hutang-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="min-w-0">
                        <label for="hutang-jatuh-tempo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JATUH TEMPO</label>
                        <input type="date" id="hutang-jatuh-tempo" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="min-w-0">
                        <label for="hutang-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="hutang-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div class="min-w-0">
                        <label for="hutang-kreditur" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">NAMA KREDITUR / SUPPLIER *</label>
                        <input type="text" id="hutang-kreditur" placeholder="Nama pihak pemberi hutang / supplier" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="min-w-0">
                        <label for="hutang-akun-kode" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN HUTANG / KEWAJIBAN (COA) *</label>
                        <select id="hutang-akun-kode" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Hutang --</option>
                        </select>
                    </div>
                    <div class="min-w-0">
                        <label for="hutang-jumlah" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH KEWAJIBAN (RP) *</label>
                        <input type="text" inputmode="numeric" id="hutang-jumlah" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 min-w-0">
                        <label for="hutang-keterangan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN *</label>
                        <input type="text" id="hutang-keterangan" placeholder="Contoh: Pembelian bibit / bahan baku operasional tempo" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex flex-col sm:flex-row justify-end gap-2 pt-2">
                        <button type="submit" id="btn-simpan-hutang" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Hutang</button>
                    </div>
                </form>
            </div>

            <!-- Filter & Daftar Hutang -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <span class="font-bold text-slate-800 dark:text-slate-200">DAFTAR HUTANG USAHA</span>
                    <div class="flex flex-wrap items-center justify-between md:justify-end gap-2">
                        <select id="filter-status-hutang" class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-none">
                            <option value="">-- Semua Status --</option>
                            <option value="Belum Lunas">Belum Lunas</option>
                            <option value="Lunas">Lunas</option>
                        </select>
                        <span id="total-hutang-count" class="text-slate-500 font-normal whitespace-nowrap">Total: 0 Data</span>
                    </div>
                </div>

                <!-- 1. TAMPILAN DESKTOP: Tabel -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold">Tanggal / Tempo</th>
                                <th class="py-3 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold">Kreditur &amp; Keterangan</th>
                                <th class="py-3 px-4 font-semibold text-right">Jumlah (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center">Status</th>
                                <th class="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-hutang-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data hutang...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- 2. TAMPILAN HP: Card Versi Mobile -->
                <div id="card-hutang-body" class="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data hutang...</div>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-hutang" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-hutang-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-hutang-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let hutangToastTimer = null;
let hutangCleanup = null;

export function initHutangHandler() {
    if (typeof hutangCleanup === "function") {
        hutangCleanup();
        hutangCleanup = null;
    }

    const formHutang = document.getElementById('form-hutang');
    const hutangTgl = document.getElementById('hutang-tgl');
    const hutangJatuhTempo = document.getElementById('hutang-jatuh-tempo');
    const hutangUnit = document.getElementById('hutang-unit');
    const hutangKreditur = document.getElementById('hutang-kreditur');
    const hutangAkunKode = document.getElementById('hutang-akun-kode');
    const hutangJumlah = document.getElementById('hutang-jumlah');
    const hutangKeterangan = document.getElementById('hutang-keterangan');
    const btnSimpanHutang = document.getElementById('btn-simpan-hutang');

    const filterStatus = document.getElementById('filter-status-hutang');
    const tableBody = document.getElementById('table-hutang-body');
    const cardBody = document.getElementById('card-hutang-body');
    const totalCountEl = document.getElementById('total-hutang-count');
    const totalSemuaEl = document.getElementById('total-hutang-semua');
    const totalSisaEl = document.getElementById('total-hutang-sisa');
    const totalLunasEl = document.getElementById('total-hutang-lunas');

    if (hutangTgl && !hutangTgl.value) {
        hutangTgl.value = new Date().toISOString().split('T')[0];
    }

    let hutangList = [];
    let rowListeners = [];

    function clearRowListeners() {
        rowListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        rowListeners = [];
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-hutang');
        const msgEl = document.getElementById('toast-hutang-message');
        const iconEl = document.getElementById('toast-hutang-icon');
        if (!toast || !msgEl) return;

        if (hutangToastTimer) clearTimeout(hutangToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        hutangToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function updateRingkasan() {
        let totalSemua = 0;
        let totalSisa = 0;
        let totalLunas = 0;

        hutangList.forEach(item => {
            const jumlah = Number(item.jumlah || 0);
            totalSemua += jumlah;
            if (item.status === "Lunas") {
                totalLunas += jumlah;
            } else {
                totalSisa += jumlah;
            }
        });

        if (totalSemuaEl) totalSemuaEl.textContent = formatRupiah(totalSemua);
        if (totalSisaEl) totalSisaEl.textContent = formatRupiah(totalSisa);
        if (totalLunasEl) totalLunasEl.textContent = formatRupiah(totalLunas);
    }

    async function loadCoaAndHutang() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            if (hutangAkunKode) hutangAkunKode.innerHTML = '<option value="">-- Pilih Akun Hutang (COA) --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const namaLower = (data.namaAkun || "").toLowerCase();
                const kategoriLower = (data.kategori || "").toLowerCase();
                const kode = data.kodeAkun || "";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();

                if ((level === "4" || tipe === "detail") && data.statusAkun !== "Nonaktif") {
                    if (namaLower.includes("hutang") || namaLower.includes("utang") || kategoriLower.includes("hutang") || kategoriLower.includes("kewajiban") || kode.startsWith("2")) {
                        if (hutangAkunKode) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${data.namaAkun}`;
                            hutangAkunKode.appendChild(opt);
                        }
                    }
                }
            });

            const qHutang = query(collection(db, "hutang"), orderBy("tglTransaksi", "desc"));
            const snapHutang = await getDocs(qHutang);
            hutangList = [];
            snapHutang.forEach(docSnap => {
                hutangList.push({ id: docSnap.id, ...docSnap.data() });
            });

            updateRingkasan();
            renderTable();
        } catch (err) {
            console.error("Gagal memuat data hutang:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-rose-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    function renderTable() {
        clearRowListeners();
        if (!tableBody || !cardBody) return;
        const statusFilter = filterStatus ? filterStatus.value : "";
        const filtered = hutangList.filter(item => !statusFilter || item.status === statusFilter);

        if (totalCountEl) totalCountEl.textContent = `Total: ${filtered.length} Data`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data hutang.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Belum ada data hutang.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        filtered.forEach(item => {
            const isLunas = item.status === "Lunas";
            const badgeClass = isLunas
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";

            const safeId = escapeHtml(item.id);
            const safeTgl = escapeHtml(item.tglTransaksi || '-');
            const safeTempo = escapeHtml(item.jatuhTempo || '-');
            const safeUnit = escapeHtml(item.unitUsaha || '-');
            const safeKreditur = escapeHtml(item.kreditur || '-');
            const safeKode = escapeHtml(item.kodeAkun || '-');
            const safeKet = escapeHtml(item.keterangan || '-');
            const safeStatus = escapeHtml(item.status || 'Belum Lunas');
            const nominalFmt = escapeHtml(formatRupiah(item.jumlah));

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <div>${safeTgl}</div>
                        <div class="text-[11px] text-slate-500">Tempo: ${safeTempo}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${safeUnit}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${safeKreditur} (${safeKode})</div>
                        <div class="text-slate-500 text-[11px] mt-0.5">${safeKet}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">${nominalFmt}</td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <span class="px-2 py-0.5 text-[11px] font-bold rounded-none ${badgeClass}">${safeStatus}</span>
                    </td>
                    <td class="py-3 px-4 text-center whitespace-nowrap">
                        <div class="flex items-center justify-center gap-1.5">
                            ${!isLunas ? `<button type="button" data-lunasi-id="${safeId}" class="btn-lunasi-hutang px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-none transition text-[11px] font-semibold cursor-pointer">Lunasi</button>` : ''}
                            <button type="button" data-delete-hutang="${safeId}" class="btn-hapus-hutang text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Hutang">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <div class="font-semibold text-slate-800 dark:text-slate-200">${safeTgl}</div>
                            <div class="text-[11px] text-slate-500">Tempo: ${safeTempo}</div>
                        </div>
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded-none flex-shrink-0 ${badgeClass}">${safeStatus}</span>
                    </div>
                    <div class="font-medium text-slate-600 dark:text-slate-300 break-words">
                        Unit: ${safeUnit}
                    </div>
                    <div class="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-none border border-slate-100 dark:border-slate-800 space-y-1 break-words">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${safeKreditur} (${safeKode})</div>
                        <div class="text-slate-500 text-[11px] leading-snug">${safeKet}</div>
                    </div>
                    <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <span class="font-bold text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">${nominalFmt}</span>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            ${!isLunas ? `<button type="button" data-lunasi-id="${safeId}" class="btn-lunasi-hutang px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-none transition text-[11px] font-semibold cursor-pointer">Lunasi</button>` : ''}
                            <button type="button" data-delete-hutang="${safeId}" class="btn-hapus-hutang inline-flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-none text-[11px] font-semibold cursor-pointer" title="Hapus Hutang">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;

        document.querySelectorAll('.btn-lunasi-hutang').forEach(btn => {
            const onLunasi = async () => {
                const id = btn.getAttribute('data-lunasi-id');
                const target = hutangList.find(h => h.id === id);
                if (!target) return;

                btn.disabled = true;
                try {
                    const tglLunas = new Date().toISOString().split('T')[0];
                    await updateDoc(doc(db, "hutang", id), {
                        status: "Lunas",
                        tglLunas,
                        updatedAt: new Date().toISOString()
                    });

                    await addDoc(collection(db, "jurnal_umum"), {
                        noRef: `HTG-LNS-${Date.now().toString().slice(-6)}`,
                        tglTransaksi: tglLunas,
                        unitUsaha: target.unitUsaha || "KANTOR PUSAT (01)",
                        keterangan: `[Pelunasan Hutang] ${target.kreditur || ''} - ${target.keterangan || ''}`,
                        rincian: [
                            { kodeAkun: target.kodeAkun || "2.01.01", namaAkun: target.namaAkun || "Hutang Usaha", debet: Number(target.jumlah || 0), kredit: 0 },
                            { kodeAkun: "1.01.01", namaAkun: "Kas / Bank", debet: 0, kredit: Number(target.jumlah || 0) }
                        ],
                        totalNilai: Number(target.jumlah || 0),
                        createdAt: new Date().toISOString()
                    });

                    showToast("Hutang berhasil dilunasi dan dicatat ke jurnal.");
                    await loadCoaAndHutang();
                } catch (err) {
                    console.error("Gagal melunasi hutang:", err);
                    showToast("Gagal memproses pelunasan hutang.", true);
                    btn.disabled = false;
                }
            };
            btn.addEventListener('click', onLunasi);
            rowListeners.push({ el: btn, type: 'click', fn: onLunasi });
        });

        document.querySelectorAll('.btn-hapus-hutang').forEach(btn => {
            const onDelete = async () => {
                const id = btn.getAttribute('data-delete-hutang');
                if (!id) return;
                if (confirm("Apakah Anda yakin ingin menghapus data hutang ini?")) {
                    try {
                        await deleteDoc(doc(db, "hutang", id));
                        showToast("Data hutang berhasil dihapus.");
                        await loadCoaAndHutang();
                    } catch (err) {
                        console.error("Gagal menghapus hutang:", err);
                        showToast("Gagal menghapus data hutang.", true);
                    }
                }
            };
            btn.addEventListener('click', onDelete);
            rowListeners.push({ el: btn, type: 'click', fn: onDelete });
        });
    }

    const onJumlahInput = () => {
        if (!hutangJumlah) return;
        hutangJumlah.value = formatRibuanInput(hutangJumlah.value);
    };

    const onFilterChange = () => renderTable();

    const onFormSubmit = async (e) => {
        e.preventDefault();
        const tgl = hutangTgl ? hutangTgl.value : "";
        const jatuhTempo = hutangJatuhTempo ? hutangJatuhTempo.value : "";
        const unit = hutangUnit ? hutangUnit.value : "";
        const kreditur = hutangKreditur ? hutangKreditur.value.trim() : "";
        const akunKode = hutangAkunKode ? hutangAkunKode.value : "";
        const jumlah = parseDigitsToNumber(hutangJumlah ? hutangJumlah.value : 0);
        const ket = hutangKeterangan ? hutangKeterangan.value.trim() : "";

        if (!akunKode) {
            showToast("Pilih akun hutang / kewajiban terlebih dahulu.", true);
            return;
        }
        if (jumlah <= 0) {
            showToast("Jumlah kewajiban harus lebih besar dari 0.", true);
            return;
        }

        const selectedCoaOpt = hutangAkunKode.options[hutangAkunKode.selectedIndex];
        const namaAkun = selectedCoaOpt ? selectedCoaOpt.textContent.split(' - ').slice(1).join(' - ') || "Hutang Usaha" : "Hutang Usaha";

        if (btnSimpanHutang) {
            btnSimpanHutang.disabled = true;
            btnSimpanHutang.textContent = "Menyimpan...";
        }

        try {
            await addDoc(collection(db, "hutang"), {
                noRef: `HTG-${Date.now().toString().slice(-6)}`,
                tglTransaksi: tgl,
                jatuhTempo,
                unitUsaha: unit,
                kreditur,
                kodeAkun: akunKode,
                namaAkun,
                jumlah,
                keterangan: ket,
                status: "Belum Lunas",
                createdAt: new Date().toISOString()
            });

            await addDoc(collection(db, "jurnal_umum"), {
                noRef: `HTG-${Date.now().toString().slice(-6)}`,
                tglTransaksi: tgl,
                unitUsaha: unit,
                keterangan: `[Hutang] ${kreditur} - ${ket}`,
                rincian: [
                    { kodeAkun: "5.01.01", namaAkun: "Beban Operasional Usaha", debet: jumlah, kredit: 0 },
                    { kodeAkun: akunKode, namaAkun, debet: 0, kredit: jumlah }
                ],
                totalNilai: jumlah,
                createdAt: new Date().toISOString()
            });

            showToast("Data hutang berhasil disimpan.");
            formHutang.reset();
            if (hutangTgl) hutangTgl.value = new Date().toISOString().split('T')[0];
            await loadCoaAndHutang();
        } catch (err) {
            console.error("Gagal menyimpan hutang:", err);
            showToast("Terjadi kesalahan saat menyimpan data hutang.", true);
        } finally {
            if (btnSimpanHutang) {
                btnSimpanHutang.disabled = false;
                btnSimpanHutang.textContent = "Simpan Hutang";
            }
        }
    };

    if (hutangJumlah) hutangJumlah.addEventListener('input', onJumlahInput);
    if (filterStatus) filterStatus.addEventListener('change', onFilterChange);
    if (formHutang) formHutang.addEventListener('submit', onFormSubmit);

    const cleanup = () => {
        clearRowListeners();
        if (hutangToastTimer) {
            clearTimeout(hutangToastTimer);
            hutangToastTimer = null;
        }
        if (hutangJumlah) hutangJumlah.removeEventListener('input', onJumlahInput);
        if (filterStatus) filterStatus.removeEventListener('change', onFilterChange);
        if (formHutang) formHutang.removeEventListener('submit', onFormSubmit);
        window.removeEventListener('hashchange', cleanup);
        hutangCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    hutangCleanup = cleanup;

    loadCoaAndHutang();

    return cleanup;
}