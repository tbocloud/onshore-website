import glob
import re

html_files = glob.glob("/Users/mubashirt/websites/onshore-website/*.html")

for filepath in html_files:
    if "google" in filepath or "login.html" in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'id="nav-login-link"' in content:
        print(f"Skipping {filepath}, already has login link")
        continue

    # Find the nav-links block and append the login link right before </ul>
    # Note: We must be careful to only modify the main navbar <ul> which has class="nav-links"
    nav_pattern = re.compile(r'(<ul class="nav-links">.*?)(</ul>)', re.DOTALL)
    
    login_html = '    <li><a href="login.html" id="nav-login-link">Login</a></li>\n                '
    
    match = nav_pattern.search(content)
    if match:
        new_nav = match.group(1) + login_html + match.group(2)
        content = content[:match.start()] + new_nav + content[match.end():]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added to {filepath}")
    else:
        print(f"No nav-links found in {filepath}")

