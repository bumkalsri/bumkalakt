// File: assets/js/views/manajemen-laporan-tanggung-jawab.js

export function renderManajemenLaporanTanggungJawab() {
    return `
        <div class="space-y-6 pb-10 max-w-7xl mx-auto">
            <!-- Header Halaman -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex items-center gap-3">
                    <a href="#/manajemen" data-link title="Kembali ke Manajemen" class="w-9 h-9 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center rounded-none transition flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </a>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h1 class="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Laporan Pertanggung Jawaban</h1>
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-none">Pengembangan</span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pengelolaan arsip, rekapitulasi, dan penyusunan Laporan Pertanggung Jawaban (LPJ) BUMKal.</p>
                    </div>
                </div>
            </div>

            <!-- Panel Status Pengembangan -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 flex items-center justify-center rounded-none flex-shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Modul Dalam Tahap Pengembangan</h2>
                            <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                Fitur penyusunan dan pengelolaan Laporan Pertanggung Jawaban sedang disiapkan agar terintegrasi dengan data periode dan unit usaha BUMKal.
                            </p>
                        </div>
                    </div>
                    <a href="#/manajemen" data-link class="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-none transition whitespace-nowrap">
                        Kembali ke Menu Manajemen
                    </a>
                </div>

                <!-- Rencana Fitur -->
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Rencana Fitur Pengembangan</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-1.5">
                            <div class="font-bold text-slate-800 dark:text-slate-100">1. Rekap LPJ per Unit Usaha</div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Ringkasan pertanggungjawaban untuk Kantor Pusat, Agrowisata, Kompos, dan Greenhouse berdasarkan periode.
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-1.5">
                            <div class="font-bold text-slate-800 dark:text-slate-100">2. Evaluasi Realisasi &amp; Catatan</div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Pencatatan capaian kegiatan, kendala operasional di lapangan, serta tindak lanjut pengawasan.
                            </p>
                        </div>
                        <div class="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none space-y-1.5">
                            <div class="font-bold text-slate-800 dark:text-slate-100">3. Dokumen &amp; Cetak LPJ</div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                Penyajian format laporan terstruktur untuk keperluan pelaporan bulanan, semesteran, maupun tahunan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initManajemenLaporanTanggungJawabHandler() {
    console.log("Halaman manajemen laporan pertanggung jawaban (pengembangan) dimuat.");
}