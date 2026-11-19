// File: assets/js/views/keuangan-kas-masuk.js
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderKasMasuk() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/keuangan" data-link title="Kembali ke Keuangan" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pencatatan Kas Masuk (Cash In)</h1>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan transaksi penerimaan kas operasional, pendapatan usaha, atau piutang BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Form Input Kas Masuk -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Transaksi Kas Masuk</h2>
                <form id="form-kas-masuk" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="km-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="km-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN KAS / BANK PENERIMA (DEBET) *</label>
                        <select id="km-akun-kas" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Kas --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN SUMBER PENDAPATAN (KREDIT) *</label>
                        <select id="km-akun-sumber" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Pendapatan --</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH NOMINAL (RP) *</label>
                        <input type="number" id="km-jumlah" min="1" step="any" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DITERIMA DARI / SUMBER DANA *</label>
                        <input type="text" id="km-pemberi" placeholder="Contoh: Pembeli / Pelanggan Umum" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3">
                        <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN TRANSAKSI *</label>
                        <input type="text" id="km-keterangan" placeholder="Contoh: Penerimaan penjualan tiket agrowisata harian" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex justify-end gap-2 pt-2">
                        <button type="submit" id="btn-simpan-km" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Transaksi Kas Masuk</button>
                    </div>
                </form>
            </div>

            <!-- Tabel Riwayat Kas Masuk -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-xs text-slate-800 dark:text-slate-200 flex justify-between items-center">
                    <span>RIWAYAT TRANSAKSI KAS MASUK</span>
                    <span id="total-km-count" class="text-slate-500 font-normal">Total: 0 Data</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th class="py-3 px-4 font-semibold w-28">Tanggal</th>
                                <th class="py-3 px-4 font-semibold w-36">Unit Usaha</th>
                                <th class="py-3 px-4 font-semibold w-40">Sumber / Pemberi</th>
                                <th class="py-3 px-4 font-semibold">Uraian & Akun</th>
                                <th class="py-3 px-4 font-semibold text-right w-40">Jumlah (Rp)</th>
                                <th class="py-3 px-4 font-semibold text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-km-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr><td colspan="6" class="py-8 text-center text-slate-400">Memuat data riwayat kas masuk...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Toast Notifikasi -->
            <div id="toast-kas-masuk" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-kas-masuk-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-kas-masuk-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let kasMasukToastTimer = null;

export function initKasMasukHandler() {
    const formKasMasuk = document.getElementById('form-kas-masuk');
    const kmTgl = document.getElementById('km-tgl');
    const kmUnit = document.getElementById('km-unit');
    const kmAkunKas = document.getElementById('km-akun-kas');
    const kmAkunSumber = document.getElementById('km-akun-sumber');
    const kmJumlah = document.getElementById('km-jumlah');
    const kmPemberi = document.getElementById('km-pemberi');
    const kmKeterangan = document.getElementById('km-keterangan');
    const btnSimpanKm = document.getElementById('btn-simpan-km');
    const tableBody = document.getElementById('table-km-body');
    const totalCountEl = document.getElementById('total-km-count');

    if (kmTgl && !kmTgl.value) {
        kmTgl.value = new Date().toISOString().split('T')[0];
    }

    let kasMasukList = [];

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-kas-masuk');
        const msgEl = document.getElementById('toast-kas-masuk-message');
        const iconEl = document.getElementById('toast-kas-masuk-icon');
        if (!toast || !msgEl) return;

        if (kasMasukToastTimer) clearTimeout(kasMasukToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        kasMasukToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    async function loadCoaAndData() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);

            if (kmAkunKas) kmAkunKas.innerHTML = '<option value="">-- Pilih Akun Kas / Bank --</option>';
            if (kmAkunSumber) kmAkunSumber.innerHTML = '<option value="">-- Pilih Akun Sumber / Pendapatan --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const kode = data.kodeAkun || "";
                const nama = data.namaAkun || "";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();
                const group = (data.reportGroup || "").toLowerCase();

                if ((level === "4" || tipe === "detail") && data.statusAkun !== "Nonaktif") {
                    if (kode.startsWith("1.01") || group.includes("kas") || group.includes("bank")) {
                        if (kmAkunKas) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${nama}`;
                            kmAkunKas.appendChild(opt);
                        }
                    }
                    if (kmAkunSumber) {
                        const opt = document.createElement('option');
                        opt.value = kode;
                        opt.textContent = `${kode} - ${nama}`;
                        kmAkunSumber.appendChild(opt);
                    }
                }
            });

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            kasMasukList = [];
            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data();
                const ket = (jData.keterangan || "").toLowerCase();
                const ref = (jData.noRef || "").toUpperCase();
                if (ref.startsWith("KM-") || ket.includes("[kas masuk]")) {
                    kasMasukList.push({ id: docSnap.id, ...jData });
                }
            });

            renderTable();
        } catch (err) {
            console.error("Gagal memuat data kas masuk:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        if (!tableBody) return;
        if (totalCountEl) totalCountEl.textContent = `Total: ${kasMasukList.length} Data`;

        if (kasMasukList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi kas masuk.</td></tr>`;
            return;
        }

        let html = "";
        kasMasukList.forEach(item => {
            let nominal = Number(item.totalNilai || 0);
            let akunDebet = "-";
            let akunKredit = "-";

            if (item.rincian && Array.isArray(item.rincian) && item.rincian.length >= 2) {
                if (!nominal) {
                    nominal = Number(item.rincian[0].debet || 0);
                }
                akunDebet = `${item.rincian[0].kodeAkun} - ${item.rincian[0].namaAkun}`;
                akunKredit = `${item.rincian[1].kodeAkun} - ${item.rincian[1].namaAkun}`;
            }

            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tglTransaksi || '-'}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unitUsaha || '-'}</td>
                    <td class="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">${item.pemberiDana || '-'}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-medium text-slate-800 dark:text-slate-200">${item.keterangan || '-'}</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">Debet: ${akunDebet} | Kredit: ${akunKredit}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">Rp ${nominal.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <button type="button" data-delete-km="${item.id}" class="btn-hapus-km text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Transaksi">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

        document.querySelectorAll('.btn-hapus-km').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-delete-km');
                if (!id) return;
                if (confirm("Apakah Anda yakin ingin menghapus transaksi kas masuk ini?")) {
                    try {
                        await deleteDoc(doc(db, "jurnal_umum", id));
                        showToast("Transaksi kas masuk berhasil dihapus.");
                        await loadCoaAndData();
                    } catch (err) {
                        console.error("Gagal menghapus kas masuk:", err);
                        showToast("Gagal menghapus data.", true);
                    }
                }
            };
        });
    }

    if (formKasMasuk) {
        formKasMasuk.onsubmit = async (e) => {
            e.preventDefault();
            const tgl = kmTgl ? kmTgl.value : "";
            const unit = kmUnit ? kmUnit.value : "";
            const akunKasVal = kmAkunKas ? kmAkunKas.value : "";
            const akunSumberVal = kmAkunSumber ? kmAkunSumber.value : "";
            const jumlah = parseFloat(kmJumlah ? kmJumlah.value : 0) || 0;
            const pemberi = kmPemberi ? kmPemberi.value.trim() : "";
            const ket = kmKeterangan ? kmKeterangan.value.trim() : "";

            if (!akunKasVal || !akunSumberVal) {
                showToast("Pilih akun kas penerima dan akun sumber pendapatan terlebih dahulu.", true);
                return;
            }
            if (jumlah <= 0) {
                showToast("Jumlah nominal harus lebih besar dari 0.", true);
                return;
            }

            const kasOpt = kmAkunKas.options[kmAkunKas.selectedIndex];
            const namaKas = kasOpt ? kasOpt.textContent.split(' - ').slice(1).join(' - ') || "Kas / Bank" : "Kas / Bank";

            const sumberOpt = kmAkunSumber.options[kmAkunSumber.selectedIndex];
            const namaSumber = sumberOpt ? sumberOpt.textContent.split(' - ').slice(1).join(' - ') || "Pendapatan" : "Pendapatan";

            const rincianJurnal = [
                { kodeAkun: akunKasVal, namaAkun: namaKas, debet: jumlah, kredit: 0 },
                { kodeAkun: akunSumberVal, namaAkun: namaSumber, debet: 0, kredit: jumlah }
            ];

            const payloadJurnal = {
                noRef: `KM-${Date.now().toString().slice(-6)}`,
                tglTransaksi: tgl,
                unitUsaha: unit,
                pemberiDana: pemberi,
                keterangan: `[Kas Masuk] ${ket}`,
                rincian: rincianJurnal,
                totalNilai: jumlah,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (btnSimpanKm) {
                btnSimpanKm.disabled = true;
                btnSimpanKm.textContent = "Menyimpan...";
            }

            try {
                await addDoc(collection(db, "jurnal_umum"), payloadJurnal);
                showToast("Transaksi kas masuk berhasil disimpan ke sistem akuntansi.");
                formKasMasuk.reset();
                if (kmTgl) kmTgl.value = new Date().toISOString().split('T')[0];
                await loadCoaAndData();
            } catch (err) {
                console.error("Gagal menyimpan kas masuk:", err);
                showToast("Terjadi kesalahan saat menyimpan data.", true);
            } finally {
                if (btnSimpanKm) {
                    btnSimpanKm.disabled = false;
                    btnSimpanKm.textContent = "Simpan Transaksi Kas Masuk";
                }
            }
        };
    }

    loadCoaAndData();
}