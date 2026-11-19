// File: assets/js/views/akuntansi-modal.js
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

const TRANSACTION_TYPE = "Modal";

function parseDigitsToNumber(val) {
    const cleaned = String(val ?? "").replace(/\D/g, "");
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatRibuanInput(val) {
    const raw = String(val ?? "").replace(/\D/g, "");
    if (!raw) return "";
    const num = Number(raw);
    return Number.isFinite(num) ? num.toLocaleString("id-ID") : "";
}

function isModalJournalRecord(jData) {
    const typeVal = String(jData.type || jData.jenisTransaksi || "").trim().toLowerCase();
    if (typeVal === "modal" || typeVal === "ekuitas" || typeVal === "prive") {
        return true;
    }
    const ket = String(jData.keterangan || "").toLowerCase();
    const ref = String(jData.noRef || "").toUpperCase();
    return ref.startsWith("MOD-") || ket.includes("modal") || ket.includes("prive");
}

export function renderModal() {
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
                        <div class="flex items-center gap-2">
                            <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengelolaan Modal & Ekuitas (Modal / Prive)</h1>
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Type: ${TRANSACTION_TYPE}</span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan setoran modal awal, penambahan modal, atau prive penarikan pemilik/pengelola BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Form Input Transaksi Modal -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Form Transaksi Modal & Prive</h2>
                <form id="form-modal" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <label for="modal-tgl" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                        <input type="date" id="modal-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label for="modal-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="modal-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Pilih Unit Usaha --</option>
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>
                    <div>
                        <label for="modal-jenis" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JENIS TRANSAKSI MODAL *</label>
                        <select id="modal-jenis" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="Setoran Modal">Setoran / Penambahan Modal</option>
                            <option value="Prive / Penarikan">Prive / Penarikan Dana Pihak Pengelola</option>
                        </select>
                    </div>
                    <div>
                        <label for="modal-akun-kode" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN MODAL / EKUITAS (COA) *</label>
                        <select id="modal-akun-kode" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Modal --</option>
                        </select>
                    </div>
                    <div>
                        <label for="modal-akun-lawan-kode" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN LAWAN (COA) *</label>
                        <select id="modal-akun-lawan-kode" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">-- Memuat Akun Lawan --</option>
                        </select>
                    </div>
                    <div>
                        <label for="modal-jumlah" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH NOMINAL (RP) *</label>
                        <input type="text" inputmode="numeric" id="modal-jumlah" placeholder="0" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3">
                        <label for="modal-keterangan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN *</label>
                        <input type="text" id="modal-keterangan" placeholder="Contoh: Setoran modal awal untuk pengembangan unit usaha" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>
                    <div class="md:col-span-3 flex justify-end gap-2 pt-2">
                        <button type="button" id="btn-batal-modal" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer">Batal</button>
                        <button type="submit" id="btn-simpan-modal" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Transaksi Modal</button>
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

            <!-- Toast Notifikasi -->
            <div id="toast-modal" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 ease-in-out pointer-events-none">
                <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-none shadow-xl border border-slate-700 dark:border-slate-200 flex items-center gap-3 text-xs font-semibold">
                    <svg id="toast-modal-icon" class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span id="toast-modal-message">Pesan notifikasi</span>
                </div>
            </div>
        </div>
    `;
}

let modalToastTimer = null;
let modalViewCleanup = null;

export function initModalHandler() {
    if (typeof modalViewCleanup === "function") {
        modalViewCleanup();
        modalViewCleanup = null;
    }

    const formModal = document.getElementById('form-modal');
    const modalTgl = document.getElementById('modal-tgl');
    const modalUnit = document.getElementById('modal-unit');
    const modalJenis = document.getElementById('modal-jenis');
    const modalAkunKode = document.getElementById('modal-akun-kode');
    const modalAkunLawanKode = document.getElementById('modal-akun-lawan-kode');
    const modalJumlah = document.getElementById('modal-jumlah');
    const modalKeterangan = document.getElementById('modal-keterangan');
    const btnBatalModal = document.getElementById('btn-batal-modal');
    const btnSimpanModal = document.getElementById('btn-simpan-modal');
    const tableBody = document.getElementById('table-modal-body');
    const totalCountEl = document.getElementById('total-modal-count');

    function resetFormFields(focusTgl = false) {
        if (formModal) formModal.reset();
        if (modalTgl) modalTgl.value = new Date().toISOString().split('T')[0];
        if (modalUnit) modalUnit.value = "";
        if (modalJenis) modalJenis.value = "Setoran Modal";
        if (modalAkunKode) modalAkunKode.value = "";
        if (modalAkunLawanKode) modalAkunLawanKode.value = "";
        if (modalJumlah) modalJumlah.value = "";
        if (modalKeterangan) modalKeterangan.value = "";
        if (focusTgl && modalTgl) modalTgl.focus();
    }

    if (modalTgl && !modalTgl.value) {
        modalTgl.value = new Date().toISOString().split('T')[0];
    }

    let modalList = [];
    let rowListeners = [];

    function clearRowListeners() {
        rowListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        rowListeners = [];
    }

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast-modal');
        const msgEl = document.getElementById('toast-modal-message');
        const iconEl = document.getElementById('toast-modal-icon');
        if (!toast || !msgEl) return;

        if (modalToastTimer) clearTimeout(modalToastTimer);

        msgEl.textContent = message;
        if (iconEl) {
            iconEl.setAttribute('class', isError ? 'w-4 h-4 text-rose-500 flex-shrink-0' : 'w-4 h-4 text-emerald-400 flex-shrink-0');
            iconEl.innerHTML = isError
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
        }

        toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        modalToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 3000);
    }

    async function loadCoaAndModal() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);

            if (modalAkunKode) modalAkunKode.innerHTML = '<option value="">-- Pilih Akun Modal (COA) --</option>';
            if (modalAkunLawanKode) modalAkunLawanKode.innerHTML = '<option value="">-- Pilih Akun Lawan (COA) --</option>';

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const reportGroup = (data.reportGroup || "").toLowerCase();
                const kategori = (data.kategori || "").toLowerCase();
                const kode = String(data.kodeAkun || "").trim();
                const namaAkun = data.namaAkun || "Akun";
                const level = String(data.levelAkun || "");
                const tipe = (data.tipeAkun || "").toLowerCase();
                const isActive = data.statusAkun !== "Nonaktif";
                const isDetail = level === "4" || tipe === "detail";

                if (isActive && isDetail && kode) {
                    const isModalAccount =
                        reportGroup.includes("modal") ||
                        reportGroup.includes("ekuitas") ||
                        kategori.includes("modal") ||
                        kategori.includes("ekuitas") ||
                        kode.startsWith("3");

                    if (isModalAccount && modalAkunKode) {
                        const opt = document.createElement('option');
                        opt.value = kode;
                        opt.textContent = `${kode} - ${namaAkun}`;
                        modalAkunKode.appendChild(opt);
                    }

                    if (!isModalAccount && modalAkunLawanKode) {
                        const optLawan = document.createElement('option');
                        optLawan.value = kode;
                        optLawan.textContent = `${kode} - ${namaAkun}`;
                        modalAkunLawanKode.appendChild(optLawan);
                    }
                }
            });

            const qJurnal = query(collection(db, "jurnal_umum"), orderBy("tglTransaksi", "desc"));
            const snapJurnal = await getDocs(qJurnal);
            modalList = [];
            snapJurnal.forEach(docSnap => {
                const jData = docSnap.data();
                if (isModalJournalRecord(jData)) {
                    modalList.push({ id: docSnap.id, ...jData });
                }
            });

            renderTable();
        } catch (err) {
            console.error("Gagal memuat data modal:", err);
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-rose-500">Gagal memuat data dari database.</td></tr>`;
        }
    }

    function renderTable() {
        clearRowListeners();
        if (!tableBody) return;
        if (totalCountEl) totalCountEl.textContent = `Total: ${modalList.length} Data`;

        if (modalList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">Belum ada data transaksi modal atau prive.</td></tr>`;
            return;
        }

        let html = "";
        modalList.forEach(item => {
            let nominal = Number(item.totalNilai || 0);
            let akunModalText = "-";
            let akunLawanText = "";

            if (item.rincian && Array.isArray(item.rincian) && item.rincian.length > 0) {
                const barisModal = item.rincian.find(r => String(r.kodeAkun || "").startsWith("3")) || item.rincian[0];
                const barisLawan = item.rincian.find(r => r !== barisModal) || null;

                if (!nominal) {
                    nominal = Number(barisModal.kredit || barisModal.debet || 0);
                }
                akunModalText = `${barisModal.kodeAkun} - ${barisModal.namaAkun}`;
                if (barisLawan) {
                    akunLawanText = `${barisLawan.kodeAkun} - ${barisLawan.namaAkun}`;
                }
            }

            const ketText = item.keterangan || "";
            const isPrive = ketText.toLowerCase().includes("prive");

            html += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${item.tglTransaksi || '-'}</td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">${item.unitUsaha || '-'}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 text-[11px] font-bold ${isPrive ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}">
                            ${isPrive ? 'Prive / Penarikan' : 'Setoran Modal'}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <div class="font-bold text-indigo-600 dark:text-indigo-400">${akunModalText}</div>
                        ${akunLawanText ? `<div class="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Lawan: ${akunLawanText}</div>` : ""}
                        <div class="text-slate-500 text-[11px] mt-0.5">${ketText || '-'}</div>
                    </td>
                    <td class="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">Rp ${nominal.toLocaleString('id-ID')}</td>
                    <td class="py-3 px-4 text-center">
                        <button type="button" data-delete-modal="${item.id}" class="btn-hapus-modal text-rose-600 hover:text-rose-800 p-1 cursor-pointer" title="Hapus Transaksi">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;

        document.querySelectorAll('.btn-hapus-modal').forEach(btn => {
            const onDelete = async () => {
                const id = btn.getAttribute('data-delete-modal');
                if (!id) return;
                if (confirm("Apakah Anda yakin ingin menghapus transaksi modal ini?")) {
                    try {
                        await deleteDoc(doc(db, "jurnal_umum", id));
                        showToast("Transaksi modal berhasil dihapus.");
                        await loadCoaAndModal();
                    } catch (err) {
                        console.error("Gagal menghapus transaksi modal:", err);
                        showToast("Gagal menghapus data.", true);
                    }
                }
            };
            btn.addEventListener('click', onDelete);
            rowListeners.push({ el: btn, type: 'click', fn: onDelete });
        });
    }

    const onJumlahInput = () => {
        if (!modalJumlah) return;
        modalJumlah.value = formatRibuanInput(modalJumlah.value);
    };

    const onBatalClick = () => {
        resetFormFields(true);
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        const tgl = modalTgl ? modalTgl.value : "";
        const unit = modalUnit ? modalUnit.value : "";
        const jenis = modalJenis ? modalJenis.value : "Setoran Modal";
        const akunKode = modalAkunKode ? modalAkunKode.value : "";
        const akunLawanKode = modalAkunLawanKode ? modalAkunLawanKode.value : "";
        const jumlah = parseDigitsToNumber(modalJumlah ? modalJumlah.value : 0);
        const ket = modalKeterangan ? modalKeterangan.value.trim() : "";

        if (!akunKode) {
            showToast("Pilih akun modal / ekuitas terlebih dahulu.", true);
            return;
        }
        if (!akunLawanKode) {
            showToast("Pilih akun lawan (COA) terlebih dahulu.", true);
            return;
        }
        if (akunKode === akunLawanKode) {
            showToast("Akun modal / ekuitas dan akun lawan tidak boleh sama.", true);
            return;
        }
        if (jumlah <= 0) {
            showToast("Jumlah nominal harus lebih besar dari 0.", true);
            return;
        }

        const selectedCoaOpt = modalAkunKode.options[modalAkunKode.selectedIndex];
        const namaAkun = selectedCoaOpt ? selectedCoaOpt.textContent.split(' - ').slice(1).join(' - ') || "Modal / Ekuitas" : "Modal / Ekuitas";

        const selectedLawanOpt = modalAkunLawanKode.options[modalAkunLawanKode.selectedIndex];
        const namaAkunLawan = selectedLawanOpt ? selectedLawanOpt.textContent.split(' - ').slice(1).join(' - ') || "Akun Lawan" : "Akun Lawan";

        let rincianJurnal = [];
        if (jenis === "Setoran Modal") {
            rincianJurnal = [
                { kodeAkun: akunLawanKode, namaAkun: namaAkunLawan, debet: jumlah, kredit: 0 },
                { kodeAkun: akunKode, namaAkun, debet: 0, kredit: jumlah }
            ];
        } else {
            rincianJurnal = [
                { kodeAkun: akunKode, namaAkun, debet: jumlah, kredit: 0 },
                { kodeAkun: akunLawanKode, namaAkun: namaAkunLawan, debet: 0, kredit: jumlah }
            ];
        }

        const payloadJurnal = {
            type: TRANSACTION_TYPE,
            jenisTransaksi: jenis,
            noRef: `MOD-${Date.now().toString().slice(-6)}`,
            tglTransaksi: tgl,
            unitUsaha: unit,
            keterangan: `[${jenis}] ${ket}`,
            rincian: rincianJurnal,
            totalNilai: jumlah,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (btnSimpanModal) {
            btnSimpanModal.disabled = true;
            btnSimpanModal.textContent = "Menyimpan...";
        }

        try {
            await addDoc(collection(db, "jurnal_umum"), payloadJurnal);
            showToast("Transaksi modal berhasil disimpan ke sistem akuntansi.");
            resetFormFields(false);
            await loadCoaAndModal();
        } catch (err) {
            console.error("Gagal menyimpan transaksi modal:", err);
            showToast("Terjadi kesalahan saat menyimpan data.", true);
        } finally {
            if (btnSimpanModal) {
                btnSimpanModal.disabled = false;
                btnSimpanModal.textContent = "Simpan Transaksi Modal";
            }
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && e.target && e.target.matches("#modal-jumlah, #modal-keterangan")) {
            e.preventDefault();
            if (formModal && typeof formModal.requestSubmit === "function") {
                formModal.requestSubmit();
            }
        }
    };

    if (modalJumlah) modalJumlah.addEventListener("input", onJumlahInput);
    if (btnBatalModal) btnBatalModal.addEventListener("click", onBatalClick);
    if (formModal) {
        formModal.addEventListener("submit", onFormSubmit);
        formModal.addEventListener("keydown", onKeyDown);
    }

    const cleanup = () => {
        clearRowListeners();
        if (modalToastTimer) {
            clearTimeout(modalToastTimer);
            modalToastTimer = null;
        }
        if (modalJumlah) modalJumlah.removeEventListener("input", onJumlahInput);
        if (btnBatalModal) btnBatalModal.removeEventListener("click", onBatalClick);
        if (formModal) {
            formModal.removeEventListener("submit", onFormSubmit);
            formModal.removeEventListener("keydown", onKeyDown);
        }
        window.removeEventListener("hashchange", cleanup);
        modalViewCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    modalViewCleanup = cleanup;

    loadCoaAndModal();

    return cleanup;
}