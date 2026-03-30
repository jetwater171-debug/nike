const { ensureAllowedRequest } = require('../../../server/request-guard');
const { getSettings } = require('../../../server/settings-store');

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    if (!ensureAllowedRequest(req, res, { requireSession: false })) {
        return;
    }

    const settings = await getSettings();
    const pixel = settings.pixel || {};
    const tiktokPixel = settings.tiktokPixel || {};
    const features = settings.features || {};

    res.status(200).json({
        pixel: {
            enabled: !!pixel.enabled,
            id: pixel.id || '',
            events: pixel.events || {}
        },
        tiktokPixel: {
            enabled: !!tiktokPixel.enabled,
            id: tiktokPixel.id || '',
            events: tiktokPixel.events || {}
        },
        features
    });
}

