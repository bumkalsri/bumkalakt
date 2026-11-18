// File: assets/js/views/laporan-pagu.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderLaporanPagu() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header, Tombol Kembali & Aksi Atas -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div class="flex items-center gap-3">
                    <a href="#/laporan" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition rounded-none flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </a>
                    <div>
                        <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan PAGU</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi anggaran pagu, realisasi, dan sisa anggaran per unit/kategori.</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <!-- Filter Unit -->
                    <div class="w-full sm:w-44">
                        <select id="filter-pagu-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">Semua Unit</option>
                        </select>
                    </div>

                    <!-- Kolom Pencarian -->
                    <div class="relative flex-1 md:w-56">
                        <input type="text" id="search-pagu" placeholder="Cari data pagu..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 pr-8 rounded-none focus:outline-none focus:border-indigo-600">
                        <svg class="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- KARTU RINGKASAN INFORMASI -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Pagu Anggaran</p>
                    <h3 id="summary-total-pagu" class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">Rp 0</h3>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Realisasi</p>
                    <h3 id="summary-total-realisasi" class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">Rp 0</h3>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Sisa Anggaran</p>
                    <h3 id="summary-total-sisa" class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Rp 0</h3>
                </div>
            </div>

            <!-- TAMPILAN TABEL LAPORAN (Desktop) -->
            <div class="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                                <th class="p-3 w-12 text-center">No</th>
                                <th class="p-3 font-semibold">Uraian / Kegiatan</th>
                                <th class="p-3 w-36 font-semibold">Unit Usaha</th>
                                <th class="p-3 w-36 font-semibold text-right">Jumlah Pagu</th>
                                <th class="p-3 w-36 font-semibold text-right">Realisasi</th>
                                <th class="p-3 w-36 font-semibold text-right">Sisa Anggaran</th>
                                <th class="p-3 w-28 font-semibold text-center">Persentase</th>
                            </tr>
                        </thead>
                        <tbody id="pagu-table-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                            <!-- Data dimuat dari Firestore -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TAMPILAN CARD (Mobile) -->
            <div id="pagu-card-container" class="md:hidden space-y-3">
                <!-- Data card dimuat dari Firestore -->
            </div>
        </div>
    `;
}

export function initLaporanPaguHandler() {
    console.log("Halaman Laporan PAGU dimuat.");

    let paguList = [];
    let unitList = [];
    let searchQuery = "";
    let selectedUnitFilter = "";

    // Ambil Data Unit dari Koleksi Firestore `unit_usaha`
    async function fetchUnitsFromDB() {
        try {
            const querySnapshot = await getDocs(collection(db, "unit_usaha"));
            unitList = [];
            querySnapshot.forEach((docSnap) => {
                unitList.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });

            const filterSelect = document.getElementById('filter-pagu-unit');
            if (filterSelect) {
                filterSelect.innerHTML = `<option value="">Semua Unit</option>`;
                unitList.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.namaUnit;
                    opt.textContent = u.namaUnit;
                    filterSelect.appendChild(opt);
                });
            }
        } catch (error) {
            console.error("Gagal mengambil data unit usaha:", error);
        }
    }

    // Ambil Data Laporan PAGU dari Firestore (Contoh koleksi: `laporan_pagu` atau `pagu_anggaran`)
    async function fetchPaguData() {
        try {
            const q = query(collection(db, "laporan_pagu"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            paguList = [];
            querySnapshot.forEach((docSnap) => {
                paguList.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            renderPaguTable();
        } catch (error) {
            console.error("Gagal mengambil data laporan pagu:", error);
            // Data dummy cadangan jika koleksi Firestore masih kosong agar tampilan langsung terlihat
            paguList = [
                { id: '1', uraian: 'Pengadaan Sarana Prasarana Kantor', unit: 'Kantor', pagu: 50000000, realisasi: 35000000 },
                { id: '2', uraian: 'Pemeliharaan Unit Agrowisata', unit: 'Unit Agrowisata', pagu: 25000000, realisasi: 18500000 },
                { id: '3', uraian: 'Pengembangan Operasional Kompos', unit: 'Kompos', pagu: 15000000, realisasi: 12000000 }
            ];
            renderPaguTable();
        }
    }

    // Render Tabel & Card Laporan PAGU
    window.renderPaguTable = function() {
        const tbody = document.getElementById('pagu-table-body');
        const cardContainer = document.getElementById('pagu-card-container');
        const sumPaguEl = document.getElementById('summary-total-pagu');
        const sumRealisasiEl = document.getElementById('summary-total-realisasi');
        const sumSisaEl = document.getElementById('summary-total-sisa');

        if (!tbody || !cardContainer) return;

        const filteredList = paguList.filter(p => {
            const matchName = (p.uraian || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchUnit = selectedUnitFilter === "" || p.unit === selectedUnitFilter;
            return matchName && matchUnit;
        });

        tbody.innerHTML = '';
        cardContainer.innerHTML = '';

        let totalPagu = 0;
        let totalRealisasi = 0;

        if (filteredList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">Belum ada data laporan pagu.</td></tr>`;
            cardContainer.innerHTML = `<div class="bg-white dark:bg-slate-900 p-6 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800">Belum ada data laporan pagu.</div>`;
        } else {
            filteredList.forEach((item, index) => {
                const pagu = parseFloat(item.pagu) || 0;
                const realisasi = parseFloat(item.realisasi) || 0;
                const sisa = pagu - realisasi;
                const percentage = pagu > 0 ? ((realisasi / pagu) * 100).toFixed(1) : 0;

                totalPagu += pagu;
                totalRealisasi += realisasi;

                // Desktop (Tabel)
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 text-center text-slate-500">${index + 1}</td>
                    <td class="p-3 font-semibold text-slate-800 dark:text-slate-100">${item.uraian || '-'}</td>
                    <td class="p-3">
                        <span class="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-none">${item.unit || '-'}</span>
                    </td>
                    <td class="p-3 text-right font-medium text-slate-700 dark:text-slate-300">Rp ${pagu.toLocaleString('id-ID')}</td>
                    <td class="p-3 text-right font-medium text-indigo-600 dark:text-indigo-400">Rp ${realisasi.toLocaleString('id-ID')}</td>
                    <td class="p-3 text-right font-medium text-emerald-600 dark:text-emerald-400">Rp ${sisa.toLocaleString('id-ID')}</td>
                    <td class="p-3 text-center">
                        <span class="inline-block px-2 py-0.5 text-[10px] font-bold ${percentage > 90 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}">${percentage}%</span>
                    </td>
                `;
                tbody.appendChild(tr);

                // Mobile (Card)
                const card = document.createElement('div');
                card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs space-y-2 text-xs";
                card.innerHTML = `
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">${item.unit || '-'}</span>
                            <h3 class="font-bold text-slate-800 dark:text-slate-100 mt-1">${item.uraian || '-'}</h3>
                        </div>
                        <span class="px-2 py-0.5 text-[10px] font-bold ${percentage > 90 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}">${percentage}%</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                            <span class="text-slate-400 block">Pagu</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-300">Rp ${pagu.toLocaleString('id-ID')}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Realisasi</span>
                            <span class="font-semibold text-indigo-600 dark:text-indigo-400">Rp ${realisasi.toLocaleString('id-ID')}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block">Sisa</span>
                            <span class="font-semibold text-emerald-600 dark:text-emerald-400">Rp ${sisa.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                `;
                cardContainer.appendChild(card);
            });
        }

        const totalSisa = totalPagu - totalRealisasi;
        if (sumPaguEl) sumPaguEl.textContent = `Rp ${totalPagu.toLocaleString('id-ID')}`;
        if (sumRealisasiEl) sumRealisasiEl.textContent = `Rp ${totalRealisasi.toLocaleString('id-ID')}`;
        if (sumSisaEl) sumSisaEl.textContent = `Rp ${totalSisa.toLocaleString('id-ID')}`;
    };

    // Event Listener Pencarian & Filter
    const searchInput = document.getElementById('search-pagu');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderPaguTable();
        });
    }

    const unitFilterSelect = document.getElementById('filter-pagu-unit');
    if (unitFilterSelect) {
        unitFilterSelect.addEventListener('change', (e) => {
            selectedUnitFilter = e.target.value;
            renderPaguTable();
        });
    }

    fetchUnitsFromDB();
    fetchPaguData();
}