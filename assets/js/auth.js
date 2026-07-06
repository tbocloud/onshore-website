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

// ─── Utility to handle loading states ──────────────────────────────────
function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (isLoading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ─── Auth State Observer ───────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    window.isUserLoggedIn = !!user;

    // Update global nav link if it exists on ANY page
    const globalNavLinks = document.querySelectorAll('a[href="login.html"]');
    globalNavLinks.forEach(link => {
        if (user) {
            link.innerHTML = '<i class="ri-user-smile-fill" style="margin-right: 5px;"></i> My Account';
            link.classList.add('logged-in-nav');
        } else {
            link.innerHTML = 'Login';
            link.classList.remove('logged-in-nav');
        }
    });

    if (user) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }

    if (!userInfo) return; // Not on login page

    if (user) {
        if (signInOptions) signInOptions.classList.add("hidden");
        userInfo.classList.remove("hidden");
        const displayName = user.displayName || user.email || user.phoneNumber || "User";
        document.getElementById("user-phone").textContent = displayName;

        // Clean up Firebase magic link URL params
        if (window.location.href.includes('apiKey=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
            // Smooth redirect after seeing success box
            setTimeout(() => { window.location.href = "/"; }, 2000);
        }
    } else {
        userInfo.classList.add("hidden");
        if (signInOptions) signInOptions.classList.remove("hidden");
    }
});

// ─── Google Sign-In ───────────────────────────────────────────────────
if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
        setLoading("google-signin-btn", true);

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
                setLoading("google-signin-btn", false);
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
        setLoading("email-login-btn", true);
        signInWithEmailLink(auth, email, window.location.href)
            .then(() => {
                window.localStorage.removeItem('emailForSignIn');
                setLoading("email-login-btn", false);
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

        setLoading("email-login-btn", true);

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
                setLoading("email-login-btn", false);
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
