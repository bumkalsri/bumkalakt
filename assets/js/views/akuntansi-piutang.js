// File: assets/js/views/akuntansi-piutang.js
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderPiutang() {
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
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengelolaan Piutang Usaha</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Catat tagihan piutang, pantau jatuh tempo, dan proses pelunasan piutang BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Ringkasan Piutang -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <span class="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Piutang Tercatat</span>
                    <span id="total-piutang-semua" class="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">Rp 0</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <span class="block text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Sisa Tagihan Belum Lunas</span>
                    <span id="total-piutang-sisa" class="text-sm font-bold text-amber-700 dark:text-amber-300 mt-1 block">Rp 0</span>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                    <span class="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Sudah Dilunasi</span>
                    <span id="total-piutang-lunas" class="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">Rp 0</span>
                </div>
            </div>

            <!-- Form Input Piutang Baru -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Pencatatan Piutang Baru</h2>
                <form id="form-piutang" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="piutang-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JATUH TEMPO</label>
                        <input type="date" id="piutang-jatuh-tempo" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="piutang-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">NAMA DEBITUR / PELANGGAN *</label>
                        <input type="text" id="piutang-debitur" placeholder="Nama pihak yang berutang / pelanggan" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN PIUTANG (COA) *</label>
                        <select id="piutang-akun-kode" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Piutang --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH TAGIHAN (RP) *</label>
                        <input type="number" id="piutang-jumlah" min="1" step="any" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN *</label>
                        <input type="text" id="piutang-keterangan" placeholder="Contoh: Penjualan pupuk kompos / paket wisata tempo" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex justify-end gap-2 pt-2">
                        <button type="submit" id="btn-simpan-piutang" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Piutang</button>
                    </div>
                </form>
            </div>

            <!-- Filter & Tabel Daftar Piutang -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <span class="font-bold text-slate-800 dark:text-slate-200">DAFTAR PIUTANG USAHA</span>
                    <div class="flex flex-wrap items-center gap-2">
                        <select id="filter-status-piutang" class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-none">
                            <option value="">-- Semua Status --</option>
                            <option value="Belum Lunas">Belum Lunas</option>
                            <option value="Lunas">Lunas</option>
                        </select>
                        <span id="total-piutang-count" class="text-slate-500 font-normal">Total: 0 Data</span>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold">Tanggal / Tempo</th>
                                <th class="py-3 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold">Debitur & Keterangan</th>
                                <th class="py-3 px-4 font-semibold text-right">Jumlah (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center">Status</th>
                                <th class="py-3 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-piutang-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data piutang...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-piutang" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-piutang-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-piutang-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let piutangToastTimer = null;

export function initPiutangHandler() {
    const formPiutang = document.getElementById('form-piutang');
    const piutangTgl = document.getElementById('piutang-tgl');
    const piutangJatuhTempo = document.getElementById('piutang-jatuh-tempo');
    const piutangUnit = document.getElementById('piutang-unit');
    const piutangDebitur = document.getElementById('piutang-debitur');
    const piutangAkunKode = document.getElementById('piutang-akun-kode');
    const piutangJumlah = document.getElementById('piutang-jumlah');
    const piutangKeterangan = document.getElementById('piutang-keterangan');
    const btnSimpanPiutang = document.getElementById('btn-simpan-piutang');

    const filterStatus = document.getElementById('filter-status-piutang');
    const tableBody = document.getElementById('table-piutang-body');
    const totalCountEl = document.getElementById('total-piutang-count');
    const totalSemuaEl = document.getElementById('total-piutang-semua');
    const totalSisaEl = document.getElementById('total-piutang-sisa');
    const totalLunasEl = document.getElementById('total-piutang-lunas');

    if (piutangTgl && !piutangTgl.value) {
        piutangTgl.value = new Date().toISOString().split('T')[0];
    }

    let piutangList = [];

    function formatRupiah(num) {
        return "Rp " + Number(num || 0).toLocaleString('id-ID');
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-piutang');
        const msgEl = document.getElementById('toast-piutang-message');
        const iconEl = document.getElementById('toast-piutang-icon');
        if (!toast || !msgEl) return;

        if (piutangToastTimer) clearTimeout(piutangToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        piutangToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    function updateRingkasan() {
        let totalSemua = 0;
        let totalSisa = 0;
        let totalLunas = 0;

        piutangList.forEach(item => {
            const jumlah = Number(item.jumlah || 0);
            totalSemua += jumlah;
            if (item.status === "Lunas") {
                totalLunas += jumlah;
            } else {
                totalSisa += jumlah;
            }
        });

        if (totalSemuaEl) totalSemuaEl.textContent = formatRupiah(totalSemua);
        if (totalSisaEl) totalSisaEl.textContent = formatRupiah(totalSisa);
        if (totalLunasEl) totalLunasEl.textContent = formatRupiah(totalLunas);
    }

    async function loadCoaAndPiutang() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            if (piutangAkunKode) piutangAkunKode.innerHTML = '<option value="">-- Pilih Akun Piutang (COA) --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const namaLower = (data.namaAkun || "").toLowerCase();
                const kode = data.kodeAkun || "";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();

                if ((level === "4" || tipe === "detail") && data.statusAkun !== "Nonaktif") {
                    if (namaLower.includes("piutang") || kode.startsWith("1.02") || kode.startsWith("1.03")) {
                        if (piutangAkunKode) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${data.namaAkun}`;
                            piutangAkunKode.appendChild(opt);
                        }
                    }
                }
            });

            const qPiutang = query(collection(db, "piutang"), orderBy("tglTransaksi", "desc"));
            const snapPiutang = await getDocs(qPiutang);
            piutangList = [];
            snapPiutang.forEach(docSnap => {
                piutangList.push({ id: docSnap.id, ...docSnap.data() });
            });

            updateRingkasan();
            renderTable();
        } catch (err) {
            console.error("Gagal memuat data piutang:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        if (!tableBody) return;
        const statusFilter = filterStatus ? filterStatus.value : "";
        const filtered = piutangList.filter(item => !statusFilter || item.status === statusFilter);

        if (totalCountEl) totalCountEl.textContent = `Total: ${filtered.length} Data`;

        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data piutang.</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(item => {
            const isLunas = item.status === "Lunas";
            const badgeClass = isLunas
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";

            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        <div>${item.tglTransaksi || '-'}</div>
                        <div class="text-[11px] text-slate-500">Tempo: ${item.jatuhTempo || '-'}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unitUsaha || '-'}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${item.debitur || '-'} (${item.kodeAkun || '-'})</div>
                        <div class="text-slate-500 text-[11px] mt-0.5">${item.keterangan || '-'}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${formatRupiah(item.jumlah)}</td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2 py-0.5 text-[11px] font-bold ${badgeClass}">${item.status || 'Belum Lunas'}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            ${!isLunas ? `<button type="button" data-lunasi-id="${item.id}" class="btn-lunasi-piutang px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition text-[11px] font-semibold cursor-pointer">Lunasi</button>` : ''}
                            <button type="button" data-delete-piutang="${item.id}" class="btn-hapus-piutang text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Piutang">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

        document.querySelectorAll('.btn-lunasi-piutang').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-lunasi-id');
                const target = piutangList.find(p => p.id === id);
                if (!target) return;

                btn.disabled = true;
                try {
                    const tglLunas = new Date().toISOString().split('T')[0];
                    await updateDoc(doc(db, "piutang", id), {
                        status: "Lunas",
                        tglLunas,
                        updatedAt: new Date().toISOString()
                    });

                    await addDoc(collection(db, "jurnal_umum"), {
                        noRef: `PIU-LNS-${Date.now().toString().slice(-6)}`,
                        tglTransaksi: tglLunas,
                        unitUsaha: target.unitUsaha || "KANTOR PUSAT (01)",
                        keterangan: `[Pelunasan Piutang] ${target.debitur || ''} - ${target.keterangan || ''}`,
                        rincian: [
                            { kodeAkun: "1.01.01", namaAkun: "Kas / Bank", debet: Number(target.jumlah || 0), kredit: 0 },
                            { kodeAkun: target.kodeAkun || "1.02.01", namaAkun: target.namaAkun || "Piutang Usaha", debet: 0, kredit: Number(target.jumlah || 0) }
                        ],
                        totalNilai: Number(target.jumlah || 0),
                        createdAt: new Date().toISOString()
                    });

                    showToast("Piutang berhasil dilunasi dan dicatat ke jurnal.");
                    await loadCoaAndPiutang();
                } catch (err) {
                    console.error("Gagal melunasi piutang:", err);
                    showToast("Gagal memproses pelunasan piutang.", true);
                    btn.disabled = false;
                }
            };
        });

        document.querySelectorAll('.btn-hapus-piutang').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-piutang');
                if (!id) return;
                if (confirm("Apakah Anda yakin ingin menghapus data piutang ini?")) {
                    try {
                        await deleteDoc(doc(db, "piutang", id));
                        showToast("Data piutang berhasil dihapus.");
                        await loadCoaAndPiutang();
                    } catch (err) {
                        console.error("Gagal menghapus piutang:", err);
                        showToast("Gagal menghapus data piutang.", true);
                    }
                }
            };
        });
    }

    if (filterStatus) filterStatus.onchange = renderTable;

    if (formPiutang) {
        formPiutang.onsubmit = async (e) => {
            e.preventDefault();
            const tgl = piutangTgl ? piutangTgl.value : "";
            const jatuhTempo = piutangJatuhTempo ? piutangJatuhTempo.value : "";
            const unit = piutangUnit ? piutangUnit.value : "";
            const debitur = piutangDebitur ? piutangDebitur.value.trim() : "";
            const akunKode = piutangAkunKode ? piutangAkunKode.value : "";
            const jumlah = parseFloat(piutangJumlah ? piutangJumlah.value : 0) || 0;
            const ket = piutangKeterangan ? piutangKeterangan.value.trim() : "";

            if (!akunKode) {
                showToast("Pilih akun piutang terlebih dahulu.", true);
                return;
            }
            if (jumlah <= 0) {
                showToast("Jumlah tagihan harus lebih besar dari 0.", true);
                return;
            }

            const selectedCoaOpt = piutangAkunKode.options[piutangAkunKode.selectedIndex];
            const namaAkun = selectedCoaOpt ? selectedCoaOpt.textContent.split(' - ').slice(1).join(' - ') || "Piutang Usaha" : "Piutang Usaha";

            if (btnSimpanPiutang) {
                btnSimpanPiutang.disabled = true;
                btnSimpanPiutang.textContent = "Menyimpan...";
            }

            try {
                await addDoc(collection(db, "piutang"), {
                    noRef: `PIU-${Date.now().toString().slice(-6)}`,
                    tglTransaksi: tgl,
                    jatuhTempo,
                    unitUsaha: unit,
                    debitur,
                    kodeAkun: akunKode,
                    namaAkun,
                    jumlah,
                    keterangan: ket,
                    status: "Belum Lunas",
                    createdAt: new Date().toISOString()
                });

                await addDoc(collection(db, "jurnal_umum"), {
                    noRef: `PIU-${Date.now().toString().slice(-6)}`,
                    tglTransaksi: tgl,
                    unitUsaha: unit,
                    keterangan: `[Piutang] ${debitur} - ${ket}`,
                    rincian: [
                        { kodeAkun: akunKode, namaAkun, debet: jumlah, kredit: 0 },
                        { kodeAkun: "4.01.01", namaAkun: "Pendapatan Usaha", debet: 0, kredit: jumlah }
                    ],
                    totalNilai: jumlah,
                    createdAt: new Date().toISOString()
                });

                showToast("Data piutang berhasil disimpan.");
                formPiutang.reset();
                if (piutangTgl) piutangTgl.value = new Date().toISOString().split('T')[0];
                await loadCoaAndPiutang();
            } catch (err) {
                console.error("Gagal menyimpan piutang:", err);
                showToast("Terjadi kesalahan saat menyimpan data piutang.", true);
            } finally {
                if (btnSimpanPiutang) {
                    btnSimpanPiutang.disabled = false;
                    btnSimpanPiutang.textContent = "Simpan Piutang";
                }
            }
        };
    }

    loadCoaAndPiutang();
}