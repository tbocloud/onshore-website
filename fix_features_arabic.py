import os
import re

directory = '/Users/mubashirt/websites/onshore-website/'

replacements = [
    (
        r'Direct\s+KSA\s+Dispatch', 
        r'Direct KSA Dispatch <br><span dir="rtl" style="font-size: 13px; font-weight: 500; color: #64748b;">إرسال مباشر داخل المملكة</span>'
    ),
    (
        r'Fast\s+supply\s+to\s+Dammam,\s+Jubail,\s+Khobar,\s+Ras\s+Tanura\s+&\s+Riyadh',
        r'Fast supply to Dammam, Jubail, Khobar, Ras Tanura & Riyadh <br><span dir="rtl" style="font-size: 11px; color: #94a3b8; margin-top: 2px; display: block;">توريد سريع إلى الدمام، الجبيل، الخبر، رأس تنورة والرياض</span>'
    ),
    (
        r'Aramco-Ready\s+Compliance',
        r'Aramco-Ready Compliance <br><span dir="rtl" style="font-size: 13px; font-weight: 500; color: #64748b;">مطابق لمواصفات أرامكو</span>'
    ),
    (
        r'100%\s+original\s+brands\s+with\s+official\s+load\s+test\s+&\s+mill\s+certificates',
        r'100% original brands with official load test & mill certificates <br><span dir="rtl" style="font-size: 11px; color: #94a3b8; margin-top: 2px; display: block;">علامات تجارية أصلية 100% مع شهادات اختبار الحمولة وشهادات المصنع الرسمية</span>'
    ),
    (
        r'Bulk\s+Wholesale\s+Rates',
        r'Bulk Wholesale Rates <br><span dir="rtl" style="font-size: 13px; font-weight: 500; color: #64748b;">أسعار جملة تنافسية</span>'
    ),
    (
        r'Competitive\s+factory\s+pricing\s+&\s+flexible\s+B2B\s+corporate\s+credit\s+terms',
        r'Competitive factory pricing & flexible B2B corporate credit terms <br><span dir="rtl" style="font-size: 11px; color: #94a3b8; margin-top: 2px; display: block;">أسعار مصنع تنافسية وشروط ائتمان مرنة للشركات</span>'
    ),
    (
        r'24/7\s+Expert\s+Spec\s+Support',
        r'24/7 Expert Spec Support <br><span dir="rtl" style="font-size: 13px; font-weight: 500; color: #64748b;">دعم فني متخصص على مدار الساعة</span>'
    ),
    (
        r'Consult\s+engineers\s+for\s+perfect\s+hoist\s+specifications\s+&\s+safety\s+factors',
        r'Consult engineers for perfect hoist specifications & safety factors <br><span dir="rtl" style="font-size: 11px; color: #94a3b8; margin-top: 2px; display: block;">استشر المهندسين للحصول على مواصفات دقيقة وعوامل الأمان المثالية</span>'
    )
]

files_updated = 0

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            for pat, repl in replacements:
                # We use regex to replace it if it hasn't been replaced yet
                # to avoid replacing our replacement if we run it twice
                if 'dir="rtl"' not in content[max(0, content.find(pat[:10])) : min(len(content), content.find(pat[:10]) + 300)]:
                    # A basic check to avoid double replacement
                    content = re.sub(pat, repl, content, count=1)
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated: {filepath}")
                files_updated += 1

print(f"Total files updated: {files_updated}")
