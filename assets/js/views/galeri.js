// File: assets/js/views/galeri.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderGaleri() {
    // Mendapatkan bulan dan tahun berjalan untuk default filter
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = String(now.getFullYear());

    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto">
            <!-- Header Halaman & Filter -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Galeri Foto</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dokumentasi foto dan galeri kegiatan organisasi.</p>
                </div>

                <!-- Filter Unit, Bulan & Tahun -->
                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <select id="filter-unit" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">Semua Unit / Kategori</option>
                        <option value="Kegiatan Kantor">Kegiatan Kantor</option>
                        <option value="Agrowisata">Agrowisata</option>
                        <option value="Kompos">Kompos</option>
                        <option value="Greenhouse">Greenhouse</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>

                    <select id="filter-bulan" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">Semua Bulan</option>
                        <option value="01">Januari</option>
                        <option value="02">Februari</option>
                        <option value="03">Maret</option>
                        <option value="04">April</option>
                        <option value="05">Mei</option>
                        <option value="06">Juni</option>
                        <option value="07">Juli</option>
                        <option value="08">Agustus</option>
                        <option value="09">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                    </select>

                    <select id="filter-tahun" class="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">Semua Tahun</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                    </select>
                </div>
            </div>

            <!-- Kontainer Daftar Galeri (2 Kolom HP, 4 Kolom Desktop) -->
            <div id="galeri-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                <div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Memuat data galeri...
                </div>
            </div>

            <!-- MODAL ZOOM GAMBAR (LIGHTBOX) -->
            <div id="image-modal" class="hidden fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
                <div class="relative max-w-lg w-full bg-white dark:bg-slate-900 p-2 rounded-none shadow-2xl flex flex-col items-center border border-slate-200 dark:border-slate-800">
                    <button id="close-image-modal" class="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 shadow hover:bg-red-700 transition cursor-pointer">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <img id="modal-zoomed-img" alt="Zoom Image" class="max-h-[80vh] w-auto object-contain">
                    <p id="modal-zoomed-title" class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 text-center"></p>
                </div>
            </div>
        </div>
    `;
}

export async function initGaleriHandler() {
    const container = document.getElementById('galeri-container');
    const imageModal = document.getElementById('image-modal');
    const zoomedImg = document.getElementById('modal-zoomed-img');
    const zoomedTitle = document.getElementById('modal-zoomed-title');
    const closeImageModal = document.getElementById('close-image-modal');
    const filterUnit = document.getElementById('filter-unit');
    const filterBulan = document.getElementById('filter-bulan');
    const filterTahun = document.getElementById('filter-tahun');

    // Set default nilai filter ke bulan dan tahun berjalan
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = String(now.getFullYear());

    if (filterBulan) filterBulan.value = currentMonth;
    if (filterTahun) filterTahun.value = currentYear;

    let allGaleriList = [];

    if (closeImageModal && imageModal) {
        closeImageModal.onclick = () => imageModal.classList.add('hidden');
        imageModal.onclick = (e) => {
            if (e.target === imageModal) imageModal.classList.add('hidden');
        };
    }

    // Fungsi Render Tampilan ke HTML (2 Kolom HP, 4 Kolom Desktop)
    function renderGaleriList(dataList) {
        if (!container) return;

        if (dataList.length === 0) {
            container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">Tidak ada foto galeri untuk periode atau unit ini.</div>`;
            return;
        }

        let html = "";
        dataList.forEach((item) => {
            const img = item.image || "";
            const title = item.title || "Galeri Foto";
            const kategori = item.kategori || "Umum";

            html += `
                <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition flex flex-col">
                    <div class="w-full h-44 sm:h-52 bg-slate-900 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer zoom-thumb" data-img="${img}" data-title="${title}">
                        ${img ? `<img src="${img}" alt="${title}" class="w-full h-full object-cover pointer-events-none hover:scale-105 transition duration-300">` : `<span class="text-xs text-slate-400">No Image</span>`}
                    </div>
                    <div class="p-3 flex flex-col justify-between flex-1 space-y-1">
                        <div class="flex items-center justify-between mb-0.5">
                            <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-none">${kategori}</span>
                        </div>
                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${title}</h4>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // Fungsi Filter Data berdasarkan Unit, Bulan, & Tahun
    function applyFilter() {
        const selectedUnit = filterUnit ? filterUnit.value : "";
        const selectedBulan = filterBulan ? filterBulan.value : "";
        const selectedTahun = filterTahun ? filterTahun.value : "";

        const filtered = allGaleriList.filter(item => {
            const matchUnit = selectedUnit === "" || item.kategori === selectedUnit;

            let matchBulan = true;
            let matchTahun = true;

            if (item.createdAt) {
                const dateObj = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
                const itemMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
                const itemYear = String(dateObj.getFullYear());

                matchBulan = selectedBulan === "" || itemMonth === selectedBulan;
                matchTahun = selectedTahun === "" || itemYear === selectedTahun;
            } else if (selectedBulan !== "" || selectedTahun !== "") {
                // Jika data tidak memiliki timestamp createdAt, abaikan filter tanggal
                matchBulan = false;
                matchTahun = false;
            }

            return matchUnit && matchBulan && matchTahun;
        });

        renderGaleriList(filtered);
    }

    // Ambil Data dari Firestore
    if (container) {
        try {
            const q = query(collection(db, "galeri"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            allGaleriList = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.active !== false) {
                    allGaleriList.push({ id: docSnap.id, ...data });
                }
            });

            // Jalankan filter awal sesuai bulan berjalan
            applyFilter();
        } catch (err) {
            console.error("Gagal memuat data galeri:", err);
            container.innerHTML = `<div class="col-span-full p-8 text-center text-red-500 text-xs">Gagal memuat data galeri dari database.</div>`;
        }
    }

    // Event Listener untuk elemen Filter
    if (filterUnit) filterUnit.onchange = applyFilter;
    if (filterBulan) filterBulan.onchange = applyFilter;
    if (filterTahun) filterTahun.onchange = applyFilter;

    // Event Delegation untuk Zoom Gambar (Lightbox)
    if (container) {
        container.onclick = (e) => {
            const thumb = e.target.closest('.zoom-thumb');
            if (thumb) {
                const imgSrc = thumb.getAttribute('data-img');
                const imgTitle = thumb.getAttribute('data-title');
                if (imgSrc && imageModal && zoomedImg && zoomedTitle) {
                    zoomedImg.src = imgSrc;
                    zoomedTitle.textContent = imgTitle;
                    imageModal.classList.remove('hidden');
                }
            }
        };
    }
}