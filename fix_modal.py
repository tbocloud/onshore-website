import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change modal-lg to modal-xl
content = content.replace('<div class="modal-dialog modal-lg">', '<div class="modal-dialog modal-xl">')

# 2. Simplify layout, removing the table and its headers
old_layout = """                                    <h4 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #333; text-align: left;">Your Products</h4>
                                    <!-- Products Table Section -->
                                    <div class="shopping-cart text-center" style="margin-bottom: 0;">
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
                                        <div id="modal-quote-cart-items" style="padding-right: 5px; max-height: 55vh; overflow-y: auto;">
                                            <table class="table" style="width: 100%; margin-bottom: 0;">
                                                <tbody id="modal-quote-cart-body">
                                                    <!-- Modal cart items will be injected here -->
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>"""

new_layout = """                                    <h4 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #333; text-align: left;">Your Products</h4>
                                    <!-- Products Section -->
                                    <div class="shopping-cart text-start" style="margin-bottom: 0;">
                                        <div id="modal-quote-cart-items" style="padding-right: 5px; max-height: 55vh; overflow-y: auto;">
                                            <div id="modal-quote-cart-body">
                                                <!-- Modal cart items will be injected here -->
                                            </div>
                                        </div>
                                    </div>"""
content = content.replace(old_layout, new_layout)

# 3. Replace renderModalCartSpace function
# Using regex to replace the whole function to avoid issues
import re
def replace_func(m):
    return """    function renderModalCartSpace() {
        var $container = $('#modal-quote-cart-body');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="padding: 20px; color: #999;">Your enquiry basket is empty.</div>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="display: flex; align-items: flex-start; margin-bottom: 15px; border: 1px solid #eaeaea; border-radius: 8px; padding: 12px; background: #fff; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; margin-right: 15px; border-radius: 6px; border: 1px solid #f5f5f5; padding: 4px; background: #fff;">
                    <div class="cart-item-details" style="flex-grow: 1; padding-right: 25px;">
                        <h5 style="margin: 0 0 4px; font-size: 13px; font-weight: 600; line-height: 1.4; color: #222;">
                            ${item.name}
                        </h5>
                        ${item.name_ar ? `<span style="display: block; font-size: 12px; color: #666; text-align: right; margin-bottom: 6px;" dir="rtl">${item.name_ar}</span>` : ''}
                        
                        ${item.brand ? `<div style="font-size: 11px; color: #0177c6; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">${item.brand}</div>` : '<div style="margin-bottom: 10px;"></div>'}
                        
                        <div class="qty-control" style="display: flex; align-items: center; margin-top: auto;">
                            <span style="font-size: 11px; color: #777; margin-right: 8px; font-weight: 600; text-transform: uppercase;">Qty:</span>
                            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: #fff;">
                                <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease" style="background: #f8f9fa; border: none; padding: 4px 10px; color: #555; cursor: pointer; font-weight: bold; font-size: 14px; line-height: 1;">-</button>
                                <input type="text" value="${item.qty}" readonly style="width: 35px; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 13px; font-weight: 600; padding: 4px 0; color: #333; outline: none;">
                                <button type="button" class="update-qty" data-id="${item.id}" data-action="increase" style="background: #f8f9fa; border: none; padding: 4px 10px; color: #555; cursor: pointer; font-weight: bold; font-size: 14px; line-height: 1;">+</button>
                            </div>
                        </div>
                    </div>
                    <span class="remove-item" data-id="${item.id}" style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: #aaa; padding: 4px; transition: color 0.2s; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%;" onmouseover="this.style.color='#dc3545'; this.style.backgroundColor='#ffeeee'" onmouseout="this.style.color='#aaa'; this.style.backgroundColor='transparent'"><i class="ri-delete-bin-line" style="font-size: 18px; font-weight: bold;"></i></span>
                </div>
            `;
            $container.append(html);
        });
    }"""

content = re.sub(r'    function renderModalCartSpace\(\) \{[\s\S]*?\}\n(?=    function openSidebar\(\))', replace_func, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal UI fixed")
