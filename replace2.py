import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CHECK OUT with REQUEST QUOTE (CHECK OUT)
content = content.replace('>CHECK OUT</a>', '>REQUEST QUOTE (CHECK OUT)</a>')
content = content.replace('CHECK OUT</h5>', 'REQUEST QUOTE (CHECK OUT)</h5>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully")
