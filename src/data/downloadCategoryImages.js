import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFilePath = path.join(__dirname, 'category_images.json');
const outputDir = path.join(__dirname, 'categoryImges');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    const categories = JSON.parse(data);

    categories.forEach(categoryInfo => {
        const imageUrl = categoryInfo.imageUrl;
        const categoryName = categoryInfo.category;

        // Determine the file extension
        let extension = '.jpg'; // Default extension
        try {
            const urlPath = new URL(imageUrl).pathname;
            const ext = path.extname(urlPath);
            // A simple check to avoid extensions like ".com" from the domain
            if (ext && ext.length > 1 && ext.length < 6) {
                extension = ext;
            }
        } catch (e) {
            console.warn(`Could not parse URL or find extension for ${imageUrl}, using default .jpg`);
        }
        
        const fileName = `${categoryName}${extension}`;
        const filePath = path.join(outputDir, fileName);
        const file = fs.createWriteStream(filePath);

        const download = (url) => {
            https.get(url, (response) => {
                // Handle redirects
                if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
                    download(response.headers.location);
                    return;
                }

                // Handle client and server errors
                if (response.statusCode >= 400) {
                    console.error(`Error downloading ${url}: Status code ${response.statusCode}`);
                    fs.unlink(filePath, () => {}); // Clean up empty file
                    return;
                }

                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        console.log(`Downloaded and renamed ${fileName}`);
                    });
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => {}); // Delete the file on error
                console.error(`Error downloading ${url}: ${err.message}`);
            });
        }

        download(imageUrl);
    });
});