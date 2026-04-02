const { upsertLead } = require('../../../server/lead-store');
const { insertLeadEvent } = require('../../../server/lead-events-store');
const { ensureAllowedRequest } = require('../../../server/request-guard');
const { sendMetaCapi } = require('../../../server/meta-capi');

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    if (!ensureAllowedRequest(req, res, { requireSession: true })) {
        return;
    }

    let body = {};
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch (error) {
        res.status(400).json({ ok: false, error: 'Invalid JSON body' });
        return;
    }

    try {
        const forwarded = req.headers['x-forwarded-for'];
        const clientIp = typeof forwarded === 'string' && forwarded
            ? forwarded.split(',')[0].trim()
            : req.socket?.remoteAddress || '';

        const fullPayload = {
            event: body.event || 'lead_event',
            stage: body.stage || '',
            page: body.page || '',
            sessionId: body.sessionId || body.session_id || '',
            sourceUrl: body.sourceUrl || '',
            utm: body.utm || {},
            personal: body.personal || {},
            address: body.address || {},
            extra: body.extra || {},
            shipping: body.shipping || {},
            reward: body.reward || {},
            bump: body.bump || {},
            pix: body.pix || {},
            amount: body.amount,
            eventId: body.eventId || '',
            fbp: body.fbp || '',
            fbc: body.fbc || '',
            fbclid: body.fbclid || '',
            metadata: {
                received_at: new Date().toISOString(),
                user_agent: req.headers['user-agent'] || '',
                referrer: req.headers['referer'] || '',
                client_ip: clientIp,
                fbp: body.fbp || '',
                fbc: body.fbc || ''
            },
            raw: body
        };

        const result = await upsertLead(fullPayload, req);

        if (!result.ok && result.reason === 'missing_supabase_config') {
            res.status(202).json({ ok: false, reason: result.reason });
            return;
        }

        if (!result.ok) {
            res.status(502).json({ ok: false, reason: result.reason, detail: result.detail || '' });
            return;
        }

        const eventResult = await insertLeadEvent(fullPayload, req);
        if (!eventResult.ok && eventResult.reason !== 'missing_supabase_config') {
            res.status(207).json({ ok: true, warning: 'lead_event_log_failed', detail: eventResult.detail || '' });
            return;
        }

        await sendMetaCapi(fullPayload.event, fullPayload, req).catch(() => null);

        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message || String(error) });
    }
}

