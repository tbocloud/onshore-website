import glob
import re

html_files = glob.glob("/Users/mubashirt/websites/onshore-website/*.html")

for filepath in html_files:
    if "google" in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<div class="nav-top-row">' not in content:
        continue
    
    # We want to remove:
    # <div class="nav-top-row">
    # <div class="global-search-wrapper">...</div>
    # </div> around top row
    # <div class="nav-bottom-row">
    # </div> around bottom row
    
    # Let's extract the components directly using regex since they are exactly what we put in.
    logo_pattern = re.compile(r'(<div class="logo">.*?</a>\s*</div>)', re.DOTALL)
    icons_pattern = re.compile(r'(<div class="nav-right-icons">.*?</div>\s*</div>)', re.DOTALL)
    links_pattern = re.compile(r'(<ul class="nav-links">.*?</ul>)', re.DOTALL)
    
    logo_match = logo_pattern.search(content)
    icons_match = icons_pattern.search(content)
    links_match = links_pattern.search(content)
    
    if not (logo_match and icons_match and links_match):
        print(f"Could not parse {filepath} for reverting")
        continue
        
    logo = logo_match.group(1)
    icons = icons_match.group(1)
    links = links_match.group(1)
    
    inputs_match = re.findall(r'(<input type="radio" name="slide"[^>]+>)', content)
    label_match = re.search(r'(<label for="menu-btn" class="btn menu-btn">.*?</label>)', content)
    
    nav_inner = f"""
                {logo}

                {inputs_match[0] if len(inputs_match)>0 else ''}
                {inputs_match[1] if len(inputs_match)>1 else ''}
                {links}

                {icons}

                {label_match.group(1) if label_match else ''}
"""
    
    # Replace everything between <div class="wrapper container"> and </div>\n        </nav>
    # Note: </div> for wrapper container is just before </nav>
    
    nav_pattern = re.compile(r'(<nav.*?>\s*<div class="wrapper container">)(.*?)(</div>\s*</nav>)', re.DOTALL)
    
    match = nav_pattern.search(content)
    if not match:
        print(f"Failed to find nav block to replace in {filepath}")
        continue
        
    new_content = content[:match.start(2)] + nav_inner + content[match.end(2):]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Reverted {filepath}")

