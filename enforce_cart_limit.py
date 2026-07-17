import re

with open('assets/js/cart.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Remove data-bs-toggle attributes and add an ID to the button
pattern = r'(<button class="btn-view-cart") data-bs-toggle="modal" data-bs-target="#quoteRequestModal"( style="width: 100%;)'
replacement = r'\1 id="checkout-submit-btn"\2'
js = re.sub(pattern, replacement, js)

# 2. Add the click listener
# We can inject it at the end of the document ready block, or near the end of the file.
# Let's see if we can append it at the end of cart.js
click_listener = """

// Enforce max 3 items for guests
$(document).on('click', '#checkout-submit-btn', function(e) {
    e.preventDefault();
    if (!window.isUserLoggedIn && window.cart && window.cart.length > 3) {
        alert("For more than 3 items, please log in or register to request a quote.\\n\\nبخصوص الطلبات التي تحتوي على أكثر من 3 منتجات، يرجى تسجيل الدخول أو التسجيل لطلب عرض سعر.");
        window.location.href = 'login.html';
        return;
    }
    // Otherwise show the modal
    $('#quoteRequestModal').modal('show');
});
"""

if "Enforce max 3 items for guests" not in js:
    js += click_listener

with open('assets/js/cart.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Limit enforced successfully.")
