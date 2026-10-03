# Onshore Technical Supplies — Project Memory

## Architecture
- **Frontend:** Static HTML/CSS/JS hosted on S3 + CloudFront
- **Backend:** Frappe/ERPNext at `onshore.tbocloud.in` (API)
- **Auth:** Firebase (custom token via OTP) + ERPNext Customer sync
- **CI/CD:** GitHub Actions → generate JSON + SEO pages → `aws s3 sync` → CloudFront invalidation
- **Fonts:** Montserrat + Rajdhani (header), Outfit (products catalog)
- **Icons:** Font Awesome 6.7.2 (CDN) + Remixicon 2.5.0 (CDN)

## Known conventions & gotchas
- Nav has two variants: `nav-dark-links` (index.html, light hero) and default (white logo, dark banners)
- Cart is a quote/enquiry basket (not transactional ecommerce) — stores in `localStorage` key `onshore_quote_cart`
- Auth uses OTP flow: email → `send_otp` → `verify_otp` → Firebase custom token + ERPNext login
- Product catalog reads from static `/assets/data/products.json` built at CI time
- Price/stock hidden from guests, revealed via CSS classes `user-approved-stock` / `user-approved-pricing`
- Recently viewed products stored in `localStorage` key `recently_viewed_products`

## Recent UX fixes (July 2026)
- Font Awesome version 7→6.7.2 across all pages (including generated product/ pages)
- Nav header added to product-specifications.html (was missing entirely)
- `main.js` added to product-specifications.html (scroll effects, global search)
- brands.html now includes products-redesign.css
- contact.html: removed duplicate cart.js include, fixed email href → mailto:
- Social links in index.html footer: added aria-labels
- Logo images: alt attributes added to blog, contact, about, brands, career
- Global search: loading indicator shown while data fetches
- Login popup: replaced 30s intrusive modal with subtle dismissable stock banner
- Logout: clears quote cart and recently viewed products from localStorage
- Country list: 6 GCC countries with timezone auto-detection
- Cart sidebar: responsive width (100vw on mobile)
- Mobile filter: Contact Now button shrinks instead of hiding
- Responsive.css: added 480px breakpoint for mobile-specific overrides
- B2B quote flow explained via bilingual banner above catalog on shop.html and products.html
- "Add to Cart" renamed to "Add to Quote / أضف لعرض السعر" across catalog and product cards
- Arabic text (dir=rtl) added to hero, search, filters, no-results, loading, and error states
- my-quotes.html page added — full quote history for logged-in users
- Auth/cart API URLs changed from localhost:8000 to live domain onshore.tbocloud.in
- Nav shows/hides "My Quotes" link based on Firebase auth state (injected via main.js)
- serve.json updated with /my-quotes rewrite
- Quick-quote slide-in panel: single product → email + phone → OTP (guest) / submit directly (logged in)
- Product cards: "Request Quote" primary button + "Add to Basket" + "View" secondary row
- WhatsApp per-product button on quick-quote panel with pre-filled product name
- Quantity selector (+/-) on quick-quote panel
- Login redirect: saves current page before navigating to login.html, redirects back after auth
- Arabic RTL detection (navigator.language === 'ar') sets dir="rtl" on html + CSS grid flip
- Catalog sidebar: Arabic labels on categories, brands, filters, search placeholder
- contact.html: generic form replaced with quote CTA (Browse Products + WhatsApp)
- All API calls now include Authorization header (prevent CAPTCHA on live server)
- Status popup modal redesigned (green/red icon + Arabic bilingual title/body)
- Bottom floating banner condensed to single line with bilingual message
- Hero CTA changed from "SHOP COLLECTION" to "REQUEST QUOTE"
- Dummy blog post filter (skips lorem/ipsum/dolor/test titles)
- shop.html deleted (unused duplicate of products.html)
