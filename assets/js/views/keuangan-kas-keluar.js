// File: assets/js/views/keuangan-kas-keluar.js
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderKasKeluar() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/keuangan" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Menu Keuangan</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pencatatan Kas Keluar (Cash Out)</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan transaksi pembayaran beban operasional, pembelian inventaris, atau pelunasan hutang BUMKal.</p>
                </div>
            </div>

            <!-- Form Input Kas Keluar -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Transaksi Kas Keluar</h2>
                <form id="form-kas-keluar" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="kk-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="kk-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN BEBAN / PENGELUARAN (DEBET) *</label>
                        <select id="kk-akun-beban" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Beban --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN KAS / BANK PEMBAYAR (KREDIT) *</label>
                        <select id="kk-akun-kas" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Kas --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH NOMINAL (RP) *</label>
                        <input type="number" id="kk-jumlah" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DIBAYARKAN KEPADA / PENERIMA *</label>
                        <input type="text" id="kk-penerima" placeholder="Contoh: Toko Bangunan / Vendor / Staf" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN TRANSAKSI *</label>
                        <input type="text" id="kk-keterangan" placeholder="Contoh: Pembayaran pembelian alat kebersihan unit kantor" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex justify-end gap-2 pt-2">
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Transaksi Kas Keluar</button>
                    </div>
                </form>
            </div>

            <!-- Tabel Riwayat Kas Keluar -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>RIWAYAT TRANSAKSI KAS KELUAR</span>
                    <span id="total-kk-count" class="text-slate-500 font-normal">Total: 0 Data</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-36">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold w-40">Penerima / Vendor</th>
                                <th class="py-3 px-4 font-semibold">Uraian & Akun</th>
                                <th class="py-3 px-4 font-semibold text-right w-40">Jumlah (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-kk-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data riwayat kas keluar...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function initKasKeluarHandler() {
    const formKasKeluar = document.getElementById('form-kas-keluar');
    const kkTgl = document.getElementById('kk-tgl');
    const kkUnit = document.getElementById('kk-unit');
    const kkAkunBeban = document.getElementById('kk-akun-beban');
    const kkAkunKas = document.getElementById('kk-akun-kas');
    const kkJumlah = document.getElementById('kk-jumlah');
    const kkPenerima = document.getElementById('kk-penerima');
    const kkKeterangan = document.getElementById('kk-keterangan');
    const tableBody = document.getElementById('table-kk-body');
    const totalCountEl = document.getElementById('total-kk-count');

    // Set default tanggal hari ini
    if (kkTgl) {
        kkTgl.value = new Date().toISOString().split('T')[0];
    }

    let kasKeluarList = [];

    async function loadCoaAndData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            
            if (kkAkunBeban) kkAkunBeban.innerHTML = '<option value="">-- Pilih Akun Beban / Pengeluaran --</option>';
            if (kkAkunKas) kkAkunKas.innerHTML = '<option value="">-- Pilih Akun Kas / Bank Pembayar --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const kode = data.kodeAkun || "";
                const nama = data.namaAkun || "";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();
                const group = (data.reportGroup || "").toLowerCase();

                if (level === "4" || tipe === "detail") {
                    // Akun Kas / Bank
                    if (kode.startsWith("1.01") || group.includes("kas") || group.includes("bank")) {
                        if (kkAkunKas) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${nama}`;
                            kkAkunKas.appendChild(opt);
                        }
                    }
                    // Akun Beban / Biaya / Lainnya
                    if (kkAkunBeban) {
                        const opt = document.createElement('option');
                        opt.value = kode;
                        opt.textContent = `${kode} - ${nama}`;
                        kkAkunBeban.appendChild(opt);
                    }
                }
            });

            // Load Riwayat dari jurnal_umum yang mengandung penanda kas keluar
            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            kasKeluarList = [];
            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data();
                if (jData.keterangan && jData.keterangan.toLowerCase().includes("[kas keluar]")) {
                    kasKeluarList.push({ id: docSnap.id, ...jData });
                }
            });

            renderTable();
        } catch (err) {
            console.error("Gagal memuat data kas keluar:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        if (!tableBody) return;
        if (totalCountEl) totalCountEl.textContent = `Total: ${kasKeluarList.length} Data`;

        if (kasKeluarList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi kas keluar.</td></tr>`;
            return;
        }

        let html = "";
        kasKeluarList.forEach(item => {
            let nominal = 0;
            let akunDebet = "-";
            let akunKredit = "-";

            if (item.rincian && Array.isArray(item.rincian) && item.rincian.length >= 2) {
                nominal = parseFloat(item.rincian[0].debet || 0);
                akunDebet = `${item.rincian[0].kodeAkun} - ${item.rincian[0].namaAkun}`;
                akunKredit = `${item.rincian[1].kodeAkun} - ${item.rincian[1].namaAkun}`;
            }

            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tglTransaksi}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unitUsaha || '-'}</td>
                    <td class="py-3 px-4 font-semibold text-rose-600 dark:text-rose-400">${item.penerimaDana || '-'}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-medium text-slate-800 dark:text-slate-200">${item.keterangan}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">Debet: ${akunDebet} | Kredit: ${akunKredit}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">Rp ${nominal.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="window.deleteKasKeluarItem('${item.id}')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Transaksi">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    }

    window.deleteKasKeluarItem = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi kas keluar ini?")) {
            try {
                await deleteDoc(doc(db, "jurnal_umum", id));
                alert("Transaksi kas keluar berhasil dihapus.");
                loadCoaAndData();
            } catch (err) {
                console.error("Gagal menghapus kas keluar:", err);
                alert("Gagal menghapus data.");
            }
        }
    };

    if (formKasKeluar) {
        formKasKeluar.onsubmit = async (e) => {
            e.preventDefault();
            const tgl = kkTgl.value;
            const unit = kkUnit.value;
            const akunBebanVal = kkAkunBeban.value;
            const akunKasVal = kkAkunKas.value;
            const jumlah = parseFloat(kkJumlah.value) || 0;
            const penerima = kkPenerima.value;
            const ket = kkKeterangan.value;

            const bebanOpt = kkAkunBeban.options[kkAkunBeban.selectedIndex];
            const namaBeban = bebanOpt ? bebanOpt.textContent.split(' - ')[1] : "Beban / Biaya";

            const kasOpt = kkAkunKas.options[kkAkunKas.selectedIndex];
            const namaKas = kasOpt ? kasOpt.textContent.split(' - ')[1] : "Kas / Bank";

            // Buat rincian jurnal double-entry: Beban (Debet) vs Kas/Bank (Kredit)
            const rincianJurnal = [
                { kodeAkun: akunBebanVal, namaAkun: namaBeban, debet: jumlah, kredit: 0 },
                { kodeAkun: akunKasVal, namaAkun: namaKas, debet: 0, kredit: jumlah }
            ];

            const payloadJurnal = {
                noRef: `KK-${Date.now().toString().slice(-6)}`,
                tglTransaksi: tgl,
                unitUsaha: unit,
                penerimaDana: penerima,
                keterangan: `[Kas Keluar] ${ket}`,
                rincian: rincianJurnal,
                createdAt: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, "jurnal_umum"), payloadJurnal);
                alert("Transaksi kas keluar berhasil disimpan ke sistem akuntansi.");
                formKasKeluar.reset();
                kkTgl.value = new Date().toISOString().split('T')[0];
                loadCoaAndData();
            } catch (err) {
                console.error("Gagal menyimpan kas keluar:", err);
                alert("Terjadi kesalahan saat menyimpan data.");
            }
        };
    }

    loadCoaAndData();
}