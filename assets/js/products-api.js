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
        try {
            const response = await fetch(API_URL, {
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

            if (products.length === 0) {
                showError("No products found in the catalog.");
                return;
            }

            renderCatalog(products);

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
    function renderCatalog(products) {
        const container = $('#dynamic-products-container');
        container.empty();

        // ─── Organize products by category → brand ───
        const categoryData = {}; // { key: { label, icon, brands: { brandName: [products] } } }
        const allBrands = {};    // { brandNameLower: { display: 'Brand', count: 0 } }
        const categoryOrder = [];
        const dynamicCategoryMap = {};
        const defaultIcon = 'ri-folder-line';

        products.forEach(p => {
            const rawParent = (p.parent_item_group || '').trim().toUpperCase();
            if (!rawParent) return;

            if (!dynamicCategoryMap[rawParent]) {
                const key = rawParent.toLowerCase().replace(/\s+/g, '-');
                dynamicCategoryMap[rawParent] = {
                    key: key,
                    label: rawParent.replace(/_/g, ' '),
                    icon: defaultIcon
                };
                categoryOrder.push(key);
            }

            const catInfo = dynamicCategoryMap[rawParent];
            const catKey = catInfo.key;

            if (!categoryData[catKey]) {
                categoryData[catKey] = {
                    label: catInfo.label,
                    icon: catInfo.icon,
                    brands: {}
                };
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

        // ─── Populate sidebar category counts ───
        const catCounts = { lifting: 0, welding: 0, ppe: 0, marine: 0 };
        categoryOrder.forEach(catKey => {
            if (categoryData[catKey]) {
                Object.values(categoryData[catKey].brands).forEach(b => {
                    catCounts[catKey] += b.items.length;
                });
            }
        });

        $('#count-all').text(totalProducts);
        $('#count-lifting').text(catCounts.lifting);
        $('#count-welding').text(catCounts.welding);
        $('#count-ppe').text(catCounts.ppe);
        $('#count-marine').text(catCounts.marine);

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

        // ─── Bind add-to-cart buttons ───
        bindCartEvents();

        // ─── Run initial filter ───
        if (typeof window.filterApiCatalog === 'function') {
            window.filterApiCatalog();
        }
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
        const specsUrl = `./product-specifications.html#item_code=${encodeURIComponent(p.name || '')}`;

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
            <div class="pc" data-brand="${brandKey}" data-cat="${catKey}">
                <div class="pc-img">
                    <img src="${fullImgUrl}" alt="${name}" onerror="this.src='assets/img/logo.png'">
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
                    <p class="pc-name">${name}</p>
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

    /**
     * Bind click events for add-to-cart buttons (delegated)
     */
    function bindCartEvents() {
        $(document).off('click.apiCart', '.add-to-cart-btn').on('click.apiCart', '.add-to-cart-btn', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $btn = $(this);
            const item = {
                id: $btn.data('id'),
                name: $btn.data('name'),
                name_ar: $btn.data('name-ar') || '',
                desc_en: $btn.data('desc-en') || '',
                desc_ar: $btn.data('desc-ar') || '',
                image: $btn.data('image'),
                brand: $btn.data('brand') || ''
            };

            if (typeof QuoteCart !== 'undefined' && typeof QuoteCart.addToCart === 'function') {
                QuoteCart.addToCart(item);
            } else {
                console.warn('QuoteCart not available');
            }
        });
    }

    init();
});
