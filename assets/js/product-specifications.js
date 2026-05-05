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
        $('#spec-title').text(name);
        $('#spec-brand').text(p.brand || 'General');
        $('#spec-subtitle').text(`Item Code: #${p.name}`);

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

        // Fallback to attachments
        if (allImages.length === 0 && p.attachments) {
            p.attachments.forEach(att => {
                const processed = processImg(att.file_url);
                if (processed && !allImages.includes(processed)) {
                    allImages.push(processed);
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
            { label: 'Brand', value: p.brand },
            { label: 'SKU', value: p.custom_sku },
            { label: 'Model Number', value: p.custom_model_number },
            { label: 'Stock Status', value: p.stock > 0 ? 'In Stock' : 'Contact for Availability' },
            { label: 'Price', value: p.price > 0 ? `Contact for Price` : 'Request a Quote' }
        ];

        let specsHtml = '';
        specs.forEach(s => {
            if (s.value) {
                specsHtml += `
                    <tr>
                        <th>${s.label}</th>
                        <td>${s.value}</td>
                    </tr>
                `;
            }
        });
        $('#spec-table-body').html(specsHtml);

        // 4. Descriptions
        $('#spec-desc-en').html(p.custom_commercial_description || 'Detailed specifications for this product are currently being updated. Please contact our support team for immediate assistance.');
        
        if (p.custom_commercial_description_in_arabic) {
            $('#spec-desc-ar-wrapper').show();
            $('#spec-desc-ar').html(p.custom_commercial_description_in_arabic);
        }

        // 5. Button Actions
        const fullMainImg = allImages.length > 0 ? (allImages[0].startsWith('http') ? allImages[0] : `${BASE_URL}${allImages[0]}`) : 'assets/img/logo.png';
        
        $('#spec-add-cart').attr('data-id', p.name)
            .attr('data-name', name)
            .attr('data-image', fullMainImg)
            .attr('data-brand', p.brand || '');

        $('#spec-req-quote').attr('data-id', p.name)
            .attr('data-name', name)
            .attr('data-image', fullMainImg)
            .attr('data-brand', p.brand || '');

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
