import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function initLogin() {
    const formLogin = document.getElementById('form-login');
    const errorBox = document.getElementById('login-error');
    const btnSubmit = document.getElementById('btn-submit-login');

    if (formLogin && !formLogin.dataset.initialized) {
        formLogin.dataset.initialized = "true"; // Mencegah double listener
        
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (errorBox) errorBox.classList.add('hidden');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Memproses...";
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // Jika sukses, router akan otomatis menangani perpindahan ke dashboard
                window.location.hash = '#dashboard';
            } catch (error) {
                console.error("Login Error:", error.code);
                if (errorBox) {
                    errorBox.textContent = "Gagal Masuk: " + (error.code === 'auth/invalid-credential' ? 'Email atau password salah.' : error.message);
                    errorBox.classList.remove('hidden');
                }
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Masuk ke Aplikasi";
                }
            }
        });
    }
}