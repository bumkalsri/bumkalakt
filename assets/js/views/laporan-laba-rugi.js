// File: assets/js/views/laporan-laba-rugi.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderLaporanLabaRugi() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/laporan" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Menu Laporan</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Laba / Rugi (Income Statement)</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi pendapatan dan beban operasional BUMKal.</p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-laba-rugi" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
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

            <!-- Card Ringkasan Laba / Rugi Bersih -->
            <div id="summary-card" class="bg-indigo-900 text-white p-6 rounded-none shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p id="label-status-laba" class="text-xs uppercase tracking-widest text-indigo-200 font-semibold">Hasil Usaha Bersih (Laba / Rugi)</p>
                    <h2 id="summary-laba-rugi-val" class="text-2xl font-extrabold mt-1">Rp 0</h2>
                </div>
                <div class="text-right">
                    <span id="badge-status-laba" class="px-3 py-1 bg-indigo-800 text-indigo-100 font-bold text-xs uppercase">Menunggu Proses</span>
                </div>
            </div>

            <!-- Konten Laporan (Pendapatan & Beban) -->
            <div class="space-y-6">
                <!-- Bagian Pendapatan -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                        <span>I. PENDAPATAN (REVENUE)</span>
                        <span id="total-pendapatan-header" class="text-emerald-600 dark:text-emerald-400">Rp 0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                    <th class="py-2.5 px-4 font-semibold">Nama Akun Pendapatan</th>
                                    <th class="py-2.5 px-4 font-semibold text-right w-44">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody id="table-pendapatan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="3" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Bagian Beban / Biaya -->
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                    <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                        <span>II. BEBAN / BIAYA OPERASIONAL (EXPENSES)</span>
                        <span id="total-beban-header" class="text-rose-600 dark:text-rose-400">Rp 0</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <th class="py-2.5 px-4 font-semibold w-32">Kode Akun</th>
                                    <th class="py-2.5 px-4 font-semibold">Nama Akun Beban</th>
                                    <th class="py-2.5 px-4 font-semibold text-right w-44">Jumlah (Rp)</th>
                                </tr>
                            </thead>
                            <tbody id="table-beban-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                <tr><td colspan="3" class="py-6 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initLaporanLabaRugiHandler() {
    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-laba-rugi');

    const tablePendapatanBody = document.getElementById('table-pendapatan-body');
    const tableBebanBody = document.getElementById('table-beban-body');
    const totalPendapatanHeader = document.getElementById('total-pendapatan-header');
    const totalBebanHeader = document.getElementById('total-beban-header');
    const summaryLabaRugiVal = document.getElementById('summary-laba-rugi-val');
    const badgeStatusLaba = document.getElementById('badge-status-laba');
    const labelStatusLaba = document.getElementById('label-status-laba');

    let coaList = [];
    let allJurnalList = [];

    async function loadData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaList = [];
            snapCoa.forEach(docSnap => {
                coaList.push({ id: docSnap.id, ...docSnap.data() });
            });

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allJurnalList = [];
            snapJurnal.forEach(docSnap => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            prosesLabaRugi();
        } catch (err) {
            console.error("Gagal memuat data laporan laba rugi:", err);
            if (tablePendapatanBody) tablePendapatanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function prosesLabaRugi() {
        if (!tablePendapatanBody || !tableBebanBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";

        let akunMap = {};
        coaList.forEach(coa => {
            const reportGroup = (coa.reportGroup || "").toLowerCase();
            const levelAkun = String(coa.levelAkun || "");
            const tipeAkun = (coa.tipeAkun || "").toLowerCase();
            const namaAkunLower = (coa.namaAkun || "").toLowerCase();
            const kategori = (coa.kategori || "").toLowerCase();
            const kode = (coa.kodeAkun || "");

            // Pastikan akun adalah level detail (Level 4 atau Tipe Detail) dan masuk group Laba Rugi
            const isDetail = levelAkun === "4" || tipeAkun === "detail";
            const isLabaRugiGroup = reportGroup.includes("laba") || reportGroup.includes("rugi") || reportGroup.includes("pendapatan") || reportGroup.includes("beban");

            if (isDetail && isLabaRugiGroup) {
                let jenis = "";
                if (reportGroup.includes("pendapatan") || namaAkunLower.includes("pendapatan") || namaAkunLower.includes("penjualan") || kategori.includes("pendapatan") || kode.startsWith("4")) {
                    jenis = "pendapatan";
                } else {
                    jenis = "beban";
                }

                akunMap[kode] = {
                    kodeAkun: kode,
                    namaAkun: coa.namaAkun,
                    jenis: jenis,
                    totalDebet: 0,
                    totalKredit: 0
                };
            }
        });

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglMulaiVal && item.tglTransaksi < tglMulaiVal) return;
            if (tglSampaiVal && item.tglTransaksi > tglSampaiVal) return;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    if (akunMap[r.kodeAkun]) {
                        akunMap[r.kodeAkun].totalDebet += parseFloat(r.debet) || 0;
                        akunMap[r.kodeAkun].totalKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        let listPendapatan = [];
        let listBeban = [];
        let totalPendapatan = 0;
        let totalBeban = 0;

        Object.values(akunMap).forEach(acc => {
            if (acc.jenis === "pendapatan") {
                let saldo = acc.totalKredit - acc.totalDebet; // Saldo normal pendapatan di kredit
                if (saldo !== 0) {
                    totalPendapatan += saldo;
                    listPendapatan.push({ kodeAkun: acc.kodeAkun, namaAkun: acc.namaAkun, jumlah: saldo });
                }
            } else if (acc.jenis === "beban") {
                let saldo = acc.totalDebet - acc.totalKredit; // Saldo normal beban di debet
                if (saldo !== 0) {
                    totalBeban += saldo;
                    listBeban.push({ kodeAkun: acc.kodeAkun, namaAkun: acc.namaAkun, jumlah: saldo });
                }
            }
        });

        const labaRugiBersih = totalPendapatan - totalBeban;

        if (totalPendapatanHeader) totalPendapatanHeader.textContent = `Rp ${totalPendapatan.toLocaleString('id-ID')}`;
        if (totalBebanHeader) totalBebanHeader.textContent = `Rp ${totalBeban.toLocaleString('id-ID')}`;
        if (summaryLabaRugiVal) summaryLabaRugiVal.textContent = `Rp ${Math.abs(labaRugiBersih).toLocaleString('id-ID')}`;

        if (badgeStatusLaba && labelStatusLaba) {
            if (labaRugiBersih > 0) {
                labelStatusLaba.textContent = "KEUNTUNGAN BERSIH (LABA)";
                badgeStatusLaba.textContent = "LABA";
                badgeStatusLaba.className = "px-3 py-1 bg-emerald-600 text-white font-bold text-xs uppercase";
            } else if (labaRugiBersih < 0) {
                labelStatusLaba.textContent = "KERUGIAN BERSIH (RUGI)";
                badgeStatusLaba.textContent = "RUGI";
                badgeStatusLaba.className = "px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase";
            } else {
                labelStatusLaba.textContent = "HASIL USAHA BERSIH (IMPAS)";
                badgeStatusLaba.textContent = "BREAK EVEN";
                badgeStatusLaba.className = "px-3 py-1 bg-amber-600 text-white font-bold text-xs uppercase";
            }
        }

        // Render Tabel Pendapatan
        if (listPendapatan.length === 0) {
            tablePendapatanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-slate-400">Tidak ada data pendapatan dengan reportGroup Laba Rugi (Level 4 Detail).</td></tr>`;
        } else {
            let htmlP = "";
            listPendapatan.forEach(p => {
                htmlP += `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${p.kodeAkun}</td>
                        <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${p.namaAkun}</td>
                        <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">Rp ${p.jumlah.toLocaleString('id-ID')}</td>
                    </tr>
                `;
            });
            tablePendapatanBody.innerHTML = htmlP;
        }

        // Render Tabel Beban
        if (listBeban.length === 0) {
            tableBebanBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-slate-400">Tidak ada data beban dengan reportGroup Laba Rugi (Level 4 Detail).</td></tr>`;
        } else {
            let htmlB = "";
            listBeban.forEach(b => {
                htmlB += `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${b.kodeAkun}</td>
                        <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${b.namaAkun}</td>
                        <td class="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">Rp ${b.jumlah.toLocaleString('id-ID')}</td>
                    </tr>
                `;
            });
            tableBebanBody.innerHTML = htmlB;
        }
    }

    if (btnTampilkan) {
        btnTampilkan.onclick = prosesLabaRugi;
    }

    if (btnCetak) {
        btnCetak.onclick = () => {
            window.print();
        };
    }

    loadData();
}