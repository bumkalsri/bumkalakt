import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, auth } from "../firebase-init.js";

export function renderLaporan() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman & Tombol Aksi -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Keuangan & Akuntansi</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi pencatatan transaksi masuk dan keluar.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btn-tambah-laporan" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-none transition flex items-center gap-1.5 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah Transaksi
                    </button>
                </div>
            </div>

            <!-- Ringkasan Statistik Singkat -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] font-semibold text-slate-400 uppercase">Total Pemasukan</p>
                    <h3 id="stat-pemasukan" class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">Rp 0</h3>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] font-semibold text-slate-400 uppercase">Total Pengeluaran</p>
                    <h3 id="stat-pengeluaran" class="text-lg font-bold text-red-600 dark:text-red-400 mt-1">Rp 0</h3>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <p class="text-[11px] font-semibold text-slate-400 uppercase">Saldo Akhir</p>
                    <h3 id="stat-saldo" class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">Rp 0</h3>
                </div>
            </div>

            <!-- Tabel Data Laporan -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Transaksi</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <th class="p-3">Tanggal</th>
                                <th class="p-3">Keterangan</th>
                                <th class="p-3">Kategori</th>
                                <th class="p-3 text-right">Masuk (Dr)</th>
                                <th class="p-3 text-right">Keluar (Cr)</th>
                                <th class="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="tabel-laporan-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="6" class="p-6 text-center text-slate-400">Memuat data laporan...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MODAL TAMBAH TRANSAKSI -->
            <div id="modal-laporan" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Tambah Transaksi Baru</h3>
                    <form id="form-tambah-laporan" class="space-y-4 text-xs">
                        <div>
                            <label class="block text-slate-500 mb-1">Tanggal</label>
                            <input type="date" id="input-tanggal" required class="w-full border border-slate-200 dark:border-slate-700 bg-transparent p-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label class="block text-slate-500 mb-1">Jenis Transaksi</label>
                            <select id="input-jenis" class="w-full border border-slate-200 dark:border-slate-700 bg-transparent p-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                                <option value="masuk" class="dark:bg-slate-900">Pemasukan (Debit)</option>
                                <option value="keluar" class="dark:bg-slate-900">Pengeluaran (Kredit)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-500 mb-1">Keterangan / Uraian</label>
                            <input type="text" id="input-keterangan" required placeholder="Contoh: Penjualan Produk / Biaya Operasional" class="w-full border border-slate-200 dark:border-slate-700 bg-transparent p-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label class="block text-slate-500 mb-1">Kategori</label>
                            <input type="text" id="input-kategori" placeholder="Contoh: Operasional / Penjualan" class="w-full border border-slate-200 dark:border-slate-700 bg-transparent p-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label class="block text-slate-500 mb-1">Jumlah (Rp)</label>
                            <input type="number" id="input-jumlah" required min="0" placeholder="0" class="w-full border border-slate-200 dark:border-slate-700 bg-transparent p-2 rounded-none text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-600">
                        </div>
                        <div class="flex justify-end gap-2 pt-2">
                            <button type="button" id="btn-batal-modal" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Batal</button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

export async function initLaporanHandler() {
    const tabelBody = document.getElementById('tabel-laporan-body');
    const btnTambah = document.getElementById('btn-tambah-laporan');
    const modalLaporan = document.getElementById('modal-laporan');
    const btnBatal = document.getElementById('btn-batal-modal');
    const formTambah = document.getElementById('form-tambah-laporan');
    const inputTanggal = document.getElementById('input-tanggal');

    // Statistik Elemen
    const statPemasukan = document.getElementById('stat-pemasukan');
    const statPengeluaran = document.getElementById('stat-pengeluaran');
    const statSaldo = document.getElementById('stat-saldo');

    // Set tanggal default hari ini pada form modal
    if (inputTanggal) {
        inputTanggal.value = new Date().toISOString().substring(0, 10);
    }

    // Modal Toggle
    if (btnTambah && modalLaporan) {
        btnTambah.onclick = () => modalLaporan.classList.remove('hidden');
    }
    if (btnBatal && modalLaporan) {
        btnBatal.onclick = () => modalLaporan.classList.add('hidden');
    }

    // Fungsi untuk memuat data laporan dari Firestore
    async function muatDataLaporan() {
        if (!tabelBody) return;
        try {
            const q = query(collection(db, "laporan_keuangan"), orderBy("tanggal", "desc"));
            const querySnapshot = await getDocs(q);
            
            let html = "";
            let totalMasuk = 0;
            let totalKeluar = 0;

            if (querySnapshot.empty) {
                tabelBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada data transaksi tercatat.</td></tr>`;
                if (statPemasukan) statPemasukan.textContent = "Rp 0";
                if (statPengeluaran) statPengeluaran.textContent = "Rp 0";
                if (statSaldo) statSaldo.textContent = "Rp 0";
                return;
            }

            querySnapshot.forEach((docSnap) => {
                const item = docSnap.data();
                const id = docSnap.id;
                const jenis = item.jenis || "masuk";
                const jumlah = parseFloat(item.jumlah) || 0;
                const tanggal = item.tanggal || "-";
                const keterangan = item.keterangan || "-";
                const kategori = item.kategori || "-";

                if (jenis === "masuk") {
                    totalMasuk += jumlah;
                } else {
                    totalKeluar += jumlah;
                }

                const jumlahStr = "Rp " + jumlah.toLocaleString('id-ID');

                html += `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="p-3">${tanggal}</td>
                        <td class="p-3 font-medium">${keterangan}</td>
                        <td class="p-3"><span class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-semibold">${kategori}</span></td>
                        <td class="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">${jenis === "masuk" ? jumlahStr : "-"}</td>
                        <td class="p-3 text-right font-semibold text-red-600 dark:text-red-400">${jenis === "keluar" ? jumlahStr : "-"}</td>
                        <td class="p-3 text-center">
                            <button data-id="${id}" class="btn-hapus text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Hapus Transaksi">
                                <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </td>
                    </tr>
                `;
            });

            tabelBody.innerHTML = html;

            const saldoAkhir = totalMasuk - totalKeluar;
            if (statPemasukan) statPemasukan.textContent = "Rp " + totalMasuk.toLocaleString('id-ID');
            if (statPengeluaran) statPengeluaran.textContent = "Rp " + totalKeluar.toLocaleString('id-ID');
            if (statSaldo) {
                statSaldo.textContent = "Rp " + saldoAkhir.toLocaleString('id-ID');
                statSaldo.className = `text-lg font-bold mt-1 ${saldoAkhir >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`;
            }

            // Handler Hapus Transaksi
            document.querySelectorAll('.btn-hapus').forEach(btn => {
                btn.onclick = async () => {
                    const idTrx = btn.getAttribute('data-id');
                    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
                        try {
                            await deleteDoc(doc(db, "laporan_keuangan", idTrx));
                            muatDataLaporan();
                        } catch (err) {
                            console.error("Gagal menghapus transaksi:", err);
                            alert("Gagal menghapus data transaksi.");
                        }
                    }
                };
            });

        } catch (err) {
            console.error("Gagal memuat laporan keuangan:", err);
            tabelBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    // Submit Form Tambah Transaksi
    if (formTambah) {
        formTambah.onsubmit = async (e) => {
            e.preventDefault();
            const tanggal = document.getElementById('input-tanggal').value;
            const jenis = document.getElementById('input-jenis').value;
            const keterangan = document.getElementById('input-keterangan').value;
            const kategori = document.getElementById('input-kategori').value || "Umum";
            const jumlah = parseFloat(document.getElementById('input-jumlah').value) || 0;

            try {
                await addDoc(collection(db, "laporan_keuangan"), {
                    tanggal,
                    jenis,
                    keterangan,
                    kategori,
                    jumlah,
                    createdAt: new Date().toISOString(),
                    createdBy: auth.currentUser?.email || "system"
                });

                modalLaporan.classList.add('hidden');
                formTambah.reset();
                if (inputTanggal) inputTanggal.value = new Date().toISOString().substring(0, 10);
                muatDataLaporan();
            } catch (err) {
                console.error("Gagal menyimpan transaksi:", err);
                alert("Terjadi kesalahan saat menyimpan transaksi.");
            }
        };
    }

    muatDataLaporan();
}