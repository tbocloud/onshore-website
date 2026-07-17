import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

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

// Expose custom token sign-in for cart.js
window.signInWithFirebaseCustomToken = function(token) {
    return signInWithCustomToken(auth, token);
};

// ─── Modal Injection ──────────────────────────────────────────────────
function injectLoginModal() {
    if (document.getElementById('loginModalOverlay')) return; // already injected

    const modalHTML = `
    <div class="login-modal-overlay" id="loginModalOverlay">
        <div class="login-modal-content">
            <button class="login-modal-close" id="loginModalClose">&times;</button>
            <div class="login-modal-left">
                <div>
                    <h2>Login</h2>
                    <p>To get the item stock, please register your email.<br><span dir="rtl" style="font-size: 13px; font-weight: 500; display: block; margin-top: 5px; opacity: 0.9;">لمعرفة حالة المخزون، يرجى تسجيل بريدك الإلكتروني.</span></p>
                </div>
                <div class="login-modal-img">
                    <img src="assets/img/white-logo.png" style="width: 150px; opacity: 0.9;" alt="Onshore Logo">
                </div>
            </div>
            <div class="login-modal-right">
                <div id="modal-alert-message" style="display: none; padding: 10px; margin-bottom: 15px; border-radius: 4px; font-size: 13px; text-align: center; color: white;"></div>
                <div id="modal-sign-in-options">
                    <div class="form-group" style="position: relative;">
                        <input type="email" class="form-control" id="modal-email-input" placeholder="Enter Email Address">
                    </div>
                    <p style="font-size: 12px; color: #878787; margin-top: 20px;">By continuing, you agree to Onshore's <a href="#" style="color: #0177c6; text-decoration: none;">Terms of Use</a> and <a href="#" style="color: #0177c6; text-decoration: none;">Privacy Policy</a>.</p>
                    <button class="login-modal-btn" id="modal-email-login-btn">Request Login Link <span dir="rtl" style="font-size: 12px; margin-left: 5px; opacity: 0.9;">| طلب رابط الدخول</span></button>
                    
                    <div class="login-modal-divider">
                        <span>OR</span>
                    </div>

                    <button class="login-modal-google" id="modal-google-signin-btn">
                        <img src="https://www.google.com/favicon.ico" width="16" height="16">
                        Sign in with Google
                    </button>
                </div>
                <div id="modal-user-info" class="hidden" style="text-align: center;">
                    <h3 style="margin-bottom: 15px; font-weight: 600;">You are logged in!</h3>
                    <p id="modal-user-phone" style="font-weight: 700; color: #0177c6; margin-bottom: 25px;"></p>
                    <button class="login-modal-google" id="modal-logout-btn">Logout</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('loginModalOverlay');
    const closeBtn = document.getElementById('loginModalClose');

    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
}

// Inject Modal immediately
injectLoginModal();

// UI Elements
const userInfo = document.getElementById("modal-user-info");
const signInOptions = document.getElementById("modal-sign-in-options");
const alertBox = document.getElementById("modal-alert-message");
const logoutBtn = document.getElementById("modal-logout-btn");
const googleSignInBtn = document.getElementById("modal-google-signin-btn");
const emailInput = document.getElementById("modal-email-input");
const emailLoginBtn = document.getElementById("modal-email-login-btn");
const modalOverlay = document.getElementById("loginModalOverlay");

function showAlert(message, type = "error") {
    let globalAlert = document.getElementById("global-auth-toast");
    if (!globalAlert) {
        globalAlert = document.createElement("div");
        globalAlert.id = "global-auth-toast";
        globalAlert.style.position = "fixed";
        globalAlert.style.top = "20px";
        globalAlert.style.right = "20px";
        globalAlert.style.padding = "15px 20px";
        globalAlert.style.color = "#fff";
        globalAlert.style.borderRadius = "8px";
        globalAlert.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
        globalAlert.style.zIndex = "999999";
        globalAlert.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        globalAlert.style.opacity = "0";
        globalAlert.style.transform = "translateY(-10px)";
        globalAlert.style.pointerEvents = "none";
        globalAlert.style.fontWeight = "600";
        globalAlert.style.fontSize = "14px";
        document.body.appendChild(globalAlert);
    }
    
    globalAlert.textContent = message;
    globalAlert.style.backgroundColor = type === "success" ? "#10b981" : "#ef4444";
    globalAlert.style.opacity = "1";
    globalAlert.style.transform = "translateY(0)";
    
    setTimeout(() => { 
        globalAlert.style.opacity = "0"; 
        globalAlert.style.transform = "translateY(-10px)";
    }, 4000);
}

// ─── Utility to handle loading states ──────────────────────────────────
function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    if (isLoading) {
        btn.style.opacity = "0.7";
        btn.disabled = true;
    } else {
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}

// ─── Intercept Navigation Links ───────────────────────────────────────
document.addEventListener('click', (e) => {
    const loginLink = e.target.closest('a[href="login.html"]');
    if (loginLink) {
        e.preventDefault();
        if (window.isUserLoggedIn) {
            // If they are already logged in, show the profile view in the modal
            modalOverlay.classList.add('active');
        } else {
            // Show the login options
            modalOverlay.classList.add('active');
        }
    }
});

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
        // Hide global auth banner if present
        var banner = document.getElementById('global-auth-banner');
        if (banner) banner.remove();
        var bannerStyle = document.getElementById('banner-offset-style');
        if (bannerStyle) bannerStyle.remove();
    } else {
        document.body.classList.remove('user-logged-in');
    }

    if (user) {
        document.querySelectorAll('#modal-sign-in-options, #sign-in-options').forEach(el => { if(el) el.style.display = 'none'; });
        document.querySelectorAll('#modal-user-info, #authenticated-view').forEach(el => { if(el) el.style.display = 'block'; });
        
        const displayName = user.displayName || user.email || user.phoneNumber || "User";
        document.querySelectorAll("#modal-user-phone, #user-email-display").forEach(el => { if(el) el.textContent = displayName; });

        // Clean up Firebase magic link URL params
        if (window.location.href.includes('apiKey=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
            showAlert("Logged in successfully!", "success");
            setTimeout(() => { modalOverlay.classList.remove('active'); }, 1500);
        }

        // Update Quote Cart Modal if it's open
        const quoteAuthPrompt = document.getElementById('quote-auth-prompt');
        const quoteFormModal = document.getElementById('quote-form-modal');
        if (quoteAuthPrompt && quoteFormModal) {
            // Use jQuery since cart.js uses jQuery hide/show
            if (typeof $ !== 'undefined') {
                $('#quote-auth-prompt').hide();
                $('#quote-form-modal').show();
            } else {
                quoteAuthPrompt.style.display = 'none';
                quoteFormModal.style.display = 'block';
            }
        }
    } else {
        document.querySelectorAll('#modal-user-info, #authenticated-view').forEach(el => { if(el) el.style.display = 'none'; });
        document.querySelectorAll('#modal-sign-in-options, #sign-in-options').forEach(el => { if(el) el.style.display = 'block'; });
    }
});

// ─── Email Magic Link Landing ─────────────────────────────────────────
// Check if returning from email magic link
if (isSignInWithEmailLink(auth, window.location.href)) {
    modalOverlay.classList.add('active'); // auto open modal if returning from email link
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        email = window.prompt('Please confirm your email address:');
    }
    setLoading("modal-email-login-btn", true);
    signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            setLoading("modal-email-login-btn", false);
            showAlert("Logged in successfully!", "success");
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => { modalOverlay.classList.remove('active'); }, 1500);
            
            // If the user was trying to request a quote, submit it now!
            if (window.QuoteCart && typeof window.QuoteCart.submitPendingQuote === 'function') {
                window.QuoteCart.submitPendingQuote();
            }
        })
        .catch((error) => {
            console.error(error);
            showAlert(error.message);
        });
}

// ─── Global Event Delegation for Auth Buttons ─────────────────────────
document.addEventListener("click", (e) => {
    // Google Sign-In
    const googleBtn = e.target.closest("#modal-google-signin-btn") || e.target.closest("#cart-google-signin-btn") || e.target.closest("#google-signin-btn");
    if (googleBtn) {
        const btnId = googleBtn.id;
        setLoading(btnId, true);

        signInWithPopup(auth, googleProvider)
            .then((result) => {
                showAlert(`Welcome, ${result.user.displayName}!`, "success");
                setTimeout(() => { modalOverlay.classList.remove('active'); }, 1500);
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
                setLoading(btnId, false);
            });
    }

    // Email Magic Link
    const emailBtn = e.target.closest("#modal-email-login-btn") || e.target.closest("#cart-email-login-btn") || e.target.closest("#email-login-btn");
    if (emailBtn) {
        const btnId = emailBtn.id;
        let inputId = "modal-email-input";
        if (btnId === "cart-email-login-btn") inputId = "cart-email-input";
        if (btnId === "email-login-btn") inputId = "email-input";
        const emailInputEl = document.getElementById(inputId);
        const email = emailInputEl ? emailInputEl.value.trim() : "";

        if (!email || !email.includes('@')) {
            showAlert("Please enter a valid email address.");
            return;
        }

        setLoading(btnId, true);

        const formData = new FormData();
        formData.append('email', email);

        fetch('https://hydrotechglobal.ae/send-magic-link.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.localStorage.setItem('emailForSignIn', email);
                showAlert("✅ Login link sent! Please check your inbox.", "success");
            } else {
                throw new Error(data.message || 'Failed to send login link');
            }
        })
            .catch((error) => {
                console.error(error);
                if (error.code === 'auth/quota-exceeded') {
                    const inlineAlert = document.getElementById('modal-alert-message');
                    if (inlineAlert) {
                        inlineAlert.textContent = "Email login is temporarily unavailable due to high volume. For instant access, please Sign in with Google.";
                        inlineAlert.style.backgroundColor = "#fff3cd";
                        inlineAlert.style.color = "#856404";
                        inlineAlert.style.border = "1px solid #ffeeba";
                        inlineAlert.style.display = "block";
                    }
                    if (document.getElementById('modal-email-input')) {
                        document.getElementById('modal-email-input').closest('.form-group').style.display = 'none';
                        document.getElementById('modal-email-login-btn').style.display = 'none';
                        document.querySelector('.login-modal-divider').style.display = 'none';
                        document.getElementById('modal-email-login-btn').previousElementSibling.style.display = 'none';
                    }
                } else {
                    showAlert(error.message);
                }
            })
            .finally(() => {
                setLoading(btnId, false);
            });
    }
});

// ─── Logout ───────────────────────────────────────────────────────────
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            showAlert("Logged out successfully!", "success");
            setTimeout(() => { modalOverlay.classList.remove('active'); }, 1500);
        }).catch(() => {
            showAlert("Error logging out.");
        });
    });
}
