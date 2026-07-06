import glob
import re

html_files = glob.glob("/Users/mubashirt/websites/onshore-website/*.html")

for filepath in html_files:
    if "google" in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove trigger button
    trigger_html = '<div class="search-trigger-btn" id="search-trigger-btn"><i class="ri-search-line"></i></div>\n                    '
    if trigger_html in content:
        content = content.replace(trigger_html, '')
    else:
        # try without leading spaces
        trigger2 = '<div class="search-trigger-btn" id="search-trigger-btn"><i class="ri-search-line"></i></div>'
        content = content.replace(trigger2, '')
        
    # 2. Remove overlay
    overlay_pattern = re.compile(r'<!-- Global Search Overlay -->.*?</div>\s*</div>\s*</div>', re.DOTALL)
    content = overlay_pattern.sub('', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Reversed {filepath}")
