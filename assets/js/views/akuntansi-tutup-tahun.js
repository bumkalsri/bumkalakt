// File: assets/js/views/akuntansi-tutup-tahun.js
import { collection, getDocs, setDoc, deleteDoc, doc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const NAMA_BULAN = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember"
};

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getNextPeriodKey(periodKey) {
    const match = String(periodKey || "").match(/^(\d{4})-(\d{2})$/);
    if (!match) return "2025-01";
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10) + 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    return `${year}-${String(month).padStart(2, "0")}`;
}

function isDetailAccount(coa) {
    const level = String(coa?.levelAkun ?? coa?.level ?? "").trim();
    const tipe = String(coa?.tipeAkun ?? coa?.tipe ?? "").trim().toLowerCase();
    return level === "4" || tipe === "detail";
}

function classifyAccount(coa) {
    const reportGroup = String(coa?.reportGroup || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kode = String(coa?.kodeAkun || "").trim();

    if (reportGroup.includes("aset") || reportGroup.includes("aktiva") || kategori.includes("aset") || kategori.includes("aktiva") || kode.startsWith("1")) {
        return "aset";
    }
    if (reportGroup.includes("kewajiban") || reportGroup.includes("liabilitas") || reportGroup.includes("hutang") || reportGroup.includes("utang") || kategori.includes("kewajiban") || kategori.includes("liabilitas") || kategori.includes("hutang") || kategori.includes("utang") || kode.startsWith("2")) {
        return "kewajiban";
    }
    if (reportGroup.includes("modal") || reportGroup.includes("ekuitas") || kategori.includes("modal") || kategori.includes("ekuitas") || kode.startsWith("3")) {
        return "ekuitas";
    }
    if (reportGroup.includes("pendapatan") || nama.includes("pendapatan") || nama.includes("penjualan") || kategori.includes("pendapatan") || kode.startsWith("4")) {
        return "pendapatan";
    }
    if (reportGroup.includes("beban") || reportGroup.includes("biaya") || kategori.includes("beban") || kategori.includes("biaya") || kode.startsWith("5") || kode.startsWith("6") || kode.startsWith("7")) {
        return "beban";
    }
    return null;
}

export function renderAkuntansiTutupTahun() {
    return `
        <div class="space-y-4 sm:space-y-6 pb-10 max-w-7xl mx-auto overflow-x-hidden animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3 min-w-0">
                    <a href="#/akuntansi" data-link title="Kembali ke Akuntansi" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-sm sm:text-base font-bold text-amber-500 dark:text-amber-400 flex items-center gap-2 break-words">
                            <span>Tutup Buku Akhir Tahun</span>
                        </h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">Proses penutupan akhir tahun untuk rekapan laba rugi dan pemindahan saldo ke tahun berikutnya.</p>
                    </div>
                </div>
            </div>

            <!-- Grid Utama: Kiri (Informasi Periode) | Kanan (Langkah Persiapan & Catatan) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 text-xs items-stretch">
                <!-- Kolom Kiri: Informasi Periode -->
                <div class="lg:col-span-7 bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none space-y-5 min-w-0">
                    <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span class="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] font-extrabold inline-flex items-center justify-center flex-shrink-0">i</span>
                        <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Informasi Periode</h2>
                    </div>

                    <!-- Banner Status Periode -->
                    <div id="banner-status-periode" class="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 rounded-none p-4 flex items-start gap-3">
                        <span id="icon-status-periode" class="text-amber-500 text-base leading-none mt-0.5 flex-shrink-0">&#9888;</span>
                        <div class="space-y-1 min-w-0">
                            <div id="judul-status-periode" class="font-bold text-rose-800 dark:text-rose-200">Akses Ditutup!</div>
                            <p id="deskripsi-status-periode" class="text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                                Periode aktif sistem saat ini adalah <strong id="teks-periode-aktif">2025-01</strong>. Tutup Buku Akhir Tahun hanya dapat dijalankan jika periode aktif berada di bulan <strong>Desember</strong>.
                            </p>
                        </div>
                    </div>

                    <!-- Status Periode Sistem Saat Ini -->
                    <div class="space-y-1.5">
                        <label class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status Periode Sistem Saat Ini:</label>
                        <div class="bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-3 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-semibold min-w-0">
                                <svg class="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <span class="truncate">Periode Aktif:</span>
                            </div>
                            <span id="badge-periode-aktif" class="bg-blue-600 text-white font-bold px-3 py-1 rounded-none text-xs flex-shrink-0">2025-01</span>
                        </div>
                    </div>

                    <!-- Tombol Pratinjau Struktur Neraca Akhir Tahun -->
                    <button type="button" id="btn-pratinjau-neraca"
                        class="w-full bg-white dark:bg-slate-950 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-400 dark:border-sky-700 font-semibold py-2.5 px-4 rounded-none transition cursor-pointer flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        <span>Pratinjau Struktur Neraca Akhir Tahun</span>
                    </button>

                    <!-- Tombol Utama Tutup Buku Akhir Tahun (Aktif saat bulan Desember) -->
                    <button type="button" id="btn-eksekusi-tutup-tahun" disabled
                        class="w-full bg-slate-400 text-white font-bold py-3 px-4 rounded-none transition flex items-center justify-center gap-2 cursor-not-allowed">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        <span id="label-tombol-tutup-tahun">Belum Bulan Desember (Terkunci)</span>
                    </button>

                    <!-- Panel Pratinjau Neraca Akhir Tahun (Toggle) -->
                    <div id="panel-pratinjau-neraca" class="hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-none space-y-3">
                        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span class="font-bold text-slate-800 dark:text-slate-100" id="pratinjau-judul-tahun">Pratinjau Neraca Akhir Tahun</span>
                            <button type="button" id="btn-tutup-pratinjau" class="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer">Tutup</button>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                            <div class="bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                                <span class="text-slate-500 block">Total Aset</span>
                                <span id="pratinjau-aset" class="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">Rp 0</span>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                                <span class="text-slate-500 block">Kewajiban</span>
                                <span id="pratinjau-kewajiban" class="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">Rp 0</span>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                                <span class="text-slate-500 block">Ekuitas</span>
                                <span id="pratinjau-ekuitas" class="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">Rp 0</span>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                                <span class="text-slate-500 block">Laba/Rugi Bersih</span>
                                <span id="pratinjau-labarugi" class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">Rp 0</span>
                            </div>
                        </div>
                        <div id="pratinjau-detail-akun" class="max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-[11px]"></div>
                    </div>

                    <!-- Blok Batalkan / Buka Kembali Tahun Tertentu -->
                    <div class="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                            <svg class="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            <span>Batalkan / Buka Kembali Tahun Tertentu:</span>
                        </div>
                        <div class="flex items-stretch border border-slate-300 dark:border-slate-700 rounded-none overflow-hidden">
                            <input type="number" id="input-batal-tahun" value="2024" min="2020" max="2099"
                                class="flex-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold text-center px-3 py-2 focus:outline-none">
                            <button type="button" id="btn-eksekusi-batal-tahun"
                                class="bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-l border-rose-300 dark:border-rose-800 font-semibold px-4 py-2 transition cursor-pointer whitespace-nowrap">
                                Eksekusi Batal
                            </button>
                        </div>
                        <p class="text-[11px] text-slate-400 leading-relaxed">
                            Membuka tahun tertentu akan ikut membuka tahun tertutup setelahnya (ke atas) serta membersihkan saldo awal carry-over tahun-tahun terkait.
                        </p>
                    </div>
                </div>

                <!-- Kolom Kanan: Langkah Persiapan & Catatan -->
                <div class="lg:col-span-5 bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col justify-between space-y-6 min-w-0">
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Langkah Persiapan</h2>
                        </div>

                        <ul class="space-y-2.5 text-slate-600 dark:text-slate-300 list-disc pl-5 leading-relaxed">
                            <li>Pastikan semua transaksi kas sudah selesai diinput.</li>
                            <li>Selesaikan depresiasi aset tetap sampai Desember.</li>
                            <li>Pastikan Neraca Saldo dalam kondisi seimbang (balance).</li>
                            <li><strong class="text-slate-800 dark:text-slate-100">Wajib melakukan backup database</strong> sebelum proses dimulai.</li>
                        </ul>
                    </div>

                    <div class="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 rounded-none p-4 text-sky-900 dark:text-sky-200 leading-relaxed flex items-start gap-2.5">
                        <span class="text-sky-600 dark:text-sky-400 font-bold flex-shrink-0">&#128205;</span>
                        <div>
                            <span class="font-bold">Catatan:</span> Menu ini otomatis mentransfer saldo akhir akun neraca &amp; laba ditahan ke koleksi <code class="font-mono font-bold">saldo_awal</code> tertanggal 31 Desember.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Riwayat Tutup Tahun -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-wrap justify-between items-center gap-2">
                    <span>RIWAYAT TAHUN BUKU DITUTUP</span>
                    <span id="total-riwayat-tutup-tahun" class="text-slate-500 font-normal">Total: 0 Tahun</span>
                </div>

                <!-- Tampilan Desktop (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold">Tahun Buku</th>
                                <th class="py-3 px-4 font-semibold text-right">Pendapatan (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-right">Beban (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-right">Laba / Rugi Bersih (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center">Status</th>
                                <th class="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-tutup-tahun-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat riwayat tutup tahun...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan HP (Card) -->
                <div id="card-tutup-tahun-mobile" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div class="p-6 text-center text-slate-400">Memuat riwayat tutup tahun...</div>
                </div>
            </div>

            <!-- Modal Konfirmasi Smooth -->
            <div id="modal-konfirmasi-tutup-tahun" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 transition-opacity duration-200">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-5 sm:p-6 shadow-2xl rounded-none space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="w-9 h-9 flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 flex-shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modal-konfirmasi-tahun-title" class="font-bold text-slate-800 dark:text-slate-100 text-sm">Konfirmasi Tindakan</h3>
                            <p id="modal-konfirmasi-tahun-desc" class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Apakah Anda yakin?</p>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button type="button" id="btn-konfirmasi-tahun-batal"
                            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-none transition cursor-pointer">
                            Batal
                        </button>
                        <button type="button" id="btn-konfirmasi-tahun-ya"
                            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none transition cursor-pointer">
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-tutup-tahun" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-tutup-tahun-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-tutup-tahun-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let tutupTahunToastTimer = null;
let tutupTahunCleanup = null;

export function initAkuntansiTutupTahunHandler() {
    if (typeof tutupTahunCleanup === "function") {
        tutupTahunCleanup();
        tutupTahunCleanup = null;
    }

    const bannerStatusEl = document.getElementById('banner-status-periode');
    const iconStatusEl = document.getElementById('icon-status-periode');
    const judulStatusEl = document.getElementById('judul-status-periode');
    const deskripsiStatusEl = document.getElementById('deskripsi-status-periode');
    const badgePeriodeAktifEl = document.getElementById('badge-periode-aktif');

    const btnPratinjau = document.getElementById('btn-pratinjau-neraca');
    const panelPratinjau = document.getElementById('panel-pratinjau-neraca');
    const btnTutupPratinjau = document.getElementById('btn-tutup-pratinjau');

    const btnEksekusiTutup = document.getElementById('btn-eksekusi-tutup-tahun');
    const labelTombolTutup = document.getElementById('label-tombol-tutup-tahun');

    const inputBatalTahun = document.getElementById('input-batal-tahun');
    const btnEksekusiBatal = document.getElementById('btn-eksekusi-batal-tahun');

    const tableBody = document.getElementById('table-tutup-tahun-body');
    const mobileCardContainer = document.getElementById('card-tutup-tahun-mobile');
    const totalRiwayatEl = document.getElementById('total-riwayat-tutup-tahun');

    const confirmModal = document.getElementById('modal-konfirmasi-tutup-tahun');
    const confirmTitleEl = document.getElementById('modal-konfirmasi-tahun-title');
    const confirmDescEl = document.getElementById('modal-konfirmasi-tahun-desc');
    const btnConfirmBatal = document.getElementById('btn-konfirmasi-tahun-batal');
    const btnConfirmYa = document.getElementById('btn-konfirmasi-tahun-ya');

    let coaList = [];
    let saldoAwalList = [];
    let jurnalList = [];
    let closedYears = [];
    let activePeriodKey = "2025-01";
    let pendingConfirmResolver = null;

    function formatRupiah(num) {
        const val = Number(num || 0);
        const sign = val < 0 ? "- " : "";
        return sign + "Rp " + Math.abs(val).toLocaleString('id-ID');
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-tutup-tahun');
        const msgEl = document.getElementById('toast-tutup-tahun-message');
        const iconEl = document.getElementById('toast-tutup-tahun-icon');
        if (!toast || !msgEl) return;

        if (tutupTahunToastTimer) clearTimeout(tutupTahunToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        tutupTahunToastTimer = setTimeout(() => {
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

    function askSmoothConfirm({ title, message, confirmText = "Ya, Lanjutkan", variant = "rose" }) {
        if (!confirmModal || !btnConfirmYa || !btnConfirmBatal) {
            return Promise.resolve(true);
        }

        if (pendingConfirmResolver) {
            closeConfirmModal(false);
        }

        if (confirmTitleEl) confirmTitleEl.textContent = title || "Konfirmasi Tindakan";
        if (confirmDescEl) confirmDescEl.textContent = message || "Apakah Anda yakin?";
        btnConfirmYa.textContent = confirmText;

        if (variant === "indigo") {
            btnConfirmYa.className = "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none transition cursor-pointer";
        } else {
            btnConfirmYa.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-none transition cursor-pointer";
        }

        confirmModal.classList.remove('hidden');
        btnConfirmYa.focus();

        return new Promise((resolve) => {
            pendingConfirmResolver = resolve;
        });
    }

    const onConfirmYaClick = () => closeConfirmModal(true);
    const onConfirmBatalClick = () => closeConfirmModal(false);
    const onConfirmBackdropClick = (e) => {
        if (confirmModal && e.target === confirmModal) closeConfirmModal(false);
    };
    const onKeyDown = (e) => {
        if (e.key === "Escape" && confirmModal && !confirmModal.classList.contains('hidden')) {
            e.preventDefault();
            closeConfirmModal(false);
        }
    };

    if (btnConfirmYa) btnConfirmYa.addEventListener('click', onConfirmYaClick);
    if (btnConfirmBatal) btnConfirmBatal.addEventListener('click', onConfirmBatalClick);
    if (confirmModal) confirmModal.addEventListener('click', onConfirmBackdropClick);
    document.addEventListener('keydown', onKeyDown);

    function hitungStrukturTahun(tahun) {
        const akunMap = {};
        coaList.forEach(coa => {
            if (!isDetailAccount(coa)) return;
            const kode = String(coa.kodeAkun || "").trim();
            const cls = classifyAccount(coa);
            if (!kode || !cls) return;

            akunMap[kode] = {
                kodeAkun: kode,
                namaAkun: coa.namaAkun || "-",
                group: cls,
                normalBalance: String(coa.normalBalance || coa.saldoNormal || "").trim().toLowerCase(),
                debit: 0,
                kredit: 0,
                saldoAkhir: 0
            };
        });

        saldoAwalList.forEach(sa => {
            const saYear = sa.periode ? String(sa.periode).slice(0, 4) : String(sa.tahun || "");
            if (saYear && saYear !== String(tahun)) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (akunMap[kode]) {
                akunMap[kode].debit += parseFloat(sa.debit) || 0;
                akunMap[kode].kredit += parseFloat(sa.kredit) || 0;
            }
        });

        jurnalList.forEach(item => {
            if (!item.tglTransaksi || !String(item.tglTransaksi).startsWith(`${tahun}-`)) return;
            if (Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (akunMap[kode]) {
                        akunMap[kode].debit += parseFloat(r.debet) || 0;
                        akunMap[kode].kredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        let totalAset = 0;
        let totalKewajiban = 0;
        let totalEkuitas = 0;
        let totalPendapatan = 0;
        let totalBeban = 0;

        const detailAkun = [];

        Object.values(akunMap)
            .sort((a, b) => String(a.kodeAkun).localeCompare(String(b.kodeAkun)))
            .forEach(acc => {
                const debitNet = acc.debit - acc.kredit;
                const kreditNet = acc.kredit - acc.debit;

                let saldo = 0;
                if (acc.group === "aset") {
                    const isContra = acc.normalBalance === "kredit" || acc.namaAkun.toLowerCase().includes("akumulasi");
                    saldo = isContra ? -kreditNet : debitNet;
                    totalAset += saldo;
                } else if (acc.group === "kewajiban") {
                    const isContra = acc.normalBalance === "debet";
                    saldo = isContra ? -debitNet : kreditNet;
                    totalKewajiban += saldo;
                } else if (acc.group === "ekuitas") {
                    const isContra = acc.normalBalance === "debet" || acc.namaAkun.toLowerCase().includes("prive");
                    saldo = isContra ? -debitNet : kreditNet;
                    totalEkuitas += saldo;
                } else if (acc.group === "pendapatan") {
                    saldo = kreditNet;
                    totalPendapatan += saldo;
                } else if (acc.group === "beban") {
                    saldo = debitNet;
                    totalBeban += saldo;
                }

                acc.saldoAkhir = saldo;
                detailAkun.push(acc);
            });

        const labaRugi = totalPendapatan - totalBeban;

        return {
            totalAset,
            totalKewajiban,
            totalEkuitas,
            totalPendapatan,
            totalBeban,
            labaRugi,
            detailAkun
        };
    }

    function updateStatusPeriodeUI() {
        const match = String(activePeriodKey || "2025-01").match(/^(\d{4})-(\d{2})$/);
        const tahunAktif = match ? match[1] : "2025";
        const bulanAktif = match ? match[2] : "01";
        const isDesember = bulanAktif === "12";

        if (badgePeriodeAktifEl) {
            badgePeriodeAktifEl.textContent = activePeriodKey;
        }

        if (bannerStatusEl && judulStatusEl && deskripsiStatusEl && iconStatusEl && btnEksekusiTutup && labelTombolTutup) {
            if (isDesember) {
                bannerStatusEl.className = "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-none p-4 flex items-start gap-3";
                iconStatusEl.className = "text-emerald-600 dark:text-emerald-400 text-base leading-none mt-0.5 flex-shrink-0";
                iconStatusEl.innerHTML = "&#10004;";
                judulStatusEl.className = "font-bold text-emerald-800 dark:text-emerald-200";
                judulStatusEl.textContent = "Akses Terbuka (Periode Desember)";
                deskripsiStatusEl.className = "text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed";
                deskripsiStatusEl.innerHTML = `Periode aktif sistem saat ini adalah <strong>${escapeHtml(activePeriodKey)}</strong> (${escapeHtml(NAMA_BULAN[bulanAktif])} ${escapeHtml(tahunAktif)}). Tutup Buku Akhir Tahun dapat dijalankan.`;

                btnEksekusiTutup.disabled = false;
                btnEksekusiTutup.className = "w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm";
                labelTombolTutup.textContent = `Proses Tutup Buku Akhir Tahun ${tahunAktif}`;
            } else {
                bannerStatusEl.className = "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 rounded-none p-4 flex items-start gap-3";
                iconStatusEl.className = "text-amber-500 text-base leading-none mt-0.5 flex-shrink-0";
                iconStatusEl.innerHTML = "&#9888;";
                judulStatusEl.className = "font-bold text-rose-800 dark:text-rose-200";
                judulStatusEl.textContent = "Akses Ditutup!";
                deskripsiStatusEl.className = "text-rose-700/90 dark:text-rose-300/90 leading-relaxed";
                deskripsiStatusEl.innerHTML = `Periode aktif sistem saat ini adalah <strong>${escapeHtml(activePeriodKey)}</strong>. Tutup Buku Akhir Tahun hanya dapat dijalankan jika periode aktif berada di bulan <strong>Desember</strong>.`;

                btnEksekusiTutup.disabled = true;
                btnEksekusiTutup.className = "w-full bg-slate-400 text-white font-bold py-3 px-4 rounded-none transition flex items-center justify-center gap-2 cursor-not-allowed";
                labelTombolTutup.textContent = "Belum Bulan Desember (Terkunci)";
            }
        }
    }

    function renderPratinjauNeraca() {
        const match = String(activePeriodKey || "2025-01").match(/^(\d{4})-(\d{2})$/);
        const tahunTarget = match ? match[1] : "2025";
        const struktur = hitungStrukturTahun(tahunTarget);

        const judulEl = document.getElementById('pratinjau-judul-tahun');
        const asetEl = document.getElementById('pratinjau-aset');
        const kewajibanEl = document.getElementById('pratinjau-kewajiban');
        const ekuitasEl = document.getElementById('pratinjau-ekuitas');
        const labarugiEl = document.getElementById('pratinjau-labarugi');
        const detailEl = document.getElementById('pratinjau-detail-akun');

        if (judulEl) judulEl.textContent = `Pratinjau Struktur Neraca Akhir Tahun ${tahunTarget}`;
        if (asetEl) asetEl.textContent = formatRupiah(struktur.totalAset);
        if (kewajibanEl) kewajibanEl.textContent = formatRupiah(struktur.totalKewajiban);
        if (ekuitasEl) ekuitasEl.textContent = formatRupiah(struktur.totalEkuitas);
        if (labarugiEl) {
            labarugiEl.textContent = formatRupiah(struktur.labaRugi);
            labarugiEl.className = struktur.labaRugi < 0
                ? "font-bold text-rose-600 dark:text-rose-400 mt-0.5 block truncate"
                : "font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate";
        }

        if (detailEl) {
            const neracaAkun = struktur.detailAkun.filter(a => ["aset", "kewajiban", "ekuitas"].includes(a.group));
            if (neracaAkun.length === 0) {
                detailEl.innerHTML = `<div class="p-3 text-center text-slate-400">Tidak ada akun neraca detail.</div>`;
            } else {
                detailEl.innerHTML = neracaAkun.map(a => `
                    <div class="px-3 py-2 flex justify-between items-center gap-2">
                        <span class="text-slate-700 dark:text-slate-300 truncate"><strong class="text-indigo-600 dark:text-indigo-400">${escapeHtml(a.kodeAkun)}</strong> - ${escapeHtml(a.namaAkun)}</span>
                        <span class="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">${escapeHtml(formatRupiah(a.saldoAkhir))}</span>
                    </div>
                `).join("");
            }
        }

        if (panelPratinjau) {
            panelPratinjau.classList.remove('hidden');
        }
    }

    function renderRiwayat() {
        if (totalRiwayatEl) totalRiwayatEl.textContent = `Total: ${closedYears.length} Tahun`;

        if (closedYears.length === 0) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada tahun buku yang ditutup.</td></tr>`;
            }
            if (mobileCardContainer) {
                mobileCardContainer.innerHTML = `<div class="p-6 text-center text-slate-400">Belum ada tahun buku yang ditutup.</div>`;
            }
            return;
        }

        let tableHtml = "";
        let cardHtml = "";

        closedYears.forEach(item => {
            const yr = String(item.tahun || item.id || "").trim();
            const safeYr = escapeHtml(yr);
            const pendapatanFmt = escapeHtml(formatRupiah(item.pendapatan));
            const bebanFmt = escapeHtml(formatRupiah(item.beban));
            const lr = Number(item.labaRugi || 0);
            const lrFmt = escapeHtml(formatRupiah(lr));
            const lrClass = lr < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400";
            const statusText = escapeHtml(item.status || "Ditutup");

            tableHtml += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Tahun Buku ${safeYr}</td>
                    <td class="py-3 px-4 text-right font-semibold">${pendapatanFmt}</td>
                    <td class="py-3 px-4 text-right font-semibold">${bebanFmt}</td>
                    <td class="py-3 px-4 text-right font-bold ${lrClass}">${lrFmt}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${statusText}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <button type="button" data-buka-tahun="${safeYr}" class="btn-buka-tahun px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-semibold cursor-pointer rounded-none">Buka Kembali</button>
                    </td>
                </tr>
            `;

            cardHtml += `
                <div class="p-4 space-y-2.5 bg-white dark:bg-slate-900">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <div class="font-bold text-slate-800 dark:text-slate-100 text-xs">Tahun Buku ${safeYr}</div>
                            <span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${statusText}</span>
                        </div>
                        <button type="button" data-buka-tahun="${safeYr}" class="btn-buka-tahun px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition text-[11px] font-semibold cursor-pointer rounded-none flex-shrink-0">Buka Kembali</button>
                    </div>
                    <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                            <span class="text-[10px] text-slate-400 block">Pendapatan</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${pendapatanFmt}</span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 block">Beban</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-200">${bebanFmt}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] text-slate-400 block">Laba/Rugi</span>
                            <span class="font-bold ${lrClass}">${lrFmt}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        if (tableBody) tableBody.innerHTML = tableHtml;
        if (mobileCardContainer) mobileCardContainer.innerHTML = cardHtml;

        document.querySelectorAll('.btn-buka-tahun').forEach(btn => {
            btn.onclick = async () => {
                const tahunId = btn.getAttribute('data-buka-tahun');
                if (tahunId) await batalkanTahun(tahunId);
            };
        });
    }

    function getCascadeYearsToReopen(targetYear) {
        const years = new Set([targetYear]);
        closedYears.forEach(item => {
            const yr = String(item.tahun || item.id || "").trim();
            if (/^\d{4}$/.test(yr) && yr >= targetYear) {
                years.add(yr);
            }
        });
        return Array.from(years).sort();
    }

    async function batalkanTahun(tahunInput) {
        const cleanYear = String(tahunInput || "").trim();
        if (!/^\d{4}$/.test(cleanYear)) {
            showToast("Masukkan tahun buku 4 digit yang valid (contoh: 2024).", true);
            return;
        }

        const yearsToReopen = getCascadeYearsToReopen(cleanYear);
        const extraYears = yearsToReopen.filter(y => y !== cleanYear);
        const carryOverYears = new Set(yearsToReopen.map(y => String(parseInt(y, 10) + 1)));

        const confirmMessage = extraYears.length > 0
            ? `Batalkan / buka kembali tutup buku tahun ${cleanYear} beserta tahun tertutup setelahnya (${extraYears.join(", ")}) dan bersihkan saldo awal carry-over tahun-tahun terkait?`
            : `Batalkan / buka kembali tutup buku tahun ${cleanYear} dan bersihkan saldo awal carry-over tahun berikutnya?`;

        const confirmed = await askSmoothConfirm({
            title: "Batalkan Tutup Buku Tahun",
            message: confirmMessage,
            confirmText: "Ya, Buka Tahun",
            variant: "rose"
        });
        if (!confirmed) return;

        try {
            for (const yr of yearsToReopen) {
                await deleteDoc(doc(db, "tutup_tahun", yr));
            }

            const snapSaldo = await getDocs(collection(db, "saldo_awal"));
            const batch = writeBatch(db);
            let deletedCount = 0;

            snapSaldo.forEach(docSnap => {
                const data = docSnap.data();
                const docTahun = String(data.tahun || "");
                const docPeriode = String(data.periode || "");
                const docTanggal = String(data.tanggal || "");

                const matchesCarryOver = Array.from(carryOverYears).some(ny =>
                    docTahun === ny ||
                    docPeriode.startsWith(`${ny}-`) ||
                    docTanggal.startsWith(`${ny}-`)
                );

                if (matchesCarryOver) {
                    batch.delete(doc(db, "saldo_awal", docSnap.id));
                    deletedCount += 1;
                }
            });

            if (deletedCount > 0) {
                await batch.commit();
            }

            if (extraYears.length > 0) {
                showToast(`Tutup buku tahun ${cleanYear} beserta ${extraYears.join(", ")} dibatalkan (${deletedCount} saldo awal carry-over dibersihkan).`);
            } else {
                showToast(`Tutup buku tahun ${cleanYear} dibatalkan (${deletedCount} saldo awal carry-over dibersihkan).`);
            }

            await loadDataTutupTahun();
        } catch (err) {
            console.error("Gagal membatalkan tutup tahun:", err);
            showToast("Gagal membatalkan tutup buku tahun.", true);
        }
    }

    async function eksekusiTutupTahun() {
        const match = String(activePeriodKey || "2025-01").match(/^(\d{4})-(\d{2})$/);
        const tahun = match ? match[1] : "2025";
        const bulan = match ? match[2] : "01";

        if (bulan !== "12") {
            showToast("Tutup Buku Akhir Tahun hanya dapat dijalankan saat periode aktif bulan Desember.", true);
            return;
        }

        const confirmed = await askSmoothConfirm({
            title: "Konfirmasi Tutup Buku Akhir Tahun",
            message: `Jalankan Tutup Buku Akhir Tahun ${tahun} dan pindahkan saldo akhir neraca & laba/rugi ke saldo_awal per 31 Desember ${tahun}?`,
            confirmText: "Ya, Tutup Tahun",
            variant: "indigo"
        });
        if (!confirmed) return;

        const struktur = hitungStrukturTahun(tahun);
        const nextYear = String(parseInt(tahun, 10) + 1);
        const nextPeriod = `${nextYear}-01`;

        btnEksekusiTutup.disabled = true;
        const origHtml = btnEksekusiTutup.innerHTML;
        btnEksekusiTutup.textContent = "Memproses Tutup Buku...";

        try {
            await setDoc(doc(db, "tutup_tahun", tahun), {
                tahun,
                pendapatan: struktur.totalPendapatan,
                beban: struktur.totalBeban,
                labaRugi: struktur.labaRugi,
                totalAset: struktur.totalAset,
                totalKewajiban: struktur.totalKewajiban,
                totalEkuitas: struktur.totalEkuitas,
                status: "Ditutup",
                closedAt: new Date().toISOString()
            });

            const batch = writeBatch(db);
            struktur.detailAkun
                .filter(a => ["aset", "kewajiban", "ekuitas"].includes(a.group) && Math.abs(a.saldoAkhir) > 0)
                .forEach(acc => {
                    const docId = `carry_${nextYear}_${acc.kodeAkun.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                    const isDebitNormal = acc.group === "aset" || (acc.group === "ekuitas" && acc.saldoAkhir < 0);
                    const absVal = Math.abs(acc.saldoAkhir);

                    batch.set(doc(db, "saldo_awal", docId), {
                        kodeAkun: acc.kodeAkun,
                        namaAkun: acc.namaAkun,
                        tahun: nextYear,
                        periode: nextPeriod,
                        tanggal: `${tahun}-12-31`,
                        debit: isDebitNormal ? absVal : 0,
                        kredit: isDebitNormal ? 0 : absVal,
                        sumber: `tutup_tahun_${tahun}`,
                        updatedAt: new Date().toISOString()
                    });
                });

            await batch.commit();

            showToast(`Tutup Buku Akhir Tahun ${tahun} selesai. Saldo dipindahkan ke ${nextPeriod}.`);
            await loadDataTutupTahun();
        } catch (err) {
            console.error("Gagal memproses tutup buku akhir tahun:", err);
            showToast("Terjadi kesalahan saat memproses tutup buku akhir tahun.", true);
        } finally {
            btnEksekusiTutup.disabled = false;
            btnEksekusiTutup.innerHTML = origHtml;
            updateStatusPeriodeUI();
        }
    }

    async function loadDataTutupTahun() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaList = [];
            snapCoa.forEach(docSnap => coaList.push({ id: docSnap.id, ...docSnap.data() }));

            const snapSaldo = await getDocs(collection(db, "saldo_awal"));
            saldoAwalList = [];
            snapSaldo.forEach(docSnap => saldoAwalList.push({ id: docSnap.id, ...docSnap.data() }));

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            jurnalList = [];
            snapJurnal.forEach(docSnap => jurnalList.push({ id: docSnap.id, ...docSnap.data() }));

            const qBulan = query(collection(db, "tutup_bulan"), orderBy("periodKey", "desc"));
            const snapBulan = await getDocs(qBulan);
            const closedMonths = [];
            snapBulan.forEach(docSnap => {
                const d = docSnap.data();
                if (String(d.status || "Ditutup").toLowerCase() === "ditutup") {
                    const key = String(d.periodKey || docSnap.id || "").trim();
                    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) {
                        closedMonths.push(key);
                    }
                }
            });

            closedMonths.sort();
            if (closedMonths.length > 0) {
                const latestClosedKey = closedMonths[closedMonths.length - 1];
                activePeriodKey = getNextPeriodKey(latestClosedKey);
            } else {
                activePeriodKey = "2025-01";
            }

            const qTahun = query(collection(db, "tutup_tahun"), orderBy("tahun", "desc"));
            const snapTahun = await getDocs(qTahun);
            closedYears = [];
            snapTahun.forEach(docSnap => closedYears.push({ id: docSnap.id, ...docSnap.data() }));

            updateStatusPeriodeUI();
            renderRiwayat();
        } catch (err) {
            console.error("Gagal memuat data tutup tahun:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
            if (mobileCardContainer) mobileCardContainer.innerHTML = `<div class="p-6 text-center text-rose-500">Gagal memuat data dari database.</div>`;
        }
    }

    if (btnPratinjau) {
        btnPratinjau.onclick = () => {
            if (panelPratinjau && !panelPratinjau.classList.contains('hidden')) {
                panelPratinjau.classList.add('hidden');
            } else {
                renderPratinjauNeraca();
            }
        };
    }

    if (btnTutupPratinjau) {
        btnTutupPratinjau.onclick = () => {
            if (panelPratinjau) panelPratinjau.classList.add('hidden');
        };
    }

    if (btnEksekusiTutup) {
        btnEksekusiTutup.onclick = () => eksekusiTutupTahun();
    }

    if (btnEksekusiBatal) {
        btnEksekusiBatal.onclick = async () => {
            const val = inputBatalTahun ? inputBatalTahun.value.trim() : "";
            await batalkanTahun(val);
        };
    }

    if (inputBatalTahun) {
        inputBatalTahun.onkeydown = async (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                await batalkanTahun(inputBatalTahun.value.trim());
            }
        };
    }

    const cleanup = () => {
        if (pendingConfirmResolver) {
            closeConfirmModal(false);
        }
        if (btnConfirmYa) btnConfirmYa.removeEventListener('click', onConfirmYaClick);
        if (btnConfirmBatal) btnConfirmBatal.removeEventListener('click', onConfirmBatalClick);
        if (confirmModal) confirmModal.removeEventListener('click', onConfirmBackdropClick);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('hashchange', cleanup);
        tutupTahunCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    tutupTahunCleanup = cleanup;

    loadDataTutupTahun();

    return cleanup;
}