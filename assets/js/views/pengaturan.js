import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderPengaturan() {
    return `
        <div class="space-y-4 sm:space-y-6 max-w-4xl mx-auto relative px-2 sm:px-0 pb-10">
            <!-- Toast Notification Container -->
            <div id="toast-notification" class="hidden fixed top-5 right-5 z-50 transition-all duration-300 transform translate-y-[-1rem] opacity-0 max-w-xs w-full px-4">
                <div id="toast-content" class="px-4 py-3 shadow-lg border text-xs font-medium flex items-center gap-2 rounded-none">
                    <!-- Icon & Text injected dynamically -->
                </div>
            </div>

            <div>
                <h1 class="text-lg sm:text-xl font-bold text-slate-800">Pengaturan Profil Perusahaan</h1>
                <p class="text-xs text-slate-500 mt-0.5">Kelola informasi identitas perusahaan atau cabang Swalayan Maga yang akan dicetak pada laporan dan dokumen.</p>
            </div>

            <!-- Form Profil Perusahaan -->
            <div class="bg-white border border-slate-200 p-4 sm:p-6 shadow-xs rounded-none">
                <form id="form-pengaturan-perusahaan" class="space-y-4">
                    <input type="hidden" id="comp-logo-base64">
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan / Toko</label>
                            <input type="text" id="comp-name" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-indigo-600 transition" placeholder="Contoh: PT Swalayan Maga Utama">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                            <input type="text" id="comp-phone" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-indigo-600 transition" placeholder="Contoh: 081234567890">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                            <input type="email" id="comp-email" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-indigo-600 transition" placeholder="Contoh: info@swalayanmaga.com">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">NPWP Perusahaan</label>
                            <input type="text" id="comp-npwp" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-indigo-600 transition" placeholder="Contoh: 01.234.567.8-901.000">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                        <textarea id="comp-address" rows="3" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-none focus:outline-none focus:border-indigo-600 transition" placeholder="Masukkan alamat operasional lengkap cabang..."></textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Upload Logo Perusahaan (Maks. 192px)</label>
                            <input type="file" id="comp-logo-file" accept="image/*" class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-none focus:outline-none bg-white file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                            <p class="text-[10px] text-slate-400 mt-1">Otomatis diresize & dikompresi maksimal 192 piksel.</p>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Pratinjau Logo</label>
                            <div id="preview-logo-container" class="h-28 w-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                                <span class="text-xs text-slate-400 text-center px-2">Belum ada logo</span>
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                        <!-- Tombol Kembali ke Manajemen -->
                        <a href="#/manajemen" data-link class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition rounded-none flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            <span>Kembali ke Manajemen</span>
                        </a>

                        <button type="submit" id="btn-save-comp" class="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition rounded-none cursor-pointer flex items-center justify-center gap-2">
                            <span>Simpan Perubahan</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export async function initPengaturanHandler() {
    const form = document.getElementById('form-pengaturan-perusahaan');
    const nameInput = document.getElementById('comp-name');
    const phoneInput = document.getElementById('comp-phone');
    const emailInput = document.getElementById('comp-email');
    const npwpInput = document.getElementById('comp-npwp');
    const addressInput = document.getElementById('comp-address');
    
    const inputFile = document.getElementById('comp-logo-file');
    const inputLogoBase64 = document.getElementById('comp-logo-base64');
    const previewContainer = document.getElementById('preview-logo-container');

    const toast = document.getElementById('toast-notification');
    const toastContent = document.getElementById('toast-content');

    function showToast(message, type = 'success') {
        if (!toast || !toastContent) return;
        
        if (type === 'success') {
            toastContent.className = "px-4 py-3 shadow-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 rounded-none w-full";
            toastContent.innerHTML = `<svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>${message}</span>`;
        } else {
            toastContent.className = "px-4 py-3 shadow-lg border border-red-200 bg-red-50 text-red-800 text-xs font-medium flex items-center gap-2 rounded-none w-full";
            toastContent.innerHTML = `<svg class="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg><span>${message}</span>`;
        }

        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.remove('translate-y-[-1rem]', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-[-1rem]', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    const compressImage = (file, maxDimension = 192, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDimension) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    if (inputFile) {
        inputFile.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedBase64 = await compressImage(file, 192, 0.8);
                    inputLogoBase64.value = compressedBase64;
                    previewContainer.innerHTML = `<img src="${compressedBase64}" alt="Logo Preview" class="w-full h-full object-contain">`;
                } catch (err) {
                    console.error("Gagal memproses gambar logo:", err);
                    showToast("Gagal memproses file gambar logo.", "error");
                }
            }
        };
    }

    try {
        const docRef = doc(db, "pengaturan", "profil_perusahaan");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (nameInput) nameInput.value = data.nama || '';
            if (phoneInput) phoneInput.value = data.telepon || '';
            if (emailInput) emailInput.value = data.email || '';
            if (npwpInput) npwpInput.value = data.npwp || '';
            if (addressInput) addressInput.value = data.alamat || '';
            
            if (data.logo) {
                if (inputLogoBase64) inputLogoBase64.value = data.logo;
                if (previewContainer) {
                    previewContainer.innerHTML = `<img src="${data.logo}" alt="Logo Preview" class="w-full h-full object-contain">`;
                }
            }
        }
    } catch (err) {
        console.error("Gagal memuat profil perusahaan:", err);
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-save-comp');
            
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                `;
            }

            try {
                const payload = {
                    nama: nameInput.value,
                    telepon: phoneInput.value,
                    email: emailInput.value,
                    npwp: npwpInput.value,
                    alamat: addressInput.value,
                    updatedAt: new Date().toISOString()
                };

                const logoVal = inputLogoBase64.value;
                if (logoVal) {
                    payload.logo = logoVal;
                }

                await setDoc(doc(db, "pengaturan", "profil_perusahaan"), payload);
                showToast("Profil perusahaan berhasil disimpan!", "success");
            } catch (err) {
                console.error("Gagal menyimpan profil:", err);
                showToast("Terjadi kesalahan saat menyimpan data.", "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<span>Simpan Perubahan</span>`;
                }
            }
        };
    }
}