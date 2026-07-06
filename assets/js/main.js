
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


