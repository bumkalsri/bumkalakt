import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDoc, setDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "../firebase-init.js";

export function renderLogin() {
    return `
        <div class="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            <!-- Wallpaper Full Layar -->
            <img src="assets/icons/wallpaper.jpeg" alt="Wallpaper Login" class="absolute inset-0 w-full h-full object-cover z-0">

            <!-- Efek Overlay Gelap Tipis -->
            <div class="absolute inset-0 bg-black/40 z-0"></div>

            <!-- Card Kotak Login Melebar / Full -->
            <div class="relative z-10 w-full max-w-xl bg-white/70 backdrop-blur-md rounded-none border border-white/40 p-10 shadow-2xl text-center space-y-6">
                <!-- Logo & Judul -->
                <div class="space-y-2">
                    <div class="inline-flex border border-slate-200 rounded-none p-3 bg-white/90 shadow-xs mb-2">
                        <img src="assets/icons/maga.png" alt="Maga Logo" class="h-10 object-contain">
                    </div>
                    <h1 class="text-2xl font-bold text-slate-800">LOGIN</h1>
                    <p class="text-sm text-slate-600 font-medium">Silakan masuk menggunakan akun Google Anda.</p>
                </div>

                <!-- Error Box -->
                <div id="error-msg" class="hidden p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-none text-left"></div>

                <!-- Tombol Google Login -->
                <div class="pt-2">
                    <button id="btn-google" class="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-none border border-slate-300 bg-white/90 hover:bg-white transition text-slate-700 font-medium text-base shadow-sm focus:outline-none">
                        <svg class="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Masuk dengan Google
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function initLoginHandler() {
    const btnGoogle = document.getElementById('btn-google');
    const errorBox = document.getElementById('error-msg');

    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            if (errorBox) errorBox.classList.add('hidden');

            try {
                // 🔥 BERSIHKAN TOTAL SESSION & LOCALSTORAGE SEBELUM LOGIN AKUN BARU
                localStorage.clear();
                sessionStorage.clear();

                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                let userData;
                let currentPhoto = user.photoURL || "";
                let currentName = user.displayName || user.email.split('@')[0];

                if (!userDocSnap.exists()) {
                    currentName = currentName.charAt(0).toUpperCase() + currentName.slice(1);

                    userData = {
                        uid: user.uid,
                        email: user.email,
                        nama: currentName,
                        photoURL: currentPhoto,
                        role: "admin", 
                        createdAt: new Date().toISOString()
                    };

                    await setDoc(userDocRef, userData);
                } else {
                    userData = userDocSnap.data();
                    
                    // 🔥 UPDATE PHOTO & NAMA TERBARU DARI GOOGLE KE FIRESTORE
                    await updateDoc(userDocRef, {
                        photoURL: currentPhoto,
                        nama: userData.nama || currentName
                    });
                    userData.photoURL = currentPhoto;
                }

                // 📌 SIMPAN KE LOCALSTORAGE AGAR SELALU VALID & ANTI-KEDIP
                localStorage.setItem('user_name', userData.nama || currentName);
                localStorage.setItem('user_email', userData.email);
                localStorage.setItem('user_role', userData.role || 'admin');
                localStorage.setItem('user_avatar', userData.photoURL);
                
                // Buat inisial otomatis
                const nameParts = (userData.nama || currentName).split(' ');
                const initials = nameParts.length > 1 
                    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
                    : nameParts[0].substring(0, 2).toUpperCase();
                localStorage.setItem('user_initial', initials);

                location.hash = '#/';
                location.reload();
            } catch (error) {
                console.error("Gagal Login Google:", error);
                if (errorBox) {
                    errorBox.textContent = `Gagal Login Google: ${error.message}`;
                    errorBox.classList.remove('hidden');
                }
            }
        });
    }
}