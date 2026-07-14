import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change modal-lg to standard width (remove modal-lg)
content = content.replace('<div class="modal-dialog modal-lg">', '<div class="modal-dialog">')

# 2. Remove the Message field
message_field = """                                    <div class="col-md-12" style="margin-bottom: 20px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Message</label>
                                        <textarea name="message" rows="4" class="form-control" placeholder="Additional details..."></textarea>
                                    </div>"""

content = content.replace(message_field, '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied")
