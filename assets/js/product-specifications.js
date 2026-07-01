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
        let itemName = urlSearch.get('item_name');

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
    }

    function bindGalleryEvents() {
        $('.pd-thumb').on('click', function() {
            const url = $(this).data('url');
            $('.pd-thumb').removeClass('active');
            $(this).addClass('active');
            $('#current-main-img').attr('src', url);
        });
    }

    init();
});
