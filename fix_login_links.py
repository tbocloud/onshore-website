import os
import glob

directory = "/Users/mubashirt/websites/onshore-website"
html_files = glob.glob(os.path.join(directory, "**/*.html"), recursive=True)

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to replace instances that don't already have the ID
    new_content = content.replace('<a href="login.html">Login</a>', '<a href="login.html" id="nav-login-link">Login</a>')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
