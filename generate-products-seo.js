const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const DOMAIN = 'https://www.onshoretechnical.com';
const API_URL = 'https://onshore.tbo365.cloud/api/method/onshore.api.get_item_details?limit_start=0&limit_page_length=5000';
const API_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';
const OUTPUT_DIR = path.join(__dirname, 'p');

// Helpers matching the frontend
function toTitleCase(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function toSlug(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function fetchProducts() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'Authorization': API_TOKEN }
        };

        https.get(API_URL, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.message || []);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function buildStaticProducts() {
    console.log('Fetching products from ERP...');
    const products = await fetchProducts();
    console.log(`Found ${products.length} products.`);

    const templatePath = path.join(__dirname, 'product-specifications.html');
    if (!fs.existsSync(templatePath)) {
        console.error('Template not found:', templatePath);
        return;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    let successCount = 0;

    products.forEach(p => {
        const rawName = p.item_name || p.name || '';
        if (!rawName) return;

        const slug = toSlug(rawName);
        if (!slug) return;

        const name = rawName.replace(/"/g, '&quot;');
        
        // Build Meta Description
        let metaDesc = '';
        if (p.description) {
            // Very simple HTML strip
            metaDesc = p.description.replace(/<[^>]*>?/gm, '').trim();
        }
        if (!metaDesc || metaDesc.toLowerCase() === rawName.toLowerCase()) {
            const brandPart = (p.custom_brand_name || p.brand) ? `by ${p.custom_brand_name || p.brand}` : '';
            const catPart = p.item_group ? `in ${toTitleCase(p.item_group)}` : '';
            metaDesc = `${rawName} ${brandPart} ${catPart}. Industrial equipment and technical supplies from Onshore Technical Supplies, Saudi Arabia.`.replace(/\s+/g, ' ').trim();
        }
        metaDesc = metaDesc.substring(0, 160).replace(/"/g, '&quot;');

        // Build Image
        let imgPath = p.image || '';
        if (!imgPath && p.attachments && p.attachments.length > 0) {
            imgPath = p.attachments[0].file_url;
        }
        const fullImgUrl = imgPath ? (imgPath.startsWith('http') ? imgPath : `https://onshore.tbo365.cloud${imgPath}`) : `${DOMAIN}/assets/img/logo.png`;

        const canonicalUrl = `${DOMAIN}/p/${slug}.html`;

        // Replace tags in the template using regex so it's robust
        let html = templateContent;

        // 1. Title
        html = html.replace(
            /<title>.*?<\/title>/gi, 
            `<title>${name} | Onshore Technical Supplies</title>`
        );

        // 2. Meta description
        html = html.replace(
            /<meta\s+name="description"\s+content="[^"]*">/gi,
            `<meta name="description" content="${metaDesc}">`
        );
        // Sometimes the template has it formatted with newlines
        html = html.replace(
            /<meta name="description"\s*content="[^"]*">/gi,
            `<meta name="description" content="${metaDesc}">`
        );

        // 3. Open Graph
        html = html.replace(
            /<meta property="og:title" content="[^"]*">/gi,
            `<meta property="og:title" content="${name} | Onshore Technical Supplies">`
        );
        html = html.replace(
            /<meta property="og:description" content="[^"]*">/gi,
            `<meta property="og:description" content="${metaDesc}">`
        );
        html = html.replace(
            /<meta property="og:url" content="[^"]*">/gi,
            `<meta property="og:url" content="${canonicalUrl}">`
        );
        html = html.replace(
            /<meta property="og:image" content="[^"]*">/gi,
            `<meta property="og:image" content="${fullImgUrl}">`
        );

        // 4. Twitter
        html = html.replace(
            /<meta name="twitter:title" content="[^"]*">/gi,
            `<meta name="twitter:title" content="${name} | Onshore Technical Supplies">`
        );
        html = html.replace(
            /<meta name="twitter:description" content="[^"]*">/gi,
            `<meta name="twitter:description" content="${metaDesc}">`
        );
        html = html.replace(
            /<meta name="twitter:image" content="[^"]*">/gi,
            `<meta name="twitter:image" content="${fullImgUrl}">`
        );

        // 5. Inject Canonical Link (just before </head>)
        html = html.replace(
            /<\/head>/i,
            `    <link rel="canonical" href="${canonicalUrl}" />\n</head>`
        );

        // 6. Inject Script for dynamic JS logic
        html = html.replace(
            /<head>/i,
            `<head>\n<script>window.SERVER_ITEM_NAME = "${slug}";</script>`
        );

        // Write the file
        const outPath = path.join(OUTPUT_DIR, `${slug}.html`);
        fs.writeFileSync(outPath, html);
        successCount++;
    });

    console.log(`Successfully generated ${successCount} SEO-friendly product pages in the p/ directory.`);
}

buildStaticProducts();
