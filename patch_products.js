const fs = require('fs');
const content = fs.readFileSync('products.html', 'utf8');

const originalHero = `                        <!-- DESKTOP HERO CONTENT -->
                        <div class="col-lg-5 text-white mb-4 mb-lg-0 text-start d-none d-lg-block">
                            <span class="sub_head text-warning mb-2 d-block"
                                style="font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                                INDUSTRIAL SUPPLIES / المستلزمات الصناعية
                            </span>
                            <h1 class="font-weight-bold mb-2" style="color: #fff; font-size: 21px; line-height: 1.2;">
                                Multi-Sector Industrial Equipment Dealer
                                <span class="d-block mt-1" style="font-size: 15px; font-weight: 700; color: #f5f5f5;"
                                    dir="rtl">موزع معتمد للمعدات الصناعية لكافة القطاعات</span>
                            </h1>
                            <div
                                style="font-size: 13px; color: #e0e0e0; line-height: 1.5; margin-bottom: 15px; max-width: 480px;">
                                <p class="mb-2">
                                    Saudi Arabia's premier distributor of certified machinery, industrial safety gear,
                                    welding systems, and technical equipment.
                                </p>
                                <p class="mb-3 text-start" dir="rtl" style="color: #d0d0d0;">
                                    الموزع الرائد في المملكة للآلات المعتمدة، معدات السلامة، أنظمة اللحام، والأجهزة
                                    التقنية.
                                </p>
                                <span style="font-weight: 500; color: #ffc107; font-size: 12px;">
                                    <i class="ri-truck-fill mr-1"></i> Dammam, Jubail, Al Khobar, Ras Tanura | الدمام،
                                    الجبيل، الخبر، رأس تنورة
                                </span>
                            </div>
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span class="badge bg-primary d-flex align-items-center px-3 py-2"
                                    style="font-size: 11px; font-weight: 500; border-radius: 4px; height: 28px;"><i
                                        class="ri-shield-check-line mr-1" style="font-size: 14px;"></i> CE & EN
                                    Certified</span>
                                <span class="badge bg-warning text-dark d-flex align-items-center px-3 py-2"
                                    style="font-size: 11px; font-weight: 500; border-radius: 4px; height: 28px;"><i
                                        class="ri-settings-3-line mr-1" style="font-size: 14px;"></i> 7:1 Design
                                    Safety</span>
                                <span class="badge bg-success d-flex align-items-center px-3 py-2"
                                    style="font-size: 11px; font-weight: 500; border-radius: 4px; height: 28px;"><i
                                        class="ri-checkbox-circle-line mr-1" style="font-size: 14px;"></i> 100% In-Stock
                                    KSA</span>
                            </div>
                            <div class="mt-4 mb-3 d-flex flex-wrap gap-3">
                                <a href="#catalog-main"
                                    onclick="document.getElementById('catalog-main').scrollIntoView({ behavior: 'smooth', block: 'start' }); return false;"
                                    class="btn text-white px-4 py-2"
                                    style="background-color: #0177c6; border: 1px solid #0177c6; font-size: 13px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(1, 119, 198, 0.4); display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease;"
                                    onmouseover="this.style.backgroundColor=\'#015ca0\'; this.style.borderColor=\'#015ca0\'; this.style.transform=\'translateY(-2px)\';"
                                    onmouseout="this.style.backgroundColor=\'#0177c6\'; this.style.borderColor=\'#0177c6\'; this.style.transform=\'none\';">
                                    <i class="ri-search-line" style="font-size: 16px;"></i> Browse Products
                                </a>
                                <a href="contact.html" class="btn text-white px-4 py-2"
                                    style="background-color: transparent; border: 1px solid rgba(255,255,255,0.5); font-size: 13px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease;"
                                    onmouseover="this.style.backgroundColor=\'rgba(255,255,255,0.1)\'; this.style.borderColor=\'#fff\'; this.style.transform=\'translateY(-2px)\';"
                                    onmouseout="this.style.backgroundColor=\'transparent\'; this.style.borderColor=\'rgba(255,255,255,0.5)\'; this.style.transform=\'none\';">
                                    <i class="ri-file-text-line" style="font-size: 16px;"></i> Request Quote
                                </a>
                            </div>
                            <ul class="breadcrumbs mt-3"
                                style="margin-top: 5px; list-style: none; padding: 0; display: flex; gap: 10px; font-size: 14px;">
                                <li class="home"><a href="./"
                                        style="color: #0177c6; font-weight: 600; text-decoration: none;">Home</a></li>
                                <li style="color: #9d9d9d;">/</li>
                                <li style="color: #fff; font-weight: 300;">Products</li>
                            </ul>
                        </div>
                        
                        <!-- MOBILE HERO CONTENT -->
                        <div class="col-lg-5 text-white mb-4 mb-lg-0 text-start d-lg-none">`;

const currentHero = `<div class="col-lg-5 text-white mb-4 mb-lg-0 text-start">`;
let updated = content.replace(currentHero, originalHero);

const originalTrustBar = `        <!-- DESKTOP B2B Selling Trust Bar -->
        <div class="d-none d-lg-block" style="background: #f8fafc; padding: 12px 0; border-bottom: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
            <div class="container">
                <div class="row g-4 justify-content-center text-center">
                    <div class="col-md-3 col-sm-6">
                        <div class="d-flex flex-column align-items-center p-2">
                            <div
                                style="width: 44px; height: 44px; border-radius: 50%; background: rgba(1, 119, 198, 0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #0177c6;">
                                <i class="ri-truck-line" style="font-size: 22px;"></i>
                            </div>
                            <h6 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Direct
                                KSA Dispatch</h6>
                            <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">Fast supply to
                                Dammam, Jubail, Khobar, Ras Tanura & Riyadh</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="d-flex flex-column align-items-center p-2">
                            <div
                                style="width: 44px; height: 44px; border-radius: 50%; background: rgba(34, 197, 94, 0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #22c55e;">
                                <i class="ri-award-line" style="font-size: 22px;"></i>
                            </div>
                            <h6 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                                Aramco-Ready Compliance</h6>
                            <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">100% original
                                brands with official load test & mill certificates</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="d-flex flex-column align-items-center p-2">
                            <div
                                style="width: 44px; height: 44px; border-radius: 50%; background: rgba(249, 115, 22, 0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #f97316;">
                                <i class="ri-price-tag-3-line" style="font-size: 22px;"></i>
                            </div>
                            <h6 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Bulk
                                Wholesale Rates</h6>
                            <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">Competitive factory
                                pricing & flexible B2B corporate credit terms</p>
                        </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                        <div class="d-flex flex-column align-items-center p-2">
                            <div
                                style="width: 44px; height: 44px; border-radius: 50%; background: rgba(20, 184, 166, 0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #14b8a6;">
                                <i class="ri-customer-service-2-line" style="font-size: 22px;"></i>
                            </div>
                            <h6 style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">24/7
                                Expert Spec Support</h6>
                            <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">Consult engineers
                                for perfect hoist specifications & safety factors</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- MOBILE Trust Bar -->
        <div class="hero-new-trust-bar-container container d-lg-none"`;

const currentTrustBar = `<div class="hero-new-trust-bar-container container"`;
updated = updated.replace(currentTrustBar, originalTrustBar);

fs.writeFileSync('products.html', updated);
console.log('patched');
