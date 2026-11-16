import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderGaleri() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Galeri Foto</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dokumentasi foto dan galeri kegiatan organisasi.</p>
                </div>
            </div>

            <!-- Kontainer Daftar Galeri -->
            <div id="galeri-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

    if (closeImageModal && imageModal) {
        closeImageModal.onclick = () => imageModal.classList.add('hidden');
        imageModal.onclick = (e) => {
            if (e.target === imageModal) imageModal.classList.add('hidden');
        };
    }

    if (container) {
        try {
            // Mengambil data dari koleksi 'branding' atau 'galeri' di Firestore
            const querySnapshot = await getDocs(collection(db, "branding"));
            let galeriList = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.status !== false) {
                    galeriList.push({ id: docSnap.id, ...data });
                }
            });

            if (galeriList.length === 0) {
                container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">Belum ada foto galeri aktif.</div>`;
            } else {
                let html = "";
                galeriList.forEach((item) => {
                    const img = item.gambar || "";
                    const title = item.nama || item.judul || "Galeri Foto";
                    const kategori = item.kategori || "-";
                    const tahun = item.tahun || "-";

                    html += `
                        <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition flex flex-col">
                            <div class="w-full h-64 bg-slate-900 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer zoom-thumb" data-img="${img}" data-title="${title}">
                                ${img ? `<img src="${img}" alt="${title}" class="w-full h-full object-contain pointer-events-none hover:scale-105 transition duration-300">` : `<span class="text-xs text-slate-400">No Image</span>`}
                            </div>
                            <div class="p-3.5 flex flex-col justify-between flex-1 space-y-1.5">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-none">${kategori}</span>
                                        <span class="text-[10px] text-slate-400">${tahun}</span>
                                    </div>
                                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${title}</h4>
                                </div>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        } catch (err) {
            console.error("Gagal memuat data galeri:", err);
            container.innerHTML = `<div class="col-span-full p-8 text-center text-red-500 text-xs">Gagal memuat data galeri dari database.</div>`;
        }
    }

    // Event Delegation untuk Zoom Gambar
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