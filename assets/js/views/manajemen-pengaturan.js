// File: assets/js/views/manajemen-pengaturan.js
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderManajemenPengaturan() {
    return `
        <div class="space-y-6 pb-10 max-w-4xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengaturan Profil Perusahaan</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelola informasi nama usaha, alamat, dan nomor kontak yang tampil di header sistem.</p>
                </div>
                <div class="w-10 h-10 rounded-none bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>

            <!-- Form Pengaturan -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <form id="form-pengaturan-perusahaan" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Usaha / Perusahaan</label>
                        <input type="text" id="setting-nama" required class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: Sistem Akuntansi">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor / Toko</label>
                        <textarea id="setting-alamat" rows="2" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Masukkan alamat lengkap..."></textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon / Kontak</label>
                        <input type="text" id="setting-telepon" class="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-none focus:outline-none focus:border-indigo-600" placeholder="Contoh: 081234567890">
                    </div>

                    <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <button type="submit" id="btn-simpan-pengaturan" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export async function initManajemenPengaturanHandler() {
    const inputNama = document.getElementById('setting-nama');
    const inputAlamat = document.getElementById('setting-alamat');
    const inputTelepon = document.getElementById('setting-telepon');
    const form = document.getElementById('form-pengaturan-perusahaan');
    const btnSimpan = document.getElementById('btn-simpan-pengaturan');

    // 1. Ambil data saat ini dari Firestore
    try {
        const docRef = doc(db, "pengaturan", "profil_perusahaan");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (inputNama) inputNama.value = data.nama || "";
            if (inputAlamat) inputAlamat.value = data.alamat || "";
            if (inputTelepon) inputTelepon.value = data.telepon || "";
        }
    } catch (err) {
        console.error("Gagal memuat pengaturan perusahaan:", err);
    }

    // 2. Simpan data ke Firestore saat form disubmit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (btnSimpan) {
                btnSimpan.textContent = "Menyimpan...";
                btnSimpan.disabled = true;
            }

            const payload = {
                nama: inputNama ? inputNama.value.trim() : "",
                alamat: inputAlamat ? inputAlamat.value.trim() : "",
                telepon: inputTelepon ? inputTelepon.value.trim() : "",
                updatedAt: new Date().toISOString()
            };

            try {
                const docRef = doc(db, "pengaturan", "profil_perusahaan");
                await setDoc(docRef, payload, { merge: true });

                localStorage.setItem('company_name', payload.nama);
                localStorage.setItem('company_info', `${payload.alamat} | Telp: ${payload.telepon}`);

                const headerNameEl = document.getElementById('header-company-name');
                const headerInfoEl = document.getElementById('header-company-info');
                if (headerNameEl) headerNameEl.textContent = payload.nama;
                if (headerInfoEl) headerInfoEl.textContent = `${payload.alamat} | Telp: ${payload.telepon}`;

                alert("Pengaturan perusahaan berhasil disimpan!");
            } catch (err) {
                console.error("Gagal menyimpan pengaturan:", err);
                alert("Terjadi kesalahan saat menyimpan data.");
            } finally {
                if (btnSimpan) {
                    btnSimpan.textContent = "Simpan Perubahan";
                    btnSimpan.disabled = false;
                }
            }
        });
    }
}