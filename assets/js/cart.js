/**
 * Quote Cart Logic for Onshore Technical Supplies
 * Handles adding/removing items to a quote basket using localStorage.
 */

var QuoteCart = (function ($) {
    "use strict";

    var STORAGE_KEY = 'onshore_quote_cart';
    var cart = [];

    function init() {
        injectCartSidebar();
        loadCart();
        updateCartCount();
        bindEvents();
    }

    // Inject Sidebar HTML into the DOM
    function injectCartSidebar() {
        if ($('#cart-sidebar').length > 0) return;

        var sidebarHtml = `
            <div class="cart-overlay"></div>
            <div id="cart-sidebar">
                <div class="cart-header">
                    <h4>QUOTE BASKET</h4>
                    <span class="close-cart"><i class="ri-close-line"></i></span>
                </div>
                <div class="cart-items">
                    <!-- Items will be injected here -->
                    <div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>
                </div>
                <div class="cart-footer">
                    <a href="#" class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal">Request Quote</a>
                </div>
            </div>
        `;

        var modalHtml = `
            <!-- Request Quote Modal -->
            <div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="border-radius: 0;">
                        <div class="modal-header" style="background-color: #f8f8f8; border-bottom: 1px solid #ddd;">
                            <h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <!-- Products Table Section -->
                            <div class="shopping-cart text-center" style="margin-bottom: 30px;">
                                <div class="cart-head" style="background: #f8f8f8; padding: 10px 0; font-weight: bold; border-bottom: 2px solid #ddd; margin-bottom: 15px;">
                                    <div class="row" style="margin: 0;">
                                        <div class="col-6 text-start" style="padding-left: 20px;">
                                            <h6 style="margin: 0; font-size: 14px;">PRODUCTS</h6>
                                        </div>
                                        <div class="col-3">
                                            <h6 style="margin: 0; font-size: 14px;">QTY</h6>
                                        </div>
                                        <div class="col-3">
                                            <h6 style="margin: 0; font-size: 14px;">REMOVE</h6>
                                        </div>
                                    </div>
                                </div>
                                <div id="modal-quote-cart-items" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table" style="width: 100%; margin-bottom: 0;">
                                        <tbody id="modal-quote-cart-body">
                                            <!-- Modal cart items will be injected here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- Form Section -->
                            <form id="quote-form-modal" action="https://api.web3forms.com/submit" method="POST">
                                <input type="hidden" name="access_key" value="12c3159a-b572-4a93-86fd-769ead133dd6">
                                <input type="hidden" id="modal_quote_items_data" name="items">
                                <input type="hidden" name="from_name" value="Onshore Technical Supplies - Quote Request">
                                <input type="hidden" name="subject" value="New Quote Request from onshoretechnical.com.sa">
                                <div class="row">
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Full Name *</label>
                                        <input type="text" name="name" required class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Email *</label>
                                        <input type="email" name="email" required class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Company Name</label>
                                        <input type="text" name="company" class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Country *</label>
                                        <select name="country" id="quote-country-select" class="form-select" required>
                                            <option value="">Select Country</option>
                                            <option value="Saudi Arabia" data-code="+966">Saudi Arabia</option>
                                            <option value="United Arab Emirates" data-code="+971">United Arab Emirates</option>
                                            <option value="Qatar" data-code="+974">Qatar</option>
                                            <option value="Bahrain" data-code="+973">Bahrain</option>
                                            <option value="Kuwait" data-code="+965">Kuwait</option>
                                            <option value="Oman" data-code="+968">Oman</option>
                                            <option value="Jordan" data-code="+962">Jordan</option>
                                            <option value="Egypt" data-code="+20">Egypt</option>
                                            <option value="India" data-code="+91">India</option>
                                            <option value="Pakistan" data-code="+92">Pakistan</option>
                                            <option value="United Kingdom" data-code="+44">United Kingdom</option>
                                            <option value="United States" data-code="+1">United States</option>
                                            <option value="Canada" data-code="+1">Canada</option>
                                            <option value="Turkey" data-code="+90">Turkey</option>
                                            <option value="China" data-code="+86">China</option>
                                            <option value="Germany" data-code="+49">Germany</option>
                                            <option value="France" data-code="+33">France</option>
                                            <option value="Italy" data-code="+39">Italy</option>
                                            <option value="Spain" data-code="+34">Spain</option>
                                            <option value="Other" data-code="">Other</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">District</label>
                                        <input type="text" name="district" class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Mobile Number *</label>
                                        <div class="row" style="margin: 0; gap: 5px;">
                                            <div class="col-4" style="padding: 0;">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="padding: 0.375rem 0.5rem; font-size: 13px;">
                                                    <option value="+966">+966 (KSA)</option>
                                                    <option value="+971">+971 (UAE)</option>
                                                    <option value="+974">+974 (QAT)</option>
                                                    <option value="+973">+973 (BHR)</option>
                                                    <option value="+965">+965 (KWT)</option>
                                                    <option value="+968">+968 (OMN)</option>
                                                    <option value="+91">+91 (IND)</option>
                                                    <option value="+1">+1 (USA)</option>
                                                    <option value="+44">+44 (UK)</option>
                                                    <option value="+962">+962 (JOR)</option>
                                                    <option value="+20">+20 (EGY)</option>
                                                    <option value="+92">+92 (PAK)</option>
                                                    <option value="+1">+1 (CAN)</option>
                                                    <option value="+90">+90 (TUR)</option>
                                                    <option value="+86">+86 (CHN)</option>
                                                    <option value="+49">+49 (GER)</option>
                                                    <option value="+33">+33 (FRA)</option>
                                                    <option value="+39">+39 (ITA)</option>
                                                    <option value="+34">+34 (ESP)</option>
                                                </select>
                                            </div>
                                            <div class="col-7" style="padding: 0; flex-grow: 1;">
                                                <input type="text" name="phone" required class="form-control" placeholder="Number">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-12" style="margin-bottom: 20px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Message</label>
                                        <textarea name="message" rows="4" class="form-control" placeholder="Additional details..."></textarea>
                                    </div>

                                </div>
                                <div class="text-end" style="margin-top: 20px;">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="margin-right: 10px;">Cancel</button>
                                    <button type="submit" class="btn btn-primary" style="background-color: #0275c6; border-color: #0275c6;">Submit Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(sidebarHtml);
        $('body').append(modalHtml);
    }

    function loadCart() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                cart = JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing cart data", e);
                cart = [];
            }
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCartSidebar();
        if ($('#quoteRequestModal').hasClass('show')) {
            renderModalCartSpace();
        }
    }

    function addToCart(product) {
        var existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) {
            existing.qty += product.qty || 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                image: product.image,
                url: product.url || '#',
                qty: product.qty || 1
            });
        }
        saveCart();
        openSidebar();
    }

    function removeFromCart(id) {
        cart = cart.filter(function (item) { return item.id !== id; });
        saveCart();
    }

    function updateCartCount() {
        var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
        $('.quote-basket-count').text(count);
    }

    function renderCartSidebar() {
        var $container = $('.cart-items');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="display: flex; margin-bottom: 20px; border-bottom: 1px solid #f9f9f9; padding-bottom: 15px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
                    <div class="cart-item-details" style="flex-grow: 1;">
                        <h5 style="margin: 0 0 5px; font-size: 14px;">${item.name}</h5>
                        <div class="cart-item-qty" style="font-size: 12px; color: #999;">Qty: ${item.qty}</div>
                    </div>
                    <span class="remove-from-cart-btn" data-id="${item.id}" style="cursor: pointer; color: #ff0000; padding: 0 5px;"><i class="ri-close-line"></i></span>
                </div>
            `;
            $container.append(html);
        });
    }

    function renderModalCartSpace() {
        var $container = $('#modal-quote-cart-body');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<tr><td colspan="3" class="text-center" style="padding: 20px;">Your quote basket is empty.</td></tr>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <tr>
                    <td class="text-start" style="padding: 15px 10px;">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; margin-right: 15px;">
                            <h4 style="font-size: 14px; margin: 0;">${item.name}</h4>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <div class="qty-control d-flex justify-content-center align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="decrease" style="padding: 0 8px;">-</button>
                            <input type="text" value="${item.qty}" readonly class="form-control form-control-sm mx-2" style="width: 40px; text-align: center;">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="increase" style="padding: 0 8px;">+</button>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <a href="javascript:void(0);" class="remove-item" data-id="${item.id}"><i class="ri-delete-bin-line" style="font-size: 18px; color: #999;"></i></a>
                    </td>
                </tr>
            `;
            $container.append(html);
        });
    }

    function openSidebar() {
        renderCartSidebar();
        $('#cart-sidebar').addClass('active');
        $('.cart-overlay').addClass('active');
    }

    function closeSidebar() {
        $('#cart-sidebar').removeClass('active');
        $('.cart-overlay').removeClass('active');
    }

    function bindEvents() {
        $(document).on('click', '.add-to-cart-btn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var $product = $btn.closest('.product');
            var name = $product.find('.product_name').text().trim();
            var img = $product.find('img').attr('src');

            addToCart({
                id: name,
                name: name,
                image: img
            });
        });

        $(document).on('click', '.request-quote-btn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var $product = $btn.closest('.product');
            var name = $product.find('.product_name').text().trim();
            var img = $product.find('img').attr('src');

            addToCart({
                id: name,
                name: name,
                image: img
            });
            $('#quoteRequestModal').modal('show');
        });

        $(document).on('click', '.close-cart, .cart-overlay', function () {
            closeSidebar();
        });

        $(document).on('click', '.remove-from-cart-btn, .remove-item', function (e) {
            e.preventDefault();
            removeFromCart($(this).data('id'));
        });

        $(document).on('click', '.update-qty', function () {
            var id = $(this).data('id');
            var action = $(this).data('action');
            var item = cart.find(function (i) { return i.id === id; });
            if (item) {
                if (action === 'increase') item.qty++;
                else if (action === 'decrease' && item.qty > 1) item.qty--;
                saveCart();
                renderModalCartSpace();
            }
        });

        $(document).on('change', '#quote-country-select', function () {
            var selectedCode = $(this).find(':selected').data('code');
            if (selectedCode) {
                $('#quote-country-code').val(selectedCode);
            }
        });

        $('#quote-form-modal').on('submit', function (e) {
            e.preventDefault();
            var $form = $(this);
            var $btn = $form.find('button[type="submit"]');

            // Sync cart data to the hidden input before sending
            $('#modal_quote_items_data').val(JSON.stringify(cart));

            var formData = $form.serialize();
            $btn.text('Sending...').prop('disabled', true);

            $.ajax({
                url: 'https://api.web3forms.com/submit',
                method: 'POST',
                data: formData,
                success: function (response) {
                    alert('Thank you! Your quote request has been submitted successfully.');
                    var modal = bootstrap.Modal.getInstance(document.getElementById('quoteRequestModal'));
                    modal.hide();

                    // Clear cart
                    cart = [];
                    localStorage.setItem('onshore_quote_cart', JSON.stringify(cart));
                    QuoteCart.init(); // Refresh UI
                },
                error: function (err) {
                    alert('Oops! Something went wrong while sending your request. Please try again or contact us directly.');
                },
                complete: function () {
                    $btn.text('Submit Request').prop('disabled', false);
                }
            });
        });

        var modalEl = document.getElementById('quoteRequestModal');
        if (modalEl) {
            modalEl.addEventListener('show.bs.modal', function () {
                closeSidebar();
                $('#modal_quote_items_data').val(JSON.stringify(cart));
                renderModalCartSpace();
            });
        }
    }

    return {
        init: init,
        addToCart: addToCart,
        openSidebar: openSidebar,
        closeSidebar: closeSidebar
    };

})(jQuery);

$(document).ready(function () {
    QuoteCart.init();
});
