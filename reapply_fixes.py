import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. OTP Spam message
content = content.replace(
    'Please enter it below to submit your quote.\n                        </p>',
    'Please enter it below to submit your quote.<br>\n                            <span style="font-size: 13px; color: #888; font-style: italic;">(Please also check your spam/junk folder if you don\'t see it)</span>\n                        </p>'
)

# 2. ENQUIRY BASKET text replacements
content = content.replace('<h4>QUOTE BASKET</h4>', '<h4>ENQUIRY BASKET</h4>')
content = content.replace('Your quote basket is empty.', 'Your enquiry basket is empty.')
content = content.replace('waiting in your quote basket.', 'waiting in your enquiry basket.')

# 3. REQUEST QUOTE (CHECK OUT) text
content = content.replace('>Request Quote</a>', '>REQUEST QUOTE (CHECK OUT)</a>')
content = content.replace('REQUEST QUOTE</h5>', 'REQUEST QUOTE (CHECK OUT)</h5>')

# 4. max-height compromise (250px instead of 160px, to show ~3 items without hiding form)
content = content.replace('max-height: 160px; overflow-y: auto;', 'max-height: 250px; overflow-y: auto;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes reapplied successfully")
