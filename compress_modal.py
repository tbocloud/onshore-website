import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reduce modal-body padding from 30px to 15px
content = content.replace('<div class="modal-body" style="padding: 30px;">', '<div class="modal-body" style="padding: 15px;">')

# 2. Reduce shopping-cart margin-bottom from 30px to 15px
content = content.replace('<div class="shopping-cart text-center" style="margin-bottom: 30px;">', '<div class="shopping-cart text-center" style="margin-bottom: 15px;">')

# 3. Reduce cart-head padding and margin
content = content.replace('<div class="cart-head" style="background: #f8f8f8; padding: 10px 0; font-weight: bold; border-bottom: 2px solid #ddd; margin-bottom: 15px;">',
                          '<div class="cart-head" style="background: #f8f8f8; padding: 5px 0; font-weight: bold; border-bottom: 2px solid #ddd; margin-bottom: 10px;">')

# 4. Reduce form fields margins from 15px/20px to 10px
content = content.replace('style="margin-bottom: 15px;"', 'style="margin-bottom: 10px;"')
content = content.replace('style="margin-bottom: 20px;"', 'style="margin-bottom: 10px;"')

# 5. Make product list slightly smaller to ensure it fits: 150px instead of 180px
content = content.replace('height: 180px;', 'height: 140px;')

# 6. Reduce text-start padding in renderModalCartSpace
# Need to use regex for this if necessary, but changing the global styles above should save at least 60-70px, which is plenty.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal vertically compressed")
