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

    let globalCatalogProducts = [];

    function isUserAuthenticated() {
        if (typeof window.isUserLoggedIn !== 'undefined' && window.isUserLoggedIn) return true;
        return !!localStorage.getItem('onshore_session_token') || !!localStorage.getItem('user_approved_for_stock') || !!localStorage.getItem('user_approved_for_pricing') || !!localStorage.getItem('onshore_brand_permissions');
    }

    function getBrandPermission(rawBrand) {
        const permsRaw = localStorage.getItem('onshore_brand_permissions');
        if (!permsRaw) return null;
        try {
            const perms = JSON.parse(permsRaw);
            const target = (rawBrand || '').trim().toUpperCase();
            if (perms[target]) return perms[target];
            for (const key of Object.keys(perms)) {
                if (key.trim().toUpperCase() === target) {
                    return perms[key];
                }
            }
        } catch(e) {}
        return null;
    }

    function isBrandPriceAllowed(rawBrand) {
        if (!isUserAuthenticated()) return false;
        if (localStorage.getItem('user_approved_for_pricing') !== '1') return false;

        const brandMode = localStorage.getItem('onshore_brand_mode');
        if (brandMode === 'Restricted Brands') {
            const perm = getBrandPermission(rawBrand);
            return !!(perm && perm.price);
        }
        return true;
    }

    function isBrandStockAllowed(rawBrand) {
        if (!isUserAuthenticated()) return false;
        if (localStorage.getItem('user_approved_for_stock') !== '1') return false;

        const brandMode = localStorage.getItem('onshore_brand_mode');
        if (brandMode === 'Restricted Brands') {
            const perm = getBrandPermission(rawBrand);
            return !!(perm && perm.stock);
        }
        return true;
    }

    function init() {
        fetchProducts();
    }

    window.addEventListener('onshore_auth_synced', () => {
        if (globalCatalogProducts && globalCatalogProducts.length > 0) {
            renderCatalog(globalCatalogProducts);
            renderFeaturedProducts(globalCatalogProducts);
            if (typeof window.filterApiCatalog === 'function') {
                window.filterApiCatalog();
            }
        }
    });

    async function fetchProducts() {
        const loader = $('#products-loader');
        
        let allItems = [];

        try {
            // 1. Check live version instantly (tiny 13 byte file, 0 lag)
            let liveVersion = 'force_update';
            try {
                const verRes = await fetch('/assets/data/version.txt?v=' + Date.now());
                if (verRes.ok) liveVersion = await verRes.text();
            } catch (e) {
                console.warn("Could not check version, proceeding with normal fetch.");
            }

            // 2. Check localStorage for matching version
            const cachedVer = localStorage.getItem('onshore_catalog_version');
            if (cachedVer && cachedVer === liveVersion) {
                try {
                    const cachedData = localStorage.getItem('onshore_catalog_data');
                    if (cachedData) {
                        allItems = JSON.parse(cachedData);
                        if (allItems && allItems.length > 0) {
                            globalCatalogProducts = allItems;
                            renderCatalog(allItems);
                            renderFeaturedProducts(allItems);
                            loader.hide(); // Hide the loader when serving from cache!
                            return; // Load instantly and exit!
                        }
                    }
                } catch (e) {
                    console.warn("Cache corrupted, re-fetching...");
                }
            }

            // 3. Fetch from server if version changed or cache missing
            loader.show();
            const response = await fetch('/assets/data/products.json?v=' + liveVersion, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allItems = await response.json();

            if (!allItems || allItems.length === 0) {
                showError("No products found in the catalog.");
                return;
            }

            // Save to Local Storage for instant loading next time
            try {
                localStorage.setItem('onshore_catalog_version', liveVersion);
                localStorage.setItem('onshore_catalog_data', JSON.stringify(allItems));
            } catch (e) {
                console.warn("Could not save to localStorage (might be full)");
            }

            // Render the catalog directly
            globalCatalogProducts = allItems;
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
                        count: 0,
                        leafcats: {}
                    };
                }
                categoryData[catKey].subcategories[subcatKey].count++;

                // Track leaf group (level 3)
                const leafcatRaw = (p.original_item_group || '').trim();
                if (leafcatRaw && leafcatRaw !== subcatRaw) {
                    const leafKey = leafcatRaw.toLowerCase().replace(/\s+/g, '-');
                    if (!categoryData[catKey].subcategories[subcatKey].leafcats[leafKey]) {
                        categoryData[catKey].subcategories[subcatKey].leafcats[leafKey] = {
                            label: toTitleCase(leafcatRaw),
                            count: 0
                        };
                    }
                    categoryData[catKey].subcategories[subcatKey].leafcats[leafKey].count++;
                }
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
                    `;

                    // Render leaf categories if any
                    const sortedLeafKeys = Object.keys(subcat.leafcats || {}).sort();
                    if (sortedLeafKeys.length > 0) {
                        subcatsHtml += `<ul class="sidebar-leafcat-list" style="display: none; list-style: none; padding-left: 12px; margin: 4px 0 0; flex-direction: column; gap: 2px;">`;
                        sortedLeafKeys.forEach(leafKey => {
                            const leafcat = subcat.leafcats[leafKey];
                            subcatsHtml += `
                                <li data-leafcat="${leafKey}">
                                    <a href="#" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; font-size: 11.5px; font-weight: 400; color: #94a3b8; border-radius: 6px; text-decoration: none; transition: all 0.2s ease;">
                                        <span>- ${leafcat.label}</span>
                                        <span class="cat-count" style="font-size: 9px; font-weight: 600; color: #94a3b8; background: #f8fafc; padding: 1px 4px; border-radius: 50px;">${leafcat.count}</span>
                                    </a>
                                </li>
                            `;
                        });
                        subcatsHtml += `</ul>`;
                    }
                    subcatsHtml += `</li>`;
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
            const leafcatHash = parts[2] || '';

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
                        
                        // Show leafcats for active subcat
                        matchingSubLi.find('.sidebar-leafcat-list').show();
                        
                        let titleLabel = matchingLi.find('> a > span:first-child').text() + ' / ' + matchingSubLi.find('> a > span:first-child').text();
                        
                        if (leafcatHash) {
                            const matchingLeafLi = matchingSubLi.find(`li[data-leafcat="${leafcatHash}"]`);
                            if (matchingLeafLi.length) {
                                matchingLeafLi.addClass('active');
                                window.activeLeafcat = leafcatHash;
                                titleLabel += ' / ' + matchingLeafLi.find('a > span:first-child').text().replace('- ', '');
                            }
                        }
                        
                        $('#catalog-title').text(titleLabel);
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
            if (typeof window.handleUrlSearch === 'function') {
                window.handleUrlSearch();
            }
            
            if (window.location.hash || window.location.search) {
                const catalogElement = document.getElementById('catalog-main');
                if (catalogElement) {
                    catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
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
        
        let fullImgUrl = 'assets/img/logo.png';
        if (imgPath) {
            if (imgPath.startsWith('http') || imgPath.startsWith('/assets/')) {
                fullImgUrl = imgPath;
            } else {
                fullImgUrl = `${BASE_URL}${imgPath}`;
            }
        }

        const name = p.item_name || p.name || 'Product';
        const arabicName = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
        
        // Generate a clean SEO-friendly slug for the URL
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        const specsUrl = `/product/${slug}.html`;

        let rawBrandName = p.custom_brand_name || '';
        let displayBrand = rawBrandName.toUpperCase();
        if (displayBrand === 'PPE') displayBrand = 'SAFETY PRO';
        if (!displayBrand) displayBrand = 'ONSHORE';

        const isTopSeller = p.custom_hot_seller === 1;
        const badgeClass = isTopSeller ? 'hot' : 'quote-badge';
        const badgeText = isTopSeller ? 'Hot Seller' : 'Request Quote';

        const escapedDescEn = (p.custom_commercial_description || '').replace(/"/g, '&quot;').replace(/'/g, "\\'").replace(/\n/g, " ").replace(/\r/g, "");
        const escapedDescAr = (p.custom_commercial_description_in_arabic || '').replace(/"/g, '&quot;').replace(/'/g, "\\'").replace(/\n/g, " ").replace(/\r/g, "");
        const safeName = name.replace(/"/g, '&quot;').replace(/'/g, "\\'");
        const safeNameAr = arabicName.replace(/"/g, '&quot;').replace(/'/g, "\\'");
        const safeBrand = rawBrandName.replace(/"/g, '&quot;').replace(/'/g, "\\'");
        const safeId = (p.name || '').replace(/'/g, "\\'");
        const authenticated = isUserAuthenticated();
        const canSeeStock = isBrandStockAllowed(rawBrandName);
        const canSeePrice = isBrandPriceAllowed(rawBrandName);

        let stockLogin = '';
        if (canSeeStock && typeof p.stock === 'number') {
            const baseStock = p.stock || 0;
            const salesOrder = p.sales_order || 0;
            let calc = (baseStock - salesOrder) * 0.8;
            if (calc > 0 && calc < 1) calc = calc >= 0.4 ? 1 : 0;
            else calc = Math.round(calc);
            calc = Math.max(0, calc);
            stockLogin = `<div class="auth-only-stock brand-stock-allowed" style="display:block !important; font-size:12px; font-weight:600; margin-top:5px;">${calc > 0 ? `<span style="color:#10b981">${calc} units in stock</span>` : `<span style="color:#ef4444">Out of stock</span>`}</div>`;
        } else if (authenticated) {
            stockLogin = `
                <div class="auth-only-stock" style="display:none; font-size:12px; font-weight:600; margin-top:5px;"></div>
                <div class="pc-badge restricted-brand-stock" style="display:inline-block !important; margin-top:5px; cursor:default;" title="Distributor pricing not configured for this brand">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;"><i class="ri-lock-line" style="vertical-align: middle; margin-right: 3px;"></i>Price &amp; stock on request</span>
                </div>
            `;
        } else {
            stockLogin = `
                <div class="auth-only-stock" style="display:none; font-size:12px; font-weight:600; margin-top:5px;"></div>
                <div class="pc-badge check-stock-trigger" style="display:inline-block !important; margin-top:5px; cursor:pointer;" onclick="window.showStockLoginModal(event)">
                    <span style="font-size: 11px; color: #64748b; font-weight: 600;"><i class="ri-information-line" style="vertical-align: middle; margin-right: 3px;"></i>Login for stock &amp; price</span>
                </div>
            `;
        }

        return `
            <div class="pc" data-brand="${brandKey}" data-cat="${catKey}" data-subcat="${p.item_group || ''}" data-leafcat="${p.original_item_group || ''}">
                <div class="pc-img">
                    <div class="pc-img-actions">
                        <span class="pc-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <a href="${specsUrl}" target="_blank">
                        <img src="${fullImgUrl}" alt="${safeName}" onerror="this.src='assets/img/logo.png'" loading="lazy" decoding="async">
                    </a>
                </div>
                <div class="pc-body">
                    <span class="pc-brand">${displayBrand}</span>
                    <a href="${specsUrl}" class="pc-name" target="_blank" title="${safeName}">${safeName}</a>
                    ${arabicName ? `<div dir="rtl" class="pc-name-ar" style="font-size: 13px; color: #666; font-weight: 600; margin-top: -4px; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${arabicName}</div>` : ''}
                    ${(() => {
                        if (!canSeePrice || typeof p.price !== 'number') {
                            return '<div class="auth-only-price" style="display: none; font-size: 15px; margin-bottom: 6px;"></div>';
                        }
                        let priceContent = '';
                        if (p.custom_is_clearance_sale && p.custom_clearance_price && p.original_price && p.original_price > p.price) {
                            const discount = Math.round(((p.original_price - p.price) / p.original_price) * 100);
                            priceContent = `<span style="color: #388e3c; font-weight: 600; margin-right: 6px; font-size: 14px;">↓${discount}%</span><span style="text-decoration: line-through; color: #878787; font-weight: 400; margin-right: 6px; font-size: 13px;">SAR ${p.original_price.toFixed(2)}</span><span style="color: #212121; font-weight: 800;">SAR ${p.price.toFixed(2)}</span>`;
                        } else {
                            priceContent = `<span style="color: #111827; font-weight: 800;">SAR ${p.price.toFixed(2)}</span>`;
                        }
                        return `<div class="auth-only-price brand-price-allowed" style="display: block !important; font-size: 15px; margin-bottom: 6px;">${priceContent}</div>`;
                    })()}
                    ${stockLogin || ''}
                    <div class="pc-actions" style="display: flex; flex-direction: column; gap: 6px; margin-top: auto;">
                        <button class="pc-btn-primary" style="width: 100%; padding: 8px 0; border-radius: 6px; font-size: 12px;"
                            onclick="QuoteCart.requestSingleQuote({id:'${safeId}',name:'${safeName}',nameAr:'${safeNameAr}',descEn:'${escapedDescEn}',descAr:'${escapedDescAr}',image:'${fullImgUrl}',brand:'${safeBrand}'})"
                            title="Request a quote for this product">
                            <i class="ri-price-tag-3-line"></i> Request Quote <span dir="rtl" style="font-size: 11px; margin-left: 2px;">| طلب عرض سعر</span>
                        </button>
                        <div style="display: flex; gap: 6px;">
                            <button class="pc-btn-secondary" style="flex: 1; padding: 6px 0; border-radius: 6px; font-size: 11px; cursor: pointer;"
                                onclick="QuoteCart.addToCart({id:'${safeId}',name:'${safeName}',name_ar:'${safeNameAr}',desc_en:'${escapedDescEn}',desc_ar:'${escapedDescAr}',image:'${fullImgUrl}',brand:'${safeBrand}'});"
                                title="Add to multi-product enquiry basket">
                                <i class="ri-shopping-cart-2-line" style="margin-right: 3px;"></i> Add to Basket
                            </button>
                            <a class="pc-btn-secondary" href="${specsUrl}" style="flex: 1; padding: 6px 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 11px; text-decoration: none;"
                                title="View full product specifications">
                                <i class="ri-eye-line" style="margin-right: 3px;"></i> View
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    function renderFeaturedProducts(products) {
        const targetItemCodes = [
            '15LB1.5X1.5',
            '15HPT2.5T',
            '15ECB-2TX6M-SSDHL',
            '15CB2X6'
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
            let fullImgUrl = 'assets/img/logo.png';
            if (imgPath) {
                if (imgPath.startsWith('http') || imgPath.startsWith('/assets/')) {
                    fullImgUrl = imgPath;
                } else {
                    fullImgUrl = `${BASE_URL}${imgPath}`;
                }
            }
            
            const name = p.item_name || p.name || 'Product';
            const escapedName = name.replace(/"/g, '&quot;');
            let rawBrandName = p.custom_brand_name || 'ONSHORE';
            
            const arabicName = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
            const escapedArabicName = arabicName.replace(/"/g, '&quot;');
            const escapedBrandName = rawBrandName.replace(/"/g, '&quot;');
            
            let descEn = p.custom_commercial_description || '';
            const escapedDescEn = descEn.replace(/"/g, '&quot;');
            
            // Status badge
            const isTopSeller = p.custom_hot_seller === 1;
            const badgeText = isTopSeller ? '<i class="ri-fire-fill"></i> Hot Seller' : '<i class="ri-checkbox-circle-fill"></i> Check Stock';
            const specsUrl = `product-specifications.html?item=${encodeURIComponent(p.name)}`;
            const badgeClass = isTopSeller ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success';
            
            let publicStockDisplay = '';
            if (typeof p.stock === 'number') {
                const baseStock = p.stock || 0;
                const salesOrder = p.sales_order || 0;
                let calculatedStock = (baseStock - salesOrder) * 0.8;
                
                if (calculatedStock > 0 && calculatedStock < 1) {
                    calculatedStock = calculatedStock >= 0.4 ? 1 : 0;
                } else {
                    calculatedStock = Math.round(calculatedStock);
                }
                calculatedStock = Math.max(0, calculatedStock);

                if (calculatedStock > 0) {
                    publicStockDisplay = `<div style="font-size: 11px; color: #6b7280; display: flex; align-items: center; margin-bottom: 12px; margin-top: auto;"><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-right: 5px;"></span><span style="color: #10b981; font-weight: 600; margin-right: 5px;">In Stock</span></div>`;
                } else {
                    publicStockDisplay = `<div style="font-size: 11px; color: #6b7280; display: flex; align-items: center; margin-bottom: 12px; margin-top: auto;"><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ef4444; margin-right: 5px;"></span><span style="color: #ef4444; font-weight: 600; margin-right: 5px;">Out of Stock</span></div>`;
                }
            } else {
                publicStockDisplay = `<div style="font-size: 11px; color: #6b7280; display: flex; align-items: center; margin-bottom: 12px; margin-top: auto;"><span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; margin-right: 5px;"></span><span style="color: #f59e0b; font-weight: 600; margin-right: 5px;">Check Stock</span></div>`;
            }

            const cardHtml = `
                <div class="col-6 col-md-3">
                    <div class="pc" style="height: 100%;">
                        <div class="pc-img">
                            <div class="pc-img-actions">
                        <span class="pc-badge ${badgeClass}">${badgeText}</span>

                            </div>
                            <a href="${specsUrl}" target="_blank">
                                <img src="${fullImgUrl}" alt="${escapedName}" onerror="this.src='assets/img/logo.png'" loading="lazy" decoding="async">
                            </a>
                        </div>
                        <div class="pc-body">
                            <span class="pc-brand">${escapedBrandName}</span>
                            <a href="${specsUrl}" class="pc-name" target="_blank" title="${escapedName}">${escapedName}</a>
                            ${escapedArabicName ? `<div dir="rtl" class="pc-name-ar" style="font-size: 13px; color: #666; font-weight: 600; margin-top: -4px; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapedArabicName}</div>` : ''}
                            <div class="auth-only-price" style="display: none; font-size: 14px; margin-bottom: 6px;">
                                ${(() => {
                                    if (p.custom_is_clearance_sale && p.custom_clearance_price && p.original_price && p.original_price > p.price) {
                                        const discount = Math.round(((p.original_price - p.price) / p.original_price) * 100);
                                        return `<span style="color: #388e3c; font-weight: 600; margin-right: 6px; font-size: 13px;">↓${discount}%</span><span style="text-decoration: line-through; color: #878787; font-weight: 400; margin-right: 6px; font-size: 12px;">SAR ${p.original_price.toFixed(2)}</span><span style="color: #212121; font-weight: 800;">SAR ${p.price.toFixed(2)}</span>`;
                                    }
                                    return `<span style="color: #111827; font-weight: 800;">SAR ${typeof p.price === 'number' ? p.price.toFixed(2) : '0.00'}</span>`;
                                })()}
                            </div>
                            ${publicStockDisplay}
                            <div class="pc-actions" style="margin-top: auto;">
                                <button class="pc-btn-primary" style="width: 100%; padding: 6px 0; border-radius: 6px;"
                                    onclick="document.getElementById('catalog-main').scrollIntoView({ behavior: 'smooth', block: 'start' }); return false;">
                                    <i class="ri-search-eye-line"></i> Explore
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(cardHtml);
        });
    }


    init();

    // Inject Stock Login Modal
    if ($('#stockLoginModal').length === 0) {
        $('body').append(`
            <div class="modal fade" id="stockLoginModal" tabindex="-1" aria-labelledby="stockLoginModalLabel" aria-hidden="true" style="z-index: 1060;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                        <div class="modal-header" style="background: #0b1120; color: white; border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 15px 20px;">
                            <h5 class="modal-title" id="stockLoginModalLabel" style="font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 18px;"><i class="ri-lock-2-line" style="margin-right: 8px; vertical-align: middle;"></i>Login Required</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center" style="padding: 30px 20px;">
                            <i class="ri-user-shared-line" style="font-size: 54px; color: #0177c6; margin-bottom: 15px; display: block;"></i>
                            <h4 style="font-family: 'Outfit', sans-serif; color: #333; margin-bottom: 10px; font-size: 22px; font-weight: 700;">Check Stock Availability</h4>
                            <p style="color: #666; font-size: 15px; margin-bottom: 25px; line-height: 1.5;">To view live inventory and stock availability for this product, please log in to your account.</p>
                            <a href="login.html" class="btn w-100" style="background: #0177c6; color: white; padding: 12px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background 0.3s ease;">Login Now</a>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    // Expose function globally so inline onclick works
    window.showStockLoginModal = function(e) {
        if(e) e.preventDefault();
        
        // If the user is already logged in but they clicked this, they might not be approved yet
        if (window.isUserLoggedIn) {
            alert("Your account is pending approval. Once approved, live stock quantities will be visible directly on all product cards.");
            return;
        }

        try {
            var modalEl = document.getElementById('stockLoginModal');
            // Try standard Bootstrap 5 API
            if (typeof bootstrap !== 'undefined') {
                var modal = bootstrap.Modal.getInstance(modalEl);
                if (!modal) {
                    modal = new bootstrap.Modal(modalEl);
                }
                modal.show();
            } else {
                // jQuery fallback for older versions
                $('#stockLoginModal').modal('show');
            }
        } catch (err) {
            console.error("Modal error:", err);
            // Absolute raw fallback
            $('#stockLoginModal').addClass('show').css('display', 'block');
            $('body').append('<div class="modal-backdrop fade show"></div>');
        }
    };

    // Show a subtle stock-login banner after 15s instead of an intrusive modal
    setTimeout(() => {
        if (!window.isUserLoggedIn && !sessionStorage.getItem('stock_banner_shown')) {
            const banner = document.getElementById('stock-login-banner');
            if (banner) banner.style.display = 'flex';
            sessionStorage.setItem('stock_banner_shown', 'true');
        }
    }, 15000);

    // Render Recently Viewed Products at the bottom of the catalog
    function renderRecentlyViewedCatalog() {
        const STORAGE_KEY = 'recently_viewed_products';
        let viewed = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) viewed = JSON.parse(raw);
        } catch (e) {
            return;
        }

        if (viewed.length === 0) return; // Nothing viewed

        let html = `
            <style>
                .recently-viewed-section {
                    background: #f8fafc;
                    padding: 60px 0;
                    border-top: 1px solid #e2e8f0;
                    margin-top: 40px;
                }
                .recently-viewed-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 30px;
                    text-align: center;
                }
                .rv-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 20px;
                }
                .rv-card {
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #f1f5f9;
                }
                .rv-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    text-decoration: none;
                }
                .rv-img-wrapper {
                    height: 180px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    border-bottom: 1px solid #f1f5f9;
                }
                .rv-img-wrapper img {
                    max-height: 100%;
                    max-width: 100%;
                    object-fit: contain;
                }
                .rv-details {
                    padding: 15px;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                }
                .rv-brand {
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 5px;
                    font-weight: 600;
                }
                .rv-name {
                    font-size: 14px;
                    color: #1e293b;
                    font-weight: 600;
                    line-height: 1.4;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @media (max-width: 1024px) {
                    .rv-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .recently-viewed-section {
                        padding: 40px 0;
                    }
                    .rv-grid {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        scroll-behavior: smooth;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: 15px;
                        gap: 15px;
                    }
                    .rv-grid::-webkit-scrollbar {
                        height: 6px;
                    }
                    .rv-grid::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 4px;
                    }
                    .rv-grid::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 4px;
                    }
                    .rv-card {
                        flex: 0 0 220px;
                        scroll-snap-align: start;
                    }
                    .rv-img-wrapper {
                        height: 150px;
                    }
                }
            </style>
            <section class="recently-viewed-section" id="recently-viewed-section">
                <div class="container">
                    <h3 class="recently-viewed-title">Recently Viewed Products <br><span dir="rtl" style="font-size: 16px; font-weight: 600; color: #64748b;">المنتجات المعروضة مؤخراً</span></h3>
                    <div class="rv-grid">
        `;
        
        const limit = Math.min(viewed.length, 5);
        for (let i = 0; i < limit; i++) {
            const item = viewed[i];
            const safeName = item.name ? item.name.replace(/"/g, '&quot;') : '';
            html += `
                <a href="${item.url}" class="rv-card">
                    <div class="rv-img-wrapper">
                        <img src="${item.image}" alt="${safeName}" onerror="this.src='/assets/img/logo.png'">
                    </div>
                    <div class="rv-details">
                        ${item.brand ? `<div class="rv-brand">${item.brand}</div>` : ''}
                        <h4 class="rv-name">${item.name}</h4>
                        ${item.nameAr ? `<div dir="rtl" style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.nameAr}</div>` : ''}
                    </div>
                </a>
            `;
        }
        
        html += `
                    </div>
                </div>
            </section>
        `;
        
        $('#recently-viewed-section').remove();
        $('footer').before(html);
    }

    renderRecentlyViewedCatalog();
});
