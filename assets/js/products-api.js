/**
 * Dynamic Product API Integration for Onshore Technical Supplies
 * Fetches product data from Frappe API and renders industries/tabs and product grids.
 */

$(document).ready(function () {
    "use strict";

    const BASE_URL = 'https://onshore.tbo365.cloud';
    const API_URL = `${BASE_URL}/api/method/onshore.api.get_item_details`;
    const AUTH_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

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

    function renderCatalog(products) {
        const tabs = $('#pills-tab');
        const tabContent = $('#pills-tabContent');
        
        // Clear existing placeholders
        tabs.empty();
        tabContent.empty();

        // Group products by Item Group (Industry)
        const categoryMap = {
            'LIFTING': 'Rigging & Lifting tools',
            'WELDING': 'Welding Equipment & Accessories',
            'SAFETY': 'Personal Protective Equipment',
            'MARINE': 'Marine & Project Supplies'
        };

        const groups = {};
        products.forEach(p => {
            const rawGroup = p.item_group || 'Other Products';
            const group = categoryMap[rawGroup] || rawGroup;
            if (!groups[group]) groups[group] = [];
            groups[group].push(p);
        });

        const categoryOrder = [
            'Rigging & Lifting tools',
            'Welding Equipment & Accessories',
            'Personal Protective Equipment',
            'Marine & Project Supplies'
        ];

        const groupKeys = Object.keys(groups).sort((a, b) => {
            const idxA = categoryOrder.indexOf(a);
            const idxB = categoryOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
        
        groupKeys.forEach((group, index) => {
            const tabId = `tab-${index}`;
            const activeClass = index === 0 ? 'active' : '';
            const showActive = index === 0 ? 'show active' : '';

            // 1. Create Tab Nav
            tabs.append(`
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeClass}" id="${tabId}-tab" data-bs-toggle="pill"
                        data-bs-target="#${tabId}" type="button" role="tab" aria-controls="${tabId}"
                        aria-selected="${index === 0}">${group}</button>
                </li>
            `);

            // 2. Create Tab Pane
            const brandsInGroup = [...new Set(groups[group].map(p => p.custom_brand_name || 'General'))];
            
            let brandFilterHtml = '';
            if (brandsInGroup.length >= 1) {
                brandFilterHtml = `
                    <div class="brand_filter_container mb-4">
                        <button class="brand_filter_btn active" data-brand="all">All Brands</button>
                        ${brandsInGroup.map(b => `<button class="brand_filter_btn" data-brand="${b.toLowerCase().replace(/\s+/g, '-')}">${b}</button>`).join('')}
                    </div>
                `;
            }

            let productsHtml = '';
            const itemsByBrand = {};
            groups[group].forEach(p => {
                const brand = p.custom_brand_name || 'General';
                if (!itemsByBrand[brand]) itemsByBrand[brand] = [];
                itemsByBrand[brand].push(p);
            });

            for (const brand in itemsByBrand) {
                const brandClass = brand.toLowerCase().replace(/\s+/g, '-');
                const brandDisplay = brand.toLowerCase() === 'europull' ? `${brand} <span class="premium_badge" style="font-size: 10px; padding: 2px 8px; border-radius: 50px; background: #0177c6; color: #fff; vertical-align: middle; margin-left: 8px;">Euro Series</span>` : brand;
                productsHtml += `
                    <div class="brand_group mb-5" data-brand="${brandClass}">
                        <h3 class="brand_title">${brandDisplay}</h3>
                        <div class="product_grid">
                            ${itemsByBrand[brand].map(p => renderProductCard(p)).join('')}
                        </div>
                    </div>
                `;
            }


            tabContent.append(`
                <div class="tab-pane fade ${showActive}" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab">
                    ${brandFilterHtml}
                    ${productsHtml}
                </div>
            `);
        });

        tabs.fadeIn();
        bindFilterEvents();
    }

    function renderProductCard(p) {
        // Handle Image URL
        let imgPath = p.image || '';
        
        // If image is missing but attachments exist
        if (!imgPath && p.attachments && p.attachments.length > 0) {
            imgPath = p.attachments[0].file_url;
        }

        // Prepend base URL if it's a relative path
        const fullImgUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`) : 'assets/img/logo.png';
        
        const name = p.item_name || p.name || 'Product';
        const arabicName = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
        const specsUrl = `./product-specifications.html#item_code=${encodeURIComponent(p.name || '')}`;

        if (!p.name) {
            console.warn("Product missing 'name' field:", p);
        }

        let rawBrandName = p.custom_brand_name || '';
        let displayBrand = rawBrandName.toUpperCase();
        if (displayBrand === 'PPE') displayBrand = 'SAFETY PRO';
        if (!displayBrand) displayBrand = 'ONSHORE';

        let isTopSeller = Math.random() > 0.75;
        let statusHtml = '';
        if (isTopSeller) {
            statusHtml = `<span style="font-size: 9px; font-weight: 700; color: #e65100; background: rgba(230, 81, 0, 0.08); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;"><span style="width: 5px; height: 5px; border-radius: 50%; background: #e65100; display: inline-block;"></span> Hot Seller</span>`;
        } else {
            statusHtml = `<span style="font-size: 9px; font-weight: 700; color: #2e7d32; background: rgba(46, 125, 50, 0.08); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;"><span style="width: 5px; height: 5px; border-radius: 50%; background: #2e7d32; display: inline-block;"></span> In Stock</span>`;
        }

        return `
            <div class="product">
                <a href="${specsUrl}" class="product_link_wrapper">
                    <div class="product_image">
                        <img src="${fullImgUrl}" class="img-fluid" alt="${name}" onerror="this.src='assets/img/logo.png'">
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 16px; margin-top: 15px; margin-bottom: 6px; width: 100%;">
                        <span style="font-size: 10px; font-weight: 800; color: #0177c6; letter-spacing: 0.8px; text-transform: uppercase;">${displayBrand}</span>
                        ${statusHtml}
                    </div>
                    <h6 class="product_name" style="${!arabicName ? 'margin-bottom: 15px;' : ''}">${name} ${arabicName ? `<span class="arabic_name" style="display: block; margin-bottom: 15px;">${arabicName}</span>` : ''}</h6>
                </a>
                <div class="product_actions">
                    <a href="javascript:void(0);" class="add-to-cart-btn" 
                       style="background-color: #0177c6; border: 1px solid #0177c6; color: #fff; padding: 8px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; letter-spacing: 0.3px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;"
                       data-id="${p.name}" 
                       data-name="${name}" 
                       data-name-ar="${arabicName}"
                       data-desc-en="${(p.custom_commercial_description || '').replace(/"/g, '&quot;')}"
                       data-desc-ar="${(p.custom_commercial_description_in_arabic || '').replace(/"/g, '&quot;')}"
                       data-image="${fullImgUrl}" 
                       data-brand="${p.custom_brand_name || ''}">
                       <i class="ri-shopping-cart-2-line" style="font-size: 13px;"></i> Add to Cart
                    </a>
                    <a href="${specsUrl}" class="view-details-btn">View Details</a>
                </div>
            </div>
        `;
    }

    function bindFilterEvents() {
        // Brand Filter
        $('.brand_filter_btn').on('click', function () {
            const brand = $(this).data('brand');
            const parentPane = $(this).closest('.tab-pane');

            parentPane.find('.brand_filter_btn').removeClass('active');
            $(this).addClass('active');

            if (brand === 'all') {
                parentPane.find('.brand_group').stop().fadeIn(400);
            } else {
                parentPane.find('.brand_group').hide();
                parentPane.find('.brand_group[data-brand="' + brand + '"]').stop().fadeIn(400);
            }
        });

        // Product Search
        $('#product-page-search').on('keyup', function() {
            const value = $(this).val().toLowerCase();
            
            $('.product').each(function() {
                const name = $(this).find('.product_name').text().toLowerCase();
                const isMatch = name.indexOf(value) > -1;
                $(this).toggle(isMatch);
            });

            // Hide brand groups if all products inside are hidden
            $('.brand_group').each(function() {
                const visibleProducts = $(this).find('.product:visible').length;
                $(this).toggle(visibleProducts > 0);
            });
            
            // Hide tabs if no products match
            $('.tab-pane').each(function() {
                const visibleGroups = $(this).find('.brand_group:visible').length;
                const tabId = $(this).attr('id');
                $(`button[data-bs-target="#${tabId}"]`).parent().toggle(visibleGroups > 0);
            });
        });
    }

    init();
});
