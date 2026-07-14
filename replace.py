import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace QUOTE BASKET
content = content.replace('<h4>QUOTE BASKET</h4>', '<h4>ENQUIRY BASKET</h4>')

# Replace Request Quote button
content = content.replace('>Request Quote</a>', '>CHECK OUT</a>')

# Replace REQUEST QUOTE modal title
content = content.replace('REQUEST QUOTE</h5>', 'CHECK OUT</h5>')

# Replace quote basket is empty
content = content.replace('Your quote basket is empty.', 'Your enquiry basket is empty.')
content = content.replace('waiting in your quote basket.', 'waiting in your enquiry basket.')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully")
