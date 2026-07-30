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

const API_BASE_URL = 'https://onshore.tbo365.cloud';

// Expose custom token sign-in for cart.js
window.signInWithFirebaseCustomToken = function (token) {
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
                <div id="modal-user-info" class="hidden" style="text-align: left; height: 100%; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h3 id="profile-title-text" style="font-weight: 600; font-size: 20px; color: #333; margin: 0;">Personal Information <span dir="rtl" style="font-size: 14px; color: #888; font-weight: 500; margin-left: 10px;">| المعلومات الشخصية</span></h3>
                        <div style="display: flex; gap: 15px;">
                            <button id="fullscreen-profile-btn" style="color: #666; background: none; border: none; font-size: 18px; cursor: pointer; display: flex; align-items: center;" title="Toggle Full Screen">
                                <i class="ri-fullscreen-line"></i>
                            </button>
                            <button id="edit-profile-btn" style="color: #0177c6; background: none; border: none; font-weight: 500; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                                <i class="ri-edit-box-line"></i> Edit
                            </button>
                        </div>
                    </div>
                    
                    <div id="profile-view-mode" style="flex: 1; overflow-y: auto; padding-right: 5px;">
                        <div class="row" style="margin: 0 -10px;">
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Name</label>
                                <div id="view-full-name" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Company Name</label>
                                <div id="view-company" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Company Email</label>
                                <div id="view-email" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Phone</label>
                                <div id="view-mobile" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">City</label>
                                <div id="view-city" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">City</label>
                                <div id="view-city" style="font-size: 14px; font-weight: 500; color: #333;">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <hr style="margin: 15px 0; border-color: #eee;">
                    <div style="display: flex; justify-content: flex-end;">
                        <button class="login-modal-google" id="modal-logout-btn" style="width: auto; padding: 8px 20px; font-size: 13px; background: #fff; border: 1px solid #ddd; border-radius: 4px; font-weight: 500; color: #555; display: flex; align-items: center; gap: 8px;">
                            <i class="ri-logout-box-r-line"></i> Logout
                        </button>
                    </div>
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
        if (link.id === 'tab-login-link') {
            if (user) {
                link.innerHTML = '<div class="tab-icon-box"><i class="ri-user-smile-fill"></i></div><span>Profile</span>';
                link.classList.add('logged-in-nav');
            } else {
                link.innerHTML = '<div class="tab-icon-box"><i class="ri-user-fill"></i></div><span>Login</span>';
                link.classList.remove('logged-in-nav');
            }
        } else {
            if (user) {
                link.innerHTML = '<i class="ri-user-smile-fill" style="margin-right: 5px;"></i> My Account';
                link.classList.add('logged-in-nav');
            } else {
                link.innerHTML = 'Login';
                link.classList.remove('logged-in-nav');
            }
        }
    });

    const profileTrigger = document.getElementById('nav-profile-trigger');
    if (user) {
        if (profileTrigger) profileTrigger.style.display = 'flex';
    } else {
        if (profileTrigger) profileTrigger.style.display = 'none';
    }

    if (user) {
        document.body.classList.add('user-logged-in');
        if (localStorage.getItem('user_approved_for_stock') === '1') {
            document.body.classList.add('user-approved-stock');
        }
        if (localStorage.getItem('user_approved_for_pricing') === '1') {
            document.body.classList.add('user-approved-pricing');
        }
        // Hide global auth banner if present
        var banner = document.getElementById('global-auth-banner');
        if (banner) banner.remove();
        var bannerStyle = document.getElementById('banner-offset-style');
        if (bannerStyle) bannerStyle.remove();
    } else {
        document.body.classList.remove('user-logged-in');
        document.body.classList.remove('user-approved-stock');
        document.body.classList.remove('user-approved-pricing');
        localStorage.removeItem('user_approved_for_stock');
        localStorage.removeItem('user_approved_for_pricing');
    }

    if (user) {
        document.querySelectorAll('#modal-sign-in-options, #sign-in-options').forEach(el => { if (el) el.style.display = 'none'; });
        document.querySelectorAll('#modal-user-info, #authenticated-view').forEach(el => { if (el) el.style.display = 'block'; });

        const displayName = user.displayName || user.email || user.phoneNumber || "User";
        document.querySelectorAll("#modal-user-phone, #user-email-display").forEach(el => { if (el) el.textContent = displayName; });

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
        
        // Sync with ERPNext and check if profile is complete (enforces modal on refresh if incomplete)
        syncFirebaseUserToFrappe(user);
        
        // Render Profile Dashboard
        renderProfileDashboard(user);
    } else {
        // Reset Left Sidebar to Login
        const leftSidebar = document.querySelector('.login-modal-left');
        if (leftSidebar) {
            leftSidebar.innerHTML = `
                <div>
                    <h2>Login</h2>
                    <p>To get the item stock, please register your email.<br><span dir="rtl" style="font-size: 13px; font-weight: 500; display: block; margin-top: 5px; opacity: 0.9;">لمعرفة حالة المخزون، يرجى تسجيل بريدك الإلكتروني.</span></p>
                </div>
                <div class="login-modal-img">
                    <img src="assets/img/white-logo.png" style="width: 150px; opacity: 0.9;" alt="Onshore Logo">
                </div>
            `;
        }
        document.querySelectorAll('#modal-user-info, #authenticated-view').forEach(el => { if (el) el.style.display = 'none'; });
        document.querySelectorAll('#modal-sign-in-options, #sign-in-options').forEach(el => { if (el) el.style.display = 'block'; });
    }
});

// ─── ERPNext Sync Helper ──────────────────────────────────────────────
function syncFirebaseUserToFrappe(user) {
    if (!user || !user.email) return Promise.resolve();
    return fetch(API_BASE_URL + '/api/method/onshore.api.login_or_register_customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: user.email,
            firebase_uid: user.uid,
            full_name: user.displayName || "User",
            phone: user.phoneNumber || ""
        })
    }).then(r => r.json()).then(data => {
        console.log("Synced to ERPNext", data);
        var res = data.message || data;
        if (res && res.approved_for_stock) {
            localStorage.setItem('user_approved_for_stock', '1');
            document.body.classList.add('user-approved-stock');
        } else {
            localStorage.removeItem('user_approved_for_stock');
            document.body.classList.remove('user-approved-stock');
        }
        if (res && res.approved_for_pricing) {
            localStorage.setItem('user_approved_for_pricing', '1');
            document.body.classList.add('user-approved-pricing');
        } else {
            localStorage.removeItem('user_approved_for_pricing');
            document.body.classList.remove('user-approved-pricing');
        }
        checkCustomerProfile(user.email);
    }).catch(e => console.error(e));
}

function checkCustomerProfile(email) {
    if (!email) return;
    fetch(API_BASE_URL + '/api/method/onshore.api.get_customer_profile?email=' + encodeURIComponent(email), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()).then(data => {
        if (data && data.message && data.message.success) {
            var profile = data.message.profile;
            // Check for missing fields (mandatory fields)
            if (!profile.customer_name || !profile.email_id || !profile.mobile_no) {
                if (!window.justVerifiedQuoteOTP) {
                    showCompleteRegistrationModal(profile, email);
                }
                window.justVerifiedQuoteOTP = false; // Reset for next time
            } else {
                // Save to local storage for quote cart
                var existingDetails = JSON.parse(localStorage.getItem('user_quote_details') || "{}");
                var userDetails = {
                    full_name: profile.customer_name || existingDetails.full_name,
                    email: profile.email_id || existingDetails.email,
                    mobile_number: profile.whatsapp_number || profile.mobile_no || existingDetails.mobile_number || (typeof auth !== 'undefined' && auth.currentUser ? auth.currentUser.phoneNumber : ""),
                    company_name: profile.custom_company_name || existingDetails.company_name,
                    country: "Saudi Arabia",
                    city: profile.custom_city_in_ksa || existingDetails.city,
                    area: profile.custom_area_in_ksa || existingDetails.area,
                    dob: profile.custom_date_of_birth || existingDetails.dob
                };
                localStorage.setItem('user_quote_details', JSON.stringify(userDetails));
                if (window.isUserLoggedIn) {
                    renderProfileDashboard(auth.currentUser);
                }
            }
        }
    }).catch(e => console.error(e));
}

function showCompleteRegistrationModal(profile, email) {
    if (document.getElementById('completeRegistrationModal')) {
        var myModal = bootstrap.Modal.getInstance(document.getElementById('completeRegistrationModal')) || new bootstrap.Modal(document.getElementById('completeRegistrationModal'));
        myModal.show();
        return;
    }
    
    let rawMobile = profile.whatsapp_number || profile.mobile_no || '';
    let currCountryCode = '966';
    let currMobileOnly = rawMobile;
    const countryCodes = ['966', '971', '974', '973', '965', '968'];
    for (let code of countryCodes) {
        if (rawMobile.startsWith(code) && rawMobile.length > code.length) {
            currCountryCode = code;
            currMobileOnly = rawMobile.substring(code.length);
            break;
        }
    }

    var modalHtml = `
    <div class="modal fade" id="completeRegistrationModal" tabindex="-1" aria-labelledby="completeRegistrationModalLabel" aria-hidden="true" style="z-index: 106000;">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 25px 30px 10px;">
            <h5 class="modal-title" id="completeRegistrationModalLabel" style="font-weight: 700; color: #333; font-family: 'Outfit', sans-serif;">COMPLETE YOUR PROFILE <span dir="rtl" style="font-size: 14px; color: #666; font-weight: 500; margin-left: 10px;">| أكمل ملفك الشخصي</span></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="padding: 15px 30px 30px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-weight: 700; color: #222; font-size: 14px;">ACCOUNT INFORMATION</span>
                      <span dir="rtl" style="font-size: 13px; color: #888; font-weight: 500;">معلومات الحساب</span>
                  </div>
                  <div style="font-size: 12px; color: #666; margin-top: 4px;">
                      Please provide the following details to complete your registration. You will only have to do this once.<br>
                      <span dir="rtl" style="display: inline-block; margin-top: 2px;">يرجى تقديم التفاصيل التالية لإكمال تسجيلك. لن تضطر للقيام بذلك مرة أخرى.</span>
                  </div>
              </div>
              <div style="color: #0177c6; font-size: 24px; opacity: 0.8;"><i class="ri-user-settings-line"></i></div>
            </div>
            <form id="completeRegistrationForm">
              <div class="row" style="margin: 0 -10px;">
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Name <span style="font-weight: normal; color: #777;">الاسم</span> *</label>
                      <input type="text" name="full_name" value="${profile.customer_name || ''}" required class="form-control" placeholder="Enter your name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Company Name <span style="font-weight: normal; color: #777;">اسم الشركة</span> <span style="color: #999;">[optional]</span></label>
                      <input type="text" name="company_name" value="${profile.custom_company_name || ''}" class="form-control" placeholder="Enter your company name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Company Email <span style="font-weight: normal; color: #777;">البريد الإلكتروني للشركة</span> *</label>
                      <input type="email" name="company_email" value="${profile.email_id || email || ''}" required class="form-control" placeholder="Enter your company email" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Phone <span style="font-weight: normal; color: #777;">رقم الجوال</span> *</label>
                      <div class="input-group" style="border-radius: 6px; overflow: hidden; border: 1px solid #ddd; display: flex;">
                          <select name="country_code" class="form-select" style="max-width: 180px; font-size: 13px; padding: 10px 12px; border: none; background-color: #f8f9fa; border-right: 1px solid #ddd;">
                              <option data-countryCode="SA" value="966" ${currCountryCode === '966' ? 'selected' : ''}>Saudi Arabia (+966)</option>
                              <option data-countryCode="AE" value="971" ${currCountryCode === '971' ? 'selected' : ''}>UAE (+971)</option>
                              <option data-countryCode="QA" value="974" ${currCountryCode === '974' ? 'selected' : ''}>Qatar (+974)</option>
                              <option data-countryCode="BH" value="973" ${currCountryCode === '973' ? 'selected' : ''}>Bahrain (+973)</option>
                              <option data-countryCode="KW" value="965" ${currCountryCode === '965' ? 'selected' : ''}>Kuwait (+965)</option>
                              <option data-countryCode="OM" value="968" ${currCountryCode === '968' ? 'selected' : ''}>Oman (+968)</option>
                          </select>
                          <input type="text" name="mobile_number" value="${currMobileOnly}" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">
                      </div>
                      <div id="profile-mobile-error" style="color: #dc3545; font-size: 12px; margin-top: 5px; display: none;"></div>
                  </div>
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">City <span style="font-weight: normal; color: #777;">المدينة</span> *</label>
                      <input type="text" name="city" value="${profile.custom_city_in_ksa || ''}" required class="form-control" placeholder="e.g. Riyadh, Dubai, Doha" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
                  <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Area <span style="font-weight: normal; color: #777;">المنطقة</span> <span style="color: #999;">[optional]</span></label>
                      <input type="text" name="area" value="${profile.custom_area_in_ksa || ''}" class="form-control" placeholder="e.g. Industrial Area" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
                  <div class="col-md-12" style="padding: 0 10px; margin-bottom: 15px;">
                      <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Designation <span style="font-weight: normal; color: #777;">المسمى الوظيفي</span> <span style="color: #999;">[optional]</span></label>
                      <input type="text" name="designation" value="${profile.designation || profile.custom_designation || ''}" class="form-control" placeholder="e.g. Purchase Manager" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                  </div>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
                  <button type="submit" class="btn btn-primary" style="background-color: #015bb5; border: none; padding: 10px 30px; font-weight: 600; font-size: 14px; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
                      Save Details <span dir="rtl" style="font-size: 12px; font-weight: 500;">/ حفظ البيانات</span>
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    var myModal = new bootstrap.Modal(document.getElementById('completeRegistrationModal'));
    myModal.show();
    
    document.getElementById('completeRegistrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Registration form submitted!");
        
        var formData = new FormData(this);
        var rawMobileNumber = (formData.get('mobile_number') || '').trim();
        var mobileNumber = rawMobileNumber.replace(/[\s-]/g, '');
        if (mobileNumber.startsWith('0')) {
            mobileNumber = mobileNumber.substring(1);
        }
        
        var countryCode = (formData.get('country_code') || '').trim();
        var mobileValid = true;
        var errorMsg = 'Please enter a correct mobile number.';
        
        if (countryCode === '971' || countryCode === '966') {
            if (!/^5\d{8}$/.test(mobileNumber)) {
                mobileValid = false;
                errorMsg = 'Please enter a valid 9-digit mobile number starting with 5 (e.g. 5X XXX XXXX).';
            }
        } else if (countryCode === '974') {
            if (!/^[3567]\d{7}$/.test(mobileNumber)) {
                mobileValid = false;
                errorMsg = 'For Qatar, please enter a valid 8-digit mobile number starting with 3, 5, 6, or 7.';
            }
        } else if (countryCode === '973') {
            if (!/^(33|34|35|36|37|38|39|66|77)\d{6}$/.test(mobileNumber)) {
                mobileValid = false;
                errorMsg = 'For Bahrain, please enter a valid 8-digit mobile number.';
            }
        } else if (countryCode === '965' || countryCode === '968') {
            if (!/^\d{8}$/.test(mobileNumber)) {
                mobileValid = false;
                errorMsg = 'Please enter a valid 8-digit mobile number.';
            }
        }
        
        var $errorDiv = $('#profile-mobile-error');
        $errorDiv.hide();
        
        if (!mobileValid) {
            $errorDiv.show().text(errorMsg);
            return;
        }
        
        var formData = new FormData(this);
        // Update the form data with the clean number
        formData.set('mobile_number', mobileNumber);
        
        var $btn = $(this).find('button[type="submit"]');
        $btn.text('Saving...').prop('disabled', true);
        
        try {
            var data = {
                customer_name: profile.name,
                email: formData.get('company_email') || email,
                full_name: formData.get('full_name'),
                company_name: formData.get('company_name'),
                mobile_number: formData.get('country_code') + formData.get('mobile_number'),
                whatsapp_number: formData.get('country_code') + formData.get('mobile_number'),
                city: formData.get('city'),
                area: formData.get('area') || '',
                designation: formData.get('designation') || '',
                dob: ''
            };
            
            // Save to local storage for quote cart
            var userDetails = {
                full_name: data.full_name,
                email: data.email,
                mobile_number: data.mobile_number,
                company_name: data.company_name,
                country: "Saudi Arabia",
                city: data.city,
                area: formData.get('area') || '',
                designation: formData.get('designation') || '',
                dob: ''
            };
            localStorage.setItem('user_quote_details', JSON.stringify(userDetails));
            console.log("Local storage updated", userDetails);
        } catch (e) {
            console.error("Error preparing data:", e);
            alert("Error preparing data: " + e.message);
            $btn.text('Save Details').prop('disabled', false);
            return;
        }
        
        fetch(API_BASE_URL + '/api/method/onshore.api.update_customer_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()).then(res => {
            if (res && res.message && res.message.success) {
                alert('Profile updated successfully!');
                var myModal = bootstrap.Modal.getInstance(document.getElementById('completeRegistrationModal'));
                if (myModal) myModal.hide();
                if (window.isUserLoggedIn && typeof renderProfileDashboard === 'function' && typeof auth !== 'undefined') {
                    try { renderProfileDashboard(auth.currentUser); } catch(e) { console.error("Error rendering dashboard:", e); }
                }
            } else {
                alert('Error saving details: ' + (res.message ? res.message.message : 'Unknown error'));
                $btn.text('Save Details').prop('disabled', false);
            }
        }).catch(err => {
            console.error(err);
            alert('Connection error');
            $btn.text('Save Details').prop('disabled', false);
        });
    });
}

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
        .then((result) => {
            syncFirebaseUserToFrappe(result.user);
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
                syncFirebaseUserToFrappe(result.user);
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
        formData.append('returnUrl', window.location.href);

        fetch(API_BASE_URL + '/api/method/onshore.api.send_magic_link', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                data = data.message || data; // Unwrap Frappe response
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
            try { 
                localStorage.removeItem('onshore_quote_cart'); 
                localStorage.removeItem('recently_viewed_products'); 
                localStorage.removeItem('user_quote_details'); 
            } catch(e) {}
            if (typeof QuoteCart !== 'undefined') { QuoteCart.init(); }
            showAlert("Logged out successfully!", "success");
            setTimeout(() => { modalOverlay.classList.remove('active'); }, 1500);
        }).catch(() => {
            showAlert("Error logging out.");
        });
    });
}

// ─── Render Profile Dashboard ──────────────────────────────────────────
function renderProfileDashboard(user) {
    if (!user) return;
    
    // 1. Update left sidebar to Flipkart style Profile Menu
    const leftSidebar = document.querySelector('.login-modal-left');
    if (leftSidebar) {
        const initial = (user.displayName || 'U').charAt(0).toUpperCase();
        const dispName = user.displayName || 'User';
        leftSidebar.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <div style="width: 50px; height: 50px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0177c6; font-size: 24px; font-weight: bold; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        ${initial}
                    </div>
                    <div>
                        <div style="font-size: 12px; opacity: 0.8;">Hello,</div>
                        <div style="font-size: 18px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${dispName}</div>
                    </div>
                </div>
                
                <div id="tab-profile-info" class="profile-tab active-tab" style="background: rgba(255,255,255,0.15); border-radius: 4px; padding: 12px 15px; margin-bottom: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.2s;">
                    <i class="ri-user-settings-line" style="font-size: 18px;"></i>
                    <span style="font-weight: 500;">Profile Information</span>
                </div>
                <div id="tab-manage-address" class="profile-tab" style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; opacity: 0.7; transition: opacity 0.2s;">
                    <i class="ri-map-pin-line" style="font-size: 18px;"></i>
                    <span style="font-weight: 500;">Manage Addresses</span>
                </div>
                <div id="tab-my-orders" class="profile-tab" style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 10px; opacity: 0.7; transition: opacity 0.2s;">
                    <i class="ri-shopping-bag-3-line" style="font-size: 18px;"></i>
                    <span style="font-weight: 500;">My Enquiries</span>
                </div>
                
                <div style="margin-top: auto; padding-top: 20px;">
                    <a href="contact.html" style="display: block; width: 100%; text-align: center; background: #fb641b; color: white; padding: 12px; border-radius: 6px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: background 0.3s;">
                        Contact Now <i class="ri-arrow-right-line"></i>
                    </a>
                </div>
            </div>
        `;
        
        // Add tab click listeners
        const tabs = document.querySelectorAll('.profile-tab');
        const viewMode = document.getElementById('profile-view-mode');
        const titleText = document.getElementById('profile-title-text');
        
        document.getElementById('tab-profile-info').addEventListener('click', function() {
            tabs.forEach(t => { t.style.background = 'transparent'; t.style.opacity = '0.7'; });
            this.style.background = 'rgba(255,255,255,0.15)';
            this.style.opacity = '1';
            if (titleText) titleText.innerHTML = 'Personal Information <span dir="rtl" style="font-size: 14px; color: #888; font-weight: 500; margin-left: 10px;">| المعلومات الشخصية</span>';
            const currentEditBtn = document.getElementById('edit-profile-btn');
            if (currentEditBtn) currentEditBtn.style.display = 'flex';
            if (viewMode) {
                // Restore profile view content
                const saved = localStorage.getItem('user_quote_details');
                if (saved) {
                    const details = JSON.parse(saved);
                    viewMode.innerHTML = `
                        <div class="row" style="margin: 0 -10px;">
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Name</label>
                                <div style="font-size: 14px; font-weight: 500; color: #333;">${details.full_name || '-'}</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Company Name</label>
                                <div style="font-size: 14px; font-weight: 500; color: #333;">${details.company_name || '-'}</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Company Email</label>
                                <div style="font-size: 14px; font-weight: 500; color: #333;">${details.email || user.email || '-'}</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">Mobile Number</label>
                                <div style="font-size: 14px; font-weight: 500; color: #333;">${details.mobile_number || user.phoneNumber || '-'}</div>
                            </div>
                            <div class="col-md-6" style="padding: 0 10px; margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: #878787; margin-bottom: 5px;">City</label>
                                <div style="font-size: 14px; font-weight: 500; color: #333;">${details.city || '-'}</div>
                            </div>
                        </div>
                    `;
                }
            }
        });
        
        document.getElementById('tab-manage-address').addEventListener('click', function() {
            tabs.forEach(t => { t.style.background = 'transparent'; t.style.opacity = '0.7'; });
            this.style.background = 'rgba(255,255,255,0.15)';
            this.style.opacity = '1';
            if (titleText) titleText.innerHTML = 'Manage Addresses';
            const currentEditBtn = document.getElementById('edit-profile-btn');
            if (currentEditBtn) currentEditBtn.style.display = 'none';
            if (viewMode) {
                renderAddressBook(viewMode, user.email);
            }
        });
        
        function renderAddressBook(viewMode, email) {
            viewMode.innerHTML = `<div style="text-align:center; padding: 40px;"><div class="spinner-border text-primary" role="status"></div><div style="margin-top:10px; color:#666;">Loading Addresses...</div></div>`;
            
            fetch(API_BASE_URL + '/api/method/onshore.api.get_customer_addresses?email=' + encodeURIComponent(email))
                .then(r => r.json())
                .then(res => {
                    var addrs = (res.message || res) || [];
                    if (!Array.isArray(addrs)) addrs = [];
                    
                    let html = '<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">';
                    
                    if (addrs.length === 0) {
                        html += `
                            <div style="text-align: center; padding: 40px 20px;">
                                <i class="ri-map-pin-line" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                                <h4 style="font-size: 16px; color: #333; font-weight: 600;">No addresses found</h4>
                                <p style="font-size: 13px; color: #888;">Add a new address to use during checkout.</p>
                            </div>
                        `;
                    } else {
                        addrs.forEach(addr => {
                            let fullAddr = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country].filter(Boolean).join(', ');
                            html += `
                                <div style="border: 1px solid ${addr.is_primary_address ? '#0177c6' : '#e0e0e0'}; border-radius: 6px; padding: 15px; margin-bottom: 15px; position: relative;">
                                    ${addr.is_primary_address ? '<span style="background: #e6f2fa; color: #0177c6; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-bottom: 10px; display: inline-block;"><i class="ri-check-line"></i> DEFAULT ADDRESS</span>' : ''}
                                    <div style="font-weight: 600; font-size: 14px; color: #333; margin-bottom: 5px;">${addr.city || 'Address'}</div>
                                    <div style="font-size: 13px; color: #666; line-height: 1.5; padding-right: 20px;">${fullAddr}</div>
                                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                                        <button class="btn-edit-addr" data-name="${addr.name}" style="background: none; border: none; color: #0177c6; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0;">Edit</button>
                                        ${!addr.is_primary_address ? `<button class="btn-del-addr" data-name="${addr.name}" style="background: none; border: none; color: #dc3545; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0;">Delete</button>` : ''}
                                    </div>
                                </div>
                            `;
                        });
                    }
                    
                    html += `
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="btn" id="add-new-address-btn" style="background: #fff; border: 1px solid #0177c6; color: #0177c6; font-weight: 600; padding: 8px 20px; border-radius: 4px;">+ Add New Address</button>
                        </div>
                    `;
                    
                    viewMode.innerHTML = html;
                    
                    document.getElementById('add-new-address-btn').addEventListener('click', function() {
                        showAddressModal(email);
                    });
                    
                    document.querySelectorAll('.btn-edit-addr').forEach(btn => {
                        btn.addEventListener('click', function() {
                            let addrName = this.getAttribute('data-name');
                            let addrObj = addrs.find(a => a.name === addrName);
                            showAddressModal(email, addrObj);
                        });
                    });
                    
                    document.querySelectorAll('.btn-del-addr').forEach(btn => {
                        btn.addEventListener('click', function() {
                            let addrName = this.getAttribute('data-name');
                            if (confirm('Are you sure you want to delete this address?')) {
                                this.innerHTML = 'Deleting...';
                                fetch(API_BASE_URL + '/api/method/onshore.api.delete_customer_address', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    body: new URLSearchParams({ email: email, address_name: addrName })
                                })
                                .then(r => r.json())
                                .then(d => {
                                    renderAddressBook(viewMode, email);
                                })
                                .catch(e => {
                                    alert('Failed to delete address.');
                                    this.innerHTML = 'Delete';
                                });
                            }
                        });
                    });
                })
                .catch(err => {
                    viewMode.innerHTML = `<div style="text-align: center; color: red;">Failed to load addresses.</div>`;
                });
        }
    
        function showAddressModal(email, addrObj = null) {
            let modalId = 'addressModal';
            let $modal = document.getElementById(modalId);
            if ($modal) {
                $modal.remove();
            }
            
            let title = addrObj ? 'Edit Address' : 'Add New Address';
            let line1 = addrObj ? (addrObj.address_line1 || '') : '';
            let line2 = addrObj ? (addrObj.address_line2 || '') : '';
            let city = addrObj ? (addrObj.city || '') : '';
            let country = addrObj ? (addrObj.country || 'Saudi Arabia') : 'Saudi Arabia';
            let isPrim = addrObj ? addrObj.is_primary_address : 0;
            let addrName = addrObj ? addrObj.name : '';
            
            let modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" style="z-index: 106005;">
                    <div class="modal-dialog modal-dialog-centered" style="z-index: 106006;">
                        <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                            <div class="modal-header" style="border-bottom: 1px solid #eee; padding: 20px 25px;">
                                <h5 class="modal-title" style="font-weight: 700; color: #222;">${title}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body" style="padding: 25px;">
                                <form id="addressForm">
                                    <input type="hidden" id="addr_name" value="${addrName}">
                                    <div class="mb-3">
                                        <label class="form-label" style="font-size: 13px; font-weight: 600; color: #444;">Address Line 1 (Area) *</label>
                                        <input type="text" class="form-control" id="addr_line1" value="${line1}" required style="border-radius: 6px; font-size: 13px;">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label" style="font-size: 13px; font-weight: 600; color: #444;">Address Line 2</label>
                                        <input type="text" class="form-control" id="addr_line2" value="${line2}" style="border-radius: 6px; font-size: 13px;">
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label" style="font-size: 13px; font-weight: 600; color: #444;">City *</label>
                                            <input type="text" class="form-control" id="addr_city" value="${city}" required style="border-radius: 6px; font-size: 13px;">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label" style="font-size: 13px; font-weight: 600; color: #444;">Country *</label>
                                            <select class="form-control" id="addr_country" required style="border-radius: 6px; font-size: 13px;">
                                                <option value="">Select Country</option>
                                                ${[
                                                    "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman"
                                                ].map(c => `<option value="${c}" ${country === c ? 'selected' : ''}>${c}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="mb-3 form-check">
                                        <input type="checkbox" class="form-check-input" id="addr_is_primary" ${isPrim ? 'checked' : ''}>
                                        <label class="form-check-label" for="addr_is_primary" style="font-size: 13px; color: #444;">Set as Default Address</label>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100" style="background: #015bb5; border: none; font-weight: 600; padding: 12px; border-radius: 6px;">Save Address</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            let modalInstance = new bootstrap.Modal(document.getElementById(modalId));
            modalInstance.show();
            
            // Ensure this modal's backdrop has a high z-index to cover the profile modal
            setTimeout(() => {
                let backdrops = document.querySelectorAll('.modal-backdrop');
                if(backdrops.length > 1) {
                    backdrops[backdrops.length - 1].style.zIndex = '106004';
                }
            }, 150);
            
            document.getElementById('addressForm').addEventListener('submit', function(e) {
                e.preventDefault();
                let submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
                submitBtn.disabled = true;
                
                let data = new URLSearchParams({
                    email: email,
                    address_line1: document.getElementById('addr_line1').value,
                    address_line2: document.getElementById('addr_line2').value,
                    city: document.getElementById('addr_city').value,
                    country: document.getElementById('addr_country').value,
                    is_primary_address: document.getElementById('addr_is_primary').checked ? 1 : 0
                });
                if (document.getElementById('addr_name').value) {
                    data.append('address_name', document.getElementById('addr_name').value);
                }
                
                fetch(API_BASE_URL + '/api/method/onshore.api.save_customer_address', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data
                })
                .then(r => r.json())
                .then(res => {
                    modalInstance.hide();
                    let viewMode = document.getElementById('profile-view-mode');
                    if (viewMode) {
                        renderAddressBook(viewMode, email);
                    }
                    // Also trigger a profile refresh so the new primary address is loaded to localStorage
                    fetch(API_BASE_URL + '/api/method/onshore.api.get_customer_profile?email=' + encodeURIComponent(email))
                        .then(r => r.json())
                        .then(pr => {
                            if (pr.message && pr.message.success) {
                                let profile = pr.message.profile;
                                let userDetails = {
                                    full_name: profile.customer_name,
                                    email: profile.email_id,
                                    mobile_number: profile.mobile_no,
                                    company_name: profile.custom_company_name,
                                    city: profile.custom_city_in_ksa,
                                    area: profile.custom_area_in_ksa,
                                    dob: profile.custom_date_of_birth
                                };
                                localStorage.setItem('user_quote_details', JSON.stringify(userDetails));
                            }
                        });
                })
                .catch(err => {
                    alert('Error saving address');
                    submitBtn.innerHTML = 'Save Address';
                    submitBtn.disabled = false;
                });
            });
        }
    
        document.getElementById('tab-my-orders').addEventListener('click', function() {
            tabs.forEach(t => { t.style.background = 'transparent'; t.style.opacity = '0.7'; });
            this.style.background = 'rgba(255,255,255,0.15)';
            this.style.opacity = '1';
            if (titleText) titleText.innerHTML = 'My Enquiries';
            const currentEditBtn = document.getElementById('edit-profile-btn');
            if (currentEditBtn) currentEditBtn.style.display = 'none';
            if (viewMode) {
                viewMode.innerHTML = `<div style="text-align:center; padding: 40px;"><div class="spinner-border text-primary" role="status"></div><div style="margin-top:10px; color:#666;">Loading Orders...</div></div>`;
                
                fetch(API_BASE_URL + '/api/method/onshore.api.get_customer_quotes?email=' + encodeURIComponent(user.email))
                .then(r => r.json())
                .then(res => {
                    var data = res.message || res;
                    if (data && data.success && data.quotes && data.quotes.length > 0) {
                        var html = '<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">';
                        data.quotes.forEach(q => {
                            var dateStr = new Date(q.creation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            html += `
                                <div style="border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fff;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px;">
                                        <div>
                                            <span style="font-weight: 700; color: #333; font-size: 14px;">${q.name}</span>
                                            <span style="font-size: 12px; color: #888; margin-left: 10px;">${dateStr}</span>
                                        </div>
                                        <span style="background: #e6f4ea; color: #137333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">Submitted</span>
                                    </div>
                                    <div>
                            `;
                            if (q.items && q.items.length > 0) {
                                q.items.forEach(item => {
                                    html += `
                                        <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 6px;">
                                            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px;">${item.item_name}</span>
                                            <span style="font-weight: 600;">Qty: ${item.qty}</span>
                                        </div>
                                    `;
                                });
                            } else {
                                html += `<div style="font-size: 13px; color: #888;">No items found.</div>`;
                            }
                            html += `</div></div>`;
                        });
                        html += '</div>';
                        viewMode.innerHTML = html;
                    } else {
                        viewMode.innerHTML = `
                            <div style="text-align: center; padding: 40px 20px;">
                                <i class="ri-shopping-bag-line" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                                <h4 style="font-size: 16px; color: #333; font-weight: 600;">No orders yet</h4>
                                <p style="font-size: 13px; color: #888;">You haven't placed any orders or requested quotes online yet.</p>
                            </div>
                        `;
                    }
                })
                .catch(err => {
                    console.error('Error fetching quotes:', err);
                    viewMode.innerHTML = `
                        <div style="text-align: center; padding: 40px 20px; color: #dc3545;">
                            <i class="ri-error-warning-line" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <p style="font-size: 14px;">Failed to load orders. Please try again later.</p>
                        </div>
                    `;
                });
            }
        });
    }
    
    // 2. Populate right pane details from localStorage
    const saved = localStorage.getItem('user_quote_details');
    if (saved) {
        try {
            const details = JSON.parse(saved);
            if(document.getElementById('view-full-name')) document.getElementById('view-full-name').textContent = details.full_name || '-';
            if(document.getElementById('view-email')) document.getElementById('view-email').textContent = details.email || user.email || '-';
            if(document.getElementById('view-mobile')) document.getElementById('view-mobile').textContent = details.mobile_number || user.phoneNumber || '-';
            if(document.getElementById('view-company')) document.getElementById('view-company').textContent = details.company_name || '-';
            if(document.getElementById('view-city')) document.getElementById('view-city').textContent = details.city || '-';
            if(document.getElementById('view-area')) document.getElementById('view-area').textContent = details.area || '-';
            if(document.getElementById('view-dob')) document.getElementById('view-dob').textContent = details.dob || '-';
            
            
            // Set up Edit button to trigger the Complete Registration Modal
            const editBtn = document.getElementById('edit-profile-btn');
            if (editBtn) {
                const profileObj = {
                    customer_name: details.full_name,
                    email_id: details.email || user.email,
                    mobile_no: details.mobile_number,
                    custom_company_name: details.company_name,
                    custom_city_in_ksa: details.city,
                    custom_area_in_ksa: details.area,
                    custom_date_of_birth: details.dob
                };
                
                const newEditBtn = editBtn.cloneNode(true);
                editBtn.parentNode.replaceChild(newEditBtn, editBtn);
                
                newEditBtn.addEventListener('click', () => {
                    const overlay = document.getElementById('loginModalOverlay');
                    if (overlay) overlay.classList.remove('active');
                    const existingModal = document.getElementById('completeRegistrationModal');
                    if (existingModal) existingModal.remove();
                    showCompleteRegistrationModal(profileObj, user.email);
                });
            }
            
            // Set up Fullscreen Toggle
            const fsBtn = document.getElementById('fullscreen-profile-btn');
            if (fsBtn) {
                const newFsBtn = fsBtn.cloneNode(true);
                fsBtn.parentNode.replaceChild(newFsBtn, fsBtn);
                newFsBtn.addEventListener('click', () => {
                    const content = document.querySelector('.login-modal-content');
                    if (content.style.width === '100vw') {
                        // Revert
                        content.style.width = '750px';
                        content.style.height = '500px';
                        content.style.borderRadius = '4px';
                        newFsBtn.innerHTML = '<i class="ri-fullscreen-line"></i>';
                    } else {
                        // Fullscreen
                        content.style.width = '100vw';
                        content.style.height = '100vh';
                        content.style.borderRadius = '0';
                        newFsBtn.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
                    }
                });
            }
            
            // Auto click profile info to initialize views properly if empty
            if (document.getElementById('view-full-name').textContent === '-') {
                const tab1 = document.getElementById('tab-profile-info');
                if(tab1) tab1.click();
            }
        } catch (e) {
            console.error("Error parsing user details", e);
        }
    } else {
        // If not in local storage yet, use user defaults
        if(document.getElementById('view-full-name')) document.getElementById('view-full-name').textContent = user.displayName || '-';
        if(document.getElementById('view-email')) document.getElementById('view-email').textContent = user.email || '-';
        if(document.getElementById('view-mobile')) document.getElementById('view-mobile').textContent = user.phoneNumber || '-';
    }
}

// ─── Navbar Profile Trigger ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const profileTrigger = document.getElementById('nav-profile-trigger');
    if (profileTrigger) {
        profileTrigger.addEventListener('click', () => {
            const overlay = document.getElementById('loginModalOverlay');
            if (overlay) overlay.classList.add('active');
        });
    }
});
