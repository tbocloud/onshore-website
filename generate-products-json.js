const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_URL = 'https://onshore.tbo365.cloud/api/method/onshore.api.get_item_details?limit_start=0&limit_page_length=5000';
const API_TOKEN = 'token9897e6ee3838b6c:06d7193075244d6';
const DATA_DIR = path.join(__dirname, 'assets', 'data');
const IMG_DIR = path.join(__dirname, 'assets', 'img', 'products');
const BASE_URL = 'https://onshore.tbo365.cloud';

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
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

// Download image helper function
function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(destPath)) {
            resolve(destPath); // Already downloaded
            return;
        }
        
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve(destPath));
                });
            } else {
                fs.unlink(destPath, () => {}); // Delete the file async
                reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(destPath, () => {}); // Delete the file async
            reject(err);
        });
    });
}

console.log("Fetching latest product catalog from Frappe API...");

const options = {
    method: 'GET',
    headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
    }
};

const req = https.request(API_URL, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', async () => {
        try {
            const json = JSON.parse(data);
            const products = json.message || [];
            console.log(`Found ${products.length} products. Processing images...`);

            let downloadedCount = 0;

            for (let i = 0; i < products.length; i++) {
                let p = products[i];
                let name = p.item_name || p.name;
                let slug = toSlug(name);
                
                // Determine image source
                let imgSource = p.website_image || p.image || p.thumbnail;
                if (!imgSource && p.slides && p.slides.length > 0) {
                    imgSource = p.slides[0].image;
                }

                if (imgSource) {
                    let fullUrl = imgSource.startsWith('http') ? imgSource : `${BASE_URL}${imgSource}`;
                    
                    // Create local file path based on slug and extension
                    let ext = path.extname(fullUrl.split('?')[0]) || '.jpg';
                    let localFileName = `${slug}${ext}`;
                    let localFilePath = path.join(IMG_DIR, localFileName);
                    
                    try {
                        await downloadImage(fullUrl, localFilePath);
                        // Rewrite image property in the JSON array to point to local folder
                        p.image = `/assets/img/products/${localFileName}`;
                        downloadedCount++;
                    } catch(e) {
                        console.error(`Error downloading image for ${name}: ${e.message}`);
                        // Default to logo if download fails
                        p.image = '/assets/img/logo.png';
                    }
                } else {
                    p.image = '/assets/img/logo.png';
                }

                // Strip out large unneeded nested data to keep JSON lightweight
                if (p.slides) delete p.slides;
                if (p.taxes) delete p.taxes;
            }

            console.log(`Successfully verified/downloaded ${downloadedCount} product images locally.`);

            // Write the JSON array to disk
            const outputPath = path.join(DATA_DIR, 'products.json');
            fs.writeFileSync(outputPath, JSON.stringify(products));
            console.log(`✅ Saved all static product data to ${outputPath}`);
            
            // Output version string for smart cache invalidation
            const versionPath = path.join(DATA_DIR, 'version.txt');
            const versionString = Date.now().toString();
            fs.writeFileSync(versionPath, versionString);
            console.log(`✅ Saved catalog version ${versionString} to ${versionPath}`);
            
        } catch (e) {
            console.error("Error parsing API response:", e);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error("API Request error:", e);
    process.exit(1);
});

req.end();
