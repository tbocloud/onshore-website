
// --- TOP BANNER INJECTION ---
$(document).ready(function () {
    if ($('#global-auth-banner').length === 0 && !window.isUserLoggedIn) {
        var bannerHtml = `
        <div id="global-auth-banner" style="background: #015bb5; color: white; text-align: center; padding: 10px 15px; font-size: 14px; font-family: 'Outfit', sans-serif; z-index: 999; position: relative;">
            <span style="font-weight: 500;">🔔 Register an account to view live stock availability and access exclusive pricing!</span>
            <a href="login.html" style="color: #f1c40f; font-weight: 700; text-decoration: underline; margin-left: 10px;">Login / Register Here</a>
        </div>
        `;
        $('body').prepend(bannerHtml);

        // Fix alignment: Push the absolute navigation header down ONLY when at the top (not scrolled)
        setTimeout(function () {
            var bannerHeight = $('#global-auth-banner').outerHeight();
            var dynamicStyle = '<style id="banner-offset-style">nav:not(.header-scrolled) { top: ' + bannerHeight + 'px !important; } nav.header-scrolled { top: 0 !important; }</style>';
            $('head').append(dynamicStyle);
            // Remove the hardcoded inline style from the previous version
            $('nav').css('top', '');
        }, 50);
    }
});
// -----------------------------

/**
 * Quote Cart Logic for Onshore Technical Supplies
 * Handles adding/removing items to a quote basket using localStorage.
 */

var QuoteCart = (function ($) {
    "use strict";

    var STORAGE_KEY = 'onshore_quote_cart';
    var API_BASE_URL = 'https://onshore.tbo365.cloud';
    var REQUEST_QUOTE_URL = API_BASE_URL + '/api/method/onshore.api.create_request_quote';
    var REQUEST_QUOTE_AUTH = 'token9897e6ee3838b6c:06d7193075244d6';
    var cart = [];
    var eventsBound = false;
    function init() {
        injectCartSidebar();
        loadCart();
        // Cleanup legacy 'undefined' strings from previous cache
        cart.forEach(function (item) {
            if (item.brand === 'undefined') item.brand = '';
        });
        updateCartCount();
        checkAbandonedCart();
        bindEvents();
        autoDetectCountry();
    }

    function autoDetectCountry() {
        try {
            var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            var countryMap = {
                'Riyadh': 'Saudi Arabia', 'Qatar': 'Qatar', 'Dubai': 'United Arab Emirates',
                'Kuwait': 'Kuwait', 'Bahrain': 'Bahrain', 'Muscat': 'Oman'
            };
            for (var key in countryMap) {
                if (tz.indexOf(key) !== -1) {
                    $('#quote-country-select').val(countryMap[key]);
                    break;
                }
            }
        } catch(e) {}
    }

    // Inject Sidebar HTML into the DOM
    function injectCartSidebar() {
        if ($('#cart-sidebar').length > 0) return;

        var sidebarHtml = `
            <div class="cart-overlay"></div>
            <div id="cart-sidebar" style="background: #fff; display: flex; flex-direction: column; height: 100vh;">
                <!-- Header -->
                <div class="cart-header" style="padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="background: #0177c6; color: #fff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                            <i class="ri-file-list-3-line"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3;">ENQUIRY BASKET <span dir="rtl" style="font-weight: 500; font-size: 13px; color: #64748b;">سلة الاستفسارات</span></h4>
                        </div>
                    </div>
                    <span class="close-cart" style="font-size: 20px; color: #94a3b8; cursor: pointer; display: flex;"><i class="ri-close-line"></i></span>
                </div>

                <!-- Products -->
                <div class="cart-items" style="flex: 1; overflow-y: auto; padding: 12px 16px; background: #f8fafc;">
                    <div class="text-center" style="margin-top: 40px; color: #94a3b8; font-size: 13px;">Your quote basket is empty.<br><span dir="rtl" style="display: block; margin-top: 5px;">سلة عرض السعر فارغة.</span></div>
                </div>

                <!-- Footer -->
                <div class="cart-footer" style="padding: 12px 16px 16px; background: #fff; border-top: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 6px;">
                            <i class="ri-file-list-3-line" style="color: #0177c6; font-size: 14px;"></i>
                            <span style="font-size: 12px; color: #475569;"><span class="cart-count" style="font-weight: 700; color: #0f172a;">0</span> items selected <span dir="rtl" style="color: #94a3b8;">| عدد المنتجات</span></span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <i class="ri-time-line" style="color: #0177c6; font-size: 14px;"></i>
                            <span style="font-size: 12px; color: #475569;">Quote in 24h <span dir="rtl" style="color: #94a3b8;">| الرد خلال 24 ساعة</span></span>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <button class="btn-view-cart" id="checkout-submit-btn" style="width: 100%; background: #0177c6; color: #fff; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                            <i class="ri-send-plane-2-line"></i> Submit Enquiry <span dir="rtl" style="font-weight: 500; font-size: 13px;">| إرسال الطلب</span>
                        </button>
                        <span class="close-cart" style="color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 4px 0;">
                            <i class="ri-arrow-left-line"></i> Continue Shopping <span dir="rtl" style="font-size: 11px; font-weight: 500;">/ مواصلة التسوق</span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        var modalHtml = `
            <!-- Request Quote Modal -->
            <div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">
                            <h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST ENQUIRY <span dir="rtl" style="font-size: 14px; color: #666; font-weight: 500; margin-left: 10px;">| طلب استفسار</span></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <!-- Selected Products Section -->
                            <div style="border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px;">
                                    <span style="font-weight: 700; color: #333; font-size: 13px;">SELECTED PRODUCTS (<span class="cart-count">0</span>)</span>
                                    <span dir="rtl" style="font-size: 12px; color: #888; font-weight: 500;">المنتجات المحددة</span>
                                </div>
                                <div id="modal-quote-cart-items" style="max-height: 120px; overflow-y: auto; padding-right: 5px;">
                                    <div id="modal-quote-cart-body">
                                        <!-- Products injected here -->
                                    </div>
                                </div>
                            </div>
                            <div id="quote-auth-prompt" style="display:none; text-align:center; padding: 15px 20px;">
                                <i class="ri-lock-2-line" style="font-size: 36px; color: #0177c6; margin-bottom: 10px; display: inline-block;"></i>
                                <h4 style="font-weight: 700; color: #333; margin-bottom: 5px; font-size: 20px;">Sign In to Submit Your Quote</h4>
                                <p style="color: #666; margin-bottom: 15px; font-size: 13px;">Please sign in to securely process your request and link it to your account.</p>
                                
                                <div style="max-width: 320px; margin: 0 auto; text-align: left;">
                                    <div style="margin-bottom: 10px;">
                                        <input type="email" id="cart-email-input" class="form-control" placeholder="Enter Email Address" style="border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 14px; box-shadow: none;">
                                    </div>
                                    <button type="button" id="cart-email-login-btn" class="btn btn-primary w-100" style="background: #fb641b; color: white; border: none; padding: 10px; font-size: 14px; font-weight: 600; border-radius: 4px; transition: background 0.3s;">
                                        Request Magic Link
                                    </button>
                                    
                                    <div style="display: flex; align-items: center; margin: 12px 0; color: #878787; font-size: 12px;">
                                        <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                                        <span style="padding: 0 10px; background: #fff;">OR</span>
                                        <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                                    </div>
                                    
                                    <button type="button" id="cart-google-signin-btn" class="btn w-100" style="background: #fff; color: #444; border: 1px solid #ddd; padding: 10px; font-size: 14px; font-weight: 500; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.3s;">
                                        <img src="https://www.google.com/favicon.ico" width="16" height="16"> Sign in with Google
                                    </button>
                                </div>
                            </div>

                            <!-- Form Section -->
                            <form id="quote-form-modal">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-weight: 700; color: #222; font-size: 14px;">CONTACT INFORMATION</span>
                                            <span dir="rtl" style="font-size: 13px; color: #888; font-weight: 500;">بيانات الاتصال</span>
                                        </div>
                                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                            FILL DETAILS TO SEND A QUOTATION TO YOUR EMAIL INBOX<br>
                                            <span dir="rtl" style="display: inline-block; margin-top: 2px;">يرجى تعبئة النموذج أدناه وسنقوم بإرسال عرض السعر لك قريباً.</span>
                                        </div>
                                    </div>
                                    <div style="color: #0177c6; font-size: 24px; opacity: 0.8;"><i class="ri-file-text-line"></i></div>
                                </div>
                                <!-- Honeypot field (hidden from humans) -->
                                <div style="display:none;">
                                    <label>Leave this field blank</label>
                                    <input type="text" name="hp_field" value="">
                                </div>
                                <div class="row" style="margin: 0 -10px;">
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Full Name <span style="font-weight: normal; color: #777;">الاسم الكامل</span> *</label>
                                        <input type="text" name="full_name" required class="form-control" placeholder="Enter your full name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Email <span style="font-weight: normal; color: #777;">البريد الإلكتروني</span> *</label>
                                        <input type="email" name="email" required class="form-control" placeholder="Enter your email address" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Company Name <span style="font-weight: normal; color: #777;">اسم الشركة</span></label>
                                        <input type="text" name="company_name" class="form-control" placeholder="Enter your company name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Country <span style="font-weight: normal; color: #777;">الدولة</span> *</label>
                                        <select name="country" id="quote-country-select" class="form-select" required style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                            <option value="">Select Country</option>
<option value="Saudi Arabia">Saudi Arabia</option>
<option value="United Arab Emirates">United Arab Emirates</option>
<option value="Qatar">Qatar</option>
<option value="Kuwait">Kuwait</option>
<option value="Bahrain">Bahrain</option>
<option value="Oman">Oman</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">City <span style="font-weight: normal; color: #777;">المدينة</span></label>
                                        <input type="text" name="city" class="form-control" placeholder="Enter your city" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Mobile Number <span style="font-weight: normal; color: #777;">رقم الجوال</span> *</label>
                                        <div class="input-group" style="border-radius: 6px; overflow: hidden; border: 1px solid #ddd; display: flex;">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="max-width: 180px; font-size: 13px; padding: 10px 12px; border: none; background-color: #f8f9fa; border-right: 1px solid #ddd;">
                                                    <option data-countryCode="SA" value="966">Saudi Arabia (+966)</option>
                                                    <option data-countryCode="AE" value="971">UAE (+971)</option>
                                                    <option data-countryCode="QA" value="974">Qatar (+974)</option>
                                                    <option data-countryCode="BH" value="973">Bahrain (+973)</option>
                                                    <option data-countryCode="KW" value="965">Kuwait (+965)</option>
                                                    <option data-countryCode="OM" value="968">Oman (+968)</option>
                                                    
                                                </select>
                                                <input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">
                                        </div>
                                    </div>


                                    <!-- Cloudflare Turnstile -->
                                    <div class="col-md-12" style="margin-bottom: 10px;">
                                        <div id="turnstile-container"></div>
                                    </div>
                                </div>
                                                                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding: 0 10px;">
                                    <button type="button" class="btn" data-bs-dismiss="modal" style="background-color: white; color: #6c757d; border: 1px solid #6c757d; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إلغاء</span> Cancel
                                    </button>
                                    <button type="submit" class="btn" style="background-color: white; color: #015bb5; border: 1px solid #015bb5; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إرسال الطلب</span> Submit Enquiry <i class="ri-arrow-right-line"></i>
                                    </button>
                                </div>
                            </form>
                            <div id="quote-otp-section" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="quoteStatusModal" tabindex="-1" aria-labelledby="quoteStatusModalLabel" aria-hidden="true" style="z-index: 100001;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">
                            <h5 class="modal-title" id="quoteStatusModalLabel" style="font-weight: 700; color: #333;">Request Status</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px; text-align: center;">
                            <div id="quote-status-icon" style="font-size: 40px; margin-bottom: 15px; line-height: 1;"></div>
                            <h6 id="quote-status-title" style="font-weight: 700; margin-bottom: 10px; color: #333;"></h6>
                            <p id="quote-status-message" style="margin: 0; color: #666;"></p>
                        </div>
                        <div class="modal-footer" style="border-top: 1px solid #ddd;">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="background-color: #0275c6; border-color: #0275c6;">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(sidebarHtml);
        $('body').append(modalHtml);
    }

    function loadCart() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                cart = JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing cart data", e);
                cart = [];
            }
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCartSidebar();
        if ($('#quoteRequestModal').hasClass('show')) {
            renderModalCartSpace();
        }
    }

    function updateCartItemQty(id, action) {
        var existing = cart.find(function (item) { return String(item.id) === String(id); });
        if (existing) {
            if (action === 'increase') {
                existing.qty++;
            } else if (action === 'decrease') {
                existing.qty = Math.max(1, existing.qty - 1);
            }
            saveCart();
        }
    }

    function addToCart(product, skipSidebar) {
        var existing = cart.find(function (item) { return String(item.id) === String(product.id); });
        if (existing) {
            existing.qty += product.qty || 1;
            // Update brand if it was missing or undefined
            if (!existing.brand || existing.brand === 'undefined') {
                existing.brand = product.brand || '';
            }
            existing.name_ar = product.name_ar || existing.name_ar || '';
            existing.desc_en = product.desc_en || existing.desc_en || '';
            existing.desc_ar = product.desc_ar || existing.desc_ar || '';
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                name_ar: product.name_ar || '',
                desc_en: product.desc_en || '',
                desc_ar: product.desc_ar || '',
                brand: product.brand || '',
                image: product.image,
                url: product.url || '#',
                qty: product.qty || 1
            });
        }
        saveCart();
        if (!skipSidebar) {
            openSidebar();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(function (item) { return String(item.id) !== String(id); });
        saveCart();
    }

    function updateCartCount() {
        var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
        $('.quote-basket-count').text(count);
        $('.cart-count').text(count);
    }

    function renderCartSidebar() {
        var $container = $('.cart-items');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.<br><span dir="rtl" style="display: block; margin-top: 5px;">سلة العروض الخاصة بك فارغة.</span></div>');
            $('.cart-count').text("0");
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="background: #fff; border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <div style="display: flex; padding: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; margin-right: 15px; border: 1px solid #f0f0f0; border-radius: 4px; padding: 4px;">
                        
                        <div style="flex: 1; min-width: 0; padding-right: 10px;">
                            <h5 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111; line-height: 1.3;">${item.name}</h5>
                            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">SKU: ${item.id}</div>
                            
                            <div style="display: flex; align-items: center; gap: 5px; color: #28a745; font-size: 11px; font-weight: 600;">
                                <i class="ri-checkbox-circle-fill"></i> In Stock <span dir="rtl" style="font-weight: 500; font-size: 10px;">/ متوفر</span>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                            <div class="remove-from-cart-btn" data-id="${item.id}" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; background: #fff0f0; color: #dc3545; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#ffdfdf'" onmouseout="this.style.backgroundColor='#fff0f0'">
                                    <i class="ri-delete-bin-line"></i>
                                </div>
                                <span style="color: #dc3545; font-size: 10px; font-weight: 500;">Remove <span dir="rtl">إزالة</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px dashed #eaeaea; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; background: #fafafa;">
                        <span style="font-size: 12px; font-weight: 600; color: #444;">Quantity <span dir="rtl" style="font-weight: 500; color: #666; font-size: 11px;">/ الكمية</span></span>
                        <div class="qty-control" style="display: flex; align-items: center; background: #fff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 16px; color: #555; cursor: pointer;">-</button>
                            <input type="text" value="${item.qty}" readonly style="width: 35px; height: 30px; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 13px; font-weight: 700; color: #111; padding: 0;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="increase" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 14px; color: #555; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
            `;
            $container.append(html);
        });

        var totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        $('.cart-count').text(totalQty);
    }

    function renderModalCartSpace() {
        var $container = $('#modal-quote-cart-body');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<tr><td colspan="3" class="text-center" style="padding: 20px;">Your quote basket is empty.</td></tr>');
            $('#quote-form-modal').hide();
            return;
        }

        $('#quote-form-modal').show();

        cart.forEach(function (item) {
            var html = `
                <tr>
                    <td class="text-start" style="padding: 15px 10px;">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; margin-right: 15px;">
                            <div style="flex-grow: 1;">
                                <h4 style="font-size: 14px; margin: 0; font-weight: 700;">
                                    ${item.name}
                                    ${item.name_ar ? `<span style="display: block; font-size: 12px; color: #555; font-weight: 600; text-align: right; margin-top: 2px;" dir="rtl">${item.name_ar}</span>` : ''}
                                </h4>
                            </div>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <div class="qty-control d-flex justify-content-center align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="decrease" style="padding: 0 8px;">-</button>
                            <input type="text" value="${item.qty}" readonly class="form-control form-control-sm mx-2" style="width: 40px; text-align: center;">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="increase" style="padding: 0 8px;">+</button>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <a href="javascript:void(0);" class="remove-item" data-id="${item.id}"><i class="ri-delete-bin-line" style="font-size: 18px; color: #999;"></i></a>
                    </td>
                </tr>
            `;
            $container.append(html);
        });
    }

    function openSidebar() {
        renderCartSidebar();
        $('#cart-sidebar').addClass('active');
        $('.cart-overlay').addClass('active');
    }

    function closeSidebar() {
        $('#cart-sidebar').removeClass('active');
        $('.cart-overlay').removeClass('active');
    }

    function showStatusPopup(type, message) {
        var modalElement = document.getElementById('quoteStatusModal');
        var modalInstance;
        var title = type === 'success' ? 'Request Submitted' : 'Request Failed';
        var icon = type === 'success'
            ? '<i class="ri-checkbox-circle-line" style="color: #198754;"></i>'
            : '<i class="ri-error-warning-line" style="color: #dc3545;"></i>';

        $('#quote-status-title').text(title);
        $('#quote-status-message').text(message);
        $('#quote-status-icon').html(icon);

        modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        $(document).off('click', '.add-to-cart-btn, #spec-add-cart').on('click', '.add-to-cart-btn, #spec-add-cart', function (e) {
            e.preventDefault();

            var $btn = $(this);
            var id = $btn.attr('data-id') || $btn.data('id');
            var name = $btn.attr('data-name') || $btn.data('name') || id;
            var nameAr = $btn.attr('data-name-ar') || $btn.data('name-ar') || '';
            var descEn = $btn.attr('data-desc-en') || $btn.data('desc-en') || '';
            var descAr = $btn.attr('data-desc-ar') || $btn.data('desc-ar') || '';
            var img = $btn.attr('data-image') || $btn.data('image');
            var brand = $btn.attr('data-brand') || $btn.data('brand') || '';

            addToCart({
                id: id,
                name: name,
                name_ar: nameAr,
                desc_en: descEn,
                desc_ar: descAr,
                brand: brand,
                image: img
            });
        });

        $(document).off('click', '.request-quote-btn, #spec-req-quote').on('click', '.request-quote-btn, #spec-req-quote', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var id = $btn.attr('data-id') || $btn.data('id');
            var name = $btn.attr('data-name') || $btn.data('name') || id;
            var nameAr = $btn.attr('data-name-ar') || $btn.data('name-ar') || '';
            var descEn = $btn.attr('data-desc-en') || $btn.data('desc-en') || '';
            var descAr = $btn.attr('data-desc-ar') || $btn.data('desc-ar') || '';
            var img = $btn.attr('data-image') || $btn.data('image');
            var brand = $btn.attr('data-brand') || $btn.data('brand') || '';

            addToCart({
                id: id,
                name: name,
                name_ar: nameAr,
                desc_en: descEn,
                desc_ar: descAr,
                brand: brand,
                image: img
            }, true); // pass true to skip opening sidebar

            $('#quoteRequestModal').modal('show');
        });

        $('#quoteRequestModal').on('show.bs.modal', function (e) {
            // BEST UX: Always show the quote form, bypassing the sign-in requirement entirely
            $('#quote-auth-prompt').hide();
            $('#quote-otp-section').hide();
            $('#modal-quote-cart-items').parent().show();
            $('#quote-form-modal').attr('style', 'display: block');
            $('#quote-form-modal').find('button[type="submit"]').html('<span dir="rtl">إرسال الطلب</span> Submit Enquiry <i class="ri-arrow-right-line"></i>').prop('disabled', false);
        });

        $(document).off('click', '.close-cart, .cart-overlay').on('click', '.close-cart, .cart-overlay', function () {
            closeSidebar();
        });

        $(document).off('click', '.remove-from-cart-btn, .remove-item').on('click', '.remove-from-cart-btn, .remove-item', function (e) {
            e.preventDefault();
            removeFromCart($(this).data('id'));
        });

        $(document).off('click', '.update-qty').on('click', '.update-qty', function () {
            var id = $(this).data('id');
            var action = $(this).data('action');
            var item = cart.find(function (i) { return i.id === id; });
            if (item) {
                if (action === 'increase') item.qty++;
                else if (action === 'decrease' && item.qty > 1) item.qty--;
                saveCart();
                renderCartSidebar(); // Ensure sidebar is updated
                if ($('#quoteRequestModal').hasClass('show')) {
                    renderModalCartSpace();
                }
            }
        });

        $(document).off('change', 'select[name="country"]').on('change', 'select[name="country"]', function () {
            var selectedCountry = $(this).val();
            if (!selectedCountry) return;

            var map = {
                "United Arab Emirates": "UAE",
                "Saudi Arabia": "Saudi Arabia",
                "United Kingdom": "UK",
                "United States of America": "US"
            };
            var searchName = map[selectedCountry] || selectedCountry;

            var found = false;
            // First check for exact prefix with parenthesis
            $('select[name="country_code"] option').each(function () {
                var text = $(this).text();
                if (text.indexOf(searchName + " (") === 0) {
                    $(this).prop('selected', true);
                    found = true;
                    return false;
                }
            });

            // If not found, fuzzy text search
            if (!found) {
                $('select[name="country_code"] option').each(function () {
                    if ($(this).text().indexOf(searchName) !== -1) {
                        $(this).prop('selected', true);
                        return false;
                    }
                });
            }
        });

        $(document).off('submit', '#quote-form-modal').on('submit', '#quote-form-modal', function (e) {
            e.preventDefault();
            var $form = $(this);
            var $btn = $form.find('button[type="submit"]');
            var payload;
            var quoteModalInstance;

            if (cart.length === 0) {
                showStatusPopup('error', 'Your quote basket is empty.');
                return;
            }

            // Anti-Spam: Honeypot Check
            var hpValue = $form.find('[name="hp_field"]').val();
            if (hpValue && hpValue.length > 0) {
                console.warn('Bot detected (Honeypot filled)');
                return; // Silent abort for bots
            }

            // Anti-Spam: Turnstile Check
            var turnstileResponse = $form.find('[name="cf-turnstile-response"]').val();
            if (!turnstileResponse) {
                showStatusPopup('error', 'Please complete the human verification (CAPTCHA).');
                return;
            }

            var rawMobileNumber = ($form.find('[name="phone"]').val() || '').trim();
            var mobileNumber = rawMobileNumber.replace(/[\s-]/g, '');
            
            // Remove leading zero if user entered it (e.g., 054 instead of 54)
            if (mobileNumber.startsWith('0')) {
                mobileNumber = mobileNumber.substring(1);
            }
            
            var countryCode = ($form.find('[name="country_code"]').val() || '').trim();
            
            var mobileValid = true;
            var errorMsg = 'Please enter a correct mobile number.';
            
            if (countryCode === '971' || countryCode === '966') {
                // UAE and KSA: 9 digits, starts with 5
                if (!/^5\d{8}$/.test(mobileNumber)) {
                    mobileValid = false;
                    errorMsg = 'Please enter a valid 9-digit mobile number starting with 5 (e.g. 5X XXX XXXX).';
                }
            } else if (countryCode === '974') {
                // Qatar: 8 digits, starts with 3, 5, 6, or 7
                if (!/^[3567]\d{7}$/.test(mobileNumber)) {
                    mobileValid = false;
                    errorMsg = 'For Qatar, please enter a valid 8-digit mobile number starting with 3, 5, 6, or 7.';
                }
            } else if (countryCode === '973') {
                // Bahrain: 8 digits, starts with 33, 34, 35, 36, 37, 38, 39, 66, or 77
                if (!/^(33|34|35|36|37|38|39|66|77)\d{6}$/.test(mobileNumber)) {
                    mobileValid = false;
                    errorMsg = 'For Bahrain, please enter a valid 8-digit mobile number.';
                }
            } else if (countryCode === '965' || countryCode === '968') {
                // Kuwait and Oman: 8 digits
                if (!/^\d{8}$/.test(mobileNumber)) {
                    mobileValid = false;
                    errorMsg = 'Please enter a valid 8-digit mobile number.';
                }
            }
            
            if (!mobileValid) {
                showStatusPopup('error', errorMsg);
                return;
            }

            payload = {
                full_name: ($form.find('[name="full_name"]').val() || '').trim(),
                email: ($form.find('[name="email"]').val() || '').trim(),
                mobile_number: ($form.find('[name="phone"]').val() || '').trim(),
                mobile_country_code: ($form.find('[name="country_code"]').val() || '').trim(),
                country: ($form.find('[name="country"]').val() || '').trim(),
                company_name: ($form.find('[name="company_name"]').val() || '').trim(),
                city: ($form.find('[name="city"]').val() || '').trim(),
                message: ($form.find('[name="message"]').val() || '').trim(),
                turnstile_token: turnstileResponse, // Added for backend verification
                items: cart.map(function (item) {
                    return {
                        item_code: item.id,
                        item_name: item.name,
                        custom_item_name_in_arabic: item.name_ar || '',
                        custom_commercial_description: item.desc_en || '',
                        custom_commercial_description_in_arabic: item.desc_ar || '',
                        brand: item.brand,
                        qty: item.qty
                    };
                })
            };

            $btn.text('Sending...').prop('disabled', true);

            if (!window.isUserLoggedIn) {
                // Not logged in: Request stateless OTP and signature
                window.pendingPayload = payload;
                var userEmail = payload.email;
                var API_URL = API_BASE_URL + '/api/method/onshore.api.send_otp';

                // Send email request
                fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                })
                    .then(r => r.json())
                    .then(data => {
                        data = data.message || data; // Unwrap Frappe response
                        if (data.success) {
                            window.otpExpires = data.expires;
                            window.otpSignature = data.signature;
                        } else {
                            console.error("OTP Error:", data.message);
                        }
                    })
                    .catch(function (err) {
                        console.error("OTP send error:", err);
                    });

                // Update UI to enter OTP
                $form.attr('style', 'display: none !important');
                $('#modal-quote-cart-items').parent().hide(); // Hide selected products to save space
                $('#quote-otp-section').html(`
                    <div class="text-center" style="padding: 10px 20px;">
                        <i class="ri-mail-check-line" style="font-size: 36px; color: #0177c6; margin-bottom: 10px; display: inline-block;"></i>
                        <h4 style="font-weight: 700; color: #333; margin-bottom: 15px;">
                            Verify Your Email
                            <div dir="rtl" style="font-size: 16px; color: #555; font-weight: 600; margin-top: 5px;">التحقق من بريدك الإلكتروني</div>
                        </h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px; line-height: 1.4;">
                            We just sent a 6-digit code to <strong>` + userEmail + `</strong>.<br>
                            Please enter it below to submit your quote.<br>
                            <span style="font-size: 12px; color: #888; font-style: italic;">(Please also check your spam/junk folder if you don't see it)</span>
                            <span dir="rtl" style="display: block; color: #555; margin-top: 8px; font-size: 13px;">
                                لقد أرسلنا رمزاً من 6 أرقام إلى <strong>` + userEmail + `</strong>.<br>
                                يرجى إدخاله أدناه لإرسال طلب عرض السعر.<br>
                                <span style="font-size: 12px; color: #888; font-style: italic;">(يرجى التحقق من مجلد البريد العشوائي إذا لم تجده)</span>
                            </span>
                        </p>
                        <div style="margin-bottom: 15px;">
                            <input type="text" id="quote-otp-input" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" placeholder="000000" style="font-size: 24px; letter-spacing: 8px; text-align: center; width: 180px; padding: 8px; border: 2px solid #ddd; border-radius: 8px;">
                        </div>
                        <button type="button" id="verify-otp-btn" class="btn" style="background: #0177c6; color: white; padding: 10px 30px; font-weight: 600; border-radius: 6px; margin-bottom: 10px;">
                            Verify & Submit <span dir="rtl" style="margin-left: 8px; font-weight: 500;">| التحقق والإرسال</span>
                        </button>
                        <p id="otp-error-msg" style="color: #dc3545; display: none; margin-top: 10px; font-size: 13px; font-weight: 600;">Invalid verification code. Please try again. <br><span dir="rtl">رمز التحقق غير صالح. يرجى المحاولة مرة أخرى.</span></p>
                        <p id="otp-success-msg" style="color: #28a745; display: none; margin-top: 10px; font-size: 13px; font-weight: 600;">A new code has been sent! <br><span dir="rtl">تم إرسال رمز جديد!</span></p>
                        <div style="margin-top: 10px; font-size: 13px;">
                            <a href="#" id="change-email-btn" style="color: #0177c6; text-decoration: underline; margin-right: 20px; font-weight: 500;">Change Email <span dir="rtl">| تغيير البريد</span></a>
                            <a href="#" id="resend-otp-btn" style="color: #0177c6; text-decoration: underline; font-weight: 500;">Send Again <span dir="rtl">| إرسال مجدداً</span></a>
                        </div>
                    </div>
                `).show();
                return;
            }

            // Already logged in: Submit normally
            sendQuoteToBackend(payload, $btn);
        });

        // Handle OTP verification click
        $(document).off('click', '#verify-otp-btn').on('click', '#verify-otp-btn', function () {
            var rawOTP = $('#quote-otp-input').val() || '';
            // Convert Arabic/Eastern numerals to English numerals
            var val = rawOTP.replace(/[٠-٩]/g, function (d) {
                return String.fromCharCode(d.charCodeAt(0) - 1632);
            }).replace(/[۰-۹]/g, function (d) {
                return String.fromCharCode(d.charCodeAt(0) - 1776);
            });
            // Extract only numbers
            var enteredOTP = val.replace(/[^0-9]/g, '');

            if (enteredOTP.length !== 6) {
                $('#otp-error-msg').show().text('Please enter the 6-digit code.');
                return;
            }

            var $verifyBtn = $(this);
            $verifyBtn.text('Verifying...').prop('disabled', true);
            $('#otp-error-msg').hide();

            var userEmail = window.pendingPayload ? window.pendingPayload.email : '';
            var API_URL = API_BASE_URL + '/api/method/onshore.api.verify_otp';

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    otp: enteredOTP,
                    expires: window.otpExpires,
                    signature: window.otpSignature
                })
            })
                .then(r => r.json())
                .then(data => {
                    data = data.message || data; // Unwrap Frappe response
                    if (data.success && data.customToken) {
                        // Sign in to Firebase!
                        if (window.signInWithFirebaseCustomToken) {
                            window.signInWithFirebaseCustomToken(data.customToken)
                                .then(() => {
                                    $('#quote-otp-input').prop('disabled', true);
                                    $verifyBtn.text('Submitting...');
                                    if (window.pendingPayload) {
                                        sendQuoteToBackend(window.pendingPayload, $verifyBtn);
                                        window.pendingPayload = null;
                                    }
                                })
                                .catch(err => {
                                    console.error("Firebase Auth Error:", err);
                                    $('#otp-error-msg').show().text('Auth error. Please try again.');
                                    $verifyBtn.text('Verify & Submit').prop('disabled', false);
                                });
                        } else {
                            // Fallback
                            $('#quote-otp-input').prop('disabled', true);
                            if (window.pendingPayload) {
                                sendQuoteToBackend(window.pendingPayload, $verifyBtn);
                                window.pendingPayload = null;
                            }
                        }
                    } else {
                        $('#otp-error-msg').show().html((data.message || 'Invalid code.') + '<br><span dir="rtl">رمز التحقق غير صالح. يرجى المحاولة مرة أخرى.</span>');
                        $('#quote-otp-input').addClass('is-invalid');
                        $verifyBtn.text('Verify & Submit').prop('disabled', false);
                    }
                })
                .catch(err => {
                    console.error("OTP verify error:", err);
                    $('#otp-error-msg').show().text('Connection error. Please try again.');
                    $verifyBtn.text('Verify & Submit').prop('disabled', false);
                });
        });

        $(document).off('click', '#change-email-btn').on('click', '#change-email-btn', function (e) {
            e.preventDefault();
            $('#quote-otp-section').hide();
            $('#quote-form-modal').attr('style', 'display: block');
            $('#quote-form-modal').find('button[type="submit"]').text('Submit Enquiry').prop('disabled', false);
        });

        $(document).off('click', '#resend-otp-btn').on('click', '#resend-otp-btn', function (e) {
            e.preventDefault();
            var $resendBtn = $(this);
            $resendBtn.css('pointer-events', 'none').css('opacity', '0.5');

            var userEmail = window.pendingPayload ? window.pendingPayload.email : '';
            if (!userEmail) return;

            var API_URL = API_BASE_URL + '/api/method/onshore.api.send_otp';

            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            })
                .then(r => r.json())
                .then(data => {
                    data = data.message || data; // Unwrap Frappe response
                    if (data.success) {
                        window.otpExpires = data.expires;
                        window.otpSignature = data.signature;
                        $('#otp-error-msg').hide();
                        $('#otp-success-msg').show();
                        setTimeout(() => { $('#otp-success-msg').fadeOut(); }, 3000);
                    }
                    $resendBtn.css('pointer-events', 'auto').css('opacity', '1');
                })
                .catch(err => {
                    console.error("OTP send error:", err);
                    $resendBtn.css('pointer-events', 'auto').css('opacity', '1');
                });

            $('#otp-error-msg').hide();
            $('#otp-success-msg').show();
            setTimeout(function () {
                $('#otp-success-msg').fadeOut();
                $resendBtn.css('pointer-events', 'auto').css('opacity', '1');
            }, 3000);
        });




        $(document).off('show.bs.modal', '#quoteRequestModal').on('show.bs.modal', '#quoteRequestModal', function () {
            var saved = localStorage.getItem('user_quote_details');
            var $m = $('#quoteRequestModal');
            if (saved) {
                try {
                    var details = JSON.parse(saved);
                    if (details.full_name) $m.find('[name="full_name"]').val(details.full_name);
                    if (details.email) $m.find('[name="email"]').val(details.email);
                    if (details.company_name) $m.find('[name="company_name"]').val(details.company_name);
                    if (details.country) $m.find('[name="country"]').val(details.country);
                    if (details.city) $m.find('[name="city"]').val(details.city);
                    if (details.mobile_number) {
                        let rawMobile = details.mobile_number;
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
                        $m.find('[name="phone"]').val(currMobileOnly);
                        $m.find('[name="country_code"]').val(currCountryCode);
                    } else if (details.mobile_country_code) {
                        $m.find('[name="country_code"]').val(details.mobile_country_code);
                    }
                } catch (e) { }
            }
            
            // If user is logged in and has a mobile number, hide the big form and just show a summary
            var details = JSON.parse(localStorage.getItem('user_quote_details') || "{}");
            if (window.isUserLoggedIn && details && details.mobile_number) {
                var $row = $m.find('.row').first(); // the form fields container
                $row.hide();
                $row.find('input, select').removeAttr('required').attr('data-required-hidden', 'true');
                $m.find('#quote-logged-in-summary').remove(); // remove if exists
                
                var nameStr = details.full_name || (window.auth && window.auth.currentUser ? window.auth.currentUser.displayName : 'User');
                var emailStr = details.email || (window.auth && window.auth.currentUser ? window.auth.currentUser.email : '');
                var mobileStr = details.mobile_number || '';
                
                var summaryHtml = `
                <div id="quote-logged-in-summary" style="background: #f4f8fb; border: 1px solid #d3e4f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; font-size: 13px; color: #015bb5; display: flex; align-items: center; gap: 5px;">
                            <i class="ri-checkbox-circle-fill"></i> Profile Linked
                        </span>
                        <button type="button" id="quote-edit-details-btn" style="background: none; border: none; color: #0177c6; font-size: 12px; font-weight: 500; text-decoration: underline; cursor: pointer; padding: 0;">Edit</button>
                    </div>
                    <div style="font-size: 13px; color: #444; line-height: 1.5;">
                        <span style="font-weight: 600; color: #222;">${nameStr}</span> (${emailStr})<br>
                        ${mobileStr ? '<i class="ri-phone-line" style="vertical-align: middle; margin-right: 4px;"></i>' + mobileStr + '<br>' : ''}
                        ${details.company_name ? '<i class="ri-building-line" style="vertical-align: middle; margin-right: 4px;"></i>' + details.company_name + '<br>' : ''}
                        <i class="ri-map-pin-line" style="vertical-align: middle; margin-right: 4px;"></i>${details.city ? details.city + ', ' : ''}Saudi Arabia
                    </div>
                </div>
                `;
                $row.before(summaryHtml);
                
                $('#quote-edit-details-btn').off('click').on('click', function(e) {
                    e.preventDefault();
                    $('#quote-logged-in-summary').hide();
                    $row.show();
                    $row.find('[data-required-hidden="true"]').attr('required', 'required').removeAttr('data-required-hidden');
                    
                    // Add a cancel button to the form header to revert back to summary
                    var $headerIconContainer = $row.prev().prev().find('.ri-file-text-line').parent();
                    if ($headerIconContainer.find('#quote-cancel-edit-btn').length === 0) {
                        $headerIconContainer.html('<button type="button" id="quote-cancel-edit-btn" style="background: none; border: none; color: #666; font-size: 12px; font-weight: 500; text-decoration: underline; cursor: pointer; padding: 0;">Cancel Edit</button>');
                        $('#quote-cancel-edit-btn').off('click').on('click', function(e) {
                            e.preventDefault();
                            $row.hide();
                            $row.find('input, select').removeAttr('required').attr('data-required-hidden', 'true');
                            $('#quote-logged-in-summary').show();
                            $headerIconContainer.html('<i class="ri-file-text-line"></i>');
                        });
                    }
                });
            }
        });

        $(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {
            closeSidebar();
            renderModalCartSpace();
            // Explicitly render Turnstile after modal is fully visible
            if (window.turnstile) {
                try {
                    if (window.turnstileWidgetId !== undefined) {
                        turnstile.reset(window.turnstileWidgetId);
                    } else {
                        $('#turnstile-container').empty();
                        window.turnstileWidgetId = turnstile.render('#turnstile-container', {
                            sitekey: '1x00000000000000000000AA',
                            appearance: 'interaction-only',
                            callback: function (token) {
                                console.log('%c✅ Security Check: Success (Token Generated)', 'color: #28a745; font-weight: bold;');
                            },
                            'error-callback': function () {
                                console.error('%c❌ Security Check: Failed', 'color: #dc3545; font-weight: bold;');
                            }
                        });
                    }
                } catch (e) {
                    console.error('Turnstile render failed:', e);
                }
            }
        });
    }

    function sendQuoteToBackend(payload, $btn) {
        $.ajax({
            url: REQUEST_QUOTE_URL,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                Authorization: REQUEST_QUOTE_AUTH
            },
            data: JSON.stringify(payload),
            success: function (response) {
                var quoteModalInstance = bootstrap.Modal.getInstance(document.getElementById('quoteRequestModal'));
                if (quoteModalInstance) {
                    quoteModalInstance.hide();
                }

                showStatusPopup('success', 'Thank you! Your quote request has been submitted successfully.');


                // Save user details for next time so they don't have to re-enter them
                var userDetails = {
                    full_name: payload.full_name,
                    email: payload.email,
                    mobile_number: payload.mobile_number,
                    mobile_country_code: payload.mobile_country_code,
                    country: payload.country,
                    company_name: payload.company_name,
                    city: payload.city
                };
                localStorage.setItem('user_quote_details', JSON.stringify(userDetails));

                // Clear cart
                cart = [];
                localStorage.setItem('onshore_quote_cart', JSON.stringify(cart));
                QuoteCart.init(); // Refresh UI
            },
            error: function (err) {
                console.error('Quote request failed:', err);
                showStatusPopup('error', 'Oops! Something went wrong while sending your request. Please try again or contact us directly.');
            },
            complete: function () {
                if ($btn) $btn.text('Submit Enquiry').prop('disabled', false);
            }
        });
    }

    // Expose function for auth.js to call after magic link login
    function submitPendingQuote() {
        var pendingData = localStorage.getItem('pending_quote_request');
        if (pendingData) {
            try {
                var payload = JSON.parse(pendingData);
                sendQuoteToBackend(payload, null);
                localStorage.removeItem('pending_quote_request');
            } catch (e) {
                console.error("Failed to parse pending quote", e);
            }
        }
    }

    function injectAbandonedCartReminder() {
        if ($('#abandoned-cart-toast').length > 0) return;

        var toastHtml = `
            <style>
                .abandoned-cart-toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 320px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.05);
                    border: 1px solid rgba(255,255,255,0.4);
                    padding: 20px;
                    z-index: 100005;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    pointer-events: none;
                }
                .abandoned-cart-toast.show {
                    transform: translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .abandoned-cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                .abandoned-cart-title {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .abandoned-cart-close {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }
                .abandoned-cart-close:hover {
                    color: #ef4444;
                }
                .abandoned-cart-body {
                    color: #475569;
                    font-size: 13px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                .abandoned-cart-btn {
                    display: block;
                    width: 100%;
                    background: #0177c6;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: background 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .abandoned-cart-btn:hover {
                    background: #015f9e;
                    color: #fff;
                }
                @media (max-width: 768px) {
                    .abandoned-cart-toast {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                }
            </style>
            <div id="abandoned-cart-toast" class="abandoned-cart-toast">
                <div class="abandoned-cart-header">
                    <div class="abandoned-cart-title">
                        <i class="ri-shopping-cart-2-fill" style="color: #0177c6; font-size: 18px;"></i>
                        Welcome back!
                    </div>
                    <button class="abandoned-cart-close" id="close-abandoned-toast">&times;</button>
                </div>
                <div class="abandoned-cart-body">
                    You have <strong><span id="abandoned-item-count"></span> items</strong> waiting in your quote basket. Don't forget to submit your request!
                </div>
                <button class="abandoned-cart-btn" id="resume-quote-btn">Resume Quote</button>
            </div>
        `;

        $('body').append(toastHtml);

        $('#close-abandoned-toast').on('click', function () {
            $('#abandoned-cart-toast').removeClass('show');
            setTimeout(function () {
                $('#abandoned-cart-toast').remove();
            }, 500);
        });

        $('#resume-quote-btn').on('click', function () {
            $('#abandoned-cart-toast').removeClass('show');
            openSidebar();
        });
    }

    function checkAbandonedCart() {
        var now = Date.now();
        var lastActive = localStorage.getItem('cart_last_active_time');

        // If there are items in the cart
        if (cart.length > 0) {
            // Check if user has been inactive for more than 30 mins (30 * 60 * 1000)
            var THRESHOLD = 30 * 60 * 1000;

            // For testing/demonstration purposes, if lastActive is missing, or if it's over threshold
            if (!lastActive || (now - parseInt(lastActive)) > THRESHOLD) {
                // Ensure we only show it once per browser session using sessionStorage
                if (!sessionStorage.getItem('cart_reminder_shown')) {
                    injectAbandonedCartReminder();

                    $('#abandoned-item-count').text(cart.length);

                    // Small delay for smooth slide-up animation after page load
                    setTimeout(function () {
                        $('#abandoned-cart-toast').addClass('show');
                    }, 1500);

                    sessionStorage.setItem('cart_reminder_shown', 'true');
                }
            }
        }

        // Always update the last active time on load
        localStorage.setItem('cart_last_active_time', now);
    }

    return {
        init: init,
        addToCart: addToCart,
        openSidebar: openSidebar,
        closeSidebar: closeSidebar,
        submitPendingQuote: submitPendingQuote
    };

})(jQuery);

$(document).ready(function () {
    QuoteCart.init();
});


// Submit enquiry regardless of item count or login status
$(document).on('click', '#checkout-submit-btn', function (e) {
    e.preventDefault();
    $('#quoteRequestModal').modal('show');
});
