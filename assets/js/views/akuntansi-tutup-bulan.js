// File: assets/js/views/akuntansi-tutup-bulan.js
import { collection, getDocs, setDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const NAMA_BULAN = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember"
};

function getNextPeriodKey(periodKey) {
    const match = String(periodKey || "").match(/^(\d{4})-(\d{2})$/);
    if (!match) return "2025-02";
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10) + 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    return `${year}-${String(month).padStart(2, "0")}`;
}

function formatPeriodeLabel(periodKey) {
    const match = String(periodKey || "").match(/^(\d{4})-(\d{2})$/);
    if (!match) return periodKey || "-";
    const namaBln = NAMA_BULAN[match[2]] || match[2];
    return `${namaBln} ${match[1]}`;
}

export function renderAkuntansiTutupBulan() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/akuntansi" data-link title="Kembali ke Akuntansi" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Proses Tutup Bulan</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola periode aktif, kunci transaksi bulanan, dan buka kembali periode lampau BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Layout Utama Sesuai Format (Kiri: Status Periode Aktif | Kanan: Tutup Buku Bulanan & Buka Kembali Periode Lampau) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs items-stretch">
                <!-- Kolom Kiri: Status Periode Aktif -->
                <div class="lg:col-span-5 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col justify-between space-y-5">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full bg-sky-500 inline-block flex-shrink-0"></span>
                            <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Status Periode Aktif</h2>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Periode akuntansi yang sedang terbuka saat ini. Seluruh transaksi harian hanya dapat diinput pada bulan yang aktif.
                        </p>
                    </div>

                    <div class="bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none p-6 text-center space-y-1.5">
                        <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">BULAN AKTIF SAAT INI</span>
                        <div id="periode-aktif-judul" class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Memuat...</div>
                        <div id="periode-aktif-kode" class="text-xs font-semibold text-slate-500 dark:text-slate-400">(-)</div>
                    </div>

                    <!-- Ringkasan Jurnal Bulan Aktif -->
                    <div class="grid grid-cols-3 gap-2.5 text-center">
                        <div class="bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-none">
                            <span class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">Jurnal</span>
                            <span id="rekap-jumlah-jurnal" class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">0</span>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-none">
                            <span class="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Debet</span>
                            <span id="rekap-total-debet" class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">Rp 0</span>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-none">
                            <span class="block text-[10px] font-semibold text-purple-600 dark:text-purple-400">Kredit</span>
                            <span id="rekap-total-kredit" class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">Rp 0</span>
                        </div>
                    </div>

                    <div class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-none p-3.5 text-amber-900 dark:text-amber-200 leading-relaxed">
                        <span class="font-bold">&#9888; Perhatian:</span> Melakukan tutup buku bulanan akan mengunci transaksi pada bulan ini. Pastikan seluruh pencatatan sudah beres.
                    </div>
                </div>

                <!-- Kolom Kanan: Proses Tutup Buku Bulanan + Buka Kembali Periode Lampau -->
                <div class="lg:col-span-7 space-y-6 flex flex-col justify-between">
                    <!-- Kartu Kanan Atas: Proses Tutup Buku Bulanan -->
                    <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none space-y-4">
                        <div class="space-y-1.5">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-emerald-600 inline-block flex-shrink-0"></span>
                                <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Proses Tutup Buku Bulanan</h2>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Pindahkan periode operasional ke bulan berikutnya. Sistem akan otomatis menghitung bulan baru berdasarkan periode aktif saat ini.
                            </p>
                        </div>

                        <div>
                            <label for="periode-berikutnya-input" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Periode Berikutnya yang Akan Dibuka</label>
                            <input type="text" id="periode-berikutnya-input" readonly
                                class="w-full bg-slate-100 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-none focus:outline-none">
                            <span class="block text-[11px] text-slate-400 mt-1">Dihitung otomatis oleh sistem (Format: YYYY-MM).</span>
                        </div>

                        <div>
                            <label for="catatan-tutup-bulan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Keterangan (Opsi)</label>
                            <textarea id="catatan-tutup-bulan" rows="2" placeholder="Contoh: Tutup buku akhir bulan berjalan, semua rekonsiliasi selesai."
                                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 p-3 rounded-none focus:outline-none focus:border-rose-600"></textarea>
                        </div>

                        <button type="button" id="btn-proses-tutup-bulan"
                            class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-none transition cursor-pointer shadow-sm flex items-center justify-center gap-2">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            <span>Proses Tutup Buku &amp; Kunci Periode Ini</span>
                        </button>
                    </div>

                    <!-- Kartu Kanan Bawah: Buka Kembali Periode Lampau (Revisi) -->
                    <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none space-y-4">
                        <div class="space-y-1.5">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full bg-amber-400 inline-block flex-shrink-0"></span>
                                <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Buka Kembali Periode Lampau (Revisi)</h2>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Gunakan fitur ini jika Anda perlu merevisi transaksi pada bulan lampau. <span class="italic">Catatan: Periode yang tahunnya sudah melalui Tutup Buku Akhir Tahun terkunci mutlak.</span>
                            </p>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-3">
                            <input type="text" id="input-buka-periode-revisi" placeholder="Format: YYYY-MM (Cth: 2026-01)" maxlength="7"
                                class="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-none focus:outline-none focus:border-amber-500">
                            <button type="button" id="btn-buka-periode-revisi"
                                class="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-5 py-2.5 rounded-none transition cursor-pointer shadow-sm flex items-center justify-center gap-2 whitespace-nowrap">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                                <span>Buka Periode</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Riwayat Tutup Bulan -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>RIWAYAT PERIODE TUTUP BULAN</span>
                    <span id="total-riwayat-tutup-bulan" class="text-slate-500 font-normal">Total: 0 Periode</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold">Periode</th>
                                <th class="py-3 px-4 font-semibold">Catatan</th>
                                <th class="py-3 px-4 font-semibold text-right">Jumlah Jurnal</th>
                                <th class="py-3 px-4 font-semibold text-right">Total Debet (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-right">Total Kredit (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center">Status</th>
                                <th class="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-tutup-bulan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="7" class="py-8 text-center text-slate-400">Memuat riwayat tutup bulan...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-tutup-bulan" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-tutup-bulan-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-tutup-bulan-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let tutupBulanToastTimer = null;

export function initAkuntansiTutupBulanHandler() {
    const periodeAktifJudulEl = document.getElementById('periode-aktif-judul');
    const periodeAktifKodeEl = document.getElementById('periode-aktif-kode');
    const periodeBerikutnyaInput = document.getElementById('periode-berikutnya-input');
    const catatanInput = document.getElementById('catatan-tutup-bulan');
    const btnProses = document.getElementById('btn-proses-tutup-bulan');

    const inputBukaRevisi = document.getElementById('input-buka-periode-revisi');
    const btnBukaRevisi = document.getElementById('btn-buka-periode-revisi');

    const rekapJumlahEl = document.getElementById('rekap-jumlah-jurnal');
    const rekapDebetEl = document.getElementById('rekap-total-debet');
    const rekapKreditEl = document.getElementById('rekap-total-kredit');

    const tableBody = document.getElementById('table-tutup-bulan-body');
    const totalRiwayatEl = document.getElementById('total-riwayat-tutup-bulan');

    let jurnalList = [];
    let closedPeriods = [];
    let closedYears = new Set();
    let activePeriodKey = "2025-01";

    function formatRupiah(num) {
        return "Rp " + Number(num || 0).toLocaleString('id-ID');
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-tutup-bulan');
        const msgEl = document.getElementById('toast-tutup-bulan-message');
        const iconEl = document.getElementById('toast-tutup-bulan-icon');
        if (!toast || !msgEl) return;

        if (tutupBulanToastTimer) clearTimeout(tutupBulanToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        tutupBulanToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function hitungRekapPeriode(periodKey) {
        let jumlahJurnal = 0;
        let totalDebet = 0;
        let totalKredit = 0;

        jurnalList.forEach(item => {
            if (item.tglTransaksi && String(item.tglTransaksi).startsWith(periodKey)) {
                jumlahJurnal += 1;
                if (Array.isArray(item.rincian)) {
                    item.rincian.forEach(r => {
                        totalDebet += Number(r.debet || 0);
                        totalKredit += Number(r.kredit || 0);
                    });
                } else {
                    const nilai = Number(item.totalNilai || 0);
                    totalDebet += nilai;
                    totalKredit += nilai;
                }
            }
        });

        if (rekapJumlahEl) rekapJumlahEl.textContent = `${jumlahJurnal} Transaksi`;
        if (rekapDebetEl) rekapDebetEl.textContent = formatRupiah(totalDebet);
        if (rekapKreditEl) rekapKreditEl.textContent = formatRupiah(totalKredit);

        return { jumlahJurnal, totalDebet, totalKredit };
    }

    function updateActivePeriodUI() {
        if (periodeAktifJudulEl) periodeAktifJudulEl.textContent = formatPeriodeLabel(activePeriodKey);
        if (periodeAktifKodeEl) periodeAktifKodeEl.textContent = `(${activePeriodKey})`;
        if (periodeBerikutnyaInput) periodeBerikutnyaInput.value = getNextPeriodKey(activePeriodKey);
        hitungRekapPeriode(activePeriodKey);
    }

    function isYearLocked(periodKey) {
        const yearStr = String(periodKey || "").slice(0, 4);
        return closedYears.has(yearStr);
    }

    async function bukaPeriodeByKey(periodKey) {
        const cleanKey = String(periodKey || "").trim();
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(cleanKey)) {
            showToast("Format periode harus YYYY-MM (contoh: 2026-01).", true);
            return;
        }

        if (isYearLocked(cleanKey)) {
            const yearStr = cleanKey.slice(0, 4);
            showToast(`Periode tahun ${yearStr} sudah melalui Tutup Buku Akhir Tahun dan terkunci mutlak.`, true);
            return;
        }

        if (!confirm(`Buka kembali periode ${cleanKey} untuk revisi transaksi?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "tutup_bulan", cleanKey));
            showToast(`Periode ${cleanKey} berhasil dibuka kembali.`);
            if (inputBukaRevisi) inputBukaRevisi.value = "";
            await loadDataTutupBulan();
        } catch (err) {
            console.error("Gagal membuka kembali periode:", err);
            showToast("Gagal membuka kembali periode.", true);
        }
    }

    function renderRiwayat() {
        if (!tableBody) return;
        if (totalRiwayatEl) totalRiwayatEl.textContent = `Total: ${closedPeriods.length} Periode`;

        if (closedPeriods.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">Belum ada periode bulanan yang ditutup.</td></tr>`;
            return;
        }

        let html = "";
        closedPeriods.forEach(item => {
            const key = item.periodKey || item.id;
            const lockedYear = isYearLocked(key);
            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${formatPeriodeLabel(key)} <span class="text-slate-400 font-normal">(${key})</span></td>
                    <td class="py-3 px-4 text-slate-500 dark:text-slate-400">${item.catatan || "-"}</td>
                    <td class="py-3 px-4 text-right font-medium">${Number(item.jumlahJurnal || 0)} Transaksi</td>
                    <td class="py-3 px-4 text-right font-semibold">${formatRupiah(item.totalDebet)}</td>
                    <td class="py-3 px-4 text-right font-semibold">${formatRupiah(item.totalKredit)}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 text-[11px] font-bold ${lockedYear ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">${lockedYear ? 'Terkunci Tahun' : (item.status || 'Ditutup')}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        ${lockedYear
                            ? `<span class="text-[11px] text-slate-400 font-semibold">Terkunci Mutlak</span>`
                            : `<button type="button" data-buka-periode="${key}" class="btn-buka-periode px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition text-[11px] font-semibold cursor-pointer">Buka Periode</button>`
                        }
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

        document.querySelectorAll('.btn-buka-periode').forEach(btn => {
            btn.onclick = async () => {
                const periodId = btn.getAttribute('data-buka-periode');
                if (periodId) await bukaPeriodeByKey(periodId);
            };
        });
    }

    async function loadDataTutupBulan() {
        try {
            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            jurnalList = [];
            snapJurnal.forEach(docSnap => {
                jurnalList.push({ id: docSnap.id, ...docSnap.data() });
            });

            const qTutup = query(collection(db, "tutup_bulan"), orderBy("periodKey", "desc"));
            const snapTutup = await getDocs(qTutup);
            closedPeriods = [];
            snapTutup.forEach(docSnap => {
                closedPeriods.push({ id: docSnap.id, ...docSnap.data() });
            });

            closedYears = new Set();
            try {
                const snapTahun = await getDocs(collection(db, "tutup_tahun"));
                snapTahun.forEach(docSnap => {
                    const dataThn = docSnap.data();
                    const yr = String(dataThn.tahun || docSnap.id || "").trim();
                    if (yr) closedYears.add(yr);
                });
            } catch (tahunErr) {
                console.warn("Gagal memuat status tutup_tahun:", tahunErr);
            }

            if (closedPeriods.length > 0) {
                const latestClosedKey = closedPeriods[0].periodKey || closedPeriods[0].id;
                activePeriodKey = getNextPeriodKey(latestClosedKey);
            } else {
                activePeriodKey = "2025-01";
            }

            updateActivePeriodUI();
            renderRiwayat();
        } catch (err) {
            console.error("Gagal memuat data tutup bulan:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    if (btnProses) {
        btnProses.onclick = async () => {
            const periodKey = activePeriodKey;
            const match = periodKey.match(/^(\d{4})-(\d{2})$/);
            const tahun = match ? match[1] : "2025";
            const bulan = match ? match[2] : "01";
            const namaBln = NAMA_BULAN[bulan] || bulan;
            const catatan = catatanInput ? catatanInput.value.trim() : "";

            if (isYearLocked(periodKey)) {
                showToast(`Tahun ${tahun} sudah melalui Tutup Buku Akhir Tahun dan terkunci mutlak.`, true);
                return;
            }

            const rekap = hitungRekapPeriode(periodKey);

            if (rekap.totalDebet !== rekap.totalKredit) {
                showToast(`Total Debet dan Kredit pada ${namaBln} ${tahun} belum balance!`, true);
                return;
            }

            btnProses.disabled = true;
            const originalBtnHtml = btnProses.innerHTML;
            btnProses.textContent = "Memproses...";

            try {
                await setDoc(doc(db, "tutup_bulan", periodKey), {
                    periodKey,
                    bulan,
                    tahun,
                    namaBulan: namaBln,
                    catatan,
                    nextPeriodKey: getNextPeriodKey(periodKey),
                    jumlahJurnal: rekap.jumlahJurnal,
                    totalDebet: rekap.totalDebet,
                    totalKredit: rekap.totalKredit,
                    status: "Ditutup",
                    closedAt: new Date().toISOString()
                });

                if (catatanInput) catatanInput.value = "";
                showToast(`Periode ${namaBln} ${tahun} (${periodKey}) berhasil ditutup & dikunci.`);
                await loadDataTutupBulan();
            } catch (err) {
                console.error("Gagal memproses tutup bulan:", err);
                showToast("Terjadi kesalahan saat memproses tutup bulan.", true);
            } finally {
                btnProses.disabled = false;
                btnProses.innerHTML = originalBtnHtml;
            }
        };
    }

    if (btnBukaRevisi) {
        btnBukaRevisi.onclick = async () => {
            const targetKey = inputBukaRevisi ? inputBukaRevisi.value.trim() : "";
            await bukaPeriodeByKey(targetKey);
        };
    }

    if (inputBukaRevisi) {
        inputBukaRevisi.onkeydown = async (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                await bukaPeriodeByKey(inputBukaRevisi.value.trim());
            }
        };
    }

    loadDataTutupBulan();
}