import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the row start and col-4
old_start = """                                        <div class="row" style="margin: 0; gap: 5px;">
                                            <div class="col-4" style="padding: 0;">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="padding: 0.375rem 0.5rem; font-size: 13px;">"""

new_start = """                                        <div class="input-group">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="max-width: 110px; font-size: 13px; padding: 0.375rem 0.5rem;">"""

# Replace the end col-7 and input
old_end = """                                                    </optgroup>
                                                </select>
                                            </div>
                                            <div class="col-7" style="padding: 0; flex-grow: 1;">
                                                <input type="text" name="phone" required class="form-control" placeholder="Number">
                                            </div>
                                        </div>"""

new_end = """                                                    </optgroup>
                                                </select>
                                                <input type="text" name="phone" required class="form-control" placeholder="Number">
                                        </div>"""

content = content.replace(old_start, new_start)
content = content.replace(old_end, new_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Phone layout fixed")
