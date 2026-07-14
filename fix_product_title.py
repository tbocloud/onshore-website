import re

js_path = '/Users/mubashirt/websites/onshore-website/assets/js/products-api.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Fix for main catalog
old_main = """<a href="${specsUrl}" class="pc-name" target="_blank">
                        ${safeName}
                        ${arabicName ? `<br><span dir="rtl" style="font-size: 12px; color: #666; font-weight: 500; display: block; margin-top: 4px; line-height: 1.4;">${arabicName}</span>` : ''}
                    </a>"""
new_main = """<a href="${specsUrl}" class="pc-name" target="_blank" title="${safeName}">${safeName}</a>
                    ${arabicName ? `<div dir="rtl" class="pc-name-ar" style="font-size: 13px; color: #666; font-weight: 600; margin-top: -4px; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${arabicName}</div>` : ''}"""

js_content = js_content.replace(old_main, new_main)

# Fix for featured
old_feat = """<a href="${specsUrl}" class="pc-name" target="_blank">
                                ${escapedName}
                                ${escapedArabicName ? `<br><span dir="rtl" style="font-size: 12px; color: #666; font-weight: 500; display: block; margin-top: 4px; line-height: 1.4;">${escapedArabicName}</span>` : ''}
                            </a>"""
new_feat = """<a href="${specsUrl}" class="pc-name" target="_blank" title="${escapedName}">${escapedName}</a>
                            ${escapedArabicName ? `<div dir="rtl" class="pc-name-ar" style="font-size: 13px; color: #666; font-weight: 600; margin-top: -4px; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapedArabicName}</div>` : ''}"""

js_content = js_content.replace(old_feat, new_feat)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Fixed products-api.js")
