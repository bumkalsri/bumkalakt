// File: assets/js/views/data-aset.js
import { getDocs, collection, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderAset() {
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Aset & Inventaris</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="aset-info-count">Memuat jumlah aset...</p>
                    </div>
                </div>
                <button type="button" id="btn-open-add-aset" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 self-start sm:self-auto rounded-none cursor-pointer shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    Tambah Aset Baru
                </button>
            </div>

            <!-- TABEL / CONTAINER ASET -->
            <div id="aset-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Memuat data aset...</div>
            </div>

            <!-- MODAL TAMBAH ASET -->
            <div id="modal-tambah-aset" class="hidden fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 shadow-2xl rounded-none">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Form Tambah Aset</h3>
                        <button type="button" id="btn-close-modal-aset" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-tambah-aset" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Aset / Barang *</label>
                            <input type="text" id="aset-nama" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: Laptop Kantor Core i5">
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kondisi</label>
                            <select id="aset-kondisi" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                                <option value="Baik">Baik</option>
                                <option value="Kurang Baik">Kurang Baik</option>
                                <option value="Rusak Berat">Rusak Berat</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah *</label>
                                <input type="number" id="aset-jumlah" min="1" value="1" required class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun Perolehan</label>
                                <input type="number" id="aset-tahun" value="2026" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none">
                            </div>
                        </div>
                        <div>
                            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi / Penanggung Jawab</label>
                            <input type="text" id="aset-lokasi" class="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600 rounded-none" placeholder="Contoh: Ruang Kantor Utama">
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

export async function initAsetHandler() {
    const container = document.getElementById('aset-container');
    const infoCountEl = document.getElementById('aset-info-count');
    const modal = document.getElementById('modal-tambah-aset');
    const btnOpen = document.getElementById('btn-open-add-aset');
    const btnClose = document.getElementById('btn-close-modal-aset');
    const btnCancel = document.getElementById('btn-cancel-modal-aset');
    const form = document.getElementById('form-tambah-aset');
    const btnSimpan = document.getElementById('btn-simpan-aset');

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
                container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Belum ada data aset.</div>`;
                return;
            }

            let html = `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-none">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
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
                            <button type="button" data-delete-aset="${item.id}" class="btn-hapus-aset px-3 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[11px] border border-rose-200 dark:border-rose-900 transition cursor-pointer rounded-none">
                                Hapus
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML = html;

            document.querySelectorAll('.btn-hapus-aset').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.getAttribute('data-delete-aset');
                    if (!id) return;
                    if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;
                    try {
                        await deleteDoc(doc(db, "aset", id));
                        showToast("Aset berhasil dihapus!");
                        await loadAset();
                    } catch (err) {
                        console.error("Gagal menghapus aset:", err);
                        showToast("Gagal menghapus aset.", true);
                    }
                };
            });
        } catch (err) {
            console.error("Gagal memuat aset:", err);
            container.innerHTML = `<div class="p-6 text-center text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs">Gagal memuat data dari database.</div>`;
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const namaEl = document.getElementById('aset-nama');
            const kondisiEl = document.getElementById('aset-kondisi');
            const jumlahEl = document.getElementById('aset-jumlah');
            const tahunEl = document.getElementById('aset-tahun');
            const lokasiEl = document.getElementById('aset-lokasi');

            const nama = namaEl ? namaEl.value.trim() : "";
            const kondisi = kondisiEl ? kondisiEl.value : "Baik";
            const jumlah = parseInt(jumlahEl ? jumlahEl.value : 1, 10) || 1;
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
                await addDoc(collection(db, "aset"), {
                    nama,
                    kondisi,
                    jumlah,
                    tahun,
                    lokasi,
                    createdAt: serverTimestamp()
                });
                showToast("Aset berhasil ditambahkan!");
                form.reset();
                if (jumlahEl) jumlahEl.value = "1";
                if (tahunEl) tahunEl.value = new Date().getFullYear().toString();
                if (modal) modal.classList.add('hidden');
                await loadAset();
            } catch (error) {
                console.error("Gagal menambah aset:", error);
                showToast("Terjadi kesalahan saat menyimpan aset.", true);
            } finally {
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = "Simpan Aset";
                }
            }
        };
    }

    await loadAset();
}