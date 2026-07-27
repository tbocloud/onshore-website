(function() {
    "use strict";

    let allProducts = [];
    let isFetching = false;

    // The API constants
    const BASE_URL = 'https://onshore.tbo365.cloud';
    const API_URL = `${BASE_URL}/api/method/onshore.api.get_item_details`;
    const AUTH_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

    // Build the DOM
    function injectSearchDOM() {
        // 1. Inject the overlay into body
        const overlayHTML = `
        <div class="global-search-overlay" id="globalSearchOverlay">
            <div class="global-search-container">
                <div class="global-search-header">
                    <i class="ri-search-line"></i>
                    <input type="text" class="global-search-input" id="globalSearchInput" placeholder="Search for products, brands, or categories..." autocomplete="off">
                    <button class="global-search-close" id="globalSearchClose">ESC</button>
                </div>
                <div class="global-search-results" id="globalSearchResults">
                    <!-- Results go here -->
                </div>
                <div class="global-search-empty" id="globalSearchEmpty">
                    No products found matching your search.
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlayHTML);

        // 2. Inject the search icon into the header nav-right-icons
        const rightIconsContainers = document.querySelectorAll('.nav-right-icons');
        rightIconsContainers.forEach(container => {
            const searchIconHTML = `
            <div class="nav-search-trigger" id="navSearchTrigger" role="button" aria-label="Search Products">
                <i class="ri-search-line"></i>
            </div>
            `;
            // Insert it before the first child (usually cart or contact button)
            container.insertAdjacentHTML('afterbegin', searchIconHTML);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        const triggers = document.querySelectorAll('#navSearchTrigger');
        const overlay = document.getElementById('globalSearchOverlay');
        const closeBtn = document.getElementById('globalSearchClose');
        const input = document.getElementById('globalSearchInput');

        // Open modal
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                overlay.classList.add('active');
                setTimeout(() => {
                    input.focus();
                }, 100);
                
                // Fetch data in background if not already loaded
                if (allProducts.length === 0) {
                    loadProducts();
                }
            });
        });

        // Close modal
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            input.value = '';
            document.getElementById('globalSearchResults').innerHTML = '';
        });

        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                input.value = '';
                document.getElementById('globalSearchResults').innerHTML = '';
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                input.value = '';
                document.getElementById('globalSearchResults').innerHTML = '';
            }
        });

        // Handle Search Input (Debounced slightly for performance)
        let timeout = null;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.toLowerCase().trim();
            
            timeout = setTimeout(() => {
                renderSearchResults(query);
            }, 150);
        });
    }

    async function loadProducts() {
        if (isFetching) return;
        isFetching = true;

        // 1. Try Cache
        const cachedData = sessionStorage.getItem('onshore_products_cache');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                if (parsed && parsed.length > 0) {
                    allProducts = parsed;
                    isFetching = false;
                    return;
                }
            } catch (e) {
                console.warn("Failed to parse search cache");
            }
        }

        // 2. Fetch from API
        try {
            let fetchedItems = [];
            let limitStart = 0;
            const PAGE_SIZE = 500;

            while (true) {
                const response = await fetch(`${API_URL}?limit_start=${limitStart}&limit_page_length=${PAGE_SIZE}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': AUTH_TOKEN,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) break;

                const data = await response.json();
                const products = data.message || [];
                fetchedItems = fetchedItems.concat(products);

                if (products.length < PAGE_SIZE) break; 
                limitStart += PAGE_SIZE;
            }

            allProducts = fetchedItems;

            try {
                sessionStorage.setItem('onshore_products_cache', JSON.stringify(allProducts));
            } catch (e) { }
            
        } catch (error) {
            console.error("Global Search fetch failed:", error);
        }

        isFetching = false;

        // Re-render if they typed something while it was loading
        const currentQuery = document.getElementById('globalSearchInput').value.toLowerCase().trim();
        if (currentQuery) {
            renderSearchResults(currentQuery);
        }
    }

    function renderSearchResults(query) {
        const resultsContainer = document.getElementById('globalSearchResults');
        const emptyState = document.getElementById('globalSearchEmpty');

        if (!query) {
            resultsContainer.innerHTML = '';
            emptyState.style.display = 'none';
            return;
        }

        // Show loading if data hasn't arrived yet
        if (allProducts.length === 0 && isFetching) {
            resultsContainer.innerHTML = '<div class="global-search-loading" style="text-align:center;padding:40px;color:#94a3b8;"><i class="ri-loader-4-line ri-spin" style="font-size:24px;display:block;margin-bottom:8px;"></i>Loading products...</div>';
            emptyState.style.display = 'none';
            return;
        }

        resultsContainer.innerHTML = '';

        const queryWords = query.split(/\s+/);
        
        const searchSynonyms = {
            "cutter": ["cutting", "disc", "blade"],
            "weld": ["welding", "machine", "electrode", "torch"],
            "drill": ["drilling", "bit"],
            "grind": ["grinding", "wheel", "abrasive"],
            "wire": ["brush", "rope"]
        };

        // Filter products
        const matches = allProducts.filter(item => {
            const name = (item.item_name || '').toLowerCase();
            const brand = (item.brand || '').toLowerCase();
            const cat = (item.item_group || '').toLowerCase();
            const desc = (item.description || '').toLowerCase();
            
            const combinedText = name + " " + brand + " " + cat + " " + desc;
            
            return queryWords.every(word => {
                if (combinedText.includes(word)) return true;
                if (searchSynonyms[word]) {
                    return searchSynonyms[word].some(syn => combinedText.includes(syn));
                }
                if (word.endsWith('s') && combinedText.includes(word.slice(0, -1))) return true;
                if (word.endsWith('er') && combinedText.includes(word.slice(0, -2))) return true;
                if (word.endsWith('ing') && combinedText.includes(word.slice(0, -3))) return true;
                return false;
            });
        }).slice(0, 15); // Limit to top 15 for speed

        if (matches.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        let html = '';
        matches.forEach(item => {
            const name = item.item_name || 'Unnamed Product';
            const cat = item.item_group || '';
            const brand = item.brand || '';
            
            const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
            const url = `/product/${slug}.html`;

            let imageUrl = item.image;
            if (!imageUrl || imageUrl.includes('.pdf') || imageUrl.includes('.xlsx')) {
                imageUrl = 'assets/img/placeholder.jpg';
            } else if (!imageUrl.startsWith('http')) {
                imageUrl = `${BASE_URL}${imageUrl}`;
            }

            let badgeHtml = '';
            // If logged in and approved for stock viewing, actual_qty will be returned by the API
            if (window.isUserLoggedIn && typeof item.actual_qty !== 'undefined' && item.actual_qty !== null) {
                const stockQty = Math.max(0, parseInt(item.actual_qty, 10));
                if (stockQty > 0) {
                    badgeHtml = `<span style="font-size: 11px; color: #10b981; font-weight: 700; display: inline-block; margin-left: auto;">${stockQty} in stock</span>`;
                } else {
                    badgeHtml = `<span style="font-size: 11px; color: #ef4444; font-weight: 700; display: inline-block; margin-left: auto;">Out of stock</span>`;
                }
            } else if (item.custom_top_seller) {
                badgeHtml = `<span style="font-size: 11px; color: #c05621; font-weight: 700; display: inline-block; margin-left: auto;">Hot Seller</span>`;
            }

            html += `
            <a href="${url}" class="global-search-result-item">
                <div class="global-search-item-img">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='assets/img/placeholder.jpg'">
                </div>
                <div class="global-search-item-info">
                    <div class="global-search-item-title">${name}</div>
                    <div class="global-search-item-cat">${brand} ${brand && cat ? '•' : ''} ${cat}</div>
                </div>
                ${badgeHtml}
            </a>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectSearchDOM);
    } else {
        injectSearchDOM();
    }

    // Also begin silently prefetching data if possible so search is truly instant
    setTimeout(() => {
        loadProducts();
    }, 2000); // 2 seconds after page load, quietly fetch data into cache

})();
