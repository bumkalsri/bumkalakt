// File: assets/js/views/manajemen-text.js
import { db } from "../firebase-init.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function renderManajemenText() {
    return `
        <div class="space-y-6 pb-12 max-w-5xl mx-auto animate-fade-in text-slate-800 dark:text-slate-100">
            
            <!-- Header Judul -->
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 class="text-lg font-bold">Running Text</h1>
                </div>
            </div>

            <!-- Panel Pengaturan Utama -->
            <div class="bg-white dark:bg-slate-900 p-5 rounded-none border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 class="text-sm font-bold">Aktif</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Tampilkan running text di beranda</p>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">Kecepatan</span>
                            <select id="running-text-speed" class="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs rounded-none px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="slow">Lambat</option>
                                <option value="normal" selected>Normal</option>
                                <option value="fast">Cepat</option>
                            </select>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="global-active-switch" class="sr-only peer" checked>
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-900"></div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Template Cepat -->
            <div class="space-y-2">
                <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TEMPLATE CEPAT — KLIK UNTUK TAMBAHKAN</p>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800 transition shadow-2xs" data-text="Selamat datang di BUMKal Srihardono! Nikmati berbagai layanan dan informasi terbaru kami.">
                        🛒 Selamat Datang
                    </button>
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs" data-text="Anggota dan warga mendapatkan prioritas layanan administrasi dan pelaporan terbaik!">
                        💖 Promo Member
                    </button>
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs" data-text="Informasi penting hari ini: Pastikan selalu memantau laporan keuangan unit usaha melalui dashboard.">
                        ⚡ Diskon Hari Ini
                    </button>
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs" data-text="Kami buka setiap hari pukul 08.00 - 16.00 WIB. Terima kasih atas partisipasi Anda!">
                        🕒 Jam Operasional
                    </button>
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs" data-text="Rekapitulasi laporan bulanan unit usaha telah diperbarui. Silakan cek menu Laporan.">
                        🌟 Promo Akhir Pekan
                    </button>
                </div>
            </div>

            <!-- Daftar Teks Berjalan -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 id="daftar-teks-title" class="text-xs font-bold uppercase tracking-wider text-slate-500">DAFTAR TEKS (0)</h3>
                    <button id="btn-open-add-modal" class="inline-flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-medium px-3 py-1.5 rounded-none transition">
                        + Tambah Teks
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <th class="py-3 px-4 font-semibold w-12 text-center">No</th>
                                <th class="py-3 px-4 font-semibold">Teks Berjalan</th>
                                <th class="py-3 px-4 font-semibold w-24 text-center">Status</th>
                                <th class="py-3 px-4 font-semibold w-16 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="running-text-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
                            <tr>
                                <td colspan="4" class="py-6 text-center text-slate-400">Memuat data teks...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        <!-- MODAL TAMBAH / EDIT TEKS -->
        <div id="text-modal" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex items-center justify-center p-4 backdrop-blur-xs">
            <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-none border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
                <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <h3 id="modal-title" class="text-sm font-bold">Tambah Teks Baru</h3>
                    <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <form id="text-form" class="p-5 space-y-4">
                    <input type="hidden" id="edit-text-id">
                    <div class="space-y-1.5">
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Teks Berjalan</label>
                        <textarea id="input-teks-val" rows="4" required placeholder="Masukkan teks yang akan berjalan di beranda..." class="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-none p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                    </div>
                    <div class="flex items-center gap-3 pt-2">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="input-teks-aktif" class="sr-only peer" checked>
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-900"></div>
                        </label>
                        <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Aktif</span>
                    </div>
                    <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" id="btn-cancel-modal" class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-none transition">Batal</button>
                        <button type="submit" class="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-medium rounded-none transition shadow-xs">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function initManajemenTextHandler() {
    const tableBody = document.getElementById('running-text-table-body');
    const daftarTitle = document.getElementById('daftar-teks-title');
    const modal = document.getElementById('text-modal');
    const form = document.getElementById('text-form');
    const modalTitle = document.getElementById('modal-title');
    const inputTeksVal = document.getElementById('input-teks-val');
    const inputTeksAktif = document.getElementById('input-teks-aktif');
    const editIdField = document.getElementById('edit-text-id');

    const globalSwitch = document.getElementById('global-active-switch');
    const speedSelect = document.getElementById('running-text-speed');

    let textList = [];

    // Fungsi muat data dari Firestore koleksi 'running_text' & pengaturan 'pengaturan/running_text_config'
    async function loadData() {
        try {
            // Muat konfigurasi global
            const configDoc = await getDocs(collection(db, 'pengaturan'));
            // Atau doc khusus pengaturan teks
            // Kita bisa simpan setting di doc pengaturan/running_text
            // Untuk amannya, kita baca dokumen koleksi 'pengaturan' id 'running_text' jika ada
        } catch (e) {
            console.log("Konfigurasi belum ada");
        }

        try {
            const querySnapshot = await getDocs(collection(db, 'running_text'));
            textList = [];
            querySnapshot.forEach((docSnap) => {
                textList.push({ id: docSnap.id, ...docSnap.data() });
            });

            renderTable();
        } catch (error) {
            console.error("Gagal memuat running text:", error);
            tableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        if (daftarTitle) daftarTitle.textContent = `DAFTAR TEKS (${textList.length})`;
        
        if (textList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400">Belum ada teks berjalan. Klik "+ Tambah Teks" untuk membuat baru.</td></tr>`;
            return;
        }

        tableBody.innerHTML = textList.map((item, index) => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-4 text-center font-medium text-slate-500">${index + 1}</td>
                <td class="py-3 px-4 ${item.aktif ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 line-through'}">${escapeHtml(item.teks)}</td>
                <td class="py-3 px-4 text-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer toggle-status-item" data-id="${item.id}" ${item.aktif ? 'checked' : ''}>
                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-900"></div>
                    </label>
                </td>
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button type="button" class="btn-edit-item p-1 text-slate-400 hover:text-indigo-600 transition" data-id="${item.id}" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button type="button" class="btn-delete-item p-1 text-slate-400 hover:text-red-600 transition" data-id="${item.id}" title="Hapus">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Listener Ubah Status per Baris
        document.querySelectorAll('.toggle-status-item').forEach(chk => {
            chk.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const aktif = e.target.checked;
                try {
                    await updateDoc(doc(db, 'running_text', id), { aktif });
                    const target = textList.find(x => x.id === id);
                    if (target) target.aktif = aktif;
                    renderTable();
                } catch (err) {
                    console.error("Gagal mengubah status:", err);
                    alert("Gagal memperbarui status.");
                }
            });
        });

        // Listener Tombol Edit
        document.querySelectorAll('.btn-edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = textList.find(x => x.id === id);
                if (item) {
                    editIdField.value = item.id;
                    inputTeksVal.value = item.teks;
                    inputTeksAktif.checked = item.aktif;
                    modalTitle.textContent = "Edit Teks Berjalan";
                    modal.classList.remove('hidden');
                }
            });
        });

        // Listener Tombol Hapus
        document.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm("Apakah Anda yakin ingin menghapus teks berjalan ini?")) {
                    try {
                        await deleteDoc(doc(db, 'running_text', id));
                        textList = textList.filter(x => x.id !== id);
                        renderTable();
                    } catch (err) {
                        console.error("Gagal menghapus:", err);
                        alert("Gagal menghapus data.");
                    }
                }
            });
        });
    }

    // Modal Control
    document.getElementById('btn-open-add-modal').addEventListener('click', () => {
        editIdField.value = '';
        inputTeksVal.value = '';
        inputTeksAktif.checked = true;
        modalTitle.textContent = "Tambah Teks Baru";
        modal.classList.remove('hidden');
    });

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

    // Template Cepat Click
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const templateText = btn.getAttribute('data-text');
            try {
                await addDoc(collection(db, 'running_text'), {
                    teks: templateText,
                    aktif: true,
                    createdAt: new Date().toISOString()
                });
                loadData();
            } catch (err) {
                console.error("Gagal menambahkan template:", err);
            }
        });
    });

    // Submit Form Tambah / Edit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editIdField.value;
        const teks = inputTeksVal.value.trim();
        const aktif = inputTeksAktif.checked;

        if (!teks) return;

        try {
            if (id) {
                await updateDoc(doc(db, 'running_text', id), { teks, aktif });
            } else {
                await addDoc(collection(db, 'running_text'), {
                    teks,
                    aktif,
                    createdAt: new Date().toISOString()
                });
            }
            closeModal();
            loadData();
        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            alert("Gagal menyimpan data ke database.");
        }
    });

    loadData();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}