// File: assets/js/views/galeri.js
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderGaleri() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto">
            <!-- Header Halaman & Filter -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Galeri Foto</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dokumentasi foto dan galeri kegiatan organisasi. Menampilkan 8 gambar per halaman.</p>
                </div>

                <!-- Filter Unit / Kategori -->
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <select id="filter-unit" class="w-full md:w-52 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-none focus:outline-none focus:border-indigo-600">
                        <option value="">Semua Unit / Kategori</option>
                        <option value="Kegiatan Kantor">Kegiatan Kantor</option>
                        <option value="Agrowisata">Agrowisata</option>
                        <option value="Kompos">Kompos</option>
                        <option value="Greenhouse">Greenhouse</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
            </div>

            <!-- Kontainer Daftar Galeri (2 Kolom HP, 4 Kolom Desktop) -->
            <div id="galeri-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                <div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Memuat data galeri...
                </div>
            </div>

            <!-- Navigasi Pagination (8 Gambar per Halaman) -->
            <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span id="galeri-pagination-info" class="text-slate-500 dark:text-slate-400">Menampilkan 0 - 0 dari 0 gambar</span>
                <div class="flex items-center gap-1">
                    <button type="button" id="galeri-btn-prev" class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <span id="galeri-page-indicator" class="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                        1
                    </span>
                    <button type="button" id="galeri-btn-next" class="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
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

    const paginationInfo = document.getElementById('galeri-pagination-info');
    const pageIndicator = document.getElementById('galeri-page-indicator');
    const btnPrev = document.getElementById('galeri-btn-prev');
    const btnNext = document.getElementById('galeri-btn-next');

    const itemsPerPage = 8;
    let currentPage = 1;
    let allGaleriList = [];
    let filteredGaleriList = [];

    if (closeImageModal && imageModal) {
        closeImageModal.onclick = () => imageModal.classList.add('hidden');
        imageModal.onclick = (e) => {
            if (e.target === imageModal) imageModal.classList.add('hidden');
        };
    }

    // Fungsi Render Tampilan ke HTML (Maksimal 8 Gambar per Halaman)
    function renderGaleriPage() {
        if (!container) return;

        const totalData = filteredGaleriList.length;
        const totalPages = Math.ceil(totalData / itemsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const pageItems = filteredGaleriList.slice(startIdx, endIdx);

        if (pageItems.length === 0) {
            container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">Tidak ada foto galeri untuk unit / kategori ini.</div>`;
        } else {
            let html = "";
            pageItems.forEach((item) => {
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

        if (paginationInfo) {
            paginationInfo.textContent = `Menampilkan ${totalData > 0 ? startIdx + 1 : 0} - ${Math.min(endIdx, totalData)} dari ${totalData} gambar`;
        }
        if (pageIndicator) {
            pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        }
        if (btnPrev) {
            btnPrev.disabled = currentPage <= 1 || totalData === 0;
        }
        if (btnNext) {
            btnNext.disabled = currentPage >= totalPages || totalData === 0;
        }
    }

    // Fungsi Filter Data berdasarkan Unit / Kategori
    function applyFilter() {
        const selectedUnit = filterUnit ? filterUnit.value : "";

        filteredGaleriList = allGaleriList.filter(item => {
            return selectedUnit === "" || item.kategori === selectedUnit;
        });

        currentPage = 1;
        renderGaleriPage();
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

            applyFilter();
        } catch (err) {
            console.error("Gagal memuat data galeri:", err);
            container.innerHTML = `<div class="col-span-full p-8 text-center text-red-500 text-xs">Gagal memuat data galeri dari database.</div>`;
        }
    }

    // Event Listener untuk Filter & Navigasi Halaman
    if (filterUnit) {
        filterUnit.onchange = applyFilter;
    }

    if (btnPrev) {
        btnPrev.onclick = () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderGaleriPage();
            }
        };
    }

    if (btnNext) {
        btnNext.onclick = () => {
            const totalPages = Math.ceil(filteredGaleriList.length / itemsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage += 1;
                renderGaleriPage();
            }
        };
    }

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