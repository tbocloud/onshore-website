import os
import re

directory = '/Users/mubashirt/websites/onshore-website/'

target_pattern = re.compile(
    r'Dammam, Jubail, Al Khobar, Ras Tanura \| الدمام،\s*الجبيل، الخبر، رأس تنورة'
)
replacement = 'Dammam, Jubail, Al Khobar, Ras Tanura, Riyadh, Jeddah | الدمام،\n                                    الجبيل، الخبر، رأس تنورة، الرياض، جدة'

files_updated = 0

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if target_pattern.search(content):
                new_content = target_pattern.sub(replacement, content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")
                files_updated += 1

print(f"Total files updated: {files_updated}")
