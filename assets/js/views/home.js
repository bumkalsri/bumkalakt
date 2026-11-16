import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "../firebase-init.js";

export function renderHome() {
    return `
        <div class="space-y-6 pb-10 relative">
            
            <!-- Banner Utama Selamat Datang -->
            <div class="bg-indigo-900 dark:bg-indigo-950 text-white p-6 rounded-none shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-indigo-800 dark:border-indigo-900">
                <div class="space-y-1 z-10">
                    <span class="inline-block bg-indigo-700 dark:bg-indigo-900 text-indigo-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-none tracking-wide uppercase">SISTEM AKTIF</span>
                    <h1 class="text-2xl font-bold tracking-tight text-white" id="welcome-user-title">Selamat Datang! 👋</h1>
                </div>
                <div class="bg-indigo-800/80 dark:bg-indigo-900/80 border border-indigo-700 dark:border-indigo-800 text-indigo-100 text-xs px-3 py-1.5 rounded-none flex items-center gap-2 z-10">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Sistem Akuntansi & Operasional Aktif
                </div>
            </div>

            <!-- Area Beranda Bersih (Semua Card Utama Disembunyikan) -->
            <div class="bg-white dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <p class="text-xs text-slate-400 dark:text-slate-500">Silakan gunakan menu navigasi di samping atau bawah untuk mengakses fitur aplikasi.</p>
            </div>

        </div>
    `;
}

export async function initHomeHandler() {
    const welcomeTitle = document.getElementById('welcome-user-title');

    // Memuat nama user yang sedang login untuk ditampilkan di Banner Utama
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
}