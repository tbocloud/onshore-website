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

// --- NAV ENHANCEMENTS (cart label, profile quotes link) ---
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
    try {
        import('https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js').catch(function(){});
    } catch(e) {}
    // Toggle visibility on auth state
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

// --- BILINGUAL QUOTE BANNER (injected on every page) ---
(function() {
    if (document.getElementById('global-quote-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'global-quote-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9998;background:linear-gradient(135deg,#0177c6,#015fa3);color:#fff;padding:10px 16px;font-family:"Outfit",sans-serif;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:13px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);transform:translateY(100%);transition:transform 0.4s ease;';
    banner.innerHTML = '<span style="display:flex;align-items:center;gap:6px;"><i class="ri-file-list-3-line" style="font-size:16px;"></i> <strong>Request a quote for any product</strong> — Add items to your enquiry basket and we\'ll respond within 24 hours</span> <span dir="rtl" style="display:flex;align-items:center;gap:6px;font-size:12px;opacity:0.95;"><strong>اطلب عرض سعر لأي منتج</strong> — أضف المنتجات إلى سلة الاستفسارات وسنرد خلال 24 ساعة</span> <a href="products.html#catalog-main" style="background:#ffc107;color:#0f172a;padding:6px 16px;border-radius:6px;font-weight:700;font-size:12px;text-decoration:none;white-space:nowrap;">Browse Products <span dir="rtl" style="margin-left:4px;">| تصفح المنتجات</span></a> <span onclick="this.parentElement.style.transform=\'translateY(100%)\'" style="cursor:pointer;font-size:18px;opacity:0.7;flex-shrink:0;">&times;</span>';
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
    const productItemsList = document.querySelectorAll('.products .product');
    const searchStatus = document.getElementById('search-status');
    const searchTerm = document.getElementById('search-term');
    const tabPanes = document.querySelectorAll('.products .tab-pane');
    
    if (searchQuery && productItemsList.length > 0) {
        const query = searchQuery.toLowerCase();
        
        if (searchStatus && searchTerm) {
            searchStatus.style.display = 'flex';
            searchTerm.textContent = searchQuery;
        }

        // Show all panes during search to find results everywhere
        tabPanes.forEach(pane => {
            pane.style.display = 'block';
            pane.style.opacity = '1';
        });

        productItemsList.forEach(item => {
            const name = item.querySelector('.product_name')?.textContent.toLowerCase() || '';
            const cat = item.querySelector('.product_cat')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.product_desc')?.textContent.toLowerCase() || '';
            
            const queryWords = query.split(/\s+/);
            const combinedText = (name + " " + cat + " " + desc).toLowerCase();
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
        const productItemsList = document.querySelectorAll('.products .product');
        const tabPanes = document.querySelectorAll('.products .tab-pane');
        
        if (query.length > 0) {
            document.body.classList.add('search-active');
            
            // Show all panes to search globally
            tabPanes.forEach(pane => {
                pane.style.display = 'block';
                pane.style.opacity = '1';
            });

            productItemsList.forEach(item => {
                const name = item.querySelector('.product_name')?.textContent.toLowerCase() || '';
                const cat = item.querySelector('.product_cat')?.textContent.toLowerCase() || '';
                const desc = item.querySelector('.product_desc')?.textContent.toLowerCase() || '';
                
                const queryWords = query.split(/\s+/);
                const combinedText = (name + " " + cat + " " + desc).toLowerCase();
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


