import glob
import re

html_files = glob.glob("/Users/mubashirt/websites/onshore-website/*.html")

overlay_html = """
    <!-- Global Search Overlay -->
    <div class="global-search-overlay" id="global-search-overlay">
        <div class="global-search-container">
            <div class="search-input-wrapper">
                <i class="ri-search-line search-icon"></i>
                <input type="text" id="global-search-input" placeholder="Search products, brands, or categories..." autocomplete="off">
                <div id="global-search-suggestions"></div>
            </div>
            <i class="ri-close-line search-close-btn" id="close-search-overlay"></i>
        </div>
    </div>
"""

for filepath in html_files:
    if "google" in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'id="global-search-overlay"' in content:
        continue
    
    # 1. Inject trigger button into .nav-right-icons
    trigger_html = '<div class="search-trigger-btn" id="search-trigger-btn"><i class="ri-search-line"></i></div>\n                    '
    
    # We find `<div class="cart-trigger"` and insert the trigger before it.
    new_content = content.replace('<div class="cart-trigger"', trigger_html + '<div class="cart-trigger"')
    
    # 2. Inject overlay after </nav>
    # The </nav> tag is inside <header>
    new_content = new_content.replace('</nav>', '</nav>\n' + overlay_html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Patched {filepath}")

