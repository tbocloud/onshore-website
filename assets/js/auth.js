import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAM4XYdn1PiUbeo1oRyjJLlb3vWC7fVXA8",
    authDomain: "onshore-live.firebaseapp.com",
    projectId: "onshore-live",
    storageBucket: "onshore-live.firebasestorage.app",
    messagingSenderId: "941086058745",
    appId: "1:941086058745:web:c4885dc345e6290d0e9a28",
    measurementId: "G-6VJJ3HTR5L"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// UI Elements
const userInfo = document.getElementById("user-info");
const signInOptions = document.getElementById("sign-in-options");
const alertBox = document.getElementById("alert-message");
const navLoginLink = document.getElementById("nav-login-link");
const logoutBtn = document.getElementById("logout-btn");
const googleSignInBtn = document.getElementById("google-signin-btn");
const emailInput = document.getElementById("email-input");
const emailLoginBtn = document.getElementById("email-login-btn");

function showAlert(message, type = "error") {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = "alert-msg alert-" + type;
    alertBox.style.display = "block";
    setTimeout(() => { alertBox.style.display = "none"; }, 6000);
}

// ─── Auth State Observer ───────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    window.isUserLoggedIn = !!user;

    if (navLoginLink) {
        navLoginLink.textContent = user ? "My Account" : "Login";
    }

    if (!userInfo) return; // Not on login page

    if (user) {
        if (signInOptions) signInOptions.classList.add("hidden");
        userInfo.classList.remove("hidden");
        const displayName = user.displayName || user.email || user.phoneNumber || "User";
        document.getElementById("user-phone").textContent = displayName;

        // Clean up Firebase magic link URL params
        if (window.location.href.includes('apiKey=')) {
            window.history.replaceState({}, document.title, "/");
            window.location.href = "/";
        }
    } else {
        userInfo.classList.add("hidden");
        if (signInOptions) signInOptions.classList.remove("hidden");
    }
});

// ─── Google Sign-In ───────────────────────────────────────────────────
if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
        googleSignInBtn.disabled = true;
        googleSignInBtn.textContent = "Signing in...";

        signInWithPopup(auth, googleProvider)
            .then((result) => {
                showAlert(`Welcome, ${result.user.displayName}! Redirecting...`, "success");
                setTimeout(() => { window.location.href = "/"; }, 1500);
            })
            .catch((error) => {
                console.error("Google Sign-In Error:", error);
                if (error.code === "auth/popup-closed-by-user") {
                    showAlert("Sign-in cancelled. Please try again.");
                } else if (error.code === "auth/unauthorized-domain") {
                    showAlert("This domain is not authorized in Firebase. Please contact support.");
                } else {
                    showAlert(error.message);
                }
                googleSignInBtn.disabled = false;
                googleSignInBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> Continue with Google`;
            });
    });
}

// ─── Email Magic Link ─────────────────────────────────────────────────
if (emailLoginBtn) {
    // Check if returning from email magic link
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please confirm your email address:');
        }
        signInWithEmailLink(auth, email, window.location.href)
            .then(() => {
                window.localStorage.removeItem('emailForSignIn');
                showAlert("Logged in successfully!", "success");
                window.history.replaceState({}, document.title, "/login.html");
            })
            .catch((error) => {
                console.error(error);
                showAlert(error.message);
            });
    }

    emailLoginBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
            showAlert("Please enter a valid email address.");
            return;
        }

        const actionCodeSettings = {
            url: window.location.origin + '/login.html',
            handleCodeInApp: true
        };

        emailLoginBtn.disabled = true;
        emailLoginBtn.textContent = "Sending Link...";

        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                showAlert("✅ Login link sent! Please check your inbox.", "success");
            })
            .catch((error) => {
                console.error(error);
                showAlert(error.message);
            })
            .finally(() => {
                emailLoginBtn.disabled = false;
                emailLoginBtn.textContent = "Send Login Link";
            });
    });
}

// ─── Logout ───────────────────────────────────────────────────────────
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            showAlert("Logged out successfully!", "success");
        }).catch(() => {
            showAlert("Error logging out.");
        });
    });
}
