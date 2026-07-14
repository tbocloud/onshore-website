import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '<h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">QUOTE BASKET': 
    '<h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111;">QUOTE BASKET <span dir="rtl" style="font-size: 13px; font-weight: 500; color: #666; margin-left: 5px;">| سلة العروض</span>',
    
    '<div style="font-size: 12px; color: #666; margin-top: 4px;">Review your selected items before requesting a quote.</div>': 
    '<div style="font-size: 12px; color: #666; margin-top: 4px;">Review your selected items before requesting a quote.<br><span dir="rtl" style="display:inline-block; font-size: 11px; margin-top:2px;">راجع العناصر المحددة قبل طلب عرض السعر.</span></div>',
    
    '<div style="font-size: 11px; color: #015bb5; font-weight: 600; margin-top: 8px;">Basket</div>': 
    '<div style="font-size: 11px; color: #015bb5; font-weight: 600; margin-top: 8px; text-align: center;">Basket<br><span dir="rtl" style="font-weight: 500;">السلة</span></div>',
    
    '<div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px;">Contact Details</div>': 
    '<div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px; text-align: center;">Contact Details<br><span dir="rtl">بيانات الاتصال</span></div>',
    
    '<div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px;">Send Request</div>': 
    '<div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px; text-align: center;">Send Request<br><span dir="rtl">إرسال الطلب</span></div>',
    
    '<span style="color: #dc3545; font-size: 10px; font-weight: 500;">Remove</span>': 
    '<span style="color: #dc3545; font-size: 10px; font-weight: 500;">Remove <span dir="rtl">إزالة</span></span>',
    
    '<span style="font-size: 12px; font-weight: 600; color: #444;">Quantity</span>': 
    '<span style="font-size: 12px; font-weight: 600; color: #444;">Quantity <span dir="rtl" style="font-weight: 500; color: #666; font-size: 11px;">/ الكمية</span></span>',
    
    '<div style="display: flex; align-items: center; gap: 5px; color: #28a745; font-size: 11px; font-weight: 600;">\n                                <i class="ri-checkbox-circle-fill"></i> In Stock\n                            </div>': 
    '<div style="display: flex; align-items: center; gap: 5px; color: #28a745; font-size: 11px; font-weight: 600;">\n                                <i class="ri-checkbox-circle-fill"></i> In Stock <span dir="rtl" style="font-weight: 500; font-size: 10px;">/ متوفر</span>\n                            </div>',
    
    '<div style="font-size: 11px; color: #555;">Total Items</div>': 
    '<div style="font-size: 11px; color: #555;">Total Items <span dir="rtl" style="font-size: 10px;">/ إجمالي المنتجات</span></div>',
    
    '</span> Products</div>': 
    '</span> Products <span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">/ منتجات</span></div>',
    
    '<div style="font-size: 11px; color: #555;">Estimated Response</div>': 
    '<div style="font-size: 11px; color: #555;">Estimated Response <span dir="rtl" style="font-size: 10px;">/ الرد المتوقع</span></div>',
    
    '<div style="font-size: 14px; font-weight: 700; color: #111;">Within 24 Hours</div>': 
    '<div style="font-size: 13px; font-weight: 700; color: #111;">Within 24 Hours <span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">/ خلال 24 ساعة</span></div>',
    
    '<i class="ri-arrow-left-line"></i> Continue Shopping': 
    '<i class="ri-arrow-left-line"></i> Continue Shopping <span dir="rtl" style="font-size: 11px; font-weight: 500;">/ مواصلة التسوق</span>',
    
    '<div style="display: flex; align-items: center; gap: 5px;">REQUEST QUOTE <i class="ri-arrow-right-line"></i></div>': 
    '<div style="display: flex; align-items: center; gap: 5px;"><span dir="rtl" style="font-weight: 500; font-size: 12px; margin-right: 4px;">إرسال الطلب</span> REQUEST QUOTE <i class="ri-arrow-right-line"></i></div>',
    
    '<div style="font-size: 9px; font-weight: 400; opacity: 0.9;">We\'ll get back to you shortly</div>': 
    '<div style="font-size: 9px; font-weight: 400; opacity: 0.9;">We\'ll get back to you shortly <span dir="rtl" style="font-size: 8px;">/ سنعود إليك قريباً</span></div>',
    
    # Also translate empty basket
    '<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>':
    '<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.<br><span dir="rtl" style="display: block; margin-top: 5px;">سلة العروض الخاصة بك فارغة.</span></div>'
}

for old, new in replacements.items():
    if old in content:
        content = content.replace(old, new)
    else:
        print(f"Warning: Could not find '{old[:50]}...'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Arabic translations added!")
