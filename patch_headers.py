import glob
import re

html_files = glob.glob("/Users/mubashirt/websites/onshore-website/*.html")

for filepath in html_files:
    if "google" in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'global-search-wrapper' in content:
        continue
    
    # We want to wrap Logo, Search, and Icons in .nav-top-row
    # And nav-links, menu-btns in .nav-bottom-row
    
    # Find the wrapper div inside nav
    # Typical:
    # <div class="wrapper container">
    #     <div class="logo">...</div>
    #     <input type="radio"...
    #     <input type="radio"...
    #     <ul class="nav-links">...</ul>
    #     <div class="nav-right-icons">...</div>
    #     <label for="menu-btn"...
    # </div>
    
    pattern = re.compile(r'(<nav.*?>\s*<div class="wrapper container">)(.*?)(</nav>)', re.DOTALL)
    match = pattern.search(content)
    if not match:
        continue
        
    nav_start = match.group(1)
    nav_inner = match.group(2)
    nav_end = match.group(3)
    
    # Extract sections
    logo_match = re.search(r'(<div class="logo">.*?</div>)', nav_inner, re.DOTALL)
    if not logo_match: continue
    logo_html = logo_match.group(1)
    
    nav_links_match = re.search(r'(<ul class="nav-links">.*?</ul>)', nav_inner, re.DOTALL)
    if not nav_links_match: continue
    nav_links_html = nav_links_match.group(1)
    
    # We must match the nav-right-icons correctly. 
    # Usually it's right after </ul>. It goes <div class="nav-right-icons">...</div>
    right_icons_idx = nav_inner.find('<div class="nav-right-icons">')
    # Find the closing </div> for nav-right-icons. It contains 2 inner divs.
    # Let's just find the next <label for="menu-btn"
    label_menu_idx = nav_inner.find('<label for="menu-btn"', right_icons_idx)
    if label_menu_idx == -1: continue
    
    right_icons_html = nav_inner[right_icons_idx:label_menu_idx].strip()
    
    inputs_and_labels = ""
    # Extract the <input>s that are before <ul class="nav-links">
    inputs_match = re.findall(r'(<input type="radio" name="slide"[^>]+>)', nav_inner)
    for inp in inputs_match: inputs_and_labels += inp + "\n                "
    
    # Also extract the <label for="menu-btn"... at the end
    label_match = re.search(r'(<label for="menu-btn" class="btn menu-btn">.*?</label>)', nav_inner)
    if label_match:
        label_html = label_match.group(1)
    else:
        label_html = ""
        
    search_html = """
                    <div class="global-search-wrapper">
                        <i class="ri-search-line"></i>
                        <input type="text" id="global-search-input" placeholder="Search products..." autocomplete="off">
                        <div id="global-search-suggestions"></div>
                    </div>"""
                    
    top_row = f"""
                <div class="nav-top-row">
                    {logo_html}{search_html}
                    {right_icons_html}
                </div>"""
                
    bottom_row = f"""
                <div class="nav-bottom-row">
                    {inputs_and_labels}{nav_links_html}
                    {label_html}
                </div>"""
                
    new_nav = nav_start + top_row + bottom_row + "\n            </div>\n        " + nav_end
    
    # We also need to add <script src="assets/js/global-search.js"></script> before </body>
    new_content = content.replace(match.group(0), new_nav)
    
    if '<script src="assets/js/global-search.js"></script>' not in new_content:
        new_content = new_content.replace('</body>', '    <script src="assets/js/global-search.js"></script>\n</body>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Patched {filepath}")

