import re

file_path = '/Users/mubashirt/websites/onshore-website/assets/js/cart.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

part1_find = """                        <div class="modal-body" style="padding: 30px;">
                            <!-- Products Table Section -->
                            <div class="shopping-cart text-center" style="margin-bottom: 30px;">"""
part1_repl = """                        <div class="modal-body" style="padding: 30px;">
                            <div class="row">
                                <div class="col-lg-5" style="border-right: 1px solid #eee; padding-right: 20px;">
                                    <h4 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #333; text-align: left;">Your Products</h4>
                                    <!-- Products Table Section -->
                                    <div class="shopping-cart text-center" style="margin-bottom: 0;">"""
content = content.replace(part1_find, part1_repl)

part2_find = """                                <div id="modal-quote-cart-items" style="padding-right: 5px;">"""
part2_repl = """                                <div id="modal-quote-cart-items" style="padding-right: 5px; max-height: 55vh; overflow-y: auto;">"""
content = content.replace(part2_find, part2_repl)

part3_find = """                                    </table>
                                </div>
                            </div>
                            <div id="quote-auth-prompt" style="display:none; text-align:center; padding: 15px 20px;">"""
part3_repl = """                                    </table>
                                </div>
                            </div>
                                </div>
                                <div class="col-lg-7" style="padding-left: 20px;">
                                    <h4 style="margin-top: 0; margin-bottom: 20px; font-size: 16px; font-weight: bold; color: #333;">Your Details</h4>
                            <div id="quote-auth-prompt" style="display:none; text-align:center; padding: 15px 20px;">"""
content = content.replace(part3_find, part3_repl)

part4_find = """                                <button type="submit" class="btn btn-primary w-100" style="padding: 12px; font-size: 16px; font-weight: bold; background-color: #0177c6; border: none; border-radius: 4px;">Submit Quote Request</button>
                            </form>
                        </div>"""
part4_repl = """                                <button type="submit" class="btn btn-primary w-100" style="padding: 12px; font-size: 16px; font-weight: bold; background-color: #0177c6; border: none; border-radius: 4px;">Submit Quote Request</button>
                            </form>
                                </div>
                            </div>
                        </div>"""
content = content.replace(part4_find, part4_repl)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Layout updated successfully")
