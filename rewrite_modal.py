import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the top part of the modal up to the form
top_pattern = re.compile(r'<div class="modal fade" id="quoteRequestModal"[\s\S]*?<!-- Form Section -->[\s\S]*?<form id="quote-form-modal">')

new_top = """            <!-- Request Quote Modal -->
            <div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">
                            <h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #222; display: flex; align-items: center; gap: 8px; font-size: 18px;">
                                <span>REQUEST QUOTE (CHECK OUT)</span>
                                <span dir="rtl" style="font-size: 14px; font-weight: 500; color: #888;">طلب عرض سعر</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>
                        </div>
                        <div class="modal-body" style="padding: 10px 25px 25px;">
                            
                            <!-- Selected Products Section -->
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
                            
                            <!-- Authentication Prompt (Hidden by default) -->
                            <div id="quote-auth-prompt" style="display:none; text-align:center; padding: 15px 20px; margin-bottom: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                                <i class="ri-lock-2-line" style="font-size: 36px; color: #0177c6; margin-bottom: 10px; display: inline-block;"></i>
                                <h4 style="font-weight: 700; color: #333; margin-bottom: 5px; font-size: 20px;">Sign In to Submit Your Quote</h4>
                                <p style="color: #666; margin-bottom: 15px; font-size: 13px;">Please sign in to securely process your request and link it to your account.</p>
                                <div style="max-width: 320px; margin: 0 auto; text-align: left;">
                                    <div style="margin-bottom: 10px;">
                                        <input type="email" id="cart-email-input" class="form-control" placeholder="Enter Email Address" style="border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 14px; box-shadow: none;">
                                    </div>
                                    <button type="button" id="cart-email-login-btn" class="btn btn-primary w-100" style="background: #fb641b; color: white; border: none; padding: 10px; font-size: 14px; font-weight: 600; border-radius: 4px; transition: background 0.3s;">Request Magic Link</button>
                                    <div style="display: flex; align-items: center; margin: 12px 0; color: #878787; font-size: 12px;">
                                        <div style="flex: 1; height: 1px; background: #e0e0e0;"></div><span style="padding: 0 10px; background: #fff;">OR</span><div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                                    </div>
                                    <button type="button" id="cart-google-signin-btn" class="btn w-100" style="background: #fff; color: #444; border: 1px solid #ddd; padding: 10px; font-size: 14px; font-weight: 500; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 10px;"><img src="https://www.google.com/favicon.ico" width="16" height="16"> Sign in with Google</button>
                                </div>
                            </div>
                            
                            <!-- Form Section -->
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
                                </div>
"""

content = top_pattern.sub(new_top, content)

# 2. Fix the Full Name and Email fields
fields_pattern = re.compile(r'<div class="row">[\s\S]*?<label.*?Full Name[\s\S]*?<input type="text" name="full_name" required class="form-control">[\s\S]*?</div>[\s\S]*?<div class="col-md-6"[\s\S]*?<label.*?Email[\s\S]*?<input type="email" name="email" required class="form-control">[\s\S]*?</div>')

new_fields = """                                <div class="row" style="margin: 0 -10px;">
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Full Name <span style="font-weight: normal; color: #777;">الاسم الكامل</span> *</label>
                                        <input type="text" name="full_name" required class="form-control" placeholder="Enter your full name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Email <span style="font-weight: normal; color: #777;">البريد الإلكتروني</span> *</label>
                                        <input type="email" name="email" required class="form-control" placeholder="Enter your email address" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>"""
                                    
content = fields_pattern.sub(new_fields, content)

# 3. Fix Company Name
company_pattern = re.compile(r'<div class="col-md-6"[^>]*>[\s\S]*?<label.*?Company Name[\s\S]*?<input type="text" name="company_name" class="form-control">[\s\S]*?</div>')
new_company = """                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Company Name <span style="font-weight: normal; color: #777;">اسم الشركة</span></label>
                                        <input type="text" name="company_name" class="form-control" placeholder="Enter your company name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>"""
content = company_pattern.sub(new_company, content)

# 4. Fix Country label 
country_label_pattern = re.compile(r'<div class="col-md-6"[^>]*>[\s\S]*?<label.*?Country.*?<\/label>')
new_country_label = """                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Country <span style="font-weight: normal; color: #777;">الدولة</span> *</label>"""
content = country_label_pattern.sub(new_country_label, content)

# Add styling to country select
content = content.replace('<select name="country" id="quote-country-select" class="form-select" required>', '<select name="country" id="quote-country-select" class="form-select" required style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">')


# 5. Fix City
city_pattern = re.compile(r'<div class="col-md-6"[^>]*>[\s\S]*?<label.*?City.*?<\/label>[\s\S]*?<input type="text" name="city" class="form-control">[\s\S]*?</div>')
new_city = """                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">City <span style="font-weight: normal; color: #777;">المدينة</span></label>
                                        <input type="text" name="city" class="form-control" placeholder="Enter your city" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>"""
content = city_pattern.sub(new_city, content)

# 6. Fix Mobile Number label
mobile_label_pattern = re.compile(r'<div class="col-md-6"[^>]*>[\s\S]*?<label.*?Mobile Number.*?<\/label>')
new_mobile_label = """                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Mobile Number <span style="font-weight: normal; color: #777;">رقم الجوال</span> *</label>"""
content = mobile_label_pattern.sub(new_mobile_label, content)

# Add styling to mobile input group
content = content.replace('<div class="input-group">', '<div class="input-group" style="border-radius: 6px; overflow: hidden; border: 1px solid #ddd; display: flex;">')
content = content.replace('<select name="country_code" id="quote-country-code" class="form-select" style="max-width: 110px; font-size: 13px; padding: 0.375rem 0.5rem;">', '<select name="country_code" id="quote-country-code" class="form-select" style="max-width: 130px; font-size: 13px; padding: 10px 12px; border: none; background-color: #f8f9fa; border-right: 1px solid #ddd;">')
content = content.replace('<input type="text" name="phone" required class="form-control" placeholder="Number / الرقم">', '<input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">')

# 7. Fix Promo code
promo_pattern = re.compile(r'<div class="col-md-12"[^>]*>[\s\S]*?<label.*?Promo Code.*?<\/label>[\s\S]*?<input type="text" name="promo_code".*?>[\s\S]*?</div>')
new_promo = """                                    <div class="col-md-12" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Promo Code <span style="font-weight: normal; color: #777;">رمز الخصم</span></label>
                                        <div style="position: relative;">
                                            <i class="ri-price-tag-3-line" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999;"></i>
                                            <input type="text" name="promo_code" class="form-control" placeholder="e.g. ONSHORE40" style="border-radius: 6px; font-size: 13px; padding: 10px 12px 10px 35px; border: 1px dashed #ccc; width: 100%;">
                                        </div>
                                    </div>"""
content = promo_pattern.sub(new_promo, content)

# 8. Fix turnstile padding
content = content.replace('<div class="col-md-12" style="margin-bottom: 10px;">\n                                        <div id="turnstile-container"></div>', '<div class="col-md-12" style="padding: 0 10px; margin-bottom: 10px;">\n                                        <div id="turnstile-container"></div>')

# 9. Fix Buttons
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

# Now fix renderModalCartSpace to match the mockup exactly
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

print("Modal replaced with exact mockup design")
