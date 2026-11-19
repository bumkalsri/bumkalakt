// File: assets/js/views/data-pagu-anggaran.js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function parseDigitsToNumber(val) {
    const cleaned = String(val ?? "").replace(/\D/g, "");
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatRibuanInput(val) {
    const num = parseDigitsToNumber(val);
    if (String(val ?? "").replace(/\D/g, "") === "") return "";
    return num.toLocaleString("id-ID");
}

function formatRupiah(angka) {
    const nilai = Number(angka) || 0;
    return `Rp ${nilai.toLocaleString("id-ID")}`;
}

function formatPeriodeTahun(tahunMulai, tahunSelesai, tahunFallback) {
    const start = Number(tahunMulai) || Number(tahunFallback) || new Date().getFullYear();
    const end = Number(tahunSelesai) || start;
    if (end <= start) {
        return `${start}`;
    }
    return `${start} - ${end}`;
}

export function renderDataPaguAnggaran() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto animate-fade-in">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                    <a href="#/data" data-link title="Kembali ke Manajemen Data"
                        class="w-10 h-10 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div class="min-w-0">
                        <h1 class="text-base font-bold text-slate-800 dark:text-slate-100 truncate">Manajemen Pagu Anggaran</h1>
                        <p id="pagu-total-label" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Total: 0 Items</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button type="button" id="btn-toggle-form-pagu"
                        class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Tambah Pagu Anggaran
                    </button>
                </div>
            </div>

            <!-- Form Tambah / Edit Pagu Anggaran -->
            <div id="form-pagu-container" class="hidden bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <h2 id="form-pagu-title" class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Form Pagu Anggaran</h2>
                    <button type="button" id="btn-batal-pagu" class="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Tutup</button>
                </div>

                <form id="form-pagu-anggaran" class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs items-end">
                    <input type="hidden" id="pagu-edit-id">

                    <div>
                        <label for="pagu-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                        <select id="pagu-unit" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                            <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                            <option value="KOMPOS (03)">KOMPOS (03)</option>
                            <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                        </select>
                    </div>

                    <div>
                        <label for="pagu-tahun-mulai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TAHUN MULAI *</label>
                        <input type="number" id="pagu-tahun-mulai" min="2020" max="2099" value="2025" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>

                    <div>
                        <label for="pagu-tahun-selesai" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TAHUN SELESAI *</label>
                        <input type="number" id="pagu-tahun-selesai" min="2020" max="2099" value="2026" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>

                    <div>
                        <label for="pagu-jumlah" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">JUMLAH PAGU (RP) *</label>
                        <input type="text" inputmode="numeric" id="pagu-jumlah" placeholder="50.000.000" required
                            class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="submit" id="btn-simpan-pagu"
                            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-none transition cursor-pointer shadow-sm">
                            Simpan Pagu
                        </button>
                    </div>
                </form>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Isi Tahun Mulai dan Tahun Selesai sama jika pagu berlaku 1 tahun (misal 2026 - 2026), atau berbeda jika berlaku multi-tahun (misal 2025 - 2026 atau 2025 - 2027).</p>
            </div>

            <!-- Tabel & Card Daftar Pagu Anggaran -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50/50 dark:bg-slate-950/50">
                    <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">Daftar Alokasi Pagu Anggaran</h3>
                    <span id="pagu-total-nominal" class="text-xs font-bold text-indigo-600 dark:text-indigo-400">Total Pagu: Rp 0</span>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold">No</th>
                                <th class="py-2.5 px-4 font-semibold">Unit Usaha</th>
                                <th class="py-2.5 px-4 font-semibold">Periode Tahun</th>
                                <th class="py-2.5 px-4 font-semibold text-right">Jumlah Pagu</th>
                                <th class="py-2.5 px-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-pagu-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400">Memuat data pagu anggaran...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="card-pagu-body" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div class="p-6 text-center text-slate-400 text-xs">Memuat data pagu anggaran...</div>
                </div>
            </div>
        </div>
    `;
}

let paguCleanup = null;

export function initDataPaguAnggaranHandler() {
    if (typeof paguCleanup === "function") {
        paguCleanup();
        paguCleanup = null;
    }

    const totalLabel = document.getElementById("pagu-total-label");
    const totalNominalEl = document.getElementById("pagu-total-nominal");
    const btnToggleForm = document.getElementById("btn-toggle-form-pagu");
    const btnBatal = document.getElementById("btn-batal-pagu");
    const formContainer = document.getElementById("form-pagu-container");
    const formTitle = document.getElementById("form-pagu-title");
    const formEl = document.getElementById("form-pagu-anggaran");

    const editIdInput = document.getElementById("pagu-edit-id");
    const unitInput = document.getElementById("pagu-unit");
    const tahunMulaiInput = document.getElementById("pagu-tahun-mulai");
    const tahunSelesaiInput = document.getElementById("pagu-tahun-selesai");
    const jumlahInput = document.getElementById("pagu-jumlah");

    const tableBody = document.getElementById("table-pagu-body");
    const cardBody = document.getElementById("card-pagu-body");

    let paguList = [];
    let rowListeners = [];

    function clearRowListeners() {
        rowListeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        rowListeners = [];
    }

    function openForm(item = null) {
        if (!formContainer) return;
        formContainer.classList.remove("hidden");

        const currentYear = new Date().getFullYear();

        if (item) {
            if (formTitle) formTitle.textContent = "Edit Pagu Anggaran";
            if (editIdInput) editIdInput.value = item.id;
            if (unitInput) unitInput.value = item.unitUsaha;
            if (tahunMulaiInput) tahunMulaiInput.value = item.tahunMulai;
            if (tahunSelesaiInput) tahunSelesaiInput.value = item.tahunSelesai;
            if (jumlahInput) jumlahInput.value = formatRibuanInput(item.jumlahPagu);
        } else {
            if (formTitle) formTitle.textContent = "Tambah Pagu Anggaran";
            if (editIdInput) editIdInput.value = "";
            if (unitInput) unitInput.value = "KANTOR PUSAT (01)";
            if (tahunMulaiInput) tahunMulaiInput.value = currentYear;
            if (tahunSelesaiInput) tahunSelesaiInput.value = currentYear;
            if (jumlahInput) jumlahInput.value = "";
        }

        if (unitInput) unitInput.focus();
    }

    function closeForm() {
        const currentYear = new Date().getFullYear();
        if (formContainer) formContainer.classList.add("hidden");
        if (formEl) formEl.reset();
        if (editIdInput) editIdInput.value = "";
        if (tahunMulaiInput) tahunMulaiInput.value = currentYear;
        if (tahunSelesaiInput) tahunSelesaiInput.value = currentYear;
        if (jumlahInput) jumlahInput.value = "";
    }

    function renderPaguRows() {
        clearRowListeners();

        const count = paguList.length;
        const totalPagu = paguList.reduce((acc, item) => acc + (Number(item.jumlahPagu) || 0), 0);

        if (totalLabel) {
            totalLabel.textContent = `Total: ${count} ${count === 1 ? "Item" : "Items"}`;
        }
        if (totalNominalEl) {
            totalNominalEl.textContent = `Total Pagu: ${formatRupiah(totalPagu)}`;
        }

        if (count === 0) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada data pagu anggaran.</td></tr>`;
            }
            if (cardBody) {
                cardBody.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">Belum ada data pagu anggaran.</div>`;
            }
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        paguList.forEach((item, index) => {
            const periodeLabel = formatPeriodeTahun(item.tahunMulai, item.tahunSelesai, item.tahun);

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 text-slate-500">${index + 1}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">${item.unitUsaha}</td>
                    <td class="py-3 px-4">${periodeLabel}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">${formatRupiah(item.jumlahPagu)}</td>
                    <td class="py-3 px-4 text-center space-x-2">
                        <button type="button" data-edit-id="${item.id}" class="btn-edit-pagu text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer">Edit</button>
                        <button type="button" data-delete-id="${item.id}" class="btn-hapus-pagu text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer">Hapus</button>
                    </td>
                </tr>
            `;

            htmlCard += `
                <div class="p-4 space-y-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800 dark:text-slate-100">${item.unitUsaha}</span>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">${periodeLabel}</span>
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400">${formatRupiah(item.jumlahPagu)}</span>
                        <div class="space-x-3">
                            <button type="button" data-edit-id="${item.id}" class="btn-edit-pagu text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">Edit</button>
                            <button type="button" data-delete-id="${item.id}" class="btn-hapus-pagu text-rose-600 dark:text-rose-400 font-semibold cursor-pointer">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
        });

        if (tableBody) tableBody.innerHTML = htmlTable;
        if (cardBody) cardBody.innerHTML = htmlCard;

        document.querySelectorAll(".btn-edit-pagu").forEach((btn) => {
            const onEdit = () => {
                const id = btn.getAttribute("data-edit-id");
                const target = paguList.find((row) => row.id === id);
                if (target) openForm(target);
            };
            btn.addEventListener("click", onEdit);
            rowListeners.push({ el: btn, type: "click", fn: onEdit });
        });

        document.querySelectorAll(".btn-hapus-pagu").forEach((btn) => {
            const onDelete = async () => {
                const id = btn.getAttribute("data-delete-id");
                if (!id) return;
                if (!confirm("Hapus data pagu anggaran ini?")) return;
                try {
                    await deleteDoc(doc(db, "pagu_anggaran", id));
                    await loadPaguData();
                } catch (err) {
                    console.error("Gagal menghapus pagu anggaran:", err);
                    alert("Gagal menghapus data pagu anggaran.");
                }
            };
            btn.addEventListener("click", onDelete);
            rowListeners.push({ el: btn, type: "click", fn: onDelete });
        });
    }

    async function loadPaguData() {
        try {
            const q = query(collection(db, "pagu_anggaran"), orderBy("tahun", "desc"));
            const snap = await getDocs(q);
            const loaded = [];
            snap.forEach((docSnap) => {
                const d = docSnap.data();
                const fallbackYear = Number(d.tahun) || new Date().getFullYear();
                const tahunMulai = Number(d.tahunMulai) || fallbackYear;
                const tahunSelesai = Number(d.tahunSelesai) || tahunMulai;

                loaded.push({
                    id: docSnap.id,
                    unitUsaha: d.unitUsaha || "-",
                    tahun: tahunMulai,
                    tahunMulai,
                    tahunSelesai,
                    jumlahPagu: Number(d.jumlahPagu) || 0
                });
            });
            paguList = loaded;
        } catch (err) {
            console.error("Gagal memuat pagu_anggaran dari Firestore:", err);
            paguList = [];
        }
        renderPaguRows();
    }

    const onJumlahInput = () => {
        if (!jumlahInput) return;
        jumlahInput.value = formatRibuanInput(jumlahInput.value);
    };

    const onToggleClick = () => {
        if (!formContainer) return;
        if (formContainer.classList.contains("hidden")) {
            openForm(null);
        } else {
            closeForm();
        }
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        const editId = editIdInput ? editIdInput.value.trim() : "";
        const unitUsaha = unitInput ? unitInput.value.trim() : "";
        const tahunMulai = parseInt(tahunMulaiInput?.value || new Date().getFullYear(), 10);
        const tahunSelesai = parseInt(tahunSelesaiInput?.value || tahunMulai, 10);
        const jumlahPagu = parseDigitsToNumber(jumlahInput?.value || 0);

        if (!unitUsaha || isNaN(tahunMulai) || isNaN(tahunSelesai) || jumlahPagu < 0) {
            alert("Mohon lengkapi data pagu anggaran dengan benar.");
            return;
        }

        if (tahunSelesai < tahunMulai) {
            alert("Tahun selesai tidak boleh lebih kecil dari tahun mulai.");
            return;
        }

        const payload = {
            unitUsaha,
            tahun: tahunMulai,
            tahunMulai,
            tahunSelesai,
            jumlahPagu,
            updatedAt: new Date().toISOString()
        };

        try {
            if (editId) {
                await updateDoc(doc(db, "pagu_anggaran", editId), payload);
            } else {
                await addDoc(collection(db, "pagu_anggaran"), {
                    ...payload,
                    createdAt: new Date().toISOString()
                });
            }
            closeForm();
            await loadPaguData();
        } catch (err) {
            console.error("Gagal menyimpan pagu anggaran:", err);
            alert("Gagal menyimpan data pagu anggaran ke database.");
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && e.target && e.target.matches("#pagu-tahun-mulai, #pagu-tahun-selesai, #pagu-jumlah")) {
            e.preventDefault();
            if (formEl && typeof formEl.requestSubmit === "function") {
                formEl.requestSubmit();
            }
        }
    };

    if (jumlahInput) jumlahInput.addEventListener("input", onJumlahInput);
    if (btnToggleForm) btnToggleForm.addEventListener("click", onToggleClick);
    if (btnBatal) btnBatal.addEventListener("click", closeForm);
    if (formEl) {
        formEl.addEventListener("submit", onFormSubmit);
        formEl.addEventListener("keydown", onKeyDown);
    }

    const cleanup = () => {
        clearRowListeners();
        if (jumlahInput) jumlahInput.removeEventListener("input", onJumlahInput);
        if (btnToggleForm) btnToggleForm.removeEventListener("click", onToggleClick);
        if (btnBatal) btnBatal.removeEventListener("click", closeForm);
        if (formEl) {
            formEl.removeEventListener("submit", onFormSubmit);
            formEl.removeEventListener("keydown", onKeyDown);
        }
        window.removeEventListener("hashchange", cleanup);
        paguCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    paguCleanup = cleanup;

    loadPaguData();

    return cleanup;
}