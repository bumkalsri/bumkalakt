// File: assets/js/views/data-aset.js
import {
    getDocs,
    collection,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const PAGE_SIZE = 10;

const UNIT_KERJA_OPTIONS = [
    "KANTOR PUSAT (01)",
    "AGROWISATA (02)",
    "KOMPOS (03)",
    "GREENHOUSE (04)"
];

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatRupiah(num) {
    return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function getKondisiBadgeClass(kondisi) {
    const k = String(kondisi || "").toLowerCase();
    if (k.includes("rusak")) {
        return "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900";
    }
    if (k.includes("kurang")) {
        return "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
    return "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
}

function buildSelectOptions(items, placeholder, selectedValue = "") {
    const opts = [`<option value="">${escapeHtml(placeholder)}</option>`];
    items.forEach((acc) => {
        const label = `${acc.kodeAkun} - ${acc.namaAkun}`;
        const isSel = selectedValue && (selectedValue === label || selectedValue === acc.kodeAkun);
        opts.push(`<option value="${escapeHtml(label)}" ${isSel ? "selected" : ""}>${escapeHtml(label)}</option>`);
    });
    return opts.join("");
}

export function renderAset() {
    const todayIso = new Date().toISOString().slice(0, 10);

    return `
        <div class="space-y-4 sm:space-y-6 pb-10 max-w-7xl mx-auto overflow-x-hidden animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div class="flex items-start sm:items-center gap-3 min-w-0">
                    <a href="#/data" data-link title="Kembali ke Data" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0 mt-0.5 sm:mt-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0 flex-1">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Manajemen Aset &amp; Transaksi Inventaris</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="aset-info-count">Memuat jumlah aset...</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button type="button" id="btn-hapus-masal-aset" disabled
                        class="hidden px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span id="label-hapus-masal-aset">Hapus Terpilih (0)</span>
                    </button>
                    <button type="button" id="btn-open-transaksi-aset" class="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        <span>Input Nota Aset</span>
                    </button>
                </div>
            </div>

            <!-- Filter & Pencarian -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                <div class="sm:col-span-2">
                    <label for="aset-search" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI ASET / LOKASI</label>
                    <input type="text" id="aset-search" placeholder="Cari kode inventaris, nama aset, lokasi, atau tahun..."
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                </div>
                <div>
                    <label for="aset-filter-kondisi" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER KONDISI</label>
                    <select id="aset-filter-kondisi"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                        <option value="">Semua Kondisi</option>
                        <option value="Baik">Baik</option>
                        <option value="Kurang Baik">Kurang Baik</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                    </select>
                </div>
            </div>

            <!-- TABEL / CONTAINER ASET -->
            <div id="aset-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Memuat data aset...</div>
            </div>

            <!-- PAGINASI (10 BARIS PER HALAMAN) -->
            <div id="aset-pagination-bar" class="hidden bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div id="aset-page-info" class="text-slate-500 dark:text-slate-400 font-medium">
                    Halaman 1 dari 1
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" id="btn-aset-prev"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Sebelumnya
                    </button>
                    <span id="aset-page-badge" class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold">
                        1 / 1
                    </span>
                    <button type="button" id="btn-aset-next"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Berikutnya
                    </button>
                </div>
            </div>

            <!-- POP-UP DIALOG INPUT TRANSAKSI NOTA ASET (TERSEMBUNYI SAAT LOAD PERTAMA) -->
            <div id="modal-transaksi-aset" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-3 sm:p-5">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl rounded-none text-xs overflow-hidden">
                    <!-- Top Info Unit Kerja -->
                    <div class="bg-sky-50/90 dark:bg-sky-950/40 border-b border-sky-200/80 dark:border-sky-900 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
                        <div class="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200">
                            <span>Unit Kerja:</span>
                            <select id="nota-unit-kerja" class="px-2.5 py-1 bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100 font-bold rounded-none focus:outline-none">
                                ${UNIT_KERJA_OPTIONS.map((u) => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[11px] text-sky-700 dark:text-sky-300 hidden sm:inline">No. Inventaris otomatis ter-generate saat disimpan</span>
                            <button type="button" id="btn-x-transaksi-aset" aria-label="Tutup dialog" class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Body Form (Scrollable) -->
                    <form id="form-nota-aset" class="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
                        <!-- Header Nota -->
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                            <div class="md:col-span-3">
                                <label for="nota-tgl-beli" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tgl. Beli *</label>
                                <input type="date" id="nota-tgl-beli" value="${todayIso}" required
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                            </div>
                            <div class="md:col-span-3">
                                <label for="nota-pemasok" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Pemasok / Toko</label>
                                <input type="text" id="nota-pemasok" placeholder="Opsional"
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                            </div>
                            <div class="md:col-span-6">
                                <label for="nota-akun-bayar" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Akun Pembayaran / Sumber Dana (Kas / Bank / Hutang)</label>
                                <select id="nota-akun-bayar"
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                                    <option value="">-- Pilih Akun Pembayaran --</option>
                                </select>
                            </div>
                            <div class="md:col-span-12">
                                <label for="nota-keterangan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Catatan Nota</label>
                                <input type="text" id="nota-keterangan" placeholder="Contoh: No.Nota: 001/INV / Pembelian inventaris kantor"
                                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                            </div>
                        </div>

                        <!-- Rincian Item Barang Aset dalam Nota -->
                        <div class="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between gap-2">
                                <h2 class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                                    <span class="w-2 h-2 bg-teal-600 inline-block"></span>
                                    <span>Rincian Item Barang Aset dalam Nota</span>
                                </h2>
                                <button type="button" id="btn-tambah-baris-item" class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold text-[11px] rounded-none cursor-pointer transition">
                                    + Tambah Baris
                                </button>
                            </div>

                            <div id="nota-items-container" class="space-y-2.5"></div>
                        </div>

                        <!-- Footer Dialog: Tutup & Reset Form | TOTAL & Simpan Seluruh Aset -->
                        <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div class="flex items-center gap-2">
                                <button type="button" id="btn-tutup-nota" class="px-4 py-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-none cursor-pointer transition">
                                    Tutup
                                </button>
                                <button type="button" id="btn-reset-nota" class="px-4 py-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold rounded-none cursor-pointer transition">
                                    Reset Form
                                </button>
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div class="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold flex items-center justify-between sm:justify-start gap-2">
                                    <span class="text-[11px] text-slate-500 uppercase">TOTAL:</span>
                                    <span id="nota-total-display" class="text-teal-700 dark:text-teal-400 font-extrabold">Rp 0,00</span>
                                </div>
                                <button type="submit" id="btn-simpan-seluruh-aset" class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-none cursor-pointer transition shadow-sm">
                                    Simpan Seluruh Aset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL EDIT ASET -->
            <div id="modal-edit-aset" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-4 sm:p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Edit Data Aset</h3>
                        <button type="button" id="btn-close-modal-edit-aset" aria-label="Tutup modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-edit-aset" class="space-y-3 text-xs">
                        <input type="hidden" id="edit-aset-id" value="">
                        <div>
                            <label for="edit-aset-nama" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Aset / Barang *</label>
                            <input type="text" id="edit-aset-nama" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label for="edit-aset-kondisi" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kondisi</label>
                                <select id="edit-aset-kondisi" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                                    <option value="Baik">Baik</option>
                                    <option value="Kurang Baik">Kurang Baik</option>
                                    <option value="Rusak Berat">Rusak Berat</option>
                                </select>
                            </div>
                            <div>
                                <label for="edit-aset-harga" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
                                <input type="number" id="edit-aset-harga" min="0" step="any" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div>
                                <label for="edit-aset-jumlah" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah *</label>
                                <input type="number" id="edit-aset-jumlah" min="1" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                            <div>
                                <label for="edit-aset-tahun" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun</label>
                                <input type="number" id="edit-aset-tahun" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                            <div>
                                <label for="edit-aset-umur" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Umur (Th)</label>
                                <input type="number" id="edit-aset-umur" min="0" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                        </div>
                        <div>
                            <label for="edit-aset-lokasi" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi / Unit Kerja</label>
                            <input type="text" id="edit-aset-lokasi" list="aset-lokasi-list" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            <datalist id="aset-lokasi-list">
                                ${UNIT_KERJA_OPTIONS.map((u) => `<option value="${escapeHtml(u)}"></option>`).join("")}
                            </datalist>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-modal-edit-aset" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-none cursor-pointer">Batal</button>
                            <button type="submit" id="btn-update-aset" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-none cursor-pointer">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Konfirmasi Smooth -->
            <div id="modal-konfirmasi-aset" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-5 sm:p-6 shadow-2xl rounded-none space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-9 h-9 flex items-center justify-center bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 flex-shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modal-konfirmasi-aset-title" class="font-bold text-slate-800 dark:text-slate-100 text-sm">Konfirmasi</h3>
                            <p id="modal-konfirmasi-aset-desc" class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Apakah Anda yakin?</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button type="button" id="btn-konfirmasi-aset-batal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none cursor-pointer">Batal</button>
                        <button type="button" id="btn-konfirmasi-aset-ya" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none cursor-pointer">Ya, Hapus</button>
                    </div>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-aset" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-aset-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-aset-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let asetToastTimer = null;
let asetCleanup = null;

export async function initAsetHandler() {
    if (typeof asetCleanup === "function") {
        asetCleanup();
        asetCleanup = null;
    }

    const container = document.getElementById('aset-container');
    const infoCountEl = document.getElementById('aset-info-count');
    const searchEl = document.getElementById('aset-search');
    const filterKondisiEl = document.getElementById('aset-filter-kondisi');

    const btnHapusMasal = document.getElementById('btn-hapus-masal-aset');
    const labelHapusMasal = document.getElementById('label-hapus-masal-aset');

    const btnOpenTransaksi = document.getElementById('btn-open-transaksi-aset');
    const modalTransaksi = document.getElementById('modal-transaksi-aset');
    const btnXTransaksi = document.getElementById('btn-x-transaksi-aset');
    const formNota = document.getElementById('form-nota-aset');
    const btnTutupNota = document.getElementById('btn-tutup-nota');
    const btnResetNota = document.getElementById('btn-reset-nota');
    const btnTambahBaris = document.getElementById('btn-tambah-baris-item');
    const itemsContainer = document.getElementById('nota-items-container');
    const totalDisplayEl = document.getElementById('nota-total-display');
    const btnSimpanSeluruh = document.getElementById('btn-simpan-seluruh-aset');
    const akunBayarSelect = document.getElementById('nota-akun-bayar');

    const paginationBar = document.getElementById('aset-pagination-bar');
    const pageInfoEl = document.getElementById('aset-page-info');
    const pageBadgeEl = document.getElementById('aset-page-badge');
    const btnPrevPage = document.getElementById('btn-aset-prev');
    const btnNextPage = document.getElementById('btn-aset-next');

    const editModal = document.getElementById('modal-edit-aset');
    const btnCloseEdit = document.getElementById('btn-close-modal-edit-aset');
    const btnCancelEdit = document.getElementById('btn-cancel-modal-edit-aset');
    const editForm = document.getElementById('form-edit-aset');
    const btnUpdateAset = document.getElementById('btn-update-aset');

    const confirmModal = document.getElementById('modal-konfirmasi-aset');
    const confirmTitleEl = document.getElementById('modal-konfirmasi-aset-title');
    const confirmDescEl = document.getElementById('modal-konfirmasi-aset-desc');
    const btnConfirmBatal = document.getElementById('btn-konfirmasi-aset-batal');
    const btnConfirmYa = document.getElementById('btn-konfirmasi-aset-ya');

    let allAsetList = [];
    let coaList = [];
    let selectedIds = new Set();
    let currentPage = 1;
    let pendingConfirmResolver = null;

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-aset');
        const msgEl = document.getElementById('toast-aset-message');
        const iconEl = document.getElementById('toast-aset-icon');
        if (!toast || !msgEl) return;

        if (asetToastTimer) clearTimeout(asetToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        asetToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function closeConfirmModal(result = false) {
        if (confirmModal) confirmModal.classList.add('hidden');
        if (typeof pendingConfirmResolver === "function") {
            const resolve = pendingConfirmResolver;
            pendingConfirmResolver = null;
            resolve(result);
        }
    }

    function askSmoothConfirm(title, message, confirmText = "Ya, Hapus") {
        if (!confirmModal || !btnConfirmYa || !btnConfirmBatal) return Promise.resolve(true);
        if (pendingConfirmResolver) closeConfirmModal(false);
        if (confirmTitleEl) confirmTitleEl.textContent = title;
        if (confirmDescEl) confirmDescEl.textContent = message;
        btnConfirmYa.textContent = confirmText;
        confirmModal.classList.remove('hidden');
        btnConfirmYa.focus();
        return new Promise((resolve) => {
            pendingConfirmResolver = resolve;
        });
    }

    const onConfirmYa = () => closeConfirmModal(true);
    const onConfirmBatal = () => closeConfirmModal(false);
    const onConfirmBackdrop = (e) => {
        if (confirmModal && e.target === confirmModal) closeConfirmModal(false);
    };

    if (btnConfirmYa) btnConfirmYa.addEventListener('click', onConfirmYa);
    if (btnConfirmBatal) btnConfirmBatal.addEventListener('click', onConfirmBatal);
    if (confirmModal) confirmModal.addEventListener('click', onConfirmBackdrop);

    function populateCoaDropdowns() {
        const bayarCandidates = coaList.filter((c) => {
            const k = String(c.kodeAkun || "").trim();
            const n = String(c.namaAkun || "").toLowerCase();
            return k.startsWith("11") || k.startsWith("21") || n.includes("kas") || n.includes("bank") || n.includes("hutang") || n.includes("utang");
        });

        const asetCandidates = coaList.filter((c) => {
            const k = String(c.kodeAkun || "").trim();
            const n = String(c.namaAkun || "").toLowerCase();
            return (k.startsWith("12") || k.startsWith("13") || n.includes("aset") || n.includes("inventaris") || n.includes("peralatan")) && !n.includes("akumulasi");
        });

        const akumCandidates = coaList.filter((c) => String(c.namaAkun || "").toLowerCase().includes("akumulasi"));

        const bebanCandidates = coaList.filter((c) => {
            const k = String(c.kodeAkun || "").trim();
            const n = String(c.namaAkun || "").toLowerCase();
            return k.startsWith("5") || k.startsWith("6") || n.includes("penyusutan") || n.includes("beban");
        });

        if (akunBayarSelect) {
            akunBayarSelect.innerHTML = buildSelectOptions(
                bayarCandidates.length > 0 ? bayarCandidates : coaList,
                "-- Pilih Akun Pembayaran --"
            );
        }

        if (itemsContainer) {
            itemsContainer.querySelectorAll('.nota-akun-aset').forEach((sel) => {
                const prev = sel.value;
                sel.innerHTML = buildSelectOptions(asetCandidates.length > 0 ? asetCandidates : coaList, "-- Pilih Akun Aset --", prev);
            });
            itemsContainer.querySelectorAll('.nota-akun-akum').forEach((sel) => {
                const prev = sel.value;
                sel.innerHTML = buildSelectOptions(akumCandidates.length > 0 ? akumCandidates : coaList, "-- Akun Akumulasi --", prev);
            });
            itemsContainer.querySelectorAll('.nota-akun-beban').forEach((sel) => {
                const prev = sel.value;
                sel.innerHTML = buildSelectOptions(bebanCandidates.length > 0 ? bebanCandidates : coaList, "-- Biaya Penyusutan --", prev);
            });
        }
    }

    function hitungTotalNota() {
        let total = 0;
        if (itemsContainer) {
            itemsContainer.querySelectorAll('.nota-item-row').forEach((row) => {
                const harga = parseFloat(row.querySelector('.nota-harga')?.value || 0) || 0;
                const qty = Math.max(1, parseInt(row.querySelector('.nota-qty')?.value || 1, 10) || 1);
                total += harga * qty;
            });
        }
        if (totalDisplayEl) {
            totalDisplayEl.textContent = formatRupiah(total);
        }
        return total;
    }

    function renumberNotaRows() {
        if (!itemsContainer) return;
        const rows = itemsContainer.querySelectorAll('.nota-item-row');
        rows.forEach((row, index) => {
            const badge = row.querySelector('.nota-row-num');
            if (badge) badge.textContent = String(index + 1);
        });
    }

    function addNotaItemRow() {
        if (!itemsContainer) return;
        const rowNum = itemsContainer.querySelectorAll('.nota-item-row').length + 1;

        const asetCandidates = coaList.filter((c) => {
            const k = String(c.kodeAkun || "").trim();
            const n = String(c.namaAkun || "").toLowerCase();
            return (k.startsWith("12") || k.startsWith("13") || n.includes("aset") || n.includes("inventaris") || n.includes("peralatan")) && !n.includes("akumulasi");
        });
        const akumCandidates = coaList.filter((c) => String(c.namaAkun || "").toLowerCase().includes("akumulasi"));
        const bebanCandidates = coaList.filter((c) => {
            const k = String(c.kodeAkun || "").trim();
            const n = String(c.namaAkun || "").toLowerCase();
            return k.startsWith("5") || k.startsWith("6") || n.includes("penyusutan") || n.includes("beban");
        });

        const rowEl = document.createElement('div');
        rowEl.className = "nota-item-row bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end";
        rowEl.innerHTML = `
            <div class="lg:col-span-3 flex items-end gap-2">
                <span class="nota-row-num w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-bold inline-flex items-center justify-center flex-shrink-0 mb-2">${rowNum}</span>
                <div class="flex-1 min-w-0">
                    <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Nama Aset</label>
                    <input type="text" class="nota-nama w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600" placeholder="Nama barang">
                </div>
            </div>
            <div class="lg:col-span-2">
                <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Akun Aset</label>
                <select class="nota-akun-aset w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                    ${buildSelectOptions(asetCandidates.length > 0 ? asetCandidates : coaList, "-- Pilih Akun Aset --")}
                </select>
            </div>
            <div class="lg:col-span-2">
                <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Akun Akumulasi Penyusutan</label>
                <select class="nota-akun-akum w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                    ${buildSelectOptions(akumCandidates.length > 0 ? akumCandidates : coaList, "-- Akun Akumulasi --")}
                </select>
            </div>
            <div class="lg:col-span-2">
                <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Biaya Penyusutan</label>
                <select class="nota-akun-beban w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-teal-600">
                    ${buildSelectOptions(bebanCandidates.length > 0 ? bebanCandidates : coaList, "-- Biaya Penyusutan --")}
                </select>
            </div>
            <div class="lg:col-span-1">
                <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Harga (Rp)</label>
                <input type="number" min="0" step="any" value="0" class="nota-harga w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-right rounded-none focus:outline-none focus:border-teal-600">
            </div>
            <div class="lg:col-span-1 flex gap-1.5">
                <div class="flex-1 min-w-0">
                    <label class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Umur (Th)</label>
                    <input type="number" min="0" value="5" class="nota-umur w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-center rounded-none focus:outline-none focus:border-teal-600">
                </div>
                <input type="hidden" class="nota-qty" value="1">
            </div>
            <div class="lg:col-span-1 flex items-center justify-end gap-1.5 pb-0.5">
                <button type="button" title="Tambah baris di bawah" class="btn-add-inline w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center justify-center cursor-pointer transition flex-shrink-0">+</button>
                <button type="button" title="Hapus baris" class="btn-remove-inline w-6 h-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer transition flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        `;

        rowEl.querySelector('.nota-harga')?.addEventListener('input', hitungTotalNota);
        rowEl.querySelector('.btn-add-inline')?.addEventListener('click', () => {
            addNotaItemRow();
            renumberNotaRows();
        });
        rowEl.querySelector('.btn-remove-inline')?.addEventListener('click', () => {
            const totalRows = itemsContainer.querySelectorAll('.nota-item-row').length;
            if (totalRows <= 1) {
                showToast("Minimal harus ada 1 baris item aset.", true);
                return;
            }
            rowEl.remove();
            renumberNotaRows();
            hitungTotalNota();
        });

        itemsContainer.appendChild(rowEl);
        hitungTotalNota();
    }

    function resetNotaForm() {
        if (formNota) formNota.reset();
        const tglEl = document.getElementById('nota-tgl-beli');
        if (tglEl) tglEl.value = new Date().toISOString().slice(0, 10);
        if (itemsContainer) {
            itemsContainer.innerHTML = "";
            addNotaItemRow();
            addNotaItemRow();
            addNotaItemRow();
            renumberNotaRows();
        }
        hitungTotalNota();
    }

    function openTransaksiModal() {
        if (!modalTransaksi) return;
        resetNotaForm();
        modalTransaksi.classList.remove('hidden');
        document.getElementById('nota-tgl-beli')?.focus();
    }

    function closeTransaksiModal() {
        if (modalTransaksi) modalTransaksi.classList.add('hidden');
    }

    function syncBulkDeleteButton() {
        const totalSelected = selectedIds.size;
        if (!btnHapusMasal) return;
        if (totalSelected > 0) {
            btnHapusMasal.classList.remove('hidden');
            btnHapusMasal.disabled = false;
        } else {
            btnHapusMasal.classList.add('hidden');
            btnHapusMasal.disabled = true;
        }
        if (labelHapusMasal) labelHapusMasal.textContent = `Hapus Terpilih (${totalSelected})`;
    }

    function openEditModal(item) {
        if (!editModal || !item) return;
        document.getElementById('edit-aset-id').value = item.id || "";
        document.getElementById('edit-aset-nama').value = item.nama || "";
        document.getElementById('edit-aset-kondisi').value = item.kondisi || "Baik";
        document.getElementById('edit-aset-harga').value = String(item.harga ?? 0);
        document.getElementById('edit-aset-jumlah').value = String(item.jumlah || 1);
        document.getElementById('edit-aset-tahun').value = String(item.tahun || new Date().getFullYear());
        document.getElementById('edit-aset-umur').value = String(item.umurTahun ?? 5);
        document.getElementById('edit-aset-lokasi').value = item.lokasi || "";
        editModal.classList.remove('hidden');
        document.getElementById('edit-aset-nama')?.focus();
    }

    function closeEditModal() {
        if (editModal) editModal.classList.add('hidden');
        if (editForm) editForm.reset();
    }

    if (btnOpenTransaksi) btnOpenTransaksi.onclick = openTransaksiModal;
    if (btnTutupNota) btnTutupNota.onclick = closeTransaksiModal;
    if (btnXTransaksi) btnXTransaksi.onclick = closeTransaksiModal;
    if (btnResetNota) btnResetNota.onclick = resetNotaForm;

    const onTransaksiBackdrop = (e) => {
        if (modalTransaksi && e.target === modalTransaksi) closeTransaksiModal();
    };
    if (modalTransaksi) modalTransaksi.addEventListener('click', onTransaksiBackdrop);

    if (btnCloseEdit) btnCloseEdit.onclick = closeEditModal;
    if (btnCancelEdit) btnCancelEdit.onclick = closeEditModal;

    const onEditBackdrop = (e) => {
        if (editModal && e.target === editModal) closeEditModal();
    };
    const onKeyDown = (e) => {
        if (e.key === "Escape") {
            if (confirmModal && !confirmModal.classList.contains('hidden')) closeConfirmModal(false);
            if (editModal && !editModal.classList.contains('hidden')) closeEditModal();
            if (modalTransaksi && !modalTransaksi.classList.contains('hidden')) closeTransaksiModal();
        }
    };

    if (editModal) editModal.addEventListener('click', onEditBackdrop);
    document.addEventListener('keydown', onKeyDown);

    if (btnTambahBaris) {
        btnTambahBaris.onclick = () => {
            addNotaItemRow();
            renumberNotaRows();
        };
    }

    function getFilteredAset() {
        const keyword = searchEl ? searchEl.value.trim().toLowerCase() : "";
        const selectedKondisi = filterKondisiEl ? filterKondisiEl.value : "";

        return allAsetList.filter((item) => {
            const matchKondisi = !selectedKondisi || String(item.kondisi || "") === selectedKondisi;
            if (!matchKondisi) return false;
            if (!keyword) return true;
            const hay = `${item.kodeInventaris || ""} ${item.nama || ""} ${item.kondisi || ""} ${item.tahun || ""} ${item.lokasi || ""} ${item.keterangan || ""}`.toLowerCase();
            return hay.includes(keyword);
        });
    }

    function renderAsetView() {
        if (!container) return;
        syncBulkDeleteButton();

        const filtered = getFilteredAset();
        const totalFiltered = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalFiltered);
        const pageItems = filtered.slice(startIdx, endIdx);

        if (infoCountEl) {
            if (totalFiltered === 0) {
                infoCountEl.textContent = allAsetList.length === 0
                    ? "Total: 0 Item aset terdaftar."
                    : `Menampilkan 0 dari ${allAsetList.length} Item aset.`;
            } else {
                infoCountEl.textContent = `Menampilkan ${startIdx + 1}-${endIdx} dari ${totalFiltered} Item aset` +
                    (totalFiltered !== allAsetList.length ? ` (Total database: ${allAsetList.length})` : "");
            }
        }

        if (paginationBar) {
            if (totalFiltered > PAGE_SIZE) {
                paginationBar.classList.remove('hidden');
                if (pageInfoEl) pageInfoEl.textContent = `Halaman ${currentPage} dari ${totalPages} (${PAGE_SIZE} baris / halaman)`;
                if (pageBadgeEl) pageBadgeEl.textContent = `${currentPage} / ${totalPages}`;
                if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
                if (btnNextPage) btnNextPage.disabled = currentPage >= totalPages;
            } else {
                paginationBar.classList.add('hidden');
            }
        }

        if (pageItems.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">${allAsetList.length === 0 ? "Belum ada data aset." : "Tidak ada aset yang sesuai dengan pencarian/filter."}</div>`;
            return;
        }

        const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id));

        let html = `
            <div class="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-none">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                <th class="p-3.5 w-10 text-center">
                                    <input type="checkbox" class="aset-select-all w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${allPageSelected ? "checked" : ""}>
                                </th>
                                <th class="p-3.5 w-12 text-center">No</th>
                                <th class="p-3.5">Kode / Nama Aset</th>
                                <th class="p-3.5">Kondisi</th>
                                <th class="p-3.5 text-center w-20">Jumlah</th>
                                <th class="p-3.5 text-right w-28">Harga (Rp)</th>
                                <th class="p-3.5 text-center w-20">Tahun</th>
                                <th class="p-3.5">Lokasi</th>
                                <th class="p-3.5 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
        `;

        pageItems.forEach((item, idx) => {
            const nomorUrut = startIdx + idx + 1;
            const safeId = escapeHtml(item.id);
            const safeKode = escapeHtml(item.kodeInventaris || "");
            const safeNama = escapeHtml(item.nama || "-");
            const safeKondisi = escapeHtml(item.kondisi || "Baik");
            const badgeClass = getKondisiBadgeClass(item.kondisi);
            const jml = parseInt(item.jumlah, 10) || 1;
            const hargaFmt = escapeHtml(formatRupiah(item.harga || 0));
            const safeTahun = escapeHtml(item.tahun || "-");
            const safeLokasi = escapeHtml(item.lokasi || "-");
            const isChecked = selectedIds.has(item.id);

            html += `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${isChecked ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}">
                    <td class="p-3.5 text-center">
                        <input type="checkbox" data-aset-id="${safeId}" class="aset-row-checkbox w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${isChecked ? "checked" : ""}>
                    </td>
                    <td class="p-3.5 text-center text-slate-500 font-medium">${nomorUrut}</td>
                    <td class="p-3.5">
                        ${safeKode ? `<span class="block text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">${safeKode}</span>` : ""}
                        <span class="font-semibold text-slate-800 dark:text-slate-100">${safeNama}</span>
                    </td>
                    <td class="p-3.5"><span class="px-2 py-0.5 text-[10px] font-semibold border ${badgeClass}">${safeKondisi}</span></td>
                    <td class="p-3.5 text-center font-medium">${jml.toLocaleString("id-ID")}</td>
                    <td class="p-3.5 text-right font-semibold">${hargaFmt}</td>
                    <td class="p-3.5 text-center">${safeTahun}</td>
                    <td class="p-3.5 text-slate-500 dark:text-slate-400">${safeLokasi}</td>
                    <td class="p-3.5 text-center">
                        <div class="inline-flex items-center justify-center gap-1.5">
                            <button type="button" data-edit-aset="${safeId}" class="btn-edit-aset px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">Edit</button>
                            <button type="button" data-delete-aset="${safeId}" class="btn-hapus-aset px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div>`;

        html += `
            <div class="block md:hidden space-y-3">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-none flex items-center justify-between text-xs">
                    <label class="inline-flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" class="aset-select-all w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${allPageSelected ? "checked" : ""}>
                        <span>Pilih Semua (Halaman Ini)</span>
                    </label>
                    <span class="text-[11px] text-slate-400">${pageItems.length} data</span>
                </div>
        `;

        pageItems.forEach((item) => {
            const safeId = escapeHtml(item.id);
            const safeKode = escapeHtml(item.kodeInventaris || "");
            const safeNama = escapeHtml(item.nama || "-");
            const safeKondisi = escapeHtml(item.kondisi || "Baik");
            const badgeClass = getKondisiBadgeClass(item.kondisi);
            const jml = parseInt(item.jumlah, 10) || 1;
            const hargaFmt = escapeHtml(formatRupiah(item.harga || 0));
            const safeTahun = escapeHtml(item.tahun || "-");
            const safeLokasi = escapeHtml(item.lokasi || "-");
            const isChecked = selectedIds.has(item.id);

            html += `
                <div class="bg-white dark:bg-slate-900 border ${isChecked ? "border-indigo-400 dark:border-indigo-600" : "border-slate-200 dark:border-slate-800"} p-4 rounded-none shadow-xs space-y-2.5 text-xs">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-start gap-2.5 min-w-0">
                            <input type="checkbox" data-aset-id="${safeId}" class="aset-row-checkbox w-4 h-4 mt-0.5 accent-indigo-600 cursor-pointer rounded-none flex-shrink-0" ${isChecked ? "checked" : ""}>
                            <div class="min-w-0">
                                <span class="inline-block px-2 py-0.5 text-[10px] font-semibold border ${badgeClass} mb-1">${safeKondisi}</span>
                                ${safeKode ? `<span class="block text-[10px] font-mono text-indigo-600 dark:text-indigo-400">${safeKode}</span>` : ""}
                                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug break-words">${safeNama}</h3>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" data-edit-aset="${safeId}" class="btn-edit-aset px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">Edit</button>
                            <button type="button" data-delete-aset="${safeId}" class="btn-hapus-aset px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">Hapus</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                            <span class="text-slate-400 block text-[10px]">Jumlah</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${jml.toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block text-[10px]">Harga</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${hargaFmt}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-400 block text-[10px]">Tahun</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${safeTahun}</span>
                        </div>
                    </div>
                    <div class="text-[11px] text-slate-600 dark:text-slate-400 break-words">
                        <span class="text-slate-400">Lokasi:</span>
                        <span class="font-medium text-slate-700 dark:text-slate-300 ml-1">${safeLokasi}</span>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        container.innerHTML = html;

        container.querySelectorAll('.aset-select-all').forEach((chkAll) => {
            chkAll.onchange = () => {
                const checked = chkAll.checked;
                pageItems.forEach((item) => {
                    if (checked) selectedIds.add(item.id);
                    else selectedIds.delete(item.id);
                });
                renderAsetView();
            };
        });

        container.querySelectorAll('.aset-row-checkbox').forEach((chkRow) => {
            chkRow.onchange = () => {
                const id = chkRow.getAttribute('data-aset-id');
                if (!id) return;
                if (chkRow.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                renderAsetView();
            };
        });

        container.querySelectorAll('.btn-edit-aset').forEach((btn) => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-edit-aset');
                const found = allAsetList.find((a) => a.id === id);
                if (found) openEditModal(found);
            };
        });

        container.querySelectorAll('.btn-hapus-aset').forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-aset');
                if (!id) return;
                const ok = await askSmoothConfirm("Hapus Aset", "Apakah Anda yakin ingin menghapus aset ini?", "Ya, Hapus");
                if (!ok) return;
                try {
                    await deleteDoc(doc(db, "aset", id));
                    selectedIds.delete(id);
                    showToast("Aset berhasil dihapus!");
                    await loadAset();
                } catch (err) {
                    console.error("Gagal menghapus aset:", err);
                    showToast("Gagal menghapus aset.", true);
                }
            };
        });
    }

    async function loadCoa() {
        try {
            const snap = await getDocs(collection(db, "coa"));
            const list = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
            list.sort((a, b) => String(a.kodeAkun || "").localeCompare(String(b.kodeAkun || "")));
            coaList = list;
            populateCoaDropdowns();
        } catch (err) {
            console.warn("Gagal memuat COA untuk form nota aset:", err);
        }
    }

    const loadAset = async () => {
        if (!container) return;
        try {
            const querySnapshot = await getDocs(collection(db, "aset"));
            const list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            list.sort((a, b) => String(a.kodeInventaris || a.nama || "").localeCompare(String(b.kodeInventaris || b.nama || ""), "id"));
            allAsetList = list;

            const validIds = new Set(allAsetList.map((a) => a.id));
            selectedIds.forEach((id) => {
                if (!validIds.has(id)) selectedIds.delete(id);
            });

            renderAsetView();
        } catch (err) {
            console.error("Gagal memuat aset:", err);
            if (infoCountEl) infoCountEl.textContent = "Gagal memuat jumlah aset.";
            if (paginationBar) paginationBar.classList.add('hidden');
            container.innerHTML = `<div class="p-6 text-center text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Gagal memuat data dari database.</div>`;
        }
    };

    const onFilterChange = () => {
        currentPage = 1;
        renderAsetView();
    };

    const onPrevPage = () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderAsetView();
        }
    };

    const onNextPage = () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredAset().length / PAGE_SIZE));
        if (currentPage < totalPages) {
            currentPage += 1;
            renderAsetView();
        }
    };

    const onBulkDelete = async () => {
        const idsToDelete = Array.from(selectedIds);
        if (idsToDelete.length === 0) return;

        const ok = await askSmoothConfirm(
            "Hapus Masal Aset",
            `Apakah Anda yakin ingin menghapus ${idsToDelete.length} aset terpilih secara masal?`,
            "Ya, Hapus Semua"
        );
        if (!ok) return;

        if (btnHapusMasal) {
            btnHapusMasal.disabled = true;
            if (labelHapusMasal) labelHapusMasal.textContent = "Menghapus...";
        }

        try {
            const chunkSize = 400;
            for (let i = 0; i < idsToDelete.length; i += chunkSize) {
                const batch = writeBatch(db);
                idsToDelete.slice(i, i + chunkSize).forEach((id) => {
                    batch.delete(doc(db, "aset", id));
                });
                await batch.commit();
            }

            idsToDelete.forEach((id) => selectedIds.delete(id));
            showToast(`${idsToDelete.length} aset berhasil dihapus!`);
            await loadAset();
        } catch (err) {
            console.error("Gagal menghapus aset secara masal:", err);
            showToast("Gagal menghapus aset terpilih.", true);
            renderAsetView();
        }
    };

    if (searchEl) searchEl.addEventListener('input', onFilterChange);
    if (filterKondisiEl) filterKondisiEl.addEventListener('change', onFilterChange);
    if (btnPrevPage) btnPrevPage.addEventListener('click', onPrevPage);
    if (btnNextPage) btnNextPage.addEventListener('click', onNextPage);
    if (btnHapusMasal) btnHapusMasal.addEventListener('click', onBulkDelete);

    if (formNota && itemsContainer) {
        formNota.onsubmit = async (e) => {
            e.preventDefault();

            const unitKerja = document.getElementById('nota-unit-kerja')?.value || UNIT_KERJA_OPTIONS[0];
            const tglBeli = document.getElementById('nota-tgl-beli')?.value || new Date().toISOString().slice(0, 10);
            const tahun = tglBeli.slice(0, 4) || String(new Date().getFullYear());
            const pemasok = document.getElementById('nota-pemasok')?.value.trim() || "";
            const akunBayar = document.getElementById('nota-akun-bayar')?.value || "";
            const keterangan = document.getElementById('nota-keterangan')?.value.trim() || "";

            const rows = Array.from(itemsContainer.querySelectorAll('.nota-item-row'));
            const validItems = [];

            rows.forEach((row) => {
                const nama = row.querySelector('.nota-nama')?.value.trim() || "";
                if (!nama) return;

                const akunAset = row.querySelector('.nota-akun-aset')?.value || "";
                const akunAkumulasi = row.querySelector('.nota-akun-akum')?.value || "";
                const biayaPenyusutan = row.querySelector('.nota-akun-beban')?.value || "";
                const harga = Math.max(0, parseFloat(row.querySelector('.nota-harga')?.value || 0) || 0);
                const jumlah = Math.max(1, parseInt(row.querySelector('.nota-qty')?.value || 1, 10) || 1);
                const umurTahun = Math.max(0, parseInt(row.querySelector('.nota-umur')?.value || 5, 10) || 0);

                validItems.push({
                    nama,
                    akunAset,
                    akunAkumulasi,
                    biayaPenyusutan,
                    harga,
                    jumlah,
                    umurTahun
                });
            });

            if (validItems.length === 0) {
                showToast("Isi minimal 1 Nama Aset pada rincian nota.", true);
                return;
            }

            if (btnSimpanSeluruh) {
                btnSimpanSeluruh.disabled = true;
                btnSimpanSeluruh.textContent = "Menyimpan...";
            }

            try {
                let nextSeq = 0;
                const prefix = `AST-${tahun}-`;
                allAsetList.forEach((a) => {
                    const kode = String(a.kodeInventaris || "");
                    if (kode.startsWith(prefix)) {
                        const n = parseInt(kode.slice(prefix.length), 10);
                        if (!Number.isNaN(n) && n > nextSeq) nextSeq = n;
                    }
                });

                const batch = writeBatch(db);
                const totalNota = validItems.reduce((sum, it) => sum + (it.harga * it.jumlah), 0);

                const notaRef = doc(collection(db, "nota_aset"));
                batch.set(notaRef, {
                    unitKerja,
                    tglBeli,
                    tahun,
                    pemasok,
                    akunBayar,
                    keterangan,
                    jumlahItem: validItems.length,
                    totalNilai: totalNota,
                    createdAt: serverTimestamp()
                });

                validItems.forEach((it) => {
                    nextSeq += 1;
                    const kodeInventaris = `${prefix}${String(nextSeq).padStart(3, "0")}`;
                    const asetRef = doc(collection(db, "aset"));
                    batch.set(asetRef, {
                        kodeInventaris,
                        notaId: notaRef.id,
                        nama: it.nama,
                        kondisi: "Baik",
                        jumlah: it.jumlah,
                        harga: it.harga,
                        tahun,
                        umurTahun: it.umurTahun,
                        lokasi: unitKerja,
                        tglBeli,
                        pemasok,
                        akunBayar,
                        akunAset: it.akunAset,
                        akunAkumulasi: it.akunAkumulasi,
                        biayaPenyusutan: it.biayaPenyusutan,
                        keterangan,
                        createdAt: serverTimestamp()
                    });
                });

                await batch.commit();

                showToast(`${validItems.length} item aset berhasil disimpan!`);
                closeTransaksiModal();
                await loadAset();
            } catch (err) {
                console.error("Gagal menyimpan nota aset:", err);
                showToast("Gagal menyimpan data aset.", true);
            } finally {
                if (btnSimpanSeluruh) {
                    btnSimpanSeluruh.disabled = false;
                    btnSimpanSeluruh.textContent = "Simpan Seluruh Aset";
                }
            }
        };
    }

    if (editForm) {
        editForm.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-aset-id')?.value.trim() || "";
            if (!id) return;

            const nama = document.getElementById('edit-aset-nama')?.value.trim() || "";
            const kondisi = document.getElementById('edit-aset-kondisi')?.value || "Baik";
            const harga = Math.max(0, parseFloat(document.getElementById('edit-aset-harga')?.value || 0) || 0);
            const jumlah = Math.max(1, parseInt(document.getElementById('edit-aset-jumlah')?.value || 1, 10) || 1);
            const tahun = document.getElementById('edit-aset-tahun')?.value.trim() || String(new Date().getFullYear());
            const umurTahun = Math.max(0, parseInt(document.getElementById('edit-aset-umur')?.value || 5, 10) || 0);
            const lokasi = document.getElementById('edit-aset-lokasi')?.value.trim() || "";

            if (!nama) {
                showToast("Nama aset wajib diisi.", true);
                return;
            }

            if (btnUpdateAset) {
                btnUpdateAset.disabled = true;
                btnUpdateAset.textContent = "Menyimpan...";
            }

            try {
                await updateDoc(doc(db, "aset", id), {
                    nama,
                    kondisi,
                    harga,
                    jumlah,
                    tahun,
                    umurTahun,
                    lokasi,
                    updatedAt: serverTimestamp()
                });
                showToast("Perubahan aset berhasil disimpan!");
                closeEditModal();
                await loadAset();
            } catch (err) {
                console.error("Gagal memperbarui aset:", err);
                showToast("Gagal memperbarui aset.", true);
            } finally {
                if (btnUpdateAset) {
                    btnUpdateAset.disabled = false;
                    btnUpdateAset.textContent = "Simpan Perubahan";
                }
            }
        };
    }

    const cleanup = () => {
        if (pendingConfirmResolver) closeConfirmModal(false);
        if (btnConfirmYa) btnConfirmYa.removeEventListener('click', onConfirmYa);
        if (btnConfirmBatal) btnConfirmBatal.removeEventListener('click', onConfirmBatal);
        if (confirmModal) confirmModal.removeEventListener('click', onConfirmBackdrop);
        if (modalTransaksi) modalTransaksi.removeEventListener('click', onTransaksiBackdrop);
        if (editModal) editModal.removeEventListener('click', onEditBackdrop);
        document.removeEventListener('keydown', onKeyDown);
        if (searchEl) searchEl.removeEventListener('input', onFilterChange);
        if (filterKondisiEl) filterKondisiEl.removeEventListener('change', onFilterChange);
        if (btnPrevPage) btnPrevPage.removeEventListener('click', onPrevPage);
        if (btnNextPage) btnNextPage.removeEventListener('click', onNextPage);
        if (btnHapusMasal) btnHapusMasal.removeEventListener('click', onBulkDelete);
        window.removeEventListener('hashchange', cleanup);
        asetCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    asetCleanup = cleanup;

    resetNotaForm();
    await loadCoa();
    await loadAset();

    return cleanup;
}