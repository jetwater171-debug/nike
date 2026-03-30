const fs = require('fs');

const srcPaths = ['camisa-brasil-jordan-ii-2026-27-jogador-masculina-097619.html'];
let srcHtmlPath = null;
for (const p of srcPaths) {
  if (fs.existsSync(p)) {
    srcHtmlPath = p;
    break;
  }
}

if (!srcHtmlPath) {
  console.error("Original HTML not found.");
  process.exit(1);
}

let html = fs.readFileSync(srcHtmlPath, 'utf8');

// 1. NEUTER NAVIGATION LINKS ONLY (to prevent leaving the page)
// Any absolute link to nike.com.br
html = html.replace(/href=["']https?:\/\/(www\.)?nike\.com\.br[^"']*["']/gi, 'href="javascript:void(0)"');

// Relative nav links (like /masculino, /jordan) that don't look like assets
html = html.replace(/<a\b([^>]*)href=["']([^"']*)["']([^>]*)>/gi, (match, before, url, after) => {
    if (url.startsWith('http://nike.com.br') || url.startsWith('https://nike.com.br') || url.startsWith('https://www.nike.com.br')) {
        return `<a ${before}href="javascript:void(0)"${after}>`;
    }
    if (url.startsWith('/') && !url.includes('.') && !url.startsWith('/_next') && !url.startsWith('/api')) {
        return `<a ${before}href="javascript:void(0)"${after}>`;
    }
    return match;
});

// 2. STOP REDIRECTS IN SCRIPT
html = html.replace(/window\.location\.href\s*=\s*['"][^'"]*nike\.com\.br[^'"]*['"]/gi, 'window.location.href="javascript:void(0)"');
html = html.replace(/window\.location\.assign\(['"][^'"]*nike\.com\.br[^'"]*['"]\)/gi, 'window.location.assign("javascript:void(0)")');

// 3. REMOVE SURVEILLANCE / TRACKING / ANALYTICS
// This is what would actually expose you to Nike:
html = html.replace(/<script[^>]*src=["'][^"']*(datadoghq|googletagmanager|mparticle|sentry|adopt)[^"']*["'][^>]*>.*?<\/script>/gi, '');
html = html.replace(/<script[^>]*id=["'](?:gtm|mparticle|datadog)[^>]*>.*?<\/script>/gi, '');

// DO NOT TOUCH `srcset`, DO NOT REPLACE `static.nike.com.br` or `imgnike-a.akamaihd.net`
// This ensures that all JS chunks, CSS, and dynamic images load strictly from Nike's live caching servers, making the personalize button work perfectly!

fs.writeFileSync('public/nike-base.html', html, 'utf8');
console.log('Fixed functionality! Preserved live CDN links and removed ONLY telemetry and outbound links.');
