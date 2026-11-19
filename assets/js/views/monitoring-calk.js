// File: assets/js/views/monitoring-calk.js
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function isDetailAccount(coa) {
    const level = String(coa?.levelAkun || "").trim();
    const tipe = String(coa?.tipeAkun || "").trim().toLowerCase();
    return level === "4" || tipe === "detail";
}

function classifyAccount(coa) {
    const reportGroup = String(coa?.reportGroup || "").toLowerCase();
    const kategori = String(coa?.kategori || "").toLowerCase();
    const nama = String(coa?.namaAkun || "").toLowerCase();
    const kode = String(coa?.kodeAkun || "").trim();

    if (
        reportGroup.includes("aset") ||
        reportGroup.includes("aktiva") ||
        kategori.includes("aset") ||
        kategori.includes("aktiva") ||
        kode.startsWith("1")
    ) {
        return { group: "aset", label: "Aset" };
    }

    if (
        reportGroup.includes("kewajiban") ||
        reportGroup.includes("liabilitas") ||
        reportGroup.includes("hutang") ||
        reportGroup.includes("utang") ||
        kategori.includes("kewajiban") ||
        kategori.includes("liabilitas") ||
        kategori.includes("hutang") ||
        kategori.includes("utang") ||
        kode.startsWith("2")
    ) {
        return { group: "kewajiban", label: "Kewajiban" };
    }

    if (
        reportGroup.includes("modal") ||
        reportGroup.includes("ekuitas") ||
        kategori.includes("modal") ||
        kategori.includes("ekuitas") ||
        kode.startsWith("3")
    ) {
        return { group: "ekuitas", label: "Ekuitas / Modal" };
    }

    if (
        reportGroup.includes("pendapatan") ||
        nama.includes("pendapatan") ||
        nama.includes("penjualan") ||
        kategori.includes("pendapatan") ||
        kode.startsWith("4")
    ) {
        return { group: "pendapatan", label: "Pendapatan" };
    }

    if (
        reportGroup.includes("beban") ||
        reportGroup.includes("biaya") ||
        reportGroup.includes("laba") ||
        reportGroup.includes("rugi") ||
        kategori.includes("beban") ||
        kategori.includes("biaya") ||
        kode.startsWith("5") ||
        kode.startsWith("6") ||
        kode.startsWith("7")
    ) {
        return { group: "beban", label: "Beban / Biaya Operasional" };
    }

    return null;
}

export function renderMonitoringCalk() {
    return `
        <div class="space-y-4 sm:space-y-6 pb-10 max-w-7xl mx-auto overflow-x-hidden animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div class="flex items-start sm:items-center gap-3 min-w-0">
                    <a href="#/monitoring" data-link title="Kembali ke Menu Monitoring"
                        class="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-none transition flex-shrink-0 mt-0.5 sm:mt-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0 flex-1">
                        <h1 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">Monitoring CALK (Catatan Atas Laporan Keuangan)</h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">Penjelasan rinci pos-pos keuangan, kebijakan akuntansi, dan informasi pengawasan BUMKal.</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 sm:flex flex-wrap items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <button id="btn-simpan-calk" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 sm:py-2.5 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                        <span>Simpan Catatan</span>
                    </button>
                    <button id="btn-cetak-calk" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 sm:py-2.5 rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        <span>Cetak / Print CALK</span>
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs items-end">
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
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 sm:py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan CALK</button>
                </div>
            </div>

            <!-- Ringkasan Utama -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wide">Total Aset</p>
                    <p id="calk-total-aset" class="text-xs sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 break-words">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wide">Total Kewajiban &amp; Ekuitas</p>
                    <p id="calk-total-pasiva" class="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1 break-words">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wide">Total Pendapatan</p>
                    <p id="calk-total-pendapatan" class="text-xs sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 break-words">Rp 0</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none min-w-0">
                    <p class="text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wide">Laba / Rugi Bersih</p>
                    <p id="calk-laba-rugi" class="text-xs sm:text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1 break-words">Rp 0</p>
                </div>
            </div>

            <!-- Bagian 1 & 2: Profil & Kebijakan Akuntansi -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-xs">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none p-4 sm:p-5 space-y-3 min-w-0">
                    <h2 class="font-bold text-slate-800 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 leading-snug break-words">
1. Informasi Umum Entitas &amp; Unit Usaha
                    </h2>
                    <label for="calk-profil-entitas" class="block font-semibold text-slate-600 dark:text-slate-400">Uraian Profil &amp; Cakupan Unit</label>
                    <textarea id="calk-profil-entitas" rows="5" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-none focus:outline-none focus:border-indigo-600 leading-relaxed"></textarea>
                </div>

                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none p-4 sm:p-5 space-y-3 min-w-0">
                    <h2 class="font-bold text-slate-800 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 leading-snug break-words">
2. Ikhtisar Kebijakan Akuntansi Penting
                    </h2>
                    <label for="calk-kebijakan-akuntansi" class="block font-semibold text-slate-600 dark:text-slate-400">Dasar Pencatatan, Pengakuan Saldo &amp; Penyusutan</label>
                    <textarea id="calk-kebijakan-akuntansi" rows="5" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-none focus:outline-none focus:border-indigo-600 leading-relaxed"></textarea>
                </div>
            </div>

            <!-- Bagian 3: Rincian Pos-Pos Laporan Keuangan -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <span class="break-words">3. RINCIAN POS-POS LAPORAN KEUANGAN (PER AKUN DETAIL)</span>
                    <span id="calk-status-msg" class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Memuat data...</span>
                </div>
                <div id="calk-rincian-container" class="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    <div class="p-6 text-center text-slate-400">Memuat rincian akun CALK...</div>
                </div>
            </div>

            <!-- Bagian 4: Penjelasan Tambahan & Kejadian Penting -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none p-4 sm:p-5 space-y-3 text-xs min-w-0">
                <h2 class="font-bold text-slate-800 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 leading-snug break-words">
4. Catatan Tambahan, Kendala Lapangan &amp; Rencana Tindak Lanjut
                </h2>
                <textarea id="calk-catatan-tambahan" rows="4" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-none focus:outline-none focus:border-indigo-600 leading-relaxed"></textarea>
            </div>
        </div>
    `;
}

let calkCleanup = null;

export function initMonitoringCalkHandler() {
    if (typeof calkCleanup === "function") {
        calkCleanup();
        calkCleanup = null;
    }

    const filterUnit = document.getElementById('filter-unit');
    const filterTglMulai = document.getElementById('filter-tgl-mulai');
    const filterTglSampai = document.getElementById('filter-tgl-sampai');
    const btnTampilkan = document.getElementById('btn-tampilkan');
    const btnSimpan = document.getElementById('btn-simpan-calk');
    const btnCetak = document.getElementById('btn-cetak-calk');

    const totalAsetEl = document.getElementById('calk-total-aset');
    const totalPasivaEl = document.getElementById('calk-total-pasiva');
    const totalPendapatanEl = document.getElementById('calk-total-pendapatan');
    const labaRugiEl = document.getElementById('calk-laba-rugi');
    const statusMsgEl = document.getElementById('calk-status-msg');
    const rincianContainer = document.getElementById('calk-rincian-container');

    const profilInput = document.getElementById('calk-profil-entitas');
    const kebijakanInput = document.getElementById('calk-kebijakan-akuntansi');
    const tambahanInput = document.getElementById('calk-catatan-tambahan');

    const defaultProfil =
        "Badan Usaha Milik Kalurahan (BUMKal) menyelenggarakan pengelolaan unit usaha yang meliputi KANTOR PUSAT (01), AGROWISATA (02), KOMPOS (03), dan GREENHOUSE (04). Laporan ini menyajikan informasi posisi keuangan dan hasil usaha sesuai unit dan periode yang dipilih.";
    const defaultKebijakan =
        "1. Basis pencatatan menggunakan pembukuan berpasangan (double-entry) pada Jurnal Umum.\n2. Saldo akun menggabungkan Saldo Awal (saldo_awal) dan mutasi transaksi (jurnal_umum) hingga tanggal akhir periode.\n3. Aset dikelompokkan ke dalam Aset Lancar dan Aset Tetap, sedangkan Laba/Rugi Bersih merupakan selisih Pendapatan dikurangi Beban operasional.";
    const defaultTambahan =
        "Catat informasi pendukung seperti rekonsiliasi kas/bank, status piutang/hutang, kondisi aset fisik, serta evaluasi operasional per unit usaha untuk bahan pemeriksaan Badan Pengawas dan Penasehat.";

    if (profilInput && !profilInput.value) profilInput.value = defaultProfil;
    if (kebijakanInput && !kebijakanInput.value) kebijakanInput.value = defaultKebijakan;
    if (tambahanInput && !tambahanInput.value) tambahanInput.value = defaultTambahan;

    let coaList = [];
    let saldoAwalList = [];
    let allJurnalList = [];

    function getCatatanDocId() {
        const unitKey = (filterUnit && filterUnit.value ? filterUnit.value : "SEMUA_UNIT")
            .replace(/[^a-zA-Z0-9_-]/g, "_");
        return `calk_${unitKey}`;
    }

    async function loadSavedCatatan() {
        try {
            const docRef = doc(db, "calk_catatan", getCatatanDocId());
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                if (profilInput) profilInput.value = data.profilEntitas || defaultProfil;
                if (kebijakanInput) kebijakanInput.value = data.kebijakanAkuntansi || defaultKebijakan;
                if (tambahanInput) tambahanInput.value = data.catatanTambahan || defaultTambahan;
            } else {
                if (profilInput) profilInput.value = defaultProfil;
                if (kebijakanInput) kebijakanInput.value = defaultKebijakan;
                if (tambahanInput) tambahanInput.value = defaultTambahan;
            }
        } catch (err) {
            console.warn("Gagal memuat catatan CALK tersimpan:", err);
        }
    }

    async function simpanCatatan() {
        if (!btnSimpan) return;
        const originalText = btnSimpan.innerHTML;
        btnSimpan.disabled = true;
        btnSimpan.textContent = "Menyimpan...";

        try {
            const docRef = doc(db, "calk_catatan", getCatatanDocId());
            await setDoc(docRef, {
                unitUsaha: filterUnit ? filterUnit.value : "",
                profilEntitas: profilInput ? profilInput.value : "",
                kebijakanAkuntansi: kebijakanInput ? kebijakanInput.value : "",
                catatanTambahan: tambahanInput ? tambahanInput.value : "",
                updatedAt: new Date().toISOString()
            }, { merge: true });

            if (statusMsgEl) {
                statusMsgEl.textContent = "Catatan CALK berhasil disimpan ke database.";
            }
        } catch (err) {
            console.error("Gagal menyimpan catatan CALK:", err);
            if (statusMsgEl) {
                statusMsgEl.textContent = "Gagal menyimpan catatan CALK.";
            }
        } finally {
            btnSimpan.disabled = false;
            btnSimpan.innerHTML = originalText;
        }
    }

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

            await loadSavedCatatan();
            prosesCalk();
        } catch (err) {
            console.error("Gagal memuat data CALK:", err);
            if (rincianContainer) {
                rincianContainer.innerHTML = `<div class="p-6 text-center text-rose-500">Gagal memuat data dari database.</div>`;
            }
        }
    }

    function prosesCalk() {
        if (!rincianContainer) return;

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";
        const tglSampaiVal = filterTglSampai ? filterTglSampai.value : "";
        const periodeSampai = tglSampaiVal ? tglSampaiVal.slice(0, 7) : "";

        const akunMap = {};

        coaList.forEach(coa => {
            if (!isDetailAccount(coa)) return;
            const kode = String(coa.kodeAkun || "").trim();
            if (!kode) return;

            const cls = classifyAccount(coa);
            if (!cls) return;

            akunMap[kode] = {
                kodeAkun: kode,
                namaAkun: coa.namaAkun || "-",
                group: cls.group,
                groupLabel: cls.label,
                normalBalance: String(coa.normalBalance || coa.saldoNormal || "").trim().toLowerCase(),
                saldoAwalDebit: 0,
                saldoAwalKredit: 0,
                mutasiDebit: 0,
                mutasiKredit: 0
            };
        });

        saldoAwalList.forEach(sa => {
            if (unitVal && sa.unitUsaha && sa.unitUsaha !== unitVal) return;
            if (periodeSampai && sa.periode && String(sa.periode) > periodeSampai) return;

            const kode = String(sa.kodeAkun || "").trim();
            if (akunMap[kode]) {
                akunMap[kode].saldoAwalDebit += parseFloat(sa.debit) || 0;
                akunMap[kode].saldoAwalKredit += parseFloat(sa.kredit) || 0;
            }
        });

        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;
            if (tglMulaiVal && item.tglTransaksi && item.tglTransaksi < tglMulaiVal) return;
            if (tglSampaiVal && item.tglTransaksi && item.tglTransaksi > tglSampaiVal) return;

            if (Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    const kode = String(r.kodeAkun || "").trim();
                    if (akunMap[kode]) {
                        akunMap[kode].mutasiDebit += parseFloat(r.debet) || 0;
                        akunMap[kode].mutasiKredit += parseFloat(r.kredit) || 0;
                    }
                });
            }
        });

        const grouped = {
            aset: [],
            kewajiban: [],
            ekuitas: [],
            pendapatan: [],
            beban: []
        };

        let totalAset = 0;
        let totalKewajiban = 0;
        let totalEkuitas = 0;
        let totalPendapatan = 0;
        let totalBeban = 0;

        Object.values(akunMap)
            .sort((a, b) => String(a.kodeAkun).localeCompare(String(b.kodeAkun)))
            .forEach(acc => {
                const totalDebet = acc.saldoAwalDebit + acc.mutasiDebit;
                const totalKredit = acc.saldoAwalKredit + acc.mutasiKredit;
                const debitNet = totalDebet - totalKredit;
                const kreditNet = totalKredit - totalDebet;

                let saldoAkhir = 0;
                if (acc.group === "aset") {
                    const isContra = acc.normalBalance === "kredit" || acc.namaAkun.toLowerCase().includes("akumulasi");
                    saldoAkhir = isContra ? -kreditNet : debitNet;
                    totalAset += saldoAkhir;
                } else if (acc.group === "kewajiban") {
                    const isContra = acc.normalBalance === "debet";
                    saldoAkhir = isContra ? -debitNet : kreditNet;
                    totalKewajiban += saldoAkhir;
                } else if (acc.group === "ekuitas") {
                    const isContra = acc.normalBalance === "debet" || acc.namaAkun.toLowerCase().includes("prive");
                    saldoAkhir = isContra ? -debitNet : kreditNet;
                    totalEkuitas += saldoAkhir;
                } else if (acc.group === "pendapatan") {
                    saldoAkhir = kreditNet;
                    totalPendapatan += saldoAkhir;
                } else if (acc.group === "beban") {
                    saldoAkhir = debitNet;
                    totalBeban += saldoAkhir;
                }

                grouped[acc.group].push({
                    kodeAkun: acc.kodeAkun,
                    namaAkun: acc.namaAkun,
                    totalDebet,
                    totalKredit,
                    saldoAkhir
                });
            });

        const labaRugiBersih = totalPendapatan - totalBeban;
        const totalEkuitasTermasukLaba = totalEkuitas + labaRugiBersih;
        const totalPasiva = totalKewajiban + totalEkuitasTermasukLaba;

        if (totalAsetEl) totalAsetEl.textContent = `Rp ${totalAset.toLocaleString('id-ID')}`;
        if (totalPasivaEl) totalPasivaEl.textContent = `Rp ${totalPasiva.toLocaleString('id-ID')}`;
        if (totalPendapatanEl) totalPendapatanEl.textContent = `Rp ${totalPendapatan.toLocaleString('id-ID')}`;

        if (labaRugiEl) {
            labaRugiEl.textContent = `${labaRugiBersih < 0 ? '(-) ' : ''}Rp ${Math.abs(labaRugiBersih).toLocaleString('id-ID')}`;
            labaRugiEl.className = `text-xs sm:text-base font-extrabold mt-1 break-words ${
                labaRugiBersih > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : labaRugiBersih < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-slate-100'
            }`;
        }

        const sections = [
            { key: "aset", title: "A. Rincian Pos Aset", subtotal: totalAset },
            { key: "kewajiban", title: "B. Rincian Pos Kewajiban", subtotal: totalKewajiban },
            { key: "ekuitas", title: "C. Rincian Pos Ekuitas / Modal", subtotal: totalEkuitas },
            { key: "pendapatan", title: "D. Rincian Pos Pendapatan", subtotal: totalPendapatan },
            { key: "beban", title: "E. Rincian Pos Beban / Biaya", subtotal: totalBeban }
        ];

        let html = "";
        sections.forEach(sec => {
            const items = grouped[sec.key] || [];
            const subFormatted = sec.subtotal < 0
                ? `(-) Rp ${Math.abs(sec.subtotal).toLocaleString('id-ID')}`
                : `Rp ${sec.subtotal.toLocaleString('id-ID')}`;

            html += `
                <div class="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 font-bold text-slate-800 dark:text-slate-200 flex flex-wrap justify-between items-center gap-2">
                    <span>${sec.title} (${items.length} akun)</span>
                    <span class="text-indigo-600 dark:text-indigo-400">${subFormatted}</span>
                </div>
            `;

            if (items.length === 0) {
                html += `<div class="p-4 text-center text-slate-400">Tidak ada akun detail pada kelompok ini.</div>`;
            } else {
                // Tampilan Tabel (Desktop & Cetak)
                html += `
                    <div class="hidden md:block print:block overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                                    <th class="py-2 px-4 font-semibold w-28">Kode</th>
                                    <th class="py-2 px-4 font-semibold">Nama Akun</th>
                                    <th class="py-2 px-4 font-semibold text-right w-36">Total Debet</th>
                                    <th class="py-2 px-4 font-semibold text-right w-36">Total Kredit</th>
                                    <th class="py-2 px-4 font-semibold text-right w-40">Saldo Akhir</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                `;

                items.forEach(acc => {
                    const saldoFmt = acc.saldoAkhir < 0
                        ? `(-) Rp ${Math.abs(acc.saldoAkhir).toLocaleString('id-ID')}`
                        : `Rp ${acc.saldoAkhir.toLocaleString('id-ID')}`;

                    html += `
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td class="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">${acc.kodeAkun}</td>
                            <td class="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">${acc.namaAkun}</td>
                            <td class="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">Rp ${acc.totalDebet.toLocaleString('id-ID')}</td>
                            <td class="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">Rp ${acc.totalKredit.toLocaleString('id-ID')}</td>
                            <td class="py-2.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${saldoFmt}</td>
                        </tr>
                    `;
                });

                html += `
                            </tbody>
                        </table>
                    </div>
                `;

                // Tampilan Card (Versi HP)
                html += `<div class="block md:hidden print:hidden divide-y divide-slate-100 dark:divide-slate-800">`;
                items.forEach(acc => {
                    const saldoFmt = acc.saldoAkhir < 0
                        ? `(-) Rp ${Math.abs(acc.saldoAkhir).toLocaleString('id-ID')}`
                        : `Rp ${acc.saldoAkhir.toLocaleString('id-ID')}`;

                    html += `
                        <div class="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition space-y-2">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                    <span class="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] block">${acc.kodeAkun}</span>
                                    <p class="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug break-words">${acc.namaAkun}</p>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <span class="text-[10px] text-slate-400 block uppercase">Saldo Akhir</span>
                                    <span class="font-bold text-slate-900 dark:text-slate-100 text-xs">${saldoFmt}</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2.5 py-2 text-[11px]">
                                <div>
                                    <span class="text-slate-400 block text-[10px]">Total Debet</span>
                                    <span class="font-semibold text-slate-700 dark:text-slate-300">Rp ${acc.totalDebet.toLocaleString('id-ID')}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-slate-400 block text-[10px]">Total Kredit</span>
                                    <span class="font-semibold text-slate-700 dark:text-slate-300">Rp ${acc.totalKredit.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        });

        rincianContainer.innerHTML = html;

        if (statusMsgEl) {
            const unitLabel = unitVal || "Semua Unit Usaha";
            const periodeLabel = tglMulaiVal || tglSampaiVal
                ? `${tglMulaiVal || "Awal"} s/d ${tglSampaiVal || "Sekarang"}`
                : "Seluruh Periode";
            statusMsgEl.textContent = `${unitLabel} • ${periodeLabel}`;
        }
    }

    const onTampilkanClick = () => prosesCalk();
    const onUnitChange = () => {
        loadSavedCatatan().then(() => prosesCalk());
    };
    const onSimpanClick = () => simpanCatatan();
    const onCetakClick = () => window.print();

    if (btnTampilkan) btnTampilkan.addEventListener('click', onTampilkanClick);
    if (filterUnit) filterUnit.addEventListener('change', onUnitChange);
    if (btnSimpan) btnSimpan.addEventListener('click', onSimpanClick);
    if (btnCetak) btnCetak.addEventListener('click', onCetakClick);

    const cleanup = () => {
        if (btnTampilkan) btnTampilkan.removeEventListener('click', onTampilkanClick);
        if (filterUnit) filterUnit.removeEventListener('change', onUnitChange);
        if (btnSimpan) btnSimpan.removeEventListener('click', onSimpanClick);
        if (btnCetak) btnCetak.removeEventListener('click', onCetakClick);
        window.removeEventListener('hashchange', cleanup);
        calkCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    calkCleanup = cleanup;

    loadData();

    return cleanup;
}