import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

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

// Global Variables
let confirmationResult = null;

// UI Elements
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const userInfo = document.getElementById("user-info");
const phoneInput = document.getElementById("phone-number");
const otpInput = document.getElementById("otp-code");
const sendOtpBtn = document.getElementById("send-otp-btn");
const verifyOtpBtn = document.getElementById("verify-otp-btn");
const logoutBtn = document.getElementById("logout-btn");
const alertBox = document.getElementById("alert-message");
const navLoginLink = document.getElementById("nav-login-link");

// Email / Tab Elements
const tabPhone = document.getElementById("tab-phone");
const tabEmail = document.getElementById("tab-email");
const phoneSection = document.getElementById("phone-section");
const emailSection = document.getElementById("email-section");
const emailInput = document.getElementById("email-input");
const emailLoginBtn = document.getElementById("email-login-btn");
const authTabs = document.querySelector(".auth-tabs");

function showAlert(message, type = "error") {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = "alert-msg alert-" + type;
    alertBox.style.display = "block";
    setTimeout(() => { alertBox.style.display = "none"; }, 5000);
}

// Check Login State
onAuthStateChanged(auth, (user) => {
    window.isUserLoggedIn = !!user;
    
    if (navLoginLink) {
        navLoginLink.textContent = user ? "My Account" : "Login";
    }

    if (!step1) return; // Not on login page

    if (user) {
        // User is signed in
        step1.classList.add("hidden");
        step2.classList.add("hidden");
        if (emailSection) emailSection.classList.add("hidden");
        if (phoneSection) phoneSection.classList.add("hidden");
        if (authTabs) authTabs.style.display = "none";
        userInfo.classList.remove("hidden");
        document.getElementById("user-phone").textContent = "Logged in as: " + (user.email || user.phoneNumber || "User");
        
        // Clean up messy Firebase URL if we just logged in via magic link
        if (window.location.href.includes('apiKey=')) {
            window.history.replaceState({}, document.title, "/");
            window.location.href = "/"; // Redirect to home page
        }
    } else {
        // User is signed out
        userInfo.classList.add("hidden");
        if (authTabs) authTabs.style.display = "flex";
        // Reset to default tab (Phone)
        if (tabPhone) tabPhone.click();
        else {
            step1.classList.remove("hidden");
            step2.classList.add("hidden");
        }
    }
});

// Tab Toggling Logic
if (tabPhone && tabEmail) {
    tabPhone.addEventListener("click", () => {
        tabPhone.classList.add("active");
        tabPhone.style.borderBottomColor = "#0177c6";
        tabEmail.classList.remove("active");
        tabEmail.style.borderBottomColor = "transparent";
        phoneSection.classList.remove("hidden");
        emailSection.classList.add("hidden");
    });

    tabEmail.addEventListener("click", () => {
        tabEmail.classList.add("active");
        tabEmail.style.borderBottomColor = "#0177c6";
        tabPhone.classList.remove("active");
        tabPhone.style.borderBottomColor = "transparent";
        emailSection.classList.remove("hidden");
        phoneSection.classList.add("hidden");
    });
}

// Email Passwordless Login
if (emailLoginBtn) {
    // Check if user is returning from an email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                showAlert("Logged in successfully!", "success");
            })
            .catch((error) => {
                console.error(error);
                showAlert(error.message);
            });
    }

    emailLoginBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        if (!email) {
            showAlert("Please enter your email.");
            return;
        }

        const actionCodeSettings = {
            url: window.location.origin + '/login',
            handleCodeInApp: true
        };

        emailLoginBtn.disabled = true;
        emailLoginBtn.textContent = "Sending Link...";

        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                showAlert("Login link sent! Please check your email.", "success");
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

// Phone Auth Logic
if (sendOtpBtn) {
    // Initialize reCAPTCHA
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
            // reCAPTCHA solved
        }
    });

    sendOtpBtn.addEventListener("click", () => {
        const phoneNumber = phoneInput.value.trim();
        if (!phoneNumber || phoneNumber.length < 5) {
            showAlert("Please enter a valid phone number with country code.");
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending...";

        signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                step1.classList.add("hidden");
                step2.classList.remove("hidden");
                showAlert("OTP sent successfully!", "success");
            })
            .catch((error) => {
                console.error(error);
                showAlert(error.message);
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = "Send OTP";
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.render().then(function(widgetId) {
                        grecaptcha.reset(widgetId);
                    });
                }
            });
    });

    verifyOtpBtn.addEventListener("click", () => {
        const code = otpInput.value.trim();
        if (code.length !== 6) {
            showAlert("Please enter the 6-digit OTP.");
            return;
        }

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = "Verifying...";

        confirmationResult.confirm(code).then((result) => {
            showAlert("Logged in successfully!", "success");
        }).catch((error) => {
            console.error(error);
            showAlert("Invalid OTP. Please try again.");
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify & Login";
        });
    });

    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            showAlert("Logged out successfully!", "success");
        }).catch((error) => {
            showAlert("Error logging out.");
        });
    });
}
