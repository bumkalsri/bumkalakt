// File: assets/js/views/home.js
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "../firebase-init.js";

export function renderHome() {
    return `
        <div class="space-y-6 pb-10 relative animate-fade-in">
            
            <!-- Banner Slider & Sapaan User -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="space-y-1">
                        <span class="inline-block bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 text-[10px] font-semibold px-2.5 py-0.5 tracking-wide uppercase">SISTEM AKTIF</span>
                        <h1 class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100" id="welcome-user-title">Selamat Datang! 👋</h1>
                    </div>
                    <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3 py-1.5 rounded-none flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Sistem Akuntansi & Operasional Aktif
                    </div>
                </div>

                <!-- Bagian Slider Banner dari Database -->
                <div class="space-y-3 pt-2">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Banner & Informasi Utama</h2>
                        <div class="flex items-center gap-1">
                            <button id="slider-prev" class="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button id="slider-next" class="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Container Slider (Grid 4 Kolom di Desktop, 1 Kolom di HP) -->
                    <div id="home-banner-container" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="col-span-full py-8 text-center text-xs text-slate-400">Memuat banner dari database...</div>
                    </div>
                </div>
            </div>

            <!-- Bagian Company Profile dari Database -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Profile</h2>
                <div id="company-profile-content" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
                    <p class="text-slate-400 italic">Memuat profil perusahaan...</p>
                </div>
            </div>

            <!-- Bagian Daftar Produk (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h2 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Produk Unggulan</h2>
                    <!-- Filter Unit untuk Produk di Beranda -->
                    <div class="w-full sm:w-48">
                        <select id="home-filter-unit" class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-none focus:outline-none focus:border-indigo-600">
                            <option value="">Semua Unit</option>
                        </select>
                    </div>
                </div>

                <!-- Container Grid Produk -->
                <div id="home-product-container" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div class="col-span-full py-8 text-center text-xs text-slate-400">Memuat daftar produk dari database...</div>
                </div>
            </div>

            <!-- MODAL LIGHTBOX UNTUK MEMPERBESAR GAMBAR -->
            <div id="image-modal" class="hidden fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 cursor-pointer" onclick="closeImageModal()">
                <div class="relative max-w-3xl max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
                    <button onclick="closeImageModal()" class="absolute top-2 right-2 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition z-10">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <img id="modal-image-element" src="" alt="Zoom Gambar" class="max-w-full max-h-[85vh] object-contain border border-slate-700 shadow-2xl">
                </div>
            </div>

        </div>
    `;
}

export async function initHomeHandler() {
    const welcomeTitle = document.getElementById('welcome-user-title');
    const bannerContainer = document.getElementById('home-banner-container');
    const productContainer = document.getElementById('home-product-container');
    const unitFilterSelect = document.getElementById('home-filter-unit');
    const companyProfileContainer = document.getElementById('company-profile-content');
    const btnPrev = document.getElementById('slider-prev');
    const btnNext = document.getElementById('slider-next');

    let allBanners = [];
    let allProducts = [];
    let currentIndex = 0;
    let autoSlideInterval = null;

    // Fungsi Global untuk Membuka & Menutup Modal Zoom Gambar
    window.openImageModal = function(imgSrc) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image-element');
        if (modal && modalImg) {
            modalImg.src = imgSrc;
            modal.classList.remove('hidden');
        }
    };

    window.closeImageModal = function() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    // 1. Memuat nama user yang sedang login
    try {
        const currentUser = auth.currentUser;
        if (currentUser && welcomeTitle) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            let displayName = currentUser.displayName || currentUser.email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

            if (userDocSnap.exists() && userDocSnap.data().nama) {
                displayName = userDocSnap.data().nama;
            }

            welcomeTitle.textContent = `Selamat Datang, ${displayName}! 👋`;
        }
    } catch (err) {
        console.error("Gagal memuat nama user untuk beranda:", err);
    }

    // 2. Memuat Company Profile dari Firestore
    try {
        const profileDocRef = doc(db, "pengaturan", "profil_perusahaan");
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists() && companyProfileContainer) {
            const data = profileSnap.data();
            const desc = data.companyDesc || "Belum ada deskripsi profil perusahaan yang diatur.";
            const email = data.companyEmail ? `<br><strong>Email:</strong> ${data.companyEmail}` : "";
            const web = data.companyWeb ? `<br><strong>Website:</strong> <a href="${data.companyWeb}" target="_blank" class="text-indigo-600 underline">${data.companyWeb}</a>` : "";
            
            companyProfileContainer.innerHTML = `
                <p class="whitespace-pre-line">${desc}</p>
                <div class="pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <strong>Alamat:</strong> ${data.alamat || '-'}<br>
                    <strong>Kontak / Telepon:</strong> ${data.telepon || '-'}${email}${web}
                </div>
            `;
        } else if (companyProfileContainer) {
            companyProfileContainer.innerHTML = `<p class="text-slate-400 italic">Profil perusahaan belum diisi di menu pengaturan.</p>`;
        }
    } catch (err) {
        console.error("Gagal memuat Company Profile:", err);
        if (companyProfileContainer) {
            companyProfileContainer.innerHTML = `<p class="text-red-500">Gagal memuat data Company Profile.</p>`;
        }
    }

    // 3. Fungsi untuk merender slider banner dengan tombol klik zoom gambar
    function renderSliderView() {
        if (!bannerContainer) return;

        if (allBanners.length === 0) {
            bannerContainer.innerHTML = `<div class="col-span-full py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">Belum ada data banner aktif di database.</div>`;
            return;
        }

        const isMobile = window.innerWidth < 768;
        const itemsPerPage = isMobile ? 1 : 4;

        const visibleBanners = [];
        for (let i = 0; i < itemsPerPage; i++) {
            const index = (currentIndex + i) % allBanners.length;
            visibleBanners.push(allBanners[index]);
        }

        bannerContainer.innerHTML = visibleBanners.map(banner => `
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none overflow-hidden shadow-xs flex flex-col group transition hover:border-indigo-500">
                <div class="h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative cursor-pointer" onclick="openImageModal('${banner.image}')">
                    <img src="${banner.image}" alt="${banner.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                    <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span class="bg-black/60 text-white text-[10px] px-2 py-1 rounded">Klik untuk memperbesar</span>
                    </div>
                </div>
                <div class="p-3 bg-white dark:bg-slate-800">
                    <h3 class="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">${banner.title}</h3>
                </div>
            </div>
        `).join('');
    }

    // 4. Fungsi Auto Slide Otomatis
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            if (allBanners.length > 0) {
                currentIndex = (currentIndex + 1) % allBanners.length;
                renderSliderView();
            }
        }, 3500);
    }

    // 5. Ambil data banner aktif dari Firestore
    try {
        const qBanners = query(collection(db, "banners"), where("active", "==", true));
        const bannerSnap = await getDocs(qBanners);
        
        allBanners = [];
        bannerSnap.forEach((docSnap) => {
            allBanners.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderSliderView();
        startAutoSlide();
    } catch (err) {
        console.error("Gagal memuat banner dari Firestore:", err);
        if (bannerContainer) {
            bannerContainer.innerHTML = `<div class="col-span-full py-6 text-center text-xs text-red-500">Gagal memuat data banner dari database.</div>`;
        }
    }

    // 6. Ambil data Unit Usaha untuk Filter Produk di Beranda
    try {
        const unitSnap = await getDocs(collection(db, "unit_usaha"));
        if (unitFilterSelect) {
            unitSnap.forEach(docSnap => {
                const u = docSnap.data();
                const opt = document.createElement('option');
                opt.value = u.namaUnit;
                opt.textContent = u.namaUnit;
                unitFilterSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Gagal memuat unit usaha untuk filter beranda:", err);
    }

    // 7. Ambil data Produk Aktif dari Firestore
    async function fetchProductsHome() {
        try {
            const qProducts = query(collection(db, "products"), where("active", "==", true));
            const productSnap = await getDocs(qProducts);
            
            allProducts = [];
            productSnap.forEach((docSnap) => {
                allProducts.push({ id: docSnap.id, ...docSnap.data() });
            });

            renderProductGrid();
        } catch (err) {
            console.error("Gagal memuat produk dari Firestore:", err);
            if (productContainer) {
                productContainer.innerHTML = `<div class="col-span-full py-6 text-center text-xs text-red-500">Gagal memuat daftar produk.</div>`;
            }
        }
    }

    // 8. Render Grid Produk (Dilengkapi klik gambar untuk zoom)
    function renderProductGrid() {
        if (!productContainer) return;

        const selectedUnit = unitFilterSelect ? unitFilterSelect.value : "";
        const filtered = selectedUnit ? allProducts.filter(p => p.unit === selectedUnit) : allProducts;

        if (filtered.length === 0) {
            productContainer.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">Belum ada produk untuk unit ini.</div>`;
            return;
        }

        productContainer.innerHTML = filtered.map(product => {
            const hasDiscount = product.discount && product.discount !== "-";
            const discountBadge = hasDiscount 
                ? `<span class="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-sm">Disc ${product.discount}</span>` 
                : "";
            
            const unitBadge = product.unit 
                ? `<span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 truncate max-w-[120px]">${product.unit}</span>` 
                : "";

            const normalPriceHtml = hasDiscount 
                ? `<span class="text-[11px] text-slate-400 line-through">Rp ${product.price}</span>` 
                : "";
            
            const finalPriceDisplay = (product.finalPrice && product.finalPrice !== "-") 
                ? `Rp ${product.finalPrice}` 
                : `Rp ${product.price}`;

            return `
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none overflow-hidden shadow-xs flex flex-col group transition hover:border-indigo-500">
                    <!-- Foto Produk Rasio 4:5 dengan Fungsi Klik Membesar -->
                    <div class="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center cursor-pointer" onclick="openImageModal('${product.image}')">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                        ${discountBadge}
                        <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span class="bg-black/60 text-white text-[10px] px-2 py-1 rounded">Klik untuk memperbesar</span>
                        </div>
                    </div>
                    <!-- Informasi Produk -->
                    <div class="p-2.5 sm:p-3 bg-white dark:bg-slate-800 flex flex-col justify-between flex-1 space-y-2">
                        <div class="space-y-1">
                            <div class="flex items-start justify-between gap-1">
                                <h3 class="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">${product.name}</h3>
                            </div>
                            <div>${unitBadge}</div>
                        </div>
                        <div class="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col">
                            ${normalPriceHtml}
                            <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">${finalPriceDisplay}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (unitFilterSelect) {
        unitFilterSelect.addEventListener('change', () => {
            renderProductGrid();
        });
    }

    fetchProductsHome();

    // 9. Event Listeners Banner
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (allBanners.length === 0) return;
            currentIndex = (currentIndex - 1 + allBanners.length) % allBanners.length;
            renderSliderView();
            startAutoSlide(); 
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (allBanners.length === 0) return;
            currentIndex = (currentIndex + 1) % allBanners.length;
            renderSliderView();
            startAutoSlide();
        });
    }

    if (bannerContainer) {
        bannerContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        bannerContainer.addEventListener('mouseleave', () => startAutoSlide());
    }

    window.addEventListener('resize', () => {
        renderSliderView();
    });
}