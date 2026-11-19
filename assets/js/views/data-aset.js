// File: assets/js/views/data-aset.js
import {
    getDocs,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const PAGE_SIZE = 10;

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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

export function renderAset() {
    const currentYear = new Date().getFullYear();

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
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Manajemen Aset &amp; Inventaris</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="aset-info-count">Memuat jumlah aset...</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button type="button" id="btn-hapus-masal-aset" disabled
                        class="hidden px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span id="label-hapus-masal-aset">Hapus Terpilih (0)</span>
                    </button>
                    <button type="button" id="btn-open-add-aset" class="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        <span>Tambah Aset Baru</span>
                    </button>
                </div>
            </div>

            <!-- Filter & Pencarian -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                <div class="sm:col-span-2">
                    <label for="aset-search" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI ASET / LOKASI</label>
                    <input type="text" id="aset-search" placeholder="Cari nama aset, lokasi, atau tahun perolehan..."
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

            <!-- MODAL TAMBAH / EDIT ASET -->
            <div id="modal-tambah-aset" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-4 sm:p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 id="modal-aset-title" class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Aset</h3>
                        <button type="button" id="btn-close-modal-aset" aria-label="Tutup modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-aset" class="space-y-3 text-xs">
                        <input type="hidden" id="aset-edit-id" value="">
                        <div>
                            <label for="aset-nama" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Aset / Barang *</label>
                            <input type="text" id="aset-nama" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: Laptop Kantor Core i5">
                        </div>
                        <div>
                            <label for="aset-kondisi" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kondisi</label>
                            <select id="aset-kondisi" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                                <option value="Baik">Baik</option>
                                <option value="Kurang Baik">Kurang Baik</option>
                                <option value="Rusak Berat">Rusak Berat</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label for="aset-jumlah" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah *</label>
                                <input type="number" id="aset-jumlah" min="1" value="1" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                            <div>
                                <label for="aset-tahun" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Perolehan</label>
                                <input type="number" id="aset-tahun" value="${currentYear}" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                        </div>
                        <div>
                            <label for="aset-lokasi" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi / Unit / Penanggung Jawab</label>
                            <input type="text" id="aset-lokasi" list="aset-lokasi-list" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: KANTOR PUSAT (01) / Ruang Utama">
                            <datalist id="aset-lokasi-list">
                                <option value="KANTOR PUSAT (01)"></option>
                                <option value="AGROWISATA (02)"></option>
                                <option value="KOMPOS (03)"></option>
                                <option value="GREENHOUSE (04)"></option>
                            </datalist>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-modal-aset" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-none cursor-pointer">Batal</button>
                            <button type="submit" id="btn-simpan-aset" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-none cursor-pointer">Simpan Aset</button>
                        </div>
                    </form>
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

    const paginationBar = document.getElementById('aset-pagination-bar');
    const pageInfoEl = document.getElementById('aset-page-info');
    const pageBadgeEl = document.getElementById('aset-page-badge');
    const btnPrevPage = document.getElementById('btn-aset-prev');
    const btnNextPage = document.getElementById('btn-aset-next');

    const modal = document.getElementById('modal-tambah-aset');
    const modalTitle = document.getElementById('modal-aset-title');
    const editIdInput = document.getElementById('aset-edit-id');
    const btnOpen = document.getElementById('btn-open-add-aset');
    const btnClose = document.getElementById('btn-close-modal-aset');
    const btnCancel = document.getElementById('btn-cancel-modal-aset');
    const form = document.getElementById('form-tambah-aset');
    const btnSimpan = document.getElementById('btn-simpan-aset');

    let allAsetList = [];
    let selectedIds = new Set();
    let currentPage = 1;

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
        if (labelHapusMasal) {
            labelHapusMasal.textContent = `Hapus Terpilih (${totalSelected})`;
        }
    }

    function openAddModal() {
        if (!modal) return;
        if (form) form.reset();
        if (editIdInput) editIdInput.value = "";
        if (modalTitle) modalTitle.textContent = "Form Tambah Aset";
        if (btnSimpan) btnSimpan.textContent = "Simpan Aset";

        const jumlahEl = document.getElementById('aset-jumlah');
        const tahunEl = document.getElementById('aset-tahun');
        if (jumlahEl) jumlahEl.value = "1";
        if (tahunEl) tahunEl.value = new Date().getFullYear().toString();

        modal.classList.remove('hidden');
        const namaInput = document.getElementById('aset-nama');
        if (namaInput) namaInput.focus();
    }

    function openEditModal(item) {
        if (!modal || !item) return;
        if (editIdInput) editIdInput.value = item.id || "";
        if (modalTitle) modalTitle.textContent = "Form Edit Aset";
        if (btnSimpan) btnSimpan.textContent = "Perbarui Aset";

        const namaEl = document.getElementById('aset-nama');
        const kondisiEl = document.getElementById('aset-kondisi');
        const jumlahEl = document.getElementById('aset-jumlah');
        const tahunEl = document.getElementById('aset-tahun');
        const lokasiEl = document.getElementById('aset-lokasi');

        if (namaEl) namaEl.value = item.nama || "";
        if (kondisiEl) kondisiEl.value = item.kondisi || "Baik";
        if (jumlahEl) jumlahEl.value = String(item.jumlah || 1);
        if (tahunEl) tahunEl.value = item.tahun || new Date().getFullYear().toString();
        if (lokasiEl) lokasiEl.value = item.lokasi || "";

        modal.classList.remove('hidden');
        if (namaEl) namaEl.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        if (editIdInput) editIdInput.value = "";
        if (form) form.reset();
    }

    if (btnOpen) btnOpen.onclick = openAddModal;
    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    const onModalBackdropClick = (e) => {
        if (modal && e.target === modal) closeModal();
    };
    const onKeyDown = (e) => {
        if (e.key === "Escape" && modal && !modal.classList.contains('hidden')) {
            closeModal();
        }
    };

    if (modal) modal.addEventListener('click', onModalBackdropClick);
    document.addEventListener('keydown', onKeyDown);

    function getFilteredAset() {
        const keyword = searchEl ? searchEl.value.trim().toLowerCase() : "";
        const selectedKondisi = filterKondisiEl ? filterKondisiEl.value : "";

        return allAsetList.filter((item) => {
            const matchKondisi = !selectedKondisi || String(item.kondisi || "") === selectedKondisi;
            if (!matchKondisi) return false;

            if (!keyword) return true;
            const hay = `${item.nama || ""} ${item.kondisi || ""} ${item.tahun || ""} ${item.lokasi || ""}`.toLowerCase();
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

        // Tampilan Desktop (Tabel)
        let html = `
            <div class="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-none">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                <th class="p-3.5 w-10 text-center">
                                    <input type="checkbox" class="aset-select-all w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${allPageSelected ? "checked" : ""} title="Pilih semua di halaman ini">
                                </th>
                                <th class="p-3.5 w-12 text-center">No</th>
                                <th class="p-3.5">Nama Aset</th>
                                <th class="p-3.5">Kondisi</th>
                                <th class="p-3.5 text-center w-20">Jumlah</th>
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
            const safeNama = escapeHtml(item.nama || "-");
            const safeKondisi = escapeHtml(item.kondisi || "Baik");
            const badgeClass = getKondisiBadgeClass(item.kondisi);
            const jml = parseInt(item.jumlah, 10) || 1;
            const safeTahun = escapeHtml(item.tahun || "-");
            const safeLokasi = escapeHtml(item.lokasi || "-");
            const isChecked = selectedIds.has(item.id);

            html += `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${isChecked ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}">
                    <td class="p-3.5 text-center">
                        <input type="checkbox" data-aset-id="${safeId}" class="aset-row-checkbox w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${isChecked ? "checked" : ""}>
                    </td>
                    <td class="p-3.5 text-center text-slate-500 font-medium">${nomorUrut}</td>
                    <td class="p-3.5 font-semibold text-slate-800 dark:text-slate-100">${safeNama}</td>
                    <td class="p-3.5"><span class="px-2 py-0.5 text-[10px] font-semibold border ${badgeClass}">${safeKondisi}</span></td>
                    <td class="p-3.5 text-center font-medium">${jml.toLocaleString("id-ID")}</td>
                    <td class="p-3.5 text-center">${safeTahun}</td>
                    <td class="p-3.5 text-slate-500 dark:text-slate-400">${safeLokasi}</td>
                    <td class="p-3.5 text-center">
                        <div class="inline-flex items-center justify-center gap-1.5">
                            <button type="button" data-edit-aset="${safeId}" class="btn-edit-aset px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">
                                Edit
                            </button>
                            <button type="button" data-delete-aset="${safeId}" class="btn-hapus-aset px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div>`;

        // Tampilan HP (Card)
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
            const safeNama = escapeHtml(item.nama || "-");
            const safeKondisi = escapeHtml(item.kondisi || "Baik");
            const badgeClass = getKondisiBadgeClass(item.kondisi);
            const jml = parseInt(item.jumlah, 10) || 1;
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
                                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug break-words">${safeNama}</h3>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" data-edit-aset="${safeId}" class="btn-edit-aset px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">
                                Edit
                            </button>
                            <button type="button" data-delete-aset="${safeId}" class="btn-hapus-aset px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                            <span class="text-slate-400 block text-[10px]">Jumlah</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${jml.toLocaleString("id-ID")}</span>
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

        // Handler ceklis pilih semua di halaman aktif
        container.querySelectorAll('.aset-select-all').forEach((chkAll) => {
            chkAll.onchange = () => {
                const checked = chkAll.checked;
                pageItems.forEach((item) => {
                    if (checked) {
                        selectedIds.add(item.id);
                    } else {
                        selectedIds.delete(item.id);
                    }
                });
                renderAsetView();
            };
        });

        // Handler ceklis per baris/card
        container.querySelectorAll('.aset-row-checkbox').forEach((chkRow) => {
            chkRow.onchange = () => {
                const id = chkRow.getAttribute('data-aset-id');
                if (!id) return;
                if (chkRow.checked) {
                    selectedIds.add(id);
                } else {
                    selectedIds.delete(id);
                }
                renderAsetView();
            };
        });

        // Handler edit aset
        container.querySelectorAll('.btn-edit-aset').forEach((btn) => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-edit-aset');
                const found = allAsetList.find((a) => a.id === id);
                if (found) openEditModal(found);
            };
        });

        // Handler hapus satu aset
        container.querySelectorAll('.btn-hapus-aset').forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-aset');
                if (!id) return;
                if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;
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

    const loadAset = async () => {
        if (!container) return;
        try {
            const querySnapshot = await getDocs(collection(db, "aset"));
            const list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            list.sort((a, b) => String(a.nama || "").localeCompare(String(b.nama || ""), "id"));
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

        if (!confirm(`Apakah Anda yakin ingin menghapus ${idsToDelete.length} aset terpilih secara masal?`)) {
            return;
        }

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

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const targetId = editIdInput ? editIdInput.value.trim() : "";
            const namaEl = document.getElementById('aset-nama');
            const kondisiEl = document.getElementById('aset-kondisi');
            const jumlahEl = document.getElementById('aset-jumlah');
            const tahunEl = document.getElementById('aset-tahun');
            const lokasiEl = document.getElementById('aset-lokasi');

            const nama = namaEl ? namaEl.value.trim() : "";
            const kondisi = kondisiEl ? kondisiEl.value : "Baik";
            const jumlah = Math.max(1, parseInt(jumlahEl ? jumlahEl.value : 1, 10) || 1);
            const tahun = tahunEl ? tahunEl.value.trim() : "";
            const lokasi = lokasiEl ? lokasiEl.value.trim() : "";

            if (!nama) {
                showToast("Nama aset / barang wajib diisi.", true);
                return;
            }

            if (btnSimpan) {
                btnSimpan.disabled = true;
                btnSimpan.textContent = "Menyimpan...";
            }

            try {
                if (targetId) {
                    await updateDoc(doc(db, "aset", targetId), {
                        nama,
                        kondisi,
                        jumlah,
                        tahun,
                        lokasi,
                        updatedAt: serverTimestamp()
                    });
                    showToast("Aset berhasil diperbarui!");
                } else {
                    await addDoc(collection(db, "aset"), {
                        nama,
                        kondisi,
                        jumlah,
                        tahun,
                        lokasi,
                        createdAt: serverTimestamp()
                    });
                    showToast("Aset berhasil ditambahkan!");
                }

                closeModal();
                await loadAset();
            } catch (error) {
                console.error("Gagal menyimpan aset:", error);
                showToast("Terjadi kesalahan saat menyimpan aset.", true);
            } finally {
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = targetId ? "Perbarui Aset" : "Simpan Aset";
                }
            }
        };
    }

    const cleanup = () => {
        if (modal) modal.removeEventListener('click', onModalBackdropClick);
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

    await loadAset();

    return cleanup;
}