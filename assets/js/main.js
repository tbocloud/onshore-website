// --- GLOBAL SEARCH INJECTION ---
(function () {
    if (!document.querySelector('link[href="assets/css/global-search.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/css/global-search.css';
        document.head.appendChild(link);
    }
    if (!document.querySelector('script[src^="assets/js/global-search.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/js/global-search.js?v=2.0';
        script.defer = true;
        document.body.appendChild(script);
    }
})();

// --- NAV ENHANCEMENTS (cart label, profile quotes link, contact button) ---
(function () {
    // Arabic label under cart icon
    var cartTriggers = document.querySelectorAll('.cart-trigger');
    cartTriggers.forEach(function (el) {
        if (el.querySelector('.cart-ar-label')) return;
        var label = document.createElement('span');
        label.className = 'cart-ar-label';
        label.dir = 'rtl';
        label.style.cssText = 'display:block;font-size:9px;font-weight:500;opacity:0.8;line-height:1;margin-top:1px;color:inherit;';
        label.textContent = 'استفسار';
        el.appendChild(label);
    });

    // Hide the nav Contact/Request Quote button only on mobile
    if (window.matchMedia('(max-width: 768px)').matches) {
        var navMainBtns = document.querySelectorAll('.nav-right-icons .main-btn');
        navMainBtns.forEach(function (btn) {
            btn.style.display = 'none';
        });
    }

    // Add icons to all nav links (matching by id or text)
    document.querySelectorAll('.nav-links li a').forEach(function (a) {
        if (a.querySelector('i')) return;
        var t = a.textContent.trim().toLowerCase(), icon = '', color = 'inherit';
        var m = { home: ['ri-home-4-fill', 'inherit'], about: ['ri-information-fill', 'inherit'], industries: ['ri-building-2-fill', 'inherit'], products: ['ri-store-2-fill', 'inherit'], brands: ['ri-award-fill', 'inherit'], news: ['ri-article-fill', 'inherit'], blog: ['ri-article-fill', 'inherit'], career: ['ri-briefcase-fill', 'inherit'], contact: ['ri-contacts-fill', 'inherit'], login: ['ri-user-fill', 'inherit'], 'my quotes': ['ri-file-list-3-fill', 'inherit'] };
        for (var k in m) { if (t.indexOf(k) === 0) { icon = m[k][0]; color = m[k][1]; break; } }
        if (icon) a.innerHTML = '<i class="' + icon + '" style="color:' + color + ';font-size:18px;"></i><span>' + a.textContent + '</span>';
    });
    // Force login icon
    var ll = document.getElementById('nav-login-link');
    if (ll && !ll.querySelector('i')) { ll.innerHTML = '<i class="ri-user-fill" style="color:#0177c6;font-size:18px;"></i><span>Login</span>'; }

    // Inject "My Quotes" link in nav-lists for logged-in users
    var loginLink = document.getElementById('nav-login-link');
    if (loginLink && !document.getElementById('nav-my-quotes-link')) {
        var quotesLi = document.createElement('li');
        var quotesA = document.createElement('a');
        quotesA.href = '/my-quotes.html';
        quotesA.id = 'nav-my-quotes-link';
        quotesA.textContent = 'My Quotes';
        quotesA.style.display = 'none';
        quotesLi.appendChild(quotesA);
        loginLink.parentNode.insertBefore(quotesLi, loginLink);
    }

    // Save current page before navigating to login for redirect back
    if (loginLink) {
        loginLink.addEventListener('click', function () {
            try { localStorage.setItem('onshore_login_redirect', window.location.href); } catch (e) { }
        });
    }
    try {
        import('https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js').catch(function () { });
    } catch (e) { }
    var checkAuth = function () {
        var ql = document.getElementById('nav-my-quotes-link');
        var ll = document.getElementById('nav-login-link');
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function (user) {
                if (ql) ql.style.display = user ? '' : 'none';
                if (ll) ll.style.display = user ? 'none' : '';
            });
        }
    };
    if (document.readyState !== 'loading') checkAuth();
    else document.addEventListener('DOMContentLoaded', checkAuth);
})();

// --- MOBILE BOTTOM TAB BAR (Swiggy-style) ---
(function () {
    if (document.getElementById('mobile-tab-bar')) return;
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;
    var bar = document.createElement('div');
    bar.id = 'mobile-tab-bar';
    bar.innerHTML = '<a href="/" class="tab-item"><div class="tab-icon-box"><i class="ri-home-4-fill"></i></div><span>Home</span></a><a href="/products.html" class="tab-item"><div class="tab-icon-box"><i class="ri-apps-2-line"></i></div><span>Products</span></a><div class="tab-item tab-cart-trigger" onclick="if(typeof QuoteCart!==\'undefined\')QuoteCart.openSidebar()"><div class="tab-icon-box"><i class="ri-shopping-basket-2-line"></i><b class="tab-badge" id="tab-cart-count">0</b></div><span>Cart</span></div><a href="/my-quotes.html" class="tab-item"><div class="tab-icon-box"><i class="ri-file-list-3-line"></i></div><span>Quotes</span></a><a href="/login.html" class="tab-item" id="tab-login-link"><div class="tab-icon-box"><i class="ri-user-fill"></i></div><span>Login</span></a>';
    document.body.appendChild(bar);
    var style = document.createElement('style');
    style.textContent = '#mobile-tab-bar{position:fixed;bottom:0;left:0;right:0;z-index:9997;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:0.5px solid rgba(0,0,0,0.08);display:flex;justify-content:space-around;align-items:flex-start;padding:8px 4px 6px;padding-bottom:calc(6px + env(safe-area-inset-bottom));}.tab-item{display:flex;flex-direction:column;align-items:center;gap:3px;text-decoration:none;color:#717171;font-size:10px;font-weight:500;padding:2px 6px;min-width:56px;border-radius:12px;transition:color 0.15s;cursor:pointer;}.tab-icon-box{position:relative;width:40px;height:28px;display:flex;align-items:center;justify-content:center;}.tab-item i{font-size:22px;transition:transform 0.2s;}.tab-item.active i{transform:scale(1.15);}.tab-item.active,.tab-item.active {color:#0177c6;font-weight:600;}.tab-item:active{transform:scale(0.95);}.tab-item.active::after{content:\'\';position:absolute;bottom:-6px;width:18px;height:3px;background:#0177c6;border-radius:3px;}.tab-badge{position:absolute;top:-4px;right:-10px;background:#ef4444;color:#fff;border-radius:10px;font-size:9px;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid #fff;}.tab-cart-trigger .tab-icon-box i{font-size:24px;}body{padding-bottom:72px;}@media(max-width:768px){.whatsapp-widget{bottom:80px!important;}}@media(min-width:769px){#mobile-tab-bar{display:none!important;}body{padding-bottom:0;}}';
    document.head.appendChild(style);
    var updateBadge = function () {
        var count = 0;
        try { var cart = JSON.parse(localStorage.getItem('onshore_quote_cart') || '[]'); count = Array.isArray(cart) ? cart.length : 0; } catch (e) { }
        var badge = document.getElementById('tab-cart-count');
        if (badge) { badge.textContent = count; badge.style.display = count > 0 ? '' : 'none'; }
        var stickyBar = document.getElementById('sticky-cart-bar');
        if (stickyBar) { stickyBar.style.transform = count > 0 ? 'translateY(0)' : 'translateY(100%)'; stickyBar.querySelector('.scb-count').textContent = count; }
    };
    setInterval(updateBadge, 800);

    // Sticky cart bar (Swiggy-style) — slides up when items in cart
    var stickyCart = document.createElement('div');
    stickyCart.id = 'sticky-cart-bar';
    stickyCart.innerHTML = '<div class="scb-inner"><div class="scb-left"><i class="ri-shopping-basket-2-fill" style="font-size:20px;color:#fff;"></i><span class="scb-count">0</span><span> items in basket</span></div><button class="scb-btn" onclick="if(typeof QuoteCart!==\'undefined\')QuoteCart.openSidebar()">View Quote <i class="ri-arrow-right-s-line"></i></button></div>';
    document.body.appendChild(stickyCart);
    var scbStyle = document.createElement('style');
    scbStyle.textContent = '#sticky-cart-bar{position:fixed;bottom:58px;left:8px;right:8px;z-index:9996;background:#0177c6;color:#fff;border-radius:14px;padding:10px 16px;transform:translateY(200%);transition:transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);box-shadow:0 4px 20px rgba(1,119,198,0.35);}.scb-inner{display:flex;align-items:center;justify-content:space-between;gap:12px;}.scb-left{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;}.scb-count{background:rgba(255,255,255,0.25);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}.scb-btn{background:#fff;color:#0177c6;border:none;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;}@media(min-width:769px){#sticky-cart-bar{display:none!important;}}';
    document.head.appendChild(scbStyle);
})();

// --- ACTIVE TAB HIGHLIGHTING ---
(function () {
    var path = window.location.pathname;
    if (path === '/' || path === '/index.html') path = '/index.html';

    // Mobile tabs
    var tabs = document.querySelectorAll('#mobile-tab-bar .tab-item');
    tabs.forEach(function (t) {
        var href = t.getAttribute('href');
        if (!href) return;
        if (href !== './' && path.indexOf(href.replace('.html', '').replace('./', '')) > -1) t.classList.add('active');
        if (href === './' && path === '/index.html') t.classList.add('active');
    });

    // Desktop tabs
    var desktopTabs = document.querySelectorAll('.nav-links li a');
    desktopTabs.forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        var isActive = false;
        if (href !== './' && path.indexOf(href.replace('.html', '').replace('./', '')) > -1) isActive = true;
        if (href === './' && path === '/index.html') isActive = true;

        if (isActive) {
            a.classList.add('active');
        }
    });
})();

// Globally accessible toast
window.showToast = function (msg, arMsg) {
    var t = document.createElement('div');
    t.className = 'onshore-toast';
    t.innerHTML = msg + (arMsg ? ' <span dir="rtl" style="font-size:11px;opacity:0.8;">| ' + arMsg + '</span>' : '');
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.top = '20px'; });
    setTimeout(function () { t.style.top = '-60px'; setTimeout(function () { t.remove(); }, 300); }, 2500);
};
(function () {
    var s = document.createElement('style');
    s.textContent = '.onshore-toast{position:fixed;top:-60px;left:50%;transform:translateX(-50%);z-index:99999;background:#0f172a;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;white-space:nowrap;box-shadow:0 8px 30px rgba(0,0,0,0.2);transition:top 0.3s ease;max-width:90vw;text-align:center;}@media(max-width:768px){.onshore-toast{font-size:12px;padding:10px 16px;}}';
    document.head.appendChild(s);
})();

// --- ARABIC-FIRST DETECTION ---
(function () {
    var lang = (navigator.language || '').toLowerCase();
    if (lang.indexOf('ar') === 0) {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
    }
})();

// --- BILINGUAL QUOTE & LOGIN BANNER (injected on every page) ---
(function () {
    if (document.getElementById('global-quote-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'global-quote-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9998;background:linear-gradient(135deg,#0177c6,#015fa3);color:#fff;padding:6px 10px;font-family:"Outfit",sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.15);transform:translateY(-100%);transition:transform 0.4s ease;min-height:36px;';
    
    var quoteContent = '<span class="banner-text"><i class="ri-file-list-3-line"></i> <strong style="font-size:12px;">Request a quote for any product</strong> &mdash; click <strong>Request Quote</strong>, enter details, get reply within 24 hours</span> <span dir="rtl" class="banner-text"><strong style="font-size:12px;">اطلب عرض سعر لاي منتج</strong> &mdash; انقر زر طلب عرض سعر، أدخل بياناتك وسنرد خلال 24 ساعة</span> <a href="/products.html#catalog-main" style="background:#ffc107;color:#0f172a;padding:4px 10px;border-radius:6px;font-weight:700;font-size:11px;text-decoration:none;white-space:nowrap;flex-shrink:0;">Browse Products <span dir="rtl">تصفح المنتجات</span></a>';
    var loginContent = '<span class="banner-text"><strong style="font-size:13px;">🔔 Register an account to view live stock availability and access exclusive pricing!</strong></span> <a href="/login.html" style="background:#ffc107;color:#0f172a;padding:4px 10px;border-radius:6px;font-weight:700;font-size:11px;text-decoration:none;white-space:nowrap;flex-shrink:0;margin-left:10px;">Login / Register Here</a>';

    banner.innerHTML = `
        <div id="banner-quote" style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;width:100%;font-size:11px;line-height:1.3;transition:opacity 0.4s ease;">${quoteContent}</div>
        <div id="banner-login" style="display:none;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;width:100%;font-size:11px;line-height:1.3;transition:opacity 0.4s ease;">${loginContent}</div>
        <span onclick="this.parentElement.style.transform='translateY(-100%)'; var n=document.querySelector('nav'); if(n) n.style.top='0'; document.body.style.paddingTop='0'; document.documentElement.style.setProperty('--banner-height', '0px'); document.documentElement.style.setProperty('--total-header-height', (n ? n.offsetHeight : 0) + 'px');" style="position:absolute;right:15px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:16px;opacity:0.7;line-height:1;">&times;</span>
    `;

    // mobile: allow text wrapping
    var sheet = document.createElement('style');
    sheet.textContent = '@media(max-width:480px){#global-quote-banner .banner-text{white-space:normal;font-size:10px;max-width:100%;}}';
    document.head.appendChild(sheet);
    document.body.appendChild(banner);
    
    setTimeout(function () { 
        banner.style.transform = 'translateY(0)';
        var n = document.querySelector('nav');
        if (n) {
            n.style.transition = 'top 0.4s ease';
            n.style.top = banner.offsetHeight + 'px';
            document.body.style.transition = 'padding-top 0.4s ease';
            document.body.style.paddingTop = banner.offsetHeight + 'px';
            const updateTotalHeaderHeight = () => {
                let bannerH = 0;
                if (banner.style.transform === 'translateY(0px)' || banner.style.transform === 'translateY(0)') {
                    bannerH = banner.offsetHeight;
                }
                document.documentElement.style.setProperty('--banner-height', bannerH + 'px');
                document.documentElement.style.setProperty('--total-header-height', (bannerH + n.offsetHeight) + 'px');
            };
            
            updateTotalHeaderHeight();
            
            // Handle window resize dynamically adjusting the nav position
            window.addEventListener('resize', function() {
                if (banner.style.transform === 'translateY(0px)' || banner.style.transform === 'translateY(0)') {
                    n.style.top = banner.offsetHeight + 'px';
                    document.body.style.paddingTop = banner.offsetHeight + 'px';
                }
                updateTotalHeaderHeight();
            });
        }
        
        // Setup rotation logic
        var quoteEl = document.getElementById('banner-quote');
        var loginEl = document.getElementById('banner-login');
        var showQuote = true;
        
        setInterval(function() {
            // If they are logged in, just show the quote banner and stop rotating
            if (window.isUserLoggedIn) {
                quoteEl.style.display = 'flex';
                loginEl.style.display = 'none';
                return;
            }
            
            showQuote = !showQuote;
            if (showQuote) {
                loginEl.style.display = 'none';
                quoteEl.style.display = 'flex';
            } else {
                quoteEl.style.display = 'none';
                loginEl.style.display = 'flex';
            }
            
            // Update nav offset in case height changes during rotation
            if (n && (banner.style.transform === 'translateY(0px)' || banner.style.transform === 'translateY(0)')) {
                n.style.top = banner.offsetHeight + 'px';
            }
        }, 15000);
        
    }, 3000);
})();
// -------------------------------

window.addEventListener("scroll", function () {
    var header = this.document.querySelector("nav");
    if (header) {
        header.classList.toggle("header-scrolled", window.scrollY > 50);
        var banner = document.getElementById('global-quote-banner');
        var bannerH = 0;
        if (banner && (banner.style.transform === 'translateY(0px)' || banner.style.transform === 'translateY(0)')) {
            bannerH = banner.offsetHeight;
        }
        document.documentElement.style.setProperty('--total-header-height', (bannerH + header.offsetHeight) + 'px');
    }
})

/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId)

    // Check if elements exist before adding listeners
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            // Add show-menu class to nav menu
            nav.classList.toggle('show-menu')
            // Add show-icon to show and hide menu icon
            toggle.classList.toggle('show-icon')
        })
    }
}

showMenu('nav-toggle', 'nav-menu')

/*=============== PRODUCT FILTER ===============*/
const filterButtons = document.querySelectorAll('.products .nav button');
const productItems = document.querySelectorAll('.products .product');

if (filterButtons.length > 0 && productItems.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.textContent.trim().toLowerCase();

            productItems.forEach(item => {
                // Get the category from the span inside the product card
                const categoryElement = item.querySelector('.product_cat');
                if (categoryElement) {
                    const category = categoryElement.textContent.trim().toLowerCase();

                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = ''; // Restore grid display
                    } else {
                        item.style.display = 'none'; // Hide element
                    }
                }
            });
        });
    });
}

/*=============== SEARCH HANDLING ===============*/
function handleUrlSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const productItemsList = document.querySelectorAll('.pc');
    const searchStatus = document.getElementById('search-status');
    const searchTerm = document.getElementById('search-term');
    const tabPanes = document.querySelectorAll('.products .tab-pane');

    if (searchQuery && productItemsList.length > 0) {
        const query = searchQuery.toLowerCase();

        if (searchStatus && searchTerm) {
            searchStatus.style.display = 'flex';
            searchTerm.textContent = searchQuery;
        }

        const heroBanner = document.getElementById('delayed-hero-banner');
        if (heroBanner) {
            heroBanner.style.display = 'none';
        }

        // Show all panes during search to find results everywhere
        tabPanes.forEach(pane => {
            pane.style.display = 'block';
            pane.style.opacity = '1';
        });

        let hasVisibleResults = false;

        productItemsList.forEach(item => {
            const name = item.querySelector('.pc-name')?.textContent.toLowerCase() || '';
            const brand = item.querySelector('.pc-brand')?.textContent.toLowerCase() || '';
            const nameAr = item.querySelector('.pc-name-ar')?.textContent.toLowerCase() || '';
            const cat = (item.getAttribute('data-cat') || '').toLowerCase();
            const subcat = (item.getAttribute('data-subcat') || '').toLowerCase();
            const leafcat = (item.getAttribute('data-leafcat') || '').toLowerCase();

            const queryWords = query.split(/\s+/);
            const combinedText = (name + " " + brand + " " + nameAr + " " + cat + " " + subcat + " " + leafcat).toLowerCase();
            const matchesAll = queryWords.every(word => combinedText.includes(word));

            if (matchesAll) {
                item.style.display = '';
                hasVisibleResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        if (!hasVisibleResults && searchStatus) {
            searchTerm.textContent = searchQuery + " (No results found)";
        }

        // Hide empty brand groups and filter buttons during global search
        const brandGroups = document.querySelectorAll('.products .brand_group');
        brandGroups.forEach(group => {
            const hasVisibleProducts = Array.from(group.querySelectorAll('.product')).some(p => p.style.display !== 'none');
            group.style.display = hasVisibleProducts ? '' : 'none';
        });

        const brandFilterContainers = document.querySelectorAll('.products .brand_filter_container');
        brandFilterContainers.forEach(container => {
            container.style.display = 'none';
        });

        // Disable tab buttons active state during global search
        const buttons = document.querySelectorAll('.products .nav button');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Force ScrollReveal to recalculate positions since page height changed on load
        setTimeout(() => {
            if (typeof ScrollReveal !== 'undefined') {
                ScrollReveal().sync();
            }
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('scroll'));
        }, 100);

        document.body.classList.add('search-active');
    }
}

window.addEventListener('load', handleUrlSearch);

/*=============== REAL-TIME PRODUCT SEARCH ===============*/
const productPageSearch = document.getElementById('product-page-search');
if (productPageSearch) {
    productPageSearch.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const productItemsList = document.querySelectorAll('.pc');
        const tabPanes = document.querySelectorAll('.products .tab-pane');

        if (query.length > 0) {
            document.body.classList.add('search-active');

            // Show all panes to search globally
            tabPanes.forEach(pane => {
                pane.style.display = 'block';
                pane.style.opacity = '1';
            });

            productItemsList.forEach(item => {
                const name = item.querySelector('.pc-name')?.textContent.toLowerCase() || '';
                const brand = item.querySelector('.pc-brand')?.textContent.toLowerCase() || '';
                const nameAr = item.querySelector('.pc-name-ar')?.textContent.toLowerCase() || '';
                const cat = (item.getAttribute('data-cat') || '').toLowerCase();
                const subcat = (item.getAttribute('data-subcat') || '').toLowerCase();
                const leafcat = (item.getAttribute('data-leafcat') || '').toLowerCase();

                const queryWords = query.split(/\s+/);
                const combinedText = (name + " " + brand + " " + nameAr + " " + cat + " " + subcat + " " + leafcat).toLowerCase();
                const matchesAll = queryWords.every(word => combinedText.includes(word));

                if (matchesAll) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });

            // Hide empty brand groups and filter buttons during global search
            const brandGroups = document.querySelectorAll('.products .brand_group');
            brandGroups.forEach(group => {
                const hasVisibleProducts = Array.from(group.querySelectorAll('.product')).some(p => p.style.display !== 'none');
                group.style.display = hasVisibleProducts ? '' : 'none';
            });

            const brandFilterContainers = document.querySelectorAll('.products .brand_filter_container');
            brandFilterContainers.forEach(container => {
                container.style.display = 'none';
            });

            const buttons = document.querySelectorAll('.products .nav button');
            buttons.forEach(btn => btn.classList.remove('active'));
        } else {
            document.body.classList.remove('search-active');

            // Restore tab-only view when search is cleared
            tabPanes.forEach(pane => {
                pane.style.display = '';
                pane.style.opacity = '';
            });
            productItemsList.forEach(item => item.style.display = '');

            // Restore brand groups and filter buttons
            const brandGroups = document.querySelectorAll('.products .brand_group');
            brandGroups.forEach(group => group.style.display = '');

            const brandFilterContainers = document.querySelectorAll('.products .brand_filter_container');
            brandFilterContainers.forEach(container => container.style.display = '');

            // Reactivate the first tab (Lifting) or previously active tab
            const liftingTab = document.getElementById('pills-p3-tab');
            if (liftingTab) liftingTab.click();
        }

        // Force ScrollReveal to recalculate positions since page height changed
        if (typeof ScrollReveal !== 'undefined') {
            ScrollReveal().sync();
        }
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('scroll'));
    });
}



// --- NON-INTRUSIVE FLOATING LEAD PROMPT (BOTTOM-LEFT, 7-DAY DISMISSAL) ---
(function () {
    if (window.location.pathname.indexOf('products.html') !== -1) return; // Do not show on products page

    // Check 7-day dismissal
    var dismissedUntil = localStorage.getItem('leadToastDismissedUntil');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    // Check legacy daily dismissal
    if (localStorage.getItem('leadModalClosed') === new Date().toDateString()) return;

    var hasTriggered = false;

    function createAndShowToast() {
        if (hasTriggered) return;
        hasTriggered = true;

        if (document.getElementById('leadFloatingToast')) return;

        var toastHTML = `
        <div id="leadFloatingToast" class="lead-floating-toast" role="dialog" aria-label="Explore Industrial Equipment">
          <div class="lft-inner">
            <button type="button" class="lft-close" id="lftCloseBtn" aria-label="Dismiss">&times;</button>
            <div class="lft-header">
              <div class="lft-icon">
                <i class="ri-compass-3-line"></i>
              </div>
              <div class="lft-title-wrap">
                <span class="lft-badge">Direct Supply</span>
                <h4 class="lft-title">Looking for Equipment?</h4>
              </div>
            </div>
            <p class="lft-desc">Get competitive pricing & certified specs on welding, lifting, and safety gear in Saudi Arabia.</p>
            <div class="lft-actions">
              <a href="/products.html" class="lft-btn-primary" id="lftBrowseBtn">
                Browse Catalog <i class="ri-arrow-right-line"></i>
              </a>
              <a href="/contact.html" class="lft-btn-secondary" id="lftQuoteBtn">
                Request Quote
              </a>
            </div>
          </div>
        </div>`;

        var container = document.createElement('div');
        container.innerHTML = toastHTML;
        var toastEl = container.firstElementChild;
        document.body.appendChild(toastEl);

        // Allow DOM paint before adding active class for animation
        requestAnimationFrame(function() {
            setTimeout(function() {
                if (toastEl) toastEl.classList.add('active');
            }, 50);
        });

        function dismissToast(days) {
            var expire = Date.now() + (days || 7) * 24 * 60 * 60 * 1000;
            localStorage.setItem('leadToastDismissedUntil', expire.toString());
            if (toastEl) toastEl.classList.remove('active');
            setTimeout(function() {
                if (toastEl && toastEl.parentNode) {
                    toastEl.parentNode.removeChild(toastEl);
                }
            }, 400);
        }

        var closeBtn = document.getElementById('lftCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                dismissToast(7);
            });
        }

        var browseBtn = document.getElementById('lftBrowseBtn');
        if (browseBtn) {
            browseBtn.addEventListener('click', function() {
                dismissToast(7);
            });
        }

        var quoteBtn = document.getElementById('lftQuoteBtn');
        if (quoteBtn) {
            quoteBtn.addEventListener('click', function() {
                dismissToast(7);
            });
        }

        // Mobile touch swipe-to-dismiss (swipe up)
        var touchStartY = 0;
        toastEl.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        toastEl.addEventListener('touchend', function(e) {
            var touchEndY = e.changedTouches[0].clientY;
            if (touchStartY - touchEndY > 30) {
                dismissToast(7);
            }
        }, { passive: true });
    }

    // Trigger on scroll (> 400px or > 30% page height)
    function onScrollCheck() {
        var scrollPos = window.scrollY || window.pageYOffset || 0;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollPos > 400 || (docHeight > 0 && scrollPos / docHeight > 0.3)) {
            window.removeEventListener('scroll', onScrollCheck);
            createAndShowToast();
        }
    }
    window.addEventListener('scroll', onScrollCheck, { passive: true });

    // Or trigger after calm 15-second dwell time
    setTimeout(function() {
        window.removeEventListener('scroll', onScrollCheck);
        createAndShowToast();
    }, 15000);
})();
