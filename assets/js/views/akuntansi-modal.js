// File: assets/js/views/akuntansi-modal.js
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderModal() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/akuntansi" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Kembali ke Menu Akuntansi</a>
                    </div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengelolaan Modal & Ekuitas (Modal / Prive)</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan setoran modal awal, penambahan modal, atau prive penarikan pemilik/pengelola BUMKal.</p>
                </div>
            </div>

            <!-- Form Input Transaksi Modal -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Transaksi Modal & Prive</h2>
                <form id="form-modal" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="modal-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="modal-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JENIS TRANSAKSI MODAL *</label>
                        <select id="modal-jenis" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="Setoran Modal">Setoran / Penambahan Modal</option>
                            <option value="Prive / Penarikan">Prive / Penarikan Dana Pihak Pengelola</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN MODAL / EKUITAS (COA) *</label>
                        <select id="modal-akun-kode" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Modal --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH NOMINAL (RP) *</label>
                        <input type="number" id="modal-jumlah" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN *</label>
                        <input type="text" id="modal-keterangan" placeholder="Contoh: Setoran modal awal untuk pengembangan unit usaha" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex justify-end gap-2 pt-2">
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Transaksi Modal</button>
                    </div>
                </form>
            </div>

            <!-- Tabel Riwayat Transaksi Modal -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>RIWAYAT TRANSAKSI MODAL & EKUITAS</span>
                    <span id="total-modal-count" class="text-slate-500 font-normal">Total: 0 Data</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-40">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold w-36">Jenis</th>
                                <th class="py-3 px-4 font-semibold">Akun & Keterangan</th>
                                <th class="py-3 px-4 font-semibold text-right w-40">Jumlah (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-modal-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data riwayat modal...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export function initModalHandler() {
    const formModal = document.getElementById('form-modal');
    const modalTgl = document.getElementById('modal-tgl');
    const modalUnit = document.getElementById('modal-unit');
    const modalJenis = document.getElementById('modal-jenis');
    const modalAkunKode = document.getElementById('modal-akun-kode');
    const modalJumlah = document.getElementById('modal-jumlah');
    const modalKeterangan = document.getElementById('modal-keterangan');
    const tableBody = document.getElementById('table-modal-body');
    const totalCountEl = document.getElementById('total-modal-count');

    // Set tanggal hari ini default
    if (modalTgl) {
        modalTgl.value = new Date().toISOString().split('T')[0];
    }

    let coaList = [];
    let modalList = [];

    async function loadCoaAndModal() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);
            coaList = [];
            if (modalAkunKode) modalAkunKode.innerHTML = '<option value="">-- Pilih Akun Modal (COA) --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const reportGroup = (data.reportGroup || "").toLowerCase();
                const kategori = (data.kategori || "").toLowerCase();
                const kode = data.kodeAkun || "";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();

                if (level === "4" || tipe === "detail") {
                    if (reportGroup.includes("modal") || reportGroup.includes("ekuitas") || kategori.includes("modal") || kategori.includes("ekuitas") || kode.startsWith("3")) {
                        if (modalAkunKode) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${data.namaAkun}`;
                            modalAkunKode.appendChild(opt);
                        }
                    }
                }
            });

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            modalList = [];
            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data();
                if (jData.keterangan && (jData.keterangan.toLowerCase().includes("modal") || jData.keterangan.toLowerCase().includes("prive"))) {
                    modalList.push({ id: docSnap.id, ...jData });
                }
            });

            renderTable();
        } catch (err) {
            console.error("Gagal memuat data modal:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        if (!tableBody) return;
        if (totalCountEl) totalCountEl.textContent = `Total: ${modalList.length} Data`;

        if (modalList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi modal atau prive.</td></tr>`;
            return;
        }

        let html = "";
        modalList.forEach(item => {
            let nominal = 0;
            let akunInfo = "-";
            if (item.rincian && Array.isArray(item.rincian) && item.rincian.length > 0) {
                nominal = parseFloat(item.rincian[0].kredit || item.rincian[0].debet || 0);
                akunInfo = `${item.rincian[0].kodeAkun} - ${item.rincian[0].namaAkun}`;
            }

            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tglTransaksi}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unitUsaha || '-'}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 text-[11px] font-bold ${item.keterangan.toLowerCase().includes('prive') ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">
                            ${item.keterangan.toLowerCase().includes('prive') ? 'Prive / Penarikan' : 'Setoran Modal'}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${akunInfo}</div>
                        <div class="text-slate-500 text-[11px] mt-0.5">${item.keterangan}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">Rp ${nominal.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <button onclick="window.deleteModalItem('${item.id}')" class="text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Transaksi">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    }

    window.deleteModalItem = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi modal ini?")) {
            try {
                await deleteDoc(doc(db, "jurnal_umum", id));
                alert("Transaksi modal berhasil dihapus.");
                loadCoaAndModal();
            } catch (err) {
                console.error("Gagal menghapus transaksi modal:", err);
                alert("Gagal menghapus data.");
            }
        }
    };

    if (formModal) {
        formModal.onsubmit = async (e) => {
            e.preventDefault();
            const tgl = modalTgl.value;
            const unit = modalUnit.value;
            const jenis = modalJenis.value;
            const akunKode = modalAkunKode.value;
            const jumlah = parseFloat(modalJumlah.value) || 0;
            const ket = modalKeterangan.value;

            const selectedCoaOpt = modalAkunKode.options[modalAkunKode.selectedIndex];
            const namaAkun = selectedCoaOpt ? selectedCoaOpt.textContent.split(' - ')[1] : "Modal / Ekuitas";

            let rincianJurnal = [];
            if (jenis === "Setoran Modal") {
                rincianJurnal = [
                    { kodeAkun: "1.01.01", namaAkun: "Kas / Bank", debet: jumlah, kredit: 0 },
                    { kodeAkun: akunKode, namaAkun: namaAkun, debet: 0, kredit: jumlah }
                ];
            } else {
                rincianJurnal = [
                    { kodeAkun: akunKode, namaAkun: namaAkun, debet: jumlah, kredit: 0 },
                    { kodeAkun: "1.01.01", namaAkun: "Kas / Bank", debet: 0, kredit: jumlah }
                ];
            }

            const payloadJurnal = {
                noRef: `MOD-${Date.now().toString().slice(-6)}`,
                tglTransaksi: tgl,
                unitUsaha: unit,
                keterangan: `[${jenis}] ${ket}`,
                rincian: rincianJurnal,
                createdAt: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, "jurnal_umum"), payloadJurnal);
                alert("Transaksi modal berhasil disimpan ke sistem akuntansi.");
                formModal.reset();
                modalTgl.value = new Date().toISOString().split('T')[0];
                loadCoaAndModal();
            } catch (err) {
                console.error("Gagal menyimpan transaksi modal:", err);
                alert("Terjadi kesalahan saat menyimpan data.");
            }
        };
    }

    loadCoaAndModal();
}