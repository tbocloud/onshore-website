import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_html = """                            <div class="shopping-cart text-center" style="margin-bottom: 10px;">
                                <div class="cart-head" style="background: #f8f8f8; padding: 5px 0; font-weight: bold; border-bottom: 2px solid #ddd; margin-bottom: 10px;">
                                    <div class="row" style="margin: 0;">
                                        <div class="col-6 text-start" style="padding-left: 20px;">
                                            <h6 style="margin: 0; font-size: 14px;">PRODUCTS</h6>
                                        </div>
                                        <div class="col-3">
                                            <h6 style="margin: 0; font-size: 14px;">QTY</h6>
                                        </div>
                                        <div class="col-3">
                                            <h6 style="margin: 0; font-size: 14px;">REMOVE</h6>
                                        </div>
                                    </div>
                                </div>
                                <div id="modal-quote-cart-items" style="padding-right: 5px; height: 140px; overflow-y: scroll;">
                                    <table class="table" style="width: 100%; margin-bottom: 0;">
                                        <tbody id="modal-quote-cart-body">"""

new_html = """                            <style>
                                #modal-quote-cart-items::-webkit-scrollbar { width: 8px; }
                                #modal-quote-cart-items::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                                #modal-quote-cart-items::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                                #modal-quote-cart-items::-webkit-scrollbar-thumb:hover { background: #999; }
                            </style>
                            <div class="shopping-cart text-center" style="margin-bottom: 10px;">
                                <div id="modal-quote-cart-items" style="padding-right: 0; height: 160px; overflow-y: scroll; border-bottom: 1px solid #ddd;">
                                    <table class="table" style="width: 100%; margin-bottom: 0;">
                                        <thead style="position: sticky; top: 0; background: #f8f8f8; z-index: 2; border-bottom: 2px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                            <tr>
                                                <th class="text-start" style="padding: 10px 15px; font-size: 13px; font-weight: 700; color: #555; width: 60%;">PRODUCTS</th>
                                                <th class="text-center" style="padding: 10px; font-size: 13px; font-weight: 700; color: #555; width: 20%;">QTY</th>
                                                <th class="text-center" style="padding: 10px; font-size: 13px; font-weight: 700; color: #555; width: 20%;">REMOVE</th>
                                            </tr>
                                        </thead>
                                        <tbody id="modal-quote-cart-body">"""

content = content.replace(old_html, new_html)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Alignment fixed")
