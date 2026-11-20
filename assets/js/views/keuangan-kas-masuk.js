// File: assets/js/views/keuangan-kas-masuk.js
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function escapeHtml(val) {
    return String(val ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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

function formatRupiah(num) {
    return "Rp " + Math.max(0, Math.round(Number(num) || 0)).toLocaleString("id-ID");
}

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
                        <div class="flex items-center gap-2 flex-wrap">
                            <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pencatatan Kas Masuk (Cash In)</h1>
                            <span id="badge-bulan-aktif-km" class="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Memuat Periode...</span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pencatatan transaksi penerimaan kas operasional, pendapatan usaha, atau piutang BUMKal (mendukung multi akun sumber).</p>
                    </div>
                </div>
            </div>

            <!-- Form Input Kas Masuk -->
            <div class="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none">
                <div class="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Form Transaksi Kas Masuk</h2>
                    <span id="km-periode-info" class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400"></span>
                </div>
                <form id="form-kas-masuk" class="space-y-4 text-xs">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label for="km-tgl" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">TANGGAL TRANSAKSI *</label>
                            <input type="date" id="km-tgl" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600 transition">
                            <p id="km-tgl-warning" class="hidden text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-1"></p>
                        </div>
                        <div>
                            <label for="km-unit" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">UNIT USAHA *</label>
                            <select id="km-unit" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                                <option value="">-- Pilih Unit Usaha --</option>
                                <option value="KANTOR PUSAT (01)">KANTOR PUSAT (01)</option>
                                <option value="AGROWISATA (02)">AGROWISATA (02)</option>
                                <option value="KOMPOS (03)">KOMPOS (03)</option>
                                <option value="GREENHOUSE (04)">GREENHOUSE (04)</option>
                            </select>
                        </div>
                        <div>
                            <label for="km-akun-kas" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">AKUN KAS / BANK PENERIMA (DEBET) *</label>
                            <select id="km-akun-kas" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                                <option value="">-- Memuat Akun Kas --</option>
                            </select>
                        </div>
                        <div>
                            <label for="km-pemberi" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">DITERIMA DARI / SUMBER DANA *</label>
                            <input type="text" id="km-pemberi" placeholder="Contoh: Pembeli / Pelanggan Umum" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                    </div>

                    <!-- Rincian Multi Akun Sumber / Pendapatan (Kredit) -->
                    <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden">
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                            <span class="font-bold text-slate-800 dark:text-slate-200">RINCIAN AKUN SUMBER / PENDAPATAN (KREDIT - MULTI AKUN) *</span>
                            <button type="button" id="btn-tambah-akun-km" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-none transition cursor-pointer">
                                + Tambah Akun
                            </button>
                        </div>
                        <div id="km-multi-akun-container" class="p-3 space-y-2.5 bg-white dark:bg-slate-900"></div>
                        <div class="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold">
                            <span class="text-slate-600 dark:text-slate-300">TOTAL KAS MASUK (DEBET = KREDIT):</span>
                            <span id="km-total-display" class="text-emerald-600 dark:text-emerald-400 text-sm">Rp 0</span>
                        </div>
                    </div>

                    <div>
                        <label for="km-keterangan" class="block font-bold text-slate-700 dark:text-slate-300 mb-1">KETERANGAN / URAIAN TRANSAKSI *</label>
                        <input type="text" id="km-keterangan" placeholder="Contoh: Penerimaan penjualan tiket agrowisata harian" required class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button type="button" id="btn-reset-km" class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-2.5 rounded-none border border-slate-300 dark:border-slate-700 transition cursor-pointer">Reset Form</button>
                        <button type="submit" id="btn-simpan-km" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-none transition cursor-pointer shadow-sm">Simpan Transaksi Kas Masuk</button>
                    </div>
                </form>
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
let kasMasukCleanup = null;

export function initKasMasukHandler() {
    if (typeof kasMasukCleanup === "function") {
        kasMasukCleanup();
        kasMasukCleanup = null;
    }

    const formKasMasuk = document.getElementById('form-kas-masuk');
    const kmTgl = document.getElementById('km-tgl');
    const kmUnit = document.getElementById('km-unit');
    const kmAkunKas = document.getElementById('km-akun-kas');
    const kmPemberi = document.getElementById('km-pemberi');
    const kmKeterangan = document.getElementById('km-keterangan');
    const btnTambahAkun = document.getElementById('btn-tambah-akun-km');
    const btnResetKm = document.getElementById('btn-reset-km');
    const multiAkunContainer = document.getElementById('km-multi-akun-container');
    const totalDisplayEl = document.getElementById('km-total-display');
    const btnSimpanKm = document.getElementById('btn-simpan-km');

    const badgeBulanAktif = document.getElementById('badge-bulan-aktif-km');
    const periodeInfoEl = document.getElementById('km-periode-info');
    const tglWarningEl = document.getElementById('km-tgl-warning');

    let sumberAccountOptions = [];
    let tutupBulanMap = new Map();
    let activePeriodKey = "";

    if (kmTgl && !kmTgl.value) {
        kmTgl.value = new Date().toISOString().split('T')[0];
    }

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

    function normalizePeriodKey(rawVal) {
        const s = String(rawVal || "").trim().toLowerCase();
        const isoMatch = s.match(/(\d{4})[-/](\d{1,2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}`;
        }

        const bulanMap = {
            januari: "01", jan: "01",
            februari: "02", feb: "02",
            maret: "03", mar: "03",
            april: "04", apr: "04",
            mei: "05",
            juni: "06", jun: "06",
            juli: "07", jul: "07",
            agustus: "08", agu: "08", ags: "08",
            september: "09", sep: "09", sept: "09",
            oktober: "10", okt: "10",
            november: "11", nov: "11",
            desember: "12", des: "12"
        };

        const yearMatch = s.match(/\b(20\d{2})\b/);
        for (const [namaBulan, mm] of Object.entries(bulanMap)) {
            if (new RegExp(`\\b${namaBulan}\\b`).test(s) && yearMatch) {
                return `${yearMatch[1]}-${mm}`;
            }
        }
        return "";
    }

    function extractDocPeriodKey(data = {}, docId = "") {
        const direct = normalizePeriodKey(
            data.periodKey ??
            data.periode ??
            data.bulanKey ??
            data.bulan_key ??
            data.bulanAktif ??
            data.bulan_aktif ??
            data.activePeriod ??
            data.active_period ??
            ""
        );
        if (direct) return direct;

        const yearVal = String(data.tahun ?? data.year ?? "").trim();
        const monthVal = String(data.bulan ?? data.month ?? data.namaBulan ?? "").trim();
        if (yearVal && monthVal) {
            const combined = normalizePeriodKey(`${yearVal}-${monthVal}`) || normalizePeriodKey(`${monthVal} ${yearVal}`);
            if (combined) return combined;
        }

        return normalizePeriodKey(docId);
    }

    function isDocClosed(data = {}) {
        if (data.isClosed === true || data.closed === true || data.terkunci === true || data.locked === true || Boolean(data.closedAt)) {
            return true;
        }
        if (data.aktif === false || data.isAktif === false || data.is_aktif === false || data.isActive === false || data.active === false) {
            return true;
        }
        const statusCandidate = String(
            data.status ?? data.statusPeriode ?? data.status_periode ?? data.statusBulan ?? data.status_bulan ?? data.state ?? ""
        )
            .trim()
            .toLowerCase();

        return (
            statusCandidate.includes("tutup") ||
            statusCandidate.includes("close") ||
            statusCandidate.includes("kunci") ||
            statusCandidate.includes("lock") ||
            statusCandidate.includes("selesai") ||
            statusCandidate === "nonaktif" ||
            statusCandidate === "tidak aktif"
        );
    }

    function isDocActive(data = {}) {
        if (isDocClosed(data)) return false;
        if (
            data.isActive === true ||
            data.active === true ||
            data.aktif === true ||
            data.isAktif === true ||
            data.is_aktif === true ||
            data.isCurrent === true ||
            data.current === true
        ) {
            return true;
        }
        const statusCandidate = String(
            data.status ?? data.statusPeriode ?? data.status_periode ?? data.statusBulan ?? data.status_bulan ?? data.state ?? ""
        )
            .trim()
            .toLowerCase();

        return (
            statusCandidate === "aktif" ||
            statusCandidate === "active" ||
            statusCandidate === "open" ||
            statusCandidate === "terbuka" ||
            statusCandidate === "berjalan"
        );
    }

    function detectPeriodFromHeaderDom() {
        const headerText = String(document.body?.innerText || "");
        const match = headerText.match(/Bulan\s+Aktif\s*:\s*([^\n]+)/i);
        if (!match) return "";
        return normalizePeriodKey(match[1]);
    }

    function getPeriodeStatus(tglIso) {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();
        const periodKey = normalizePeriodKey(tglIso);
        if (!periodKey) {
            return { isAllowed: false, reason: "invalid_date", periodKey: "", label: "" };
        }

        const docData = tutupBulanMap.get(periodKey);
        const label = docData && docData.namaBulan && docData.tahun
            ? `${docData.namaBulan} ${docData.tahun} (${periodKey})`
            : periodKey;

        if (docData && isDocClosed(docData)) {
            const statusText = String(
                docData.status ?? docData.statusPeriode ?? docData.statusBulan ?? "Ditutup"
            ).trim();
            return {
                isAllowed: false,
                reason: "closed",
                periodKey,
                label,
                statusText
            };
        }

        if (effectiveActivePeriod && periodKey !== effectiveActivePeriod) {
            return {
                isAllowed: false,
                reason: "not_active_month",
                periodKey,
                label,
                activePeriodKey: effectiveActivePeriod
            };
        }

        return {
            isAllowed: true,
            reason: "ok",
            periodKey,
            label
        };
    }

    function getPeriodeBlockMessage(info) {
        if (!info || info.isAllowed) return "";
        if (info.reason === "closed") {
            return `Periode ${info.label} berstatus "${info.statusText || "Ditutup"}". Transaksi tidak dapat disimpan.`;
        }
        if (info.reason === "not_active_month") {
            return `Tanggal ${info.periodKey} di luar bulan aktif (${info.activePeriodKey}).`;
        }
        return "Tanggal transaksi tidak valid.";
    }

    function syncPeriodeValidationUI() {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();

        if (badgeBulanAktif) {
            if (effectiveActivePeriod) {
                badgeBulanAktif.textContent = `Bulan Aktif: ${effectiveActivePeriod}`;
                badgeBulanAktif.className = "px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
            } else {
                badgeBulanAktif.textContent = "Periode Terbuka";
                badgeBulanAktif.className = "px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
            }
        }

        if (periodeInfoEl) {
            periodeInfoEl.textContent = effectiveActivePeriod
                ? `Wajib Periode: ${effectiveActivePeriod}`
                : "";
        }

        const tglVal = kmTgl ? kmTgl.value : "";
        const info = getPeriodeStatus(tglVal);
        const blockMsg = getPeriodeBlockMessage(info);

        if (tglWarningEl) {
            if (!info.isAllowed) {
                tglWarningEl.textContent = blockMsg;
                tglWarningEl.classList.remove('hidden');
            } else {
                tglWarningEl.textContent = "";
                tglWarningEl.classList.add('hidden');
            }
        }

        if (kmTgl) {
            if (!info.isAllowed) {
                kmTgl.classList.remove('border-slate-300', 'dark:border-slate-700', 'focus:border-indigo-600');
                kmTgl.classList.add('border-rose-500', 'dark:border-rose-500', 'focus:border-rose-600');
            } else {
                kmTgl.classList.remove('border-rose-500', 'dark:border-rose-500', 'focus:border-rose-600');
                kmTgl.classList.add('border-slate-300', 'dark:border-slate-700', 'focus:border-indigo-600');
            }
        }

        return info.isAllowed;
    }

    async function loadTutupBulan() {
        try {
            const snap = await getDocs(collection(db, "tutup_bulan"));
            const nextMap = new Map();
            let detectedActive = "";
            let latestClosedNextPeriod = "";
            let latestClosedKey = "";

            snap.forEach((d) => {
                const data = d.data() || {};
                const key = extractDocPeriodKey(data, d.id);
                if (key) {
                    const entry = { id: d.id, ...data };
                    nextMap.set(key, entry);
                    if (!detectedActive && isDocActive(entry)) {
                        detectedActive = key;
                    }
                    if (isDocClosed(entry)) {
                        const nextKey = normalizePeriodKey(data.nextPeriodKey ?? data.next_period_key ?? "");
                        if (nextKey && (!latestClosedKey || key >= latestClosedKey)) {
                            latestClosedKey = key;
                            latestClosedNextPeriod = nextKey;
                        }
                    }
                }
            });

            if (!detectedActive && latestClosedNextPeriod && !nextMap.has(latestClosedNextPeriod)) {
                detectedActive = latestClosedNextPeriod;
            }

            if (!detectedActive) {
                for (const colName of ["pengaturan", "pengaturan_sistem"]) {
                    try {
                        const cfgSnap = await getDocs(collection(db, colName));
                        cfgSnap.forEach((d) => {
                            const data = d.data() || {};
                            const candidate = normalizePeriodKey(
                                data.bulanAktif ?? data.bulan_aktif ?? data.activePeriod ?? data.active_period ?? data.periodeAktif ?? data.periode ?? ""
                            );
                            if (!detectedActive && candidate) {
                                detectedActive = candidate;
                            }
                        });
                    } catch (_) {
                        // abaikan jika koleksi tidak ada
                    }
                    if (detectedActive) break;
                }
            }

            if (!detectedActive) {
                detectedActive = detectPeriodFromHeaderDom();
            }

            tutupBulanMap = nextMap;
            activePeriodKey = detectedActive;
            syncPeriodeValidationUI();
        } catch (err) {
            console.warn("Gagal memuat status tutup_bulan:", err);
            const fallbackDom = detectPeriodFromHeaderDom();
            if (fallbackDom) {
                activePeriodKey = fallbackDom;
                syncPeriodeValidationUI();
            }
        }
    }

    function buildSumberOptionsHtml(selectedKode = "") {
        const opts = ['<option value="">-- Pilih Akun Sumber / Pendapatan --</option>'];
        sumberAccountOptions.forEach(({ kode, nama }) => {
            const isSel = selectedKode && selectedKode === kode ? "selected" : "";
            opts.push(`<option value="${escapeHtml(kode)}" ${isSel}>${escapeHtml(`${kode} - ${nama}`)}</option>`);
        });
        return opts.join("");
    }

    function hitungTotalMultiAkun() {
        let total = 0;
        if (multiAkunContainer) {
            multiAkunContainer.querySelectorAll('.km-sumber-row').forEach((row) => {
                const nominal = parseDigitsToNumber(row.querySelector('.km-row-nominal')?.value || 0);
                total += nominal;
            });
        }
        if (totalDisplayEl) {
            totalDisplayEl.textContent = formatRupiah(total);
        }
        return total;
    }

    function syncRemoveButtonsState() {
        if (!multiAkunContainer) return;
        const rows = multiAkunContainer.querySelectorAll('.km-sumber-row');
        rows.forEach((row) => {
            const btnRemove = row.querySelector('.btn-hapus-baris-km');
            if (btnRemove) {
                btnRemove.disabled = rows.length <= 1;
            }
        });
    }

    function addMultiAkunRow(selectedKode = "", nominalVal = 0) {
        if (!multiAkunContainer) return;
        const rowEl = document.createElement('div');
        rowEl.className = "km-sumber-row grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center p-2.5 bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-none";
        const initialFormatted = nominalVal > 0 ? formatRibuanInput(nominalVal) : "";

        rowEl.innerHTML = `
            <div class="md:col-span-7">
                <select class="km-row-akun w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                    ${buildSumberOptionsHtml(selectedKode)}
                </select>
            </div>
            <div class="md:col-span-4">
                <input type="text" inputmode="numeric" value="${escapeHtml(initialFormatted)}" placeholder="Nominal (Rp)" class="km-row-nominal w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 text-right font-semibold rounded-none focus:outline-none focus:border-indigo-600">
            </div>
            <div class="md:col-span-1 flex justify-end">
                <button type="button" title="Hapus baris akun" class="btn-hapus-baris-km px-2.5 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 disabled:opacity-35 disabled:pointer-events-none text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-none transition cursor-pointer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        `;

        const nominalInput = rowEl.querySelector('.km-row-nominal');
        const removeBtn = rowEl.querySelector('.btn-hapus-baris-km');

        nominalInput?.addEventListener('input', () => {
            nominalInput.value = formatRibuanInput(nominalInput.value);
            hitungTotalMultiAkun();
        });

        removeBtn?.addEventListener('click', () => {
            const totalRows = multiAkunContainer.querySelectorAll('.km-sumber-row').length;
            if (totalRows <= 1) {
                showToast("Minimal harus ada 1 baris akun sumber / pendapatan.", true);
                return;
            }
            rowEl.remove();
            syncRemoveButtonsState();
            hitungTotalMultiAkun();
        });

        multiAkunContainer.appendChild(rowEl);
        syncRemoveButtonsState();
        hitungTotalMultiAkun();
    }

    function resetMultiAkunRows() {
        if (!multiAkunContainer) return;
        multiAkunContainer.innerHTML = "";
        addMultiAkunRow("", 0);
        hitungTotalMultiAkun();
    }

    function resetFormFields(focusTgl = false) {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();
        if (formKasMasuk) formKasMasuk.reset();
        if (kmTgl) {
            const todayIso = new Date().toISOString().split('T')[0];
            kmTgl.value = effectiveActivePeriod ? `${effectiveActivePeriod}-01` : todayIso;
        }
        if (kmUnit) kmUnit.value = "";
        if (kmAkunKas) kmAkunKas.value = "";
        if (kmPemberi) kmPemberi.value = "";
        if (kmKeterangan) kmKeterangan.value = "";
        resetMultiAkunRows();
        syncPeriodeValidationUI();
        if (focusTgl && kmTgl) kmTgl.focus();
    }

    async function loadCoa() {
        try {
            const qCoa = query(collection(db, "coa"), orderBy("kodeAkun", "asc"));
            const snapCoa = await getDocs(qCoa);

            const prevKasVal = kmAkunKas ? kmAkunKas.value : "";
            if (kmAkunKas) kmAkunKas.innerHTML = '<option value="">-- Pilih Akun Kas / Bank --</option>';

            const nextSumberOptions = [];

            snapCoa.forEach(docSnap => {
                const data = docSnap.data();
                const kode = String(data.kodeAkun || "").trim();
                const nama = String(data.namaAkun || "").trim();
                const level = String(data.levelAkun || "");
                const tipe = String(data.tipeAkun || "").toLowerCase();
                const group = String(data.reportGroup || "").toLowerCase();

                if ((level === "4" || tipe === "detail") && data.statusAkun !== "Nonaktif" && kode) {
                    if (kode.startsWith("1.01") || group.includes("kas") || group.includes("bank")) {
                        if (kmAkunKas) {
                            const opt = document.createElement('option');
                            opt.value = kode;
                            opt.textContent = `${kode} - ${nama}`;
                            if (prevKasVal && prevKasVal === kode) opt.selected = true;
                            kmAkunKas.appendChild(opt);
                        }
                    }
                    nextSumberOptions.push({ kode, nama });
                }
            });

            sumberAccountOptions = nextSumberOptions;

            if (multiAkunContainer) {
                if (multiAkunContainer.children.length === 0) {
                    addMultiAkunRow("", 0);
                } else {
                    multiAkunContainer.querySelectorAll('.km-row-akun').forEach((sel) => {
                        const prevSel = sel.value;
                        sel.innerHTML = buildSumberOptionsHtml(prevSel);
                    });
                }
            }
        } catch (err) {
            console.error("Gagal memuat COA kas masuk:", err);
            showToast("Gagal memuat daftar akun COA.", true);
        }
    }

    const onTglChange = () => {
        syncPeriodeValidationUI();
    };

    const onTambahAkunClick = () => {
        addMultiAkunRow("", 0);
    };

    const onResetClick = async () => {
        await loadTutupBulan();
        resetFormFields(true);
        showToast("Form kas masuk direset.");
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        await loadTutupBulan();

        const tgl = kmTgl ? kmTgl.value : "";
        const periodeInfo = getPeriodeStatus(tgl);
        if (!periodeInfo.isAllowed) {
            syncPeriodeValidationUI();
            showToast(`Tidak bisa simpan: ${getPeriodeBlockMessage(periodeInfo)}`, true);
            kmTgl?.focus();
            return;
        }

        const unit = kmUnit ? kmUnit.value : "";
        const akunKasVal = kmAkunKas ? kmAkunKas.value : "";
        const pemberi = kmPemberi ? kmPemberi.value.trim() : "";
        const ket = kmKeterangan ? kmKeterangan.value.trim() : "";

        if (!akunKasVal) {
            showToast("Pilih akun kas penerima terlebih dahulu.", true);
            return;
        }

        const rows = multiAkunContainer ? Array.from(multiAkunContainer.querySelectorAll('.km-sumber-row')) : [];
        if (rows.length === 0) {
            showToast("Tambahkan minimal 1 baris akun sumber / pendapatan.", true);
            return;
        }

        const sumberItems = [];
        let hasInvalidRow = false;
        let totalNominal = 0;

        rows.forEach((row) => {
            const sel = row.querySelector('.km-row-akun');
            const nomInput = row.querySelector('.km-row-nominal');
            const kodeSumber = sel ? String(sel.value || "").trim() : "";
            const nominal = parseDigitsToNumber(nomInput ? nomInput.value : 0);

            if (!kodeSumber && nominal === 0) {
                return;
            }
            if (!kodeSumber || nominal <= 0) {
                hasInvalidRow = true;
                return;
            }
            if (kodeSumber === akunKasVal) {
                hasInvalidRow = true;
                return;
            }

            const opt = sel.options[sel.selectedIndex];
            const namaSumber = opt ? opt.textContent.split(' - ').slice(1).join(' - ') || "Pendapatan" : "Pendapatan";

            totalNominal += nominal;
            sumberItems.push({
                kodeAkun: kodeSumber,
                namaAkun: namaSumber,
                debet: 0,
                kredit: nominal
            });
        });

        if (hasInvalidRow) {
            showToast("Periksa baris multi akun: pilih akun sumber yang valid (berbeda dari akun kas) dan nominal > 0.", true);
            return;
        }

        if (sumberItems.length === 0 || totalNominal <= 0) {
            showToast("Isi minimal 1 akun sumber / pendapatan dengan nominal lebih besar dari 0.", true);
            return;
        }

        const kasOpt = kmAkunKas.options[kmAkunKas.selectedIndex];
        const namaKas = kasOpt ? kasOpt.textContent.split(' - ').slice(1).join(' - ') || "Kas / Bank" : "Kas / Bank";

        const rincianJurnal = [
            { kodeAkun: akunKasVal, namaAkun: namaKas, debet: totalNominal, kredit: 0 },
            ...sumberItems
        ];

        const payloadJurnal = {
            type: "KasMasuk",
            jenisTransaksi: "Kas Masuk",
            noRef: `KM-${Date.now().toString().slice(-6)}`,
            tglTransaksi: tgl,
            periode: periodeInfo.periodKey,
            unitUsaha: unit,
            pemberiDana: pemberi,
            keterangan: `[Kas Masuk] ${ket}`,
            rincian: rincianJurnal,
            totalNilai: totalNominal,
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
            resetFormFields(false);
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

    if (kmTgl) {
        kmTgl.addEventListener('change', onTglChange);
        kmTgl.addEventListener('input', onTglChange);
    }
    if (btnTambahAkun) btnTambahAkun.addEventListener('click', onTambahAkunClick);
    if (btnResetKm) btnResetKm.addEventListener('click', onResetClick);
    if (formKasMasuk) formKasMasuk.addEventListener('submit', onFormSubmit);

    const cleanup = () => {
        if (kasMasukToastTimer) {
            clearTimeout(kasMasukToastTimer);
            kasMasukToastTimer = null;
        }
        if (kmTgl) {
            kmTgl.removeEventListener('change', onTglChange);
            kmTgl.removeEventListener('input', onTglChange);
        }
        if (btnTambahAkun) btnTambahAkun.removeEventListener('click', onTambahAkunClick);
        if (btnResetKm) btnResetKm.removeEventListener('click', onResetClick);
        if (formKasMasuk) formKasMasuk.removeEventListener('submit', onFormSubmit);
        window.removeEventListener('hashchange', cleanup);
        kasMasukCleanup = null;
    };

    window.addEventListener('hashchange', cleanup);
    kasMasukCleanup = cleanup;

    Promise.all([loadTutupBulan(), loadCoa()]).then(() => {
        const effectiveActivePeriod = activePeriodKey || detectPeriodFromHeaderDom();
        if (kmTgl && effectiveActivePeriod && !kmTgl.value.startsWith(effectiveActivePeriod)) {
            kmTgl.value = `${effectiveActivePeriod}-01`;
            syncPeriodeValidationUI();
        }
    });

    return cleanup;
}