// File: assets/js/views/manajemen-galeri.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderManajemenGaleri() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in relative">
            <!-- Toast Notifikasi Smooth -->
            <div id="toast-notif" class="fixed top-5 right-5 z-50 transform translate-y-[-20px] opacity-0 transition-all duration-300 pointer-events-none">
                <div class="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span id="toast-message" class="font-medium">Galeri berhasil disimpan!</span>
                </div>
            </div>

            <!-- Header, Tombol Kembali & Aksi Atas -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div class="flex items-center gap-3">
                    <a href="#/manajemen" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition rounded-none flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </a>
                    <div>
                        <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Galeri</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola dokumentasi foto kegiatan, kategori, dan galeri perusahaan. Menampilkan 5 data per halaman.</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <!-- Filter Kategori -->
                    <div class="w-full sm:w-44">
                        <select id="filter-kategori" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">Semua Kategori</option>
                            <option value="Kegiatan Kantor">Kegiatan Kantor</option>
                            <option value="Agrowisata">Agrowisata</option>
                            <option value="Kompos">Kompos</option>
                            <option value="Greenhouse">Greenhouse</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <!-- Kolom Pencarian -->
                    <div class="relative flex-1 md:w-56">
                        <input type="text" id="search-galeri" placeholder="Cari galeri..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 pr-8 rounded-none focus:outline-none focus:border-indigo-600">
                        <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <!-- Tombol Hapus Terpilih (Muncul Otomatis Saat Ada Ceklis) -->
                    <button type="button" id="btn-bulk-delete-galeri" onclick="openBulkDeleteModal()" class="hidden bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3.5 py-2 rounded-none transition items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span id="bulk-delete-label">Hapus Terpilih (0)</span>
                    </button>

                    <!-- Tombol Tambah Galeri -->
                    <button onclick="openAddGaleriModal()" class="bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold px-4 py-2 rounded-none transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                        <span>Tambah Galeri</span>
                    </button>
                </div>
            </div>

            <!-- TAMPILAN TABEL (Desktop) -->
            <div class="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                                <th class="p-3 w-12 text-center">
                                    <input type="checkbox" id="select-all-galeri" onchange="toggleSelectAllGaleri(this.checked)" title="Pilih semua pada halaman ini" class="rounded-none border-slate-300 cursor-pointer">
                                </th>
                                <th class="p-3 w-36 font-semibold">Foto Dokumentasi</th>
                                <th class="p-3 font-semibold">Judul / Keterangan</th>
                                <th class="p-3 w-40 font-semibold">Kategori</th>
                                <th class="p-3 w-28 font-semibold text-center">Status</th>
                                <th class="p-3 w-28 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="galeri-table-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                            <!-- Data dimuat dari Firestore -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAMPILAN CARD (Mobile) -->
            <div id="galeri-card-container" class="md:hidden space-y-3">
                <!-- Data card dimuat dari Firestore -->
            </div>

            <!-- Navigasi Pagination (5 Data per Halaman) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span id="pagination-info" class="text-slate-500 dark:text-slate-400">Menampilkan 0 - 0 dari 0 data</span>
                <div class="flex items-center gap-1">
                    <button id="btn-prev-page" onclick="changePage(-1)" class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <span id="page-indicator" class="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">1</span>
                    <button id="btn-next-page" onclick="changePage(1)" class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>

            <!-- MODAL TAMBAH GALERI BARU -->
            <div id="add-galeri-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0" id="add-modal-box">
                    <!-- Header Modal -->
                    <div class="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Tambah Foto Galeri Baru</h3>
                        <button onclick="closeAddGaleriModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Isi Modal Form -->
                    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <form id="form-tambah-galeri" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul / Keterangan Foto</label>
                                <input type="text" id="galeri-title" placeholder="Misal: Panen Raya Bersama Warga" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Unit / Kegiatan</label>
                                <select id="galeri-kategori" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="">Pilih Kategori</option>
                                    <option value="Kegiatan Kantor">Kegiatan Kantor</option>
                                    <option value="Agrowisata">Agrowisata</option>
                                    <option value="Kompos">Kompos</option>
                                    <option value="Greenhouse">Greenhouse</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Foto</label>
                                <div class="flex items-center">
                                    <label class="w-full flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
                                        <span id="file-name-label" class="text-xs text-slate-400 truncate">Tidak ada yang dipilih</span>
                                        <span class="bg-[#0b2f64] hover:bg-[#082247] text-white text-[11px] font-semibold px-4 py-1.5 rounded-none flex-shrink-0 ml-2">Pilih File</span>
                                        <input type="file" id="galeri-file-input" accept="image/*" class="hidden">
                                    </label>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-1">Otomatis kompres dengan lebar maks. 600px.</p>
                            </div>

                            <button type="submit" id="btn-submit-galeri" class="w-full bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold py-3 rounded-none transition cursor-pointer shadow-sm">
                                Simpan Foto Galeri
                            </button>
                        </form>

                        <!-- Kotak Pratinjau Foto -->
                        <div class="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 p-6 h-64 bg-slate-50 dark:bg-slate-950/50 relative">
                            <span id="preview-placeholder" class="text-xs text-slate-400 text-center">Pratinjau Foto</span>
                            <img id="galeri-preview-img" src="" alt="Pratinjau" class="hidden h-full w-full object-cover border border-slate-200 dark:border-slate-700">
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL EDIT GALERI -->
            <div id="edit-galeri-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0" id="edit-modal-box">
                    <!-- Header Modal -->
                    <div class="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Foto Galeri</h3>
                        <button onclick="closeEditGaleriModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Isi Modal Form Edit -->
                    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <form id="form-edit-galeri" class="space-y-4">
                            <input type="hidden" id="edit-galeri-id">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul / Keterangan Foto</label>
                                <input type="text" id="edit-galeri-title" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Unit / Kegiatan</label>
                                <select id="edit-galeri-kategori" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="">Pilih Kategori</option>
                                    <option value="Kegiatan Kantor">Kegiatan Kantor</option>
                                    <option value="Agrowisata">Agrowisata</option>
                                    <option value="Kompos">Kompos</option>
                                    <option value="Greenhouse">Greenhouse</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ganti Foto (Opsional)</label>
                                <div class="flex items-center">
                                    <label class="w-full flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
                                        <span id="edit-file-name-label" class="text-xs text-slate-400 truncate">Tetap gunakan foto lama</span>
                                        <span class="bg-[#0b2f64] hover:bg-[#082247] text-white text-[11px] font-semibold px-4 py-1.5 rounded-none flex-shrink-0 ml-2">Pilih File</span>
                                        <input type="file" id="edit-galeri-file-input" accept="image/*" class="hidden">
                                    </label>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-1">Biarkan kosong jika tidak ingin mengubah foto.</p>
                            </div>

                            <button type="submit" id="btn-update-galeri" class="w-full bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold py-3 rounded-none transition cursor-pointer shadow-sm">
                                Perbarui Perubahan
                            </button>
                        </form>

                        <!-- Kotak Pratinjau Edit -->
                        <div class="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 p-6 h-64 bg-slate-50 dark:bg-slate-950/50 relative">
                            <img id="edit-galeri-preview-img" src="" alt="Pratinjau" class="h-full w-full object-cover border border-slate-200 dark:border-slate-700">
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL KONFIRMASI HAPUS SMOOTH (SATUAN & BERSAMA) -->
            <div id="delete-confirm-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0 p-6 space-y-4 text-center" id="delete-modal-box">
                    <div class="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </div>
                    <div>
                        <h3 id="delete-modal-title" class="text-sm font-bold text-slate-800 dark:text-slate-100">Hapus Foto Galeri?</h3>
                        <p id="delete-modal-desc" class="text-xs text-slate-500 dark:text-slate-400 mt-1">Apakah Anda yakin ingin menghapus foto galeri ini dari database? Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <div class="flex items-center justify-center gap-3 pt-2">
                        <button onclick="closeDeleteModal()" class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold transition cursor-pointer">Batal</button>
                        <button id="btn-confirm-delete" class="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer">Ya, Hapus</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initManajemenGaleriHandler() {
    console.log("Halaman Manajemen Galeri dimuat.");

    let galeriList = [];
    let currentPage = 1;
    const itemsPerPage = 5;
    let searchQuery = "";
    let selectedKategoriFilter = "";
    let compressedBase64Image = "";
    let editCompressedBase64Image = "";
    let galeriIdToDelete = null;
    let isBulkDeleteMode = false;
    let selectedIds = new Set();

    // Toast Notifikasi Smooth
    function showToast(message) {
        const toastNotif = document.getElementById('toast-notif');
        const msgEl = document.getElementById('toast-message');
        if (!toastNotif || !msgEl) return;

        msgEl.textContent = message;
        toastNotif.classList.remove('translate-y-[-20px]', 'opacity-0');
        toastNotif.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toastNotif.classList.remove('translate-y-0', 'opacity-100');
            toastNotif.classList.add('translate-y-[-20px]', 'opacity-0');
        }, 3000);
    }

    // Sinkronisasi Tombol Hapus Bersama & Checkbox Pilih Semua
    function updateBulkDeleteUI(pageItemIds = []) {
        const bulkBtn = document.getElementById('btn-bulk-delete-galeri');
        const bulkLabel = document.getElementById('bulk-delete-label');
        const selectAllCheckbox = document.getElementById('select-all-galeri');

        const count = selectedIds.size;
        if (bulkBtn && bulkLabel) {
            if (count > 0) {
                bulkBtn.classList.remove('hidden');
                bulkBtn.classList.add('flex');
                bulkLabel.textContent = `Hapus Terpilih (${count})`;
            } else {
                bulkBtn.classList.add('hidden');
                bulkBtn.classList.remove('flex');
            }
        }

        if (selectAllCheckbox) {
            if (pageItemIds.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else {
                const checkedOnPage = pageItemIds.filter(id => selectedIds.has(id)).length;
                selectAllCheckbox.checked = checkedOnPage === pageItemIds.length;
                selectAllCheckbox.indeterminate = checkedOnPage > 0 && checkedOnPage < pageItemIds.length;
            }
        }
    }

    window.toggleSelectGaleri = function(id, checked) {
        if (!id) return;
        if (checked) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
        window.renderTable();
    };

    window.toggleSelectAllGaleri = function(checked) {
        const filteredList = galeriList.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchKategori = selectedKategoriFilter === "" || item.kategori === selectedKategoriFilter;
            return matchTitle && matchKategori;
        });

        const totalData = filteredList.length;
        const totalPages = Math.ceil(totalData / itemsPerPage) || 1;
        const safePage = Math.min(Math.max(currentPage, 1), totalPages);
        const startIdx = (safePage - 1) * itemsPerPage;
        const paginatedData = filteredList.slice(startIdx, startIdx + itemsPerPage);

        paginatedData.forEach(item => {
            if (checked) {
                selectedIds.add(item.id);
            } else {
                selectedIds.delete(item.id);
            }
        });

        window.renderTable();
    };

    // Modal Add Smooth
    window.openAddGaleriModal = function() {
        const modal = document.getElementById('add-galeri-modal');
        const box = document.getElementById('add-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeAddGaleriModal = function() {
        const modal = document.getElementById('add-galeri-modal');
        const box = document.getElementById('add-modal-box');
        if (modal && box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                const form = document.getElementById('form-tambah-galeri');
                if (form) form.reset();
                document.getElementById('file-name-label').textContent = 'Tidak ada yang dipilih';
                document.getElementById('galeri-preview-img').classList.add('hidden');
                document.getElementById('preview-placeholder').classList.remove('hidden');
                compressedBase64Image = "";
            }, 300);
        }
    };

    // Modal Edit Smooth
    window.openEditGaleriModal = function(id) {
        const item = galeriList.find(g => g.id === id);
        if (!item) return;

        document.getElementById('edit-galeri-id').value = item.id;
        document.getElementById('edit-galeri-title').value = item.title;
        document.getElementById('edit-galeri-kategori').value = item.kategori;
        document.getElementById('edit-galeri-preview-img').src = item.image;
        document.getElementById('edit-file-name-label').textContent = 'Tetap gunakan foto lama';
        editCompressedBase64Image = item.image;

        const modal = document.getElementById('edit-galeri-modal');
        const box = document.getElementById('edit-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeEditGaleriModal = function() {
        const modal = document.getElementById('edit-galeri-modal');
        const box = document.getElementById('edit-modal-box');
        if (modal && box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                const form = document.getElementById('form-edit-galeri');
                if (form) form.reset();
                editCompressedBase64Image = "";
            }, 300);
        }
    };

    // Modal Konfirmasi Hapus Satuan Smooth
    window.deleteGaleri = function(id) {
        isBulkDeleteMode = false;
        galeriIdToDelete = id;

        const titleEl = document.getElementById('delete-modal-title');
        const descEl = document.getElementById('delete-modal-desc');
        if (titleEl) titleEl.textContent = "Hapus Foto Galeri?";
        if (descEl) descEl.textContent = "Apakah Anda yakin ingin menghapus foto galeri ini dari database? Tindakan ini tidak dapat dibatalkan.";

        const modal = document.getElementById('delete-confirm-modal');
        const box = document.getElementById('delete-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    // Modal Konfirmasi Hapus Bersama Smooth
    window.openBulkDeleteModal = function() {
        if (selectedIds.size === 0) return;
        isBulkDeleteMode = true;
        galeriIdToDelete = null;

        const count = selectedIds.size;
        const titleEl = document.getElementById('delete-modal-title');
        const descEl = document.getElementById('delete-modal-desc');
        if (titleEl) titleEl.textContent = `Hapus ${count} Foto Galeri Terpilih?`;
        if (descEl) descEl.textContent = `Apakah Anda yakin ingin menghapus ${count} foto galeri yang diceklis secara bersamaan dari database? Tindakan ini tidak dapat dibatalkan.`;

        const modal = document.getElementById('delete-confirm-modal');
        const box = document.getElementById('delete-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeDeleteModal = function() {
        const modal = document.getElementById('delete-confirm-modal');
        const box = document.getElementById('delete-modal-box');
        if (modal && box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                galeriIdToDelete = null;
                isBulkDeleteMode = false;
            }, 300);
        }
    };

    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async function() {
            const origText = btnConfirmDelete.textContent;
            btnConfirmDelete.disabled = true;
            btnConfirmDelete.textContent = "Menghapus...";

            try {
                if (isBulkDeleteMode) {
                    const idsToDelete = Array.from(selectedIds);
                    if (idsToDelete.length === 0) return;

                    const batch = writeBatch(db);
                    idsToDelete.forEach(id => {
                        batch.delete(doc(db, "galeri", id));
                    });
                    await batch.commit();

                    idsToDelete.forEach(id => selectedIds.delete(id));
                    window.closeDeleteModal();
                    showToast(`${idsToDelete.length} foto galeri berhasil dihapus!`);
                } else {
                    if (!galeriIdToDelete) return;
                    await deleteDoc(doc(db, "galeri", galeriIdToDelete));
                    selectedIds.delete(galeriIdToDelete);
                    window.closeDeleteModal();
                    showToast("Foto galeri berhasil dihapus!");
                }

                await fetchGaleriFromDB();
            } catch (error) {
                console.error("Gagal menghapus galeri:", error);
                showToast("Terjadi kesalahan saat menghapus foto galeri.");
            } finally {
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.textContent = origText;
            }
        });
    }

    // Kompres Gambar Tambah Galeri (Maks 600px)
    const fileInput = document.getElementById('galeri-file-input');
    const fileNameLabel = document.getElementById('file-name-label');
    const previewImg = document.getElementById('galeri-preview-img');
    const previewPlaceholder = document.getElementById('preview-placeholder');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            fileNameLabel.textContent = file.name;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 600;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    compressedBase64Image = canvas.toDataURL('image/jpeg', 0.85);

                    previewImg.src = compressedBase64Image;
                    previewImg.classList.remove('hidden');
                    previewPlaceholder.classList.add('hidden');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Kompres Gambar Edit Galeri (Maks 600px)
    const editFileInput = document.getElementById('edit-galeri-file-input');
    const editFileNameLabel = document.getElementById('edit-file-name-label');
    const editPreviewImg = document.getElementById('edit-galeri-preview-img');

    if (editFileInput) {
        editFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            editFileNameLabel.textContent = file.name;

            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 600;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    editCompressedBase64Image = canvas.toDataURL('image/jpeg', 0.85);
                    editPreviewImg.src = editCompressedBase64Image;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Ambil Data dari Firestore
    async function fetchGaleriFromDB() {
        try {
            const q = query(collection(db, "galeri"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            galeriList = [];
            const validIds = new Set();
            querySnapshot.forEach((docSnap) => {
                galeriList.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
                validIds.add(docSnap.id);
            });

            // Bersihkan ID yang sudah tidak ada di database
            Array.from(selectedIds).forEach(id => {
                if (!validIds.has(id)) selectedIds.delete(id);
            });

            window.renderTable();
        } catch (error) {
            console.error("Gagal mengambil data galeri dari Firestore:", error);
        }
    }

    // Render Tabel & Card dengan Pagination 5 Item
    window.renderTable = function() {
        const tbody = document.getElementById('galeri-table-body');
        const cardContainer = document.getElementById('galeri-card-container');
        const info = document.getElementById('pagination-info');
        const pageIndicator = document.getElementById('page-indicator');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');

        if (!tbody || !cardContainer) return;

        const filteredList = galeriList.filter(item => {
            const matchTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchKategori = selectedKategoriFilter === "" || item.kategori === selectedKategoriFilter;
            return matchTitle && matchKategori;
        });

        const totalData = filteredList.length;
        const totalPages = Math.ceil(totalData / itemsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const paginatedData = filteredList.slice(startIdx, endIdx);

        tbody.innerHTML = '';
        cardContainer.innerHTML = '';

        if (paginatedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada foto galeri di Firestore. Silakan klik "Tambah Galeri".</td></tr>`;
            cardContainer.innerHTML = `<div class="bg-white dark:bg-slate-900 p-6 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800">Belum ada foto galeri di Firestore. Silakan klik "Tambah Galeri".</div>`;
        } else {
            paginatedData.forEach((item) => {
                const isChecked = selectedIds.has(item.id);

                // Desktop (Tabel)
                const tr = document.createElement('tr');
                tr.className = `hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition ${isChecked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`;
                tr.innerHTML = `
                    <td class="p-3 text-center">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelectGaleri('${item.id}', this.checked)" class="rounded-none border-slate-300 cursor-pointer">
                    </td>
                    <td class="p-3"><img src="${item.image}" alt="Galeri" class="w-28 h-14 object-cover border border-slate-200 dark:border-slate-700 rounded-none"></td>
                    <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">${item.title}</td>
                    <td class="p-3">
                        <span class="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-none">${item.kategori}</span>
                    </td>
                    <td class="p-3 text-center">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${item.active ? 'checked' : ''} onchange="toggleGaleriStatus('${item.id}', ${item.active})" class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:w-4 after:h-4 after:rounded-none transition-all peer-checked:bg-[#0b2f64]"></div>
                        </label>
                    </td>
                    <td class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openEditGaleriModal('${item.id}')" class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button onclick="deleteGaleri('${item.id}')" class="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);

                // Mobile (Card)
                const card = document.createElement('div');
                card.className = `bg-white dark:bg-slate-900 border ${isChecked ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10' : 'border-slate-200 dark:border-slate-800'} p-3 shadow-xs space-y-3 text-xs`;
                card.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5 overflow-hidden">
                            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSelectGaleri('${item.id}', this.checked)" class="rounded-none border-slate-300 cursor-pointer flex-shrink-0">
                            <img src="${item.image}" alt="Galeri" class="w-20 h-12 object-cover border border-slate-200 dark:border-slate-700 rounded-none flex-shrink-0">
                            <div class="truncate">
                                <p class="font-semibold text-slate-800 dark:text-slate-100 truncate">${item.title}</p>
                                <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-block mt-0.5">${item.kategori}</span>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" ${item.active ? 'checked' : ''} onchange="toggleGaleriStatus('${item.id}', ${item.active})" class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:w-4 after:h-4 after:rounded-none transition-all peer-checked:bg-[#0b2f64]"></div>
                        </label>
                    </div>
                    <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button onclick="openEditGaleriModal('${item.id}')" class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                        <button onclick="deleteGaleri('${item.id}')" class="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                    </div>
                `;
                cardContainer.appendChild(card);
            });
        }

        updateBulkDeleteUI(paginatedData.map(d => d.id));

        if (info) info.textContent = `Menampilkan ${totalData > 0 ? startIdx + 1 : 0} - ${Math.min(endIdx, totalData)} dari ${totalData} data`;
        if (pageIndicator) pageIndicator.textContent = `${currentPage}`;
        if (btnPrev) btnPrev.disabled = currentPage === 1;
        if (btnNext) btnNext.disabled = currentPage === totalPages || totalData === 0;
    };

    window.changePage = function(direction) {
        currentPage += direction;
        window.renderTable();
    };

    // Update Status di Firestore secara Async
    window.toggleGaleriStatus = async function(id, currentStatus) {
        try {
            const galeriRef = doc(db, "galeri", id);
            await updateDoc(galeriRef, {
                active: !currentStatus
            });
            await fetchGaleriFromDB();
            showToast("Status galeri berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
            showToast("Gagal memperbarui status di database.");
        }
    };

    // Handle Submit Form Simpan Galeri Baru ke Firestore
    const galeriForm = document.getElementById('form-tambah-galeri');
    if (galeriForm) {
        galeriForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const title = document.getElementById('galeri-title').value.trim();
            const kategori = document.getElementById('galeri-kategori').value;
            const submitBtn = document.getElementById('btn-submit-galeri');

            if (!title || !kategori || !compressedBase64Image) {
                showToast("Judul, kategori, dan foto galeri wajib diisi!");
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Menyimpan ke Firestore...";

                await addDoc(collection(db, "galeri"), {
                    title: title,
                    kategori: kategori,
                    image: compressedBase64Image,
                    active: true,
                    createdAt: serverTimestamp()
                });

                window.closeAddGaleriModal();
                showToast("Foto galeri berhasil disimpan!");
                await fetchGaleriFromDB();
            } catch (error) {
                console.error("Gagal menyimpan ke Firestore:", error);
                showToast("Terjadi kesalahan saat menyimpan ke database.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Foto Galeri";
            }
        });
    }

    // Handle Submit Form Edit Galeri ke Firestore
    const editGaleriForm = document.getElementById('form-edit-galeri');
    if (editGaleriForm) {
        editGaleriForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-galeri-id').value;
            const title = document.getElementById('edit-galeri-title').value.trim();
            const kategori = document.getElementById('edit-galeri-kategori').value;
            const updateBtn = document.getElementById('btn-update-galeri');

            if (!title || !kategori) {
                showToast("Judul dan kategori galeri wajib diisi!");
                return;
            }

            try {
                updateBtn.disabled = true;
                updateBtn.textContent = "Memperbarui...";

                const galeriRef = doc(db, "galeri", id);
                await updateDoc(galeriRef, {
                    title: title,
                    kategori: kategori,
                    image: editCompressedBase64Image
                });

                window.closeEditGaleriModal();
                showToast("Foto galeri berhasil diperbarui!");
                await fetchGaleriFromDB();
            } catch (error) {
                console.error("Gagal memperbarui galeri:", error);
                showToast("Terjadi kesalahan saat memperbarui galeri.");
            } finally {
                updateBtn.disabled = false;
                updateBtn.textContent = "Perbarui Perubahan";
            }
        });
    }

    // Fitur Pencarian & Filter Kategori
    const searchInput = document.getElementById('search-galeri');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            currentPage = 1;
            window.renderTable();
        });
    }

    const kategoriFilterSelect = document.getElementById('filter-kategori');
    if (kategoriFilterSelect) {
        kategoriFilterSelect.addEventListener('change', function(e) {
            selectedKategoriFilter = e.target.value;
            currentPage = 1;
            window.renderTable();
        });
    }

    // Ambil data pertama kali dari Firestore
    fetchGaleriFromDB();
}