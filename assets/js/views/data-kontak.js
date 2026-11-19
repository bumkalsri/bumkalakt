// File: assets/js/views/data-kontak.js
import { getDocs, collection, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderKontak() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/data" data-link title="Kembali ke Data" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Kontak</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="kontak-info-count">Memuat jumlah kontak...</p>
                    </div>
                </div>
                <button type="button" id="btn-open-add-kontak" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 self-start sm:self-auto rounded-none cursor-pointer shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Tambah Kontak Baru
                </button>
            </div>

            <!-- TABEL / CONTAINER KONTAK -->
            <div id="kontak-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Memuat data kontak...</div>
            </div>

            <!-- MODAL TAMBAH KONTAK -->
            <div id="modal-tambah-kontak" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Kontak</h3>
                        <button type="button" id="btn-close-modal" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-kontak" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap / Instansi *</label>
                            <input type="text" id="kontak-nama" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: PT Maju Jaya">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                            <select id="kontak-kategori" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                                <option value="Pelanggan">Pelanggan</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Mitra">Mitra</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                            <input type="text" id="kontak-telepon" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: 081234567890">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
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

export async function initKontakHandler() {
    const container = document.getElementById('kontak-container');
    const infoCountEl = document.getElementById('kontak-info-count');
    const modal = document.getElementById('modal-tambah-kontak');
    const btnOpen = document.getElementById('btn-open-add-kontak');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('form-tambah-kontak');
    const btnSimpan = document.getElementById('btn-simpan-kontak');

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

    if (btnOpen && modal) btnOpen.onclick = () => modal.classList.remove('hidden');
    if (btnClose && modal) btnClose.onclick = () => modal.classList.add('hidden');
    if (btnCancel && modal) btnCancel.onclick = () => modal.classList.add('hidden');

    const loadKontak = async () => {
        if (!container) return;
        try {
            const querySnapshot = await getDocs(collection(db, "kontak"));
            let list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (infoCountEl) infoCountEl.textContent = `Total: ${list.length} Kontak terdaftar.`;

            if (list.length === 0) {
                container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Belum ada data kontak.</div>`;
                return;
            }

            let html = `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-none">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                    <th class="p-3.5 w-12 text-center">No</th>
                                    <th class="p-3.5">Nama / Instansi</th>
                                    <th class="p-3.5">Kategori</th>
                                    <th class="p-3.5">Telepon</th>
                                    <th class="p-3.5">Alamat</th>
                                    <th class="p-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            `;

            list.forEach((item, index) => {
                html += `
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td class="p-3.5 text-center text-slate-500 font-medium">${index + 1}</td>
                        <td class="p-3.5 font-semibold text-slate-800 dark:text-slate-100">${item.nama || '-'}</td>
                        <td class="p-3.5"><span class="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">${item.kategori || 'Umum'}</span></td>
                        <td class="p-3.5">${item.telepon || '-'}</td>
                        <td class="p-3.5 text-slate-500">${item.alamat || '-'}</td>
                        <td class="p-3.5 text-center">
                            <button type="button" data-delete-kontak="${item.id}" class="btn-hapus-kontak px-3 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML = html;

            document.querySelectorAll('.btn-hapus-kontak').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.getAttribute('data-delete-kontak');
                    if (!id) return;
                    if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) return;
                    try {
                        await deleteDoc(doc(db, "kontak", id));
                        showToast("Kontak berhasil dihapus!");
                        await loadKontak();
                    } catch (err) {
                        console.error("Gagal menghapus kontak:", err);
                        showToast("Gagal menghapus kontak.", true);
                    }
                };
            });
        } catch (err) {
            console.error("Gagal memuat kontak:", err);
            container.innerHTML = `<div class="p-6 text-center text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Gagal memuat data dari database.</div>`;
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
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
                await addDoc(collection(db, "kontak"), {
                    nama,
                    kategori,
                    telepon,
                    alamat,
                    createdAt: serverTimestamp()
                });
                showToast("Kontak berhasil ditambahkan!");
                form.reset();
                if (modal) modal.classList.add('hidden');
                await loadKontak();
            } catch (error) {
                console.error("Gagal menambah kontak:", error);
                showToast("Terjadi kesalahan saat menyimpan kontak.", true);
            } finally {
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = "Simpan Kontak";
                }
            }
        };
    }

    await loadKontak();
}