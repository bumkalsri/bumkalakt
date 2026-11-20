// File: assets/js/views/laporan-perubahan-modal.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function formatRupiah(num) {
    const rounded = Math.round(Number(num) || 0);
    return (rounded < 0 ? "-Rp " : "Rp ") + Math.abs(rounded).toLocaleString("id-ID");
}

function formatSignedRupiah(num) {
    const rounded = Math.round(Number(num) || 0);
    const absFormatted = `Rp ${Math.abs(rounded).toLocaleString("id-ID")}`;
    if (rounded > 0) return `(+) ${absFormatted}`;
    if (rounded < 0) return `(-) ${absFormatted}`;
    return `Rp 0`;
}

export function renderLaporanPerubahanModal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                    <a href="#/laporan" data-link title="Kembali ke Menu Laporan"
                        class="w-10 h-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Laporan Perubahan Modal (Statement of Changes in Equity)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Rekapitulasi perubahan modal BUMKal dari awal periode hingga akhir periode (rinci per akun).</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-perubahan-modal" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-4 gap-4 text-xs items-end">
                <div>
                    <label for="filter-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit Usaha --</option>
                        <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                        <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                        <option value="KOMPOS (03)">KOMPOS (03)</option>
                        <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                    </select>
                </div>
                <div>
                    <label for="filter-tgl-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL MULAI</label>
                    <input type="date" id="filter-tgl-mulai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <label for="filter-tgl-sampai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL SAMPAI</label>
                    <input type="date" id="filter-tgl-sampai" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                </div>
                <div>
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan Laporan</button>
                </div>
            </div>

            <!-- Card Ringkasan Modal Akhir -->
            <div class="bg-indigo-900 text-white p-6 rounded-none shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p class="text-xs uppercase tracking-widest text-indigo-200 font-semibold">Total Modal Akhir Periode</p>
                    <h2 id="summary-modal-akhir" class="text-2xl font-extrabold mt-1">Rp 0</h2>
                </div>
                <div class="text-right">
                    <span id="badge-status-modal" class="px-3 py-1 bg-indigo-800 text-indigo-100 font-bold text-xs uppercase">Menunggu Proses</span>
                </div>
            </div>

            <!-- Tabel Komponen Perubahan Modal Rinci Per Akun -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>RINCIAN PERUBAHAN MODAL PER AKUN</span>
                    <span id="periode-label" class="text-slate-500 font-normal">Periode: -</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-36">Kode Akun</th>
                                <th class="py-3 px-4 font-semibold">Keterangan Komponen / Nama Akun</th>
                                <th class="py-3 px-4 font-semibold text-right w-56">Jumlah (Rp)</th>
                            </tr>
                        </thead>
                        <tbody id="table-perubahan-modal-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="3" class="py-8 text-center text-slate-400">Silakan klik "Tampilkan Laporan".</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

let perubahanModalCleanup = null;

export function initLaporanPerubahanModalHandler() {
    if (typeof perubahanModalCleanup === "function") {
        perubahanModalCleanup();
        perubahanModalCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnCetak = document.getElementById('btn-cetak-perubahan-modal');

    const tableBody = document.getElementById('table-perubahan-modal-body');
    const summaryModalAkhir = document.getElementById('summary-modal-akhir');
    const badgeStatusModal = document.getElementById('badge-status-modal');
    const periodeLabel = document.getElementById('periode-label');

    let coaList = [];
    let saldoAwalList = [];
    let allJurnalList = [];

    async function loadData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaList = [];
            snapCoa.forEach(docSnap => {
                coaList.push({ id: docSnap.id, ...docSnap.data() });
            });

            try {
                const snapSaldo = await getDocs(collection(db, "saldo_awal"));
                saldoAwalList = [];
                snapSaldo.forEach(docSnap => {
                    saldoAwalList.push({ id: docSnap.id, ...docSnap.data() });
                });
            } catch (saldoErr) {
                console.warn("Gagal memuat saldo_awal:", saldoErr);
                saldoAwalList = [];
            }

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "asc"));
            const snapJurnal = await getDocs(qJurnal);
            allJurnalList = [];
            snapJurnal.forEach(docSnap => {
                allJurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            prosesPerubahanModal();
        } catch (err) {
            console.error("Gagal memuat data laporan perubahan modal:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function prosesPerubahanModal() {
        if (!tableBody) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        if (periodeLabel) {
            periodeLabel.textContent = `Periode: ${tglMulaiVal || 'Awal'} s.d. ${tglSampaiVal || 'Sekarang'} ${unitVal ? '(' + unitVal + ')' : ''}`;
        }

        const akunMap = {};
        coaList.forEach(coa => {
            const reportGroup = String(coa.reportGroup || "").toLowerCase();
            const kategori = String(coa.kategori || "").toLowerCase();
            const nama = String(coa.namaAkun || "").toLowerCase();
            const kode = String(coa.kodeAkun || "").trim();
            const level = String(coa.levelAkun || "");
            const tipe = String(coa.tipeAkun || "").toLowerCase();

            if (!kode) return;

            if (level === "4" || tipe === "detail") {
                let jenis = "";
                if (
                    reportGroup.includes("modal") ||
                    reportGroup.includes("ekuitas") ||
                    kategori.includes("modal") ||
                    kategori.includes("ekuitas") ||
                    kode.startsWith("3")
                ) {
                    if (nama.includes("prive") || nama.includes("penarikan")) jenis = "prive";
                    else if (nama.includes("tambahan") || nama.includes("setoran")) jenis = "tambahan";
                    else jenis = "modal_awal";
                } else if (
                    reportGroup.includes("laba") ||
                    reportGroup.includes("pendapatan") ||
                    kategori.includes("pendapatan") ||
                    kode.startsWith("4")
                ) {
                    jenis = "pendapatan";
                } else if (
                    reportGroup.includes("beban") ||
                    reportGroup.includes("biaya") ||
                    kategori.includes("beban") ||
                    kategori.includes("biaya") ||
                    kode.startsWith("5") ||
                    kode.startsWith("6") ||
                    kode.startsWith("7")
                ) {
                    jenis = "beban";
                }

                if (jenis) {
                    akunMap[kode] = {
                        kodeAkun: kode,
                        namaAkun: String(coa.namaAkun || kode).trim(),
                        jenis,
                        totalDebet: 0,
                        totalKredit: 0
                    };
                }
            }
        });

        saldoAwalList.forEach(sa => {
            if (unitVal && sa.unitUsaha && sa.unitUsaha !== unitVal) return;
            if (periodeSampai && sa.periode && String(sa.periode) > periodeSampai) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (!kode) return;

            if (!akunMap[kode] && kode.startsWith("3")) {
                const namaLower = String(sa.namaAkun || "").toLowerCase();
                let jenis = "modal_awal";
                if (namaLower.includes("prive") || namaLower.includes("penarikan")) jenis = "prive";
                else if (namaLower.includes("tambahan") || namaLower.includes("setoran")) jenis = "tambahan";

                akunMap[kode] = {
                    kodeAkun: kode,
                    namaAkun: String(sa.namaAkun || kode).trim(),
                    jenis,
                    totalDebet: 0,
                    totalKredit: 0
                };
            }

            if (akunMap[kode]) {
                akunMap[kode].totalDebet += parseFloat(sa.debit) || 0;
                akunMap[kode].totalKredit += parseFloat(sa.kredit) || 0;
            }
        });

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglMulaiVal && item.tglTransaksi && item.tglTransaksi < tglMulaiVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (akunMap[kode]) {
                        akunMap[kode].totalDebet += parseFloat(r.debet) || 0;
                        akunMap[kode].totalKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        const detailModalAwal = [];
        const detailTambahan = [];
        const detailPrive = [];
        const detailPendapatan = [];
        const detailBeban = [];

        let modalAwalTotal = 0;
        let tambahanModalTotal = 0;
        let priveTotal = 0;
        let totalPendapatan = 0;
        let totalBeban = 0;

        Object.values(akunMap)
            .sort((a, b) => a.kodeAkun.localeCompare(b.kodeAkun))
            .forEach(acc => {
                const saldoKreditNet = acc.totalKredit - acc.totalDebet;
                const saldoDebetNet = acc.totalDebet - acc.totalKredit;

                if (acc.jenis === "modal_awal") {
                    modalAwalTotal += saldoKreditNet;
                    if (saldoKreditNet !== 0) {
                        detailModalAwal.push({
                            kodeAkun: acc.kodeAkun,
                            namaAkun: acc.namaAkun,
                            jumlah: saldoKreditNet
                        });
                    }
                } else if (acc.jenis === "tambahan") {
                    tambahanModalTotal += saldoKreditNet;
                    if (saldoKreditNet !== 0) {
                        detailTambahan.push({
                            kodeAkun: acc.kodeAkun,
                            namaAkun: acc.namaAkun,
                            jumlah: saldoKreditNet
                        });
                    }
                } else if (acc.jenis === "prive") {
                    priveTotal += saldoDebetNet;
                    if (saldoDebetNet !== 0) {
                        detailPrive.push({
                            kodeAkun: acc.kodeAkun,
                            namaAkun: acc.namaAkun,
                            jumlah: saldoDebetNet
                        });
                    }
                } else if (acc.jenis === "pendapatan") {
                    totalPendapatan += saldoKreditNet;
                    if (saldoKreditNet !== 0) {
                        detailPendapatan.push({
                            kodeAkun: acc.kodeAkun,
                            namaAkun: acc.namaAkun,
                            jumlah: saldoKreditNet
                        });
                    }
                } else if (acc.jenis === "beban") {
                    totalBeban += saldoDebetNet;
                    if (saldoDebetNet !== 0) {
                        detailBeban.push({
                            kodeAkun: acc.kodeAkun,
                            namaAkun: acc.namaAkun,
                            jumlah: saldoDebetNet
                        });
                    }
                }
            });

        const labaRugiBersih = totalPendapatan - totalBeban;
        const modalAkhir = modalAwalTotal + tambahanModalTotal + labaRugiBersih - priveTotal;

        if (summaryModalAkhir) summaryModalAkhir.textContent = formatRupiah(modalAkhir);
        if (badgeStatusModal) {
            badgeStatusModal.textContent = modalAkhir >= 0 ? "Normal / Sehat" : "Defisit Ekuitas";
            badgeStatusModal.className = modalAkhir >= 0
                ? "px-3 py-1 bg-emerald-600 text-white font-bold text-xs uppercase"
                : "px-3 py-1 bg-rose-600 text-white font-bold text-xs uppercase";
        }

        const renderSectionRows = ({
            headerTitle,
            headerTotalText,
            headerTotalClass = "text-slate-800 dark:text-slate-100",
            items,
            emptyText,
            valueFormatter = (v) => formatRupiah(v),
            valueClassFn = () => "text-slate-700 dark:text-slate-200"
        }) => {
            let rowsHtml = `
                <tr class="bg-slate-50/90 dark:bg-slate-950/80 font-bold text-slate-800 dark:text-slate-100">
                    <td class="py-2.5 px-4 text-slate-400">—</td>
                    <td class="py-2.5 px-4">${headerTitle}</td>
                    <td class="py-2.5 px-4 text-right ${headerTotalClass}">${headerTotalText}</td>
                </tr>
            `;

            if (!items || items.length === 0) {
                rowsHtml += `
                    <tr>
                        <td class="py-2 px-4 text-slate-400"></td>
                        <td class="py-2 px-8 italic text-slate-400">${emptyText}</td>
                        <td class="py-2 px-4 text-right text-slate-400">Rp 0</td>
                    </tr>
                `;
                return rowsHtml;
            }

            items.forEach(row => {
                rowsHtml += `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td class="py-2 px-4 pl-6 font-semibold text-indigo-600 dark:text-indigo-400">${row.kodeAkun}</td>
                        <td class="py-2 px-4 pl-6 text-slate-700 dark:text-slate-300">${row.namaAkun}</td>
                        <td class="py-2 px-4 text-right font-medium ${valueClassFn(row.jumlah)}">${valueFormatter(row.jumlah)}</td>
                    </tr>
                `;
            });

            return rowsHtml;
        };

        let html = "";

        // 1. Modal Awal / Saldo Awal Ekuitas
        html += renderSectionRows({
            headerTitle: "Modal Awal / Saldo Awal Ekuitas",
            headerTotalText: formatRupiah(modalAwalTotal),
            items: detailModalAwal,
            emptyText: "Tidak ada rincian akun saldo awal ekuitas pada periode ini."
        });

        // 2. Tambahan Setoran Modal
        html += renderSectionRows({
            headerTitle: "Tambahan Setoran Modal",
            headerTotalText: formatSignedRupiah(tambahanModalTotal),
            headerTotalClass: "text-emerald-600 dark:text-emerald-400",
            items: detailTambahan,
            emptyText: "Tidak ada mutasi tambahan setoran modal pada periode ini.",
            valueFormatter: (v) => formatRupiah(v),
            valueClassFn: () => "text-emerald-600 dark:text-emerald-400"
        });

        // 3. Laba / Rugi Bersih Periode Berjalan (Rinci Akun Pendapatan & Beban)
        const labaRugiItems = [
            ...detailPendapatan.map(p => ({
                kodeAkun: p.kodeAkun,
                namaAkun: `Pendapatan — ${p.namaAkun}`,
                jumlah: p.jumlah
            })),
            ...detailBeban.map(b => ({
                kodeAkun: b.kodeAkun,
                namaAkun: `Beban — ${b.namaAkun}`,
                jumlah: -Math.abs(b.jumlah)
            }))
        ];

        html += renderSectionRows({
            headerTitle: "Laba / Rugi Bersih Periode Berjalan",
            headerTotalText: formatSignedRupiah(labaRugiBersih),
            headerTotalClass: labaRugiBersih >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            items: labaRugiItems,
            emptyText: "Tidak ada rincian mutasi akun pendapatan/beban pada periode ini.",
            valueFormatter: (v) => formatSignedRupiah(v),
            valueClassFn: (v) => v >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
        });

        // 4. Prive / Penarikan Modal Pihak Pengelola
        html += renderSectionRows({
            headerTitle: "Prive / Penarikan Modal Pihak Pengelola",
            headerTotalText: priveTotal > 0 ? `(-) ${formatRupiah(priveTotal)}` : `Rp 0`,
            headerTotalClass: "text-rose-600 dark:text-rose-400",
            items: detailPrive,
            emptyText: "Tidak ada penarikan prive pada periode ini.",
            valueFormatter: (v) => `(-) ${formatRupiah(v)}`,
            valueClassFn: () => "text-rose-600 dark:text-rose-400"
        });

        // Total Modal Akhir
        html += `
            <tr class="bg-slate-100 dark:bg-slate-950 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                <td class="py-3.5 px-4"></td>
                <td class="py-3.5 px-4 text-right uppercase">Total Modal Akhir :</td>
                <td class="py-3.5 px-4 text-right text-indigo-600 dark:text-indigo-400 text-sm">${formatRupiah(modalAkhir)}</td>
            </tr>
        `;

        tableBody.innerHTML = html;
    }

    const onTampilkanClick = () => prosesPerubahanModal();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        perubahanModalCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    perubahanModalCleanup = cleanup;

    loadData();

    return cleanup;
}