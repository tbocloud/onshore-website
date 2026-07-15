/**
 * Quote Cart Logic for Onshore Technical Supplies
 * Handles adding/removing items to a quote basket using localStorage.
 */

var QuoteCart = (function ($) {
    "use strict";

    var STORAGE_KEY = 'onshore_quote_cart';
    var REQUEST_QUOTE_URL = 'https://onshore.tbo365.cloud/api/method/onshore.api.create_request_quote';
    var REQUEST_QUOTE_AUTH = 'token9897e6ee3838b6c:06d7193075244d6';
    var cart = [];
    var eventsBound = false;
    function init() {

        injectCartSidebar();
        loadCart();
        // Cleanup legacy 'undefined' strings from previous cache
        cart.forEach(function (item) {
            if (item.brand === 'undefined') item.brand = '';
        });
        updateCartCount();
        checkAbandonedCart();
        bindEvents();
    }

    // Inject Sidebar HTML into the DOM
    function injectCartSidebar() {
        if ($('#cart-sidebar').length > 0) return;

        var sidebarHtml = `
            <div class="cart-overlay"></div>
            <div id="cart-sidebar" style="background: #fdfdfd; display: flex; flex-direction: column; height: 100vh;">
                <!-- Header -->
                <div class="cart-header" style="background: #fff; padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: flex-start; justify-content: space-between;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="background: #eef5fc; color: #015bb5; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                            <i class="ri-shopping-cart-2-fill"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #111; line-height: 1.4;">ENQUIRY BASKET (<span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span>)<br><span dir="rtl" style="font-size: 14px; font-weight: 500; color: #666; display: block; margin-top: 3px;">سلة الاستفسارات</span></h4>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">Review your selected items before requesting a quote.<br><span dir="rtl" style="display:inline-block; font-size: 11px; margin-top:2px;">راجع العناصر المحددة قبل طلب عرض السعر.</span></div>
                        </div>
                    </div>
                    <span class="close-cart" style="font-size: 24px; color: #444; cursor: pointer; display: flex; align-items: flex-start; padding-top: 4px;"><i class="ri-close-line"></i></span>
                </div>

                <!-- Progress Bar -->
                <div style="padding: 20px; background: #fff; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 0;">
                        <div style="position: absolute; top: 12px; left: 15%; right: 15%; height: 2px; background: #eee; z-index: 0;"></div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #015bb5; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">1</div>
                            <div style="font-size: 11px; color: #015bb5; font-weight: 600; margin-top: 8px; text-align: center;">Basket<br><span dir="rtl" style="font-weight: 500;">السلة</span></div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid #ddd; color: #666; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">2</div>
                            <div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px; text-align: center;">Contact Details<br><span dir="rtl">بيانات الاتصال</span></div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid #ddd; color: #666; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">3</div>
                            <div style="font-size: 11px; color: #666; font-weight: 500; margin-top: 8px; text-align: center;">Send Request<br><span dir="rtl">إرسال الطلب</span></div>
                        </div>
                    </div>
                </div>

                <!-- Products -->
                <div class="cart-items" style="flex: 1; overflow-y: auto; padding: 20px; background: #fdfdfd;">
                    <!-- Items will be injected here -->
                    <div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.<br><span dir="rtl" style="display: block; margin-top: 5px;">سلة العروض الخاصة بك فارغة.</span></div>
                </div>

                <!-- Footer -->
                <div class="cart-footer" style="padding: 20px; background: #fff; border-top: 1px solid #eee;">
                    <!-- Summary Card -->
                    <div style="background: #f8fbff; border: 1px solid #e1effe; border-radius: 8px; padding: 15px; display: flex; margin-bottom: 20px;">
                        <div style="flex: 1; display: flex; align-items: center; gap: 10px; border-right: 1px solid #e1effe; padding-right: 15px;">
                            <div style="color: #015bb5; font-size: 24px; opacity: 0.8;"><i class="ri-file-list-3-line"></i></div>
                            <div>
                                <div style="font-size: 11px; color: #555;">Total Items<br><span dir="rtl" style="font-size: 10px;">إجمالي المنتجات</span></div>
                                <div style="font-size: 14px; font-weight: 700; color: #111;"><span class="cart-count" style="background: none; color: inherit; padding: 0; position: static; display: inline;">0</span> Products<br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">منتجات</span></div>
                            </div>
                        </div>
                        <div style="flex: 1; display: flex; align-items: center; gap: 10px; padding-left: 15px;">
                            <div style="color: #015bb5; font-size: 24px; opacity: 0.8;"><i class="ri-time-line"></i></div>
                            <div>
                                <div style="font-size: 11px; color: #555;">Estimated Response<br><span dir="rtl" style="font-size: 10px;">الرد المتوقع</span></div>
                                <div style="font-size: 13px; font-weight: 700; color: #111; line-height: 1.2;">Within 24 Hours<br><span dir="rtl" style="font-size: 11px; font-weight: 500; color: #555;">خلال 24 ساعة</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Buttons -->
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
                        <button class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal" style="width: 100%; background: #015bb5; color: #fff; border: none; border-radius: 8px; padding: 15px; font-size: 14px; font-weight: 600; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                            <div style="display: flex; align-items: center; gap: 5px; flex-wrap: wrap; justify-content: center;"><span dir="rtl" style="font-weight: 500; font-size: 12px;">إرسال الطلب (إتمام الطلب)</span> | REQUEST QUOTE (CHECK OUT) <i class="ri-arrow-right-line"></i></div>
                            <div style="font-size: 10px; font-weight: 400; opacity: 0.9; margin-top: 4px;">We'll get back to you shortly <span dir="rtl" style="font-size: 9px;">/ سنعود إليك قريباً</span></div>
                        </button>
                        <span class="close-cart" style="color: #015bb5; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="ri-arrow-left-line"></i> Continue Shopping <span dir="rtl" style="font-size: 12px; font-weight: 500;">/ مواصلة التسوق</span>
                        </span>
                    </div>


                </div>
            </div>
        `;

        var modalHtml = `
            <!-- Request Quote Modal -->
            <div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">
                            <h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE <span dir="rtl" style="font-size: 14px; color: #666; font-weight: 500; margin-left: 10px;">| طلب عرض سعر</span></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <!-- Selected Products Section -->
                            <div style="border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px;">
                                    <span style="font-weight: 700; color: #333; font-size: 13px;">SELECTED PRODUCTS</span>
                                    <span dir="rtl" style="font-size: 12px; color: #888; font-weight: 500;">المنتجات المحددة</span>
                                </div>
                                <div id="modal-quote-cart-items" style="max-height: 120px; overflow-y: auto; padding-right: 5px;">
                                    <div id="modal-quote-cart-body">
                                        <!-- Products injected here -->
                                    </div>
                                </div>
                            </div>
                            <div id="quote-auth-prompt" style="display:none; text-align:center; padding: 15px 20px;">
                                <i class="ri-lock-2-line" style="font-size: 36px; color: #0177c6; margin-bottom: 10px; display: inline-block;"></i>
                                <h4 style="font-weight: 700; color: #333; margin-bottom: 5px; font-size: 20px;">Sign In to Submit Your Quote</h4>
                                <p style="color: #666; margin-bottom: 15px; font-size: 13px;">Please sign in to securely process your request and link it to your account.</p>
                                
                                <div style="max-width: 320px; margin: 0 auto; text-align: left;">
                                    <div style="margin-bottom: 10px;">
                                        <input type="email" id="cart-email-input" class="form-control" placeholder="Enter Email Address" style="border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 14px; box-shadow: none;">
                                    </div>
                                    <button type="button" id="cart-email-login-btn" class="btn btn-primary w-100" style="background: #fb641b; color: white; border: none; padding: 10px; font-size: 14px; font-weight: 600; border-radius: 4px; transition: background 0.3s;">
                                        Request Magic Link
                                    </button>
                                    
                                    <div style="display: flex; align-items: center; margin: 12px 0; color: #878787; font-size: 12px;">
                                        <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                                        <span style="padding: 0 10px; background: #fff;">OR</span>
                                        <div style="flex: 1; height: 1px; background: #e0e0e0;"></div>
                                    </div>
                                    
                                    <button type="button" id="cart-google-signin-btn" class="btn w-100" style="background: #fff; color: #444; border: 1px solid #ddd; padding: 10px; font-size: 14px; font-weight: 500; border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.3s;">
                                        <img src="https://www.google.com/favicon.ico" width="16" height="16"> Sign in with Google
                                    </button>
                                </div>
                            </div>

                            <!-- Form Section -->
                            <form id="quote-form-modal">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-weight: 700; color: #222; font-size: 14px;">CONTACT INFORMATION</span>
                                            <span dir="rtl" style="font-size: 13px; color: #888; font-weight: 500;">بيانات الاتصال</span>
                                        </div>
                                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                            Complete the form below and we'll send you a quotation shortly.<br>
                                            <span dir="rtl" style="display: inline-block; margin-top: 2px;">يرجى تعبئة النموذج أدناه وسنقوم بإرسال عرض السعر لك قريباً.</span>
                                        </div>
                                    </div>
                                    <div style="color: #0177c6; font-size: 24px; opacity: 0.8;"><i class="ri-file-text-line"></i></div>
                                </div>
                                <!-- Honeypot field (hidden from humans) -->
                                <div style="display:none;">
                                    <label>Leave this field blank</label>
                                    <input type="text" name="hp_field" value="">
                                </div>
                                <div class="row" style="margin: 0 -10px;">
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Full Name <span style="font-weight: normal; color: #777;">الاسم الكامل</span> *</label>
                                        <input type="text" name="full_name" required class="form-control" placeholder="Enter your full name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Email <span style="font-weight: normal; color: #777;">البريد الإلكتروني</span> *</label>
                                        <input type="email" name="email" required class="form-control" placeholder="Enter your email address" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Company Name <span style="font-weight: normal; color: #777;">اسم الشركة</span></label>
                                        <input type="text" name="company_name" class="form-control" placeholder="Enter your company name" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Country <span style="font-weight: normal; color: #777;">الدولة</span> *</label>
                                        <select name="country" id="quote-country-select" class="form-select" required style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                            <option value="">Select Country</option>
<option value="Afghanistan">Afghanistan</option>
<option value="Albania">Albania</option>
<option value="Algeria">Algeria</option>
<option value="Andorra">Andorra</option>
<option value="Angola">Angola</option>
<option value="Antigua and Barbuda">Antigua and Barbuda</option>
<option value="Argentina">Argentina</option>
<option value="Armenia">Armenia</option>
<option value="Australia">Australia</option>
<option value="Austria">Austria</option>
<option value="Azerbaijan">Azerbaijan</option>
<option value="Bahamas">Bahamas</option>
<option value="Bahrain">Bahrain</option>
<option value="Bangladesh">Bangladesh</option>
<option value="Barbados">Barbados</option>
<option value="Belarus">Belarus</option>
<option value="Belgium">Belgium</option>
<option value="Belize">Belize</option>
<option value="Benin">Benin</option>
<option value="Bhutan">Bhutan</option>
<option value="Bolivia">Bolivia</option>
<option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
<option value="Botswana">Botswana</option>
<option value="Brazil">Brazil</option>
<option value="Brunei">Brunei</option>
<option value="Bulgaria">Bulgaria</option>
<option value="Burkina Faso">Burkina Faso</option>
<option value="Burundi">Burundi</option>
<option value="Côte d'Ivoire">Côte d'Ivoire</option>
<option value="Cabo Verde">Cabo Verde</option>
<option value="Cambodia">Cambodia</option>
<option value="Cameroon">Cameroon</option>
<option value="Canada">Canada</option>
<option value="Central African Republic">Central African Republic</option>
<option value="Chad">Chad</option>
<option value="Chile">Chile</option>
<option value="China">China</option>
<option value="Colombia">Colombia</option>
<option value="Comoros">Comoros</option>
<option value="Congo (Congo-Brazzaville)">Congo (Congo-Brazzaville)</option>
<option value="Costa Rica">Costa Rica</option>
<option value="Croatia">Croatia</option>
<option value="Cuba">Cuba</option>
<option value="Cyprus">Cyprus</option>
<option value="Czechia (Czech Republic)">Czechia (Czech Republic)</option>
<option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
<option value="Denmark">Denmark</option>
<option value="Djibouti">Djibouti</option>
<option value="Dominica">Dominica</option>
<option value="Dominican Republic">Dominican Republic</option>
<option value="Ecuador">Ecuador</option>
<option value="Egypt">Egypt</option>
<option value="El Salvador">El Salvador</option>
<option value="Equatorial Guinea">Equatorial Guinea</option>
<option value="Eritrea">Eritrea</option>
<option value="Estonia">Estonia</option>
<option value="Eswatini (fmr. Swaziland)">Eswatini (fmr. Swaziland)</option>
<option value="Ethiopia">Ethiopia</option>
<option value="Fiji">Fiji</option>
<option value="Finland">Finland</option>
<option value="France">France</option>
<option value="Gabon">Gabon</option>
<option value="Gambia">Gambia</option>
<option value="Georgia">Georgia</option>
<option value="Germany">Germany</option>
<option value="Ghana">Ghana</option>
<option value="Greece">Greece</option>
<option value="Grenada">Grenada</option>
<option value="Guatemala">Guatemala</option>
<option value="Guinea">Guinea</option>
<option value="Guinea-Bissau">Guinea-Bissau</option>
<option value="Guyana">Guyana</option>
<option value="Haiti">Haiti</option>
<option value="Holy See">Holy See</option>
<option value="Honduras">Honduras</option>
<option value="Hungary">Hungary</option>
<option value="Iceland">Iceland</option>
<option value="India">India</option>
<option value="Indonesia">Indonesia</option>
<option value="Iran">Iran</option>
<option value="Iraq">Iraq</option>
<option value="Ireland">Ireland</option>
<option value="Israel">Israel</option>
<option value="Italy">Italy</option>
<option value="Jamaica">Jamaica</option>
<option value="Japan">Japan</option>
<option value="Jordan">Jordan</option>
<option value="Kazakhstan">Kazakhstan</option>
<option value="Kenya">Kenya</option>
<option value="Kiribati">Kiribati</option>
<option value="Kuwait">Kuwait</option>
<option value="Kyrgyzstan">Kyrgyzstan</option>
<option value="Laos">Laos</option>
<option value="Latvia">Latvia</option>
<option value="Lebanon">Lebanon</option>
<option value="Lesotho">Lesotho</option>
<option value="Liberia">Liberia</option>
<option value="Libya">Libya</option>
<option value="Liechtenstein">Liechtenstein</option>
<option value="Lithuania">Lithuania</option>
<option value="Luxembourg">Luxembourg</option>
<option value="Madagascar">Madagascar</option>
<option value="Malawi">Malawi</option>
<option value="Malaysia">Malaysia</option>
<option value="Maldives">Maldives</option>
<option value="Mali">Mali</option>
<option value="Malta">Malta</option>
<option value="Marshall Islands">Marshall Islands</option>
<option value="Mauritania">Mauritania</option>
<option value="Mauritius">Mauritius</option>
<option value="Mexico">Mexico</option>
<option value="Micronesia">Micronesia</option>
<option value="Moldova">Moldova</option>
<option value="Monaco">Monaco</option>
<option value="Mongolia">Mongolia</option>
<option value="Montenegro">Montenegro</option>
<option value="Morocco">Morocco</option>
<option value="Mozambique">Mozambique</option>
<option value="Myanmar (formerly Burma)">Myanmar (formerly Burma)</option>
<option value="Namibia">Namibia</option>
<option value="Nauru">Nauru</option>
<option value="Nepal">Nepal</option>
<option value="Netherlands">Netherlands</option>
<option value="New Zealand">New Zealand</option>
<option value="Nicaragua">Nicaragua</option>
<option value="Niger">Niger</option>
<option value="Nigeria">Nigeria</option>
<option value="North Korea">North Korea</option>
<option value="North Macedonia">North Macedonia</option>
<option value="Norway">Norway</option>
<option value="Oman">Oman</option>
<option value="Pakistan">Pakistan</option>
<option value="Palau">Palau</option>
<option value="Palestine State">Palestine State</option>
<option value="Panama">Panama</option>
<option value="Papua New Guinea">Papua New Guinea</option>
<option value="Paraguay">Paraguay</option>
<option value="Peru">Peru</option>
<option value="Philippines">Philippines</option>
<option value="Poland">Poland</option>
<option value="Portugal">Portugal</option>
<option value="Qatar">Qatar</option>
<option value="Romania">Romania</option>
<option value="Russia">Russia</option>
<option value="Rwanda">Rwanda</option>
<option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
<option value="Saint Lucia">Saint Lucia</option>
<option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
<option value="Samoa">Samoa</option>
<option value="San Marino">San Marino</option>
<option value="Sao Tome and Principe">Sao Tome and Principe</option>
<option value="Saudi Arabia">Saudi Arabia</option>
<option value="Senegal">Senegal</option>
<option value="Serbia">Serbia</option>
<option value="Seychelles">Seychelles</option>
<option value="Sierra Leone">Sierra Leone</option>
<option value="Singapore">Singapore</option>
<option value="Slovakia">Slovakia</option>
<option value="Slovenia">Slovenia</option>
<option value="Solomon Islands">Solomon Islands</option>
<option value="Somalia">Somalia</option>
<option value="South Africa">South Africa</option>
<option value="South Korea">South Korea</option>
<option value="South Sudan">South Sudan</option>
<option value="Spain">Spain</option>
<option value="Sri Lanka">Sri Lanka</option>
<option value="Sudan">Sudan</option>
<option value="Suriname">Suriname</option>
<option value="Sweden">Sweden</option>
<option value="Switzerland">Switzerland</option>
<option value="Syria">Syria</option>
<option value="Tajikistan">Tajikistan</option>
<option value="Tanzania">Tanzania</option>
<option value="Thailand">Thailand</option>
<option value="Timor-Leste">Timor-Leste</option>
<option value="Togo">Togo</option>
<option value="Tonga">Tonga</option>
<option value="Trinidad and Tobago">Trinidad and Tobago</option>
<option value="Tunisia">Tunisia</option>
<option value="Turkey">Turkey</option>
<option value="Turkmenistan">Turkmenistan</option>
<option value="Tuvalu">Tuvalu</option>
<option value="Uganda">Uganda</option>
<option value="Ukraine">Ukraine</option>
<option value="United Arab Emirates">United Arab Emirates</option>
<option value="United Kingdom">United Kingdom</option>
<option value="United States of America">United States of America</option>
<option value="Uruguay">Uruguay</option>
<option value="Uzbekistan">Uzbekistan</option>
<option value="Vanuatu">Vanuatu</option>
<option value="Venezuela">Venezuela</option>
<option value="Vietnam">Vietnam</option>
<option value="Yemen">Yemen</option>
<option value="Zambia">Zambia</option>
<option value="Zimbabwe">Zimbabwe</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">City <span style="font-weight: normal; color: #777;">المدينة</span></label>
                                        <input type="text" name="city" class="form-control" placeholder="Enter your city" style="border-radius: 6px; font-size: 13px; padding: 10px 12px; border: 1px solid #ddd; width: 100%;">
                                    </div>
                                    <div class="col-md-6" style="padding: 0 10px; margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #333; font-size: 13px;">Mobile Number <span style="font-weight: normal; color: #777;">رقم الجوال</span> *</label>
                                        <div class="input-group" style="border-radius: 6px; overflow: hidden; border: 1px solid #ddd; display: flex;">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="max-width: 130px; font-size: 13px; padding: 10px 12px; border: none; background-color: #f8f9fa; border-right: 1px solid #ddd;">
                                                    <option data-countryCode="AE" value="971">UAE (+971)</option>
                                                    <option data-countryCode="SA" value="966">Saudi Arabia (+966)</option>
                                                    <option data-countryCode="QA" value="974">Qatar (+974)</option>
                                                    <option data-countryCode="BH" value="973">Bahrain (+973)</option>
                                                    <option data-countryCode="KW" value="965">Kuwait (+965)</option>
                                                    <option data-countryCode="OM" value="968">Oman (+968)</option>
                                                    <option data-countryCode="IN" value="91">India (+91)</option>
                                                    <option data-countryCode="US" value="1">US (+1)</option>
                                                    <option data-countryCode="GB" value="44">UK (+44)</option>
                                                    <optgroup label="Other countries">
                                                        <option data-countryCode="AF" value="93">Afghanistan (+93)</option>
                                                        <option data-countryCode="AL" value="355">Albania (+355)</option>
                                                        <option data-countryCode="DZ" value="213">Algeria (+213)</option>
                                                        <option data-countryCode="AD" value="376">Andorra (+376)</option>
                                                        <option data-countryCode="AO" value="244">Angola (+244)</option>
                                                        <option data-countryCode="AI" value="1264">Anguilla (+1264)</option>
                                                        <option data-countryCode="AG" value="1268">Antigua & Barbuda (+1268)</option>
                                                        <option data-countryCode="AR" value="54">Argentina (+54)</option>
                                                        <option data-countryCode="AM" value="374">Armenia (+374)</option>
                                                        <option data-countryCode="AW" value="297">Aruba (+297)</option>
                                                        <option data-countryCode="AU" value="61">Australia (+61)</option>
                                                        <option data-countryCode="AT" value="43">Austria (+43)</option>
                                                        <option data-countryCode="AZ" value="994">Azerbaijan (+994)</option>
                                                        <option data-countryCode="BS" value="1242">Bahamas (+1242)</option>
                                                        <option data-countryCode="BD" value="880">Bangladesh (+880)</option>
                                                        <option data-countryCode="BB" value="1246">Barbados (+1246)</option>
                                                        <option data-countryCode="BY" value="375">Belarus (+375)</option>
                                                        <option data-countryCode="BE" value="32">Belgium (+32)</option>
                                                        <option data-countryCode="BZ" value="501">Belize (+501)</option>
                                                        <option data-countryCode="BJ" value="229">Benin (+229)</option>
                                                        <option data-countryCode="BM" value="1441">Bermuda (+1441)</option>
                                                        <option data-countryCode="BT" value="975">Bhutan (+975)</option>
                                                        <option data-countryCode="BO" value="591">Bolivia (+591)</option>
                                                        <option data-countryCode="BA" value="387">Bosnia Herzegovina (+387)</option>
                                                        <option data-countryCode="BW" value="267">Botswana (+267)</option>
                                                        <option data-countryCode="BR" value="55">Brazil (+55)</option>
                                                        <option data-countryCode="BN" value="673">Brunei (+673)</option>
                                                        <option data-countryCode="BG" value="359">Bulgaria (+359)</option>
                                                        <option data-countryCode="BF" value="226">Burkina Faso (+226)</option>
                                                        <option data-countryCode="BI" value="257">Burundi (+257)</option>
                                                        <option data-countryCode="KH" value="855">Cambodia (+855)</option>
                                                        <option data-countryCode="CM" value="237">Cameroon (+237)</option>
                                                        <option data-countryCode="CA" value="1">Canada (+1)</option>
                                                        <option data-countryCode="CV" value="238">Cape Verde Islands (+238)</option>
                                                        <option data-countryCode="KY" value="1345">Cayman Islands (+1345)</option>
                                                        <option data-countryCode="CF" value="236">Central African Republic (+236)</option>
                                                        <option data-countryCode="CL" value="56">Chile (+56)</option>
                                                        <option data-countryCode="CN" value="86">China (+86)</option>
                                                        <option data-countryCode="CO" value="57">Colombia (+57)</option>
                                                        <option data-countryCode="KM" value="269">Comoros (+269)</option>
                                                        <option data-countryCode="CG" value="242">Congo (+242)</option>
                                                        <option data-countryCode="CK" value="682">Cook Islands (+682)</option>
                                                        <option data-countryCode="CR" value="506">Costa Rica (+506)</option>
                                                        <option data-countryCode="HR" value="385">Croatia (+385)</option>
                                                        <option data-countryCode="CU" value="53">Cuba (+53)</option>
                                                        <option data-countryCode="CY" value="90392">Cyprus North (+90392)</option>
                                                        <option data-countryCode="CY" value="357">Cyprus South (+357)</option>
                                                        <option data-countryCode="CZ" value="42">Czech Republic (+42)</option>
                                                        <option data-countryCode="DK" value="45">Denmark (+45)</option>
                                                        <option data-countryCode="DJ" value="253">Djibouti (+253)</option>
                                                        <option data-countryCode="DM" value="1809">Dominica (+1809)</option>
                                                        <option data-countryCode="DO" value="1809">Dominican Republic (+1809)</option>
                                                        <option data-countryCode="EC" value="593">Ecuador (+593)</option>
                                                        <option data-countryCode="EG" value="20">Egypt (+20)</option>
                                                        <option data-countryCode="SV" value="503">El Salvador (+503)</option>
                                                        <option data-countryCode="GQ" value="240">Equatorial Guinea (+240)</option>
                                                        <option data-countryCode="ER" value="291">Eritrea (+291)</option>
                                                        <option data-countryCode="EE" value="372">Estonia (+372)</option>
                                                        <option data-countryCode="ET" value="251">Ethiopia (+251)</option>
                                                        <option data-countryCode="FK" value="500">Falkland Islands (+500)</option>
                                                        <option data-countryCode="FO" value="298">Faroe Islands (+298)</option>
                                                        <option data-countryCode="FJ" value="679">Fiji (+679)</option>
                                                        <option data-countryCode="FI" value="358">Finland (+358)</option>
                                                        <option data-countryCode="FR" value="33">France (+33)</option>
                                                        <option data-countryCode="GF" value="594">French Guiana (+594)</option>
                                                        <option data-countryCode="PF" value="689">French Polynesia (+689)</option>
                                                        <option data-countryCode="GA" value="241">Gabon (+241)</option>
                                                        <option data-countryCode="GM" value="220">Gambia (+220)</option>
                                                        <option data-countryCode="GE" value="7880">Georgia (+7880)</option>
                                                        <option data-countryCode="DE" value="49">Germany (+49)</option>
                                                        <option data-countryCode="GH" value="233">Ghana (+233)</option>
                                                        <option data-countryCode="GI" value="350">Gibraltar (+350)</option>
                                                        <option data-countryCode="GR" value="30">Greece (+30)</option>
                                                        <option data-countryCode="GL" value="299">Greenland (+299)</option>
                                                        <option data-countryCode="GD" value="1473">Grenada (+1473)</option>
                                                        <option data-countryCode="GP" value="590">Guadeloupe (+590)</option>
                                                        <option data-countryCode="GU" value="671">Guam (+671)</option>
                                                        <option data-countryCode="GT" value="502">Guatemala (+502)</option>
                                                        <option data-countryCode="GN" value="224">Guinea (+224)</option>
                                                        <option data-countryCode="GW" value="245">Guinea - Bissau (+245)</option>
                                                        <option data-countryCode="GY" value="592">Guyana (+592)</option>
                                                        <option data-countryCode="HT" value="509">Haiti (+509)</option>
                                                        <option data-countryCode="HN" value="504">Honduras (+504)</option>
                                                        <option data-countryCode="HK" value="852">Hong Kong (+852)</option>
                                                        <option data-countryCode="HU" value="36">Hungary (+36)</option>
                                                        <option data-countryCode="IS" value="354">Iceland (+354)</option>
                                                        <option data-countryCode="ID" value="62">Indonesia (+62)</option>
                                                        <option data-countryCode="IR" value="98">Iran (+98)</option>
                                                        <option data-countryCode="IQ" value="964">Iraq (+964)</option>
                                                        <option data-countryCode="IE" value="353">Ireland (+353)</option>
                                                        <option data-countryCode="IL" value="972">Israel (+972)</option>
                                                        <option data-countryCode="IT" value="39">Italy (+39)</option>
                                                        <option data-countryCode="JM" value="1876">Jamaica (+1876)</option>
                                                        <option data-countryCode="JP" value="81">Japan (+81)</option>
                                                        <option data-countryCode="JO" value="962">Jordan (+962)</option>
                                                        <option data-countryCode="KZ" value="7">Kazakhstan (+7)</option>
                                                        <option data-countryCode="KE" value="254">Kenya (+254)</option>
                                                        <option data-countryCode="KI" value="686">Kiribati (+686)</option>
                                                        <option data-countryCode="KP" value="850">Korea North (+850)</option>
                                                        <option data-countryCode="KR" value="82">Korea South (+82)</option>
                                                        <option data-countryCode="KG" value="996">Kyrgyzstan (+996)</option>
                                                        <option data-countryCode="LA" value="856">Laos (+856)</option>
                                                        <option data-countryCode="LV" value="371">Latvia (+371)</option>
                                                        <option data-countryCode="LB" value="961">Lebanon (+961)</option>
                                                        <option data-countryCode="LS" value="266">Lesotho (+266)</option>
                                                        <option data-countryCode="LR" value="231">Liberia (+231)</option>
                                                        <option data-countryCode="LY" value="218">Libya (+218)</option>
                                                        <option data-countryCode="LI" value="417">Liechtenstein (+417)</option>
                                                        <option data-countryCode="LT" value="370">Lithuania (+370)</option>
                                                        <option data-countryCode="LU" value="352">Luxembourg (+352)</option>
                                                        <option data-countryCode="MO" value="853">Macao (+853)</option>
                                                        <option data-countryCode="MK" value="389">Macedonia (+389)</option>
                                                        <option data-countryCode="MG" value="261">Madagascar (+261)</option>
                                                        <option data-countryCode="MW" value="265">Malawi (+265)</option>
                                                        <option data-countryCode="MY" value="60">Malaysia (+60)</option>
                                                        <option data-countryCode="MV" value="960">Maldives (+960)</option>
                                                        <option data-countryCode="ML" value="223">Mali (+223)</option>
                                                        <option data-countryCode="MT" value="356">Malta (+356)</option>
                                                        <option data-countryCode="MH" value="692">Marshall Islands (+692)</option>
                                                        <option data-countryCode="MQ" value="596">Martinique (+596)</option>
                                                        <option data-countryCode="MR" value="222">Mauritania (+222)</option>
                                                        <option data-countryCode="YT" value="269">Mayotte (+269)</option>
                                                        <option data-countryCode="MX" value="52">Mexico (+52)</option>
                                                        <option data-countryCode="FM" value="691">Micronesia (+691)</option>
                                                        <option data-countryCode="MD" value="373">Moldova (+373)</option>
                                                        <option data-countryCode="MC" value="377">Monaco (+377)</option>
                                                        <option data-countryCode="MN" value="976">Mongolia (+976)</option>
                                                        <option data-countryCode="MS" value="1664">Montserrat (+1664)</option>
                                                        <option data-countryCode="MA" value="212">Morocco (+212)</option>
                                                        <option data-countryCode="MZ" value="258">Mozambique (+258)</option>
                                                        <option data-countryCode="MN" value="95">Myanmar (+95)</option>
                                                        <option data-countryCode="NA" value="264">Namibia (+264)</option>
                                                        <option data-countryCode="NR" value="674">Nauru (+674)</option>
                                                        <option data-countryCode="NP" value="977">Nepal (+977)</option>
                                                        <option data-countryCode="NL" value="31">Netherlands (+31)</option>
                                                        <option data-countryCode="NC" value="687">New Caledonia (+687)</option>
                                                        <option data-countryCode="NZ" value="64">New Zealand (+64)</option>
                                                        <option data-countryCode="NI" value="505">Nicaragua (+505)</option>
                                                        <option data-countryCode="NE" value="227">Niger (+227)</option>
                                                        <option data-countryCode="NG" value="234">Nigeria (+234)</option>
                                                        <option data-countryCode="NU" value="683">Niue (+683)</option>
                                                        <option data-countryCode="NF" value="672">Norfolk Islands (+672)</option>
                                                        <option data-countryCode="NP" value="670">Northern Marianas (+670)</option>
                                                        <option data-countryCode="NO" value="47">Norway (+47)</option>
                                                        <option data-countryCode="PW" value="680">Palau (+680)</option>
                                                        <option data-countryCode="PA" value="507">Panama (+507)</option>
                                                        <option data-countryCode="PG" value="675">Papua New Guinea (+675)</option>
                                                        <option data-countryCode="PY" value="595">Paraguay (+595)</option>
                                                        <option data-countryCode="PE" value="51">Peru (+51)</option>
                                                        <option data-countryCode="PH" value="63">Philippines (+63)</option>
                                                        <option data-countryCode="PL" value="48">Poland (+48)</option>
                                                        <option data-countryCode="PT" value="351">Portugal (+351)</option>
                                                        <option data-countryCode="PR" value="1787">Puerto Rico (+1787)</option>
                                                        <option data-countryCode="RE" value="262">Reunion (+262)</option>
                                                        <option data-countryCode="RO" value="40">Romania (+40)</option>
                                                        <option data-countryCode="RU" value="7">Russia (+7)</option>
                                                        <option data-countryCode="RW" value="250">Rwanda (+250)</option>
                                                        <option data-countryCode="SM" value="378">San Marino (+378)</option>
                                                        <option data-countryCode="ST" value="239">Sao Tome & Principe (+239)</option>
                                                        <option data-countryCode="SN" value="221">Senegal (+221)</option>
                                                        <option data-countryCode="CS" value="381">Serbia (+381)</option>
                                                        <option data-countryCode="SC" value="248">Seychelles (+248)</option>
                                                        <option data-countryCode="SL" value="232">Sierra Leone (+232)</option>
                                                        <option data-countryCode="SG" value="65">Singapore (+65)</option>
                                                        <option data-countryCode="SK" value="421">Slovak Republic (+421)</option>
                                                        <option data-countryCode="SI" value="386">Slovenia (+386)</option>
                                                        <option data-countryCode="SB" value="677">Solomon Islands (+677)</option>
                                                        <option data-countryCode="SO" value="252">Somalia (+252)</option>
                                                        <option data-countryCode="ZA" value="27">South Africa (+27)</option>
                                                        <option data-countryCode="ES" value="34">Spain (+34)</option>
                                                        <option data-countryCode="LK" value="94">Sri Lanka (+94)</option>
                                                        <option data-countryCode="SH" value="290">St. Helena (+290)</option>
                                                        <option data-countryCode="KN" value="1869">St. Kitts (+1869)</option>
                                                        <option data-countryCode="SC" value="1758">St. Lucia (+1758)</option>
                                                        <option data-countryCode="SD" value="249">Sudan (+249)</option>
                                                        <option data-countryCode="SR" value="597">Suriname (+597)</option>
                                                        <option data-countryCode="SZ" value="268">Swaziland (+268)</option>
                                                        <option data-countryCode="SE" value="46">Sweden (+46)</option>
                                                        <option data-countryCode="CH" value="41">Switzerland (+41)</option>
                                                        <option data-countryCode="SI" value="963">Syria (+963)</option>
                                                        <option data-countryCode="TW" value="886">Taiwan (+886)</option>
                                                        <option data-countryCode="TJ" value="7">Tajikstan (+7)</option>
                                                        <option data-countryCode="TH" value="66">Thailand (+66)</option>
                                                        <option data-countryCode="TG" value="228">Togo (+228)</option>
                                                        <option data-countryCode="TO" value="676">Tonga (+676)</option>
                                                        <option data-countryCode="TT" value="1868">Trinidad & Tobago (+1868)</option>
                                                        <option data-countryCode="TN" value="216">Tunisia (+216)</option>
                                                        <option data-countryCode="TR" value="90">Turkey (+90)</option>
                                                        <option data-countryCode="TM" value="993">Turkmenistan (+993)</option>
                                                        <option data-countryCode="TC" value="1649">Turks & Caicos Islands (+1649)</option>
                                                        <option data-countryCode="TV" value="688">Tuvalu (+688)</option>
                                                        <option data-countryCode="UG" value="256">Uganda (+256)</option>
                                                        <option data-countryCode="UA" value="380">Ukraine (+380)</option>
                                                        <option data-countryCode="UY" value="598">Uruguay (+598)</option>
                                                        <option data-countryCode="UZ" value="7">Uzbekistan (+7)</option>
                                                        <option data-countryCode="VU" value="678">Vanuatu (+678)</option>
                                                        <option data-countryCode="VA" value="379">Vatican City (+379)</option>
                                                        <option data-countryCode="VE" value="58">Venezuela (+58)</option>
                                                        <option data-countryCode="VN" value="84">Vietnam (+84)</option>
                                                        <option data-countryCode="VG" value="84">Virgin Islands - British (+1284)</option>
                                                        <option data-countryCode="VI" value="84">Virgin Islands - US (+1340)</option>
                                                        <option data-countryCode="WF" value="681">Wallis & Futuna (+681)</option>
                                                        <option data-countryCode="YE" value="969">Yemen (North)(+969)</option>
                                                        <option data-countryCode="YE" value="967">Yemen (South)(+967)</option>
                                                        <option data-countryCode="ZM" value="260">Zambia (+260)</option>
                                                        <option data-countryCode="ZW" value="263">Zimbabwe (+263)</option>
                                                    </optgroup>
                                                </select>
                                                <input type="text" name="phone" required class="form-control" placeholder="Enter mobile number" style="font-size: 13px; padding: 10px 12px; border: none; flex-grow: 1;">
                                        </div>
                                    </div>


                                    <!-- Cloudflare Turnstile -->
                                    <div class="col-md-12" style="margin-bottom: 10px;">
                                        <div id="turnstile-container"></div>
                                    </div>
                                </div>
                                                                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding: 0 10px;">
                                    <button type="button" class="btn" data-bs-dismiss="modal" style="background-color: white; color: #6c757d; border: 1px solid #6c757d; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إلغاء</span> Cancel
                                    </button>
                                    <button type="submit" class="btn" style="background-color: white; color: #015bb5; border: 1px solid #015bb5; border-radius: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                                        <span dir="rtl">إرسال الطلب</span> Submit Request <i class="ri-arrow-right-line"></i>
                                    </button>
                                </div>
                            </form>
                            <div id="quote-otp-section" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="quoteStatusModal" tabindex="-1" aria-labelledby="quoteStatusModalLabel" aria-hidden="true" style="z-index: 100001;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 12px; border: none; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div class="modal-header" style="background-color: #fff; border-bottom: none; padding: 20px 25px 10px;">
                            <h5 class="modal-title" id="quoteStatusModalLabel" style="font-weight: 700; color: #333;">Request Status</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="border: 1px solid #ddd; border-radius: 50%; padding: 8px; opacity: 1; background-size: 10px;"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px; text-align: center;">
                            <div id="quote-status-icon" style="font-size: 40px; margin-bottom: 15px; line-height: 1;"></div>
                            <h6 id="quote-status-title" style="font-weight: 700; margin-bottom: 10px; color: #333;"></h6>
                            <p id="quote-status-message" style="margin: 0; color: #666;"></p>
                        </div>
                        <div class="modal-footer" style="border-top: 1px solid #ddd;">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="background-color: #0275c6; border-color: #0275c6;">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('body').append(sidebarHtml);
        $('body').append(modalHtml);
    }

    function loadCart() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                cart = JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing cart data", e);
                cart = [];
            }
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCartSidebar();
        if ($('#quoteRequestModal').hasClass('show')) {
            renderModalCartSpace();
        }
    }

    function updateCartItemQty(id, action) {
        var existing = cart.find(function (item) { return String(item.id) === String(id); });
        if (existing) {
            if (action === 'increase') {
                existing.qty++;
            } else if (action === 'decrease') {
                existing.qty = Math.max(1, existing.qty - 1);
            }
            saveCart();
        }
    }

    function addToCart(product, skipSidebar) {
        var existing = cart.find(function (item) { return String(item.id) === String(product.id); });
        if (existing) {
            existing.qty += product.qty || 1;
            // Update brand if it was missing or undefined
            if (!existing.brand || existing.brand === 'undefined') {
                existing.brand = product.brand || '';
            }
            existing.name_ar = product.name_ar || existing.name_ar || '';
            existing.desc_en = product.desc_en || existing.desc_en || '';
            existing.desc_ar = product.desc_ar || existing.desc_ar || '';
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                name_ar: product.name_ar || '',
                desc_en: product.desc_en || '',
                desc_ar: product.desc_ar || '',
                brand: product.brand || '',
                image: product.image,
                url: product.url || '#',
                qty: product.qty || 1
            });
        }
        saveCart();
        if (!skipSidebar) {
            openSidebar();
        }
    }

    function removeFromCart(id) {
        cart = cart.filter(function (item) { return String(item.id) !== String(id); });
        saveCart();
    }

    function updateCartCount() {
        var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
        $('.quote-basket-count').text(count);
    }

    function renderCartSidebar() {
        var $container = $('.cart-items');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.<br><span dir="rtl" style="display: block; margin-top: 5px;">سلة العروض الخاصة بك فارغة.</span></div>');
            $('.cart-count').text("0");
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="background: #fff; border: 1px solid #eaeaea; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <div style="display: flex; padding: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: contain; margin-right: 15px; border: 1px solid #f0f0f0; border-radius: 4px; padding: 4px;">
                        
                        <div style="flex: 1; min-width: 0; padding-right: 10px;">
                            <h5 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #111; line-height: 1.3;">${item.name}</h5>
                            <div style="font-size: 11px; color: #666; margin-bottom: 8px;">SKU: ${item.id}</div>
                            
                            <div style="display: flex; align-items: center; gap: 5px; color: #28a745; font-size: 11px; font-weight: 600;">
                                <i class="ri-checkbox-circle-fill"></i> In Stock <span dir="rtl" style="font-weight: 500; font-size: 10px;">/ متوفر</span>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                            <div class="remove-from-cart-btn" data-id="${item.id}" style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
                                <div style="width: 30px; height: 30px; border-radius: 50%; background: #fff0f0; color: #dc3545; display: flex; align-items: center; justify-content: center; font-size: 16px; margin-bottom: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#ffdfdf'" onmouseout="this.style.backgroundColor='#fff0f0'">
                                    <i class="ri-delete-bin-line"></i>
                                </div>
                                <span style="color: #dc3545; font-size: 10px; font-weight: 500;">Remove <span dir="rtl">إزالة</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px dashed #eaeaea; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; background: #fafafa;">
                        <span style="font-size: 12px; font-weight: 600; color: #444;">Quantity <span dir="rtl" style="font-weight: 500; color: #666; font-size: 11px;">/ الكمية</span></span>
                        <div class="qty-control" style="display: flex; align-items: center; background: #fff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 16px; color: #555; cursor: pointer;">-</button>
                            <input type="text" value="${item.qty}" readonly style="width: 35px; height: 30px; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; text-align: center; font-size: 13px; font-weight: 700; color: #111; padding: 0;">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="increase" style="background: transparent; border: none; width: 30px; height: 30px; font-size: 14px; color: #555; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
            `;
            $container.append(html);
        });
        
        var totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
        $('.cart-count').text(totalQty);
    }

    function renderModalCartSpace() {
        var $container = $('#modal-quote-cart-body');
        if ($container.length === 0) return;

        $container.empty();

        if (cart.length === 0) {
            $container.html('<tr><td colspan="3" class="text-center" style="padding: 20px;">Your quote basket is empty.</td></tr>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <tr>
                    <td class="text-start" style="padding: 15px 10px;">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" style="width: 60px; margin-right: 15px;">
                            <div style="flex-grow: 1;">
                                <h4 style="font-size: 14px; margin: 0; font-weight: 700;">
                                    ${item.name}
                                    ${item.name_ar ? `<span style="display: block; font-size: 12px; color: #555; font-weight: 600; text-align: right; margin-top: 2px;" dir="rtl">${item.name_ar}</span>` : ''}
                                </h4>
                            </div>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <div class="qty-control d-flex justify-content-center align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="decrease" style="padding: 0 8px;">-</button>
                            <input type="text" value="${item.qty}" readonly class="form-control form-control-sm mx-2" style="width: 40px; text-align: center;">
                            <button type="button" class="btn btn-sm btn-outline-secondary update-qty" data-id="${item.id}" data-action="increase" style="padding: 0 8px;">+</button>
                        </div>
                    </td>
                    <td class="text-center" style="vertical-align: middle; padding: 15px 10px;">
                        <a href="javascript:void(0);" class="remove-item" data-id="${item.id}"><i class="ri-delete-bin-line" style="font-size: 18px; color: #999;"></i></a>
                    </td>
                </tr>
            `;
            $container.append(html);
        });
    }

    function openSidebar() {
        renderCartSidebar();
        $('#cart-sidebar').addClass('active');
        $('.cart-overlay').addClass('active');
    }

    function closeSidebar() {
        $('#cart-sidebar').removeClass('active');
        $('.cart-overlay').removeClass('active');
    }

    function showStatusPopup(type, message) {
        var modalElement = document.getElementById('quoteStatusModal');
        var modalInstance;
        var title = type === 'success' ? 'Request Submitted' : 'Request Failed';
        var icon = type === 'success'
            ? '<i class="ri-checkbox-circle-line" style="color: #198754;"></i>'
            : '<i class="ri-error-warning-line" style="color: #dc3545;"></i>';

        $('#quote-status-title').text(title);
        $('#quote-status-message').text(message);
        $('#quote-status-icon').html(icon);

        modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        $(document).off('click', '.add-to-cart-btn, #spec-add-cart').on('click', '.add-to-cart-btn, #spec-add-cart', function (e) {
            e.preventDefault();

            var $btn = $(this);
            var id = $btn.attr('data-id') || $btn.data('id');
            var name = $btn.attr('data-name') || $btn.data('name') || id;
            var nameAr = $btn.attr('data-name-ar') || $btn.data('name-ar') || '';
            var descEn = $btn.attr('data-desc-en') || $btn.data('desc-en') || '';
            var descAr = $btn.attr('data-desc-ar') || $btn.data('desc-ar') || '';
            var img = $btn.attr('data-image') || $btn.data('image');
            var brand = $btn.attr('data-brand') || $btn.data('brand') || '';

            addToCart({
                id: id,
                name: name,
                name_ar: nameAr,
                desc_en: descEn,
                desc_ar: descAr,
                brand: brand,
                image: img
            });
        });

        $(document).off('click', '.request-quote-btn, #spec-req-quote').on('click', '.request-quote-btn, #spec-req-quote', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var id = $btn.attr('data-id') || $btn.data('id');
            var name = $btn.attr('data-name') || $btn.data('name') || id;
            var nameAr = $btn.attr('data-name-ar') || $btn.data('name-ar') || '';
            var descEn = $btn.attr('data-desc-en') || $btn.data('desc-en') || '';
            var descAr = $btn.attr('data-desc-ar') || $btn.data('desc-ar') || '';
            var img = $btn.attr('data-image') || $btn.data('image');
            var brand = $btn.attr('data-brand') || $btn.data('brand') || '';

            addToCart({
                id: id,
                name: name,
                name_ar: nameAr,
                desc_en: descEn,
                desc_ar: descAr,
                brand: brand,
                image: img
            }, true); // pass true to skip opening sidebar
            
            $('#quoteRequestModal').modal('show');
        });

        $('#quoteRequestModal').on('show.bs.modal', function (e) {
            // BEST UX: Always show the quote form, bypassing the sign-in requirement entirely
            $('#quote-auth-prompt').hide();
            $('#quote-otp-section').hide();
            $('#modal-quote-cart-items').parent().show();
            $('#quote-form-modal').attr('style', 'display: block');
            $('#quote-form-modal').find('button[type="submit"]').html('<span dir="rtl">إرسال الطلب</span> Submit Request <i class="ri-arrow-right-line"></i>').prop('disabled', false);
        });

        $(document).off('click', '.close-cart, .cart-overlay').on('click', '.close-cart, .cart-overlay', function () {
            closeSidebar();
        });

        $(document).off('click', '.remove-from-cart-btn, .remove-item').on('click', '.remove-from-cart-btn, .remove-item', function (e) {
            e.preventDefault();
            removeFromCart($(this).data('id'));
        });

        $(document).off('click', '.update-qty').on('click', '.update-qty', function () {
            var id = $(this).data('id');
            var action = $(this).data('action');
            var item = cart.find(function (i) { return i.id === id; });
            if (item) {
                if (action === 'increase') item.qty++;
                else if (action === 'decrease' && item.qty > 1) item.qty--;
                saveCart();
                renderCartSidebar(); // Ensure sidebar is updated
                if ($('#quoteRequestModal').hasClass('show')) {
                    renderModalCartSpace();
                }
            }
        });

        $(document).off('change', 'select[name="country"]').on('change', 'select[name="country"]', function () {
            var selectedCountry = $(this).val();
            if (!selectedCountry) return;

            var map = {
                "United Arab Emirates": "UAE",
                "Saudi Arabia": "Saudi Arabia",
                "United Kingdom": "UK",
                "United States of America": "US"
            };
            var searchName = map[selectedCountry] || selectedCountry;

            var found = false;
            // First check for exact prefix with parenthesis
            $('select[name="country_code"] option').each(function () {
                var text = $(this).text();
                if (text.indexOf(searchName + " (") === 0) {
                    $(this).prop('selected', true);
                    found = true;
                    return false;
                }
            });

            // If not found, fuzzy text search
            if (!found) {
                $('select[name="country_code"] option').each(function () {
                    if ($(this).text().indexOf(searchName) !== -1) {
                        $(this).prop('selected', true);
                        return false;
                    }
                });
            }
        });

        $(document).off('submit', '#quote-form-modal').on('submit', '#quote-form-modal', function (e) {
            e.preventDefault();
            var $form = $(this);
            var $btn = $form.find('button[type="submit"]');
            var payload;
            var quoteModalInstance;

            if (cart.length === 0) {
                showStatusPopup('error', 'Your quote basket is empty.');
                return;
            }

            // Anti-Spam: Honeypot Check
            var hpValue = $form.find('[name="hp_field"]').val();
            if (hpValue && hpValue.length > 0) {
                console.warn('Bot detected (Honeypot filled)');
                return; // Silent abort for bots
            }

            // Anti-Spam: Turnstile Check
            var turnstileResponse = $form.find('[name="cf-turnstile-response"]').val();
            if (!turnstileResponse) {
                showStatusPopup('error', 'Please complete the human verification (CAPTCHA).');
                return;
            }

            payload = {
                full_name: ($form.find('[name="full_name"]').val() || '').trim(),
                email: ($form.find('[name="email"]').val() || '').trim(),
                mobile_number: ($form.find('[name="phone"]').val() || '').trim(),
                mobile_country_code: ($form.find('[name="country_code"]').val() || '').trim(),
                country: ($form.find('[name="country"]').val() || '').trim(),
                company_name: ($form.find('[name="company_name"]').val() || '').trim(),
                city: ($form.find('[name="city"]').val() || '').trim(),
                message: ($form.find('[name="message"]').val() || '').trim(),
                turnstile_token: turnstileResponse, // Added for backend verification
                items: cart.map(function (item) {
                    return {
                        item_code: item.id,
                        item_name: item.name,
                        custom_item_name_in_arabic: item.name_ar || '',
                        custom_commercial_description: item.desc_en || '',
                        custom_commercial_description_in_arabic: item.desc_ar || '',
                        brand: item.brand,
                        qty: item.qty
                    };
                })
            };

            $btn.text('Sending...').prop('disabled', true);

            if (!window.isUserLoggedIn) {
                // Not logged in: Generate OTP and send via Google Apps Script
                var generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
                window.pendingOTP = generatedOTP;
                window.pendingPayload = payload;
                
                var userEmail = payload.email;
                var API_URL = 'https://hydrotechglobal.ae/onshore_contact_api.php';
                
                // Send email request
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: payload.full_name,
                        email: userEmail,
                        otp: generatedOTP
                    })
                }).catch(function(err) {
                    console.error("OTP send error:", err);
                });
                
                // Update UI to enter OTP
                $form.attr('style', 'display: none !important');
                $('#modal-quote-cart-items').parent().hide(); // Hide selected products to save space
                $('#quote-otp-section').html(`
                    <div class="text-center" style="padding: 10px 20px;">
                        <i class="ri-mail-check-line" style="font-size: 36px; color: #0177c6; margin-bottom: 10px; display: inline-block;"></i>
                        <h4 style="font-weight: 700; color: #333; margin-bottom: 15px;">
                            Verify Your Email
                            <div dir="rtl" style="font-size: 16px; color: #555; font-weight: 600; margin-top: 5px;">التحقق من بريدك الإلكتروني</div>
                        </h4>
                        <p style="color: #666; font-size: 14px; margin-bottom: 15px; line-height: 1.4;">
                            We just sent a 6-digit code to <strong>` + userEmail + `</strong>.<br>
                            Please enter it below to submit your quote.<br>
                            <span style="font-size: 12px; color: #888; font-style: italic;">(Please also check your spam/junk folder if you don't see it)</span>
                            <span dir="rtl" style="display: block; color: #555; margin-top: 8px; font-size: 13px;">
                                لقد أرسلنا رمزاً من 6 أرقام إلى <strong>` + userEmail + `</strong>.<br>
                                يرجى إدخاله أدناه لإرسال طلب عرض السعر.<br>
                                <span style="font-size: 12px; color: #888; font-style: italic;">(يرجى التحقق من مجلد البريد العشوائي إذا لم تجده)</span>
                            </span>
                        </p>
                        <div style="margin-bottom: 15px;">
                            <input type="text" id="quote-otp-input" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" placeholder="000000" style="font-size: 24px; letter-spacing: 8px; text-align: center; width: 180px; padding: 8px; border: 2px solid #ddd; border-radius: 8px;">
                        </div>
                        <button type="button" id="verify-otp-btn" class="btn" style="background: #0177c6; color: white; padding: 10px 30px; font-weight: 600; border-radius: 6px; margin-bottom: 10px;">
                            Verify & Submit <span dir="rtl" style="margin-left: 8px; font-weight: 500;">| التحقق والإرسال</span>
                        </button>
                        <p id="otp-error-msg" style="color: #dc3545; display: none; margin-top: 10px; font-size: 13px; font-weight: 600;">Invalid verification code. Please try again. <br><span dir="rtl">رمز التحقق غير صالح. يرجى المحاولة مرة أخرى.</span></p>
                        <p id="otp-success-msg" style="color: #28a745; display: none; margin-top: 10px; font-size: 13px; font-weight: 600;">A new code has been sent! <br><span dir="rtl">تم إرسال رمز جديد!</span></p>
                        <div style="margin-top: 10px; font-size: 13px;">
                            <a href="#" id="change-email-btn" style="color: #0177c6; text-decoration: underline; margin-right: 20px; font-weight: 500;">Change Email <span dir="rtl">| تغيير البريد</span></a>
                            <a href="#" id="resend-otp-btn" style="color: #0177c6; text-decoration: underline; font-weight: 500;">Send Again <span dir="rtl">| إرسال مجدداً</span></a>
                        </div>
                    </div>
                `).show();
                return;
            }

            // Already logged in: Submit normally
            sendQuoteToBackend(payload, $btn);
        });

        // Handle OTP verification click
        $(document).off('click', '#verify-otp-btn').on('click', '#verify-otp-btn', function () {
            var rawOTP = $('#quote-otp-input').val() || '';
            // Convert Arabic/Eastern numerals to English numerals
            var val = rawOTP.replace(/[٠-٩]/g, function(d) {
                return String.fromCharCode(d.charCodeAt(0) - 1632);
            }).replace(/[۰-۹]/g, function(d) {
                return String.fromCharCode(d.charCodeAt(0) - 1776);
            });
            // Extract only numbers
            var enteredOTP = val.replace(/[^0-9]/g, '');

            if (enteredOTP === window.pendingOTP && window.pendingOTP) {
                // OTP matches! Clear the UI and submit
                $('#quote-otp-input').prop('disabled', true);
                var $verifyBtn = $(this);
                $verifyBtn.text('Submitting...').prop('disabled', true);
                
                if (window.pendingPayload) {
                    sendQuoteToBackend(window.pendingPayload, $verifyBtn);
                    window.pendingOTP = null;
                    window.pendingPayload = null;
                }
            } else {
                // Incorrect OTP
                $('#otp-error-msg').show();
                $('#quote-otp-input').addClass('is-invalid');
            }
        });

        $(document).off('click', '#change-email-btn').on('click', '#change-email-btn', function (e) {
            e.preventDefault();
            $('#quote-otp-section').hide();
            $('#quote-form-modal').attr('style', 'display: block');
            $('#quote-form-modal').find('button[type="submit"]').text('Submit Request').prop('disabled', false);
        });

        $(document).off('click', '#resend-otp-btn').on('click', '#resend-otp-btn', function (e) {
            e.preventDefault();
            var $resendBtn = $(this);
            $resendBtn.css('pointer-events', 'none').css('opacity', '0.5');

            var userEmail = window.pendingPayload ? window.pendingPayload.email : '';
            var userName = window.pendingPayload ? window.pendingPayload.full_name : '';
            if(!userEmail) return;

            var generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            window.pendingOTP = generatedOTP;
            
            var API_URL = 'https://hydrotechglobal.ae/onshore_contact_api.php';
            
            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    otp: generatedOTP
                })
            }).catch(function(err) {
                console.error("OTP send error:", err);
            });
            
            $('#otp-error-msg').hide();
            $('#otp-success-msg').show();
            setTimeout(function() {
                $('#otp-success-msg').fadeOut();
                $resendBtn.css('pointer-events', 'auto').css('opacity', '1');
            }, 3000);
        });



        $(document).off('shown.bs.modal', '#quoteRequestModal').on('shown.bs.modal', '#quoteRequestModal', function () {
            closeSidebar();
            renderModalCartSpace();
            // Explicitly render Turnstile after modal is fully visible
            if (window.turnstile) {
                try {
                    if (window.turnstileWidgetId !== undefined) {
                        turnstile.reset(window.turnstileWidgetId);
                    } else {
                        $('#turnstile-container').empty();
                        window.turnstileWidgetId = turnstile.render('#turnstile-container', {
                            sitekey: '1x00000000000000000000AA',
                            appearance: 'interaction-only',
                            callback: function(token) {
                                console.log('%c✅ Security Check: Success (Token Generated)', 'color: #28a745; font-weight: bold;');
                            },
                            'error-callback': function() {
                                console.error('%c❌ Security Check: Failed', 'color: #dc3545; font-weight: bold;');
                            }
                        });
                    }
                } catch (e) {
                    console.error('Turnstile render failed:', e);
                }
            }
        });
    }

    function sendQuoteToBackend(payload, $btn) {
        $.ajax({
            url: REQUEST_QUOTE_URL,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                Authorization: REQUEST_QUOTE_AUTH
            },
            data: JSON.stringify(payload),
            success: function (response) {
                var quoteModalInstance = bootstrap.Modal.getInstance(document.getElementById('quoteRequestModal'));
                if (quoteModalInstance) {
                    quoteModalInstance.hide();
                }

                showStatusPopup('success', 'Thank you! Your quote request has been submitted successfully.');

                // Clear cart
                cart = [];
                localStorage.setItem('onshore_quote_cart', JSON.stringify(cart));
                QuoteCart.init(); // Refresh UI
            },
            error: function (err) {
                console.error('Quote request failed:', err);
                showStatusPopup('error', 'Oops! Something went wrong while sending your request. Please try again or contact us directly.');
            },
            complete: function () {
                if ($btn) $btn.text('Submit Request').prop('disabled', false);
            }
        });
    }
    
    // Expose function for auth.js to call after magic link login
    function submitPendingQuote() {
        var pendingData = localStorage.getItem('pending_quote_request');
        if (pendingData) {
            try {
                var payload = JSON.parse(pendingData);
                sendQuoteToBackend(payload, null);
                localStorage.removeItem('pending_quote_request');
            } catch (e) {
                console.error("Failed to parse pending quote", e);
            }
        }
    }

    function injectAbandonedCartReminder() {
        if ($('#abandoned-cart-toast').length > 0) return;
        
        var toastHtml = `
            <style>
                .abandoned-cart-toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 320px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.05);
                    border: 1px solid rgba(255,255,255,0.4);
                    padding: 20px;
                    z-index: 100005;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    pointer-events: none;
                }
                .abandoned-cart-toast.show {
                    transform: translateY(0);
                    opacity: 1;
                    pointer-events: auto;
                }
                .abandoned-cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                .abandoned-cart-title {
                    font-weight: 700;
                    color: #0f172a;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .abandoned-cart-close {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }
                .abandoned-cart-close:hover {
                    color: #ef4444;
                }
                .abandoned-cart-body {
                    color: #475569;
                    font-size: 13px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                }
                .abandoned-cart-btn {
                    display: block;
                    width: 100%;
                    background: #0177c6;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    border-radius: 6px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: background 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .abandoned-cart-btn:hover {
                    background: #015f9e;
                    color: #fff;
                }
                @media (max-width: 768px) {
                    .abandoned-cart-toast {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                }
            </style>
            <div id="abandoned-cart-toast" class="abandoned-cart-toast">
                <div class="abandoned-cart-header">
                    <div class="abandoned-cart-title">
                        <i class="ri-shopping-cart-2-fill" style="color: #0177c6; font-size: 18px;"></i>
                        Welcome back!
                    </div>
                    <button class="abandoned-cart-close" id="close-abandoned-toast">&times;</button>
                </div>
                <div class="abandoned-cart-body">
                    You have <strong><span id="abandoned-item-count"></span> items</strong> waiting in your quote basket. Don't forget to submit your request!
                </div>
                <button class="abandoned-cart-btn" id="resume-quote-btn">Resume Quote</button>
            </div>
        `;
        
        $('body').append(toastHtml);
        
        $('#close-abandoned-toast').on('click', function() {
            $('#abandoned-cart-toast').removeClass('show');
            setTimeout(function() {
                $('#abandoned-cart-toast').remove();
            }, 500);
        });
        
        $('#resume-quote-btn').on('click', function() {
            $('#abandoned-cart-toast').removeClass('show');
            openSidebar();
        });
    }

    function checkAbandonedCart() {
        var now = Date.now();
        var lastActive = localStorage.getItem('cart_last_active_time');
        
        // If there are items in the cart
        if (cart.length > 0) {
            // Check if user has been inactive for more than 30 mins (30 * 60 * 1000)
            var THRESHOLD = 30 * 60 * 1000;
            
            // For testing/demonstration purposes, if lastActive is missing, or if it's over threshold
            if (!lastActive || (now - parseInt(lastActive)) > THRESHOLD) {
                // Ensure we only show it once per browser session using sessionStorage
                if (!sessionStorage.getItem('cart_reminder_shown')) {
                    injectAbandonedCartReminder();
                    
                    $('#abandoned-item-count').text(cart.length);
                    
                    // Small delay for smooth slide-up animation after page load
                    setTimeout(function() {
                        $('#abandoned-cart-toast').addClass('show');
                    }, 1500);
                    
                    sessionStorage.setItem('cart_reminder_shown', 'true');
                }
            }
        }
        
        // Always update the last active time on load
        localStorage.setItem('cart_last_active_time', now);
    }

    return {
        init: init,
        addToCart: addToCart,
        openSidebar: openSidebar,
        closeSidebar: closeSidebar,
        submitPendingQuote: submitPendingQuote
    };

})(jQuery);

$(document).ready(function () {
    QuoteCart.init();
});
