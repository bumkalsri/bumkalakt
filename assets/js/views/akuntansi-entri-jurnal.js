// File: assets/js/views/akuntansi-entri-jurnal.js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderAkuntansiEntriJurnal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/akuntansi" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Akuntansi</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Entri Jurnal Umum</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola pencatatan transaksi jurnal finansial BUMKal.</p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-buka-modal-jurnal" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
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
                    <button id="btn-reset-filter" class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 border border-slate-300 dark:border-slate-700 transition cursor-pointer">Reset Filter</button>
                </div>
            </div>

            <!-- Daftar Transaksi Jurnal (Responsive: Tabel Desktop & Card Mobile) -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Transaksi Jurnal Umum</h3>
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
                                <th class="py-2.5 px-4 font-semibold">Rincian Transaksi & Keterangan</th>
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
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <h2 id="modal-title" class="text-xs md:text-sm font-bold tracking-wide truncate">Form Input Jurnal Umum Baru</h2>
                        </div>
                        <button id="btn-tutup-modal" class="text-white hover:text-slate-200 transition cursor-pointer p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <!-- Modal Body Form -->
                    <form id="form-entri-jurnal" class="p-4 md:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
                        <input type="hidden" id="edit-jurnal-id" value="">
                        
                        <!-- Baris 1: Tanggal, No Ref, Unit Usaha -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div>
                                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Transaksi</label>
                                <input type="date" id="tgl-transaksi" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
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
                                <span>Rincian Akun Jurnal (Debet & Kredit)</span>
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
                            <button type="button" id="btn-batal-modal" class="bg-slate-500 hover:bg-slate-600 text-white font-bold px-5 py-2.5 rounded-none transition cursor-pointer">Batal</button>
                            <button type="submit" id="btn-simpan-jurnal" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Jurnal</button>
                        </div>
                    </form>
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

export async function initAkuntansiEntriJurnalHandler() {
    const modal = document.getElementById('modal-entri-jurnal');
    const modalTitle = document.getElementById('modal-title');
    const editJurnalIdInput = document.getElementById('edit-jurnal-id');
    const btnBuka = document.getElementById('btn-buka-modal-jurnal');
    const btnTutup = document.getElementById('btn-tutup-modal');
    const btnBatal = document.getElementById('btn-batal-modal');
    const form = document.getElementById('form-entri-jurnal');
    const btnSimpan = document.getElementById('btn-simpan-jurnal');

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

    let allJurnalList = [];
    let coaLevel4List = [];

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

        const dateObj = new Date(tglVal);
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yy = String(dateObj.getFullYear()).slice(-2);
        const mmyy = `${mm}${yy}`;

        const prefix = `JRU${kodeUnit}-${mmyy}-`;

        const existingCount = allJurnalList.filter(item => item.noRef && item.noRef.startsWith(prefix)).length;
        const nextNum = existingCount + 1;
        const noUrut = String(nextNum).padStart(4, '0');

        noRefInput.value = `${prefix}${noUrut}`;
    }

    if (tglTransaksiInput) tglTransaksiInput.onchange = generateNoReferensi;
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
            optionsHtml += `<option value="${coa.kodeAkun}" ${selected}>${coa.kodeAkun} - ${coa.namaAkun}</option>`;
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
                <input type="text" value="${formattedDebet}" class="row-debet w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none text-right focus:outline-none focus:border-indigo-600 font-bold">
            </td>
            <td class="py-2.5 px-3 text-right">
                <input type="text" value="${formattedKredit}" class="row-kredit w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-none text-right focus:outline-none focus:border-indigo-600 font-bold">
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

    const toggleModal = (show, isEdit = false) => {
        if (modal) {
            if (show) {
                modal.classList.remove('hidden');
                if (!isEdit) {
                    resetFormBaru();
                }
            } else {
                modal.classList.add('hidden');
                resetFormBaru();
            }
        }
    };

    function resetFormBaru() {
        if (editJurnalIdInput) editJurnalIdInput.value = "";
        if (modalTitle) modalTitle.textContent = "Form Input Jurnal Umum Baru";
        if (tglTransaksiInput) {
            tglTransaksiInput.value = new Date().toISOString().split('T')[0];
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
    }

    if (btnBuka) btnBuka.onclick = () => toggleModal(true, false);
    if (btnTutup) btnTutup.onclick = () => toggleModal(false, false);

    if (btnBatal) {
        btnBatal.onclick = (e) => {
            e.preventDefault();
            resetFormBaru();
            showToast("Form berhasil direset.");
        };
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            toggleModal(false, false);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    function renderJurnalData() {
        if (!tableBody || !cardBody) return;

        const keyword = filterKeyword ? filterKeyword.value.toLowerCase() : "";
        const unit = filterUnit ? filterUnit.value : "";
        const tglMulai = filterTglMulai ? filterTglMulai.value : "";
        const tglSampai = filterTglSampai ? filterTglSampai.value : "";

        let filtered = allJurnalList.filter(item => {
            const matchKeyword = (item.noRef && item.noRef.toLowerCase().includes(keyword)) || 
                                 (item.keterangan && item.keterangan.toLowerCase().includes(keyword)) ||
                                 (item.rincian && item.rincian.some(r => r.namaAkun.toLowerCase().includes(keyword)));
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
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi jurnal umum.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Belum ada data transaksi jurnal umum.</div>`;
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
                    rincianHtml += `<div class="text-[11px] text-slate-600 dark:text-slate-400">&bull; <span class="font-bold">${r.kodeAkun}</span> - ${r.namaAkun}: <span class="text-indigo-600 font-semibold">D: Rp ${(r.debet||0).toLocaleString('id-ID')}</span> | <span class="text-purple-600 font-semibold">K: Rp ${(r.kredit||0).toLocaleString('id-ID')}</span></div>`;
                });
            }

            const ketUraian = item.keterangan || '-';

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition align-top">
                    <td class="py-3 px-4 font-medium">${item.tglTransaksi || '-'}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${item.noRef || '-'}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${item.unitUsaha || '-'}</span></td>
                    <td class="py-3 px-4 space-y-1.5">
                        <div class="font-bold text-slate-800 dark:text-slate-200">${ketUraian}</div>
                        <div class="space-y-0.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-2">${rincianHtml}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">Rp ${totalNilai.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button data-edit-id="${item.id}" class="btn-edit-jurnal px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button data-delete-id="${item.id}" class="btn-delete-jurnal px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${item.noRef || '-'}</span>
                        <span class="text-[11px] text-slate-500">${item.tglTransaksi || '-'}</span>
                    </div>
                    <div>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${item.unitUsaha || '-'}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">Ket: ${ketUraian}</div>
                    <div class="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800">
                        ${rincianHtml}
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="font-bold text-slate-800 dark:text-slate-100">Total: Rp ${totalNilai.toLocaleString('id-ID')}</span>
                        <div class="flex items-center gap-1">
                            <button data-edit-id="${item.id}" class="btn-edit-jurnal px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition text-[11px] font-medium cursor-pointer">Edit</button>
                            <button data-delete-id="${item.id}" class="btn-delete-jurnal px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition text-[11px] font-medium cursor-pointer">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;

        document.querySelectorAll('.btn-edit-jurnal').forEach(btn => {
            btn.onclick = () => {
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

                toggleModal(true, true);
            };
        });

        document.querySelectorAll('.btn-delete-jurnal').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-id');
                if (confirm("Apakah Anda yakin ingin menghapus transaksi jurnal ini?")) {
                    try {
                        await deleteDoc(doc(db, "jurnal_umum", id));
                        showToast("Transaksi jurnal berhasil dihapus!");
                        loadJurnalData();
                    } catch (err) {
                        console.error("Gagal menghapus jurnal:", err);
                        showToast("Gagal menghapus transaksi.", true);
                    }
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
                tglTransaksi: document.getElementById('tgl-transaksi').value,
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
                
                loadJurnalData();
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

    loadCoaData().then(() => {
        loadJurnalData();
    });
}