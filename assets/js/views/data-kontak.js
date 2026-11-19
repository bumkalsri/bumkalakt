// File: assets/js/views/data-kontak.js
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

function formatWaLink(telepon) {
    const digits = String(telepon || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("0")) return `https://wa.me/62${digits.slice(1)}`;
    if (digits.startsWith("62")) return `https://wa.me/${digits}`;
    return `https://wa.me/${digits}`;
}

export function renderKontak() {
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
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Manajemen Kontak</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="kontak-info-count">Memuat jumlah kontak...</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button type="button" id="btn-hapus-masal-kontak" disabled
                        class="hidden px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span id="label-hapus-masal-kontak">Hapus Terpilih (0)</span>
                    </button>
                    <button type="button" id="btn-open-add-kontak" class="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 rounded-none cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        <span>Tambah Kontak Baru</span>
                    </button>
                </div>
            </div>

            <!-- Filter & Pencarian -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                <div class="sm:col-span-2">
                    <label for="kontak-search" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI KONTAK</label>
                    <input type="text" id="kontak-search" placeholder="Cari nama, telepon, atau alamat..."
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                </div>
                <div>
                    <label for="kontak-filter-kategori" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER KATEGORI</label>
                    <select id="kontak-filter-kategori"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                        <option value="">Semua Kategori</option>
                        <option value="Pelanggan">Pelanggan</option>
                        <option value="Supplier">Supplier</option>
                        <option value="Mitra">Mitra</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
            </div>

            <!-- TABEL / CONTAINER KONTAK -->
            <div id="kontak-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Memuat data kontak...</div>
            </div>

            <!-- PAGINASI (10 BARIS PER HALAMAN) -->
            <div id="kontak-pagination-bar" class="hidden bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div id="kontak-page-info" class="text-slate-500 dark:text-slate-400 font-medium">
                    Halaman 1 dari 1
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" id="btn-kontak-prev"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Sebelumnya
                    </button>
                    <span id="kontak-page-badge" class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold">
                        1 / 1
                    </span>
                    <button type="button" id="btn-kontak-next"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">
                        Berikutnya
                    </button>
                </div>
            </div>

            <!-- MODAL TAMBAH / EDIT KONTAK -->
            <div id="modal-tambah-kontak" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-4 sm:p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 id="modal-kontak-title" class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Kontak</h3>
                        <button type="button" id="btn-close-modal" aria-label="Tutup modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-kontak" class="space-y-3 text-xs">
                        <input type="hidden" id="kontak-edit-id" value="">
                        <div>
                            <label for="kontak-nama" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap / Instansi *</label>
                            <input type="text" id="kontak-nama" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: PT Maju Jaya">
                        </div>
                        <div>
                            <label for="kontak-kategori" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                            <select id="kontak-kategori" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                                <option value="Pelanggan">Pelanggan</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Mitra">Mitra</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label for="kontak-telepon" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                            <input type="text" id="kontak-telepon" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: 081234567890">
                        </div>
                        <div>
                            <label for="kontak-alamat" class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                            <textarea id="kontak-alamat" rows="2" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Alamat lengkap..."></textarea>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-modal" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-none cursor-pointer">Batal</button>
                            <button type="submit" id="btn-simpan-kontak" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-none cursor-pointer">Simpan Kontak</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-kontak" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-kontak-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-kontak-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let kontakToastTimer = null;
let kontakCleanup = null;

export async function initKontakHandler() {
    if (typeof kontakCleanup === "function") {
        kontakCleanup();
        kontakCleanup = null;
    }

    const container = document.getElementById('kontak-container');
    const infoCountEl = document.getElementById('kontak-info-count');
    const searchEl = document.getElementById('kontak-search');
    const filterKatEl = document.getElementById('kontak-filter-kategori');

    const btnHapusMasal = document.getElementById('btn-hapus-masal-kontak');
    const labelHapusMasal = document.getElementById('label-hapus-masal-kontak');

    const paginationBar = document.getElementById('kontak-pagination-bar');
    const pageInfoEl = document.getElementById('kontak-page-info');
    const pageBadgeEl = document.getElementById('kontak-page-badge');
    const btnPrevPage = document.getElementById('btn-kontak-prev');
    const btnNextPage = document.getElementById('btn-kontak-next');

    const modal = document.getElementById('modal-tambah-kontak');
    const modalTitle = document.getElementById('modal-kontak-title');
    const editIdInput = document.getElementById('kontak-edit-id');
    const btnOpen = document.getElementById('btn-open-add-kontak');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('form-tambah-kontak');
    const btnSimpan = document.getElementById('btn-simpan-kontak');

    let allKontakList = [];
    let selectedIds = new Set();
    let currentPage = 1;

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-kontak');
        const msgEl = document.getElementById('toast-kontak-message');
        const iconEl = document.getElementById('toast-kontak-icon');
        if (!toast || !msgEl) return;

        if (kontakToastTimer) clearTimeout(kontakToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        kontakToastTimer = setTimeout(() => {
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
        if (modalTitle) modalTitle.textContent = "Form Tambah Kontak";
        if (btnSimpan) btnSimpan.textContent = "Simpan Kontak";
        modal.classList.remove('hidden');

        const namaInput = document.getElementById('kontak-nama');
        if (namaInput) namaInput.focus();
    }

    function openEditModal(item) {
        if (!modal || !item) return;
        if (editIdInput) editIdInput.value = item.id || "";
        if (modalTitle) modalTitle.textContent = "Form Edit Kontak";
        if (btnSimpan) btnSimpan.textContent = "Perbarui Kontak";

        const namaEl = document.getElementById('kontak-nama');
        const kategoriEl = document.getElementById('kontak-kategori');
        const teleponEl = document.getElementById('kontak-telepon');
        const alamatEl = document.getElementById('kontak-alamat');

        if (namaEl) namaEl.value = item.nama || "";
        if (kategoriEl) kategoriEl.value = item.kategori || "Pelanggan";
        if (teleponEl) teleponEl.value = item.telepon || "";
        if (alamatEl) alamatEl.value = item.alamat || "";

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

    function getFilteredKontak() {
        const keyword = searchEl ? searchEl.value.trim().toLowerCase() : "";
        const selectedKat = filterKatEl ? filterKatEl.value : "";

        return allKontakList.filter((item) => {
            const matchKat = !selectedKat || String(item.kategori || "") === selectedKat;
            if (!matchKat) return false;

            if (!keyword) return true;
            const hay = `${item.nama || ""} ${item.kategori || ""} ${item.telepon || ""} ${item.alamat || ""}`.toLowerCase();
            return hay.includes(keyword);
        });
    }

    function renderKontakView() {
        if (!container) return;

        syncBulkDeleteButton();

        const filtered = getFilteredKontak();
        const totalFiltered = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalFiltered);
        const pageItems = filtered.slice(startIdx, endIdx);

        if (infoCountEl) {
            if (totalFiltered === 0) {
                infoCountEl.textContent = allKontakList.length === 0
                    ? "Total: 0 Kontak terdaftar."
                    : `Menampilkan 0 dari ${allKontakList.length} Kontak.`;
            } else {
                infoCountEl.textContent = `Menampilkan ${startIdx + 1}-${endIdx} dari ${totalFiltered} Kontak` +
                    (totalFiltered !== allKontakList.length ? ` (Total database: ${allKontakList.length})` : "");
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
            container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">${allKontakList.length === 0 ? "Belum ada data kontak." : "Tidak ada kontak yang sesuai dengan pencarian/filter."}</div>`;
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
                                    <input type="checkbox" class="kontak-select-all w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${allPageSelected ? "checked" : ""} title="Pilih semua di halaman ini">
                                </th>
                                <th class="p-3.5 w-12 text-center">No</th>
                                <th class="p-3.5">Nama / Instansi</th>
                                <th class="p-3.5">Kategori</th>
                                <th class="p-3.5">Telepon</th>
                                <th class="p-3.5">Alamat</th>
                                <th class="p-3.5 text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
        `;

        pageItems.forEach((item, idx) => {
            const nomorUrut = startIdx + idx + 1;
            const safeId = escapeHtml(item.id);
            const safeNama = escapeHtml(item.nama || "-");
            const safeKat = escapeHtml(item.kategori || "Umum");
            const safeTel = escapeHtml(item.telepon || "-");
            const safeAlamat = escapeHtml(item.alamat || "-");
            const waUrl = formatWaLink(item.telepon);
            const isChecked = selectedIds.has(item.id);

            html += `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${isChecked ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""}">
                    <td class="p-3.5 text-center">
                        <input type="checkbox" data-kontak-id="${safeId}" class="kontak-row-checkbox w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${isChecked ? "checked" : ""}>
                    </td>
                    <td class="p-3.5 text-center text-slate-500 font-medium">${nomorUrut}</td>
                    <td class="p-3.5 font-semibold text-slate-800 dark:text-slate-100">${safeNama}</td>
                    <td class="p-3.5"><span class="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">${safeKat}</span></td>
                    <td class="p-3.5">
                        ${waUrl
                            ? `<a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">${safeTel}</a>`
                            : safeTel}
                    </td>
                    <td class="p-3.5 text-slate-500 dark:text-slate-400">${safeAlamat}</td>
                    <td class="p-3.5 text-center">
                        <div class="inline-flex items-center justify-center gap-1.5">
                            <button type="button" data-edit-kontak="${safeId}" class="btn-edit-kontak px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">
                                Edit
                            </button>
                            <button type="button" data-delete-kontak="${safeId}" class="btn-hapus-kontak px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
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
                        <input type="checkbox" class="kontak-select-all w-4 h-4 accent-indigo-600 cursor-pointer rounded-none" ${allPageSelected ? "checked" : ""}>
                        <span>Pilih Semua (Halaman Ini)</span>
                    </label>
                    <span class="text-[11px] text-slate-400">${pageItems.length} data</span>
                </div>
        `;

        pageItems.forEach((item) => {
            const safeId = escapeHtml(item.id);
            const safeNama = escapeHtml(item.nama || "-");
            const safeKat = escapeHtml(item.kategori || "Umum");
            const safeTel = escapeHtml(item.telepon || "-");
            const safeAlamat = escapeHtml(item.alamat || "-");
            const waUrl = formatWaLink(item.telepon);
            const isChecked = selectedIds.has(item.id);

            html += `
                <div class="bg-white dark:bg-slate-900 border ${isChecked ? "border-indigo-400 dark:border-indigo-600" : "border-slate-200 dark:border-slate-800"} p-4 rounded-none shadow-xs space-y-2.5 text-xs">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-start gap-2.5 min-w-0">
                            <input type="checkbox" data-kontak-id="${safeId}" class="kontak-row-checkbox w-4 h-4 mt-0.5 accent-indigo-600 cursor-pointer rounded-none flex-shrink-0" ${isChecked ? "checked" : ""}>
                            <div class="min-w-0">
                                <span class="inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 mb-1">${safeKat}</span>
                                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug break-words">${safeNama}</h3>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" data-edit-kontak="${safeId}" class="btn-edit-kontak px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-semibold text-[11px] border border-amber-200 dark:border-amber-900 transition cursor-pointer rounded-none">
                                Edit
                            </button>
                            <button type="button" data-delete-kontak="${safeId}" class="btn-hapus-kontak px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </div>
                    </div>
                    <div class="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <span class="text-slate-400">Telepon:</span>
                            ${waUrl
                                ? `<a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-1">${safeTel}</a>`
                                : `<span class="font-medium text-slate-700 dark:text-slate-300 ml-1">${safeTel}</span>`}
                        </div>
                        <div class="break-words">
                            <span class="text-slate-400">Alamat:</span>
                            <span class="text-slate-700 dark:text-slate-300 ml-1">${safeAlamat}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        container.innerHTML = html;

        // Handler ceklis pilih semua di halaman aktif
        container.querySelectorAll('.kontak-select-all').forEach((chkAll) => {
            chkAll.onchange = () => {
                const checked = chkAll.checked;
                pageItems.forEach((item) => {
                    if (checked) {
                        selectedIds.add(item.id);
                    } else {
                        selectedIds.delete(item.id);
                    }
                });
                renderKontakView();
            };
        });

        // Handler ceklis per baris/card
        container.querySelectorAll('.kontak-row-checkbox').forEach((chkRow) => {
            chkRow.onchange = () => {
                const id = chkRow.getAttribute('data-kontak-id');
                if (!id) return;
                if (chkRow.checked) {
                    selectedIds.add(id);
                } else {
                    selectedIds.delete(id);
                }
                renderKontakView();
            };
        });

        // Handler edit kontak
        container.querySelectorAll('.btn-edit-kontak').forEach((btn) => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-edit-kontak');
                const found = allKontakList.find((k) => k.id === id);
                if (found) openEditModal(found);
            };
        });

        // Handler hapus satu kontak
        container.querySelectorAll('.btn-hapus-kontak').forEach((btn) => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-kontak');
                if (!id) return;
                if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) return;
                try {
                    await deleteDoc(doc(db, "kontak", id));
                    selectedIds.delete(id);
                    showToast("Kontak berhasil dihapus!");
                    await loadKontak();
                } catch (err) {
                    console.error("Gagal menghapus kontak:", err);
                    showToast("Gagal menghapus kontak.", true);
                }
            };
        });
    }

    const loadKontak = async () => {
        if (!container) return;
        try {
            const querySnapshot = await getDocs(collection(db, "kontak"));
            const list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            list.sort((a, b) => String(a.nama || "").localeCompare(String(b.nama || ""), "id"));
            allKontakList = list;

            const validIds = new Set(allKontakList.map((k) => k.id));
            selectedIds.forEach((id) => {
                if (!validIds.has(id)) selectedIds.delete(id);
            });

            renderKontakView();
        } catch (err) {
            console.error("Gagal memuat kontak:", err);
            if (infoCountEl) infoCountEl.textContent = "Gagal memuat jumlah kontak.";
            if (paginationBar) paginationBar.classList.add('hidden');
            container.innerHTML = `<div class="p-6 text-center text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Gagal memuat data dari database.</div>`;
        }
    };

    const onFilterChange = () => {
        currentPage = 1;
        renderKontakView();
    };

    const onPrevPage = () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderKontakView();
        }
    };

    const onNextPage = () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredKontak().length / PAGE_SIZE));
        if (currentPage < totalPages) {
            currentPage += 1;
            renderKontakView();
        }
    };

    const onBulkDelete = async () => {
        const idsToDelete = Array.from(selectedIds);
        if (idsToDelete.length === 0) return;

        if (!confirm(`Apakah Anda yakin ingin menghapus ${idsToDelete.length} kontak terpilih secara masal?`)) {
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
                    batch.delete(doc(db, "kontak", id));
                });
                await batch.commit();
            }

            idsToDelete.forEach((id) => selectedIds.delete(id));
            showToast(`${idsToDelete.length} kontak berhasil dihapus!`);
            await loadKontak();
        } catch (err) {
            console.error("Gagal menghapus kontak secara masal:", err);
            showToast("Gagal menghapus kontak terpilih.", true);
            renderKontakView();
        }
    };

    if (searchEl) searchEl.addEventListener('input', onFilterChange);
    if (filterKatEl) filterKatEl.addEventListener('change', onFilterChange);
    if (btnPrevPage) btnPrevPage.addEventListener('click', onPrevPage);
    if (btnNextPage) btnNextPage.addEventListener('click', onNextPage);
    if (btnHapusMasal) btnHapusMasal.addEventListener('click', onBulkDelete);

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const targetId = editIdInput ? editIdInput.value.trim() : "";
            const namaEl = document.getElementById('kontak-nama');
            const kategoriEl = document.getElementById('kontak-kategori');
            const teleponEl = document.getElementById('kontak-telepon');
            const alamatEl = document.getElementById('kontak-alamat');

            const nama = namaEl ? namaEl.value.trim() : "";
            const kategori = kategoriEl ? kategoriEl.value : "Umum";
            const telepon = teleponEl ? teleponEl.value.trim() : "";
            const alamat = alamatEl ? alamatEl.value.trim() : "";

            if (!nama) {
                showToast("Nama lengkap / instansi wajib diisi.", true);
                return;
            }

            if (btnSimpan) {
                btnSimpan.disabled = true;
                btnSimpan.textContent = "Menyimpan...";
            }

            try {
                if (targetId) {
                    await updateDoc(doc(db, "kontak", targetId), {
                        nama,
                        kategori,
                        telepon,
                        alamat,
                        updatedAt: serverTimestamp()
                    });
                    showToast("Kontak berhasil diperbarui!");
                } else {
                    await addDoc(collection(db, "kontak"), {
                        nama,
                        kategori,
                        telepon,
                        alamat,
                        createdAt: serverTimestamp()
                    });
                    showToast("Kontak berhasil ditambahkan!");
                }

                closeModal();
                await loadKontak();
            } catch (error) {
                console.error("Gagal menyimpan kontak:", error);
                showToast("Terjadi kesalahan saat menyimpan kontak.", true);
            } finally {
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = targetId ? "Perbarui Kontak" : "Simpan Kontak";
                }
            }
        };
    }

    const cleanup = () => {
        if (modal) modal.removeEventListener('click', onModalBackdropClick);
        document.removeEventListener('keydown', onKeyDown);
        if (searchEl) searchEl.removeEventListener('input', onFilterChange);
        if (filterKatEl) filterKatEl.removeEventListener('change', onFilterChange);
        if (btnPrevPage) btnPrevPage.removeEventListener('click', onPrevPage);
        if (btnNextPage) btnNextPage.removeEventListener('click', onNextPage);
        if (btnHapusMasal) btnHapusMasal.removeEventListener('click', onBulkDelete);
        window.removeEventListener('hashchange', cleanup);
        kontakCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    kontakCleanup = cleanup;

    await loadKontak();

    return cleanup;
}