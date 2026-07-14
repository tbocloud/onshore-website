import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the Sidebar HTML structure
sidebar_pattern = re.compile(r'<div id="cart-sidebar">[\s\S]*?<div class="cart-footer">[\s\S]*?</div>\n            </div>')
new_sidebar = """<div id="cart-sidebar" style="background: #fdfdfd; display: flex; flex-direction: column; height: 100vh;">
                <!-- Header -->
                <div class="cart-header" style="background: #fff; padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #eef5fc; color: #015bb5; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            <i class="ri-shopping-cart-2-fill"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">QUOTE BASKET (<span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span>)</h4>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">Review your selected items before requesting a quote.</div>
                        </div>
                    </div>
                    <span class="close-cart" style="font-size: 24px; color: #444; cursor: pointer; display: flex; align-items: center;"><i class="ri-close-line"></i></span>
                </div>

                <!-- Progress Bar -->
                <div style="padding: 20px; background: #fff; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 0;">
                        <div style="position: absolute; top: 12px; left: 15%; right: 15%; height: 2px; background: #eee; z-index: 0;"></div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #015bb5; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">1</div>
                            <div style="font-size: 11px; color: #015bb5; font-weight: 600; margin-top: 8px;">Basket</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid #ddd; color: #666; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">2</div>
                            <div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px;">Contact Details</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid #ddd; color: #666; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">3</div>
                            <div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px;">Send Request</div>
                        </div>
                    </div>
                </div>

                <!-- Products -->
                <div class="cart-items" style="flex: 1; overflow-y: auto; padding: 20px; background: #fdfdfd;">
                    <!-- Items will be injected here -->
                    <div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>
                </div>

                <!-- Footer -->
                <div class="cart-footer" style="padding: 20px; background: #fff; border-top: 1px solid #eee;">
                    <!-- Summary Card -->
                    <div style="background: #f8fbff; border: 1px solid #e1effe; border-radius: 8px; padding: 15px; display: flex; margin-bottom: 20px;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 10px; border-right: 1px solid #e1effe; padding-right: 15px;">
                            <div style="color: #015bb5; font-size: 24px; opacity: 0.8;"><i class="ri-file-list-3-line"></i></div>
                            <div>
                                <div style="font-size: 11px; color: #555;">Total Items</div>
                                <div style="font-size: 14px; font-weight: 700; color: #111;"><span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span> Products</div>
                            </div>
                        </div>
                        <div style="flex: 1; display: flex; align-items: center; gap: 10px; padding-left: 15px;">
                            <div style="color: #015bb5; font-size: 24px; opacity: 0.8;"><i class="ri-time-line"></i></div>
                            <div>
                                <div style="font-size: 11px; color: #555;">Estimated Response</div>
                                <div style="font-size: 14px; font-weight: 700; color: #111;">Within 24 Hours</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Buttons -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
                        <span class="close-cart" style="color: #015bb5; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="ri-arrow-left-line"></i> Continue Shopping
                        </span>
                        <button class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal" style="background: #015bb5; color: #fff; border: none; border-radius: 8px; padding: 12px 20px; font-size: 13px; font-weight: 600; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 5px;">REQUEST QUOTE <i class="ri-arrow-right-line"></i></div>
                            <div style="font-size: 9px; font-weight: 400; opacity: 0.9;">We'll get back to you shortly</div>
                        </button>
                    </div>

                    <!-- Trust Badges -->
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 15px;">
                        <div style="display: flex; gap: 8px;">
                            <i class="ri-lock-line" style="color: #015bb5; font-size: 16px;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333;">Secure & Safe</div>
                                <div style="font-size: 9px; color: #777;">Your information is<br>100% protected</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <i class="ri-shield-check-line" style="color: #015bb5; font-size: 16px;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333;">Trusted by Industry</div>
                                <div style="font-size: 9px; color: #777;">Serving 1000+ industrial<br>clients across KSA</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <i class="ri-customer-service-2-line" style="color: #015bb5; font-size: 16px;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333;">Expert Support</div>
                                <div style="font-size: 9px; color: #777;">Our team is here to<br>help you</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>"""

content = sidebar_pattern.sub(new_sidebar, content)


# 2. Replace renderCartSidebar function
render_cart_pattern = re.compile(r'    function renderCartSidebar\(\) \{[\s\S]*?\}\n(?=    function renderModalCartSpace\(\))')
new_render_cart = """    function renderCartSidebar() {
        var $container = $('.cart-items');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="background: #fff; border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <div style="display: flex; padding: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; margin-right: 15px; border: 1px solid #f0f0f0; border-radius: 4px; padding: 4px;">
                        
                        <div style="flex: 1; min-width: 0; padding-right: 10px;">
                            <h5 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111; line-height: 1.3;">${item.name}</h5>
                            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">SKU: ${item.id}</div>
                            
                            <div style="display: flex; align-items: center; gap: 5px; color: #28a745; font-size: 11px; font-weight: 600;">
                                <i class="ri-checkbox-circle-fill"></i> In Stock
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                            <div class="remove-from-cart-btn" data-id="${item.id}" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; background: #fff0f0; color: #dc3545; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#ffdfdf'" onmouseout="this.style.backgroundColor='#fff0f0'">
                                    <i class="ri-delete-bin-line"></i>
                                </div>
                                <span style="color: #dc3545; font-size: 10px; font-weight: 500;">Remove</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px dashed #eaeaea; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; background: #fafafa;">
                        <span style="font-size: 12px; font-weight: 600; color: #444;">Quantity</span>
                        <div class="qty-control" style="display: flex; align-items: center; background: #fff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 16px; color: #555; cursor: pointer;">-</button>
                            <input type="text" value="${item.qty}" readonly style="width: 35px; height: 30px; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 13px; font-weight: 700; color: #111; padding: 0;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="increase" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 14px; color: #555; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
            `;
            $container.append(html);
        });
        
        var totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        $('.cart-count').text(totalQty);
    }
"""

content = render_cart_pattern.sub(new_render_cart, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar redesigned successfully!")
