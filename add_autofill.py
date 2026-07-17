import re

with open('assets/js/cart.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add logic to save form details to localStorage on successful submission
save_logic = """
                // Save user details for next time so they don't have to re-enter them
                var userDetails = {
                    full_name: payload.full_name,
                    email: payload.email,
                    mobile_number: payload.mobile_number,
                    mobile_country_code: payload.mobile_country_code,
                    country: payload.country,
                    company_name: payload.company_name,
                    city: payload.city
                };
                localStorage.setItem('user_quote_details', JSON.stringify(userDetails));

                // Clear cart"""

# Replace the '// Clear cart' with the save logic + clear cart
js = js.replace('// Clear cart', save_logic)

# 2. Add logic to pre-fill the form when the modal opens
# Let's find:
#         $(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {
# OR
#         $('#quoteRequestModal').on('show.bs.modal', function (e) {
#
# Actually, the file has: `$(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {`

prefill_logic = """
        $(document).off('show.bs.modal', '#quoteRequestModal').on('show.bs.modal', '#quoteRequestModal', function () {
            var saved = localStorage.getItem('user_quote_details');
            if (saved) {
                try {
                    var details = JSON.parse(saved);
                    var $m = $('#quoteRequestModal');
                    if (details.full_name) $m.find('[name="full_name"]').val(details.full_name);
                    if (details.email) $m.find('[name="email"]').val(details.email);
                    if (details.company_name) $m.find('[name="company_name"]').val(details.company_name);
                    if (details.country) $m.find('[name="country"]').val(details.country);
                    if (details.city) $m.find('[name="city"]').val(details.city);
                    if (details.mobile_number) $m.find('[name="phone"]').val(details.mobile_number);
                    if (details.mobile_country_code) $m.find('[name="country_code"]').val(details.mobile_country_code);
                } catch(e) {}
            }
        });

        $(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {"""

js = js.replace("$(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {", prefill_logic)


with open('assets/js/cart.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Auto-fill logic added successfully.")
