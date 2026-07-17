import re

with open('assets/js/cart.js', 'r', encoding='utf-8') as f:
    js = f.read()

banner_logic = """
// --- TOP BANNER INJECTION ---
$(document).ready(function() {
    if ($('#global-auth-banner').length === 0 && !window.isUserLoggedIn) {
        var bannerHtml = `
        <div id="global-auth-banner" style="background: #015bb5; color: white; text-align: center; padding: 10px 15px; font-size: 14px; font-family: 'Outfit', sans-serif; z-index: 10000; position: relative;">
            <span style="font-weight: 500;">🔔 Register an account to view live stock availability and access exclusive pricing!</span>
            <a href="login.html" style="color: #f1c40f; font-weight: 700; text-decoration: underline; margin-left: 10px;">Login / Register Here</a>
        </div>
        `;
        $('body').prepend(bannerHtml);
    }
});
// -----------------------------
"""

if "global-auth-banner" not in js:
    js = banner_logic + "\n" + js
    with open('assets/js/cart.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Banner added to cart.js")
else:
    print("Banner already exists")
