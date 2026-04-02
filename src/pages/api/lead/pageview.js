const { ensureAllowedRequest } = require('../../../server/request-guard');
const { upsertPageview } = require('../../../server/pageviews-store');
const { upsertLead } = require('../../../server/lead-store');
const { insertLeadEvent } = require('../../../server/lead-events-store');
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
    } catch (_error) {
        res.status(400).json({ ok: false, error: 'JSON invalido.' });
        return;
    }

    const pageviewPayload = {
        event: 'page_view',
        stage: body.page || '',
        page: body.page || '',
        sessionId: body.sessionId || body.session_id || '',
        sourceUrl: body.sourceUrl || '',
        utm: body.utm || {},
        personal: body.personal || {},
        address: body.address || {},
        extra: body.extra || {},
        shipping: body.shipping || {},
        amount: body.amount,
        eventId: body.eventId || '',
        fbclid: body.fbclid || '',
        fbp: body.fbp || '',
        fbc: body.fbc || '',
        metadata: {
            received_at: new Date().toISOString(),
            user_agent: req.headers['user-agent'] || '',
            referrer: req.headers['referer'] || '',
            fbp: body.fbp || '',
            fbc: body.fbc || ''
        }
    };

    const result = await upsertPageview(pageviewPayload.sessionId, pageviewPayload.page);
    if (!result.ok && result.reason === 'missing_supabase_config') {
        res.status(202).json({ ok: false, reason: result.reason });
        return;
    }
    if (!result.ok) {
        res.status(502).json({ ok: false, reason: result.reason, detail: result.detail || '' });
        return;
    }

    const leadResult = await upsertLead(pageviewPayload, req);
    if (!leadResult.ok && leadResult.reason !== 'missing_supabase_config') {
        res.status(502).json({ ok: false, reason: leadResult.reason, detail: leadResult.detail || '' });
        return;
    }

    const eventResult = await insertLeadEvent(pageviewPayload, req);
    if (!eventResult.ok && eventResult.reason !== 'missing_supabase_config') {
        res.status(207).json({ ok: true, warning: 'lead_event_log_failed', detail: eventResult.detail || '' });
        return;
    }

    await sendMetaCapi('page_view', pageviewPayload, req).catch(() => null);

    res.status(200).json({ ok: true });
}

