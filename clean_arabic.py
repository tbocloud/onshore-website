import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Modal Title
content = content.replace(
    '<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE (CHECK OUT) | طلب عرض سعر</h5>',
    '<h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333; display: flex; align-items: center; gap: 10px;"><span>REQUEST QUOTE (CHECK OUT)</span><span dir="rtl" style="font-size: 15px; font-weight: 500; color: #777; margin-top: 2px;">طلب عرض سعر</span></h5>'
)

# Fix Table Headers
content = content.replace('>PRODUCTS / المنتجات</th>', ' style="line-height: 1.2;">PRODUCTS <br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #888;">المنتجات</span></th>')
content = content.replace('>QTY / الكمية</th>', ' style="line-height: 1.2;">QTY <br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #888;">الكمية</span></th>')
content = content.replace('>REMOVE / إزالة</th>', ' style="line-height: 1.2;">REMOVE <br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #888;">إزالة</span></th>')

# Clean up the Instruction text
# It was: Kindly fill in your contact details to request a quote. <span style="display: block; margin-top: 5px; font-weight: bold; color: #333;" dir="rtl">يرجى ملء بيانات الاتصال الخاصة بك لطلب عرض سعر.</span>
content = content.replace(
    'Kindly fill in your contact details to request a quote. <span style="display: block; margin-top: 5px; font-weight: bold; color: #333;" dir="rtl">يرجى ملء بيانات الاتصال الخاصة بك لطلب عرض سعر.</span>',
    'Kindly fill in your contact details to request a quote. <span style="display: block; font-size: 13px; font-weight: 500; color: #888; margin-top: 3px;" dir="rtl">يرجى ملء بيانات الاتصال الخاصة بك لطلب عرض سعر.</span>'
)

# Function to replace labels with flex layout
def replace_label(english, arabic, has_star=False):
    star_text = " *" if has_star else ""
    old_label = f'<label style="display: block; font-weight: 600; margin-bottom: 10px; color: #555;">{english} / {arabic}{star_text}</label>'
    # We might have margin-bottom: 5px; instead of 10px in the current file because I compressed it earlier.
    # Let's use regex to catch both.
    
    pattern = rf'<label style="display: block; font-weight: 600; margin-bottom: (\d+)px; color: #555;">{english} / {arabic}{star_text}</label>'
    
    def repl(m):
        mb = m.group(1)
        return f'<label style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; margin-bottom: {mb}px; color: #555; width: 100%;"><span>{english}{star_text}</span><span dir="rtl" style="font-size: 12px; color: #888; font-weight: 500;">{arabic}</span></label>'
    
    global content
    content = re.sub(pattern, repl, content)

replace_label("Full Name", "الاسم الكامل", True)
replace_label("Email", "البريد الإلكتروني", True)
replace_label("Company Name", "اسم الشركة", False)
replace_label("Country", "الدولة", True)
replace_label("City", "المدينة", False)
replace_label("Mobile Number", "رقم الجوال", True)
replace_label("Promo Code", "رمز الخصم", False)

# Fix Select Country Option
content = content.replace('<option value="">Select Country / اختر الدولة</option>', '<option value="">Select Country</option>')

# Fix Buttons
content = content.replace('>Cancel / إلغاء</button>', ' style="display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.2; padding: 6px 12px;"><span>Cancel</span><span dir="rtl" style="font-size: 11px; font-weight: normal; opacity: 0.8;">إلغاء</span></button>')
content = content.replace('>Submit Request / إرسال الطلب</button>', ' style="background-color: #0275c6; border-color: #0275c6; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.2; padding: 6px 16px;"><span>Submit Request</span><span dir="rtl" style="font-size: 11px; font-weight: normal; opacity: 0.8;">إرسال الطلب</span></button>')


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned Arabic Layout")
