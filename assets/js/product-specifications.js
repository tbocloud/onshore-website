$(document).ready(function () {
    "use strict";

    const BASE_URL = 'https://onshore.tbo365.cloud';
    const API_URL = `${BASE_URL}/api/method/onshore.api.get_published_items_summary`;
    const AUTH_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

    const PARENT_INFO = {
        'LIFTING': { label: 'Rigging & Lifting Tools', icon: 'ri-tools-line', key: 'lifting' },
        'WELDING': { label: 'Welding Equipment & Accessories', icon: 'ri-fire-line', key: 'welding' },
        'SAFETY':  { label: 'Personal Protective Equipment', icon: 'ri-shield-user-line', key: 'ppe' },
        'PPE':     { label: 'Personal Protective Equipment', icon: 'ri-shield-user-line', key: 'ppe' },
        'MARINE':  { label: 'Marine & Project Supplies', icon: 'ri-ship-line', key: 'marine' }
    };

    function toTitleCase(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Converts a product name into a clean URL slug
    // e.g. "ORKON Wheel Wire Brush 100x16MM" => "orkon-wheel-wire-brush-100x16mm"
    function toSlug(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // remove special chars
            .trim()
            .replace(/\s+/g, '-')         // spaces to hyphens
            .replace(/-+/g, '-');         // collapse multiple hyphens
    }

    // Injects or updates the <link rel="canonical"> tag
    function setCanonical(url) {
        let tag = document.querySelector('link[rel="canonical"]');
        if (!tag) {
            tag = document.createElement('link');
            tag.rel = 'canonical';
            document.head.appendChild(tag);
        }
        tag.href = url;
    }

    function init() {
        const urlSearch = new URLSearchParams(window.location.search);
        // Use static generated slug if available, fallback to query param
        let itemName = window.SERVER_ITEM_NAME || urlSearch.get('item_name');

        // Dynamic Fallback: If the physical file isn't generated yet, the server might rewrite the URL to here.
        if (!itemName && window.location.pathname.startsWith('/product/')) {
            const pathParts = window.location.pathname.split('/');
            const filename = pathParts[pathParts.length - 1];
            if (filename.endsWith('.html')) {
                itemName = filename.replace('.html', '');
            }
        }

        // Improved Hash Detection (Fallback just in case)
        if (!itemName && window.location.hash) {
            const hash = window.location.hash.substring(1); // remove #
            const hashParams = new URLSearchParams(hash);
            itemName = hashParams.get('item_name') || hash;
        }

        console.log("Detected Item Name:", itemName);

        if (!itemName || itemName === 'undefined') {
            $('#spec-loader').hide();
            $('#spec-error').show().find('p').text("No product specified in the URL. Please go back and select a product.");
            return;
        }

        // Try to find the product in cache using either item name or slug
        const cachedData = sessionStorage.getItem('onshore_products_cache');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                const found = parsed.find(p => p.item_name === itemName || toSlug(p.item_name || p.name) === itemName);
                if (found) {
                    console.log("Product found in cache. Rendering instantly.");
                    renderProductDetails(found);
                    return;
                }
            } catch (e) {
                console.warn("Failed to parse cache in product specifications");
            }
        }

        // Cache miss: We might only have a slug. 
        // To get the exact item name for the API, fetch the catalog summary first.
        resolveSlugAndFetch(itemName);
    }

    async function resolveSlugAndFetch(slugOrName) {
        try {
            // Fetch all products to resolve the slug
            const catalogUrl = `${BASE_URL}/api/method/onshore.api.get_item_details?limit_start=0&limit_page_length=5000`;
            const catResponse = await fetch(catalogUrl, {
                headers: { 'Authorization': AUTH_TOKEN, 'Content-Type': 'application/json' }
            });
            
            if (catResponse.ok) {
                const catData = await catResponse.json();
                const products = catData.message || [];
                // Save to cache for next time
                sessionStorage.setItem('onshore_products_cache', JSON.stringify(products));
                
                const found = products.find(p => p.item_name === slugOrName || toSlug(p.item_name || p.name) === slugOrName);
                if (found) {
                    // Render directly without making a second API call since get_item_details has everything
                    renderProductDetails(found);
                    return;
                }
            }

            // Fallback: just try to fetch using what we have
            fetchProductDetails(slugOrName);
        } catch (e) {
            console.error("Error resolving slug:", e);
            fetchProductDetails(slugOrName);
        }
    }

    async function fetchProductDetails(itemName) {
        try {
            const response = await fetch(`${API_URL}?item_name=${encodeURIComponent(itemName)}`, {
                method: 'GET',
                headers: {
                    'Authorization': AUTH_TOKEN,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Product not found");

            const data = await response.json();
            let product = data.message;
            if (Array.isArray(product)) {
                product = product[0];
            }

            if (product) {
                renderProductDetails(product);
            } else {
                throw new Error("No product data found.");
            }
        } catch (error) {
            console.error("Error fetching product specifications:", error);
            $('#spec-loader').hide();
            $('#spec-error').fadeIn();
        }
    }

    function renderProductDetails(p) {
        // 1. Basic Info
        const name = p.item_name || p.name || 'Product';
        $('#hero-product-name').text(name);
        
        // Dynamically build multi-level breadcrumbs
        const parentCat = p.parent_item_group || '';
        const subCat = p.item_group || '';
        const parentLabel = parentCat ? (PARENT_INFO[parentCat.toUpperCase()]?.label || toTitleCase(parentCat)) : '';
        const subLabel = subCat ? toTitleCase(subCat) : '';

        let breadcrumbsHtml = `
            <li class="home"><a href="/" style="color: #38bdf8; font-weight: 600; text-decoration: none;">Home</a></li>
            <li style="color: rgba(255,255,255,0.4);">/</li>
            <li><a href="/products.html" style="color: #38bdf8; font-weight: 600; text-decoration: none;">Products</a></li>
        `;

        if (parentLabel) {
            const parentKey = PARENT_INFO[parentCat.toUpperCase()]?.key || parentCat.toLowerCase().replace(/\s+/g, '-');
            breadcrumbsHtml += `
                <li style="color: rgba(255,255,255,0.4);">/</li>
                <li><a href="/products.html#${parentKey}" style="color: #38bdf8; font-weight: 600; text-decoration: none;">${parentLabel}</a></li>
            `;
        }

        if (subLabel) {
            breadcrumbsHtml += `
                <li style="color: rgba(255,255,255,0.4);">/</li>
                <li style="color: #ffffff; font-weight: 500;">${subLabel}</li>
            `;
        }

        breadcrumbsHtml += `
            <li style="color: rgba(255,255,255,0.4);">/</li>
            <li style="color: rgba(255,255,255,0.85); font-weight: 400;">${name}</li>
        `;

        $('.breadcrumbs').html(breadcrumbsHtml);
        
        // ─── SEO: Canonical, Title & Meta Description ────────────────────────────
        // Canonical uses the working ?item_code= URL (no server-side routing needed)
        const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        const canonicalUrl = `${window.location.origin}/product-specifications.html?item_name=${encodeURIComponent(slug)}`;

        // Inject canonical tag so search engines index the correct URL
        setCanonical(canonicalUrl);


        // Update document title
        document.title = `${name} | Onshore Technical Supplies`;

        // Update meta description with rich content
        let metaDesc = '';
        if (p.description) {
            metaDesc = $('<div>').html(p.description).text().trim();
        }
        if (!metaDesc || metaDesc.toLowerCase() === name.toLowerCase()) {
            // Build a meaningful fallback description
            const brandPart = (p.custom_brand_name || p.brand) ? `by ${p.custom_brand_name || p.brand}` : '';
            const catPart = p.item_group ? `in ${toTitleCase(p.item_group)}` : '';
            metaDesc = `${name} ${brandPart} ${catPart}. Industrial equipment and technical supplies from Onshore Technical Supplies, Saudi Arabia.`.replace(/\s+/g, ' ').trim();
        }
        $('meta[name="description"]').attr('content', metaDesc.slice(0, 160));

        // Update OG/social meta tags too
        $('meta[property="og:title"]').attr('content', `${name} | Onshore Technical Supplies`);
        $('meta[property="og:description"]').attr('content', metaDesc.slice(0, 160));
        $('meta[property="og:url"]').attr('content', canonicalUrl);
        
        // Render Title & Arabic Item Title
        const nameAr = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
        if (nameAr) {
            $('#spec-title').html(`${name} <span class="arabic_title_name" dir="rtl">${nameAr}</span>`);
        } else {
            $('#spec-title').text(name);
        }

        const brandName = p.custom_brand_name || p.brand || 'General';
        $('#spec-brand').text(brandName);
        $('#spec-subtitle').text(`Item Name: ${p.item_name || p.name}`);

        // Dynamic summary description underneath the code
        if (p.description) {
            // Strip HTML to compare plain text, avoid rendering if it's identical to the product name
            const plainDesc = $('<div>').html(p.description).text().trim();
            if (plainDesc && plainDesc.toLowerCase() !== name.toLowerCase()) {
                $('#spec-info-desc').remove();
                $('<div class="lead mt-3 text-secondary" id="spec-info-desc" style="margin-bottom: 20px; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;"></div>').html(p.description).insertAfter('#spec-subtitle');
            }
        }

        // Render Stock for logged in users
        $('#spec-stock-info').remove();
        if (typeof p.stock === 'number') {
            const calculatedStock = Math.round(p.stock * 0.7);
            let stockHtml = '';
            if (calculatedStock > 0) {
                stockHtml = `<div class="mt-2 mb-3 auth-only-stock" id="spec-stock-info" style="display: none; font-size: 14px; color: #10b981; font-weight: 700; background: #ecfdf5; padding: 6px 12px; border-radius: 6px; border: 1px solid #d1fae5;"><i class="ri-checkbox-circle-fill" style="vertical-align: middle; margin-right: 5px;"></i>${calculatedStock} units in stock</div>`;
            } else {
                stockHtml = `<div class="mt-2 mb-3 auth-only-stock" id="spec-stock-info" style="display: none; font-size: 14px; color: #ef4444; font-weight: 700; background: #fef2f2; padding: 6px 12px; border-radius: 6px; border: 1px solid #fee2e2;"><i class="ri-close-circle-fill" style="vertical-align: middle; margin-right: 5px;"></i>Out of stock</div>`;
            }
            
            if ($('#spec-info-desc').length) {
                $(stockHtml).insertAfter('#spec-info-desc');
            } else {
                $(stockHtml).insertAfter('#spec-subtitle');
            }
        }

        // 2. Images & Gallery
        const allImages = [];
        const processImg = (imgPath) => {
            if (!imgPath) return null;
            // Prepend base URL if it's a relative path starting with /
            const fullImgUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`) : '/assets/img/logo.png';
            // Encode the URL to handle spaces and parentheses (e.g. "image (2).png")
            return fullImgUrl.replace(/\s/g, '%20'); 
        };

        // Prioritize the 'images' array as requested
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => {
                const processed = processImg(img);
                if (processed && !allImages.includes(processed)) {
                    allImages.push(processed);
                }
            });
        }

        // Add p.image if it's not already in the list
        if (p.image) {
            const processed = processImg(p.image);
            if (processed && !allImages.includes(processed)) {
                allImages.push(processed);
            }
        }

        // Add attachments to the gallery
        if (p.attachments && Array.isArray(p.attachments)) {
            p.attachments.forEach(att => {
                if (att.file_url) {
                    const processed = processImg(att.file_url);
                    if (processed && !allImages.includes(processed)) {
                        allImages.push(processed);
                    }
                }
            });
        }

        console.log("Processed Images:", allImages);

        if (allImages.length > 0) {
            const mainImgUrl = allImages[0];
            $('#main-image-display').html(`<img src="${mainImgUrl}" class="img-fluid" id="current-main-img" alt="${name}" onerror="this.src='/assets/img/logo.png'">`);

            if (allImages.length > 1) {
                let thumbsHtml = '';
                allImages.forEach((fullUrl, idx) => {
                    thumbsHtml += `
                        <div class="pd-thumb ${idx === 0 ? 'active' : ''}" data-url="${fullUrl}">
                            <img src="${fullUrl}" alt="${name}" onerror="this.src='/assets/img/logo.png'">
                        </div>
                    `;
                });
                $('#thumbnail-grid').html(thumbsHtml);
                bindGalleryEvents();
            }
        } else {
            $('#main-image-display').html(`<img src="/assets/img/logo.png" class="img-fluid" alt="No image available">`);
        }

        // 3. Specifications Table
        const parentCategory = p.parent_item_group ? (PARENT_INFO[p.parent_item_group.toUpperCase()]?.label || toTitleCase(p.parent_item_group)) : '';
        const specs = [
            { label: 'Parent Category', value: parentCategory },
            { label: 'Category', value: p.item_group ? toTitleCase(p.item_group) : '' },
            { label: 'Brand', value: brandName },
            { label: 'SKU', value: p.custom_sku },
            { label: 'Model Number', value: p.custom_model_number },
            { label: 'Stock Status', value: p.stock > 0 ? 'In Stock' : 'Contact for Availability' },
            { label: 'Delivery', value: 'Delivery will be done within 3-4 working days' },
            { label: 'Price', value: p.price > 0 ? `Contact for Price` : 'Request a Quote' }
        ];

        let specsHtml = '';
        const renderedLabels = new Set();

        specs.forEach(s => {
            if (s.value) {
                specsHtml += `
                    <tr>
                        <td>${s.label}</td>
                        <td>${s.value}</td>
                    </tr>
                `;
                renderedLabels.add(s.label.toLowerCase());
            }
        });

        // DYNAMIC CUSTOM SPECIFICATIONS ATTRIBUTES
        if (p.custom_product_specification && Array.isArray(p.custom_product_specification)) {
            p.custom_product_specification.forEach(spec => {
                if (spec.title && spec.value && !renderedLabels.has(spec.title.toLowerCase())) {
                    specsHtml += `
                        <tr>
                            <td>${spec.title}</td>
                            <td>${spec.value}</td>
                        </tr>
                    `;
                    renderedLabels.add(spec.title.toLowerCase());
                }
            });
        }

        $('#spec-table-body').html(specsHtml);

        // 4. Descriptions Mapping with Tab show/hide toggles
        
        const formatText = (text) => {
            if (!text) return '';
            // If it contains HTML block tags, assume it's already formatted
            if (/<(p|div|br|ul|li|h[1-6])[^>]*>/i.test(text)) {
                return text;
            }
            // Otherwise replace newlines with <br>
            return text.replace(/\n/g, '<br>');
        };

        // Tab 1: Commercial Description
        const commEn = formatText(p.custom_commercial_description) || '';
        const commAr = formatText(p.custom_commercial_description_in_arabic) || '';
        $('#spec-desc-en').html(commEn || 'Detailed specifications for this product are currently being updated. Please contact our support team for immediate assistance.');
        
        if (commAr) {
            $('#spec-desc-ar-wrapper').show();
            $('#spec-desc-ar').html(commAr);
        } else {
            $('#spec-desc-ar-wrapper').hide();
        }

        // Tab 2: Detailed Specs Description
        const detEn = formatText(p.custom_detailed_description) || '';
        const detAr = formatText(p.custom_detailed_description_in_arabic) || '';
        if (detEn || detAr) {
            $('#detailed-tab-li').show();
            $('#spec-detailed-en').html(detEn || '');
            if (detAr) {
                $('#spec-detailed-ar-wrapper').show();
                $('#spec-detailed-ar').html(detAr);
            } else {
                $('#spec-detailed-ar-wrapper').hide();
            }
        } else {
            $('#detailed-tab-li').hide();
        }



        // 5. Button Actions
        const fullMainImg = allImages.length > 0 ? (allImages[0].startsWith('http') ? allImages[0] : `${BASE_URL}${allImages[0]}`) : '/assets/img/logo.png';
        
        $('#spec-add-cart').attr('data-id', p.name)
            .attr('data-name', name)
            .attr('data-name-ar', nameAr)
            .attr('data-desc-en', commEn)
            .attr('data-desc-ar', commAr)
            .attr('data-image', fullMainImg)
            .attr('data-brand', brandName);

        $('#spec-req-quote').attr('data-id', p.name)
            .attr('data-name', name)
            .attr('data-name-ar', nameAr)
            .attr('data-desc-en', commEn)
            .attr('data-desc-ar', commAr)
            .attr('data-image', fullMainImg)
            .attr('data-brand', brandName);

        // Show Content
        $('#spec-loader').hide();
        $('#spec-content').fadeIn();

        // 6. Recently Viewed Products Logic
        try {
            updateRecentlyViewed(p, `/product/${slug}.html`, fullMainImg);
            renderRecentlyViewed(name);
        } catch(e) {
            console.error("Recently viewed error:", e);
        }
    }

    function bindGalleryEvents() {
        $('.pd-thumb').on('click', function() {
            const url = $(this).data('url');
            $('.pd-thumb').removeClass('active');
            $(this).addClass('active');
            $('#current-main-img').attr('src', url);
        });
    }

    function updateRecentlyViewed(product, url, imageUrl) {
        const STORAGE_KEY = 'recently_viewed_products';
        let viewed = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) viewed = JSON.parse(raw);
        } catch (e) {
            viewed = [];
        }

        const name = product.item_name || product.name;
        
        // Remove if it already exists to put it at the front
        viewed = viewed.filter(item => item.name !== name);
        
        // Add to front
        viewed.unshift({
            name: name,
            url: url,
            image: imageUrl,
            brand: product.custom_brand_name || product.brand || ''
        });
        
        // Keep only last 6 items
        if (viewed.length > 6) {
            viewed = viewed.slice(0, 6);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    }

    function renderRecentlyViewed(currentProductName) {
        const STORAGE_KEY = 'recently_viewed_products';
        let viewed = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) viewed = JSON.parse(raw);
        } catch (e) {
            return;
        }

        // Filter out the current product so we don't show what they are already looking at
        const toShow = viewed.filter(item => item.name !== currentProductName);
        
        if (toShow.length === 0) return; // Nothing else viewed

        let html = `
            <style>
                .recently-viewed-section {
                    background: #f8fafc;
                    padding: 60px 0;
                    border-top: 1px solid #e2e8f0;
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
                    /* Make it a horizontal scroll snap container on mobile */
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
                    <h3 class="recently-viewed-title">Recently Viewed Products</h3>
                    <div class="rv-grid">
        `;
        
        // Show up to 5 items max
        const limit = Math.min(toShow.length, 5);
        for (let i = 0; i < limit; i++) {
            const item = toShow[i];
            const safeName = item.name ? item.name.replace(/"/g, '&quot;') : '';
            html += `
                <a href="${item.url}" class="rv-card">
                    <div class="rv-img-wrapper">
                        <img src="${item.image}" alt="${safeName}" onerror="this.src='/assets/img/logo.png'">
                    </div>
                    <div class="rv-details">
                        ${item.brand ? `<div class="rv-brand">${item.brand}</div>` : ''}
                        <h4 class="rv-name">${item.name}</h4>
                    </div>
                </a>
            `;
        }
        
        html += `
                    </div>
                </div>
            </section>
        `;
        
        // Inject right above footer
        $('#recently-viewed-section').remove(); // Clear if re-rendered
        $('footer').before(html);
    }

    init();
});
