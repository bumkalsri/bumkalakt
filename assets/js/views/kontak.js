import { getDocs, collection, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderKontak() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <a href="#/data" data-link class="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold">&larr; Kembali ke Data</a>
                    </div>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">Manajemen Kontak</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="kontak-info-count">Memuat jumlah kontak...</p>
                </div>
                <button id="btn-open-add-kontak" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 self-start sm:self-auto rounded-none cursor-pointer shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Tambah Kontak Baru
                </button>
            </div>

            <!-- TABEL / CONTAINER KONTAK -->
            <div id="kontak-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Memuat data kontak...</div>
            </div>

            <!-- MODAL TAMBAH KONTAK -->
            <div id="modal-tambah-kontak" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Kontak</h3>
                        <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-kontak" class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap / Instansi</label>
                            <input type="text" id="kontak-nama" required class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none" placeholder="Contoh: PT Maju Jaya">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                            <select id="kontak-kategori" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none">
                                <option value="Pelanggan">Pelanggan</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Mitra">Mitra</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                            <input type="text" id="kontak-telepon" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none" placeholder="Contoh: 081234567890">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                            <textarea id="kontak-alamat" rows="2" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none" placeholder="Alamat lengkap..."></textarea>
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-modal" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-none cursor-pointer">Batal</button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-none cursor-pointer">Simpan Kontak</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export async function initKontakHandler() {
    const container = document.getElementById('kontak-container');
    const infoCountEl = document.getElementById('kontak-info-count');
    const modal = document.getElementById('modal-tambah-kontak');
    const btnOpen = document.getElementById('btn-open-add-kontak');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const form = document.getElementById('form-tambah-kontak');

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
                container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Belum ada data kontak.</div>`;
                return;
            }

            let html = `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs rounded-none">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
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
                            <button onclick="window.deleteKontak('${item.id}')" class="px-3 py-1 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error("Gagal memuat kontak:", err);
            container.innerHTML = `<div class="p-6 text-center text-red-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Gagal memuat data dari database.</div>`;
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nama = document.getElementById('kontak-nama').value;
            const kategori = document.getElementById('kontak-kategori').value;
            const telepon = document.getElementById('kontak-telepon').value;
            const alamat = document.getElementById('kontak-alamat').value;

            try {
                await addDoc(collection(db, "kontak"), {
                    nama, kategori, telepon, alamat, createdAt: serverTimestamp()
                });
                alert("Kontak berhasil ditambahkan!");
                form.reset();
                modal.classList.add('hidden');
                loadKontak();
            } catch (error) {
                console.error("Gagal menambah kontak:", error);
                alert("Terjadi kesalahan saat menyimpan kontak.");
            }
        };
    }

    window.deleteKontak = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) return;
        try {
            await deleteDoc(doc(db, "kontak", id));
            alert("Kontak berhasil dihapus!");
            loadKontak();
        } catch (err) {
            console.error("Gagal menghapus kontak:", err);
            alert("Gagal menghapus kontak.");
        }
    };

    loadKontak();
}