import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderEvent() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Daftar Event & Kegiatan</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informasi jadwal event, agenda, serta kegiatan penting.</p>
                </div>
            </div>

            <!-- Kontainer Daftar Event -->
            <div id="event-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Memuat data event...
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

export async function initEventHandler() {
    const container = document.getElementById('event-container');
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
            const querySnapshot = await getDocs(collection(db, "event"));
            let eventList = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.status !== false) {
                    eventList.push({ id: docSnap.id, ...data });
                }
            });

            if (eventList.length === 0) {
                container.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 text-xs">Belum ada event atau kegiatan aktif.</div>`;
            } else {
                let html = "";
                eventList.forEach((item) => {
                    const img = item.gambar || "";
                    const title = item.judul || "Event Kegiatan";
                    const desc = item.deskripsi || "-";
                    
                    let tanggalStr = '-';
                    if (item.tipeTanggal === 'period') {
                        tanggalStr = `${item.tanggalMulai || ''} s/d ${item.tanggalSelesai || ''}`;
                    } else {
                        tanggalStr = item.tanggalSingle || item.createdAt?.substring(0, 10) || '-';
                    }

                    html += `
                        <div class="border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition flex flex-col">
                            <div class="w-full h-64 bg-slate-900 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer zoom-thumb" data-img="${img}" data-title="${title}">
                                ${img ? `<img src="${img}" alt="${title}" class="w-full h-full object-contain pointer-events-none hover:scale-105 transition duration-300">` : `<span class="text-xs text-slate-400">No Image</span>`}
                            </div>
                            <div class="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                                <div>
                                    <span class="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-none mb-1">${tanggalStr}</span>
                                    <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${title}</h4>
                                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${desc}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            }
        } catch (err) {
            console.error("Gagal memuat data event:", err);
            container.innerHTML = `<div class="col-span-full p-8 text-center text-red-500 text-xs">Gagal memuat data event dari database.</div>`;
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