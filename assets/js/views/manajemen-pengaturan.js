// File: assets/js/views/manajemen-pengaturan.js
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderManajemenPengaturan() {
    return `
        <div class="space-y-6 pb-10 max-w-4xl mx-auto animate-fade-in relative px-3 sm:px-0">
            <!-- Toast Notifikasi Smooth (Hidden secara default) -->
            <div id="toast-notif" class="fixed top-5 right-5 z-50 transform translate-y-[-20px] opacity-0 transition-all duration-300 pointer-events-none">
                <div class="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span id="toast-message" class="font-medium">Pengaturan berhasil disimpan!</span>
                </div>
            </div>

            <!-- Tombol Kembali & Header Halaman -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center gap-3">
                    <a href="#/manajemen" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition rounded-none flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengaturan Profil Perusahaan & Pengurus</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola informasi nama usaha, susunan pengurus, profil perusahaan, dan daftar unit usaha.</p>
                    </div>
                </div>
                <div class="w-10 h-10 rounded-none bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-950 flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>

            <!-- Tab Navigasi (Pengaturan Umum, Company Profile, & Input Unit) -->
            <div class="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 overflow-x-auto">
                <button id="tab-btn-pengaturan" onclick="switchTab('pengaturan')" class="py-3 px-4 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 transition cursor-pointer whitespace-nowrap">
                    Pengaturan Umum & Pengurus
                </button>
                <button id="tab-btn-profile" onclick="switchTab('profile')" class="py-3 px-4 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer whitespace-nowrap">
                    Company Profile
                </button>
                <button id="tab-btn-unit" onclick="switchTab('unit')" class="py-3 px-4 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer whitespace-nowrap">
                    Input Unit
                </button>
            </div>

            <!-- Konten Tab 1: Pengaturan Umum & Pengurus -->
            <div id="tab-content-pengaturan" class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <form id="form-pengaturan-perusahaan" class="space-y-5">
                    <div class="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informasi Umum</h2>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Usaha / Perusahaan</label>
                            <input type="text" id="setting-nama" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: BUMKal Srihardono">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor / Toko</label>
                            <textarea id="setting-alamat" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Masukkan alamat lengkap..."></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / Kontak</label>
                            <input type="text" id="setting-telepon" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: 081234567890">
                        </div>

                        <!-- Upload Icon (Maks 192px, Kompres Otomatis 1:1) & Upload Wallpaper -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Icon Aplikasi (Maks 192px, Kompres Otomatis 1:1)</label>
                                <input type="file" id="input-icon-file" accept="image/*" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                                <input type="hidden" id="input-icon-base64" value="">
                                <div id="icon-preview-container" class="mt-2 hidden">
                                    <p class="text-[11px] text-slate-400 mb-1">Pratinjau Icon (1:1 • 192px):</p>
                                    <img id="icon-preview-img" src="" alt="Pratinjau Icon" class="w-20 h-20 object-cover border border-slate-200 dark:border-slate-700 rounded-none bg-white dark:bg-slate-800">
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Wallpaper / Banner Latar (Kompres Otomatis)</label>
                                <input type="file" id="input-wallpaper-file" accept="image/*" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                                <input type="hidden" id="input-wallpaper-base64" value="">
                                <div id="wallpaper-preview-container" class="mt-2 hidden">
                                    <p class="text-[11px] text-slate-400 mb-1">Pratinjau Wallpaper:</p>
                                    <img id="wallpaper-preview-img" src="" alt="Pratinjau Wallpaper" class="h-20 w-full max-w-xs object-cover border border-slate-200 dark:border-slate-700 rounded-none bg-white dark:bg-slate-800">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Susunan Pengurus</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Direktur</label>
                                <input type="text" id="setting-direktur" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Nama Direktur">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sekretaris</label>
                                <input type="text" id="setting-sekretaris" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Nama Sekretaris">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bendahara</label>
                                <input type="text" id="setting-bendahara" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Nama Bendahara">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Penasehat</label>
                                <input type="text" id="setting-penasehat" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Nama Penasehat">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lurah</label>
                                <input type="text" id="setting-lurah" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Nama Lurah">
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <button type="submit" id="btn-simpan-pengaturan" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none transition flex items-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>

            <!-- Konten Tab 2: Company Profile -->
            <div id="tab-content-profile" class="hidden bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <form id="form-company-profile" class="space-y-5">
                    <div>
                        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Profil & Tentang Perusahaan</h2>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi / Visi Misi / Sejarah Perusahaan</label>
                        <textarea id="setting-company-desc" rows="6" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Tuliskan profil lengkap, sejarah, visi misi, atau informasi perusahaan di sini..."></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Resmi Perusahaan</label>
                        <input type="email" id="setting-company-email" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: info@bumkal.com">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website / Tautan Resmi</label>
                        <input type="text" id="setting-company-web" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: https://www.bumkalsrihardono.com">
                    </div>
                    <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <button type="submit" id="btn-simpan-profile" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none transition flex items-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Simpan Company Profile
                        </button>
                    </div>
                </form>
            </div>

            <!-- Konten Tab 3: Input Unit (Responsive Tabel Desktop & Card HP) -->
            <div id="tab-content-unit" class="hidden space-y-6">
                <!-- Form Tambah / Edit Unit -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 id="form-unit-title" class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Tambah Unit Usaha Baru</h2>
                    <form id="form-tambah-unit" class="space-y-4">
                        <input type="hidden" id="edit-unit-id" value="">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Unit</label>
                                <input type="text" id="input-kode-unit" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Misal: U01">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Unit Usaha</label>
                                <input type="text" id="input-nama-unit" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Misal: Unit Agrowisata">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Lokasi</label>
                                <input type="text" id="input-keterangan-unit" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Misal: Jl. Raya Pundong No. 1">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Alamat Map</label>
                                <input type="url" id="input-map-url" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="https://maps.google.com/...">
                            </div>
                        </div>

                        <!-- Upload Foto Unit dengan Kompresi Otomatis Maks 500px -->
                        <div class="space-y-1.5 pt-2">
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Foto Unit Usaha (Kompresi Otomatis Maks 500px)</label>
                            <input type="file" id="input-unit-image-file" accept="image/*" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                            <input type="hidden" id="input-unit-image-base64" value="">
                            <div id="unit-image-preview-container" class="mt-2 hidden">
                                <p class="text-[11px] text-slate-400 mb-1">Pratinjau Foto:</p>
                                <img id="unit-image-preview" src="" alt="Pratinjau" class="h-24 w-auto object-cover border border-slate-200 dark:border-slate-700">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 pt-1">
                            <input type="checkbox" id="input-is-default" class="rounded-none border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4">
                            <label for="input-is-default" class="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Jadikan sebagai Unit Default</label>
                        </div>
                        <div class="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-edit" onclick="cancelEditUnit()" class="hidden px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-none transition cursor-pointer">
                                Batal
                            </button>
                            <button type="submit" id="btn-simpan-unit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none transition cursor-pointer flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                <span id="btn-submit-text">Tambah Unit</span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Daftar Unit Usaha -->
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Unit Usaha Terdaftar</h2>
                        <button onclick="toggleSortUnit()" class="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer">
                            <span>Urutkan Kode Unit</span>
                            <svg id="sort-icon-btn" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- TAMPILAN TABEL (Desktop) -->
                    <div class="hidden md:block overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                                    <th class="p-3 w-12 text-center">No</th>
                                    <th class="p-3 w-16 text-center font-semibold">Foto</th>
                                    <th class="p-3 w-28 font-semibold cursor-pointer hover:text-indigo-600 select-none" onclick="toggleSortUnit()" title="Klik untuk mengurutkan berdasarkan Kode Unit">
                                        <div class="flex items-center gap-1.5">
                                            <span>Kode Unit</span>
                                            <svg id="sort-icon" class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                            </svg>
                                        </div>
                                    </th>
                                    <th class="p-3 font-semibold">Nama Unit Usaha</th>
                                    <th class="p-3 font-semibold">Keterangan / Lokasi</th>
                                    <th class="p-3 font-semibold">Map</th>
                                    <th class="p-3 w-28 font-semibold text-center">Status</th>
                                    <th class="p-3 w-40 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="unit-table-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                <tr><td colspan="8" class="p-4 text-center text-slate-400">Memuat daftar unit...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- TAMPILAN CARD (Mobile / HP) -->
                    <div id="unit-card-container" class="md:hidden space-y-3">
                        <!-- Data card dimuat dari Firestore -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

function compressSquareIcon(file, size = 192, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // Crop tengah 1:1 agar tidak gepeng
                const minSide = Math.min(img.width, img.height);
                const sx = Math.floor((img.width - minSide) / 2);
                const sy = Math.floor((img.height - minSide) / 2);

                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

                const usePng = file.type === 'image/png';
                resolve(canvas.toDataURL(usePng ? 'image/png' : 'image/jpeg', quality));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function compressMaxDimension(file, maxDim = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

export async function initManajemenPengaturanHandler() {
    const inputNama = document.getElementById('setting-nama');
    const inputAlamat = document.getElementById('setting-alamat');
    const inputTelepon = document.getElementById('setting-telepon');
    const inputDirektur = document.getElementById('setting-direktur');
    const inputSekretaris = document.getElementById('setting-sekretaris');
    const inputBendahara = document.getElementById('setting-bendahara');
    const inputPenasehat = document.getElementById('setting-penasehat');
    const inputLurah = document.getElementById('setting-lurah');

    const inputIconFile = document.getElementById('input-icon-file');
    const inputIconBase64 = document.getElementById('input-icon-base64');
    const iconPreviewContainer = document.getElementById('icon-preview-container');
    const iconPreviewImg = document.getElementById('icon-preview-img');

    const inputWallpaperFile = document.getElementById('input-wallpaper-file');
    const inputWallpaperBase64 = document.getElementById('input-wallpaper-base64');
    const wallpaperPreviewContainer = document.getElementById('wallpaper-preview-container');
    const wallpaperPreviewImg = document.getElementById('wallpaper-preview-img');
    
    const inputCompanyDesc = document.getElementById('setting-company-desc');
    const inputCompanyEmail = document.getElementById('setting-company-email');
    const inputCompanyWeb = document.getElementById('setting-company-web');

    const form = document.getElementById('form-pengaturan-perusahaan');
    const formProfile = document.getElementById('form-company-profile');
    const formUnit = document.getElementById('form-tambah-unit');
    const btnSimpan = document.getElementById('btn-simpan-pengaturan');
    const btnSimpanDefaultHtml = btnSimpan ? btnSimpan.innerHTML : "";
    const btnSimpanProfile = document.getElementById('btn-simpan-profile');
    const toastNotif = document.getElementById('toast-notif');
    const unitTableBody = document.getElementById('unit-table-body');
    const unitCardContainer = document.getElementById('unit-card-container');

    const inputFile = document.getElementById('input-unit-image-file');
    const inputBase64 = document.getElementById('input-unit-image-base64');
    const imgPreview = document.getElementById('unit-image-preview');
    const previewContainer = document.getElementById('unit-image-preview-container');

    let globalUnitsList = [];
    let sortDirection = 'asc';

    // Handler Upload Icon Maks 192px (1:1)
    if (inputIconFile) {
        inputIconFile.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const compressedIcon = await compressSquareIcon(file, 192, 0.85);
                if (inputIconBase64) inputIconBase64.value = compressedIcon;
                if (iconPreviewImg) iconPreviewImg.src = compressedIcon;
                if (iconPreviewContainer) iconPreviewContainer.classList.remove('hidden');
            } catch (err) {
                console.error("Gagal memproses icon:", err);
                showToast("Gagal memproses gambar icon.");
            }
        });
    }

    // Handler Upload Wallpaper
    if (inputWallpaperFile) {
        inputWallpaperFile.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const compressedWallpaper = await compressMaxDimension(file, 1280, 0.82);
                if (inputWallpaperBase64) inputWallpaperBase64.value = compressedWallpaper;
                if (wallpaperPreviewImg) wallpaperPreviewImg.src = compressedWallpaper;
                if (wallpaperPreviewContainer) wallpaperPreviewContainer.classList.remove('hidden');
            } catch (err) {
                console.error("Gagal memproses wallpaper:", err);
                showToast("Gagal memproses gambar wallpaper.");
            }
        });
    }

    // Handler Kompresi Gambar Unit Otomatis Maks 500px
    if (inputFile) {
        inputFile.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const compressedBase64 = await compressMaxDimension(file, 500, 0.85);
                if (inputBase64) inputBase64.value = compressedBase64;
                if (imgPreview) imgPreview.src = compressedBase64;
                if (previewContainer) previewContainer.classList.remove('hidden');
            } catch (err) {
                console.error("Gagal memproses foto unit:", err);
                showToast("Gagal memproses foto unit.");
            }
        });
    }

    window.switchTab = function(tabName) {
        const tabBtnPengaturan = document.getElementById('tab-btn-pengaturan');
        const tabBtnProfile = document.getElementById('tab-btn-profile');
        const tabBtnUnit = document.getElementById('tab-btn-unit');
        
        const tabContentPengaturan = document.getElementById('tab-content-pengaturan');
        const tabContentProfile = document.getElementById('tab-content-profile');
        const tabContentUnit = document.getElementById('tab-content-unit');

        tabBtnPengaturan.className = "py-3 px-4 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer whitespace-nowrap";
        tabBtnProfile.className = "py-3 px-4 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer whitespace-nowrap";
        tabBtnUnit.className = "py-3 px-4 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer whitespace-nowrap";

        tabContentPengaturan.classList.add('hidden');
        tabContentProfile.classList.add('hidden');
        tabContentUnit.classList.add('hidden');

        if (tabName === 'pengaturan') {
            tabBtnPengaturan.className = "py-3 px-4 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 transition cursor-pointer whitespace-nowrap";
            tabContentPengaturan.classList.remove('hidden');
        } else if (tabName === 'profile') {
            tabBtnProfile.className = "py-3 px-4 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 transition cursor-pointer whitespace-nowrap";
            tabContentProfile.classList.remove('hidden');
        } else if (tabName === 'unit') {
            tabBtnUnit.className = "py-3 px-4 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 transition cursor-pointer whitespace-nowrap";
            tabContentUnit.classList.remove('hidden');
            fetchUnitList();
        }
    };

    function showToast(message) {
        if (!toastNotif) return;
        const msgEl = document.getElementById('toast-message');
        if (msgEl) msgEl.textContent = message;

        toastNotif.classList.remove('translate-y-[-20px]', 'opacity-0');
        toastNotif.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toastNotif.classList.remove('translate-y-0', 'opacity-100');
            toastNotif.classList.add('translate-y-[-20px]', 'opacity-0');
        }, 3000);
    }

    try {
        const docRef = doc(db, "pengaturan", "profil_perusahaan");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (inputNama) inputNama.value = data.nama || "";
            if (inputAlamat) inputAlamat.value = data.alamat || "";
            if (inputTelepon) inputTelepon.value = data.telepon || "";
            if (inputDirektur) inputDirektur.value = data.direktur || "";
            if (inputSekretaris) inputSekretaris.value = data.sekretaris || "";
            if (inputBendahara) inputBendahara.value = data.bendahara || "";
            if (inputPenasehat) inputPenasehat.value = data.penasehat || "";
            if (inputLurah) inputLurah.value = data.lurah || "";

            const savedIcon = data.iconUrl || data.logo || "";
            if (savedIcon) {
                if (inputIconBase64) inputIconBase64.value = savedIcon;
                if (iconPreviewImg) iconPreviewImg.src = savedIcon;
                if (iconPreviewContainer) iconPreviewContainer.classList.remove('hidden');
            }

            const savedWallpaper = data.wallpaperUrl || data.wallpaper || "";
            if (savedWallpaper) {
                if (inputWallpaperBase64) inputWallpaperBase64.value = savedWallpaper;
                if (wallpaperPreviewImg) wallpaperPreviewImg.src = savedWallpaper;
                if (wallpaperPreviewContainer) wallpaperPreviewContainer.classList.remove('hidden');
            }
            
            if (inputCompanyDesc) inputCompanyDesc.value = data.companyDesc || "";
            if (inputCompanyEmail) inputCompanyEmail.value = data.companyEmail || "";
            if (inputCompanyWeb) inputCompanyWeb.value = data.companyWeb || "";
        }
    } catch (err) {
        console.error("Gagal memuat pengaturan perusahaan:", err);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (btnSimpan) {
                btnSimpan.textContent = "Menyimpan...";
                btnSimpan.disabled = true;
            }

            const iconVal = inputIconBase64 ? inputIconBase64.value : "";
            const wallpaperVal = inputWallpaperBase64 ? inputWallpaperBase64.value : "";

            const payload = {
                nama: inputNama ? inputNama.value.trim() : "",
                alamat: inputAlamat ? inputAlamat.value.trim() : "",
                telepon: inputTelepon ? inputTelepon.value.trim() : "",
                direktur: inputDirektur ? inputDirektur.value.trim() : "",
                sekretaris: inputSekretaris ? inputSekretaris.value.trim() : "",
                bendahara: inputBendahara ? inputBendahara.value.trim() : "",
                penasehat: inputPenasehat ? inputPenasehat.value.trim() : "",
                lurah: inputLurah ? inputLurah.value.trim() : "",
                iconUrl: iconVal,
                wallpaperUrl: wallpaperVal,
                updatedAt: new Date().toISOString()
            };

            try {
                const docRef = doc(db, "pengaturan", "profil_perusahaan");
                await setDoc(docRef, payload, { merge: true });

                if (typeof window.reloadCompanyProfile === 'function') {
                    await window.reloadCompanyProfile();
                }

                showToast("Pengaturan perusahaan, icon, wallpaper & pengurus berhasil disimpan!");
            } catch (err) {
                console.error("Gagal menyimpan pengaturan:", err);
                showToast("Terjadi kesalahan saat menyimpan data.");
            } finally {
                if (btnSimpan) {
                    btnSimpan.innerHTML = btnSimpanDefaultHtml;
                    btnSimpan.disabled = false;
                }
            }
        });
    }

    if (formProfile) {
        formProfile.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (btnSimpanProfile) {
                btnSimpanProfile.textContent = "Menyimpan...";
                btnSimpanProfile.disabled = true;
            }

            const profilePayload = {
                companyDesc: inputCompanyDesc ? inputCompanyDesc.value.trim() : "",
                companyEmail: inputCompanyEmail ? inputCompanyEmail.value.trim() : "",
                companyWeb: inputCompanyWeb ? inputCompanyWeb.value.trim() : "",
                updatedAt: new Date().toISOString()
            };

            try {
                const docRef = doc(db, "pengaturan", "profil_perusahaan");
                await setDoc(docRef, profilePayload, { merge: true });
                if (typeof window.reloadCompanyProfile === 'function') {
                    await window.reloadCompanyProfile();
                }
                showToast("Company Profile berhasil disimpan!");
            } catch (err) {
                console.error("Gagal menyimpan Company Profile:", err);
                showToast("Terjadi kesalahan saat menyimpan Company Profile.");
            } finally {
                if (btnSimpanProfile) {
                    btnSimpanProfile.textContent = "Simpan Company Profile";
                    btnSimpanProfile.disabled = false;
                }
            }
        });
    }

    async function fetchUnitList() {
        if (!unitTableBody || !unitCardContainer) return;
        try {
            const querySnapshot = await getDocs(collection(db, "unit_usaha"));
            globalUnitsList = [];
            querySnapshot.forEach((docSnap) => {
                globalUnitsList.push({ id: docSnap.id, ...docSnap.data() });
            });

            renderUnitTableAndCards();
        } catch (err) {
            console.error("Gagal memuat daftar unit:", err);
            unitTableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-500">Gagal memuat data unit.</td></tr>`;
            unitCardContainer.innerHTML = `<div class="p-4 text-center text-red-500 text-xs">Gagal memuat data unit.</div>`;
        }
    }

    // Render Tabel (Desktop) & Card (Mobile)
    function renderUnitTableAndCards() {
        if (!unitTableBody || !unitCardContainer) return;
        unitTableBody.innerHTML = '';
        unitCardContainer.innerHTML = '';

        if (globalUnitsList.length === 0) {
            unitTableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400">Belum ada unit usaha terdaftar.</td></tr>`;
            unitCardContainer.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">Belum ada unit usaha terdaftar.</div>`;
            return;
        }

        const sortedUnits = [...globalUnitsList].sort((a, b) => {
            const codeA = (a.kodeUnit || '').toString().toLowerCase();
            const codeB = (b.kodeUnit || '').toString().toLowerCase();
            if (sortDirection === 'asc') {
                return codeA.localeCompare(codeB, undefined, { numeric: true });
            } else {
                return codeB.localeCompare(codeA, undefined, { numeric: true });
            }
        });

        let index = 1;
        sortedUnits.forEach((unit) => {
            const isDefault = unit.isDefault === true;
            const statusBadge = isDefault 
                ? `<span class="inline-block bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase">Default</span>`
                : `<span class="inline-block bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-none uppercase">Tidak</span>`;

            const defaultActionBtn = !isDefault
                ? `<button onclick="setAsDefaultUnit('${unit.id}')" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-semibold border border-indigo-200 transition cursor-pointer">Set Default</button>`
                : `<span class="text-[11px] text-slate-400 italic">Aktif Default</span>`;

            const imageHtml = unit.image 
                ? `<img src="${unit.image}" alt="Foto Unit" class="w-10 h-10 object-cover border border-slate-200 dark:border-slate-700">`
                : `<span class="text-[10px] text-slate-400 italic">Tanpa Foto</span>`;

            const mapHtml = unit.mapUrl 
                ? `<a href="${unit.mapUrl}" target="_blank" class="text-indigo-600 dark:text-indigo-400 underline text-[11px]">Buka Map</a>`
                : `<span class="text-slate-400 text-[11px]">-</span>`;

            // 1. Desktop Table Row
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition";
            tr.innerHTML = `
                <td class="p-3 text-center">${index}</td>
                <td class="p-3 text-center">${imageHtml}</td>
                <td class="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">${unit.kodeUnit || '-'}</td>
                <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">${unit.namaUnit}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${unit.keterangan || '-'}</td>
                <td class="p-3">${mapHtml}</td>
                <td class="p-3 text-center">${statusBadge}</td>
                <td class="p-3 text-center flex items-center justify-center gap-1.5 flex-wrap">
                    ${defaultActionBtn}
                    <button onclick="editUnit('${unit.id}', '${unit.kodeUnit || ''}', '${unit.namaUnit || ''}', '${unit.keterangan || ''}', '${unit.mapUrl || ''}', '${unit.image || ''}', ${isDefault})" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[11px] font-semibold border border-amber-200 transition cursor-pointer">
                        Edit
                    </button>
                    <button onclick="deleteUnit('${unit.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold border border-rose-200 transition cursor-pointer">
                        Hapus
                    </button>
                </td>
            `;
            unitTableBody.appendChild(tr);

            // 2. Mobile Card View
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 text-xs";
            card.innerHTML = `
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-slate-400 font-medium">#${index}</span>
                        <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 border border-indigo-100 dark:border-indigo-900">${unit.kodeUnit || '-'}</span>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">${imageHtml}</div>
                    <div class="space-y-1 flex-1">
                        <p class="font-bold text-slate-800 dark:text-slate-100 text-sm">${unit.namaUnit}</p>
                        <p class="text-slate-500 dark:text-slate-400"><strong class="font-medium text-slate-700 dark:text-slate-300">Lokasi:</strong> ${unit.keterangan || '-'}</p>
                        <p class="text-slate-500 dark:text-slate-400"><strong class="font-medium text-slate-700 dark:text-slate-300">Map:</strong> ${mapHtml}</p>
                    </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    ${defaultActionBtn}
                    <button onclick="editUnit('${unit.id}', '${unit.kodeUnit || ''}', '${unit.namaUnit || ''}', '${unit.keterangan || ''}', '${unit.mapUrl || ''}', '${unit.image || ''}', ${isDefault})" class="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 font-semibold border border-amber-200 transition cursor-pointer">
                        Edit
                    </button>
                    <button onclick="deleteUnit('${unit.id}')" class="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold border border-rose-200 transition cursor-pointer">
                        Hapus
                    </button>
                </div>
            `;
            unitCardContainer.appendChild(card);

            index++;
        });
    }

    window.toggleSortUnit = function() {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        const sortIcon = document.getElementById('sort-icon');
        if (sortIcon) {
            sortIcon.style.transform = sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)';
        }
        renderUnitTableAndCards();
    };

    if (formUnit) {
        formUnit.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('edit-unit-id').value;
            const kodeUnit = document.getElementById('input-kode-unit').value.trim();
            const namaUnit = document.getElementById('input-nama-unit').value.trim();
            const keterangan = document.getElementById('input-keterangan-unit').value.trim();
            const mapUrl = document.getElementById('input-map-url').value.trim();
            const imageBase64 = document.getElementById('input-unit-image-base64').value;
            const isDefault = document.getElementById('input-is-default').checked;
            const btnSimpanUnit = document.getElementById('btn-simpan-unit');

            if (!kodeUnit || !namaUnit) return;

            try {
                if (btnSimpanUnit) {
                    btnSimpanUnit.textContent = "Menyimpan...";
                    btnSimpanUnit.disabled = true;
                }

                if (isDefault) {
                    const querySnapshot = await getDocs(collection(db, "unit_usaha"));
                    for (const docSnap of querySnapshot.docs) {
                        if (docSnap.id !== editId) {
                            await updateDoc(doc(db, "unit_usaha", docSnap.id), { isDefault: false });
                        }
                    }
                }

                const unitPayload = {
                    kodeUnit: kodeUnit,
                    namaUnit: namaUnit,
                    keterangan: keterangan,
                    mapUrl: mapUrl,
                    isDefault: isDefault,
                    updatedAt: serverTimestamp()
                };

                if (imageBase64) {
                    unitPayload.image = imageBase64;
                }

                if (editId) {
                    await updateDoc(doc(db, "unit_usaha", editId), unitPayload);
                    showToast("Unit usaha berhasil diperbarui!");
                } else {
                    unitPayload.createdAt = serverTimestamp();
                    await addDoc(collection(db, "unit_usaha"), unitPayload);
                    showToast("Unit usaha berhasil ditambahkan!");
                }

                cancelEditUnit();
                
                // Menunggu proses pengambilan data terbaru dari Firestore selesai sebelum merender ulang tabel/card
                await fetchUnitList();
            } catch (err) {
                console.error("Gagal menyimpan unit:", err);
                showToast("Terjadi kesalahan saat menyimpan unit.");
            } finally {
                if (btnSimpanUnit) {
                    btnSimpanUnit.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg><span id="btn-submit-text">Tambah Unit</span>`;
                    btnSimpanUnit.disabled = false;
                }
            }
        });
    }

    window.editUnit = function(id, kode, nama, keterangan, mapUrl, imageUrl, isDefault) {
        document.getElementById('edit-unit-id').value = id;
        document.getElementById('input-kode-unit').value = kode;
        document.getElementById('input-nama-unit').value = nama;
        document.getElementById('input-keterangan-unit').value = keterangan === '-' ? '' : keterangan;
        document.getElementById('input-map-url').value = mapUrl === 'undefined' ? '' : mapUrl;
        document.getElementById('input-is-default').checked = isDefault;

        if (imageUrl && imageUrl !== 'undefined') {
            document.getElementById('input-unit-image-base64').value = imageUrl;
            document.getElementById('unit-image-preview').src = imageUrl;
            document.getElementById('unit-image-preview-container').classList.remove('hidden');
        } else {
            document.getElementById('input-unit-image-base64').value = "";
            document.getElementById('unit-image-preview-container').classList.add('hidden');
        }

        document.getElementById('form-unit-title').textContent = "Edit Unit Usaha";
        document.getElementById('btn-submit-text').textContent = "Perbarui Unit";
        document.getElementById('btn-cancel-edit').classList.remove('hidden');

        formUnit.scrollIntoView({ behavior: 'smooth' });
    };

    window.cancelEditUnit = function() {
        document.getElementById('edit-unit-id').value = "";
        formUnit.reset();
        document.getElementById('input-unit-image-base64').value = "";
        document.getElementById('unit-image-preview-container').classList.add('hidden');
        document.getElementById('form-unit-title').textContent = "Tambah Unit Usaha Baru";
        document.getElementById('btn-submit-text').textContent = "Tambah Unit";
        document.getElementById('btn-cancel-edit').classList.add('hidden');
    };

    window.setAsDefaultUnit = async function(targetId) {
        try {
            const querySnapshot = await getDocs(collection(db, "unit_usaha"));
            for (const docSnap of querySnapshot.docs) {
                const isTarget = docSnap.id === targetId;
                await updateDoc(doc(db, "unit_usaha", docSnap.id), {
                    isDefault: isTarget
                });
            }
            showToast("Unit default berhasil diperbarui!");
            await fetchUnitList();
        } catch (err) {
            console.error("Gagal mengubah unit default:", err);
            showToast("Gagal memperbarui status default.");
        }
    };

    window.deleteUnit = async function(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus unit usaha ini?")) return;
        try {
            await deleteDoc(doc(db, "unit_usaha", id));
            showToast("Unit usaha berhasil dihapus!");
            await fetchUnitList();
        } catch (err) {
            console.error("Gagal menghapus unit:", err);
            showToast("Gagal menghapus unit dari database.");
        }
    };
}