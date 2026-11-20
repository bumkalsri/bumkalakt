// File: assets/js/views/akuntansi-entri-jurnal.js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const JURNAL_TYPE = "JurnalUmum";

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function isJurnalUmumType(item) {
    const rawType = String(item.type || item.jenisTransaksi || "").trim();
    return rawType === JURNAL_TYPE;
}

export function renderAkuntansiEntriJurnal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/akuntansi" data-link title="Kembali ke Akuntansi" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Entri Jurnal Umum</h1>
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Type: ${JURNAL_TYPE}</span>
                            <span id="badge-bulan-aktif-jurnal" class="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Memuat Periode...</span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola pencatatan transaksi jurnal finansial BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-buka-modal-jurnal" type="button" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah Jurnal Baru
                    </button>
                </div>
            </div>

            <!-- Filter Bar (Kata Kunci, Unit Usaha, Tanggal Mulai, Tanggal Sampai) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI NO. REF / KETERANGAN</label>
                    <input type="text" id="filter-keyword" placeholder="Ketik kata kunci..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">--Semua Unit--</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button id="btn-reset-filter" type="button" class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 border border-slate-300 dark:border-slate-700 transition cursor-pointer">Reset Filter</button>
                </div>
            </div>

            <!-- Daftar Transaksi Jurnal (Responsive: Tabel Desktop & Card Mobile) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Transaksi Jurnal Umum (${JURNAL_TYPE})</h3>
                    <span id="total-jurnal" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">Tanggal</th>
                                <th class="py-2.5 px-4 font-semibold">No. Referensi</th>
                                <th class="py-2.5 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Rincian Transaksi &amp; Keterangan</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Total (Rp)</th>
                                <th class="py-2.5 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-jurnal-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="6" class="py-6 text-center text-slate-400">Memuat data jurnal dari database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View) -->
                <div id="card-jurnal-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data jurnal dari database...</div>
                </div>
            </div>

            <!-- MODAL FORM INPUT/EDIT JURNAL UMUM -->
            <div id="modal-entri-jurnal" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 md:p-4 transition-all duration-300 overflow-y-auto">
                <div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-none shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
                    <!-- Modal Header -->
                    <div class="bg-[#0b2f64] px-4 md:px-6 py-3.5 flex items-center justify-between text-white">
                        <div class="flex items-center gap-2 min-w-0">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <h2 id="modal-title" class="text-xs md:text-sm font-bold tracking-wide truncate">Form Input Jurnal Umum Baru</h2>
                        </div>
                        <button id="btn-tutup-modal" type="button" class="text-white hover:text-slate-200 transition cursor-pointer p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Modal Body Form -->
                    <form id="form-entri-jurnal" class="p-4 md:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
                        <input type="hidden" id="edit-jurnal-id" value="">

                        <!-- Baris 1: Tanggal, No Ref, Unit Usaha -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transaksi *</label>
                                <input type="date" id="tgl-transaksi" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition">
                                <p id="jurnal-tgl-warning" class="hidden text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-1"></p>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Referensi / Bukti</label>
                                <input type="text" id="no-ref" required readonly class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-none focus:outline-none font-bold">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Usaha (Cabang)</label>
                                <select id="unit-usaha" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                                    <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                                    <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                                    <option value="KOMPOS (03)">KOMPOS (03)</option>
                                    <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Keterangan Transaksi Tunggal -->
                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan Transaksi *</label>
                            <input type="text" id="keterangan-transaksi" required placeholder="Masukkan keterangan atau uraian transaksi..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>

                        <!-- Tabel Rincian Baris Jurnal -->
                        <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden mt-4">
                            <div class="bg-slate-900 text-white px-4 py-2 font-bold flex items-center justify-between text-xs">
                                <span>Rincian Akun Jurnal (Debet &amp; Kredit)</span>
                                <span id="jurnal-periode-info" class="text-[10px] font-semibold text-sky-300"></span>
                            </div>
                            <div class="overflow-x-auto w-full">
                                <table class="w-full min-w-[550px] text-left border-collapse text-xs">
                                    <thead>
                                        <tr class="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                            <th class="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                                            <th class="py-2.5 px-3 font-semibold">Akun Perkiraan (Level Terakhir)</th>
                                            <th class="py-2.5 px-3 font-semibold w-36 text-right">Debet (Rp)</th>
                                            <th class="py-2.5 px-3 font-semibold w-36 text-right">Kredit (Rp)</th>
                                            <th class="py-2.5 px-3 font-semibold w-20 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="jurnal-rows-container" class="divide-y divide-slate-100 dark:divide-slate-800">
                                        <!-- Baris dinamis dimasukkan via JS -->
                                    </tbody>
                                    <tfoot>
                                        <tr class="bg-slate-50 dark:bg-slate-950 font-bold border-t border-slate-200 dark:border-slate-800">
                                            <td colspan="2" class="py-3 px-4 text-right">TOTAL :</td>
                                            <td id="total-debet-view" class="py-3 px-3 text-right text-slate-800 dark:text-slate-100">Rp 0</td>
                                            <td id="total-kredit-view" class="py-3 px-3 text-right text-slate-800 dark:text-slate-100">Rp 0</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <!-- Status Validasi Balance -->
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-slate-700 dark:text-slate-300">Status Validasi Transaksi:</span>
                                <span id="status-balance-badge" class="px-3 py-1 text-[11px] font-bold uppercase rounded-none bg-rose-500 text-white">Belum Balance</span>
                            </div>
                            <span class="text-[11px] text-slate-500">(*) Wajib diisi</span>
                        </div>

                        <!-- Modal Footer Action Buttons -->
                        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button type="button" id="btn-batal-modal" class="bg-slate-500 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-none transition cursor-pointer">Reset Form</button>
                            <button type="submit" id="btn-simpan-jurnal" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Jurnal</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL KONFIRMASI SMOOTH -->
            <div id="modal-konfirmasi-jurnal" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center p-4 transition-opacity duration-200">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-5 sm:p-6 shadow-2xl rounded-none space-y-4 transform transition-all duration-200">
                    <div class="flex items-start gap-3">
                        <div class="w-9 h-9 flex items-center justify-center bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 flex-shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modal-konfirmasi-jurnal-title" class="font-bold text-slate-800 dark:text-slate-100 text-sm">Konfirmasi Hapus Jurnal</h3>
                            <p id="modal-konfirmasi-jurnal-desc" class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Apakah Anda yakin ingin menghapus transaksi jurnal ini?</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button type="button" id="btn-konfirmasi-jurnal-batal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none transition cursor-pointer">Batal</button>
                        <button type="button" id="btn-konfirmasi-jurnal-ya" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none transition cursor-pointer">Ya, Hapus</button>
                    </div>
                </div>
            </div>

            <!-- TOAST NOTIFIKASI HALUS -->
            <div id="toast-notif" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div id="toast-content" class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-message">Pesan notifikasi berhasil.</span>
                </div>
            </div>
        </div>
    `;
}

let jurnalToastTimer = null;
let jurnalCleanup = null;

export async function initAkuntansiEntriJurnalHandler() {
    if (typeof jurnalCleanup === "function") {
        jurnalCleanup();
        jurnalCleanup = null;
    }

    const modal = document.getElementById('modal-entri-jurnal');
    const modalTitle = document.getElementById('modal-title');
    const editJurnalIdInput = document.getElementById('edit-jurnal-id');
    const btnBuka = document.getElementById('btn-buka-modal-jurnal');
    const btnTutup = document.getElementById('btn-tutup-modal');
    const btnBatal = document.getElementById('btn-batal-modal');
    const form = document.getElementById('form-entri-jurnal');
    const btnSimpan = document.getElementById('btn-simpan-jurnal');

    const badgeBulanAktif = document.getElementById('badge-bulan-aktif-jurnal');
    const tglWarningEl = document.getElementById('jurnal-tgl-warning');
    const periodeInfoEl = document.getElementById('jurnal-periode-info');

    const tableBody = document.getElementById('table-jurnal-body');
    const cardBody = document.getElementById('card-jurnal-body');
    const totalJurnalEl = document.getElementById('total-jurnal');
    const jurnalRowsContainer = document.getElementById('jurnal-rows-container');

    const filterKeyword = document.getElementById('filter-keyword');
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnResetFilter = document.getElementById('btn-reset-filter');

    const tglTransaksiInput = document.getElementById('tgl-transaksi');
    const unitUsahaSelect = document.getElementById('unit-usaha');
    const noRefInput = document.getElementById('no-ref');
    const keteranganTransaksiInput = document.getElementById('keterangan-transaksi');

    const confirmModal = document.getElementById('modal-konfirmasi-jurnal');
    const confirmTitleEl = document.getElementById('modal-konfirmasi-jurnal-title');
    const confirmDescEl = document.getElementById('modal-konfirmasi-jurnal-desc');
    const btnConfirmBatal = document.getElementById('btn-konfirmasi-jurnal-batal');
    const btnConfirmYa = document.getElementById('btn-konfirmasi-jurnal-ya');

    let allJurnalList = [];
    let coaLevel4List = [];
    let tutupBulanMap = new Map();
    let activePeriodKey = "";
    let pendingConfirmResolver = null;

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-notif');
        const toastMsg = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');

        if (!toast || !toastMsg) return;
        if (jurnalToastTimer) clearTimeout(jurnalToastTimer);

        toastMsg.textContent = message;
        if (toastIcon) {
            if (isError) {
                toastIcon.setAttribute('class', 'w-4 h-4 text-rose-500 flex-shrink-0');
                toastIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;
            } else {
                toastIcon.setAttribute('class', 'w-4 h-4 text-emerald-400 flex-shrink-0');
                toastIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
            }
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        jurnalToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function closeConfirmModal(result = false) {
        if (confirmModal) confirmModal.classList.add('hidden');
        if (typeof pendingConfirmResolver === "function") {
            const resolve = pendingConfirmResolver;
            pendingConfirmResolver = null;
            resolve(result);
        }
    }

    function askSmoothConfirm(title, message, confirmText = "Ya, Hapus") {
        if (!confirmModal || !btnConfirmYa || !btnConfirmBatal) return Promise.resolve(true);
        if (pendingConfirmResolver) closeConfirmModal(false);
        if (confirmTitleEl) confirmTitleEl.textContent = title;
        if (confirmDescEl) confirmDescEl.textContent = message;
        btnConfirmYa.textContent = confirmText;
        confirmModal.classList.remove('hidden');
        btnConfirmYa.focus();
        return new Promise((resolve) => {
            pendingConfirmResolver = resolve;
        });
    }

    const onConfirmYa = () => closeConfirmModal(true);
    const onConfirmBatal = () => closeConfirmModal(false);
    const onConfirmBackdrop = (e) => {
        if (confirmModal && e.target === confirmModal) closeConfirmModal(false);
    };

    if (btnConfirmYa) btnConfirmYa.addEventListener('click', onConfirmYa);
    if (btnConfirmBatal) btnConfirmBatal.addEventListener('click', onConfirmBatal);
    if (confirmModal) confirmModal.addEventListener('click', onConfirmBackdrop);

    function normalizePeriodKey(rawVal) {
        const s = String(rawVal || "").trim().toLowerCase();
        const isoMatch = s.match(/(\d{4})[-/](\d{1,2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}`;
        }

        const bulanMap = {
            januari: "01", jan: "01",
            februari: "02", feb: "02",
            maret: "03", mar: "03",
            april: "04", apr: "04",
            mei: "05",
            juni: "06", jun: "06",
            juli: "07", jul: "07",
            agustus: "08", agu: "08", ags: "08",
            september: "09", sep: "09", sept: "09",
            oktober: "10", okt: "10",
            november: "11", nov: "11",
            desember: "12", des: "12"
        };

        const yearMatch = s.match(/\b(20\d{2})\b/);
        for (const [namaBulan, mm] of Object.entries(bulanMap)) {
            if (new RegExp(`\\b${namaBulan}\\b`).test(s) && yearMatch) {
                return `${yearMatch[1]}-${mm}`;
            }
        }
        return "";
    }

    function extractDocPeriodKey(data = {}, docId = "") {
        const direct = normalizePeriodKey(
            data.periodKey ??
            data.periode ??
            data.bulanKey ??
            data.bulan_key ??
            data.bulanAktif ??
            data.bulan_aktif ??
            data.activePeriod ??
            data.active_period ??
            ""
        );
        if (direct) return direct;

        const yearVal = String(data.tahun ?? data.year ?? "").trim();
        const monthVal = String(data.bulan ?? data.month ?? data.namaBulan ?? "").trim();
        if (yearVal && monthVal) {
            const combined = normalizePeriodKey(`${yearVal}-${monthVal}`) || normalizePeriodKey(`${monthVal} ${yearVal}`);
            if (combined) return combined;
        }

        return normalizePeriodKey(docId);
    }

    function isDocClosed(data = {}) {
        if (data.isClosed === true || data.closed === true || data.terkunci === true || data.locked === true || Boolean(data.closedAt)) {
            return true;
        }
        if (data.aktif === false || data.isAktif === false || data.is_aktif === false || data.isActive === false || data.active === false) {
            return true;
        }
        const statusCandidate = String(
            data.status ?? data.statusPeriode ?? data.status_periode ?? data.statusBulan ?? data.status_bulan ?? data.state ?? ""
        )
            .trim()
            .toLowerCase();

        return (
            statusCandidate.includes("tutup") ||
            statusCandidate.includes("close") ||
            statusCandidate.includes("kunci") ||
            statusCandidate.includes("lock") ||
            statusCandidate.includes("selesai") ||
            statusCandidate === "nonaktif" ||
            statusCandidate === "tidak aktif"
        );
    }

    function isDocActive(data = {}) {
        if (isDocClosed(data)) return false;
        if (
            data.isActive === true ||
            data.active === true ||
            data.aktif === true ||
            data.isAktif === true ||
            data.is_aktif === true ||
            data.isCurrent === true ||
            data.current === true
        ) {
            return true;
        }
        const statusCandidate = String(
            data.status ?? data.statusPeriode ?? data.status_periode ?? data.statusBulan ?? data.status_bulan ?? data.state ?? ""
        )
            .trim()
            .toLowerCase();

        return (
            statusCandidate === "aktif" ||
            statusCandidate === "active" ||
            statusCandidate === "open" ||
            statusCandidate === "terbuka" ||
            statusCandidate === "berjalan"
        );
    }

    function detectPeriodFromHeaderDom() {
        const headerText = String(document.body?.innerText || "");
        const match = headerText.match(/Bulan\s+Aktif\s*:\s*([^\n]+)/i);
        if (!match) return "";
        return normalizePeriodKey(match[1]);
    }

    function getPeriodeStatus(tglIso) {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();
        const periodKey = normalizePeriodKey(tglIso);
        if (!periodKey) {
            return { isAllowed: false, reason: "invalid_date", periodKey: "", label: "" };
        }

        const docData = tutupBulanMap.get(periodKey);
        const label = docData && docData.namaBulan && docData.tahun
            ? `${docData.namaBulan} ${docData.tahun} (${periodKey})`
            : periodKey;

        if (docData && isDocClosed(docData)) {
            const statusText = String(
                docData.status ?? docData.statusPeriode ?? docData.statusBulan ?? "Ditutup"
            ).trim();
            return {
                isAllowed: false,
                reason: "closed",
                periodKey,
                label,
                statusText
            };
        }

        if (effectiveActivePeriod && periodKey !== effectiveActivePeriod) {
            return {
                isAllowed: false,
                reason: "not_active_month",
                periodKey,
                label,
                activePeriodKey: effectiveActivePeriod
            };
        }

        return {
            isAllowed: true,
            reason: "ok",
            periodKey,
            label
        };
    }

    function getPeriodeBlockMessage(info) {
        if (!info || info.isAllowed) return "";
        if (info.reason === "closed") {
            return `Periode ${info.label} berstatus "${info.statusText || "Ditutup"}". Jurnal tidak dapat disimpan.`;
        }
        if (info.reason === "not_active_month") {
            return `Tanggal ${tglTransaksiInput?.value || info.periodKey} di luar bulan aktif (${info.activePeriodKey}).`;
        }
        return "Tanggal transaksi tidak valid.";
    }

    function syncPeriodeValidationUI() {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();

        if (badgeBulanAktif) {
            if (effectiveActivePeriod) {
                badgeBulanAktif.textContent = `Bulan Aktif: ${effectiveActivePeriod}`;
                badgeBulanAktif.className = "px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
            } else {
                badgeBulanAktif.textContent = "Periode Terbuka";
                badgeBulanAktif.className = "px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
            }
        }

        if (periodeInfoEl) {
            periodeInfoEl.textContent = effectiveActivePeriod
                ? `Wajib Periode: ${effectiveActivePeriod}`
                : "";
        }

        const tglVal = tglTransaksiInput ? tglTransaksiInput.value : "";
        const info = getPeriodeStatus(tglVal);
        const blockMsg = getPeriodeBlockMessage(info);

        if (tglWarningEl) {
            if (!info.isAllowed) {
                tglWarningEl.textContent = blockMsg;
                tglWarningEl.classList.remove('hidden');
            } else {
                tglWarningEl.textContent = "";
                tglWarningEl.classList.add('hidden');
            }
        }

        if (tglTransaksiInput) {
            if (!info.isAllowed) {
                tglTransaksiInput.classList.remove('border-slate-300', 'dark:border-slate-700', 'focus:border-indigo-600');
                tglTransaksiInput.classList.add('border-rose-500', 'dark:border-rose-500', 'focus:border-rose-600');
            } else {
                tglTransaksiInput.classList.remove('border-rose-500', 'dark:border-rose-500', 'focus:border-rose-600');
                tglTransaksiInput.classList.add('border-slate-300', 'dark:border-slate-700', 'focus:border-indigo-600');
            }
        }

        return info.isAllowed;
    }

    async function loadTutupBulan() {
        try {
            const snap = await getDocs(collection(db, "tutup_bulan"));
            const nextMap = new Map();
            let detectedActive = "";
            let latestClosedNextPeriod = "";
            let latestClosedKey = "";

            snap.forEach((d) => {
                const data = d.data() || {};
                const key = extractDocPeriodKey(data, d.id);
                if (key) {
                    const entry = { id: d.id, ...data };
                    nextMap.set(key, entry);
                    if (!detectedActive && isDocActive(entry)) {
                        detectedActive = key;
                    }
                    if (isDocClosed(entry)) {
                        const nextKey = normalizePeriodKey(data.nextPeriodKey ?? data.next_period_key ?? "");
                        if (nextKey && (!latestClosedKey || key >= latestClosedKey)) {
                            latestClosedKey = key;
                            latestClosedNextPeriod = nextKey;
                        }
                    }
                }
            });

            if (!detectedActive && latestClosedNextPeriod && !nextMap.has(latestClosedNextPeriod)) {
                detectedActive = latestClosedNextPeriod;
            }

            if (!detectedActive) {
                for (const colName of ["pengaturan", "pengaturan_sistem"]) {
                    try {
                        const cfgSnap = await getDocs(collection(db, colName));
                        cfgSnap.forEach((d) => {
                            const data = d.data() || {};
                            const candidate = normalizePeriodKey(
                                data.bulanAktif ?? data.bulan_aktif ?? data.activePeriod ?? data.active_period ?? data.periodeAktif ?? data.periode ?? ""
                            );
                            if (!detectedActive && candidate) {
                                detectedActive = candidate;
                            }
                        });
                    } catch (_) {
                        // abaikan jika koleksi tidak ada
                    }
                    if (detectedActive) break;
                }
            }

            if (!detectedActive) {
                detectedActive = detectPeriodFromHeaderDom();
            }

            tutupBulanMap = nextMap;
            activePeriodKey = detectedActive;
            syncPeriodeValidationUI();
        } catch (err) {
            console.warn("Gagal memuat status tutup_bulan:", err);
            const fallbackDom = detectPeriodFromHeaderDom();
            if (fallbackDom) {
                activePeriodKey = fallbackDom;
                syncPeriodeValidationUI();
            }
        }
    }

    function formatRibuan(value) {
        if (!value && value !== 0) return "0";
        const numberString = value.toString().replace(/[^,\d]/g, "");
        const split = numberString.split(",");
        let sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            let separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }

        rupiah = split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
        return rupiah;
    }

    function parseNumber(value) {
        if (!value) return 0;
        return parseFloat(value.toString().replace(/\./g, "").replace(/,/g, ".")) || 0;
    }

    function generateNoReferensi() {
        if (editJurnalIdInput && editJurnalIdInput.value) return;

        if (!tglTransaksiInput || !unitUsahaSelect || !noRefInput) return;
        const tglVal = tglTransaksiInput.value;
        const unitVal = unitUsahaSelect.value;
        if (!tglVal || !unitVal) return;

        const match = unitVal.match(/\((\d+)\)/);
        const kodeUnit = match ? match[1] : "01";

        const dateObj = new Date(`${tglVal}T00:00:00`);
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yy = String(dateObj.getFullYear()).slice(-2);
        const mmyy = `${mm}${yy}`;

        const prefix = `JRU${kodeUnit}-${mmyy}-`;

        const existingCount = allJurnalList.filter(item => item.noRef && item.noRef.startsWith(prefix)).length;
        const nextNum = existingCount + 1;
        const noUrut = String(nextNum).padStart(4, '0');

        noRefInput.value = `${prefix}${noUrut}`;
    }

    if (tglTransaksiInput) {
        tglTransaksiInput.onchange = () => {
            generateNoReferensi();
            syncPeriodeValidationUI();
        };
        tglTransaksiInput.oninput = syncPeriodeValidationUI;
    }
    if (unitUsahaSelect) unitUsahaSelect.onchange = generateNoReferensi;

    async function loadCoaData() {
        try {
            const q = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const querySnapshot = await getDocs(q);
            coaLevel4List = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (String(data.levelAkun) === "4" || data.tipeAkun === "Detail") {
                    coaLevel4List.push(data);
                }
            });
        } catch (err) {
            console.error("Gagal memuat COA untuk jurnal:", err);
        }
    }

    function tambahBarisJurnal(akunSelected = "", debet = 0, kredit = 0) {
        if (!jurnalRowsContainer) return;
        const rowIdx = jurnalRowsContainer.children.length + 1;
        const tr = document.createElement('tr');
        tr.className = "jurnal-row";

        let optionsHtml = '<option value="">-- Pilih Akun --</option>';
        coaLevel4List.forEach(coa => {
            const selected = coa.kodeAkun === akunSelected ? 'selected' : '';
            optionsHtml += `<option value="${escapeHtml(coa.kodeAkun)}" ${selected}>${escapeHtml(coa.kodeAkun)} - ${escapeHtml(coa.namaAkun)}</option>`;
        });

        const formattedDebet = formatRibuan(debet);
        const formattedKredit = formatRibuan(kredit);

        tr.innerHTML = `
            <td class="py-2.5 px-3 text-center font-bold text-slate-500 row-number">${rowIdx}</td>
            <td class="py-2.5 px-3">
                <select class="row-akun w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none focus:outline-none focus:border-indigo-600">
                    ${optionsHtml}
                </select>
            </td>
            <td class="py-2.5 px-3 text-right">
                <input type="text" value="${escapeHtml(formattedDebet)}" class="row-debet w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none text-right focus:outline-none focus:border-indigo-600 font-bold">
            </td>
            <td class="py-2.5 px-3 text-right">
                <input type="text" value="${escapeHtml(formattedKredit)}" class="row-kredit w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none text-right focus:outline-none focus:border-indigo-600 font-bold">
            </td>
            <td class="py-2.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1">
                    <button type="button" class="btn-tambah-baris p-1 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer" title="Tambah Baris">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </button>
                    <button type="button" class="btn-hapus-baris p-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition cursor-pointer" title="Hapus Baris">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </td>
        `;

        jurnalRowsContainer.appendChild(tr);
        attachRowEvents(tr);
        hitungTotalJurnal();
    }

    function attachRowEvents(trEl) {
        const debetInput = trEl.querySelector('.row-debet');
        const kreditInput = trEl.querySelector('.row-kredit');
        const btnPlus = trEl.querySelector('.btn-tambah-baris');
        const btnTrash = trEl.querySelector('.btn-hapus-baris');

        debetInput.oninput = (e) => {
            const rawVal = parseNumber(e.target.value);
            e.target.value = formatRibuan(rawVal);
            if (rawVal > 0) {
                kreditInput.value = "0";
            }
            hitungTotalJurnal();
        };

        kreditInput.oninput = (e) => {
            const rawVal = parseNumber(e.target.value);
            e.target.value = formatRibuan(rawVal);
            if (rawVal > 0) {
                debetInput.value = "0";
            }
            hitungTotalJurnal();
        };

        btnPlus.onclick = () => {
            tambahBarisJurnal();
        };

        btnTrash.onclick = () => {
            if (jurnalRowsContainer.children.length > 2) {
                trEl.remove();
                reorderRows();
                hitungTotalJurnal();
            } else {
                showToast("Minimal harus ada 2 baris rincian jurnal!", true);
            }
        };
    }

    function reorderRows() {
        const rows = jurnalRowsContainer.querySelectorAll('.jurnal-row');
        rows.forEach((row, idx) => {
            row.querySelector('.row-number').textContent = idx + 1;
        });
    }

    function hitungTotalJurnal() {
        let totalDebet = 0;
        let totalKredit = 0;

        const rows = jurnalRowsContainer.querySelectorAll('.jurnal-row');
        rows.forEach(row => {
            const debet = parseNumber(row.querySelector('.row-debet').value);
            const kredit = parseNumber(row.querySelector('.row-kredit').value);
            totalDebet += debet;
            totalKredit += kredit;
        });

        document.getElementById('total-debet-view').textContent = `Rp ${totalDebet.toLocaleString('id-ID')}`;
        document.getElementById('total-kredit-view').textContent = `Rp ${totalKredit.toLocaleString('id-ID')}`;

        const badge = document.getElementById('status-balance-badge');
        if (totalDebet > 0 && totalDebet === totalKredit) {
            badge.textContent = "Balance";
            badge.className = "px-3 py-1 text-[11px] font-bold uppercase rounded-none bg-emerald-600 text-white";
        } else {
            badge.textContent = "Belum Balance";
            badge.className = "px-3 py-1 text-[11px] font-bold uppercase rounded-none bg-rose-500 text-white";
        }
    }

    const toggleModal = async (show, isEdit = false) => {
        if (modal) {
            if (show) {
                await loadTutupBulan();
                modal.classList.remove('hidden');
                if (!isEdit) {
                    resetFormBaru();
                } else {
                    syncPeriodeValidationUI();
                }
            } else {
                modal.classList.add('hidden');
                resetFormBaru();
            }
        }
    };

    function resetFormBaru() {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();
        if (editJurnalIdInput) editJurnalIdInput.value = "";
        if (modalTitle) modalTitle.textContent = "Form Input Jurnal Umum Baru";
        if (tglTransaksiInput) {
            const todayIso = new Date().toISOString().split('T')[0];
            tglTransaksiInput.value = effectiveActivePeriod ? `${effectiveActivePeriod}-01` : todayIso;
        }
        if (unitUsahaSelect) {
            unitUsahaSelect.value = "KANTOR PUSAT (01)";
        }
        if (keteranganTransaksiInput) {
            keteranganTransaksiInput.value = "";
        }
        generateNoReferensi();
        if (jurnalRowsContainer) {
            jurnalRowsContainer.innerHTML = "";
            tambahBarisJurnal();
            tambahBarisJurnal();
        }
        syncPeriodeValidationUI();
    }

    if (btnBuka) btnBuka.onclick = () => toggleModal(true, false);
    if (btnTutup) btnTutup.onclick = () => toggleModal(false, false);

    if (btnBatal) {
        btnBatal.onclick = async (e) => {
            e.preventDefault();
            await loadTutupBulan();
            resetFormBaru();
            showToast("Form berhasil direset.");
        };
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (confirmModal && !confirmModal.classList.contains('hidden')) {
                closeConfirmModal(false);
                return;
            }
            if (modal && !modal.classList.contains('hidden')) {
                toggleModal(false, false);
            }
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    function renderJurnalData() {
        if (!tableBody || !cardBody) return;

        const keyword = filterKeyword ? filterKeyword.value.toLowerCase() : "";
        const unit = filterUnit ? filterUnit.value : "";
        const tglMulai = filterTglMulai ? filterTglMulai.value : "";
        const tglSampai = filterTglSampai ? filterTglSampai.value : "";

        const jurnalUmumOnly = allJurnalList.filter(isJurnalUmumType);

        let filtered = jurnalUmumOnly.filter(item => {
            const matchKeyword = (item.noRef && item.noRef.toLowerCase().includes(keyword)) ||
                                 (item.keterangan && item.keterangan.toLowerCase().includes(keyword)) ||
                                 (item.rincian && item.rincian.some(r => String(r.namaAkun || "").toLowerCase().includes(keyword)));
            const matchUnit = unit === "" || item.unitUsaha === unit;

            let matchTanggal = true;
            if (item.tglTransaksi) {
                if (tglMulai && item.tglTransaksi < tglMulai) matchTanggal = false;
                if (tglSampai && item.tglTransaksi > tglSampai) matchTanggal = false;
            }

            return matchKeyword && matchUnit && matchTanggal;
        });

        if (totalJurnalEl) totalJurnalEl.textContent = `Total: ${filtered.length} Transaksi`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi jurnal umum (${JURNAL_TYPE}).</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Belum ada data transaksi jurnal umum (${JURNAL_TYPE}).</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        filtered.forEach(item => {
            let rincianHtml = "";
            let totalNilai = 0;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    totalNilai += parseFloat(r.debet) || 0;
                    const kodeAkun = escapeHtml(r.kodeAkun || "");
                    const namaAkun = escapeHtml(r.namaAkun || "");
                    const debetFmt = (parseFloat(r.debet) || 0).toLocaleString('id-ID');
                    const kreditFmt = (parseFloat(r.kredit) || 0).toLocaleString('id-ID');
                    rincianHtml += `<div class="text-[11px] text-slate-600 dark:text-slate-400">&bull; <span class="font-bold">${kodeAkun}</span> - ${namaAkun}: <span class="text-indigo-600 font-semibold">D: Rp ${debetFmt}</span> | <span class="text-purple-600 font-semibold">K: Rp ${kreditFmt}</span></div>`;
                });
            }

            const ketUraian = escapeHtml(item.keterangan || '-');
            const safeId = escapeHtml(item.id);
            const safeTgl = escapeHtml(item.tglTransaksi || '-');
            const safeRef = escapeHtml(item.noRef || '-');
            const safeUnit = escapeHtml(item.unitUsaha || '-');

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition align-top">
                    <td class="py-3 px-4 font-medium">${safeTgl}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${safeRef}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${safeUnit}</span></td>
                    <td class="py-3 px-4 space-y-1.5">
                        <div class="font-bold text-slate-800 dark:text-slate-200">${ketUraian}</div>
                        <div class="space-y-0.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-2">${rincianHtml}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">Rp ${totalNilai.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button type="button" data-edit-id="${safeId}" class="btn-edit-jurnal px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button type="button" data-delete-id="${safeId}" class="btn-delete-jurnal px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${safeRef}</span>
                        <span class="text-[11px] text-slate-500">${safeTgl}</span>
                    </div>
                    <div>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${safeUnit}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">Ket: ${ketUraian}</div>
                    <div class="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800">
                        ${rincianHtml}
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="font-bold text-slate-800 dark:text-slate-100">Total: Rp ${totalNilai.toLocaleString('id-ID')}</span>
                        <div class="flex items-center gap-1">
                            <button type="button" data-edit-id="${safeId}" class="btn-edit-jurnal px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button type="button" data-delete-id="${safeId}" class="btn-delete-jurnal px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;

        document.querySelectorAll('.btn-edit-jurnal').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-edit-id');
                const jurnalData = allJurnalList.find(j => j.id === id);
                if (!jurnalData) return;

                if (editJurnalIdInput) editJurnalIdInput.value = jurnalData.id;
                if (modalTitle) modalTitle.textContent = `Edit Jurnal (${jurnalData.noRef})`;
                if (tglTransaksiInput) tglTransaksiInput.value = jurnalData.tglTransaksi || '';
                if (unitUsahaSelect) unitUsahaSelect.value = jurnalData.unitUsaha || 'KANTOR PUSAT (01)';
                if (noRefInput) noRefInput.value = jurnalData.noRef || '';
                if (keteranganTransaksiInput) keteranganTransaksiInput.value = jurnalData.keterangan || '';

                if (jurnalRowsContainer) {
                    jurnalRowsContainer.innerHTML = "";
                    if (jurnalData.rincian && jurnalData.rincian.length > 0) {
                        jurnalData.rincian.forEach(r => {
                            tambahBarisJurnal(r.kodeAkun, r.debet || 0, r.kredit || 0);
                        });
                    } else {
                        tambahBarisJurnal();
                        tambahBarisJurnal();
                    }
                }

                await toggleModal(true, true);
            };
        });

        document.querySelectorAll('.btn-delete-jurnal').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-id');
                if (!id) return;
                const jurnalData = allJurnalList.find(j => j.id === id);
                const refLabel = jurnalData?.noRef ? ` (${jurnalData.noRef})` : "";

                const ok = await askSmoothConfirm(
                    "Konfirmasi Hapus Jurnal",
                    `Apakah Anda yakin ingin menghapus transaksi jurnal${refLabel} ini?`,
                    "Ya, Hapus"
                );
                if (!ok) return;

                try {
                    await deleteDoc(doc(db, "jurnal_umum", id));
                    showToast("Transaksi jurnal berhasil dihapus!");
                    await loadJurnalData();
                } catch (err) {
                    console.error("Gagal menghapus jurnal:", err);
                    showToast("Gagal menghapus transaksi.", true);
                }
            };
        });
    }

    if (filterKeyword) filterKeyword.oninput = renderJurnalData;
    if (filterUnit) filterUnit.onchange = renderJurnalData;
    if (filterTglMulai) filterTglMulai.onchange = renderJurnalData;
    if (filterTglSampai) filterTglSampai.onchange = renderJurnalData;
    if (btnResetFilter) {
        btnResetFilter.onclick = () => {
            if (filterKeyword) filterKeyword.value = "";
            if (filterUnit) filterUnit.value = "";
            if (filterTglMulai) filterTglMulai.value = "";
            if (filterTglSampai) filterTglSampai.value = "";
            renderJurnalData();
        };
    }

    async function loadJurnalData() {
        if (!tableBody || !cardBody) return;
        try {
            const q = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const querySnapshot = await getDocs(q);
            allJurnalList = [];
            querySnapshot.forEach((docSnap) => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });
            renderJurnalData();
        } catch (err) {
            console.error("Gagal memuat jurnal umum:", err);
            tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();

            await loadTutupBulan();

            const tglVal = String(tglTransaksiInput?.value || "").trim();
            const periodeInfo = getPeriodeStatus(tglVal);
            if (!periodeInfo.isAllowed) {
                syncPeriodeValidationUI();
                showToast(`Tidak bisa simpan: ${getPeriodeBlockMessage(periodeInfo)}`, true);
                tglTransaksiInput?.focus();
                return;
            }

            const keteranganVal = keteranganTransaksiInput ? keteranganTransaksiInput.value.trim() : "";
            if (!keteranganVal) {
                showToast("Keterangan transaksi wajib diisi!", true);
                return;
            }

            let totalDebet = 0;
            let totalKredit = 0;
            let rincianArray = [];
            let isValid = true;

            const rows = jurnalRowsContainer.querySelectorAll('.jurnal-row');
            rows.forEach(row => {
                const selectAkun = row.querySelector('.row-akun');
                const kodeAkun = selectAkun.value;
                if (!kodeAkun) {
                    isValid = false;
                }

                const selectedOption = selectAkun.options[selectAkun.selectedIndex];
                const parts = selectedOption ? selectedOption.text.split(' - ') : [];
                const namaAkun = parts.slice(1).join(' - ') || '';
                const debet = parseNumber(row.querySelector('.row-debet').value);
                const kredit = parseNumber(row.querySelector('.row-kredit').value);

                totalDebet += debet;
                totalKredit += kredit;

                rincianArray.push({
                    kodeAkun,
                    namaAkun,
                    debet,
                    kredit
                });
            });

            if (!isValid) {
                showToast("Semua baris rincian harus memilih Akun Perkiraan!", true);
                return;
            }

            if (totalDebet === 0 || totalDebet !== totalKredit) {
                showToast("Transaksi belum Balance! Total Debet dan Kredit harus sama dan lebih besar dari 0.", true);
                return;
            }

            if (btnSimpan) {
                btnSimpan.disabled = true;
                btnSimpan.textContent = "Menyimpan...";
            }

            const editId = editJurnalIdInput ? editJurnalIdInput.value : "";
            if (!editId) {
                generateNoReferensi();
            }

            const jurnalPayload = {
                type: JURNAL_TYPE,
                jenisTransaksi: JURNAL_TYPE,
                tglTransaksi: tglVal,
                periode: periodeInfo.periodKey,
                noRef: document.getElementById('no-ref').value,
                unitUsaha: document.getElementById('unit-usaha').value,
                keterangan: keteranganVal,
                rincian: rincianArray,
                totalNilai: totalDebet,
                updatedAt: new Date().toISOString()
            };

            try {
                if (editId) {
                    await updateDoc(doc(db, "jurnal_umum", editId), jurnalPayload);
                    showToast("Perubahan jurnal berhasil disimpan!");
                } else {
                    jurnalPayload.createdAt = new Date().toISOString();
                    await addDoc(collection(db, "jurnal_umum"), jurnalPayload);
                    showToast("Jurnal umum baru berhasil disimpan!");
                }

                await loadJurnalData();
                resetFormBaru();
            } catch (err) {
                console.error("Gagal menyimpan jurnal:", err);
                showToast("Terjadi kesalahan saat menyimpan transaksi.", true);
            } finally {
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = "Simpan Jurnal";
                }
            }
        };
    }

    const cleanup = () => {
        if (pendingConfirmResolver) closeConfirmModal(false);
        if (btnConfirmYa) btnConfirmYa.removeEventListener('click', onConfirmYa);
        if (btnConfirmBatal) btnConfirmBatal.removeEventListener('click', onConfirmBatal);
        if (confirmModal) confirmModal.removeEventListener('click', onConfirmBackdrop);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('hashchange', cleanup);
        jurnalCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    jurnalCleanup = cleanup;

    await Promise.all([loadTutupBulan(), loadCoaData(), loadJurnalData()]);
    resetFormBaru();

    return cleanup;
}