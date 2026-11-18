// File: assets/js/views/manajemen-produk.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderManajemenProduk() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in relative">
            <!-- Toast Notifikasi Smooth -->
            <div id="toast-notif" class="fixed top-5 right-5 z-50 transform translate-y-[-20px] opacity-0 transition-all duration-300 pointer-events-none">
                <div class="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span id="toast-message" class="font-medium">Produk berhasil disimpan!</span>
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
                        <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Produk</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola data produk, unit, harga, dan diskon barang. Menampilkan 5 data per halaman.</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <!-- Filter Unit (Dimuat dari Firestore) -->
                    <div class="w-full sm:w-44">
                        <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">Semua Unit</option>
                        </select>
                    </div>

                    <!-- Kolom Pencarian -->
                    <div class="relative flex-1 md:w-56">
                        <input type="text" id="search-product" placeholder="Cari produk..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 pr-8 rounded-none focus:outline-none focus:border-indigo-600">
                        <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <!-- Tombol Tambah Produk -->
                    <button onclick="openAddProductModal()" class="bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold px-4 py-2 rounded-none transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                        <span>Tambah Produk</span>
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
                                    <input type="checkbox" class="rounded-none border-slate-300">
                                </th>
                                <th class="p-3 w-28 font-semibold">Foto</th>
                                <th class="p-3 font-semibold">Nama Produk</th>
                                <th class="p-3 w-32 font-semibold">Unit</th>
                                <th class="p-3 w-28 font-semibold text-center">Diskon</th>
                                <th class="p-3 w-36 font-semibold">Harga</th>
                                <th class="p-3 w-36 font-semibold">Harga Setelah Diskon</th>
                                <th class="p-3 w-28 font-semibold text-center">Status</th>
                                <th class="p-3 w-28 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                            <!-- Data dimuat dari Firestore -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAMPILAN CARD (Mobile) -->
            <div id="product-card-container" class="md:hidden space-y-3">
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

            <!-- MODAL TAMBAH PRODUK BARU -->
            <div id="add-product-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0" id="add-modal-box">
                    <!-- Header Modal -->
                    <div class="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Tambah Produk Baru</h3>
                        <button onclick="closeAddProductModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Isi Modal Form -->
                    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <form id="form-tambah-produk" class="space-y-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
                                <input type="text" id="product-name" placeholder="Misal: Minyak Goreng" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Usaha</label>
                                <select id="product-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="">Pilih Unit</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga</label>
                                <input type="text" id="product-price" placeholder="Misal: 20.000" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diskon (Opsional)</label>
                                <input type="text" id="product-discount" placeholder="Misal: 10% atau 5.000" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Setelah Diskon</label>
                                <input type="text" id="product-final-price" placeholder="Terhitung otomatis" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Gambar</label>
                                <div class="flex items-center">
                                    <label class="w-full flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
                                        <span id="file-name-label" class="text-xs text-slate-400 truncate">Tidak ada yang dipilih</span>
                                        <span class="bg-[#0b2f64] hover:bg-[#082247] text-white text-[11px] font-semibold px-4 py-1.5 rounded-none flex-shrink-0 ml-2">Pilih File</span>
                                        <input type="file" id="product-file-input" accept="image/*" class="hidden">
                                    </label>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-1">Otomatis kompres dengan lebar maks. 400px.</p>
                            </div>

                            <button type="submit" id="btn-submit-product" class="w-full bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold py-3 rounded-none transition cursor-pointer shadow-sm">
                                Simpan Produk
                            </button>
                        </form>

                        <!-- Kotak Pratinjau (4:5) -->
                        <div class="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 p-6 h-72 bg-slate-50 dark:bg-slate-950/50 relative">
                            <span id="preview-placeholder" class="text-xs text-slate-400 text-center">Pratinjau Gambar (4:5)</span>
                            <img id="product-preview-img" src="" alt="Pratinjau" class="hidden h-full w-36 object-cover border border-slate-200 dark:border-slate-700">
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL EDIT PRODUK -->
            <div id="edit-product-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0" id="edit-modal-box">
                    <!-- Header Modal -->
                    <div class="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Produk</h3>
                        <button onclick="closeEditProductModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Isi Modal Form Edit -->
                    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <form id="form-edit-produk" class="space-y-4">
                            <input type="hidden" id="edit-product-id">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
                                <input type="text" id="edit-product-name" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Usaha</label>
                                <select id="edit-product-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="">Pilih Unit</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga</label>
                                <input type="text" id="edit-product-price" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Diskon (Opsional)</label>
                                <input type="text" id="edit-product-discount" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Setelah Diskon</label>
                                <input type="text" id="edit-product-final-price" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-none focus:outline-none focus:border-indigo-600">
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ganti Gambar (Opsional)</label>
                                <div class="flex items-center">
                                    <label class="w-full flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-50 transition">
                                        <span id="edit-file-name-label" class="text-xs text-slate-400 truncate">Tetap gunakan gambar lama</span>
                                        <span class="bg-[#0b2f64] hover:bg-[#082247] text-white text-[11px] font-semibold px-4 py-1.5 rounded-none flex-shrink-0 ml-2">Pilih File</span>
                                        <input type="file" id="edit-product-file-input" accept="image/*" class="hidden">
                                    </label>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-1">Biarkan kosong jika tidak ingin mengubah gambar.</p>
                            </div>

                            <button type="submit" id="btn-update-product" class="w-full bg-[#0b2f64] hover:bg-[#082247] text-white text-xs font-semibold py-3 rounded-none transition cursor-pointer shadow-sm">
                                Perbarui Perubahan
                            </button>
                        </form>

                        <!-- Kotak Pratinjau Edit -->
                        <div class="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 p-6 h-72 bg-slate-50 dark:bg-slate-950/50 relative">
                            <img id="edit-product-preview-img" src="" alt="Pratinjau" class="h-full w-36 object-cover border border-slate-200 dark:border-slate-700">
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL KONFIRMASI HAPUS SMOOTH -->
            <div id="delete-confirm-modal" class="hidden fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-none shadow-2xl overflow-hidden transform transition-all duration-300 scale-95 opacity-0 p-6 space-y-4 text-center" id="delete-modal-box">
                    <div class="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Hapus Produk?</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Apakah Anda yakin ingin menghapus produk ini dari database? Tindakan ini tidak dapat dibatalkan.</p>
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

export function initManajemenProdukHandler() {
    console.log("Halaman Manajemen Produk dimuat.");

    let productList = [];
    let unitList = [];
    let currentPage = 1;
    const itemsPerPage = 5;
    let searchQuery = "";
    let selectedUnitFilter = "";
    let compressedBase64Image = "";
    let editCompressedBase64Image = "";
    let productIdToDelete = null;

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

    // Modal Add Smooth
    window.openAddProductModal = function() {
        const modal = document.getElementById('add-product-modal');
        const box = document.getElementById('add-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeAddProductModal = function() {
        const modal = document.getElementById('add-product-modal');
        const box = document.getElementById('add-modal-box');
        if (modal && box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                const form = document.getElementById('form-tambah-produk');
                if (form) form.reset();
                document.getElementById('file-name-label').textContent = 'Tidak ada yang dipilih';
                document.getElementById('product-preview-img').classList.add('hidden');
                document.getElementById('preview-placeholder').classList.remove('hidden');
                compressedBase64Image = "";
            }, 300);
        }
    };

    // Modal Edit Smooth
    window.openEditProductModal = function(id) {
        const product = productList.find(p => p.id === id);
        if (!product) return;

        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-discount').value = product.discount === "-" ? "" : product.discount;
        document.getElementById('edit-product-final-price').value = product.finalPrice === "-" ? "" : product.finalPrice;
        document.getElementById('edit-product-preview-img').src = product.image;
        document.getElementById('edit-file-name-label').textContent = 'Tetap gunakan gambar lama';
        editCompressedBase64Image = product.image;

        const editUnitSelect = document.getElementById('edit-product-unit');
        if (editUnitSelect) {
            editUnitSelect.innerHTML = `<option value="">Pilih Unit</option>`;
            unitList.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.namaUnit;
                opt.textContent = u.namaUnit;
                if (u.namaUnit === product.unit) opt.selected = true;
                editUnitSelect.appendChild(opt);
            });
        }

        const modal = document.getElementById('edit-product-modal');
        const box = document.getElementById('edit-modal-box');
        if (modal && box) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                box.classList.remove('scale-95', 'opacity-0');
                box.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeEditProductModal = function() {
        const modal = document.getElementById('edit-product-modal');
        const box = document.getElementById('edit-modal-box');
        if (modal && box) {
            box.classList.remove('scale-100', 'opacity-100');
            box.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                const form = document.getElementById('form-edit-produk');
                if (form) form.reset();
                editCompressedBase64Image = "";
            }, 300);
        }
    };

    // Modal Konfirmasi Hapus Smooth
    window.deleteProduct = function(id) {
        productIdToDelete = id;
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
                productIdToDelete = null;
            }, 300);
        }
    };

    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async function() {
            if (!productIdToDelete) return;
            try {
                await deleteDoc(doc(db, "products", productIdToDelete));
                window.closeDeleteModal();
                showToast("Produk berhasil dihapus dari database!");
                await fetchProductsFromDB();
            } catch (error) {
                console.error("Gagal menghapus produk:", error);
                showToast("Terjadi kesalahan saat menghapus produk.");
            }
        });
    }

    // Format Input Harga Menjadi Ribuan Otomatis (Titik)
    function setupPriceFormatting(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value) {
                    value = parseInt(value, 10).toLocaleString('id-ID');
                }
                e.target.value = value;
            });
        }
    }
    setupPriceFormatting('product-price');
    setupPriceFormatting('edit-product-price');

    // Fitur Kalkulator Otomatis Harga Setelah Diskon
    function setupAutoCalculation(priceId, discountId, finalPriceId) {
        const priceEl = document.getElementById(priceId);
        const discountEl = document.getElementById(discountId);
        const finalPriceEl = document.getElementById(finalPriceId);

        if (!priceEl || !discountEl || !finalPriceEl) return;

        function calculate() {
            let rawPrice = priceEl.value.replace(/[^0-9]/g, '');
            let price = parseFloat(rawPrice) || 0;
            let discountStr = discountEl.value.trim();

            if (price === 0) {
                finalPriceEl.value = '';
                return;
            }

            let finalPrice = price;

            if (discountStr.endsWith('%')) {
                let percent = parseFloat(discountStr.replace('%', '')) || 0;
                finalPrice = price - (price * (percent / 100));
            } else if (discountStr !== '') {
                let rawDisc = discountStr.replace(/[^0-9]/g, '');
                let nominalDisc = parseFloat(rawDisc) || 0;
                finalPrice = price - nominalDisc;
            }

            if (finalPrice < 0) finalPrice = 0;
            finalPriceEl.value = Math.round(finalPrice).toLocaleString('id-ID');
        }

        priceEl.addEventListener('input', calculate);
        discountEl.addEventListener('input', calculate);
    }

    setupAutoCalculation('product-price', 'product-discount', 'product-final-price');
    setupAutoCalculation('edit-product-price', 'edit-product-discount', 'edit-product-final-price');

    // Kompres Gambar Tambah Produk
    const fileInput = document.getElementById('product-file-input');
    const fileNameLabel = document.getElementById('file-name-label');
    const previewImg = document.getElementById('product-preview-img');
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
                    const MAX_WIDTH = 400;
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    compressedBase64Image = canvas.toDataURL('image/jpeg', 0.8);
                    previewImg.src = compressedBase64Image;
                    previewImg.classList.remove('hidden');
                    previewPlaceholder.classList.add('hidden');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Kompres Gambar Edit Produk
    const editFileInput = document.getElementById('edit-product-file-input');
    const editFileNameLabel = document.getElementById('edit-file-name-label');
    const editPreviewImg = document.getElementById('edit-product-preview-img');

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
                    const MAX_WIDTH = 400;
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    editCompressedBase64Image = canvas.toDataURL('image/jpeg', 0.8);
                    editPreviewImg.src = editCompressedBase64Image;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Ambil Data Unit dari Koleksi Firestore `unit_usaha`
    async function fetchUnitsFromDB() {
        try {
            const querySnapshot = await getDocs(collection(db, "unit_usaha"));
            unitList = [];
            querySnapshot.forEach((docSnap) => {
                unitList.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            populateUnitDropdowns();
        } catch (error) {
            console.error("Gagal mengambil data unit usaha dari Firestore:", error);
        }
    }

    function populateUnitDropdowns() {
        const filterSelect = document.getElementById('filter-unit');
        const formSelect = document.getElementById('product-unit');

        if (filterSelect) {
            filterSelect.innerHTML = `<option value="">Semua Unit</option>`;
            unitList.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.namaUnit;
                opt.textContent = u.namaUnit;
                filterSelect.appendChild(opt);
            });
        }

        if (formSelect) {
            formSelect.innerHTML = `<option value="">Pilih Unit</option>`;
            unitList.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.namaUnit;
                opt.textContent = u.namaUnit;
                formSelect.appendChild(opt);
            });
        }
    }

    // Ambil Data Produk dari Firestore
    async function fetchProductsFromDB() {
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            productList = [];
            querySnapshot.forEach((docSnap) => {
                productList.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            window.renderTable();
        } catch (error) {
            console.error("Gagal mengambil data produk dari Firestore:", error);
        }
    }

    // Render Tabel & Card dengan Pagination 5 Item
    window.renderTable = function() {
        const tbody = document.getElementById('product-table-body');
        const cardContainer = document.getElementById('product-card-container');
        const info = document.getElementById('pagination-info');
        const pageIndicator = document.getElementById('page-indicator');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');

        if (!tbody || !cardContainer) return;

        const filteredList = productList.filter(p => {
            const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchUnit = selectedUnitFilter === "" || p.unit === selectedUnitFilter;
            return matchName && matchUnit;
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
            tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-400">Belum ada data produk di database.</td></tr>`;
            cardContainer.innerHTML = `<div class="bg-white dark:bg-slate-900 p-6 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800">Belum ada data produk di database.</div>`;
        } else {
            paginatedData.forEach((product) => {
                const discountText = product.discount ? product.discount : '-';
                const unitText = product.unit ? product.unit : '-';
                const finalPriceText = product.finalPrice ? `Rp ${product.finalPrice}` : '-';

                // Desktop (Tabel)
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 text-center"><input type="checkbox" class="rounded-none border-slate-300"></td>
                    <td class="p-3"><img src="${product.image}" alt="Produk" class="w-12 h-14 object-cover border border-slate-200 dark:border-slate-700 rounded-none"></td>
                    <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">${product.name}</td>
                    <td class="p-3">
                        <span class="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-none">${unitText}</span>
                    </td>
                    <td class="p-3 text-center font-medium text-rose-600 dark:text-rose-400">${discountText}</td>
                    <td class="p-3 font-medium text-slate-600 dark:text-slate-300">Rp ${product.price}</td>
                    <td class="p-3 font-medium text-emerald-600 dark:text-emerald-400">${finalPriceText}</td>
                    <td class="p-3 text-center">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" ${product.active ? 'checked' : ''} onchange="toggleProductStatus('${product.id}', ${product.active})" class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:w-4 after:h-4 after:rounded-none transition-all peer-checked:bg-[#0b2f64]"></div>
                        </label>
                    </td>
                    <td class="p-3 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openEditProductModal('${product.id}')" class="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button onclick="deleteProduct('${product.id}')" class="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);

                // Mobile (Card)
                const card = document.createElement('div');
                card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-3 text-xs";
                card.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <img src="${product.image}" alt="Produk" class="w-12 h-14 object-cover border border-slate-200 dark:border-slate-700 rounded-none flex-shrink-0">
                            <div class="truncate">
                                <div class="flex items-center gap-2 mb-0.5">
                                    <p class="font-semibold text-slate-800 dark:text-slate-100 truncate">${product.name}</p>
                                    <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">${unitText}</span>
                                </div>
                                <p class="text-slate-600 dark:text-slate-300">Normal: Rp ${product.price} <span class="text-rose-600 ml-1">(Disc: ${discountText})</span></p>
                                <p class="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Harga Diskon: ${finalPriceText}</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" ${product.active ? 'checked' : ''} onchange="toggleProductStatus('${product.id}', ${product.active})" class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:w-4 after:h-4 after:rounded-none transition-all peer-checked:bg-[#0b2f64]"></div>
                        </label>
                    </div>
                    <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        <button onclick="openEditProductModal('${product.id}')" class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                        <button onclick="deleteProduct('${product.id}')" class="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                    </div>
                `;
                cardContainer.appendChild(card);
            });
        }

        if (info) info.textContent = `Menampilkan ${totalData > 0 ? startIdx + 1 : 0} - ${Math.min(endIdx, totalData)} dari ${totalData} data`;
        if (pageIndicator) pageIndicator.textContent = `${currentPage}`;
        if (btnPrev) btnPrev.disabled = currentPage === 1;
        if (btnNext) btnNext.disabled = currentPage === totalPages || totalData === 0;
    };

    window.changePage = function(direction) {
        currentPage += direction;
        window.renderTable();
    };

    // Update Status di Firestore
    window.toggleProductStatus = async function(id, currentStatus) {
        try {
            const productRef = doc(db, "products", id);
            await updateDoc(productRef, {
                active: !currentStatus
            });
            await fetchProductsFromDB();
            showToast("Status produk berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal memperbarui status produk:", error);
            showToast("Gagal memperbarui status di database.");
        }
    };

    // Handle Submit Form Simpan Produk Baru ke Firestore
    const productForm = document.getElementById('form-tambah-produk');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('product-name').value.trim();
            const unit = document.getElementById('product-unit').value;
            const price = document.getElementById('product-price').value.trim();
            const discount = document.getElementById('product-discount').value.trim();
            const finalPrice = document.getElementById('product-final-price').value.trim();
            const submitBtn = document.getElementById('btn-submit-product');

            if (!name || !unit || !price || !compressedBase64Image) {
                showToast("Nama produk, unit, harga, dan gambar wajib diisi!");
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = "Menyimpan ke Firestore...";

                await addDoc(collection(db, "products"), {
                    name: name,
                    unit: unit,
                    price: price,
                    discount: discount || "-",
                    finalPrice: finalPrice || "-",
                    image: compressedBase64Image,
                    active: true,
                    createdAt: serverTimestamp()
                });

                window.closeAddProductModal();
                showToast("Produk berhasil disimpan ke database Firestore!");
                await fetchProductsFromDB();
            } catch (error) {
                console.error("Gagal menyimpan produk ke Firestore:", error);
                showToast("Terjadi kesalahan saat menyimpan ke database.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Simpan Produk";
            }
        });
    }

    // Handle Submit Form Edit Produk ke Firestore
    const editProductForm = document.getElementById('form-edit-produk');
    if (editProductForm) {
        editProductForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-product-id').value;
            const name = document.getElementById('edit-product-name').value.trim();
            const unit = document.getElementById('edit-product-unit').value;
            const price = document.getElementById('edit-product-price').value.trim();
            const discount = document.getElementById('edit-product-discount').value.trim();
            const finalPrice = document.getElementById('edit-product-final-price').value.trim();
            const updateBtn = document.getElementById('btn-update-product');

            if (!name || !unit || !price) {
                showToast("Nama produk, unit, dan harga wajib diisi!");
                return;
            }

            try {
                updateBtn.disabled = true;
                updateBtn.textContent = "Memperbarui...";

                const productRef = doc(db, "products", id);
                await updateDoc(productRef, {
                    name: name,
                    unit: unit,
                    price: price,
                    discount: discount || "-",
                    finalPrice: finalPrice || "-",
                    image: editCompressedBase64Image
                });

                window.closeEditProductModal();
                showToast("Produk berhasil diperbarui!");
                await fetchProductsFromDB();
            } catch (error) {
                console.error("Gagal memperbarui produk:", error);
                showToast("Terjadi kesalahan saat memperbarui produk.");
            } finally {
                updateBtn.disabled = false;
                updateBtn.textContent = "Perbarui Perubahan";
            }
        });
    }

    // Fitur Pencarian & Filter Unit
    const searchInput = document.getElementById('search-product');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value;
            currentPage = 1;
            window.renderTable();
        });
    }

    const unitFilterSelect = document.getElementById('filter-unit');
    if (unitFilterSelect) {
        unitFilterSelect.addEventListener('change', function(e) {
            selectedUnitFilter = e.target.value;
            currentPage = 1;
            window.renderTable();
        });
    }

    // Muat data unit & produk dari Firestore saat pertama kali dibuka
    fetchUnitsFromDB();
    fetchProductsFromDB();
}