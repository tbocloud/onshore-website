$(document).ready(function () {
    "use strict";

    const BASE_URL = 'https://onshore.tbo365.cloud';
    const API_URL = `${BASE_URL}/api/method/onshore.api.get_published_items_summary`;
    const AUTH_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

    function init() {
        const urlSearch = new URLSearchParams(window.location.search);
        let itemCode = urlSearch.get('item_code') || urlSearch.get('name');

        // Improved Hash Detection
        if (!itemCode && window.location.hash) {
            const hash = window.location.hash.substring(1); // remove #
            const hashParams = new URLSearchParams(hash);
            itemCode = hashParams.get('item_code') || hashParams.get('name') || hash; // handle #72LX88 format too
        }

        console.log("Detected Item Code:", itemCode);

        if (!itemCode || itemCode === 'undefined') {
            $('#spec-loader').hide();
            $('#spec-error').show().find('p').text("No product specified in the URL. Please go back and select a product.");
            return;
        }

        fetchProductDetails(itemCode);
    }

    async function fetchProductDetails(itemCode) {
        try {
            const response = await fetch(`${API_URL}?item_code=${itemCode}`, {
                method: 'GET',
                headers: {
                    'Authorization': AUTH_TOKEN,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Product not found");

            const data = await response.json();
            // Handle both object response and array response
            let product = data.message;
            if (Array.isArray(product)) {
                product = product[0];
            }

            if (product) {
                renderProductDetails(product);
            } else {
                throw new Error("No product data found for this item code.");
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
        $('#breadcrumb-current').text(name);
        
        // Update Document Title and Meta Description dynamically
        document.title = `${name} | Onshore Technical Supplies`;
        if (p.description) {
            const plainDescForMeta = $('<div>').html(p.description).text().trim();
            if (plainDescForMeta) {
                $('meta[name="description"]').attr('content', plainDescForMeta);
            }
        }
        
        // Render Title & Arabic Item Title
        const nameAr = p.custom_item_name_in_arabic || p.item_name_in_arabic || '';
        if (nameAr) {
            $('#spec-title').html(`${name} <span class="arabic_title_name" dir="rtl">${nameAr}</span>`);
        } else {
            $('#spec-title').text(name);
        }

        const brandName = p.custom_brand_name || p.brand || 'General';
        $('#spec-brand').text(brandName);
        $('#spec-subtitle').text(`Item Code: #${p.name}`);

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
        const processImg = (path) => {
            if (!path) return null;
            // Prepend base URL if it's a relative path starting with /
            let fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path}`;
            // Encode the URL to handle spaces and parentheses (e.g. "image (2).png")
            return fullUrl.replace(/\s/g, '%20'); 
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
            $('#main-image-display').html(`<img src="${mainImgUrl}" class="img-fluid" id="current-main-img" alt="${name}" onerror="this.src='assets/img/logo.png'">`);

            if (allImages.length > 1) {
                let thumbsHtml = '';
                allImages.forEach((fullUrl, idx) => {
                    thumbsHtml += `
                        <div class="thumb_item ${idx === 0 ? 'active' : ''}" data-url="${fullUrl}">
                            <img src="${fullUrl}" alt="${name}" onerror="this.src='assets/img/logo.png'">
                        </div>
                    `;
                });
                $('#thumbnail-grid').html(thumbsHtml);
                bindGalleryEvents();
            }
        } else {
            $('#main-image-display').html(`<img src="assets/img/logo.png" class="img-fluid" alt="No image available">`);
        }

        // 3. Specifications Table
        const specs = [
            { label: 'Category', value: p.item_group },
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
                        <th>${s.label}</th>
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
                            <th>${spec.title}</th>
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

        // Tab 3: More Info Description
        const moreInfo = formatText(p.custom_product_more_information) || '';
        if (moreInfo) {
            $('#more-info-tab-li').show();
            $('#spec-more-info').html(moreInfo);
        } else {
            $('#more-info-tab-li').hide();
        }

        // 5. Button Actions
        const fullMainImg = allImages.length > 0 ? (allImages[0].startsWith('http') ? allImages[0] : `${BASE_URL}${allImages[0]}`) : 'assets/img/logo.png';
        
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
        $('.thumb_item').on('click', function() {
            const url = $(this).data('url');
            $('.thumb_item').removeClass('active');
            $(this).addClass('active');
            $('#current-main-img').attr('src', url);
        });
    }

    init();
});
