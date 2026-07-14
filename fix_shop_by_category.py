import os
import re

directory = '/Users/mubashirt/websites/onshore-website/'

replacements = [
    (
        r'<h3 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0; font-family: \'Montserrat\', sans-serif;">Shop by Category</h3>',
        r'<h3 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0; font-family: \'Montserrat\', sans-serif; display: flex; align-items: center; gap: 8px;">Shop by Category <span dir="rtl" style="font-size: 14px; font-weight: 600; color: #64748b;">| تسوق حسب الفئة</span></h3>'
    ),
    (
        r'>View All</a>',
        r'>View All | عرض الكل</a>'
    ),
    (
        r'<div class="cat-card-title">Abrasives</div>',
        r'<div class="cat-card-title">Abrasives <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">مواد كاشطة</span></div>'
    ),
    (
        r'<div class="cat-card-title">Cutting Tools</div>',
        r'<div class="cat-card-title">Cutting Tools <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">أدوات القطع</span></div>'
    ),
    (
        r'<div class="cat-card-title">Welding</div>',
        r'<div class="cat-card-title">Welding <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">معدات اللحام</span></div>'
    ),
    (
        r'<div class="cat-card-title">Lifting &<br>Rigging</div>',
        r'<div class="cat-card-title">Lifting & Rigging <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">أدوات الرفع</span></div>'
    ),
    (
        r'<div class="cat-card-title">Power Tools</div>',
        r'<div class="cat-card-title">Power Tools <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">أدوات كهربائية</span></div>'
    ),
    (
        r'<div class="cat-card-title">Safety & PPE</div>',
        r'<div class="cat-card-title">Safety & PPE <span dir="rtl" style="display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px;">معدات السلامة</span></div>'
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
                if 'تسوق حسب الفئة' not in content and 'View All | عرض الكل' not in content and 'مواد كاشطة' not in content:
                    content = re.sub(pat, repl, content)
                else:
                    # just apply individually if not present
                    if repl not in content:
                        content = re.sub(pat, repl, content)

            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated: {filepath}")
                files_updated += 1

print(f"Total files updated: {files_updated}")
