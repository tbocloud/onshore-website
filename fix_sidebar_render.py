import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the trust badges
old_badges = """                    <!-- Trust Badges -->
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
                    </div>"""

new_badges = """                    <!-- Trust Badges -->
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 15px; gap: 8px;">
                        <div style="display: flex; flex: 1; gap: 6px; align-items: flex-start;">
                            <i class="ri-lock-line" style="color: #015bb5; font-size: 16px; flex-shrink: 0;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333; line-height: 1.2; margin-bottom: 2px;">Secure & Safe</div>
                                <div style="font-size: 9px; color: #777; line-height: 1.3;">Your information is 100% protected</div>
                            </div>
                        </div>
                        <div style="display: flex; flex: 1; gap: 6px; align-items: flex-start;">
                            <i class="ri-shield-check-line" style="color: #015bb5; font-size: 16px; flex-shrink: 0;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333; line-height: 1.2; margin-bottom: 2px;">Trusted by Industry</div>
                                <div style="font-size: 9px; color: #777; line-height: 1.3;">Serving 1000+ industrial clients across KSA</div>
                            </div>
                        </div>
                        <div style="display: flex; flex: 1; gap: 6px; align-items: flex-start;">
                            <i class="ri-customer-service-2-line" style="color: #015bb5; font-size: 16px; flex-shrink: 0;"></i>
                            <div>
                                <div style="font-size: 10px; font-weight: 700; color: #333; line-height: 1.2; margin-bottom: 2px;">Expert Support</div>
                                <div style="font-size: 9px; color: #777; line-height: 1.3;">Our team is here to help you</div>
                            </div>
                        </div>
                    </div>"""

content = content.replace(old_badges, new_badges)

# 2. Fix the renderCartSidebar function
start_marker = "    function renderCartSidebar() {"
end_marker = "    function renderModalCartSpace() {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_render = """    function renderCartSidebar() {
        var $container = $('.cart-items');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>');
            $('.cart-count').text("0");
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
    content = content[:start_idx] + new_render + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed render and trust badges!")
