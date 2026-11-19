// File: assets/js/views/analytics.js
import {
    collection,
    getDocs,
    doc,
    setDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

function formatLocalDate(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Mencatat rekap harian event aplikasi ke Firestore (koleksi: analytics_daily)
 * ID dokumen: YYYY-MM-DD_nama_event
 */
export async function trackAppEvent(eventName, meta = {}) {
    const cleanEvent = String(eventName || "").trim();
    if (!cleanEvent) return;

    const todayStr = formatLocalDate(new Date());
    const safeDocId = `${todayStr}_${cleanEvent}`.replace(/[^a-zA-Z0-9_-]/g, "_");

    try {
        const docRef = doc(db, "analytics_daily", safeDocId);
        await setDoc(
            docRef,
            {
                eventName: cleanEvent,
                date: todayStr,
                count: increment(1),
                lastRoute: String(meta.route || window.location.hash || "#/").trim(),
                updatedAt: new Date().toISOString()
            },
            { merge: true }
        );
    } catch (err) {
        console.warn("Gagal mencatat event analitik ke Firestore:", err);
    }
}

export function renderAnalytics() {
    const now = new Date();
    const defaultSampai = formatLocalDate(now);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const defaultMulai = formatLocalDate(sevenDaysAgo);

    return `
        <div class="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-12 overflow-x-hidden">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="min-w-0">
                    <span class="inline-block bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-none tracking-wide uppercase mb-1">ADMINISTRATOR</span>
                    <h1 class="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight break-words">Analytics &amp; Statistik Aplikasi</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words">Pemantauan data sistem, aktivitas pengguna tercatat, dan integrasi Google Analytics (GA4).</p>
                </div>
            </div>

            <!-- Kartu Statistik Utama -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs min-w-0">
                    <div class="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Status GA4 Tag</div>
                    <div class="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2 break-words">
                        <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></span>
                        <span>Terhubung (G-Q7BVR3XNJS)</span>
                    </div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pelacakan rute halaman aktif.</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs min-w-0">
                    <div class="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Event &amp; Galeri</div>
                    <div id="stat-konten" class="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Memuat...</div>
                    <p id="stat-konten-detail" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Event: - | Galeri: -</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs min-w-0">
                    <div class="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Staf / Pengguna</div>
                    <div id="stat-staf" class="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">Memuat...</div>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Akun aktif dalam sistem.</p>
                </div>
                <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs min-w-0">
                    <div class="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Aktivitas Tercatat</div>
                    <div id="stat-aktivitas" class="text-base sm:text-xl font-bold text-indigo-900 dark:text-indigo-300 mt-2">0 Event</div>
                    <p id="stat-aktivitas-detail" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Periode terpilih</p>
                </div>
            </div>

            <!-- Rekap Event Aplikasi dari Firestore -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-xs overflow-hidden">
                <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 bg-slate-50/50 dark:bg-slate-950/50">
                    <div>
                        <h2 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Rekap Event Aplikasi (Firestore)</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ringkasan jumlah kejadian per event berdasarkan rekap harian yang dicatat aplikasi.</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto text-xs items-end">
                        <div>
                            <label for="analytics-tgl-mulai" class="block font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase mb-1">Dari Tanggal</label>
                            <input type="date" id="analytics-tgl-mulai" value="${defaultMulai}"
                                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <label for="analytics-tgl-sampai" class="block font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase mb-1">Sampai Tanggal</label>
                            <input type="date" id="analytics-tgl-sampai" value="${defaultSampai}"
                                class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        </div>
                        <div>
                            <button type="button" id="btn-muat-event-analytics"
                                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-none transition cursor-pointer">
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tampilan Desktop -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-950">
                                <th class="py-2.5 px-4 font-semibold w-14">No</th>
                                <th class="py-2.5 px-4 font-semibold">Event name</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Event count</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-32">Kontribusi</th>
                                <th class="py-2.5 px-4 font-semibold text-right w-36">Terakhir aktif</th>
                            </tr>
                        </thead>
                        <tbody id="analytics-events-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            <tr>
                                <td colspan="5" class="py-8 text-center text-slate-400">Memuat data event...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Tampilan Mobile -->
                <div id="analytics-events-card" class="block md:hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div class="p-6 text-center text-slate-400">Memuat data event...</div>
                </div>
            </div>

            <!-- Panel Informasi Akses Google Analytics -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4 sm:p-6 space-y-4 shadow-xs">
                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    <span>Panduan Laporan Trafik Pengunjung</span>
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Tag Google Analytics (<code class="font-mono text-indigo-700 dark:text-indigo-300">G-Q7BVR3XNJS</code>) yang terpasang pada aplikasi Anda secara otomatis merekam perpindahan halaman ke GA4, sedangkan tabel di atas menampilkan rekap event internal yang tercatat di Firestore.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-200">1. Lihat Trafik Real-Time</div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Pantau siapa saja yang sedang membuka aplikasi saat ini melalui menu <strong>Realtime Analytics</strong> di Google Analytics atau Firebase Console Anda.</p>
                    </div>
                    <div class="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-none space-y-2">
                        <div class="text-xs font-bold text-slate-700 dark:text-slate-200">2. Analisis Halaman &amp; Perangkat</div>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Laporan mendalam mengenai halaman apa saja yang sering dikunjungi (Beranda, Galeri, Event) dan metrik unik pengunjung GA4 dapat diakses langsung melalui dasbor web Google Analytics.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

let analyticsCleanup = null;

export function initAnalyticsHandler() {
    if (typeof analyticsCleanup === "function") {
        analyticsCleanup();
        analyticsCleanup = null;
    }

    const statKonten = document.getElementById("stat-konten");
    const statKontenDetail = document.getElementById("stat-konten-detail");
    const statStaf = document.getElementById("stat-staf");
    const statAktivitas = document.getElementById("stat-aktivitas");
    const statAktivitasDetail = document.getElementById("stat-aktivitas-detail");

    const tglMulaiEl = document.getElementById("analytics-tgl-mulai");
    const tglSampaiEl = document.getElementById("analytics-tgl-sampai");
    const btnMuat = document.getElementById("btn-muat-event-analytics");
    const eventsBody = document.getElementById("analytics-events-body");
    const eventsCard = document.getElementById("analytics-events-card");

    let dailyDocs = [];

    function renderEventSummary() {
        const startStr = tglMulaiEl ? tglMulaiEl.value : "";
        const endStr = tglSampaiEl ? tglSampaiEl.value : "";

        const filtered = dailyDocs.filter((d) => {
            const tgl = String(d.date || "").trim();
            if (!tgl) return false;
            if (startStr && tgl < startStr) return false;
            if (endStr && tgl > endStr) return false;
            return true;
        });

        const grouped = {};
        let grandTotal = 0;

        filtered.forEach((row) => {
            const name = String(row.eventName || "unknown_event").trim();
            const cnt = Number(row.count) || 0;
            const tgl = String(row.date || "-").trim();

            if (!grouped[name]) {
                grouped[name] = {
                    eventName: name,
                    count: 0,
                    lastActive: tgl
                };
            }

            grouped[name].count += cnt;
            if (tgl > grouped[name].lastActive) {
                grouped[name].lastActive = tgl;
            }
            grandTotal += cnt;
        });

        const list = Object.values(grouped).sort((a, b) => b.count - a.count);

        if (statAktivitas) {
            statAktivitas.textContent = `${grandTotal.toLocaleString("id-ID")} Event`;
        }
        if (statAktivitasDetail) {
            statAktivitasDetail.textContent = startStr || endStr
                ? `${startStr || "Awal"} s/d ${endStr || "Sekarang"}`
                : "Semua tanggal";
        }

        if (list.length === 0) {
            if (eventsBody) {
                eventsBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada data event tercatat pada rentang tanggal ini.</td></tr>`;
            }
            if (eventsCard) {
                eventsCard.innerHTML = `<div class="p-6 text-center text-slate-400">Belum ada data event tercatat pada rentang tanggal ini.</div>`;
            }
            return;
        }

        let htmlTable = "";
        let htmlCard = "";

        list.forEach((item, idx) => {
            const pct = grandTotal > 0 ? ((item.count / grandTotal) * 100).toFixed(1) : "0.0";

            htmlTable += `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-2.5 px-4 text-slate-500">${idx + 1}</td>
                    <td class="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">${item.eventName}</td>
                    <td class="py-2.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">${item.count.toLocaleString("id-ID")}</td>
                    <td class="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">${pct}%</td>
                    <td class="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">${item.lastActive}</td>
                </tr>
            `;

            htmlCard += `
                <div class="p-3.5 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div class="flex items-center justify-between gap-2">
                        <span class="font-bold text-indigo-600 dark:text-indigo-400 font-mono break-all">${item.eventName}</span>
                        <span class="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">${item.count.toLocaleString("id-ID")}x</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Kontribusi: <strong class="text-slate-700 dark:text-slate-200">${pct}%</strong></span>
                        <span>Aktif: <strong class="text-slate-700 dark:text-slate-200">${item.lastActive}</strong></span>
                    </div>
                </div>
            `;
        });

        if (eventsBody) eventsBody.innerHTML = htmlTable;
        if (eventsCard) eventsCard.innerHTML = htmlCard;
    }

    async function loadDailyEvents() {
        try {
            const snap = await getDocs(collection(db, "analytics_daily"));
            const loaded = [];
            snap.forEach((docSnap) => {
                loaded.push({ id: docSnap.id, ...docSnap.data() });
            });
            dailyDocs = loaded;
        } catch (err) {
            console.warn("Gagal memuat koleksi analytics_daily:", err);
            dailyDocs = [];
        }

        renderEventSummary();
    }

    async function loadSystemStats() {
        let eventCount = 0;
        let galeriCount = 0;

        try {
            const eventSnap = await getDocs(collection(db, "events"));
            eventCount = eventSnap.size;
        } catch (err) {
            console.error("Gagal memuat data events:", err);
        }

        try {
            const galeriSnap = await getDocs(collection(db, "galeri"));
            galeriCount = galeriSnap.size;
        } catch (err) {
            console.error("Gagal memuat data galeri:", err);
        }

        if (statKonten) statKonten.textContent = `${eventCount + galeriCount} Item`;
        if (statKontenDetail) statKontenDetail.textContent = `Event: ${eventCount} | Galeri: ${galeriCount}`;

        try {
            const stafSnap = await getDocs(collection(db, "users"));
            if (statStaf) statStaf.textContent = `${stafSnap.size} Akun`;
        } catch (err) {
            console.error("Gagal memuat data staf/pengguna:", err);
            if (statStaf) statStaf.textContent = "0 Akun";
        }
    }

    const onFilterApply = () => renderEventSummary();
    if (btnMuat) btnMuat.addEventListener("click", onFilterApply);
    if (tglMulaiEl) tglMulaiEl.addEventListener("change", onFilterApply);
    if (tglSampaiEl) tglSampaiEl.addEventListener("change", onFilterApply);

    const cleanup = () => {
        if (btnMuat) btnMuat.removeEventListener("click", onFilterApply);
        if (tglMulaiEl) tglMulaiEl.removeEventListener("change", onFilterApply);
        if (tglSampaiEl) tglSampaiEl.removeEventListener("change", onFilterApply);
        window.removeEventListener("hashchange", cleanup);
        analyticsCleanup = null;
    };

    window.addEventListener("hashchange", cleanup);
    analyticsCleanup = cleanup;

    loadSystemStats();
    loadDailyEvents();

    return cleanup;
}