/**
 * Dynamic Product API Integration for Onshore Technical Supplies
 * Fetches product data from Frappe API and renders the modern
 * sidebar + grid catalog layout (HydroTech-Style) on product-details.html.
 *
 * CTAs: "Add to Cart" + "View Details"
 */

$(document).ready(function () {
    "use strict";

    const BASE_URL = 'https://onshore.tbo365.cloud';
    const API_URL = `${BASE_URL}/api/method/onshore.api.get_item_details`;
    const AUTH_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

    // Dynamic category mapping will be built during rendering based on API data

    // Brand pill color classes (matching products-redesign.css)
    const BRAND_COLORS = {
        'europull': 'europull', 'techweld': 'techweld', 'toyo': 'toyo',
        'liftek': 'liftek', 'toyolift': 'toyolift', 'rigman': 'rigman',
        'geotex': 'geotex', 'weldman': 'weldman', 'sakura': 'sakura', 'orkon': 'orkon'
    };

    function init() {
        fetchProducts();
    }

    async function fetchProducts() {
        const loader = $('#products-loader');
        
        // 1. Check Session Storage (Browser Cache)
        const cachedData = sessionStorage.getItem('onshore_products_cache');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                if (parsed && parsed.length > 0) {
                    renderCatalog(parsed);
                    renderFeaturedProducts(parsed);
                    loader.hide(); // Hide the loader when serving from cache!
                    return; // Load instantly and exit!
                }
            } catch (e) {
                console.warn("Failed to parse cache");
            }
        }

        // 2. Fetch from API if not cached
        loader.show();
        let allItems = [];
        let limitStart = 0;
        const PAGE_SIZE = 500; // Increased to 500 to fetch data in fewer roundtrips

        try {
            while (true) {
                const response = await fetch(`${API_URL}?limit_start=${limitStart}&limit_page_length=${PAGE_SIZE}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': AUTH_TOKEN,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const products = data.message || [];
                
                allItems = allItems.concat(products);

                if (products.length < PAGE_SIZE) {
                    break; 
                }
                
                limitStart += PAGE_SIZE;
            }

            if (allItems.length === 0) {
                showError("No products found in the catalog.");
                return;
            }

            // Save to Session Storage
            try {
                sessionStorage.setItem('onshore_products_cache', JSON.stringify(allItems));
            } catch (e) {
                console.warn("Could not save to sessionStorage (might be full)");
            }

            renderCatalog(allItems);
            renderFeaturedProducts(allItems);

        } catch (error) {
            console.error("Failed to fetch products:", error);
            showError("Unable to load products at the moment. We are performing database maintenance. Please try again later.");
        } finally {
            loader.hide();
        }
    }

    function showError(message) {
        $('#products-loader').hide();
        $('#api-error-message').find('p').text(message);
        $('#api-error-message').fadeIn();
    }

    /**
     * Main render function — builds:
     * 1. Category sections with brand sub-headers and .pc card grids
     * 2. Sidebar brand checkboxes with counts
     * 3. Sidebar category counts
     */
    const PARENT_INFO = {
        'LIFTING': { label: 'Rigging & Lifting Tools', icon: 'ri-tools-line', key: 'lifting' },
        'WELDING': { label: 'Welding Equipment & Accessories', icon: 'ri-fire-line', key: 'welding' },
        'SAFETY': { label: 'Personal Protective Equipment', icon: 'ri-shield-user-line', key: 'ppe' },
        'PPE': { label: 'Personal Protective Equipment', icon: 'ri-shield-user-line', key: 'ppe' },
        'MARINE': { label: 'Marine & Project Supplies', icon: 'ri-ship-line', key: 'marine' }
    };

    /**
     * Main render function — builds:
     * 1. Category sections with brand sub-headers and .pc card grids
     * 2. Sidebar dynamic categories list with counts
     * 3. Sidebar brand checkboxes with counts
     */
    function renderCatalog(products, hasMore = false) {
        const container = $('#dynamic-products-container');
        function toTitleCase(str) {
            if (!str) return '';
            return str.toLowerCase().split(' ').map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
        }

        container.empty();

        // ─── Organize products by category → subcategory → brand ───
        const categoryData = {}; // { key: { label, icon, subcategories: { subcatKey: { label, count } }, brands: { brandName: [products] } } }
        const allBrands = {};    // { brandNameLower: { display: 'Brand', count: 0 } }
        const categoryOrder = [];
        const dynamicCategoryMap = {};
        const defaultIcon = 'ri-folder-line';

        products.forEach(p => {
            const rawParent = (p.parent_item_group || '').trim().toUpperCase();
            if (!rawParent) return;

            if (!dynamicCategoryMap[rawParent]) {
                const info = PARENT_INFO[rawParent] || {
                    key: rawParent.toLowerCase().replace(/\s+/g, '-'),
                    label: rawParent.charAt(0) + rawParent.slice(1).toLowerCase().replace(/_/g, ' '),
                    icon: defaultIcon
                };
                dynamicCategoryMap[rawParent] = info;
                categoryOrder.push(info.key);
            }

            const catInfo = dynamicCategoryMap[rawParent];
            const catKey = catInfo.key;

            if (!categoryData[catKey]) {
                categoryData[catKey] = {
                    label: catInfo.label,
                    icon: catInfo.icon,
                    subcategories: {},
                    brands: {}
                };
            }

            // Track subcategory count
            const subcatRaw = (p.item_group || '').trim();
            if (subcatRaw) {
                const subcatKey = subcatRaw.toLowerCase().replace(/\s+/g, '-');
                if (!categoryData[catKey].subcategories[subcatKey]) {
                    categoryData[catKey].subcategories[subcatKey] = {
                        label: toTitleCase(subcatRaw),
                        count: 0
                    };
                }
                categoryData[catKey].subcategories[subcatKey].count++;
            }

            const brandRaw = (p.custom_brand_name || 'General').trim();
            const brandLower = brandRaw.toLowerCase().replace(/\s+/g, '-');

            if (!categoryData[catKey].brands[brandLower]) {
                categoryData[catKey].brands[brandLower] = {
                    display: brandRaw,
                    items: []
                };
            }

            categoryData[catKey].brands[brandLower].items.push(p);

            if (!allBrands[brandLower]) {
                allBrands[brandLower] = { display: brandRaw, count: 0 };
            }
            allBrands[brandLower].count++;
        });

        // ─── Render Category Sections ───
        let totalProducts = 0;

        categoryOrder.forEach(catKey => {
            const cat = categoryData[catKey];
            if (!cat) return;

            let sectionHtml = '';
            sectionHtml += `<div class="cat-section" id="${catKey}-section" data-cat="${catKey}">`;
            sectionHtml += `<div class="cat-section-header">`;
            sectionHtml += `<h3 class="cat-section-title">`;
            sectionHtml += `<span class="section-icon"><i class="${cat.icon}"></i></span>`;
            sectionHtml += `${cat.label}`;
            sectionHtml += `</h3></div>`;

            // Sort brands alphabetically
            const sortedBrands = Object.keys(cat.brands).sort();

            sortedBrands.forEach(brandKey => {
                const brandData = cat.brands[brandKey];
                const brandColorClass = BRAND_COLORS[brandKey] || '';

                // Brand sub-header
                sectionHtml += `<div class="brand-subheader" data-brand-group="${brandKey}-${catKey}">`;
                sectionHtml += `<span class="brand-pill-label ${brandColorClass}">${brandData.display}</span>`;
                sectionHtml += `<div class="brand-divider"></div>`;
                sectionHtml += `</div>`;

                // Product grid
                sectionHtml += `<div class="cat-product-grid" data-brand-grid="${brandKey}-${catKey}">`;

                brandData.items.forEach(p => {
                    sectionHtml += renderProductCard(p, catKey, brandKey);
                    totalProducts++;
                });

                sectionHtml += `</div>`; // .cat-product-grid
            });

            sectionHtml += `</div>`; // .cat-section
            container.append(sectionHtml);
        });

        // ─── Populate sidebar categories dynamically ───
        const catListContainer = $('#widget-categories');
        catListContainer.empty();

        // Add "All Products" item
        catListContainer.append(`
            <li class="active" data-cat="all">
                <a href="#"><span>All Products</span><span class="cat-count" id="count-all">${totalProducts}</span></a>
            </li>
        `);

        categoryOrder.forEach(catKey => {
            const cat = categoryData[catKey];
            let catCount = 0;
            if (cat && cat.brands) {
                Object.values(cat.brands).forEach(b => {
                    catCount += b.items.length;
                });
            }

            let subcatsHtml = '';
            const sortedSubcatKeys = Object.keys(cat.subcategories || {}).sort();
            if (sortedSubcatKeys.length > 0) {
                subcatsHtml += `<ul class="sidebar-subcat-list" style="display: none; list-style: none; padding-left: 16px; margin: 4px 0 0; flex-direction: column; gap: 4px;">`;
                sortedSubcatKeys.forEach(subKey => {
                    const subcat = cat.subcategories[subKey];
                    subcatsHtml += `
                        <li data-subcat="${subKey}">
                            <a href="#" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; font-size: 12px; font-weight: 400; color: #64748b; border-radius: 6px; text-decoration: none; transition: all 0.2s ease;">
                                <span>${subcat.label}</span>
                                <span class="cat-count" style="font-size: 9.5px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 1px 5px; border-radius: 50px;">${subcat.count}</span>
                            </a>
                        </li>
                    `;
                });
                subcatsHtml += `</ul>`;
            }

            catListContainer.append(`
                <li data-cat="${catKey}">
                    <a href="#"><span>${cat.label}</span><span class="cat-count" id="count-${catKey}">${catCount}</span></a>
                    ${subcatsHtml}
                </li>
            `);
        });

        // ─── Populate sidebar brand checkboxes ───
        const brandsContainer = $('#widget-brands');
        brandsContainer.empty();

        const sortedAllBrands = Object.keys(allBrands).sort();
        sortedAllBrands.forEach(brandKey => {
            const brand = allBrands[brandKey];
            brandsContainer.append(`
                <label class="sid-check">
                    <input type="checkbox" class="api-brand-cb" value="${brandKey}" checked>
                    ${brand.display}
                    <span class="check-count">(${brand.count})</span>
                </label>
            `);
        });

        // ─── Update visible count ───
        $('#visible-count').text(totalProducts);

        // ─── Check Hash for Active Category / Subcategory on Load ───
        if (window.location.hash) {
            const hashVal = window.location.hash.substring(1).toLowerCase();
            const parts = hashVal.split(':');
            const catHash = parts[0];
            const subcatHash = parts[1] || '';

            const matchingLi = catListContainer.find(`li[data-cat="${catHash}"]`);
            if (matchingLi.length) {
                catListContainer.find('li').removeClass('active');
                matchingLi.addClass('active');

                // Show nested subcategories for active parent
                matchingLi.find('.sidebar-subcat-list').show();

                if (subcatHash) {
                    const matchingSubLi = matchingLi.find(`li[data-subcat="${subcatHash}"]`);
                    if (matchingSubLi.length) {
                        matchingSubLi.addClass('active');
                        window.activeSubcat = subcatHash;
                        const parentLabel = matchingLi.find('> a > span:first-child').text();
                        const subLabel = matchingSubLi.find('a > span:first-child').text();
                        $('#catalog-title').text(`${parentLabel} / ${subLabel}`);
                    }
                } else {
                    const catLabel = matchingLi.find('> a > span:first-child').text();
                    $('#catalog-title').text(catLabel);
                }
            }
        }

        // ─── Run initial filter ───
        setTimeout(() => {
            if (typeof window.filterApiCatalog === 'function') {
                window.filterApiCatalog();
            }
        }, 50);
    }

    /**
     * Renders a single modern .pc product card
     * CTAs: "Add to Cart" + "View Details"
     */
    function renderProductCard(p, catKey, brandKey) {
        let imgPath = p.image || '';
        if (!imgPath && p.attachments && p.attachments.length > 0) {
            imgPath = p.attachments[0].file_url;
        }
        const fullImgUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`) : 'assets/img/logo.png';

        const name = p.item_name || p.name || 'Product';
        const arabicName = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
        
        // Generate a clean SEO-friendly slug for the URL
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        const specsUrl = `/product-specifications.html#${slug}`;

        let rawBrandName = p.custom_brand_name || '';
        let displayBrand = rawBrandName.toUpperCase();
        if (displayBrand === 'PPE') displayBrand = 'SAFETY PRO';
        if (!displayBrand) displayBrand = 'ONSHORE';

        // Status badge — deterministic based on product name hash
        const nameHash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const isTopSeller = nameHash % 4 === 0;
        const badgeClass = isTopSeller ? 'hot' : 'stock';
        const badgeText = isTopSeller ? 'Hot Seller' : 'In Stock';

        const escapedDescEn = (p.custom_commercial_description || '').replace(/"/g, '&quot;');
        const escapedDescAr = (p.custom_commercial_description_in_arabic || '').replace(/"/g, '&quot;');

        return `
            <div class="pc" data-brand="${brandKey}" data-cat="${catKey}" data-subcat="${p.item_group || ''}">
                <div class="pc-img">
                    <img src="${fullImgUrl}" alt="${name}" onerror="this.src='assets/img/logo.png'" loading="lazy" decoding="async">
                    <div class="pc-img-actions">
                        <button class="pc-icon-btn add-to-cart-btn"
                            data-id="${p.name || ''}"
                            data-name="${name}"
                            data-name-ar="${arabicName}"
                            data-desc-en="${escapedDescEn}"
                            data-desc-ar="${escapedDescAr}"
                            data-image="${fullImgUrl}"
                            data-brand="${rawBrandName}"
                            title="Add to Cart">
                            <i class="ri-shopping-cart-line"></i>
                        </button>
                        <a class="pc-icon-btn" href="${specsUrl}" title="View Details">
                            <i class="ri-eye-line"></i>
                        </a>
                    </div>
                </div>
                <div class="pc-body">
                    <div class="pc-meta">
                        <span class="pc-brand">${displayBrand}</span>
                        <span class="pc-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    ${p.item_group ? `<span class="pc-subcat" style="font-size: 11px; font-weight: 700; color: #0177c6; display: block; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Outfit', sans-serif;"><i class="ri-folder-open-line" style="vertical-align: middle; margin-right: 3px;"></i>${p.parent_item_group ? `${p.parent_item_group.trim().toUpperCase()} / ` : ''}${p.item_group.trim().toUpperCase()}</span>` : ''}
                    <p class="pc-name" style="margin-top: 4px; font-weight: 600; line-height: 1.4;">${name}</p>
                    ${arabicName ? `<span class="pc-arabic">${arabicName}</span>` : ''}
                    <div class="pc-actions">
                        <button class="pc-btn-primary add-to-cart-btn"
                            data-id="${p.name || ''}"
                            data-name="${name}"
                            data-name-ar="${arabicName}"
                            data-desc-en="${escapedDescEn}"
                            data-desc-ar="${escapedDescAr}"
                            data-image="${fullImgUrl}"
                            data-brand="${rawBrandName}">
                            <i class="ri-shopping-cart-2-line"></i> Add to Cart
                        </button>
                        <a class="pc-btn-secondary" href="${specsUrl}">
                            <i class="ri-eye-line"></i> View Details
                        </a>
                    </div>
                </div>
            </div>
        `;
    }


    function renderFeaturedProducts(products) {
        const targetItemCodes = [
            '15LB1.5X1.5',
            '76REMOTE-ECB1T-5T-SSDHL',
            '15ECB-2TX6M-SSDHL'
        ];
        
        let featured = products.filter(p => targetItemCodes.includes(p.name));
        
        // Remove duplicates if the API happens to return multiple of the same item
        const uniqueFeatured = [];
        const seenNames = new Set();
        for (const p of featured) {
            if (!seenNames.has(p.name)) {
                uniqueFeatured.push(p);
                seenNames.add(p.name);
            }
        }
        featured = uniqueFeatured;

        if (featured.length < 4) {
            const productsWithImages = products.filter(p => {
                let imgPath = p.image || '';
                if (!imgPath && p.attachments && p.attachments.length > 0) {
                    imgPath = p.attachments[0].file_url;
                }
                return imgPath && !targetItemCodes.includes(p.name);
            });
            featured = featured.concat(productsWithImages.slice(0, 4 - featured.length));
        }
        if (featured.length === 0) return;

        const container = $('#featuredProductGrid');
        if (!container.length) return;
        
        container.empty();

        featured.forEach((p) => {
            let imgPath = p.image || '';
            if (!imgPath && p.attachments && p.attachments.length > 0) {
                imgPath = p.attachments[0].file_url;
            }
            const fullImgUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`) : 'assets/img/logo.png';
            
            const name = p.item_name || p.name || 'Product';
            const escapedName = name.replace(/"/g, '&quot;');
            let rawBrandName = p.custom_brand_name || 'ONSHORE';
            
            const arabicName = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
            const escapedArabicName = arabicName.replace(/"/g, '&quot;');
            const escapedBrandName = rawBrandName.replace(/"/g, '&quot;');
            
            let descEn = p.custom_commercial_description || '';
            const escapedDescEn = descEn.replace(/"/g, '&quot;');

            const nameHash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const isTopSeller = nameHash % 3 === 0;
            const badgeBg = isTopSeller ? '#fff5f5' : '#f0fdf4';
            const badgeBorder = isTopSeller ? '#fecdd3' : '#bbf7d0';
            const badgeColor = isTopSeller ? '#e11d48' : '#16a34a';
            const badgeIcon = isTopSeller ? 'ri-fire-fill' : 'ri-checkbox-circle-fill';
            const badgeText = isTopSeller ? 'Hot Seller' : 'In Stock';
            
            const cardHtml = `
                <div class="col-6 col-md-3">
                    <div class="card h-100 border-0 text-center p-2" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: #fff;">
                        <div style="height: 110px; display: flex; align-items: center; justify-content: center; padding: 10px;">
                            <img src="${fullImgUrl}" style="max-height: 100px; max-width: 100%; object-fit: contain;" alt="${escapedName}" onerror="this.src='assets/img/logo.png'">
                        </div>
                        <div class="card-body p-1 mt-2 d-flex flex-column">
                            <h6 class="card-title text-dark fw-bold mb-2" style="font-size: 12px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 31px;">${escapedName}</h6>
                            <div class="mb-2 mt-auto">
                                <span style="font-size: 10px; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; border: 1px solid ${badgeBorder}; padding: 3px 8px; border-radius: 4px; display: inline-block;">
                                    <i class="${badgeIcon}"></i> ${badgeText}
                                </span>
                            </div>
                            <button class="btn w-100" 
                                onclick="document.getElementById('catalog-main').scrollIntoView({ behavior: 'smooth', block: 'start' }); return false;"
                                style="background: #0177c6; color: white; font-weight: 700; border-radius: 6px; font-size: 12px; padding: 6px 0; transition: all 0.3s ease;">
                                <i class="ri-search-eye-line"></i> Explore
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.append(cardHtml);
        });
    }


    init();
});
