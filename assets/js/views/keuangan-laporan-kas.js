// File: assets/js/views/keuangan-laporan-kas.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderKeuanganLaporanKas() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/keuangan" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Menu Keuangan</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Kas Masuk & Kas Keluar</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi mutasi kas operasional BUMKal berdasarkan periode dan unit usaha.</p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-laporan-kas" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JENIS MUTASI</label>
                    <select id="filter-jenis" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua (Masuk & Keluar) --</option>
                        <option value="masuk">Kas Masuk Saja</option>
                        <option value="keluar">Kas Keluar Saja</option>
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
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Mutasi Kas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-emerald-800 text-white p-5 rounded-none shadow-sm">
                    <p class="text-[11px] uppercase tracking-widest text-emerald-200 font-semibold">Total Kas Masuk</p>
                    <h2 id="summary-kas-masuk" class="text-xl font-extrabold mt-1">Rp 0</h2>
                </div>
                <div class="bg-rose-800 text-white p-5 rounded-none shadow-sm">
                    <p class="text-[11px] uppercase tracking-widest text-rose-200 font-semibold">Total Kas Keluar</p>
                    <h2 id="summary-kas-keluar" class="text-xl font-extrabold mt-1">Rp 0</h2>
                </div>
                <div class="bg-indigo-900 text-white p-5 rounded-none shadow-sm">
                    <p class="text-[11px] uppercase tracking-widest text-indigo-200 font-semibold">Selisih / Saldo Bersih Periode Ini</p>
                    <h2 id="summary-saldo-bersih" class="text-xl font-extrabold mt-1">Rp 0</h2>
                </div>
            </div>

            <!-- Bagian Rincian Data Mutasi Kas -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <span>RINCIAN MUTASI KAS MASUK & KELUAR</span>
                    <span id="periode-label" class="text-slate-500 font-normal">Periode: Semua Data</span>
                </div>

                <!-- 1. TAMPILAN DESKTOP: Tabel Standar -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-32">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold w-28 text-center">Jenis</th>
                                <th class="py-3 px-4 font-semibold w-36">Pihak Terkait</th>
                                <th class="py-3 px-4 font-semibold">Uraian / Keterangan</th>
                                <th class="py-3 px-4 font-semibold text-right w-36">Kas Masuk (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-right w-36">Kas Keluar (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-laporan-kas-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="7" class="py-8 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- 2. TAMPILAN HP: Card Versi Mobile -->
                <div id="card-laporan-kas-body" class="block md:hidden divide-y divide-slate-200 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Silakan klik "Tampilkan Laporan".</div>
                </div>
            </div>
        </div>
    `;
}

export function initKeuanganLaporanKasHandler() {
    const filterUnit = document.getElementById('filter-unit');
    const filterJenis = document.getElementById('filter-jenis');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-laporan-kas');

    const tableBody = document.getElementById('table-laporan-kas-body');
    const cardBody = document.getElementById('card-laporan-kas-body');
    const summaryMasuk = document.getElementById('summary-kas-masuk');
    const summaryKeluar = document.getElementById('summary-kas-keluar');
    const summaryBersih = document.getElementById('summary-saldo-bersih');
    const periodeLabel = document.getElementById('periode-label');

    let allMutasiList = [];

    async function loadData() {
        try {
            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allMutasiList = [];

            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data();
                const ket = jData && jData.keterangan ? String(jData.keterangan).toLowerCase() : "";
                
                if (ket.includes("[kas masuk]") || ket.includes("[kas keluar]")) {
                    const jenis = ket.includes("[kas masuk]") ? "masuk" : "keluar";
                    let nominal = 0;

                    if (jData.rincian && Array.isArray(jData.rincian) && jData.rincian.length >= 1) {
                        const r = jData.rincian[0];
                        nominal = parseFloat(r.debet || r.kredit || 0);
                    }

                    allMutasiList.push({
                        id: docSnap.id,
                        tgl: jData.tglTransaksi || "",
                        unit: jData.unitUsaha || "-",
                        jenis: jenis,
                        pihak: jData.pemberiDana || jData.penerimaDana || "-",
                        keterangan: jData.keterangan || "",
                        nominal: isNaN(nominal) ? 0 : nominal
                    });
                }
            });

            prosesFilter();
        } catch (err) {
            console.error("Gagal memuat data laporan kas:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
            if (cardBody) cardBody.innerHTML = `<div class="p-6 text-center text-red-500 text-xs">Gagal memuat data dari database.</div>`;
        }
    }

    function prosesFilter() {
        if (!tableBody || !cardBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const jenisVal = filterJenis ? filterJenis.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";

        if (periodeLabel) {
            periodeLabel.textContent = `Periode: ${tglMulaiVal || 'Awal'} s.d. ${tglSampaiVal || 'Sekarang'} ${unitVal ? '(' + unitVal + ')' : ''}`;
        }

        let totalMasuk = 0;
        let totalKeluar = 0;
        let filteredData = [];

        allMutasiList.forEach(item => {
            if (unitVal && item.unit !== unitVal) return;
            if (jenisVal && item.jenis !== jenisVal) return;
            if (tglMulaiVal && item.tgl < tglMulaiVal) return;
            if (tglSampaiVal && item.tgl > tglSampaiVal) return;

            filteredData.push(item);
            if (item.jenis === "masuk") {
                totalMasuk += item.nominal;
            } else {
                totalKeluar += item.nominal;
            }
        });

        const saldoBersih = totalMasuk - totalKeluar;

        if (summaryMasuk) summaryMasuk.textContent = `Rp ${totalMasuk.toLocaleString('id-ID')}`;
        if (summaryKeluar) summaryKeluar.textContent = `Rp ${totalKeluar.toLocaleString('id-ID')}`;
        if (summaryBersih) {
            summaryBersih.textContent = `Rp ${saldoBersih.toLocaleString('id-ID')}`;
            summaryBersih.className = saldoBersih >= 0 ? "text-xl font-extrabold mt-1 text-white" : "text-xl font-extrabold mt-1 text-rose-300";
        }

        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada data transaksi kas pada filter yang dipilih.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada data transaksi kas pada filter yang dipilih.</div>`;
            return;
        }

        // Render Tampilan Desktop (Tabel)
        let htmlTable = "";
        filteredData.forEach(item => {
            const isMasuk = item.jenis === "masuk";
            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tgl}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unit}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 text-[11px] font-bold ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                            ${isMasuk ? 'KAS MASUK' : 'KAS KELUAR'}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">${item.pihak}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">${item.keterangan}</td>
                    <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        ${isMasuk ? `Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                        ${!isMasuk ? `Rp ${item.nominal.toLocaleString('id-ID')}` : '-'}
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = htmlTable;

        // Render Tampilan Mobile (Card Versi HP)
        let htmlCard = "";
        filteredData.forEach(item => {
            const isMasuk = item.jenis === "masuk";
            htmlCard += `
                <div class="p-4 space-y-2 text-xs">
                    <div class="flex justify-between items-center">
                        <span class="font-semibold text-slate-500 dark:text-slate-400">${item.tgl}</span>
                        <span class="px-2 py-0.5 text-[10px] font-bold ${isMasuk ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}">
                            ${isMasuk ? 'KAS MASUK' : 'KAS KELUAR'}
                        </span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-slate-600 dark:text-slate-300 font-medium">Unit: ${item.unit}</span>
                        <span class="font-semibold text-indigo-600 dark:text-indigo-400">${item.pihak}</span>
                    </div>
                    <div class="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-none border border-slate-100 dark:border-slate-800">
                        ${item.keterangan}
                    </div>
                    <div class="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span class="text-slate-500 font-medium">Nominal:</span>
                        <span class="font-bold text-sm ${isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
                            Rp ${item.nominal.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            `;
        });
        cardBody.innerHTML = htmlCard;
    }

    if (btnTampilkan) {
        btnTampilkan.onclick = prosesFilter;
    }

    if (btnCetak) {
        btnCetak.onclick = () => {
            window.print();
        };
    }

    loadData();
}