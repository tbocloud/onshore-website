// --- GLOBAL SEARCH INJECTION ---
(function() {
    if (!document.querySelector('link[href="assets/css/global-search.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/css/global-search.css';
        document.head.appendChild(link);
    }
    if (!document.querySelector('script[src^="assets/js/global-search.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/js/global-search.js?v=1.6';
        script.defer = true;
        document.body.appendChild(script);
    }
})();

// --- NAV ENHANCEMENTS (cart label, profile quotes link, contact button) ---
(function() {
    // Arabic label under cart icon
    var cartTriggers = document.querySelectorAll('.cart-trigger');
    cartTriggers.forEach(function(el) {
        if (el.querySelector('.cart-ar-label')) return;
        var label = document.createElement('span');
        label.className = 'cart-ar-label';
        label.dir = 'rtl';
        label.style.cssText = 'display:block;font-size:9px;font-weight:500;opacity:0.8;line-height:1;margin-top:1px;color:inherit;';
        label.textContent = 'استفسار';
        el.appendChild(label);
    });

    // Replace "Contact Now" with "Request Quote" that opens enquiry sidebar
    var navMainBtns = document.querySelectorAll('.nav-right-icons .main-btn');
    navMainBtns.forEach(function(btn) {
        if (btn.getAttribute('data-quote-fixed')) return;
        btn.setAttribute('data-quote-fixed', '1');
        btn.innerHTML = 'Request Quote <i class="ri-arrow-right-line"></i>';
        btn.href = 'javascript:void(0)';
        btn.onclick = function(e) { e.preventDefault(); if (typeof QuoteCart !== 'undefined') QuoteCart.openSidebar(); };
    });

    // Inject "My Quotes" link in nav-lists for logged-in users
    var loginLink = document.getElementById('nav-login-link');
    if (loginLink && !document.getElementById('nav-my-quotes-link')) {
        var quotesLi = document.createElement('li');
        var quotesA = document.createElement('a');
        quotesA.href = 'my-quotes.html';
        quotesA.id = 'nav-my-quotes-link';
        quotesA.textContent = 'My Quotes';
        quotesA.style.display = 'none';
        quotesLi.appendChild(quotesA);
        loginLink.parentNode.insertBefore(quotesLi, loginLink);
    }

    // Save current page before navigating to login for redirect back
    if (loginLink) {
        loginLink.addEventListener('click', function() {
            try { localStorage.setItem('onshore_login_redirect', window.location.href); } catch(e) {}
        });
    }
    try {
        import('https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js').catch(function(){});
    } catch(e) {}
    var checkAuth = function() {
        var ql = document.getElementById('nav-my-quotes-link');
        var ll = document.getElementById('nav-login-link');
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function(user) {
                if (ql) ql.style.display = user ? '' : 'none';
                if (ll) ll.style.display = user ? 'none' : '';
            });
        }
    };
    if (document.readyState !== 'loading') checkAuth();
    else document.addEventListener('DOMContentLoaded', checkAuth);
})();

// --- ARABIC-FIRST DETECTION ---
(function() {
    var lang = (navigator.language || '').toLowerCase();
    if (lang.indexOf('ar') === 0) {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
    }
})();

// --- BILINGUAL QUOTE BANNER (injected on every page) ---
(function() {
    if (document.getElementById('global-quote-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'global-quote-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(135deg,#0177c6,#015fa3);color:#fff;padding:8px 16px;font-family:"Outfit",sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:nowrap;font-size:12px;line-height:1.4;box-shadow:0 -4px 20px rgba(0,0,0,0.15);transform:translateY(100%);transition:transform 0.4s ease;';
    banner.innerHTML = '<span style="white-space:nowrap;"><i class="ri-file-list-3-line"></i> <strong>Request a quote for any product</strong> &mdash; click <strong>Request Quote</strong>, enter details, reply in 24h</span> <span dir="rtl" style="white-space:nowrap;font-size:11px;opacity:0.9;"><strong>اطلب عرض سعر</strong> &mdash; انقر زر طلب عرض سعر، أدخل بياناتك وسنرد خلال 24 ساعة</span> <a href="products.html#catalog-main" style="background:#ffc107;color:#0f172a;padding:5px 12px;border-radius:6px;font-weight:700;font-size:11px;text-decoration:none;white-space:nowrap;">Browse Products <span dir="rtl">تصفح المنتجات</span></a> <span onclick="this.parentElement.style.transform=\'translateY(100%)\'" style="cursor:pointer;font-size:18px;opacity:0.7;flex-shrink:0;">&times;</span>';
    document.body.appendChild(banner);
    setTimeout(function() { banner.style.transform = 'translateY(0)'; }, 3000);
})();
// -------------------------------

window.addEventListener("scroll", function () {
    var header = this.document.querySelector("nav");
    header.classList.toggle("header-scrolled", window.scrollY > 50)
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


