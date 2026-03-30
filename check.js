const fs = require('fs');
const html = fs.readFileSync('public/nike-base.html', 'utf8');
const imgs = html.match(/<img[^>]*>/g) || [];

const output = imgs.slice(0, 15).map(img => {
    const srcMatch = img.match(/src=["']([^"']+)["']/);
    const srcsetMatch = img.match(/srcSet=["']([^"']+)["']/i) || img.match(/srcset=["']([^"']+)["']/i);
    return {
        src: srcMatch ? srcMatch[1] : 'none',
        srcset: srcsetMatch ? srcsetMatch[1].substring(0, 60) + '...' : 'none'
    };
});

fs.writeFileSync('imgs.json', JSON.stringify(output, null, 2));

const links = html.match(/<link[^>]+(?:as=["']image["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*as=["']image["']|imagesrcset=["']([^"']+)["'])/gi) || [];
fs.writeFileSync('links_preload.json', JSON.stringify(links.slice(0, 5), null, 2));

