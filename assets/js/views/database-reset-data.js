// File: assets/js/views/database-reset-data.js
import { collection, getDocs, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const RESET_COLLECTIONS = [
    { key: "jurnal_umum", label: "Jurnal Umum (jurnal_umum)", desc: "Data transaksi jurnal keuangan & rincian debet/kredit.", defaultChecked: false },
    { key: "saldo_awal", label: "Saldo Awal (saldo_awal)", desc: "Data saldo awal akun neraca per periode dan unit usaha.", defaultChecked: false },
    { key: "tutup_bulan", label: "Tutup Bulan (tutup_bulan)", desc: "Catatan penutupan buku dan rekapan bulanan.", defaultChecked: false },
    { key: "pagu_anggaran", label: "Pagu Anggaran (pagu_anggaran)", desc: "Data pagu anggaran belanja / pengeluaran per unit.", defaultChecked: false },
    { key: "nota_aset", label: "Nota Aset (nota_aset)", desc: "Data pencatatan dan nota aset BUMKal.", defaultChecked: false },
    { key: "products", label: "Produk & Inventaris (products)", desc: "Data katalog produk / komoditas unit usaha.", defaultChecked: false },
    { key: "events", label: "Events / Kegiatan (events)", desc: "Data agenda dan kegiatan yang dipublikasikan.", defaultChecked: false },
    { key: "galeri", label: "Galeri (galeri)", desc: "Data foto dan dokumentasi galeri.", defaultChecked: false },
    { key: "banners", label: "Banners (banners)", desc: "Data banner tampilan halaman.", defaultChecked: false },
    { key: "running_text", label: "Running Text (running_text)", desc: "Data teks berjalan / pengumuman.", defaultChecked: false },
    { key: "kontak", label: "Kontak (kontak)", desc: "Data kontak pengurus / relasi.", defaultChecked: false },
    { key: "unit_usaha", label: "Unit Usaha (unit_usaha)", desc: "Data master unit usaha BUMKal.", defaultChecked: false },
    { key: "coa", label: "Chart of Accounts (coa)", desc: "Master bagan akun perkiraan akuntansi.", defaultChecked: false },
    { key: "pengaturan", label: "Pengaturan (pengaturan)", desc: "Data pengaturan umum aplikasi.", defaultChecked: false },
    { key: "pengaturan_sistem", label: "Pengaturan Sistem (pengaturan_sistem)", desc: "Konfigurasi periode awal dan pengaturan sistem.", defaultChecked: false },
    { key: "users", label: "Pengguna / Akun (users)", desc: "Data akun pengguna dan hak akses sistem.", defaultChecked: false }
];

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function renderResetData() {
    const desktopItemsHtml = RESET_COLLECTIONS.map((item) => `
        <label class="flex items-start gap-3 p-3.5 bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100/80 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none transition cursor-pointer select-none">
            <input type="checkbox" name="reset-collection-item" value="${escapeHtml(item.key)}" ${item.defaultChecked ? "checked" : ""}
                class="chk-reset-item mt-0.5 w-4 h-4 accent-rose-600 border-slate-300 rounded-none cursor-pointer flex-shrink-0">
            <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(item.label)}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(item.desc)}</div>
            </div>
        </label>
    `).join("");

    const mobileCardsHtml = RESET_COLLECTIONS.map((item) => `
        <label data-card-key="${escapeHtml(item.key)}" class="reset-mobile-card flex items-start gap-3 p-3.5 bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-none transition cursor-pointer select-none active:bg-slate-100 dark:active:bg-slate-900">
            <input type="checkbox" value="${escapeHtml(item.key)}" ${item.defaultChecked ? "checked" : ""}
                class="chk-reset-mobile mt-1 w-5 h-5 accent-rose-600 border-slate-300 rounded-none cursor-pointer flex-shrink-0">
            <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100 break-all">${escapeHtml(item.label)}</span>
                    <span class="badge-reset-status px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex-shrink-0">Belum</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">${escapeHtml(item.desc)}</p>
            </div>
        </label>
    `).join("");

    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/database" data-link title="Kembali ke Database" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Reset Data Sistem</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih koleksi database Firestore yang ingin dibersihkan melalui ceklist.</p>
                    </div>
                </div>
            </div>

            <!-- Panel Checklist Reset Data -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <p class="text-xs text-rose-600 dark:text-rose-400 font-semibold">Peringatan: Data pada koleksi yang dicentang akan dihapus permanen dari Firestore.</p>
                        <p id="reset-selected-count" class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">0 dari ${RESET_COLLECTIONS.length} koleksi dipilih</p>
                    </div>
                    <div class="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                        <button type="button" id="btn-pilih-semua-reset" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer text-center">
                            Pilih Semua
                        </button>
                        <button type="button" id="btn-batal-reset" class="px-3.5 py-2 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer text-center">
                            Batal
                        </button>
                    </div>
                </div>

                <!-- Tampilan HP / Mobile (Card View) -->
                <div id="reset-card-container" class="block md:hidden space-y-2.5">
                    ${mobileCardsHtml}
                </div>

                <!-- Tampilan Desktop / Tablet (Grid Checklist) -->
                <div id="reset-checklist-container" class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-3">
                    ${desktopItemsHtml}
                </div>

                <!-- Progres & Tombol Eksekusi -->
                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <span id="reset-progress-status" class="text-xs text-slate-500 dark:text-slate-400">Siap mengeksekusi reset data.</span>
                    <button type="button" id="btn-eksekusi-reset" class="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-none transition cursor-pointer shadow-sm text-center">
                        Eksekusi Reset Data
                    </button>
                </div>
            </div>

            <!-- Modal Konfirmasi Smooth (Kotak Siku) -->
            <div id="modal-konfirmasi-reset" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/0 backdrop-blur-[1px] p-4 opacity-0 transition-opacity duration-200 ease-out">
                <div id="modal-konfirmasi-reset-card" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-none w-full max-w-md overflow-hidden transform scale-95 opacity-0 transition-all duration-200 ease-out">
                    <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-7 h-7 bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>
                            </span>
                            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Konfirmasi Reset Data</h2>
                        </div>
                        <button type="button" id="btn-tutup-konfirmasi-reset" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition cursor-pointer" title="Tutup">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5 space-y-4 text-xs">
                        <p id="konfirmasi-reset-pesan" class="text-slate-600 dark:text-slate-300 leading-relaxed">Apakah Anda yakin ingin menghapus data pada koleksi terpilih?</p>
                        <div id="konfirmasi-reset-daftar" class="max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 space-y-1 font-semibold text-slate-700 dark:text-slate-200"></div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" id="btn-batal-konfirmasi-reset" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none transition cursor-pointer">Batal</button>
                            <button type="button" id="btn-ya-konfirmasi-reset" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none transition cursor-pointer shadow-sm">Ya, Reset Sekarang</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast Notifikasi Smooth (Kotak Siku) -->
            <div id="toast-reset-data" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transform translate-y-6 opacity-0 transition-all duration-250 ease-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-reset-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span id="toast-reset-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let databaseResetCleanup = null;
let resetToastTimer = null;

export function initResetDataHandler() {
    if (typeof databaseResetCleanup === "function") {
        databaseResetCleanup();
        databaseResetCleanup = null;
    }

    const desktopCheckboxes = Array.from(document.querySelectorAll('.chk-reset-item'));
    const mobileCheckboxes = Array.from(document.querySelectorAll('.chk-reset-mobile'));
    const mobileCards = Array.from(document.querySelectorAll('.reset-mobile-card'));

    const btnPilihSemua = document.getElementById('btn-pilih-semua-reset');
    const btnBatal = document.getElementById('btn-batal-reset');
    const btnEksekusi = document.getElementById('btn-eksekusi-reset');
    const selectedCountEl = document.getElementById('reset-selected-count');
    const progressStatusEl = document.getElementById('reset-progress-status');

    const modalKonfirmasi = document.getElementById('modal-konfirmasi-reset');
    const modalCard = document.getElementById('modal-konfirmasi-reset-card');
    const konfirmasiPesan = document.getElementById('konfirmasi-reset-pesan');
    const konfirmasiDaftar = document.getElementById('konfirmasi-reset-daftar');
    const btnTutupModal = document.getElementById('btn-tutup-konfirmasi-reset');
    const btnBatalModal = document.getElementById('btn-batal-konfirmasi-reset');
    const btnYaModal = document.getElementById('btn-ya-konfirmasi-reset');

    let confirmResolver = null;
    let confirmCloseTimer = null;
    let selectedKeysSet = new Set();

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-reset-data');
        const msgEl = document.getElementById('toast-reset-message');
        const iconEl = document.getElementById('toast-reset-icon');
        if (!toast || !msgEl) return;

        if (resetToastTimer) clearTimeout(resetToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        resetToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function getSelectedCollections() {
        return RESET_COLLECTIONS.filter((item) => selectedKeysSet.has(item.key));
    }

    function syncAllCheckboxesAndCards() {
        desktopCheckboxes.forEach((chk) => {
            chk.checked = selectedKeysSet.has(chk.value);
        });

        mobileCheckboxes.forEach((chk) => {
            chk.checked = selectedKeysSet.has(chk.value);
        });

        mobileCards.forEach((card) => {
            const key = card.getAttribute('data-card-key') || "";
            const isChecked = selectedKeysSet.has(key);
            const badge = card.querySelector('.badge-reset-status');

            card.classList.toggle('border-rose-500', isChecked);
            card.classList.toggle('bg-rose-50/40', isChecked);
            card.classList.toggle('dark:bg-rose-950/20', isChecked);
            card.classList.toggle('border-slate-200', !isChecked);
            card.classList.toggle('dark:border-slate-800', !isChecked);

            if (badge) {
                badge.textContent = isChecked ? "Dipilih" : "Belum";
                badge.className = isChecked
                    ? "badge-reset-status px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-600 text-white border border-rose-600 flex-shrink-0"
                    : "badge-reset-status px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex-shrink-0";
            }
        });

        if (selectedCountEl) {
            selectedCountEl.textContent = `${selectedKeysSet.size} dari ${RESET_COLLECTIONS.length} koleksi dipilih`;
        }
    }

    function setCheckboxDisabledState(disabled) {
        desktopCheckboxes.forEach((chk) => { chk.disabled = disabled; });
        mobileCheckboxes.forEach((chk) => { chk.disabled = disabled; });
        if (btnPilihSemua) btnPilihSemua.disabled = disabled;
        if (btnBatal) btnBatal.disabled = disabled;
    }

    function finishConfirm(result) {
        if (!modalKonfirmasi || !modalCard) {
            if (confirmResolver) {
                const resolve = confirmResolver;
                confirmResolver = null;
                resolve(result);
            }
            return;
        }

        if (confirmCloseTimer) clearTimeout(confirmCloseTimer);

        modalKonfirmasi.classList.remove('bg-slate-950/60', 'opacity-100');
        modalKonfirmasi.classList.add('bg-slate-950/0', 'opacity-0');
        modalCard.classList.remove('scale-100', 'opacity-100');
        modalCard.classList.add('scale-95', 'opacity-0');

        const resolve = confirmResolver;
        confirmResolver = null;

        confirmCloseTimer = setTimeout(() => {
            modalKonfirmasi.classList.add('hidden');
            modalKonfirmasi.classList.remove('flex');
            if (resolve) resolve(result);
        }, 200);
    }

    function openConfirmModal(selectedList) {
        if (!modalKonfirmasi || !modalCard) return Promise.resolve(false);

        if (confirmResolver) {
            const prevResolve = confirmResolver;
            confirmResolver = null;
            prevResolve(false);
        }

        if (confirmCloseTimer) clearTimeout(confirmCloseTimer);

        if (konfirmasiPesan) {
            konfirmasiPesan.textContent = `Tindakan ini akan menghapus seluruh dokumen pada ${selectedList.length} koleksi berikut secara permanen:`;
        }
        if (konfirmasiDaftar) {
            konfirmasiDaftar.innerHTML = selectedList
                .map((c) => `<div>&bull; ${escapeHtml(c.label)}</div>`)
                .join("");
        }

        modalKonfirmasi.classList.remove('hidden');
        modalKonfirmasi.classList.add('flex');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modalKonfirmasi.classList.remove('bg-slate-950/0', 'opacity-0');
                modalKonfirmasi.classList.add('bg-slate-950/60', 'opacity-100');
                modalCard.classList.remove('scale-95', 'opacity-0');
                modalCard.classList.add('scale-100', 'opacity-100');
            });
        });

        return new Promise((resolve) => {
            confirmResolver = resolve;
        });
    }

    async function deleteCollectionDocuments(colName) {
        const snap = await getDocs(collection(db, colName));
        const docRefs = snap.docs.map((d) => doc(db, colName, d.id));
        const chunkSize = 450;

        for (let i = 0; i < docRefs.length; i += chunkSize) {
            const batch = writeBatch(db);
            const chunk = docRefs.slice(i, i + chunkSize);
            chunk.forEach((ref) => batch.delete(ref));
            await batch.commit();
        }

        return docRefs.length;
    }

    const onDesktopCheckboxChange = (e) => {
        const chk = e.currentTarget;
        if (chk.checked) selectedKeysSet.add(chk.value);
        else selectedKeysSet.delete(chk.value);
        syncAllCheckboxesAndCards();
    };

    const onMobileCheckboxChange = (e) => {
        const chk = e.currentTarget;
        if (chk.checked) selectedKeysSet.add(chk.value);
        else selectedKeysSet.delete(chk.value);
        syncAllCheckboxesAndCards();
    };

    const onPilihSemuaClick = () => {
        selectedKeysSet = new Set(RESET_COLLECTIONS.map((item) => item.key));
        syncAllCheckboxesAndCards();
    };

    const onBatalClick = () => {
        selectedKeysSet.clear();
        syncAllCheckboxesAndCards();
        if (progressStatusEl) {
            progressStatusEl.textContent = "Pilihan ceklist dibatalkan (dikosongkan).";
        }
        showToast("Pilihan ceklist dibatalkan.");
    };

    const onEksekusiClick = async () => {
        const selectedList = getSelectedCollections();
        if (selectedList.length === 0) {
            showToast("Pilih minimal satu koleksi pada ceklist terlebih dahulu.", true);
            return;
        }

        const yakin = await openConfirmModal(selectedList);
        if (!yakin) return;

        const originalBtnText = btnEksekusi ? btnEksekusi.textContent : "Eksekusi Reset Data";
        if (btnEksekusi) {
            btnEksekusi.disabled = true;
            btnEksekusi.textContent = "Mereset Data...";
        }
        setCheckboxDisabledState(true);

        let totalDeletedDocs = 0;

        try {
            for (let i = 0; i < selectedList.length; i++) {
                const colItem = selectedList[i];
                if (progressStatusEl) {
                    progressStatusEl.textContent = `Menghapus koleksi ${colItem.key} (${i + 1}/${selectedList.length})...`;
                }
                const count = await deleteCollectionDocuments(colItem.key);
                totalDeletedDocs += count;
            }

            selectedKeysSet.clear();
            syncAllCheckboxesAndCards();

            if (progressStatusEl) {
                progressStatusEl.textContent = `Selesai: ${totalDeletedDocs} dokumen dihapus dari ${selectedList.length} koleksi.`;
            }
            showToast(`Reset selesai: ${totalDeletedDocs} dokumen dihapus.`);
        } catch (err) {
            console.error("Gagal mengeksekusi reset data:", err);
            if (progressStatusEl) {
                progressStatusEl.textContent = "Terjadi kesalahan saat mereset data Firestore.";
            }
            showToast("Gagal mereset data. Periksa izin/koneksi Firestore.", true);
        } finally {
            if (btnEksekusi) {
                btnEksekusi.disabled = false;
                btnEksekusi.textContent = originalBtnText;
            }
            setCheckboxDisabledState(false);
        }
    };

    const onModalBackdropClick = (e) => {
        if (e.target === modalKonfirmasi) {
            finishConfirm(false);
        }
    };

    const onEscapeKey = (e) => {
        if (e.key === "Escape" && confirmResolver) {
            finishConfirm(false);
        }
    };

    desktopCheckboxes.forEach((chk) => {
        if (chk.checked) selectedKeysSet.add(chk.value);
        chk.addEventListener('change', onDesktopCheckboxChange);
    });

    mobileCheckboxes.forEach((chk) => {
        if (chk.checked) selectedKeysSet.add(chk.value);
        chk.addEventListener('change', onMobileCheckboxChange);
    });

    if (btnPilihSemua) btnPilihSemua.addEventListener('click', onPilihSemuaClick);
    if (btnBatal) btnBatal.addEventListener('click', onBatalClick);
    if (btnEksekusi) btnEksekusi.addEventListener('click', onEksekusiClick);

    if (btnYaModal) btnYaModal.onclick = () => finishConfirm(true);
    if (btnBatalModal) btnBatalModal.onclick = () => finishConfirm(false);
    if (btnTutupModal) btnTutupModal.onclick = () => finishConfirm(false);
    if (modalKonfirmasi) modalKonfirmasi.addEventListener('click', onModalBackdropClick);
    window.addEventListener('keydown', onEscapeKey);

    syncAllCheckboxesAndCards();

    const cleanup = () => {
        if (confirmResolver) {
            const resolve = confirmResolver;
            confirmResolver = null;
            resolve(false);
        }
        if (confirmCloseTimer) {
            clearTimeout(confirmCloseTimer);
            confirmCloseTimer = null;
        }
        if (resetToastTimer) {
            clearTimeout(resetToastTimer);
            resetToastTimer = null;
        }
        desktopCheckboxes.forEach((chk) => {
            chk.removeEventListener('change', onDesktopCheckboxChange);
        });
        mobileCheckboxes.forEach((chk) => {
            chk.removeEventListener('change', onMobileCheckboxChange);
        });
        if (btnPilihSemua) btnPilihSemua.removeEventListener('click', onPilihSemuaClick);
        if (btnBatal) btnBatal.removeEventListener('click', onBatalClick);
        if (btnEksekusi) btnEksekusi.removeEventListener('click', onEksekusiClick);
        if (modalKonfirmasi) modalKonfirmasi.removeEventListener('click', onModalBackdropClick);
        window.removeEventListener('keydown', onEscapeKey);
        window.removeEventListener('hashchange', cleanup);
        databaseResetCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    databaseResetCleanup = cleanup;

    return cleanup;
}

export const renderDatabaseResetData = renderResetData;
export const initDatabaseResetDataHandler = initResetDataHandler;