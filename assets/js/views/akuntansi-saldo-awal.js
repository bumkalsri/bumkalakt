// File: assets/js/views/akuntansi-saldo-awal.js
import { collection, getDocs, getDoc, doc, setDoc, writeBatch, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const PAGE_SIZE = 10;
const DEFAULT_UNIT = "KANTOR PUSAT (01)";

function parseDigitsToNumber(val) {
    const cleaned = String(val ?? "").replace(/\D/g, "");
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatRibuanInput(val) {
    const num = parseDigitsToNumber(val);
    return num > 0 ? num.toLocaleString("id-ID") : "0";
}

function cloneSaldoMap(src = {}) {
    const copy = {};
    Object.keys(src).forEach((kode) => {
        const item = src[kode] || {};
        copy[kode] = {
            debit: Number(item.debit || 0),
            kredit: Number(item.kredit || 0)
        };
    });
    return copy;
}

function unitSlug(unitName) {
    return String(unitName || DEFAULT_UNIT)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "kantor_pusat_01";
}

export function renderSaldoAwal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    <a href="#/akuntansi" data-link title="Kembali ke Akuntansi" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Saldo Awal</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Input dan kelola saldo awal akun perkiraan Neraca (COA) per periode &amp; unit. Tekan Enter untuk pindah kolom/baris.</p>
                        <p id="badge-periode-awal-aktif" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">Periode Awal Transaksi: Belum diatur</p>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto flex-wrap lg:flex-nowrap shrink-0">
                    <button type="button" id="btn-buka-pop-periode-awal" class="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold px-3 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span>Atur Periode Awal</span>
                    </button>
                    <button type="button" id="btn-reset-batal-saldo" class="w-full sm:w-auto bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span>Reset (Batal)</span>
                    </button>
                    <button type="button" id="btn-hapus-semua-saldo" class="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2.5 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        <span>Hapus Semua</span>
                    </button>
                    <button type="button" id="btn-simpan-semua-saldo" class="w-full sm:w-auto bg-[#581c87] hover:bg-purple-900 text-white text-xs font-semibold px-3.5 py-2.5 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        <span>Simpan Saldo Awal</span>
                    </button>
                </div>
            </div>

            <!-- Filter & Ringkasan Keseimbangan -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <div>
                    <label for="filter-periode-saldo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PERIODE</label>
                    <input type="month" id="filter-periode-saldo" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label for="filter-unit-saldo" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PILIH UNIT</label>
                    <select id="filter-unit-saldo" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label for="filter-cari-akun" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CARI KODE / NAMA AKUN</label>
                    <input type="text" id="filter-cari-akun" placeholder="Ketik kode atau nama akun..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-center rounded-none">
                    <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Debit</span>
                    <span id="total-debit-saldo" class="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Rp 0</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-center rounded-none">
                    <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Kredit &amp; Selisih</span>
                    <span id="total-kredit-saldo" class="text-sm font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">Rp 0</span>
                    <span id="selisih-saldo" class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Selisih: Rp 0 (Seimbang)</span>
                </div>
            </div>

            <!-- Tabel & Card Saldo Awal -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Saldo Awal Akun (Neraca)</h3>
                    <span id="info-jumlah-akun-saldo" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">Kode Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Nama Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Saldo Normal</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Debit (Rp)</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Kredit (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-saldo-awal-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="5" class="py-6 text-center text-slate-400">Memuat data akun perkiraan...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile / HP -->
                <div id="card-saldo-awal-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data akun perkiraan...</div>
                </div>

                <!-- Kontrol Paginasi (10 Akun / Halaman) -->
                <div id="pagination-saldo-awal" class="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span id="info-halaman-saldo" class="text-[11px] text-slate-500 dark:text-slate-400">Halaman 1 dari 1 (Maks. 10 akun/halaman)</span>
                    <div id="kontrol-halaman-saldo" class="flex items-center gap-1 flex-wrap justify-center"></div>
                </div>
            </div>

            <!-- Modal Konfirmasi Smooth (Kotak Siku) -->
            <div id="modal-konfirmasi-saldo" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/0 backdrop-blur-[1px] p-4 opacity-0 transition-opacity duration-200 ease-out">
                <div id="modal-konfirmasi-card" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-none w-full max-w-md overflow-hidden transform scale-95 opacity-0 transition-all duration-200 ease-out">
                    <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                        <div class="flex items-center gap-2.5">
                            <span class="w-7 h-7 bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center rounded-none flex-shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>
                            </span>
                            <h2 id="konfirmasi-saldo-judul" class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Konfirmasi Hapus Data</h2>
                        </div>
                        <button type="button" id="btn-tutup-konfirmasi-saldo" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition cursor-pointer" title="Tutup">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="p-5 space-y-4 text-xs">
                        <p id="konfirmasi-saldo-pesan" class="text-slate-600 dark:text-slate-300 leading-relaxed">Apakah Anda yakin ingin menghapus data saldo awal ini?</p>
                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" id="btn-batal-konfirmasi-saldo" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none transition cursor-pointer">Batal</button>
                            <button type="button" id="btn-ya-konfirmasi-saldo" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none transition cursor-pointer shadow-sm">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal / Pop-up Periode Awal Penggunaan Aplikasi -->
            <div id="modal-periode-awal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/60 p-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-none w-full max-w-md overflow-hidden">
                    <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                        <div>
                            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Periode Awal Penggunaan Aplikasi</h2>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Menjadi dasar awal mulai pencatatan transaksi sistem.</p>
                        </div>
                        <button type="button" id="btn-tutup-pop-periode-awal" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer" title="Tutup">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <form id="form-periode-awal" class="p-5 space-y-4 text-xs">
                        <div>
                            <label for="input-periode-awal-bulan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PERIODE AWAL (BULAN / TAHUN) *</label>
                            <input type="month" id="input-periode-awal-bulan" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label for="input-tanggal-mulai-transaksi" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL DASAR MULAI TRANSAKSI *</label>
                            <input type="date" id="input-tanggal-mulai-transaksi" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label for="input-catatan-periode-awal" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / CATATAN</label>
                            <input type="text" id="input-catatan-periode-awal" placeholder="Contoh: Awal operasional pembukuan BUMKal" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" id="btn-batal-pop-periode-awal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none transition cursor-pointer">Batal</button>
                            <button type="submit" id="btn-simpan-pop-periode-awal" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none transition cursor-pointer shadow-sm">Tetapkan Periode Awal</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-saldo" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-saldo-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-saldo-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let toastTimer = null;
let saldoAwalCleanup = null;

export async function initSaldoAwalHandler() {
    if (typeof saldoAwalCleanup === "function") {
        saldoAwalCleanup();
        saldoAwalCleanup = null;
    }

    const periodeInput = document.getElementById('filter-periode-saldo');
    const unitInput = document.getElementById('filter-unit-saldo');
    const cariInput = document.getElementById('filter-cari-akun');
    const btnResetBatal = document.getElementById('btn-reset-batal-saldo');
    const btnHapusSemua = document.getElementById('btn-hapus-semua-saldo');
    const btnSimpanSemua = document.getElementById('btn-simpan-semua-saldo');
    const tableBody = document.getElementById('table-saldo-awal-body');
    const cardBody = document.getElementById('card-saldo-awal-body');
    const infoJumlah = document.getElementById('info-jumlah-akun-saldo');
    const infoHalaman = document.getElementById('info-halaman-saldo');
    const kontrolHalaman = document.getElementById('kontrol-halaman-saldo');
    const totalDebitEl = document.getElementById('total-debit-saldo');
    const totalKreditEl = document.getElementById('total-kredit-saldo');
    const selisihEl = document.getElementById('selisih-saldo');

    const modalKonfirmasi = document.getElementById('modal-konfirmasi-saldo');
    const modalKonfirmasiCard = document.getElementById('modal-konfirmasi-card');
    const konfirmasiJudul = document.getElementById('konfirmasi-saldo-judul');
    const konfirmasiPesan = document.getElementById('konfirmasi-saldo-pesan');
    const btnTutupKonfirmasi = document.getElementById('btn-tutup-konfirmasi-saldo');
    const btnBatalKonfirmasi = document.getElementById('btn-batal-konfirmasi-saldo');
    const btnYaKonfirmasi = document.getElementById('btn-ya-konfirmasi-saldo');

    const badgePeriodeAwal = document.getElementById('badge-periode-awal-aktif');
    const btnBukaPopPeriode = document.getElementById('btn-buka-pop-periode-awal');
    const btnTutupPopPeriode = document.getElementById('btn-tutup-pop-periode-awal');
    const btnBatalPopPeriode = document.getElementById('btn-batal-pop-periode-awal');
    const modalPeriodeAwal = document.getElementById('modal-periode-awal');
    const formPeriodeAwal = document.getElementById('form-periode-awal');
    const inputPeriodeAwalBulan = document.getElementById('input-periode-awal-bulan');
    const inputTanggalMulaiTransaksi = document.getElementById('input-tanggal-mulai-transaksi');
    const inputCatatanPeriodeAwal = document.getElementById('input-catatan-periode-awal');
    const btnSimpanPopPeriode = document.getElementById('btn-simpan-pop-periode-awal');

    const now = new Date();
    const defaultPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const defaultTanggal = `${defaultPeriode}-01`;

    let akunList = [];
    let saldoMap = {};
    let savedSaldoMap = {};
    let existingDocIds = new Set();
    let currentPage = 1;
    let confirmResolver = null;
    let confirmCloseTimer = null;
    let pendingFocusTarget = null;
    let periodeAwalConfig = {
        periodeAwal: defaultPeriode,
        tanggalMulaiTransaksi: defaultTanggal,
        catatan: ""
    };

    function getVisibleInputsInContainer() {
        const isDesktop = window.innerWidth >= 768;
        const container = isDesktop ? tableBody : cardBody;
        if (!container) return [];
        return Array.from(container.querySelectorAll('.input-saldo')).filter((el) => el.offsetParent !== null);
    }

    function applyPendingFocus() {
        if (!pendingFocusTarget) return;
        const { kode, field } = pendingFocusTarget;
        pendingFocusTarget = null;

        requestAnimationFrame(() => {
            const inputs = getVisibleInputsInContainer();
            const target = inputs.find(
                (el) => el.getAttribute('data-kode') === kode && el.getAttribute('data-field') === field
            );
            if (target) {
                target.focus();
                target.select();
            }
        });
    }

    function moveTabOnEnter(currentInput) {
        const inputs = getVisibleInputsInContainer();
        if (inputs.length === 0) return;

        const currentIndex = inputs.indexOf(currentInput);
        if (currentIndex !== -1 && currentIndex + 1 < inputs.length) {
            const nextEl = inputs[currentIndex + 1];
            nextEl.focus();
            nextEl.select();
            return;
        }

        const keyword = (cariInput ? cariInput.value : "").trim().toLowerCase();
        const filtered = akunList.filter((acc) => {
            if (!keyword) return true;
            const kode = (acc.kodeAkun || "").toLowerCase();
            const nama = (acc.namaAkun || "").toLowerCase();
            return kode.includes(keyword) || nama.includes(keyword);
        });
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            const firstItemNextPage = filtered[(nextPage - 1) * PAGE_SIZE];
            if (firstItemNextPage) {
                pendingFocusTarget = { kode: firstItemNextPage.kodeAkun, field: "debit" };
                currentPage = nextPage;
                renderRows();
            }
        }
    }

    function finishConfirm(result) {
        if (!modalKonfirmasi || !modalKonfirmasiCard) {
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
        modalKonfirmasiCard.classList.remove('scale-100', 'opacity-100');
        modalKonfirmasiCard.classList.add('scale-95', 'opacity-0');

        const resolve = confirmResolver;
        confirmResolver = null;

        confirmCloseTimer = setTimeout(() => {
            modalKonfirmasi.classList.add('hidden');
            modalKonfirmasi.classList.remove('flex');
            if (resolve) resolve(result);
        }, 200);
    }

    function openConfirmModal({ judul = "Konfirmasi Hapus Data", pesan = "Apakah Anda yakin?", labelYa = "Ya, Hapus" } = {}) {
        if (!modalKonfirmasi || !modalKonfirmasiCard) {
            return Promise.resolve(false);
        }

        if (confirmResolver) {
            const prevResolve = confirmResolver;
            confirmResolver = null;
            prevResolve(false);
        }

        if (confirmCloseTimer) clearTimeout(confirmCloseTimer);

        if (konfirmasiJudul) konfirmasiJudul.textContent = judul;
        if (konfirmasiPesan) konfirmasiPesan.textContent = pesan;
        if (btnYaKonfirmasi) btnYaKonfirmasi.textContent = labelYa;

        modalKonfirmasi.classList.remove('hidden');
        modalKonfirmasi.classList.add('flex');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modalKonfirmasi.classList.remove('bg-slate-950/0', 'opacity-0');
                modalKonfirmasi.classList.add('bg-slate-950/60', 'opacity-100');
                modalKonfirmasiCard.classList.remove('scale-95', 'opacity-0');
                modalKonfirmasiCard.classList.add('scale-100', 'opacity-100');
            });
        });

        return new Promise((resolve) => {
            confirmResolver = resolve;
        });
    }

    if (btnYaKonfirmasi) btnYaKonfirmasi.onclick = () => finishConfirm(true);
    if (btnBatalKonfirmasi) btnBatalKonfirmasi.onclick = () => finishConfirm(false);
    if (btnTutupKonfirmasi) btnTutupKonfirmasi.onclick = () => finishConfirm(false);
    if (modalKonfirmasi) {
        modalKonfirmasi.onclick = (e) => {
            if (e.target === modalKonfirmasi) {
                finishConfirm(false);
            }
        };
    }

    const onKeyDownEscape = (e) => {
        if (e.key === "Escape" && confirmResolver) {
            finishConfirm(false);
        }
    };
    window.addEventListener('keydown', onKeyDownEscape);

    function getSelectedUnit() {
        return (unitInput && unitInput.value) ? unitInput.value : DEFAULT_UNIT;
    }

    function getDocId(periode, unitUsaha, kodeAkun) {
        return `${periode}_${unitSlug(unitUsaha)}_${String(kodeAkun).replace(/\./g, '_')}`;
    }

    function formatRupiah(num) {
        return "Rp " + Number(num || 0).toLocaleString('id-ID');
    }

    function updatePeriodeAwalBadge() {
        if (!badgePeriodeAwal) return;
        const pLabel = periodeAwalConfig.periodeAwal || defaultPeriode;
        const tglLabel = periodeAwalConfig.tanggalMulaiTransaksi ? ` (Mulai: ${periodeAwalConfig.tanggalMulaiTransaksi})` : "";
        badgePeriodeAwal.textContent = `Periode Awal Transaksi: ${pLabel}${tglLabel}`;
    }

    function openPeriodeAwalModal() {
        if (inputPeriodeAwalBulan) {
            inputPeriodeAwalBulan.value = periodeAwalConfig.periodeAwal || (periodeInput && periodeInput.value) || defaultPeriode;
        }
        if (inputTanggalMulaiTransaksi) {
            const pVal = (inputPeriodeAwalBulan && inputPeriodeAwalBulan.value) || defaultPeriode;
            inputTanggalMulaiTransaksi.value = periodeAwalConfig.tanggalMulaiTransaksi || `${pVal}-01`;
        }
        if (inputCatatanPeriodeAwal) {
            inputCatatanPeriodeAwal.value = periodeAwalConfig.catatan || "";
        }
        if (modalPeriodeAwal) {
            modalPeriodeAwal.classList.remove('hidden');
            modalPeriodeAwal.classList.add('flex');
        }
    }

    function closePeriodeAwalModal() {
        if (modalPeriodeAwal) {
            modalPeriodeAwal.classList.add('hidden');
            modalPeriodeAwal.classList.remove('flex');
        }
    }

    async function loadPeriodeAwalConfig() {
        try {
            const snap = await getDoc(doc(db, "pengaturan_sistem", "periode_awal_aplikasi"));
            if (snap.exists()) {
                const d = snap.data();
                periodeAwalConfig = {
                    periodeAwal: d.periodeAwal || defaultPeriode,
                    tanggalMulaiTransaksi: d.tanggalMulaiTransaksi || `${d.periodeAwal || defaultPeriode}-01`,
                    catatan: d.catatan || ""
                };
                localStorage.setItem("bumkal_periode_awal", periodeAwalConfig.periodeAwal);
                localStorage.setItem("bumkal_tanggal_mulai_transaksi", periodeAwalConfig.tanggalMulaiTransaksi);
            } else {
                const savedPeriode = localStorage.getItem("bumkal_periode_awal");
                if (savedPeriode) {
                    periodeAwalConfig.periodeAwal = savedPeriode;
                    periodeAwalConfig.tanggalMulaiTransaksi = localStorage.getItem("bumkal_tanggal_mulai_transaksi") || `${savedPeriode}-01`;
                }
            }
        } catch (err) {
            console.warn("Gagal memuat konfigurasi periode awal:", err);
        }

        if (periodeInput && !periodeInput.value) {
            periodeInput.value = periodeAwalConfig.periodeAwal || defaultPeriode;
        }
        updatePeriodeAwalBadge();
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-saldo');
        const msgEl = document.getElementById('toast-saldo-message');
        const iconEl = document.getElementById('toast-saldo-icon');
        if (!toast || !msgEl) return;

        if (toastTimer) clearTimeout(toastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        toastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function hitungRingkasan() {
        let totalDebit = 0;
        let totalKredit = 0;

        akunList.forEach(acc => {
            const s = saldoMap[acc.kodeAkun] || { debit: 0, kredit: 0 };
            totalDebit += Number(s.debit || 0);
            totalKredit += Number(s.kredit || 0);
        });

        const selisih = Math.abs(totalDebit - totalKredit);
        if (totalDebitEl) totalDebitEl.textContent = formatRupiah(totalDebit);
        if (totalKreditEl) totalKreditEl.textContent = formatRupiah(totalKredit);
        if (selisihEl) {
            selisihEl.textContent = selisih === 0
                ? "Selisih: Rp 0 (Seimbang)"
                : `Selisih: ${formatRupiah(selisih)} (Belum Seimbang)`;
            selisihEl.className = selisih === 0
                ? "text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5"
                : "text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5";
        }
    }

    function buildPayload(periode, unitUsaha, acc, s, nowIso, isUpdate) {
        const payload = {
            periode,
            unitUsaha,
            kodeAkun: acc.kodeAkun,
            namaAkun: acc.namaAkun || "",
            saldoNormal: acc.saldoNormal || "",
            reportGroup: "Neraca",
            debit: Number(s.debit || 0),
            kredit: Number(s.kredit || 0),
            updatedAt: nowIso,
            lastUpdatedAt: nowIso
        };
        if (!isUpdate) {
            payload.createdAt = nowIso;
        }
        return payload;
    }

    function renderPagination(totalItems, totalPages, startIdx, endIdx) {
        if (!infoHalaman || !kontrolHalaman) return;

        if (totalItems === 0) {
            infoHalaman.textContent = "Halaman 0 dari 0 (Maks. 10 akun/halaman)";
            kontrolHalaman.innerHTML = "";
            return;
        }

        infoHalaman.textContent = `Menampilkan ${startIdx + 1}–${endIdx} dari ${totalItems} akun (Halaman ${currentPage} dari ${totalPages} • 10 akun/halaman)`;

        let btns = `
            <button type="button" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""} class="btn-page-saldo px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition cursor-pointer">Sebelumnya</button>
        `;

        for (let p = 1; p <= totalPages; p++) {
            const activeClass = p === currentPage
                ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800";
            btns += `<button type="button" data-page="${p}" class="btn-page-saldo px-2.5 py-1 border ${activeClass} rounded-none transition cursor-pointer">${p}</button>`;
        }

        btns += `
            <button type="button" data-page="${currentPage + 1}" ${currentPage >= totalPages ? "disabled" : ""} class="btn-page-saldo px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition cursor-pointer">Berikutnya</button>
        `;

        kontrolHalaman.innerHTML = btns;

        kontrolHalaman.querySelectorAll('.btn-page-saldo').forEach(btn => {
            btn.onclick = () => {
                const targetPage = Number(btn.getAttribute('data-page'));
                if (Number.isFinite(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                    currentPage = targetPage;
                    renderRows();
                }
            };
        });
    }

    function renderRows() {
        if (!tableBody || !cardBody) return;
        const keyword = (cariInput ? cariInput.value : "").trim().toLowerCase();

        const filtered = akunList.filter(acc => {
            if (!keyword) return true;
            const kode = (acc.kodeAkun || "").toLowerCase();
            const nama = (acc.namaAkun || "").toLowerCase();
            return kode.includes(keyword) || nama.includes(keyword);
        });

        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalItems);
        const pageItems = filtered.slice(startIdx, endIdx);

        if (infoJumlah) {
            infoJumlah.textContent = totalItems === 0
                ? `0 dari ${akunList.length} akun Neraca`
                : `Tampil ${startIdx + 1}–${endIdx} dari ${totalItems} akun (Total Neraca: ${akunList.length})`;
        }

        renderPagination(totalItems, totalPages, startIdx, endIdx);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">Tidak ada akun Neraca yang cocok.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada akun Neraca yang cocok.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        pageItems.forEach(acc => {
            const s = saldoMap[acc.kodeAkun] || { debit: 0, kredit: 0 };
            const debitFormatted = formatRibuanInput(s.debit || 0);
            const kreditFormatted = formatRibuanInput(s.kredit || 0);

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-2 px-4 font-bold text-indigo-600 dark:text-indigo-400">${acc.kodeAkun}</td>
                    <td class="py-2 px-4 font-semibold text-slate-800 dark:text-slate-200">${acc.namaAkun}</td>
                    <td class="py-2 px-4">${acc.saldoNormal || '-'}</td>
                    <td class="py-2 px-4 text-right">
                        <input type="text" inputmode="numeric" enterkeyhint="next" data-kode="${acc.kodeAkun}" data-field="debit" value="${debitFormatted}" class="input-saldo w-36 text-right font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-none focus:outline-none focus:border-indigo-600">
                    </td>
                    <td class="py-2 px-4 text-right">
                        <input type="text" inputmode="numeric" enterkeyhint="next" data-kode="${acc.kodeAkun}" data-field="kredit" value="${kreditFormatted}" class="input-saldo w-36 text-right font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-none focus:outline-none focus:border-indigo-600">
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-3 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400">${acc.kodeAkun}</span>
                        <span class="text-[11px] text-slate-500">${acc.saldoNormal || '-'}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-100">${acc.namaAkun}</div>
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 mb-1">DEBIT (Rp)</label>
                            <input type="text" inputmode="numeric" enterkeyhint="next" data-kode="${acc.kodeAkun}" data-field="debit" value="${debitFormatted}" class="input-saldo w-full text-right font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-500 mb-1">KREDIT (Rp)</label>
                            <input type="text" inputmode="numeric" enterkeyhint="next" data-kode="${acc.kodeAkun}" data-field="kredit" value="${kreditFormatted}" class="input-saldo w-full text-right font-semibold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;

        document.querySelectorAll('.input-saldo').forEach(inp => {
            inp.oninput = () => {
                const kode = inp.getAttribute('data-kode');
                const field = inp.getAttribute('data-field');
                const val = parseDigitsToNumber(inp.value);
                const formatted = formatRibuanInput(val);

                if (!saldoMap[kode]) saldoMap[kode] = { debit: 0, kredit: 0 };
                saldoMap[kode][field] = val;

                document.querySelectorAll(`.input-saldo[data-kode="${kode}"][data-field="${field}"]`).forEach(el => {
                    el.value = formatted;
                });
                hitungRingkasan();
            };

            inp.onkeydown = (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    moveTabOnEnter(inp);
                }
            };
        });

        hitungRingkasan();
        applyPendingFocus();
    }

    async function loadData() {
        try {
            const coaSnap = await getDocs(query(collection(db, "coa"), orderBy("kodeAkun", "asc")));
            akunList = [];
            coaSnap.forEach(d => {
                const item = d.data();
                const isDetail = item.tipeAkun === "Detail" || String(item.levelAkun) === "4";
                const isNeraca = item.reportGroup === "Neraca";
                const isAktif = item.statusAkun !== "Nonaktif";
                if (isDetail && isNeraca && isAktif) {
                    akunList.push({ id: d.id, ...item });
                }
            });

            const periode = periodeInput ? periodeInput.value : defaultPeriode;
            const unitUsaha = getSelectedUnit();
            const saldoSnap = await getDocs(collection(db, "saldo_awal"));
            const loadedMap = {};
            const loadedDocIds = new Set();

            saldoSnap.forEach(d => {
                const data = d.data();
                if (periode && data.periode !== periode) return;
                const docUnit = String(data.unitUsaha || "").trim();
                const matchesUnit = docUnit
                    ? docUnit === unitUsaha
                    : unitUsaha === DEFAULT_UNIT;
                if (!matchesUnit) return;

                loadedDocIds.add(d.id);
                loadedMap[data.kodeAkun] = {
                    debit: Number(data.debit || 0),
                    kredit: Number(data.kredit || 0)
                };
            });

            existingDocIds = loadedDocIds;
            savedSaldoMap = cloneSaldoMap(loadedMap);
            saldoMap = cloneSaldoMap(loadedMap);
            currentPage = 1;
            renderRows();
        } catch (err) {
            console.error("Gagal memuat saldo awal:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-rose-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    if (btnResetBatal) {
        btnResetBatal.onclick = () => {
            saldoMap = cloneSaldoMap(savedSaldoMap);
            renderRows();
            showToast("Perubahan saldo awal dibatalkan ke data tersimpan.");
        };
    }

    if (btnHapusSemua) {
        btnHapusSemua.onclick = async () => {
            const periode = periodeInput ? periodeInput.value : defaultPeriode;
            const unitUsaha = getSelectedUnit();
            if (!periode) {
                showToast("Pilih periode terlebih dahulu.", true);
                return;
            }

            const yakin = await openConfirmModal({
                judul: "Hapus Semua Saldo Awal",
                pesan: `Hapus SEMUA data saldo awal untuk periode ${periode} dan unit ${unitUsaha}? Tindakan ini tidak dapat dibatalkan.`,
                labelYa: "Ya, Hapus Semua"
            });
            if (!yakin) return;

            const originalBtnHtml = btnHapusSemua.innerHTML;
            btnHapusSemua.disabled = true;
            btnHapusSemua.innerHTML = `<span>Menghapus...</span>`;

            try {
                const saldoSnap = await getDocs(collection(db, "saldo_awal"));
                const docIdsToDelete = [];

                saldoSnap.forEach(d => {
                    const data = d.data();
                    if (data.periode !== periode) return;
                    const docUnit = String(data.unitUsaha || "").trim();
                    const matchesUnit = docUnit
                        ? docUnit === unitUsaha
                        : unitUsaha === DEFAULT_UNIT;
                    if (matchesUnit) {
                        docIdsToDelete.push(d.id);
                    }
                });

                const chunkSize = 450;
                for (let i = 0; i < docIdsToDelete.length; i += chunkSize) {
                    const batch = writeBatch(db);
                    const chunk = docIdsToDelete.slice(i, i + chunkSize);
                    chunk.forEach(docId => {
                        batch.delete(doc(db, "saldo_awal", docId));
                    });
                    await batch.commit();
                }

                existingDocIds.clear();
                saldoMap = {};
                savedSaldoMap = {};
                renderRows();
                showToast(`Data saldo awal periode ${periode} (${unitUsaha}) berhasil dihapus.`);
            } catch (err) {
                console.error("Gagal menghapus semua saldo awal:", err);
                showToast("Gagal menghapus data saldo awal.", true);
            } finally {
                btnHapusSemua.disabled = false;
                btnHapusSemua.innerHTML = originalBtnHtml;
            }
        };
    }

    if (btnBukaPopPeriode) btnBukaPopPeriode.onclick = openPeriodeAwalModal;
    if (btnTutupPopPeriode) btnTutupPopPeriode.onclick = closePeriodeAwalModal;
    if (btnBatalPopPeriode) btnBatalPopPeriode.onclick = closePeriodeAwalModal;

    if (modalPeriodeAwal) {
        modalPeriodeAwal.onclick = (e) => {
            if (e.target === modalPeriodeAwal) {
                closePeriodeAwalModal();
            }
        };
    }

    if (formPeriodeAwal) {
        formPeriodeAwal.onsubmit = async (e) => {
            e.preventDefault();
            const pAwal = inputPeriodeAwalBulan ? inputPeriodeAwalBulan.value : "";
            const tglMulai = inputTanggalMulaiTransaksi ? inputTanggalMulaiTransaksi.value : "";
            const catatan = inputCatatanPeriodeAwal ? inputCatatanPeriodeAwal.value.trim() : "";

            if (!pAwal || !tglMulai) {
                showToast("Periode awal dan tanggal mulai transaksi wajib diisi.", true);
                return;
            }

            if (btnSimpanPopPeriode) {
                btnSimpanPopPeriode.disabled = true;
                btnSimpanPopPeriode.textContent = "Menyimpan...";
            }

            try {
                const payload = {
                    periodeAwal: pAwal,
                    tanggalMulaiTransaksi: tglMulai,
                    catatan,
                    updatedAt: new Date().toISOString()
                };
                await setDoc(doc(db, "pengaturan_sistem", "periode_awal_aplikasi"), payload, { merge: true });
                periodeAwalConfig = payload;
                localStorage.setItem("bumkal_periode_awal", pAwal);
                localStorage.setItem("bumkal_tanggal_mulai_transaksi", tglMulai);

                if (periodeInput) {
                    periodeInput.value = pAwal;
                }
                updatePeriodeAwalBadge();
                closePeriodeAwalModal();
                showToast(`Periode awal aplikasi ditetapkan ke ${pAwal}.`);
                await loadData();
            } catch (err) {
                console.error("Gagal menyimpan periode awal aplikasi:", err);
                showToast("Gagal menyimpan periode awal aplikasi.", true);
            } finally {
                if (btnSimpanPopPeriode) {
                    btnSimpanPopPeriode.disabled = false;
                    btnSimpanPopPeriode.textContent = "Tetapkan Periode Awal";
                }
            }
        };
    }

    if (periodeInput) periodeInput.onchange = loadData;
    if (unitInput) unitInput.onchange = loadData;
    if (cariInput) {
        cariInput.oninput = () => {
            currentPage = 1;
            renderRows();
        };
    }

    if (btnSimpanSemua) {
        btnSimpanSemua.onclick = async () => {
            const periode = periodeInput ? periodeInput.value : defaultPeriode;
            const unitUsaha = getSelectedUnit();
            if (!periode) {
                showToast("Pilih periode terlebih dahulu.", true);
                return;
            }

            if (akunList.length === 0) {
                showToast("Tidak ada akun Neraca untuk disimpan.", true);
                return;
            }

            const isSubsequentSave = existingDocIds.size > 0;
            const originalBtnHtml = btnSimpanSemua.innerHTML;
            btnSimpanSemua.disabled = true;
            btnSimpanSemua.innerHTML = `<span>${isSubsequentSave ? "Memperbarui..." : "Menyimpan..."}</span>`;

            try {
                const nowIso = new Date().toISOString();
                const chunkSize = 450;
                const writtenIds = [];

                for (let i = 0; i < akunList.length; i += chunkSize) {
                    const batch = writeBatch(db);
                    const chunk = akunList.slice(i, i + chunkSize);
                    chunk.forEach(acc => {
                        const s = saldoMap[acc.kodeAkun] || { debit: 0, kredit: 0 };
                        const docId = getDocId(periode, unitUsaha, acc.kodeAkun);
                        const docAlreadyExists = existingDocIds.has(docId);
                        const ref = doc(db, "saldo_awal", docId);
                        batch.set(ref, buildPayload(periode, unitUsaha, acc, s, nowIso, docAlreadyExists), { merge: true });
                        writtenIds.push(docId);
                    });
                    await batch.commit();
                }

                writtenIds.forEach(id => existingDocIds.add(id));
                savedSaldoMap = cloneSaldoMap(saldoMap);
                showToast(
                    isSubsequentSave
                        ? `Saldo awal Neraca (${unitUsaha}) berhasil diperbarui (update)!`
                        : `Semua saldo awal Neraca (${unitUsaha}) berhasil disimpan!`
                );
            } catch (err) {
                console.error("Gagal simpan/update batch saldo awal:", err);
                showToast("Terjadi kesalahan saat menyimpan data.", true);
            } finally {
                btnSimpanSemua.disabled = false;
                btnSimpanSemua.innerHTML = originalBtnHtml;
            }
        };
    }

    const cleanup = () => {
        window.removeEventListener('keydown', onKeyDownEscape);
        window.removeEventListener('hashchange', cleanup);
        saldoAwalCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    saldoAwalCleanup = cleanup;

    await loadPeriodeAwalConfig();
    await loadData();

    return cleanup;
}