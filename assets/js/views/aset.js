import { getDocs, collection, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderAset() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2">
                        <a href="#/data" data-link class="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-semibold">&larr; Kembali ke Data</a>
                    </div>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">Manajemen Aset & Inventaris</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="aset-info-count">Memuat jumlah aset...</p>
                </div>
                <button id="btn-open-add-aset" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 self-start sm:self-auto rounded-none cursor-pointer shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Tambah Aset Baru
                </button>
            </div>

            <!-- TABEL / CONTAINER ASET -->
            <div id="aset-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Memuat data aset...</div>
            </div>

            <!-- MODAL TAMBAH ASET -->
            <div id="modal-tambah-aset" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Aset</h3>
                        <button id="btn-close-modal-aset" class="text-slate-400 hover:text-slate-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-aset" class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Aset / Barang</label>
                            <input type="text" id="aset-nama" required class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none" placeholder="Contoh: Laptop Kantor Core i5">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kondisi</label>
                            <select id="aset-kondisi" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none">
                                <option value="Baik">Baik</option>
                                <option value="Kurang Baik">Kurang Baik</option>
                                <option value="Rusak Berat">Rusak Berat</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah</label>
                                <input type="number" id="aset-jumlah" min="1" value="1" required class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Perolehan</label>
                                <input type="number" id="aset-tahun" value="2026" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi / Penanggung Jawab</label>
                            <input type="text" id="aset-lokasi" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none rounded-none" placeholder="Contoh: Ruang Kantor Utama">
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-cancel-modal-aset" class="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-none cursor-pointer">Batal</button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-none cursor-pointer">Simpan Aset</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export async function initAsetHandler() {
    const container = document.getElementById('aset-container');
    const infoCountEl = document.getElementById('aset-info-count');
    const modal = document.getElementById('modal-tambah-aset');
    const btnOpen = document.getElementById('btn-open-add-aset');
    const btnClose = document.getElementById('btn-close-modal-aset');
    const btnCancel = document.getElementById('btn-cancel-modal-aset');
    const form = document.getElementById('form-tambah-aset');

    if (btnOpen && modal) btnOpen.onclick = () => modal.classList.remove('hidden');
    if (btnClose && modal) btnClose.onclick = () => modal.classList.add('hidden');
    if (btnCancel && modal) btnCancel.onclick = () => modal.classList.add('hidden');

    const loadAset = async () => {
        if (!container) return;
        try {
            const querySnapshot = await getDocs(collection(db, "aset"));
            let list = [];
            querySnapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (infoCountEl) infoCountEl.textContent = `Total: ${list.length} Item aset terdaftar.`;

            if (list.length === 0) {
                container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Belum ada data aset.</div>`;
                return;
            }

            let html = `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs rounded-none">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                    <th class="p-3.5 w-12 text-center">No</th>
                                    <th class="p-3.5">Nama Aset</th>
                                    <th class="p-3.5">Kondisi</th>
                                    <th class="p-3.5 text-center">Jumlah</th>
                                    <th class="p-3.5 text-center">Tahun</th>
                                    <th class="p-3.5">Lokasi</th>
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
                        <td class="p-3.5"><span class="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">${item.kondisi || 'Baik'}</span></td>
                        <td class="p-3.5 text-center font-medium">${item.jumlah || 1}</td>
                        <td class="p-3.5 text-center">${item.tahun || '-'}</td>
                        <td class="p-3.5 text-slate-500">${item.lokasi || '-'}</td>
                        <td class="p-3.5 text-center">
                            <button onclick="window.deleteAset('${item.id}')" class="px-3 py-1 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML = html;
        } catch (err) {
            console.error("Gagal memuat aset:", err);
            container.innerHTML = `<div class="p-6 text-center text-red-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Gagal memuat data dari database.</div>`;
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nama = document.getElementById('aset-nama').value;
            const kondisi = document.getElementById('aset-kondisi').value;
            const jumlah = parseInt(document.getElementById('aset-jumlah').value) || 1;
            const tahun = document.getElementById('aset-tahun').value;
            const lokasi = document.getElementById('aset-lokasi').value;

            try {
                await addDoc(collection(db, "aset"), {
                    nama, kondisi, jumlah, tahun, lokasi, createdAt: serverTimestamp()
                });
                alert("Aset berhasil ditambahkan!");
                form.reset();
                modal.classList.add('hidden');
                loadAset();
            } catch (error) {
                console.error("Gagal menambah aset:", error);
                alert("Terjadi kesalahan saat menyimpan aset.");
            }
        };
    }

    window.deleteAset = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;
        try {
            await deleteDoc(doc(db, "aset", id));
            alert("Aset berhasil dihapus!");
            loadAset();
        } catch (err) {
            console.error("Gagal menghapus aset:", err);
            alert("Gagal menghapus aset.");
        }
    };

    loadAset();
}