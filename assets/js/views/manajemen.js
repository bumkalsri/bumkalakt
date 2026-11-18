// File: assets/js/views/manajemen.js

export function renderManajemen() {
    return `
        <div class="space-y-6 pb-10">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm">
                <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Pengaturan & Manajemen</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Pilih menu di bawah ini untuk membuka halaman pengelolaan.</p>
            </div>

            <!-- Grid Menu Manajemen (2 Kolom di HP, 4 Kolom di Desktop) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <!-- 1. Manajemen Pengaturan -->
                <div data-url="#/manajemen-pengaturan" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Pengaturan</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola parameter dan profil sistem</p>
                    </div>
                </div>

                <!-- 2. Manajemen Event -->
                <div data-url="#/manajemen-event" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Event</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola agenda kegiatan dan jadwal</p>
                    </div>
                </div>

                <!-- 3. Manajemen Produk -->
                <div data-url="#/manajemen-produk" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Produk</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola inventaris dan data produk</p>
                    </div>
                </div>

                <!-- 4. Manajemen Banner -->
                <div data-url="#/manajemen-banner" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Banner</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola gambar banner & slider utama</p>
                    </div>
                </div>

                <!-- 5. Manajemen Galeri -->
                <div data-url="#/manajemen-galeri" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Galeri</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tambah dan atur galeri foto kegiatan</p>
                    </div>
                </div>

                <!-- 6. Manajemen Text -->
                <div data-url="#/manajemen-text" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Text</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Kelola pengumuman & running text</p>
                    </div>
                </div>

                <!-- 7. Manajemen Monitoring -->
                <div data-url="#/manajemen-monitoring" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Manajemen Monitoring</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pengaturan dan rekap data monitoring</p>
                    </div>
                </div>

                <!-- 8. Reset Data -->
                <div data-url="#/manajemen-reset-data" class="management-card bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center text-center space-y-3 group">
                    <div class="w-12 h-12 rounded-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition border border-slate-100 dark:border-slate-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xs font-bold text-slate-800 dark:text-slate-100">Reset Data</h2>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Reset dan pembersihan database sistem</p>
                    </div>
                </div>

            </div>
        </div>
    `;
}

export function initManajemenHandler() {
    console.log("Halaman manajemen dimuat.");

    const cards = document.querySelectorAll('.management-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            if (url) {
                location.hash = url;
            }
        });
    });
}