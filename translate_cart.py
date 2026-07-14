import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Modal Headers
    '<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE (CHECK OUT)</h5>': '<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE (CHECK OUT) | طلب عرض سعر</h5>',
    
    # Instruction
    'Kindly fill in your contact details to request a quote.': 'Kindly fill in your contact details to request a quote. <span style="display: block; margin-top: 5px; font-weight: bold; color: #333;" dir="rtl">يرجى ملء بيانات الاتصال الخاصة بك لطلب عرض سعر.</span>',
    
    # Table Headers
    '>PRODUCTS</th>': '>PRODUCTS / المنتجات</th>',
    '>QTY</th>': '>QTY / الكمية</th>',
    '>REMOVE</th>': '>REMOVE / إزالة</th>',
    
    # Form Labels
    '>Full Name *</label>': '>Full Name / الاسم الكامل *</label>',
    '>Email *</label>': '>Email / البريد الإلكتروني *</label>',
    '>Company Name</label>': '>Company Name / اسم الشركة</label>',
    '>Country *</label>': '>Country / الدولة *</label>',
    '>Select Country</option>': '>Select Country / اختر الدولة</option>',
    '>City</label>': '>City / المدينة</label>',
    '>Mobile Number *</label>': '>Mobile Number / رقم الجوال *</label>',
    'placeholder="Number"': 'placeholder="Number / الرقم"',
    '>Promo Code</label>': '>Promo Code / رمز الخصم</label>',
    'placeholder="e.g. ONSHORE40 (Optional)"': 'placeholder="e.g. ONSHORE40 (اختياري)"',
    
    # Buttons
    '>Cancel</button>': '>Cancel / إلغاء</button>',
    '>Submit Request</button>': '>Submit Request / إرسال الطلب</button>',
    
    # Empty states
    'Your enquiry basket is empty.': 'Your enquiry basket is empty. / سلة الاستفسارات الخاصة بك فارغة.',
    
    # Sidebar
    '<h4>ENQUIRY BASKET</h4>': '<h4 style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;"><span>ENQUIRY BASKET</span><span style="font-size: 14px;">سلة الاستفسارات</span></h4>',
    '>REQUEST QUOTE (CHECK OUT)</a>': '>REQUEST QUOTE (CHECK OUT) <br> <span style="font-size: 13px;">طلب عرض سعر (الدفع)</span></a>',
    
    # Abandoned Cart Toast
    'waiting in your enquiry basket.': 'waiting in your enquiry basket. <br> <span dir="rtl">تنتظر في سلة الاستفسارات الخاصة بك.</span>',
    'Resume Quote': 'Resume Quote / متابعة الطلب'
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Also fix the sidebar button which is actually a <h5>
content = content.replace('<h5 style="margin: 0; font-size: 16px; font-weight: 700;">REQUEST QUOTE (CHECK OUT)</h5>', '<h5 style="margin: 0; font-size: 16px; font-weight: 700; line-height: 1.4;">REQUEST QUOTE (CHECK OUT)<br><span style="font-size: 14px;">طلب عرض سعر (الدفع)</span></h5>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Translations applied")
