// File: assets/js/views/manajemen-text.js
import { db } from "../firebase-init.js";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const DEFAULT_TEMPLATES = [
    {
        id: "tpl-default-1",
        icon: "🛒",
        label: "Selamat Datang",
        teks: "Selamat datang di BUMKal Srihardono! Nikmati berbagai layanan dan informasi terbaru kami.",
        highlighted: true
    },
    {
        id: "tpl-default-2",
        icon: "💖",
        label: "Promo Member",
        teks: "Anggota dan warga mendapatkan prioritas layanan administrasi dan pelaporan terbaik!",
        highlighted: false
    },
    {
        id: "tpl-default-3",
        icon: "⚡",
        label: "Diskon Hari Ini",
        teks: "Informasi penting hari ini: Pastikan selalu memantau laporan keuangan unit usaha melalui dashboard.",
        highlighted: false
    },
    {
        id: "tpl-default-4",
        icon: "🕒",
        label: "Jam Operasional",
        teks: "Kami buka setiap hari pukul 08.00 - 16.00 WIB. Terima kasih atas partisipasi Anda!",
        highlighted: false
    },
    {
        id: "tpl-default-5",
        icon: "🌟",
        label: "Promo Akhir Pekan",
        teks: "Rekapitulasi laporan bulanan unit usaha telah diperbarui. Silakan cek menu Laporan.",
        highlighted: false
    }
];

export function renderManajemenText() {
    return `
        <div class="space-y-6 pb-12 max-w-5xl mx-auto animate-fade-in text-slate-800 dark:text-slate-100">
            
            <!-- Header Judul -->
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 class="text-lg font-bold">Running Text</h1>
                </div>
                <span id="config-save-status" class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity duration-300">
                    ✓ Pengaturan tersimpan
                </span>
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
            <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TEMPLATE CEPAT — KLIK UNTUK TAMBAHKAN</p>
                    <button type="button" id="btn-open-add-template" class="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-none transition cursor-pointer">
                        + Tambah Template
                    </button>
                </div>
                <div id="template-buttons-container" class="flex flex-wrap gap-2">
                    <span class="text-xs text-slate-400 py-1">Memuat template...</span>
                </div>
            </div>

            <!-- Daftar Teks Berjalan -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 id="daftar-teks-title" class="text-xs font-bold uppercase tracking-wider text-slate-500">DAFTAR TEKS (0)</h3>
                    <button id="btn-open-add-modal" class="inline-flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-medium px-3 py-1.5 rounded-none transition cursor-pointer">
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

        <!-- MODAL TAMBAH / EDIT TEKS RUNNING TEXT -->
        <div id="text-modal" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-200">
            <div id="text-modal-box" class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-none border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 opacity-0 scale-95">
                <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <h3 id="modal-title" class="text-sm font-bold">Tambah Teks Baru</h3>
                    <button id="btn-close-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
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
                        <button type="button" id="btn-cancel-modal" class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-none transition cursor-pointer">Batal</button>
                        <button type="submit" class="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-medium rounded-none transition shadow-xs cursor-pointer">Simpan</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL TAMBAH / EDIT TEMPLATE CEPAT -->
        <div id="template-modal" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-200">
            <div id="template-modal-box" class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-none border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 opacity-0 scale-95">
                <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <h3 id="template-modal-title" class="text-sm font-bold">Tambah Template Cepat</h3>
                    <button type="button" id="btn-close-template-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <form id="template-form" class="p-5 space-y-4">
                    <input type="hidden" id="edit-template-id">
                    <input type="hidden" id="edit-template-is-default">

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div class="space-y-1.5">
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Ikon / Emoji</label>
                            <input type="text" id="input-template-icon" maxlength="4" value="📌" required placeholder="📌" class="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-none px-3 py-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        </div>
                        <div class="sm:col-span-3 space-y-1.5">
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Tombol Template</label>
                            <input type="text" id="input-template-label" required placeholder="Contoh: Pengumuman Rapat" class="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Isi Teks Template</label>
                        <textarea id="input-template-teks" rows="3" required placeholder="Teks yang akan ditambahkan saat tombol template diklik..." class="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-none p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                    </div>

                    <div class="flex items-center gap-3 pt-1">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="input-template-highlight" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-900"></div>
                        </label>
                        <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Beri bingkai aksen kuning</span>
                    </div>

                    <div class="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" id="btn-cancel-template-modal" class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium rounded-none transition cursor-pointer">Batal</button>
                        <button type="submit" class="px-5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-medium rounded-none transition shadow-xs cursor-pointer">Simpan Template</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL KONFIRMASI HAPUS (SMOOTH & TANPA POPUP BROWSER) -->
        <div id="delete-confirm-modal" class="fixed inset-0 bg-slate-950/50 z-50 hidden flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-200">
            <div id="delete-confirm-box" class="bg-white dark:bg-slate-900 w-full max-w-md rounded-none border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-200 opacity-0 scale-95">
                <div class="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-red-50 dark:bg-red-950/40">
                    <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        <h3 class="text-xs font-bold uppercase tracking-wider">Konfirmasi Hapus</h3>
                    </div>
                    <button type="button" id="btn-close-delete-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="p-5 space-y-3">
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        Apakah Anda yakin ingin menghapus teks berjalan ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div id="delete-preview-text" class="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 break-words"></div>
                </div>
                <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button type="button" id="btn-cancel-delete" class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium rounded-none transition cursor-pointer">
                        Batal
                    </button>
                    <button type="button" id="btn-confirm-delete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-none transition shadow-xs cursor-pointer">
                        Ya, Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function initManajemenTextHandler() {
    const tableBody = document.getElementById('running-text-table-body');
    const daftarTitle = document.getElementById('daftar-teks-title');
    const templatesContainer = document.getElementById('template-buttons-container');

    const modal = document.getElementById('text-modal');
    const modalBox = document.getElementById('text-modal-box');
    const form = document.getElementById('text-form');
    const modalTitle = document.getElementById('modal-title');
    const inputTeksVal = document.getElementById('input-teks-val');
    const inputTeksAktif = document.getElementById('input-teks-aktif');
    const editIdField = document.getElementById('edit-text-id');

    const tplModal = document.getElementById('template-modal');
    const tplModalBox = document.getElementById('template-modal-box');
    const tplForm = document.getElementById('template-form');
    const tplModalTitle = document.getElementById('template-modal-title');
    const tplEditIdField = document.getElementById('edit-template-id');
    const tplIsDefaultField = document.getElementById('edit-template-is-default');
    const tplIconInput = document.getElementById('input-template-icon');
    const tplLabelInput = document.getElementById('input-template-label');
    const tplTeksInput = document.getElementById('input-template-teks');
    const tplHighlightInput = document.getElementById('input-template-highlight');

    const deleteModal = document.getElementById('delete-confirm-modal');
    const deleteBox = document.getElementById('delete-confirm-box');
    const deletePreviewEl = document.getElementById('delete-preview-text');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnCloseDelete = document.getElementById('btn-close-delete-modal');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    const globalSwitch = document.getElementById('global-active-switch');
    const speedSelect = document.getElementById('running-text-speed');
    const saveStatusEl = document.getElementById('config-save-status');

    let textList = [];
    let templateList = [];
    let statusTimer = null;
    let pendingDeleteId = null;

    function openSmoothModal(overlayEl, boxEl) {
        if (!overlayEl || !boxEl) return;
        overlayEl.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                boxEl.classList.remove('opacity-0', 'scale-95');
                boxEl.classList.add('opacity-100', 'scale-100');
            });
        });
    }

    function closeSmoothModal(overlayEl, boxEl, onAfterClose) {
        if (!overlayEl || !boxEl) return;
        boxEl.classList.remove('opacity-100', 'scale-100');
        boxEl.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            overlayEl.classList.add('hidden');
            if (typeof onAfterClose === 'function') onAfterClose();
        }, 180);
    }

    function showSavedBadge(msg = "✓ Pengaturan tersimpan", isError = false) {
        if (!saveStatusEl) return;
        saveStatusEl.textContent = msg;
        saveStatusEl.classList.toggle('text-emerald-600', !isError);
        saveStatusEl.classList.toggle('dark:text-emerald-400', !isError);
        saveStatusEl.classList.toggle('text-red-600', isError);
        saveStatusEl.classList.toggle('dark:text-red-400', isError);
        saveStatusEl.classList.remove('opacity-0');
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
            saveStatusEl.classList.add('opacity-0');
        }, 2400);
    }

    async function saveGlobalConfig() {
        const aktif = globalSwitch ? globalSwitch.checked : true;
        const kecepatan = speedSelect ? speedSelect.value : 'normal';

        try {
            await setDoc(doc(db, 'pengaturan', 'running_text'), {
                aktif,
                kecepatan,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            showSavedBadge("✓ Kecepatan & status disimpan");

            if (typeof window.reloadGlobalRunningText === 'function') {
                window.reloadGlobalRunningText();
            }
        } catch (err) {
            console.error("Gagal menyimpan pengaturan running text:", err);
            showSavedBadge("✕ Gagal menyimpan pengaturan", true);
        }
    }

    if (speedSelect) {
        speedSelect.addEventListener('change', saveGlobalConfig);
    }
    if (globalSwitch) {
        globalSwitch.addEventListener('change', saveGlobalConfig);
    }

    async function loadTemplates() {
        try {
            const snap = await getDocs(collection(db, 'running_text_templates'));
            const loaded = [];
            snap.forEach((docSnap) => {
                loaded.push({ id: docSnap.id, isDefault: false, ...docSnap.data() });
            });

            if (loaded.length > 0) {
                loaded.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                templateList = loaded;
            } else {
                templateList = DEFAULT_TEMPLATES.map((item, idx) => ({
                    ...item,
                    order: idx + 1,
                    isDefault: true
                }));
            }
            renderTemplates();
        } catch (err) {
            console.error("Gagal memuat template cepat:", err);
            templateList = DEFAULT_TEMPLATES.map((item, idx) => ({
                ...item,
                order: idx + 1,
                isDefault: true
            }));
            renderTemplates();
        }
    }

    function renderTemplates() {
        if (!templatesContainer) return;

        templatesContainer.innerHTML = templateList.map((tpl) => {
            const borderClass = tpl.highlighted
                ? "border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-slate-800"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800";

            return `
                <div class="inline-flex items-center bg-white dark:bg-slate-900 border ${borderClass} rounded-none shadow-2xs transition group">
                    <button type="button" class="template-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer" data-teks="${escapeAttr(tpl.teks)}" title="Klik untuk menambahkan ke daftar running text">
                        <span>${escapeHtml(tpl.icon || "📌")}</span>
                        <span>${escapeHtml(tpl.label)}</span>
                    </button>
                    <button type="button" class="btn-edit-template px-2 py-1.5 border-l border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer" data-id="${escapeAttr(tpl.id)}" title="Edit template">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                </div>
            `;
        }).join('');

        // Klik tombol template -> langsung tambahkan teks ke daftar running_text
        templatesContainer.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const templateText = btn.getAttribute('data-teks');
                if (!templateText) return;
                try {
                    await addDoc(collection(db, 'running_text'), {
                        teks: templateText,
                        aktif: true,
                        createdAt: new Date().toISOString()
                    });
                    await loadData();
                    showSavedBadge("✓ Template ditambahkan");
                    if (typeof window.reloadGlobalRunningText === 'function') {
                        window.reloadGlobalRunningText();
                    }
                } catch (err) {
                    console.error("Gagal menambahkan template:", err);
                    showSavedBadge("✕ Gagal menambahkan template", true);
                }
            });
        });

        // Klik ikon edit -> buka modal edit template
        templatesContainer.querySelectorAll('.btn-edit-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tplId = btn.getAttribute('data-id');
                const tpl = templateList.find(x => x.id === tplId);
                if (!tpl) return;

                tplEditIdField.value = tpl.id;
                tplIsDefaultField.value = tpl.isDefault ? "1" : "0";
                tplIconInput.value = tpl.icon || "📌";
                tplLabelInput.value = tpl.label || "";
                tplTeksInput.value = tpl.teks || "";
                tplHighlightInput.checked = Boolean(tpl.highlighted);
                tplModalTitle.textContent = "Edit Template Cepat";
                openSmoothModal(tplModal, tplModalBox);
            });
        });
    }

    // Buka modal tambah template baru
    const btnOpenAddTpl = document.getElementById('btn-open-add-template');
    if (btnOpenAddTpl) {
        btnOpenAddTpl.addEventListener('click', () => {
            tplEditIdField.value = "";
            tplIsDefaultField.value = "0";
            tplIconInput.value = "📌";
            tplLabelInput.value = "";
            tplTeksInput.value = "";
            tplHighlightInput.checked = false;
            tplModalTitle.textContent = "Tambah Template Cepat";
            openSmoothModal(tplModal, tplModalBox);
        });
    }

    const closeTemplateModal = () => closeSmoothModal(tplModal, tplModalBox);
    const btnCloseTplModal = document.getElementById('btn-close-template-modal');
    const btnCancelTplModal = document.getElementById('btn-cancel-template-modal');
    if (btnCloseTplModal) btnCloseTplModal.addEventListener('click', closeTemplateModal);
    if (btnCancelTplModal) btnCancelTplModal.addEventListener('click', closeTemplateModal);
    if (tplModal) {
        tplModal.addEventListener('click', (e) => {
            if (e.target === tplModal) closeTemplateModal();
        });
    }

    // Simpan tambah / edit template ke Firestore
    if (tplForm) {
        tplForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = tplEditIdField.value;
            const isDefault = tplIsDefaultField.value === "1";
            const icon = (tplIconInput.value || "📌").trim();
            const label = tplLabelInput.value.trim();
            const teks = tplTeksInput.value.trim();
            const highlighted = tplHighlightInput.checked;

            if (!label || !teks) return;

            try {
                if (id && !isDefault) {
                    await updateDoc(doc(db, 'running_text_templates', id), {
                        icon,
                        label,
                        teks,
                        highlighted,
                        updatedAt: new Date().toISOString()
                    });
                    showSavedBadge("✓ Template diperbarui");
                } else {
                    await addDoc(collection(db, 'running_text_templates'), {
                        icon,
                        label,
                        teks,
                        highlighted,
                        order: templateList.length + 1,
                        createdAt: new Date().toISOString()
                    });
                    showSavedBadge("✓ Template baru disimpan");
                }
                closeTemplateModal();
                await loadTemplates();
            } catch (err) {
                console.error("Gagal menyimpan template:", err);
                showSavedBadge("✕ Gagal menyimpan template", true);
            }
        });
    }

    async function loadData() {
        try {
            const configSnap = await getDoc(doc(db, 'pengaturan', 'running_text'));
            if (configSnap.exists()) {
                const cfg = configSnap.data();
                if (speedSelect && cfg.kecepatan) {
                    speedSelect.value = cfg.kecepatan;
                }
                if (globalSwitch && typeof cfg.aktif === 'boolean') {
                    globalSwitch.checked = cfg.aktif;
                }
            }
        } catch (e) {
            console.error("Gagal memuat konfigurasi running text:", e);
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
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
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
                        <button type="button" class="btn-edit-item p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer" data-id="${item.id}" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button type="button" class="btn-delete-item p-1 text-slate-400 hover:text-red-600 transition cursor-pointer" data-id="${item.id}" title="Hapus">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.toggle-status-item').forEach(chk => {
            chk.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const aktif = e.target.checked;
                try {
                    await updateDoc(doc(db, 'running_text', id), { aktif });
                    const target = textList.find(x => x.id === id);
                    if (target) target.aktif = aktif;
                    renderTable();
                    showSavedBadge("✓ Status teks diperbarui");
                    if (typeof window.reloadGlobalRunningText === 'function') {
                        window.reloadGlobalRunningText();
                    }
                } catch (err) {
                    console.error("Gagal mengubah status:", err);
                    e.target.checked = !aktif;
                    showSavedBadge("✕ Gagal mengubah status", true);
                }
            });
        });

        document.querySelectorAll('.btn-edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = textList.find(x => x.id === id);
                if (item) {
                    editIdField.value = item.id;
                    inputTeksVal.value = item.teks;
                    inputTeksAktif.checked = item.aktif;
                    modalTitle.textContent = "Edit Teks Berjalan";
                    openSmoothModal(modal, modalBox);
                }
            });
        });

        document.querySelectorAll('.btn-delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = textList.find(x => x.id === id);
                if (!item) return;

                pendingDeleteId = id;
                if (deletePreviewEl) {
                    deletePreviewEl.textContent = item.teks;
                }
                openSmoothModal(deleteModal, deleteBox);
            });
        });
    }

    async function executeDelete() {
        if (!pendingDeleteId) return;
        const idToDelete = pendingDeleteId;

        btnConfirmDelete.disabled = true;
        btnConfirmDelete.textContent = "Menghapus...";

        try {
            await deleteDoc(doc(db, 'running_text', idToDelete));
            textList = textList.filter(x => x.id !== idToDelete);
            renderTable();
            showSavedBadge("✓ Teks berhasil dihapus");
            if (typeof window.reloadGlobalRunningText === 'function') {
                window.reloadGlobalRunningText();
            }
            closeSmoothModal(deleteModal, deleteBox, () => {
                pendingDeleteId = null;
                btnConfirmDelete.disabled = false;
                btnConfirmDelete.textContent = "Ya, Hapus";
            });
        } catch (err) {
            console.error("Gagal menghapus:", err);
            showSavedBadge("✕ Gagal menghapus teks", true);
            btnConfirmDelete.disabled = false;
            btnConfirmDelete.textContent = "Ya, Hapus";
        }
    }

    const cancelDelete = () => {
        closeSmoothModal(deleteModal, deleteBox, () => {
            pendingDeleteId = null;
        });
    };

    if (btnCancelDelete) btnCancelDelete.addEventListener('click', cancelDelete);
    if (btnCloseDelete) btnCloseDelete.addEventListener('click', cancelDelete);
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', executeDelete);
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) cancelDelete();
        });
    }

    document.getElementById('btn-open-add-modal').addEventListener('click', () => {
        editIdField.value = '';
        inputTeksVal.value = '';
        inputTeksAktif.checked = true;
        modalTitle.textContent = "Tambah Teks Baru";
        openSmoothModal(modal, modalBox);
    });

    const closeTextModal = () => closeSmoothModal(modal, modalBox);
    document.getElementById('btn-close-modal').addEventListener('click', closeTextModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeTextModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeTextModal();
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editIdField.value;
        const teks = inputTeksVal.value.trim();
        const aktif = inputTeksAktif.checked;

        if (!teks) return;

        try {
            if (id) {
                await updateDoc(doc(db, 'running_text', id), { teks, aktif });
                showSavedBadge("✓ Teks diperbarui");
            } else {
                await addDoc(collection(db, 'running_text'), {
                    teks,
                    aktif,
                    createdAt: new Date().toISOString()
                });
                showSavedBadge("✓ Teks ditambahkan");
            }
            closeTextModal();
            await loadData();
            if (typeof window.reloadGlobalRunningText === 'function') {
                window.reloadGlobalRunningText();
            }
        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            showSavedBadge("✕ Gagal menyimpan data", true);
        }
    });

    loadTemplates();
    loadData();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, "&#96;");
}