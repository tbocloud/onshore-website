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
    function init() {

        injectCartSidebar();
        loadCart();
        // Cleanup legacy 'undefined' strings from previous cache
        cart.forEach(function (item) {
            if (item.brand === 'undefined') item.brand = '';
        });
        updateCartCount();
        bindEvents();
    }

    // Inject Sidebar HTML into the DOM
    function injectCartSidebar() {
        if ($('#cart-sidebar').length > 0) return;

        var sidebarHtml = `
            <div class="cart-overlay"></div>
            <div id="cart-sidebar">
                <div class="cart-header">
                    <h4>QUOTE BASKET</h4>
                    <span class="close-cart"><i class="ri-close-line"></i></span>
                </div>
                <div class="cart-items">
                    <!-- Items will be injected here -->
                    <div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>
                </div>
                <div class="cart-footer">
                    <a href="#" class="btn-view-cart" data-bs-toggle="modal" data-bs-target="#quoteRequestModal">Request Quote</a>
                </div>
            </div>
        `;

        var modalHtml = `
            <!-- Request Quote Modal -->
            <div class="modal fade" id="quoteRequestModal" tabindex="-1" aria-labelledby="quoteRequestModalLabel" aria-hidden="true" style="z-index: 100000;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="border-radius: 0;">
                        <div class="modal-header" style="background-color: #f8f8f8; border-bottom: 1px solid #ddd;">
                            <h5 class="modal-title" id="quoteRequestModalLabel" style="font-weight: 700; color: #333;">REQUEST QUOTE</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <!-- Products Table Section -->
                            <div class="shopping-cart text-center" style="margin-bottom: 30px;">
                                <div class="cart-head" style="background: #f8f8f8; padding: 10px 0; font-weight: bold; border-bottom: 2px solid #ddd; margin-bottom: 15px;">
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
                                <div id="modal-quote-cart-items" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table" style="width: 100%; margin-bottom: 0;">
                                        <tbody id="modal-quote-cart-body">
                                            <!-- Modal cart items will be injected here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- Form Section -->
                            <form id="quote-form-modal">
                                <!-- Honeypot field (hidden from humans) -->
                                <div style="display:none;">
                                    <label>Leave this field blank</label>
                                    <input type="text" name="hp_field" value="">
                                </div>
                                <div class="row">
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Full Name *</label>
                                        <input type="text" name="full_name" required class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Email *</label>
                                        <input type="email" name="email" required class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Company Name</label>
                                        <input type="text" name="company_name" class="form-control">
                                    </div>
                                    <div class="col-md-6" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Country *</label>
                                        <select name="country" id="quote-country-select" class="form-select" required>
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
                                    <div class="col-md-5" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">City</label>
                                        <input type="text" name="city" class="form-control">
                                    </div>
                                    <div class="col-md-7" style="margin-bottom: 15px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Mobile Number *</label>
                                        <div class="row" style="margin: 0; gap: 5px;">
                                            <div class="col-4" style="padding: 0;">
                                                <select name="country_code" id="quote-country-code" class="form-select" style="padding: 0.375rem 0.5rem; font-size: 13px;">
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
                                            </div>
                                            <div class="col-7" style="padding: 0; flex-grow: 1;">
                                                <input type="text" name="phone" required class="form-control" placeholder="Number">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-12" style="margin-bottom: 20px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #555;">Message</label>
                                        <textarea name="message" rows="4" class="form-control" placeholder="Additional details..."></textarea>
                                    </div>

                                    <!-- Cloudflare Turnstile -->
                                    <div class="col-md-12" style="margin-bottom: 20px;">
                                        <div id="turnstile-container"></div>
                                    </div>
                                </div>
                                <div class="text-end" style="margin-top: 20px;">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="margin-right: 10px;">Cancel</button>
                                    <button type="submit" class="btn btn-primary" style="background-color: #0275c6; border-color: #0275c6;">Submit Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="quoteStatusModal" tabindex="-1" aria-labelledby="quoteStatusModalLabel" aria-hidden="true" style="z-index: 100001;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 0;">
                        <div class="modal-header" style="background-color: #f8f8f8; border-bottom: 1px solid #ddd;">
                            <h5 class="modal-title" id="quoteStatusModalLabel" style="font-weight: 700; color: #333;">Request Status</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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

    function addToCart(product) {
        var existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) {
            existing.qty += product.qty || 1;
            // Update brand if it was missing or undefined
            if (!existing.brand || existing.brand === 'undefined') {
                existing.brand = product.brand || '';
            }
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                brand: product.brand || '',
                image: product.image,
                url: product.url || '#',
                qty: product.qty || 1
            });
        }
        saveCart();
        openSidebar();
    }

    function removeFromCart(id) {
        cart = cart.filter(function (item) { return item.id !== id; });
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
            $container.html('<div class="text-center" style="margin-top: 50px; color: #999;">Your quote basket is empty.</div>');
            return;
        }

        cart.forEach(function (item) {
            var html = `
                <div class="cart-item" style="display: flex; margin-bottom: 20px; border-bottom: 1px solid #f9f9f9; padding-bottom: 15px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
                    <div class="cart-item-details" style="flex-grow: 1;">
                        <h5 style="margin: 0 0 5px; font-size: 14px;">${item.name}</h5>
                        <div class="cart-item-brand" style="font-size: 11px; color: var(--second-color); font-weight: 600; text-transform: uppercase; margin-bottom: 3px;">${item.brand || ''}</div>
                        <div class="qty-control mt-2">
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="decrease">-</button>
                            <input type="text" value="${item.qty}" readonly>
                            <button type="button" class="update-qty" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <span class="remove-from-cart-btn" data-id="${item.id}" style="cursor: pointer; color: #ff0000; padding: 0 5px;"><i class="ri-close-line"></i></span>
                </div>
            `;
            $container.append(html);
        });
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
                            <div>
                                <h4 style="font-size: 14px; margin: 0;">${item.name}</h4>
                                <small style="color: var(--second-color); font-weight: 600; text-transform: uppercase;">${item.brand || ''}</small>
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
        $(document).on('click', '.add-to-cart-btn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var $product = $btn.closest('.product');
            var $brandGroup = $btn.closest('.brand_group');
            var name = $product.find('.product_name').text().trim();
            var img = $product.find('img').attr('src');
            var brand = $brandGroup.attr('data-brand') || '';

            addToCart({
                id: name,
                name: name,
                brand: brand,
                image: img
            });
        });

        $(document).on('click', '.request-quote-btn', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var $product = $btn.closest('.product');
            var $brandGroup = $btn.closest('.brand_group');
            var name = $product.find('.product_name').text().trim();
            var img = $product.find('img').attr('src');
            var brand = $brandGroup.attr('data-brand') || '';

            addToCart({
                id: name,
                name: name,
                brand: brand,
                image: img
            });
            $('#quoteRequestModal').modal('show');
        });

        $(document).on('click', '.close-cart, .cart-overlay', function () {
            closeSidebar();
        });

        $(document).on('click', '.remove-from-cart-btn, .remove-item', function (e) {
            e.preventDefault();
            removeFromCart($(this).data('id'));
        });

        $(document).on('click', '.update-qty', function () {
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

        $(document).on('change', 'select[name="country"]', function () {
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

        $('#quote-form-modal').on('submit', function (e) {
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
                        brand: item.brand,
                        qty: item.qty
                    };
                })
            };

            $btn.text('Sending...').prop('disabled', true);

            $.ajax({
                url: REQUEST_QUOTE_URL,
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    Authorization: REQUEST_QUOTE_AUTH
                },
                data: JSON.stringify(payload),
                success: function (response) {
                    quoteModalInstance = bootstrap.Modal.getInstance(document.getElementById('quoteRequestModal'));
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
                    $btn.text('Submit Request').prop('disabled', false);
                }
            });
        });

        var modalEl = document.getElementById('quoteRequestModal');
        if (modalEl) {
            modalEl.addEventListener('shown.bs.modal', function () {
                closeSidebar();
                renderModalCartSpace();
                // Explicitly render Turnstile after modal is fully visible
                if (window.turnstile) {
                    try {
                        $('#turnstile-container').empty();
                        turnstile.render('#turnstile-container', {
                            sitekey: '1x00000000000000000000AA',
                            appearance: 'interaction-only',
                            callback: function(token) {
                                console.log('%c✅ Security Check: Success (Token Generated)', 'color: #28a745; font-weight: bold;');
                            },
                            'error-callback': function() {
                                console.error('%c❌ Security Check: Failed', 'color: #dc3545; font-weight: bold;');
                            }
                        });
                    } catch (e) {
                        console.error('Turnstile render failed:', e);
                    }
                }
            });
        }
    }

    return {
        init: init,
        addToCart: addToCart,
        openSidebar: openSidebar,
        closeSidebar: closeSidebar
    };

})(jQuery);

$(document).ready(function () {
    QuoteCart.init();
});
