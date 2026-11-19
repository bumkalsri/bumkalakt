// File: assets/js/views/tamu.js
import { getDocs, collection, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase-init.js";

export function renderTamu() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Pengguna / Tamu</h1>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5" id="tamu-info-count">Memuat informasi jumlah...</p>
                </div>
                <button id="btn-refresh-tamu" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs font-semibold transition flex items-center justify-center gap-2 self-start sm:self-auto rounded-none cursor-pointer shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Muat Ulang Data
                </button>
            </div>

            <!-- CONTAINER UTAMA (Card untuk HP, Tabel untuk Desktop) -->
            <div id="tamu-container">
                <div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Memuat data pengguna...</div>
            </div>
        </div>
    `;
}

export async function initTamuHandler() {
    const loadUsers = async () => {
        const container = document.getElementById('tamu-container');
        const infoCountEl = document.getElementById('tamu-info-count');
        if (!container) return;

        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            let usersList = [];
            
            for (const docSnap of querySnapshot.docs) {
                const data = docSnap.data();
                let role = data.role || 'Tamu';

                if (role === 'Staf' || !data.role) {
                    role = 'Tamu';
                    const userRef = doc(db, "users", docSnap.id);
                    await updateDoc(userRef, { role: 'Tamu' });
                }

                if (role === 'Tamu') {
                    usersList.push({ id: docSnap.id, ...data, role });
                }
            }

            if (usersList.length === 0) {
                container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">Tidak ada pengguna dengan role Tamu.</div>`;
                if (infoCountEl) infoCountEl.textContent = `Total: 0 pengguna (role Tamu).`;
                return;
            }

            if (infoCountEl) {
                infoCountEl.textContent = `Total: ${usersList.length} pengguna terdaftar dengan role Tamu.`;
            }

            // --- 1. TAMPILAN CARD KHUSUS HP ---
            let cardsHTML = `<div class="grid grid-cols-1 gap-3 sm:hidden">`;
            
            // --- 2. TAMPILAN TABEL UNTUK DESKTOP / TABLET ---
            let tableRowsHTML = `
                <div class="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs rounded-none">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                    <th class="p-3.5 w-12 text-center">No</th>
                                    <th class="p-3.5">Pengguna</th>
                                    <th class="p-3.5">Email</th>
                                    <th class="p-3.5">Role / Akses</th>
                                    <th class="p-3.5 text-center">Aksi / Ubah Role</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            `;

            usersList.forEach((data, index) => {
                const name = data.nama || 'Tanpa Nama';
                const email = data.email || '-';
                const uid = data.id;
                const photoURL = data.photoURL;
                const currentRole = data.role;

                // Generator Avatar yang aman: Cek apakah photoURL valid dan tidak kosong
                let avatarHTML = '';
                const initials = name.substring(0, 2).toUpperCase();

                if (photoURL && typeof photoURL === 'string' && photoURL.trim() !== "") {
                    avatarHTML = `<img src="${photoURL}" class="w-10 h-10 sm:w-8 sm:h-8 object-cover flex-shrink-0 rounded-full" alt="Avatar" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'w-10 h-10 sm:w-8 sm:h-8 bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 rounded-full\\'>${initials}</div>';">`;
                } else {
                    avatarHTML = `<div class="w-10 h-10 sm:w-8 sm:h-8 bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 rounded-full">${initials}</div>`;
                }

                // Render Card (HP)
                cardsHTML += `
                    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs rounded-none flex flex-col gap-3">
                        <div class="flex items-center gap-3">
                            ${avatarHTML}
                            <div class="overflow-hidden">
                                <h3 class="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">${name}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${email}</p>
                                <span class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">Role: ${currentRole}</span>
                            </div>
                        </div>
                        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div class="flex items-center gap-1.5">
                                <select id="role-select-card-${uid}" class="w-full p-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none rounded-none">
                                    <option value="Tamu" ${currentRole === 'Tamu' ? 'selected' : ''}>Tamu</option>
                                    <option value="Monitoring" ${currentRole === 'Monitoring' ? 'selected' : ''}>Monitoring</option>
                                    <option value="Kantor" ${currentRole === 'Kantor' ? 'selected' : ''}>Kantor</option>
                                    <option value="Administrator" ${currentRole === 'Administrator' ? 'selected' : ''}>Administrator</option>
                                </select>
                                <button onclick="window.updateUserRole('${uid}', document.getElementById('role-select-card-${uid}').value)" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer rounded-none">
                                    Simpan
                                </button>
                            </div>
                            <button onclick="window.deleteUser('${uid}')" class="w-full py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-semibold text-xs border border-red-200 dark:border-red-900 transition cursor-pointer rounded-none text-center">
                                Hapus Pengguna
                            </button>
                        </div>
                    </div>
                `;

                // Render Baris Tabel (Desktop)
                tableRowsHTML += `
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td class="p-3.5 text-center text-slate-500 dark:text-slate-400 font-medium">${index + 1}</td>
                        <td class="p-3.5">
                            <div class="flex items-center gap-3">
                                ${avatarHTML}
                                <span class="font-semibold text-slate-800 dark:text-slate-100">${name}</span>
                            </div>
                        </td>
                        <td class="p-3.5 text-slate-600 dark:text-slate-300">${email}</td>
                        <td class="p-3.5">
                            <span class="text-[11px] font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">${currentRole}</span>
                        </td>
                        <td class="p-3.5 text-center">
                            <div class="inline-flex items-center gap-2">
                                <select id="role-select-table-${uid}" class="p-1.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none rounded-none">
                                    <option value="Tamu" ${currentRole === 'Tamu' ? 'selected' : ''}>Tamu</option>
                                    <option value="Monitoring" ${currentRole === 'Monitoring' ? 'selected' : ''}>Monitoring</option>
                                    <option value="Kantor" ${currentRole === 'Kantor' ? 'selected' : ''}>Kantor</option>
                                    <option value="Administrator" ${currentRole === 'Administrator' ? 'selected' : ''}>Administrator</option>
                                </select>
                                <button onclick="window.updateUserRole('${uid}', document.getElementById('role-select-table-${uid}').value)" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition cursor-pointer rounded-none">
                                    Simpan Role
                                </button>
                                <button onclick="window.deleteUser('${uid}')" class="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-900 transition cursor-pointer rounded-none">
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            cardsHTML += `</div>`;
            tableRowsHTML += `</tbody></table></div></div>`;

            container.innerHTML = cardsHTML + tableRowsHTML;
        } catch (error) {
            console.error("Gagal memuat data pengguna:", error);
            container.innerHTML = `<div class="p-6 text-center text-red-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">Gagal memuat data dari database. Pastikan koneksi internet stabil.</div>`;
            if (infoCountEl) infoCountEl.textContent = `Gagal memuat data.`;
        }
    };

    window.updateUserRole = async (uid, newRole) => {
        if (!confirm(`Apakah Anda yakin ingin mengubah role pengguna ini menjadi "${newRole}"?`)) return;
        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, { role: newRole });
            alert(`Role pengguna berhasil diubah menjadi ${newRole}!`);
            loadUsers();
        } catch (err) {
            console.error("Gagal memperbarui role:", err);
            alert("Gagal memperbarui role pengguna.");
        }
    };

    window.deleteUser = async (uid) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data pengguna ini dari database?")) return;
        try {
            const userDocRef = doc(db, "users", uid);
            await deleteDoc(userDocRef);
            alert("Data pengguna berhasil dihapus!");
            loadUsers();
        } catch (err) {
            console.error("Gagal menghapus pengguna:", err);
            alert("Gagal menghapus pengguna dari database.");
        }
    };

    loadUsers();

    const refreshBtn = document.getElementById('btn-refresh-tamu');
    if (refreshBtn) {
        refreshBtn.onclick = () => {
            const container = document.getElementById('tamu-container');
            if (container) container.innerHTML = `<div class="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">Memuat ulang data...</div>`;
            loadUsers();
        };
    }
}