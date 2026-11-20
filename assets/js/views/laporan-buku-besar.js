// File: assets/js/views/laporan-buku-besar.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const DEFAULT_UNIT = "KANTOR PUSAT (01)";
const PAGE_SIZE = 5;

function normalizePeriodKey(val) {
    const s = String(val || "").trim();
    const m = s.match(/^(\d{4}-\d{2})/);
    return m ? m[1] : "";
}

function matchesUnitFilter(docUnitRaw, selectedUnit) {
    if (!selectedUnit) return true;
    const docUnit = String(docUnitRaw || "").trim();
    if (!docUnit) return selectedUnit === DEFAULT_UNIT;
    return docUnit === selectedUnit;
}

export function renderLaporanBukuBesar() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/laporan" data-link title="Kembali ke Menu Laporan" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Buku Besar (General Ledger)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rincian saldo awal, mutasi, dan saldo akun perkiraan BUMKal.</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button type="button" id="btn-cetak-buku-besar" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                <div class="md:col-span-2">
                    <label for="filter-akun" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PILIH AKUN PERKIRAAN *</label>
                    <select id="filter-akun" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none transition focus:outline-none focus:border-indigo-600">
                        <option value="">-- Pilih Akun COA --</option>
                    </select>
                </div>
                <div>
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none transition focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none transition focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button type="button" id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan</button>
                </div>
            </div>

            <!-- Info Akun Terpilih & Saldo -->
            <div id="info-akun-card" class="hidden bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                    <p class="font-bold text-slate-500 uppercase text-[10px]">Kode & Nama Akun</p>
                    <h3 id="info-nama-akun" class="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">-</h3>
                </div>
                <div>
                    <p class="font-bold text-slate-500 uppercase text-[10px]">Total Mutasi (Debet / Kredit)</p>
                    <h3 id="info-mutasi" class="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">D: Rp 0 | K: Rp 0</h3>
                </div>
                <div>
                    <p class="font-bold text-slate-500 uppercase text-[10px]">Saldo Akhir Akun</p>
                    <h3 id="info-saldo-akhir" class="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">Rp 0</h3>
                </div>
            </div>

            <!-- Tabel Buku Besar -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Mutasi Transaksi Buku Besar</h3>
                    <span id="total-mutasi-label" class="text-[11px] text-slate-500 font-medium">Silakan pilih akun perkiraan terlebih dahulu</span>
                </div>

                <!-- TAMPILAN DESKTOP (Tabel) -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">Tanggal</th>
                                <th class="py-2.5 px-4 font-semibold">No. Ref</th>
                                <th class="py-2.5 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Keterangan / Uraian</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Debet (Rp)</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Kredit (Rp)</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Saldo (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-buku-besar-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="7" class="py-8 text-center text-slate-400">Silakan pilih akun perkiraan dan klik Tampilkan.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- TAMPILAN MOBILE / HP (Card View) -->
                <div id="card-buku-besar-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Silakan pilih akun perkiraan dan klik Tampilkan.</div>
                </div>

                <!-- Kontrol Paginasi (5 Baris / Halaman) -->
                <div id="pagination-buku-besar" class="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span id="info-halaman-buku-besar" class="text-[11px] text-slate-500 dark:text-slate-400">Halaman 0 dari 0 (Maks. 5 baris/halaman)</span>
                    <div id="kontrol-halaman-buku-besar" class="flex items-center gap-1 flex-wrap justify-center"></div>
                </div>
            </div>

            <!-- Toast Notifikasi Smooth (Kotak Siku) -->
            <div id="toast-buku-besar" class="fixed bottom-6 right-6 z-50 transform translate-y-6 opacity-0 transition-all duration-250 ease-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-buku-besar-icon" class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/>
                    </svg>
                    <span id="toast-buku-besar-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let laporanBukuBesarCleanup = null;
let toastBukuBesarTimer = null;

export function initLaporanBukuBesarHandler() {
    if (typeof laporanBukuBesarCleanup === 'function') {
        laporanBukuBesarCleanup();
        laporanBukuBesarCleanup = null;
    }

    const filterAkun = document.getElementById('filter-akun');
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-buku-besar');

    const infoCard = document.getElementById('info-akun-card');
    const infoNamaAkun = document.getElementById('info-nama-akun');
    const infoMutasi = document.getElementById('info-mutasi');
    const infoSaldoAkhir = document.getElementById('info-saldo-akhir');

    const tableBody = document.getElementById('table-buku-besar-body');
    const cardBody = document.getElementById('card-buku-besar-body');
    const totalMutasiLabel = document.getElementById('total-mutasi-label');
    const infoHalaman = document.getElementById('info-halaman-buku-besar');
    const kontrolHalaman = document.getElementById('kontrol-halaman-buku-besar');

    let coaList = [];
    let allSaldoAwalList = [];
    let allJurnalList = [];
    let currentDisplayRows = [];
    let currentPage = 1;

    function showToast(message, isWarning = true) {
        const toast = document.getElementById('toast-buku-besar');
        const msgEl = document.getElementById('toast-buku-besar-message');
        const iconEl = document.getElementById('toast-buku-besar-icon');
        if (!toast || !msgEl) return;

        if (toastBukuBesarTimer) clearTimeout(toastBukuBesarTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isWarning ? 'w-4 h-4 text-amber-400 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isWarning
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        toastBukuBesarTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
        }, 2800);
    }

    function renderPagination(totalItems, totalPages, startIdx, endIdx) {
        if (!infoHalaman || !kontrolHalaman) return;

        if (totalItems === 0) {
            infoHalaman.textContent = "Halaman 0 dari 0 (Maks. 5 baris/halaman)";
            kontrolHalaman.innerHTML = "";
            return;
        }

        infoHalaman.textContent = `Menampilkan ${startIdx + 1}–${endIdx} dari ${totalItems} baris (Halaman ${currentPage} dari ${totalPages} • 5 baris/halaman)`;

        let btns = `
            <button type="button" data-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""} class="btn-page-bb px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition cursor-pointer">Sebelumnya</button>
        `;

        for (let p = 1; p <= totalPages; p++) {
            const activeClass = p === currentPage
                ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800";
            btns += `<button type="button" data-page="${p}" class="btn-page-bb px-2.5 py-1 border ${activeClass} rounded-none transition cursor-pointer">${p}</button>`;
        }

        btns += `
            <button type="button" data-page="${currentPage + 1}" ${currentPage >= totalPages ? "disabled" : ""} class="btn-page-bb px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition cursor-pointer">Berikutnya</button>
        `;

        kontrolHalaman.innerHTML = btns;

        kontrolHalaman.querySelectorAll('.btn-page-bb').forEach(btn => {
            btn.onclick = () => {
                const targetPage = Number(btn.getAttribute('data-page'));
                if (Number.isFinite(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                    currentPage = targetPage;
                    renderCurrentPage();
                }
            };
        });
    }

    function renderCurrentPage() {
        const totalItems = currentDisplayRows.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = Math.min(startIdx + PAGE_SIZE, totalItems);
        const pageItems = currentDisplayRows.slice(startIdx, endIdx);

        renderPagination(totalItems, totalPages, startIdx, endIdx);

        if (pageItems.length === 0) {
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada transaksi mutasi untuk akun ini.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada transaksi mutasi untuk akun ini.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        pageItems.forEach(row => {
            if (row.isSaldoAwal) {
                htmlTable += `
                    <tr class="bg-slate-50/90 dark:bg-slate-950/80 font-semibold text-slate-800 dark:text-slate-100">
                        <td class="py-2.5 px-4 text-slate-500">${row.tglTransaksi}</td>
                        <td class="py-2.5 px-4 font-bold text-slate-600 dark:text-slate-300">${row.noRef}</td>
                        <td class="py-2.5 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${row.unitUsaha}</span></td>
                        <td class="py-2.5 px-4">${row.keterangan}</td>
                        <td class="py-2.5 px-4 text-right text-slate-500">-</td>
                        <td class="py-2.5 px-4 text-right text-slate-500">-</td>
                        <td class="py-2.5 px-4 text-right font-bold text-indigo-700 dark:text-indigo-400">Rp ${row.saldo.toLocaleString('id-ID')}</td>
                    </tr>
                `;

                htmlCard += `
                    <div class="p-4 space-y-2 bg-slate-50/80 dark:bg-slate-950/70 text-xs border-b border-slate-200 dark:border-slate-800">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-slate-700 dark:text-slate-200">${row.noRef}</span>
                            <span class="text-[11px] text-slate-500">${row.tglTransaksi}</span>
                        </div>
                        <div class="font-semibold text-slate-800 dark:text-slate-100">${row.keterangan}</div>
                        <div class="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
                            <span class="text-[11px] text-slate-500">${row.unitUsaha}</span>
                            <span class="font-bold text-indigo-700 dark:text-indigo-400">Saldo: Rp ${row.saldo.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                `;
                return;
            }

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium">${row.tglTransaksi}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${row.noRef}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${row.unitUsaha}</span></td>
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${row.keterangan}</td>
                    <td class="py-3 px-4 text-right text-indigo-600 font-semibold">${row.debet > 0 ? 'Rp ' + row.debet.toLocaleString('id-ID') : '-'}</td>
                    <td class="py-3 px-4 text-right text-purple-600 font-semibold">${row.kredit > 0 ? 'Rp ' + row.kredit.toLocaleString('id-ID') : '-'}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">Rp ${row.saldo.toLocaleString('id-ID')}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${row.noRef}</span>
                        <span class="text-[11px] text-slate-500">${row.tglTransaksi}</span>
                    </div>
                    <div>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${row.unitUsaha}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">${row.keterangan}</div>
                    <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div>Debet: <span class="font-semibold text-indigo-600">${row.debet > 0 ? 'Rp ' + row.debet.toLocaleString('id-ID') : '-'}</span></div>
                        <div>Kredit: <span class="font-semibold text-purple-600">${row.kredit > 0 ? 'Rp ' + row.kredit.toLocaleString('id-ID') : '-'}</span></div>
                        <div class="text-right font-bold">Saldo: Rp ${row.saldo.toLocaleString('id-ID')}</div>
                    </div>
                </div>
            `;
        });

        if (tableBody) tableBody.innerHTML = htmlTable;
        if (cardBody) cardBody.innerHTML = htmlCard;
    }

    async function loadCoa() {
        try {
            const q = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const querySnapshot = await getDocs(q);
            coaList = [];
            let optionsHtml = '<option value="">-- Pilih Akun COA --</option>';
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (String(data.levelAkun) === "4" || data.tipeAkun === "Detail") {
                    coaList.push(data);
                    optionsHtml += `<option value="${data.kodeAkun}">${data.kodeAkun} - ${data.namaAkun}</option>`;
                }
            });
            if (filterAkun) filterAkun.innerHTML = optionsHtml;
        } catch (err) {
            console.error("Gagal memuat COA:", err);
        }
    }

    async function loadSaldoAwalData() {
        try {
            const querySnapshot = await getDocs(collection(db, "saldo_awal"));
            allSaldoAwalList = [];
            querySnapshot.forEach((docSnap) => {
                allSaldoAwalList.push({ id: docSnap.id, ...docSnap.data() });
            });
        } catch (err) {
            console.warn("Gagal memuat saldo awal:", err);
            allSaldoAwalList = [];
        }
    }

    async function loadJurnalData() {
        try {
            const q = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const querySnapshot = await getDocs(q);
            allJurnalList = [];
            querySnapshot.forEach((docSnap) => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });
        } catch (err) {
            console.error("Gagal memuat jurnal umum:", err);
        }
    }

    function prosesBukuBesar() {
        const selectedKodeAkun = filterAkun ? filterAkun.value : "";
        if (!selectedKodeAkun) {
            showToast("Silakan pilih Akun Perkiraan terlebih dahulu!", true);
            if (filterAkun) {
                filterAkun.classList.remove('border-slate-300', 'dark:border-slate-700');
                filterAkun.classList.add('border-amber-500');
                filterAkun.focus();
                setTimeout(() => {
                    filterAkun.classList.remove('border-amber-500');
                    filterAkun.classList.add('border-slate-300', 'dark:border-slate-700');
                }, 1500);
            }
            return;
        }

        const selectedCoa = coaList.find(c => c.kodeAkun === selectedKodeAkun);
        const namaAkunStr = selectedCoa ? `${selectedCoa.kodeAkun} - ${selectedCoa.namaAkun}` : selectedKodeAkun;
        const rawNormal = selectedCoa?.normalBalance || selectedCoa?.saldoNormal || "debet";
        const normalBalance = String(rawNormal).toLowerCase().includes("kredit") ? "kredit" : "debet";

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const startPeriod = normalizePeriodKey(tglMulaiVal);

        let saldoAwalDebet = 0;
        let saldoAwalKredit = 0;
        let periodeSaldoAwal = "";

        allSaldoAwalList.forEach(sa => {
            if (String(sa.kodeAkun || "").trim() !== selectedKodeAkun) return;
            if (!matchesUnitFilter(sa.unitUsaha, unitVal)) return;

            const pKey = normalizePeriodKey(sa.periode);
            if (startPeriod && pKey && pKey > startPeriod) return;

            saldoAwalDebet += parseFloat(sa.debit) || 0;
            saldoAwalKredit += parseFloat(sa.kredit) || 0;
            if (pKey && (!periodeSaldoAwal || pKey > periodeSaldoAwal)) {
                periodeSaldoAwal = pKey;
            }
        });

        if (tglMulaiVal) {
            allJurnalList.forEach(item => {
                if (!matchesUnitFilter(item.unitUsaha, unitVal)) return;
                const tglItem = item.tglTransaksi || '';
                if (!tglItem || tglItem >= tglMulaiVal) return;

                if (item.rincian && Array.isArray(item.rincian)) {
                    item.rincian.forEach(r => {
                        if (String(r.kodeAkun || "").trim() === selectedKodeAkun) {
                            saldoAwalDebet += parseFloat(r.debet) || 0;
                            saldoAwalKredit += parseFloat(r.kredit) || 0;
                        }
                    });
                }
            });
        }

        const saldoAwalNet = normalBalance === "kredit"
            ? (saldoAwalKredit - saldoAwalDebet)
            : (saldoAwalDebet - saldoAwalKredit);

        let mutasiList = [];
        allJurnalList.forEach(item => {
            if (!matchesUnitFilter(item.unitUsaha, unitVal)) return;

            const tglItem = item.tglTransaksi || '';
            if (tglMulaiVal && tglItem && tglItem < tglMulaiVal) return;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    if (String(r.kodeAkun || "").trim() === selectedKodeAkun) {
                        mutasiList.push({
                            tglTransaksi: tglItem,
                            noRef: item.noRef || '-',
                            unitUsaha: item.unitUsaha || DEFAULT_UNIT,
                            keterangan: item.keterangan || '-',
                            debet: parseFloat(r.debet) || 0,
                            kredit: parseFloat(r.kredit) || 0
                        });
                    }
                });
            }
        });

        mutasiList.sort((a, b) => a.tglTransaksi.localeCompare(b.tglTransaksi));

        let runningBalance = saldoAwalNet;
        let totalDebet = 0;
        let totalKredit = 0;

        const processedMutasi = mutasiList.map(m => {
            totalDebet += m.debet;
            totalKredit += m.kredit;

            if (normalBalance === "kredit") {
                runningBalance += (m.kredit - m.debet);
            } else {
                runningBalance += (m.debet - m.kredit);
            }

            return {
                ...m,
                saldo: runningBalance
            };
        });

        if (infoCard) infoCard.classList.remove('hidden');
        if (infoNamaAkun) infoNamaAkun.textContent = namaAkunStr;
        if (infoMutasi) infoMutasi.textContent = `D: Rp ${totalDebet.toLocaleString('id-ID')} | K: Rp ${totalKredit.toLocaleString('id-ID')}`;
        if (infoSaldoAkhir) infoSaldoAkhir.textContent = `Rp ${runningBalance.toLocaleString('id-ID')}`;
        if (totalMutasiLabel) {
            totalMutasiLabel.textContent = `Saldo Awal: Rp ${saldoAwalNet.toLocaleString('id-ID')} • ${processedMutasi.length} Baris Mutasi`;
        }

        const labelSaldoAwal = tglMulaiVal
            ? `Saldo Awal s/d ${tglMulaiVal}${periodeSaldoAwal ? ` (Periode ${periodeSaldoAwal})` : ''}`
            : `Saldo Awal${periodeSaldoAwal ? ` (${periodeSaldoAwal})` : ''}`;

        currentDisplayRows = [
            {
                isSaldoAwal: true,
                tglTransaksi: periodeSaldoAwal || (tglMulaiVal || 'Awal'),
                noRef: 'SALDO-AWAL',
                unitUsaha: unitVal || 'Semua Unit',
                keterangan: labelSaldoAwal,
                debet: 0,
                kredit: 0,
                saldo: saldoAwalNet
            },
            ...processedMutasi
        ];

        currentPage = 1;
        renderCurrentPage();
    }

    const onPrint = () => {
        window.print();
    };

    if (btnTampilkan) {
        btnTampilkan.onclick = prosesBukuBesar;
    }

    if (btnCetak) {
        btnCetak.addEventListener('click', onPrint);
    }

    const cleanup = () => {
        if (toastBukuBesarTimer) {
            clearTimeout(toastBukuBesarTimer);
            toastBukuBesarTimer = null;
        }
        if (btnCetak) btnCetak.removeEventListener('click', onPrint);
        window.removeEventListener('hashchange', cleanup);
        laporanBukuBesarCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    laporanBukuBesarCleanup = cleanup;

    Promise.all([loadCoa(), loadSaldoAwalData(), loadJurnalData()]);

    return cleanup;
}

// Alias ekspor agar tetap kompatibel dengan pemanggilan lama bila diperlukan
export const renderBukuBesar = renderLaporanBukuBesar;
export const initBukuBesarHandler = initLaporanBukuBesarHandler;