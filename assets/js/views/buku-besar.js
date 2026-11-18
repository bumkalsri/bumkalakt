// File: assets/js/views/buku-besar.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderBukuBesar() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/laporan" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Menu Laporan</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Buku Besar (General Ledger)</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rincian mutasi dan saldo akun perkiraan BUMKal.</p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button id="btn-cetak-buku-besar" class="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Cetak / Print Laporan
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                <div class="md:col-span-2">
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">PILIH AKUN PERKIRAAN *</label>
                    <select id="filter-akun" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Pilih Akun COA --</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">FILTER UNIT USAHA</label>
                    <select id="filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">-- Semua Unit --</option>
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
                    <button id="btn-tampilkan" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-none transition cursor-pointer shadow-sm">Tampilkan</button>
                </div>
            </div>

            <!-- Info Akun Terpilih & Saldo -->
            <div id="info-akun-card" class="hidden bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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
            </div>
        </div>
    `;
}

export function initBukuBesarHandler() {
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

    let coaList = [];
    let allJurnalList = [];

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
            alert("Silakan pilih Akun Perkiraan terlebih dahulu!");
            return;
        }

        const selectedCoa = coaList.find(c => c.kodeAkun === selectedKodeAkun);
        const namaAkunStr = selectedCoa ? `${selectedCoa.kodeAkun} - ${selectedCoa.namaAkun}` : selectedKodeAkun;
        const normalBalance = selectedCoa && selectedCoa.normalBalance ? selectedCoa.normalBalance.toLowerCase() : "debet";

        const unitVal = filterUnit ? filterUnit.value : "";
        const tglMulaiVal = filterTglMulai ? filterTglMulai.value : "";

        let mutasiList = [];
        allJurnalList.forEach(item => {
            if (unitVal && item.unitUsaha !== unitVal) return;

            if (item.rincian && Array.isArray(item.rincian)) {
                item.rincian.forEach(r => {
                    if (r.kodeAkun === selectedKodeAkun) {
                        mutasiList.push({
                            tglTransaksi: item.tglTransaksi || '',
                            noRef: item.noRef || '-',
                            unitUsaha: item.unitUsaha || '-',
                            keterangan: item.keterangan || '-',
                            debet: parseFloat(r.debet) || 0,
                            kredit: parseFloat(r.kredit) || 0
                        });
                    }
                });
            }
        });

        mutasiList.sort((a, b) => a.tglTransaksi.localeCompare(b.tglTransaksi));

        let runningBalance = 0;
        let totalDebet = 0;
        let totalKredit = 0;

        let processedMutasi = mutasiList.map(m => {
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
        if (totalMutasiLabel) totalMutasiLabel.textContent = `Menampilkan ${processedMutasi.length} Baris Mutasi`;

        if (processedMutasi.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Tidak ada transaksi mutasi untuk akun ini.</td></tr>`;
            cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Tidak ada transaksi mutasi untuk akun ini.</div>`;
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        processedMutasi.forEach(m => {
            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium">${m.tglTransaksi}</td>
                    <td class="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">${m.noRef}</td>
                    <td class="py-3 px-4"><span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${m.unitUsaha}</span></td>
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${m.keterangan}</td>
                    <td class="py-3 px-4 text-right text-indigo-600 font-semibold">${m.debet > 0 ? 'Rp ' + m.debet.toLocaleString('id-ID') : '-'}</td>
                    <td class="py-3 px-4 text-right text-purple-600 font-semibold">${m.kredit > 0 ? 'Rp ' + m.kredit.toLocaleString('id-ID') : '-'}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">Rp ${m.saldo.toLocaleString('id-ID')}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-xs border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${m.noRef}</span>
                        <span class="text-[11px] text-slate-500">${m.tglTransaksi}</span>
                    </div>
                    <div>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${m.unitUsaha}</span>
                    </div>
                    <div class="font-bold text-slate-800 dark:text-slate-200">${m.keterangan}</div>
                    <div class="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div>Debet: <span class="font-semibold text-indigo-600">${m.debet > 0 ? 'Rp ' + m.debet.toLocaleString('id-ID') : '-'}</span></div>
                        <div>Kredit: <span class="font-semibold text-purple-600">${m.kredit > 0 ? 'Rp ' + m.kredit.toLocaleString('id-ID') : '-'}</span></div>
                        <div class="text-right font-bold">Saldo: Rp ${m.saldo.toLocaleString('id-ID')}</div>
                    </div>
                </div>
            `;
        });

        tableBody.innerHTML = htmlTable;
        cardBody.innerHTML = htmlCard;
    }

    if (btnTampilkan) {
        btnTampilkan.onclick = prosesBukuBesar;
    }

    if (btnCetak) {
        btnCetak.onclick = () => {
            window.print();
        };
    }

    loadCoa().then(() => {
        loadJurnalData();
    });
}