import re

# 1. Update styles.css
css_path = '/Users/mubashirt/websites/onshore-website/assets/css/styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = css_content.replace('width: 350px;', 'width: 420px;').replace('right: -350px;', 'right: -420px;')
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Update cart.js
js_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Fix Header Text Wrapping
js_content = js_content.replace(
    '<h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">ENQUIRY BASKET <span dir="rtl" style="font-size: 13px; font-weight: 500; color: #666; margin-left: 5px;">| سلة الاستفسارات</span> (<span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span>)</h4>',
    '<h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #111;">ENQUIRY BASKET (<span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span>)<br><span dir="rtl" style="font-size: 14px; font-weight: 500; color: #666; display: block; margin-top: 3px;">سلة الاستفسارات</span></h4>'
)

# Fix Summary Box
js_content = js_content.replace(
    '<div style="font-size: 11px; color: #555;">Total Items <span dir="rtl" style="font-size: 10px;">/ إجمالي المنتجات</span></div>',
    '<div style="font-size: 11px; color: #555;">Total Items<br><span dir="rtl" style="font-size: 10px;">إجمالي المنتجات</span></div>'
)

js_content = js_content.replace(
    '</span> Products <span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">/ منتجات</span></div>',
    '</span> Products<br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">منتجات</span></div>'
)

js_content = js_content.replace(
    '<div style="font-size: 11px; color: #555;">Estimated Response <span dir="rtl" style="font-size: 10px;">/ الرد المتوقع</span></div>',
    '<div style="font-size: 11px; color: #555;">Estimated Response<br><span dir="rtl" style="font-size: 10px;">الرد المتوقع</span></div>'
)

js_content = js_content.replace(
    '<div style="font-size: 13px; font-weight: 700; color: #111;">Within 24 Hours <span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">/ خلال 24 ساعة</span></div>',
    '<div style="font-size: 13px; font-weight: 700; color: #111; line-height: 1.2;">Within 24 Hours<br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">خلال 24 ساعة</span></div>'
)

# Fix Bottom Buttons (Make them stack to avoid congestion)
old_buttons = """                    <!-- Buttons -->
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
                        <span class="close-cart" style="color: #015bb5; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            <i class="ri-arrow-left-line"></i> Continue Shopping <span dir="rtl" style="font-size: 11px; font-weight: 500;">/ مواصلة التسوق</span>
                        </span>
                        <button class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal" style="background: #015bb5; color: #fff; border: none; border-radius: 8px; padding: 12px 20px; font-size: 13px; font-weight: 600; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 5px;"><span dir="rtl" style="font-weight: 500; font-size: 11px; margin-right: 4px;">إرسال الطلب (إتمام الطلب)</span> REQUEST QUOTE (CHECK OUT) <i class="ri-arrow-right-line"></i></div>
                            <div style="font-size: 9px; font-weight: 400; opacity: 0.9;">We'll get back to you shortly <span dir="rtl" style="font-size: 8px;">/ سنعود إليك قريباً</span></div>
                        </button>
                    </div>"""

new_buttons = """                    <!-- Buttons -->
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
                        <button class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal" style="width: 100%; background: #015bb5; color: #fff; border: none; border-radius: 8px; padding: 15px; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap; justify-content: center;"><span dir="rtl" style="font-weight: 500; font-size: 12px;">إرسال الطلب (إتمام الطلب)</span> | REQUEST QUOTE (CHECK OUT) <i class="ri-arrow-right-line"></i></div>
                            <div style="font-size: 10px; font-weight: 400; opacity: 0.9; margin-top: 4px;">We'll get back to you shortly <span dir="rtl" style="font-size: 9px;">/ سنعود إليك قريباً</span></div>
                        </button>
                        <span class="close-cart" style="color: #015bb5; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="ri-arrow-left-line"></i> Continue Shopping <span dir="rtl" style="font-size: 12px; font-weight: 500;">/ مواصلة التسوق</span>
                        </span>
                    </div>"""

js_content = js_content.replace(old_buttons, new_buttons)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Congestion fixed!")
