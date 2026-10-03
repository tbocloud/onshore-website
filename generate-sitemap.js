const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const DOMAIN = 'https://www.onshoretechnical.com';
const API_URL = 'https://onshore.tbocloud.in/api/method/onshore.api.get_item_details?limit_start=0&limit_page_length=500';
const API_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';

// Excluded files
const excludeFiles = [
    'products copy.html',
    'index2.html',
    'login.html' // search engines don't need to index login page
];

// Priority mapping for static files
const filePriorities = {
    'index.html': 1.0,
    'products.html': 0.9,
    'industries.html': 0.8,
    'brands.html': 0.8,
    'brands/europull-lifting-equipment-saudi-arabia.html': 0.8,
    'about.html': 0.7,
    'contact.html': 0.7,
    'blog.html': 0.7,
    'career.html': 0.6,
    'my-quotes.html': 0.5
};

async function fetchProducts() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': API_TOKEN
            }
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

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function generateSitemap() {
    console.log('Generating sitemap...');
    const today = formatDate(new Date());
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Process Static HTML Files
    const files = fs.readdirSync(__dirname);
    const htmlFiles = files.filter(f => f.endsWith('.html') && !excludeFiles.includes(f));

    htmlFiles.forEach(file => {
        let priority = filePriorities[file] || 0.5;
        let urlPath = file === 'index.html' ? '' : file;
        
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/${urlPath}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
        xml += `  </url>\n`;
    });

    console.log(`Added ${htmlFiles.length} static pages.`);

    // 2. Process Dynamic Products
    try {
        console.log('Fetching live products from API...');
        const products = await fetchProducts();
        
        products.forEach(p => {
            const name = p.item_name || p.name || '';
            if (!name) return;
            
            // Slug generation logic matching products-api.js
            const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
            const productUrl = `${DOMAIN}/product/${slug}.html`;
            
            xml += `  <url>\n`;
            xml += `    <loc>${productUrl}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        });
        
        console.log(`Added ${products.length} dynamic product pages.`);
    } catch (err) {
        console.error('Error fetching products:', err);
    }

    xml += `</urlset>\n`;

    // 3. Write to sitemap.xml
    fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml);
    console.log('Successfully generated sitemap.xml!');
}

generateSitemap();
