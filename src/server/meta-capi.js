const crypto = require('crypto');

const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { getSettings } = require('./settings-store');
const { getLeadBySessionId, getLeadByPixTxid } = require('./lead-store');

const DEFAULT_API_VERSION = 'v20.0';
const RECENT_EVENT_TTL_MS = 10 * 60 * 1000;
const RECENT_META_EVENTS = globalThis.__nikeMetaCapiRecentEvents || new Map();
if (!globalThis.__nikeMetaCapiRecentEvents) {
    globalThis.__nikeMetaCapiRecentEvents = RECENT_META_EVENTS;
}

function asObject(input) {
    return input && typeof input === 'object' && !Array.isArray(input) ? input : {};
}

function pickText(...values) {
    for (const value of values) {
        const text = String(value || '').trim();
        if (text) return text;
    }
    return '';
}

function sanitizeDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

function hashValue(value) {
    const normalized = normalizeText(value);
    if (!normalized) return '';
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

function toUnixTimeSeconds(value) {
    const date = value ? new Date(value) : new Date();
    const time = Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
    return Math.floor(time / 1000);
}

function pruneObject(input = {}) {
    const output = {};
    Object.entries(input).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        output[key] = value;
    });
    return output;
}

function cleanupRecentEvents() {
    const now = Date.now();
    for (const [key, expiresAt] of RECENT_META_EVENTS.entries()) {
        if (!expiresAt || expiresAt <= now) {
            RECENT_META_EVENTS.delete(key);
        }
    }
}

function wasRecentlySent(eventId) {
    const key = String(eventId || '').trim();
    if (!key) return false;
    cleanupRecentEvents();
    return Number(RECENT_META_EVENTS.get(key) || 0) > Date.now();
}

function markRecentlySent(eventId) {
    const key = String(eventId || '').trim();
    if (!key) return;
    cleanupRecentEvents();
    RECENT_META_EVENTS.set(key, Date.now() + RECENT_EVENT_TTL_MS);
}

function splitName(fullName) {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return { firstName: '', lastName: '' };
    }
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || parts[0] || ''
    };
}

function normalizePhone(value) {
    const digits = sanitizeDigits(value);
    if (!digits) return '';
    if (digits.startsWith('55') && digits.length >= 12) {
        return digits;
    }
    if (digits.length >= 10) {
        return `55${digits}`;
    }
    return digits;
}

function buildDeterministicEventId(prefix, sessionId = '') {
    const cleanPrefix = String(prefix || 'event')
        .replace(/[^a-zA-Z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'event';
    const suffix = String(sessionId || '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(-16)
        .toLowerCase() || 'lead';
    return `${cleanPrefix}_${suffix}`;
}

function resolveMetaEventName(eventName) {
    const name = String(eventName || '').trim().toLowerCase();
    if (!name) return '';
    if (name === 'page_view') return 'PageView';
    if (name === 'lead_submit') return 'Lead';
    if (name === 'nike_add_to_cart') return 'AddToCart';
    if (name === 'checkout_view') return 'InitiateCheckout';
    if (name === 'payment_view') return 'AddPaymentInfo';
    if (name === 'pix_paid' || name === 'pix_confirmed' || name === 'purchase') return 'Purchase';
    return '';
}

function isMetaEventEnabled(eventName, pixel = {}) {
    const events = asObject(pixel.events);
    const name = String(eventName || '').trim().toLowerCase();
    if (!name) return false;
    if (name === 'page_view') return events.page_view !== false;
    if (name === 'lead_submit') return events.lead !== false;
    if (name === 'nike_add_to_cart') return events.add_to_cart !== false;
    if (name === 'checkout_view') return events.checkout !== false;
    if (name === 'payment_view') return events.checkout !== false && events.add_payment_info !== false;
    if (name === 'pix_paid' || name === 'pix_confirmed' || name === 'purchase') return events.purchase !== false;
    return false;
}

function mergePayload(baseInput = {}, incomingInput = {}) {
    const base = asObject(baseInput);
    const incoming = asObject(incomingInput);
    const merged = {
        ...base,
        ...incoming
    };

    ['utm', 'personal', 'address', 'extra', 'shipping', 'reward', 'bump', 'pix', 'metadata'].forEach((key) => {
        const next = {
            ...asObject(base[key]),
            ...asObject(incoming[key])
        };
        if (Object.keys(next).length > 0) {
            merged[key] = next;
        }
    });

    return merged;
}

async function enrichPayload(input = {}) {
    const sessionId = pickText(input.sessionId, input.session_id);
    const txid = pickText(input.pixTxid, input.pix?.idTransaction, input.pix?.txid);
    let enriched = mergePayload({}, input);

    if (sessionId) {
        const existingBySession = await getLeadBySessionId(sessionId).catch(() => ({ ok: false, data: null }));
        if (existingBySession?.ok && existingBySession.data) {
            enriched = mergePayload(existingBySession.data.payload, enriched);
        }
    }

    if (txid) {
        const existingByTxid = await getLeadByPixTxid(txid).catch(() => ({ ok: false, data: null }));
        if (existingByTxid?.ok && existingByTxid.data) {
            enriched = mergePayload(existingByTxid.data.payload, enriched);
        }
    }

    return enriched;
}

function buildUserData(payload = {}, req = null) {
    const personal = asObject(payload.personal);
    const address = asObject(payload.address);
    const metadata = asObject(payload.metadata);
    const { firstName, lastName } = splitName(personal.name);
    const cpf = sanitizeDigits(personal.cpf);
    const sessionId = pickText(payload.sessionId, payload.session_id);
    const externalId = cpf || sessionId || personal.email || personal.phone;
    const forwardedFor = req?.headers?.['x-forwarded-for'];
    const clientIp = typeof forwardedFor === 'string' && forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : pickText(metadata.client_ip, req?.socket?.remoteAddress);
    const clientUserAgent = pickText(req?.headers?.['user-agent'], metadata.user_agent);
    const userData = pruneObject({
        em: hashValue(personal.email),
        ph: hashValue(normalizePhone(personal.phoneDigits || personal.phone)),
        fn: hashValue(firstName),
        ln: hashValue(lastName),
        ct: hashValue(address.city),
        st: hashValue(address.state),
        zp: hashValue(sanitizeDigits(address.cep)),
        country: hashValue('br'),
        external_id: hashValue(externalId),
        client_ip_address: clientIp,
        client_user_agent: clientUserAgent,
        fbp: pickText(payload.fbp, metadata.fbp),
        fbc: pickText(payload.fbc, metadata.fbc)
    });
    return userData;
}

function buildCustomData(metaEventName, payload = {}) {
    const amount = Number(payload.amount || payload.pixAmount || payload.pix?.amount || 0);
    const shipping = asObject(payload.shipping);
    const extra = asObject(payload.extra);
    const customData = pruneObject({
        currency: amount > 0 ? 'BRL' : undefined,
        value: Number.isFinite(amount) && amount > 0 ? Number(amount.toFixed(2)) : undefined,
        content_name: pickText(extra.productTitle, payload.productTitle, payload.page, payload.stage),
        content_category: 'nike_promo',
        order_id: pickText(payload.orderId, payload.pixTxid, payload.pix?.idTransaction, payload.pix?.txid),
        delivery_category: pickText(shipping.name),
        search_string: metaEventName === 'PageView' ? pickText(payload.page, payload.stage) : ''
    });
    return customData;
}

function resolveMetaEventId(eventName, payload = {}, metaEventName = '') {
    const explicitEventId = pickText(
        payload.eventId,
        payload.addPaymentInfoEventId,
        payload.purchaseEventId
    );
    if (explicitEventId) return explicitEventId;

    const sessionId = pickText(payload.sessionId, payload.session_id);
    if (!sessionId) return '';

    if (metaEventName === 'PageView') {
        return buildDeterministicEventId(`page_${pickText(payload.page, payload.stage, 'page')}`, sessionId);
    }
    if (metaEventName === 'Purchase') {
        return buildDeterministicEventId('pix_paid', sessionId);
    }
    if (metaEventName === 'AddPaymentInfo') {
        return buildDeterministicEventId('payment_view', sessionId);
    }
    if (metaEventName === 'InitiateCheckout') {
        return buildDeterministicEventId('checkout_view', sessionId);
    }
    if (metaEventName === 'Lead') {
        return buildDeterministicEventId('lead_submit', sessionId);
    }
    if (metaEventName === 'AddToCart') {
        return buildDeterministicEventId('nike_add_to_cart', sessionId);
    }
    return buildDeterministicEventId(eventName, sessionId);
}

async function sendMetaCapi(eventName, input = {}, req = null, options = {}) {
    const mappedEvent = resolveMetaEventName(eventName);
    if (!mappedEvent) {
        return { ok: false, reason: 'unmapped_event' };
    }

    const settings = await getSettings().catch(() => null);
    const pixel = settings?.pixel || {};
    const capi = pixel?.capi || {};
    const pixelId = pickText(pixel.id);
    const accessToken = pickText(capi.accessToken);
    if (!pixel?.enabled || !pixelId || !capi?.enabled || !accessToken || !isMetaEventEnabled(eventName, pixel)) {
        return { ok: false, reason: 'disabled' };
    }

    const payload = await enrichPayload(input);
    const eventId = resolveMetaEventId(eventName, payload, mappedEvent);
    if (!eventId) {
        return { ok: false, reason: 'missing_event_id' };
    }
    if (wasRecentlySent(eventId)) {
        return { ok: true, deduped: true, reason: 'recent_event' };
    }

    const userData = buildUserData(payload, req);
    const customData = buildCustomData(mappedEvent, payload);
    const apiVersion = pickText(capi.apiVersion) || DEFAULT_API_VERSION;
    const endpoint = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
    const body = pruneObject({
        data: [
            pruneObject({
                event_name: mappedEvent,
                event_time: toUnixTimeSeconds(payload.createdAt || payload.pixCreatedAt || payload.metadata?.received_at || Date.now()),
                event_id: eventId,
                action_source: 'website',
                event_source_url: pickText(payload.sourceUrl),
                user_data: userData,
                custom_data: customData
            })
        ],
        test_event_code: pickText(options.testEventCode, capi.testEventCode)
    });

    const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        return {
            ok: false,
            reason: 'meta_capi_error',
            status: response.status,
            detail: data
        };
    }

    markRecentlySent(eventId);
    return {
        ok: true,
        eventId,
        response: data
    };
}

module.exports = {
    sendMetaCapi,
    buildDeterministicEventId
};
