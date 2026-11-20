// File: assets/js/views/akuntansi-coa.js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderCoa() {
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">COA (Chart of Accounts)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola daftar akun perkiraan dan struktur kode akun.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-buka-modal" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah Akun
                    </button>
                </div>
            </div>

            <!-- Filter Bar (Report Group & Level) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER REPORT GROUP</label>
                    <select id="filter-report" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">--Semua Report Group--</option>
                        <option value="Neraca">Neraca</option>
                        <option value="Laba Rugi">Laba Rugi</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER LEVEL AKUN</label>
                    <select id="filter-level" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">--Semua Level--</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                    </select>
                </div>
            </div>

            <!-- Daftar COA (Responsive: Tabel dengan Paginasi untuk Desktop, Card Tanpa Batas untuk Mobile/HP) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Akun Perkiraan</h3>
                    <span id="total-akun" class="text-[11px] text-slate-500 font-medium">Memuat data...</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel dengan Paginasi) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">Kode Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Nama Akun</th>
                                <th class="py-2.5 px-4 font-semibold">Level</th>
                                <th class="py-2.5 px-4 font-semibold">Saldo Normal</th>
                                <th class="py-2.5 px-4 font-semibold">Report Group</th>
                                <th class="py-2.5 px-4 font-semibold">Status</th>
                                <th class="py-2.5 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-coa-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="7" class="py-6 text-center text-slate-400">Memuat data akun dari database...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginasi Khusus Desktop -->
                <div id="pagination-container" class="hidden md:flex p-3 border-t border-slate-200 dark:border-slate-800 items-center justify-between bg-slate-50/50 dark:bg-slate-950/50 text-xs">
                    <span id="pagination-info" class="text-slate-500">Menampilkan 0 - 0 dari 0 data</span>
                    <div class="flex items-center gap-1">
                        <button id="btn-prev-page" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer">Sebelumnya</button>
                        <span id="page-indicator" class="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200">1 / 1</span>
                        <button id="btn-next-page" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer">Selanjutnya</button>
                    </div>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View Tanpa Batas / Semua Data Ditampilkan) -->
                <div id="card-coa-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data akun dari database...</div>
                </div>
            </div>

            <!-- MODAL FORM TAMBAH AKUN BARU -->
            <div id="modal-tambah-akun" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 transition-all duration-300">
                <div class="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-none shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-95">
                    <div class="bg-[#581c87] dark:bg-purple-950 px-6 py-4 flex items-center justify-between text-white">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <h2 class="text-sm font-bold tracking-wide">TAMBAH AKUN BARU</h2>
                        </div>
                        <button type="button" id="btn-tutup-modal" title="Tutup (Esc)" class="text-white hover:text-slate-200 transition cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <form id="form-tambah-akun" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">LEVEL AKUN</label>
                                <select id="level-akun" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                                    <option value="">--Pilih Level--</option>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KODE AKUN</label>
                                <input type="text" id="kode-akun" placeholder="Otomatis" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-2 rounded-none focus:outline-none" readonly>
                            </div>
                        </div>

                        <div id="container-header-akun" class="hidden">
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">HEADER (INDUK AKUN)</label>
                            <select id="select-header-akun" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                                <option value="">--Pilih Induk Akun--</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">NAMA AKUN</label>
                            <input type="text" id="nama-akun" required placeholder="Contoh: Kas BUMKal" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">SALDO NORMAL</label>
                                <select id="saldo-normal" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                                    <option value="">--Pilih--</option>
                                    <option value="Debit">Debit</option>
                                    <option value="Kredit">Kredit</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">REPORT GROUP</label>
                                <select id="report-group" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                                    <option value="">--Pilih--</option>
                                    <option value="Neraca">Neraca</option>
                                    <option value="Laba Rugi">Laba Rugi</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CASH FLOW GROUP</label>
                            <select id="cash-flow-group" disabled class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-none focus:outline-none cursor-not-allowed">
                                <option value="-">-</option>
                                <option value="Aktivitas Operasi">Aktivitas Operasi</option>
                                <option value="Aktivitas Investasi">Aktivitas Investasi</option>
                                <option value="Aktivitas Pendanaan">Aktivitas Pendanaan</option>
                                <option value="Kas dan Bank">Kas dan Bank</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PAGU</label>
                            <select id="pagu-group" disabled class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-none focus:outline-none cursor-not-allowed">
                                <option value="">--Pilih--</option>
                                <option value="Ya">Ya</option>
                                <option value="Tidak">Tidak</option>
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TIPE AKUN</label>
                                <select id="tipe-akun" disabled class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 px-3 py-2 rounded-none">
                                    <option value="Header">Header</option>
                                    <option value="Detail">Detail</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">STATUS AKUN</label>
                                <select id="status-akun" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-purple-600">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button type="button" id="btn-batal-modal" class="w-1/2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">BATAL</button>
                            <button type="submit" id="btn-simpan-akun" class="w-1/2 bg-[#581c87] hover:bg-purple-900 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">SIMPAN</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL FORM EDIT AKUN -->
            <div id="modal-edit-akun" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 transition-all duration-300">
                <div class="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-none shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-95">
                    <div class="bg-[#0b2f64] px-6 py-4 flex items-center justify-between text-white">
                        <div class="flex items-center gap-2">
                            <h2 class="text-sm font-bold tracking-wide">EDIT AKUN PERKIRAAN</h2>
                        </div>
                        <button type="button" id="btn-tutup-edit-modal" class="text-white hover:text-slate-200 transition cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <form id="form-edit-akun" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                        <input type="hidden" id="edit-id">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">LEVEL AKUN</label>
                                <input type="text" id="edit-level" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 font-bold px-3 py-2 rounded-none" readonly>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KODE AKUN</label>
                                <input type="text" id="edit-kode" class="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 font-bold px-3 py-2 rounded-none" readonly>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">NAMA AKUN</label>
                            <input type="text" id="edit-nama" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">SALDO NORMAL</label>
                                <select id="edit-saldo" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none">
                                    <option value="Debit">Debit</option>
                                    <option value="Kredit">Kredit</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">REPORT GROUP</label>
                                <select id="edit-report" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none">
                                    <option value="Neraca">Neraca</option>
                                    <option value="Laba Rugi">Laba Rugi</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">CASH FLOW GROUP</label>
                            <select id="edit-cashflow" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none">
                                <option value="-">-</option>
                                <option value="Aktivitas Operasi">Aktivitas Operasi</option>
                                <option value="Aktivitas Investasi">Aktivitas Investasi</option>
                                <option value="Aktivitas Pendanaan">Aktivitas Pendanaan</option>
                                <option value="Kas dan Bank">Kas dan Bank</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PAGU</label>
                            <select id="edit-pagu" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none">
                                <option value="">--Pilih--</option>
                                <option value="Ya">Ya</option>
                                <option value="Tidak">Tidak</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">STATUS AKUN</label>
                            <select id="edit-status" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none">
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>

                        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                            <button type="button" id="btn-batal-edit" class="w-1/2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-none transition cursor-pointer">BATAL</button>
                            <button type="submit" id="btn-perbarui-akun" class="w-1/2 bg-[#0b2f64] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">PERBARUI</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL KONFIRMASI HAPUS -->
            <div id="modal-hapus-akun" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
                <div class="relative max-w-sm w-full bg-white dark:bg-slate-900 p-6 rounded-none shadow-2xl text-center space-y-4 border border-slate-200 dark:border-slate-800">
                    <div class="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Hapus Akun Ini?</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Tindakan ini akan menghapus akun dari database secara permanen.</p>
                    </div>
                    <div class="flex items-center justify-center gap-3 pt-2">
                        <button type="button" id="btn-batal-hapus" class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold transition cursor-pointer">Batal</button>
                        <button type="button" id="btn-konfirmasi-hapus" class="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer">Ya, Hapus</button>
                    </div>
                </div>
            </div>

            <!-- TOAST NOTIFIKASI HALUS (SMOOTH NOTIFICATION) -->
            <div id="toast-notif" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div id="toast-content" class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-message">Pesan notifikasi berhasil.</span>
                </div>
            </div>
        </div>
    `;
}

export async function initCoaHandler() {
    const modal = document.getElementById('modal-tambah-akun');
    const btnBuka = document.getElementById('btn-buka-modal');
    const btnTutup = document.getElementById('btn-tutup-modal');
    const btnBatal = document.getElementById('btn-batal-modal');
    const form = document.getElementById('form-tambah-akun');
    const btnSimpan = document.getElementById('btn-simpan-akun');

    const modalEdit = document.getElementById('modal-edit-akun');
    const btnTutupEdit = document.getElementById('btn-tutup-edit-modal');
    const btnBatalEdit = document.getElementById('btn-batal-edit');
    const formEdit = document.getElementById('form-edit-akun');
    const btnPerbarui = document.getElementById('btn-perbarui-akun');

    const modalHapus = document.getElementById('modal-hapus-akun');
    const btnBatalHapus = document.getElementById('btn-batal-hapus');
    const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');

    const tableBody = document.getElementById('table-coa-body');
    const cardBody = document.getElementById('card-coa-body');
    const totalAkunEl = document.getElementById('total-akun');
    const levelAkunSelect = document.getElementById('level-akun');
    const kodeAkunInput = document.getElementById('kode-akun');
    const containerHeaderAkun = document.getElementById('container-header-akun');
    const selectHeaderAkun = document.getElementById('select-header-akun');
    const saldoNormalSelect = document.getElementById('saldo-normal');
    const reportGroupSelect = document.getElementById('report-group');
    const cashFlowSelect = document.getElementById('cash-flow-group');
    const paguSelect = document.getElementById('pagu-group');

    const filterReportSelect = document.getElementById('filter-report');
    const filterLevelSelect = document.getElementById('filter-level');

    const btnPrevPage = document.getElementById('btn-prev-page');
    const btnNextPage = document.getElementById('btn-next-page');
    const paginationInfo = document.getElementById('pagination-info');
    const pageIndicator = document.getElementById('page-indicator');

    let allCoaList = [];
    let currentDeleteId = null;
    let currentPage = 1;
    const rowsPerPage = 10;

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-notif');
        const toastMsg = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');

        if (!toast) return;

        toastMsg.textContent = message;
        if (isError) {
            toastIcon.setAttribute('class', 'w-4 h-4 text-rose-500 flex-shrink-0');
            toastIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;
        } else {
            toastIcon.setAttribute('class', 'w-4 h-4 text-emerald-400 flex-shrink-0');
            toastIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    const resetTambahForm = () => {
        if (form) form.reset();
        if (kodeAkunInput) kodeAkunInput.value = "";
        if (containerHeaderAkun) containerHeaderAkun.classList.add('hidden');
        if (cashFlowSelect) {
            cashFlowSelect.value = "-";
            cashFlowSelect.disabled = true;
            cashFlowSelect.className = "w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-none focus:outline-none cursor-not-allowed";
        }
        if (paguSelect) {
            paguSelect.value = "";
            paguSelect.disabled = true;
            paguSelect.className = "w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-none focus:outline-none cursor-not-allowed";
        }
        if (saldoNormalSelect) saldoNormalSelect.disabled = false;
        if (reportGroupSelect) reportGroupSelect.disabled = false;
        if (btnSimpan) {
            btnSimpan.disabled = false;
            btnSimpan.textContent = "SIMPAN";
        }
    };

    const toggleModal = (show) => {
        if (!modal) return;
        if (show) {
            modal.classList.remove('hidden');
            loadHeaderOptions();
        } else {
            modal.classList.add('hidden');
            resetTambahForm();
        }
    };

    const toggleEditModal = (show) => {
        if (modalEdit) {
            if (show) modalEdit.classList.remove('hidden');
            else {
                modalEdit.classList.add('hidden');
                if (btnPerbarui) {
                    btnPerbarui.disabled = false;
                    btnPerbarui.textContent = "PERBARUI";
                }
            }
        }
    };

    const toggleHapusModal = (show) => {
        if (modalHapus) {
            if (show) modalHapus.classList.remove('hidden');
            else {
                modalHapus.classList.add('hidden');
                currentDeleteId = null;
            }
        }
    };

    if (btnBuka) {
        btnBuka.onclick = () => {
            resetTambahForm();
            toggleModal(true);
        };
    }
    if (btnTutup) btnTutup.onclick = () => toggleModal(false);
    if (btnBatal) {
        btnBatal.onclick = () => {
            resetTambahForm();
            loadHeaderOptions();
        };
    }

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            if (modal && !modal.classList.contains('hidden')) {
                toggleModal(false);
            }
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    if (btnTutupEdit) btnTutupEdit.onclick = () => toggleEditModal(false);
    if (btnBatalEdit) btnBatalEdit.onclick = () => toggleEditModal(false);

    if (btnBatalHapus) btnBatalHapus.onclick = () => toggleHapusModal(false);

    function loadHeaderOptions(targetLevel = null) {
        if (!selectHeaderAkun) return;
        const level = targetLevel !== null ? targetLevel : parseInt(levelAkunSelect.value || 0);
        selectHeaderAkun.innerHTML = '<option value="">--Pilih Induk Akun--</option>';
        if (level <= 1) return;

        const parentLevel = level - 1;
        const parentAccounts = allCoaList.filter(item => parseInt(item.levelAkun) === parentLevel);

        parentAccounts.forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.kodeAkun;
            opt.textContent = `${acc.kodeAkun} - ${acc.namaAkun}`;
            selectHeaderAkun.appendChild(opt);
        });
    }

    function updateKodeDanHeader() {
        const level = parseInt(levelAkunSelect.value);
        if (!level) {
            kodeAkunInput.value = "";
            if (containerHeaderAkun) containerHeaderAkun.classList.add('hidden');
            return;
        }

        if (level > 1) {
            if (containerHeaderAkun) containerHeaderAkun.classList.remove('hidden');
            loadHeaderOptions(level);
        } else {
            if (containerHeaderAkun) containerHeaderAkun.classList.add('hidden');
            if (saldoNormalSelect) saldoNormalSelect.disabled = false;
            if (reportGroupSelect) reportGroupSelect.disabled = false;
        }

        if (cashFlowSelect && paguSelect) {
            if (level === 4) {
                cashFlowSelect.disabled = false;
                cashFlowSelect.className = "w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none";
                paguSelect.disabled = false;
                paguSelect.className = "w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none";
            } else {
                cashFlowSelect.value = "-";
                cashFlowSelect.disabled = true;
                cashFlowSelect.className = "w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 px-3 py-2 rounded-none cursor-not-allowed";
                paguSelect.value = "";
                paguSelect.disabled = true;
                paguSelect.className = "w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 px-3 py-2 rounded-none cursor-not-allowed";
            }
        }
        generateKodeOtomatis();
    }

    function onHeaderChange() {
        const selectedParentCode = selectHeaderAkun ? selectHeaderAkun.value : "";
        if (selectedParentCode) {
            const parentAcc = allCoaList.find(item => item.kodeAkun === selectedParentCode);
            if (parentAcc) {
                if (saldoNormalSelect && parentAcc.saldoNormal) {
                    saldoNormalSelect.value = parentAcc.saldoNormal;
                }
                if (reportGroupSelect && parentAcc.reportGroup) {
                    reportGroupSelect.value = parentAcc.reportGroup;
                }
            }
        }
        generateKodeOtomatis();
    }

    function generateKodeOtomatis() {
        const level = parseInt(levelAkunSelect.value);
        const selectedParent = selectHeaderAkun ? selectHeaderAkun.value : "";

        if (!level) {
            kodeAkunInput.value = "";
            return;
        }

        if (level === 1) {
            const filtered = allCoaList.filter(item => parseInt(item.levelAkun) === 1);
            let nextNum = filtered.length + 1;
            while (allCoaList.some(item => item.kodeAkun === String(nextNum))) {
                nextNum++;
            }
            kodeAkunInput.value = String(nextNum);
        } else {
            if (!selectedParent) {
                kodeAkunInput.value = "";
                return;
            }
            const children = allCoaList.filter(item => item.kodeAkun && item.kodeAkun.startsWith(selectedParent + "."));
            let nextNum = children.length + 1;

            let generatedCode = "";
            if (level === 2 || level === 3) {
                generatedCode = `${selectedParent}.${String(nextNum).padStart(2, '0')}`;
            } else if (level === 4) {
                generatedCode = `${selectedParent}.${String(nextNum).padStart(3, '0')}`;
            }

            while (allCoaList.some(item => item.kodeAkun === generatedCode)) {
                nextNum++;
                if (level === 2 || level === 3) {
                    generatedCode = `${selectedParent}.${String(nextNum).padStart(2, '0')}`;
                } else if (level === 4) {
                    generatedCode = `${selectedParent}.${String(nextNum).padStart(3, '0')}`;
                }
            }
            kodeAkunInput.value = generatedCode;
        }
    }

    if (levelAkunSelect) levelAkunSelect.onchange = updateKodeDanHeader;
    if (selectHeaderAkun) selectHeaderAkun.onchange = onHeaderChange;

    function renderTableRows() {
        if (!tableBody || !cardBody) return;

        const selectedReport = filterReportSelect ? filterReportSelect.value : "";
        const selectedLevel = filterLevelSelect ? filterLevelSelect.value : "";

        let filteredData = allCoaList.filter(item => {
            let matchReport = selectedReport === "" || item.reportGroup === selectedReport;
            let matchLevel = selectedLevel === "" || String(item.levelAkun) === selectedLevel;
            return matchReport && matchLevel;
        });

        const totalData = filteredData.length;
        if (totalAkunEl) totalAkunEl.textContent = `Total: ${totalData} Akun (${allCoaList.length} Keseluruhan)`;

        if (totalData === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400">Tidak ada data akun yang sesuai dengan filter.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data akun yang sesuai dengan filter.</div>`;
            if (paginationInfo) paginationInfo.textContent = `Menampilkan 0 - 0 dari 0 data`;
            if (pageIndicator) pageIndicator.textContent = `1 / 1`;
            if (btnPrevPage) btnPrevPage.disabled = true;
            if (btnNextPage) btnNextPage.disabled = true;
            return;
        }

        // Paginasi HANYA berlaku untuk Desktop Table
        const totalPages = Math.ceil(totalData / rowsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * rowsPerPage;
        const endIdx = Math.min(startIdx + rowsPerPage, totalData);
        const paginatedDataForDesktop = filteredData.slice(startIdx, endIdx);

        let htmlTable = "";
        let htmlCard = "";

        // Render Desktop (Menggunakan data yang dipaginasi)
        paginatedDataForDesktop.forEach(item => {
            const isLevel4 = String(item.levelAkun) === "4";
            const statusBadge = item.statusAkun === 'Aktif'
                ? '<span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">Aktif</span>'
                : '<span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Nonaktif</span>';

            const hapusBtnDesktop = isLevel4
                ? `<button data-delete-id="${item.id}" class="btn-delete px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>`
                : "";

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-2 px-4 font-bold text-indigo-600 dark:text-indigo-400">${item.kodeAkun || '-'}</td>
                    <td class="py-2 px-4 font-semibold text-slate-800 dark:text-slate-200">${item.namaAkun || '-'}</td>
                    <td class="py-2 px-4">Level ${item.levelAkun || '-'}</td>
                    <td class="py-2 px-4">${item.saldoNormal || '-'}</td>
                    <td class="py-2 px-4">${item.reportGroup || '-'}</td>
                    <td class="py-2 px-4">${statusBadge}</td>
                    <td class="py-2 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button data-edit-id="${item.id}" class="btn-edit px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            ${hapusBtnDesktop}
                        </div>
                    </td>
                </tr>
            `;
        });

        // Render Mobile / HP Card (Menampilkan SEMUA data tanpa dibatasi paginasi, dengan jarak rapat)
        filteredData.forEach(item => {
            const isLevel4 = String(item.levelAkun) === "4";
            const statusBadge = item.statusAkun === 'Aktif'
                ? '<span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">Aktif</span>'
                : '<span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Nonaktif</span>';

            const hapusBtnCard = isLevel4
                ? `<button data-delete-id="${item.id}" class="btn-delete px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>`
                : "";

            htmlCard += `
                <div class="p-3 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${item.kodeAkun || '-'}</span>
                        <div class="flex items-center gap-2">
                            ${statusBadge}
                            <span class="text-[11px] font-semibold text-slate-500">Level ${item.levelAkun || '-'}</span>
                        </div>
                    </div>
                    <div>
                        <p class="font-bold text-slate-800 dark:text-slate-100 text-[13px]">${item.namaAkun || '-'}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <div>Saldo: <span class="font-semibold text-slate-700 dark:text-slate-300">${item.saldoNormal || '-'}</span></div>
                        <div>Grup: <span class="font-semibold text-slate-700 dark:text-slate-300">${item.reportGroup || '-'}</span></div>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-1">
                        <button data-edit-id="${item.id}" class="btn-edit px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                        ${hapusBtnCard}
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;

        if (paginationInfo) paginationInfo.textContent = `Menampilkan ${startIdx + 1} - ${endIdx} dari ${totalData} data`;
        if (pageIndicator) pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        if (btnPrevPage) btnPrevPage.disabled = currentPage === 1;
        if (btnNextPage) btnNextPage.disabled = currentPage === totalPages;

        // Pasang Event Handler untuk Tombol Edit & Hapus (Hapus hanya untuk Level 4)
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-edit-id');
                const acc = allCoaList.find(a => a.id === id);
                if (acc) {
                    document.getElementById('edit-id').value = acc.id;
                    document.getElementById('edit-level').value = `Level ${acc.levelAkun}`;
                    document.getElementById('edit-kode').value = acc.kodeAkun;
                    document.getElementById('edit-nama').value = acc.namaAkun;
                    document.getElementById('edit-saldo').value = acc.saldoNormal || 'Debit';
                    document.getElementById('edit-report').value = acc.reportGroup || 'Neraca';
                    document.getElementById('edit-cashflow').value = acc.cashFlowGroup || '-';
                    document.getElementById('edit-pagu').value = acc.pagu || '';
                    document.getElementById('edit-status').value = acc.statusAkun || 'Aktif';
                    toggleEditModal(true);
                }
            };
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-delete-id');
                const acc = allCoaList.find(a => a.id === id);
                if (!acc || String(acc.levelAkun) !== "4") {
                    showToast("Penghapusan hanya diizinkan untuk akun Level 4.", true);
                    return;
                }
                currentDeleteId = id;
                toggleHapusModal(true);
            };
        });
    }

    if (filterReportSelect) {
        filterReportSelect.onchange = () => {
            currentPage = 1;
            renderTableRows();
        };
    }
    if (filterLevelSelect) {
        filterLevelSelect.onchange = () => {
            currentPage = 1;
            renderTableRows();
        };
    }

    if (btnPrevPage) {
        btnPrevPage.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTableRows();
            }
        };
    }

    if (btnNextPage) {
        btnNextPage.onclick = () => {
            const selectedReport = filterReportSelect ? filterReportSelect.value : "";
            const selectedLevel = filterLevelSelect ? filterLevelSelect.value : "";
            const filteredData = allCoaList.filter(item => {
                let matchReport = selectedReport === "" || item.reportGroup === selectedReport;
                let matchLevel = selectedLevel === "" || String(item.levelAkun) === selectedLevel;
                return matchReport && matchLevel;
            });
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTableRows();
            }
        };
    }

    async function loadCoaData() {
        if (!tableBody || !cardBody) return;
        try {
            const q = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const querySnapshot = await getDocs(q);

            allCoaList = [];
            querySnapshot.forEach((docSnap) => {
                allCoaList.push({ id: docSnap.id, ...docSnap.data() });
            });

            renderTableRows();
        } catch (err) {
            console.error("Gagal memuat COA:", err);
            tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const levelVal = document.getElementById('level-akun').value;
            const kodeVal = document.getElementById('kode-akun').value;

            if (!kodeVal) {
                showToast("Kode akun belum terbentuk dengan benar.", true);
                return;
            }

            const isDuplicate = allCoaList.some(item => item.kodeAkun === kodeVal);
            if (isDuplicate) {
                showToast(`Kode Akun "${kodeVal}" sudah terdaftar di database!`, true);
                return;
            }

            if (btnSimpan) {
                btnSimpan.disabled = true;
                btnSimpan.textContent = "Menyimpan...";
            }

            const newData = {
                levelAkun: levelVal,
                kodeAkun: kodeVal,
                headerInduk: levelVal > 1 ? selectHeaderAkun.value : "",
                namaAkun: document.getElementById('nama-akun').value,
                saldoNormal: document.getElementById('saldo-normal').value,
                reportGroup: document.getElementById('report-group').value,
                cashFlowGroup: levelVal === "4" ? document.getElementById('cash-flow-group').value : "-",
                pagu: levelVal === "4" ? document.getElementById('pagu-group').value : "",
                tipeAkun: parseInt(levelVal) < 4 ? "Header" : "Detail",
                statusAkun: document.getElementById('status-akun').value,
                createdAt: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, "coa"), newData);
                showToast("Akun baru berhasil disimpan!");
                resetTambahForm();
                await loadCoaData();
                loadHeaderOptions();
            } catch (err) {
                console.error("Gagal menyimpan akun:", err);
                showToast("Terjadi kesalahan saat menyimpan data.", true);
                if (btnSimpan) {
                    btnSimpan.disabled = false;
                    btnSimpan.textContent = "SIMPAN";
                }
            }
        };
    }

    if (formEdit) {
        formEdit.onsubmit = async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const kodeVal = document.getElementById('edit-kode').value;
            const namaBaru = document.getElementById('edit-nama').value.trim();

            const oldAcc = allCoaList.find(a => a.id === id);
            const namaLama = oldAcc ? (oldAcc.namaAkun || "").trim() : "";

            if (btnPerbarui) {
                btnPerbarui.disabled = true;
                btnPerbarui.textContent = "Memperbarui...";
            }

            const nowIso = new Date().toISOString();
            const updatedData = {
                namaAkun: namaBaru,
                saldoNormal: document.getElementById('edit-saldo').value,
                reportGroup: document.getElementById('edit-report').value,
                cashFlowGroup: document.getElementById('edit-cashflow').value,
                pagu: document.getElementById('edit-pagu').value,
                statusAkun: document.getElementById('edit-status').value,
                updatedAt: nowIso
            };

            try {
                const batch = writeBatch(db);
                const docRef = doc(db, "coa", id);
                batch.update(docRef, updatedData);

                const childAccounts = allCoaList.filter(item =>
                    item.id !== id &&
                    typeof item.kodeAkun === "string" &&
                    item.kodeAkun.startsWith(kodeVal + ".")
                );

                let syncedChildrenCount = 0;
                childAccounts.forEach(child => {
                    const childPatch = {
                        namaHeaderInduk: namaBaru,
                        updatedAt: nowIso
                    };

                    if (
                        namaLama &&
                        namaLama !== namaBaru &&
                        typeof child.namaAkun === "string" &&
                        child.namaAkun.startsWith(namaLama)
                    ) {
                        childPatch.namaAkun = namaBaru + child.namaAkun.slice(namaLama.length);
                    }

                    batch.update(doc(db, "coa", child.id), childPatch);
                    syncedChildrenCount++;
                });

                await batch.commit();

                showToast(
                    syncedChildrenCount > 0
                        ? `Akun diperbarui beserta ${syncedChildrenCount} akun turunan!`
                        : "Akun berhasil diperbarui!"
                );
                toggleEditModal(false);
                await loadCoaData();
            } catch (err) {
                console.error("Gagal memperbarui akun:", err);
                showToast("Terjadi kesalahan saat memperbarui data.", true);
                if (btnPerbarui) {
                    btnPerbarui.disabled = false;
                    btnPerbarui.textContent = "PERBARUI";
                }
            }
        };
    }

    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.onclick = async () => {
            if (!currentDeleteId) return;
            const targetAcc = allCoaList.find(a => a.id === currentDeleteId);
            if (!targetAcc || String(targetAcc.levelAkun) !== "4") {
                toggleHapusModal(false);
                showToast("Hanya akun Level 4 yang dapat dihapus.", true);
                return;
            }
            try {
                await deleteDoc(doc(db, "coa", currentDeleteId));
                toggleHapusModal(false);
                showToast("Akun berhasil dihapus!");
                loadCoaData();
            } catch (err) {
                console.error("Gagal menghapus akun:", err);
                showToast("Terjadi kesalahan saat menghapus data.", true);
            }
        };
    }

    loadCoaData();
}