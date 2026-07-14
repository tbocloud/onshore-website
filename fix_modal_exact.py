import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modal properties
content = content.replace('<div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">\n                <div class="modal-dialog">', '<div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">\n                <div class="modal-dialog modal-lg">')
content = content.replace('<div class="modal-content" style="border-radius: 0;">', '<div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">')
content = content.replace('<div class="modal-header" style="background-color: #f8f8f8; border-bottom: 1px solid #ddd;">', '<div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">')
content = content.replace('<div class="modal-body" style="padding: 15px;">', '<div class="modal-body" style="padding: 10px 25px 25px;">')

# 2. Header and close btn
content = content.replace('<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE (CHECK OUT)</h5>', '<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #222; display: flex; align-items: center; gap: 8px; font-size: 18px;"><span>REQUEST QUOTE (CHECK OUT)</span><span dir="rtl" style="font-size: 14px; font-weight: 500; color: #888;">طلب عرض سعر</span></h5>')
content = content.replace('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>', '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>')

# 3. Products Area
products_area_pattern = re.compile(r'<!-- Products Table Section -->[\s\S]*?<div id="quote-auth-prompt"')
new_products_area = """<!-- Selected Products Section -->
                            <div style="border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px;">
                                    <span style="font-weight: 700; color: #333; font-size: 13px;">SELECTED PRODUCTS</span>
                                    <span dir="rtl" style="font-size: 12px; color: #888; font-weight: 500;">المنتجات المحددة</span>
                                </div>
                                <div id="modal-quote-cart-items" style="max-height: 260px; overflow-y: auto; padding-right: 5px;">
                                    <div id="modal-quote-cart-body">
                                        <!-- Products injected here -->
                                    </div>
                                </div>
                            </div>
                            <div id="quote-auth-prompt\""""
content = products_area_pattern.sub(new_products_area, content)

# 4. Form Info Headers
content = content.replace('<!-- Form Section -->\n                            <form id="quote-form-modal">', """<!-- Form Section -->
                            <form id="quote-form-modal">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-weight: 700; color: #222; font-size: 14px;">CONTACT INFORMATION</span>
                                            <span dir="rtl" style="font-size: 13px; color: #888; font-weight: 500;">بيانات الاتصال</span>
                                        </div>
                                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                            Complete the form below and we'll send you a quotation shortly.<br>
                                            <span dir="rtl" style="display: inline-block; margin-top: 2px;">يرجى تعبئة النموذج أدناه وسنقوم بإرسال عرض السعر لك قريباً.</span>
                                        </div>
                                    </div>
                                    <div style="color: #0177c6; font-size: 24px; opacity: 0.8;"><i class="ri-file-text-line"></i></div>
                                </div>""")

# 5. Add custom margin to row and fix styling for labels
content = content.replace('<div class="row">', '<div class="row" style="margin: 0 -10px;">')
content = content.replace('<div class="col-md-6" style="margin-bottom: 15px;">', '<div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">')
content = content.replace('<div class="col-md-5" style="margin-bottom: 15px;">', '<div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">')
content = content.replace('<div class="col-md-7" style="margin-bottom: 15px;">', '<div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">')
content = content.replace('<div class="col-md-12" style="margin-bottom: 15px;">', '<div class="col-md-12" style="padding: 0 10px; margin-bottom: 15px;">')

# Label replacement function
def rep_label(eng, ara, is_req=False):
    star = " *" if is_req else ""
    return content.replace(f'<label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">{eng}{star}</label>', f'<label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">{eng} <span style="font-weight: normal; color: #777;">{ara}</span>{star}</label>')

content = rep_label("Full Name", "الاسم الكامل", True)
content = rep_label("Email", "البريد الإلكتروني", True)
content = rep_label("Company Name", "اسم الشركة", False)
content = rep_label("Country", "الدولة", True)
content = rep_label("City", "المدينة", False)
content = rep_label("Mobile Number", "رقم الجوال", True)
content = rep_label("Promo Code", "رمز الخصم", False)

# 6. Inputs replacement
content = content.replace('<input type="text" name="full_name" required class="form-control">', '<input type="text" name="full_name" required class="form-control" placeholder="Enter your full name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')
content = content.replace('<input type="email" name="email" required class="form-control">', '<input type="email" name="email" required class="form-control" placeholder="Enter your email address" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')
content = content.replace('<input type="text" name="company_name" class="form-control">', '<input type="text" name="company_name" class="form-control" placeholder="Enter your company name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')
content = content.replace('<input type="text" name="city" class="form-control">', '<input type="text" name="city" class="form-control" placeholder="Enter your city" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')
content = content.replace('<select name="country" id="quote-country-select" class="form-select" required>', '<select name="country" id="quote-country-select" class="form-select" required style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')

# 7. Mobile Group replacement
mobile_group_pattern = re.compile(r'<div class="row" style="margin: 0; gap: 5px;">[\s\S]*?<select name="country_code" id="quote-country-code" class="form-select" style="padding: 0.375rem 0.5rem; font-size: 13px;">')
content = mobile_group_pattern.sub('<div class="input-group" style="border-radius: 6px; overflow: hidden; border: 1px solid #ddd; display: flex;">\n                                                <select name="country_code" id="quote-country-code" class="form-select" style="max-width: 130px; font-size: 13px; padding: 10px 12px; border: none; background-color: #f8f9fa; border-right: 1px solid #ddd;">', content)
content = content.replace('<div class="col-7" style="padding: 0; flex-grow: 1;">', '')
content = content.replace('<input type="text" name="phone" required class="form-control">', '<input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">')

# Remove the extra closing </div> for col-7
# After phone input there are three </div>. We remove one.
content = content.replace('<input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">\n                                            </div>\n                                        </div>', '<input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">\n                                        </div>')

# 8. Promo Code wrapper
promo_pattern = re.compile(r'<input type="text" name="promo_code" class="form-control">')
content = promo_pattern.sub('<div style="position: relative;">\n                                            <i class="ri-price-tag-3-line" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999;"></i>\n                                            <input type="text" name="promo_code" class="form-control" placeholder="e.g. ONSHORE40" style="border-radius: 6px; font-size: 13px; padding: 10px 12px 10px 35px; border: 1px dashed #ccc; width: 100%;">\n                                        </div>', content)

# 9. Buttons
buttons_pattern = re.compile(r'<div class="text-end" style="margin-top: 20px;">[\s\S]*?</button>[\s\S]*?</button>[\s\S]*?</div>')
new_buttons = """                                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding: 0 10px;">
                                    <button type="button" class="btn" data-bs-dismiss="modal" style="background-color: #6c757d; color: white; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إلغاء</span> Cancel
                                    </button>
                                    <button type="submit" class="btn" style="background-color: #015bb5; color: white; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إرسال الطلب</span> Submit Request <i class="ri-arrow-right-line"></i>
                                    </button>
                                </div>"""
content = buttons_pattern.sub(new_buttons, content)

# 10. renderModalCartSpace function
render_modal_pattern = re.compile(r'    function renderModalCartSpace\(\) \{[\s\S]*?\}\n(?=    function openSidebar\(\))')
new_render_modal = """    function renderModalCartSpace() {
        var $container = $('#modal-quote-cart-body');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="padding: 20px; color: #999;">Your enquiry basket is empty. / سلة الاستفسارات الخاصة بك فارغة.</div>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0;">
                        <img src="${item.image}" alt="${item.name}" style="width: 65px; height: 65px; object-fit: contain; border-radius: 4px; border: 1px solid #eee; padding: 4px;">
                        <div style="min-width: 0;">
                            <h5 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #222; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${item.name}
                            </h5>
                            ${item.desc_en ? `<div style="font-size: 12px; color: #666; margin-bottom: 4px;">${item.desc_en}</div>` : ''}
                            <div style="font-size: 11px; color: #0177c6; font-weight: 600;">SKU: ${item.id}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 20px; margin-left: 15px;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div style="font-size: 10px; font-weight: 700; color: #444; margin-bottom: 6px;">QTY / <span dir="rtl" style="font-weight: 500;">الكمية</span></div>
                            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; height: 32px;">
                                <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease" style="background: #fff; border: none; width: 30px; height: 100%; color: #555; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">-</button>
                                <input type="text" value="${item.qty}" readonly style="width: 35px; height: 100%; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 13px; font-weight: 700; color: #222; background: #f8f9fa; outline: none; padding: 0;">
                                <button type="button" class="update-qty" data-id="${item.id}" data-action="increase" style="background: #fff; border: none; width: 30px; height: 100%; color: #555; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">+</button>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div style="font-size: 10px; font-weight: 700; color: #444; margin-bottom: 6px;">REMOVE<br><span dir="rtl" style="font-weight: 500;">إزالة</span></div>
                            <button type="button" class="remove-item" data-id="${item.id}" style="background: #fff; border: 1px solid #f8d7da; border-radius: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #dc3545; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#f8d7da'" onmouseout="this.style.backgroundColor='#fff'">
                                <i class="ri-delete-bin-line" style="font-size: 16px;"></i>
                            </button>
                        </div>
                    </div>

                </div>
            `;
            $container.append(html);
        });
    }"""
content = render_modal_pattern.sub(new_render_modal, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Exact rewrite applied")
