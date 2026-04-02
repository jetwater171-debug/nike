"use client";

type PixelEvents = {
  page_view?: boolean;
  quiz_view?: boolean;
  lead?: boolean;
  purchase?: boolean;
  checkout?: boolean;
  add_to_cart?: boolean;
  add_payment_info?: boolean;
};

type BrowserPixelConfig = {
  enabled?: boolean;
  id?: string;
  events?: PixelEvents;
};

type SiteConfig = {
  pixel?: BrowserPixelConfig;
  tiktokPixel?: BrowserPixelConfig;
  features?: Record<string, unknown>;
};

type LeadDraft = {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

type LeadTrackPayload = {
  event: string;
  stage?: string;
  page?: string;
  amount?: number;
  personal?: Record<string, unknown>;
  address?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  shipping?: Record<string, unknown>;
  reward?: Record<string, unknown>;
  bump?: Record<string, unknown>;
  pix?: Record<string, unknown>;
  sourceUrl?: string;
  eventId?: string;
};

const STORAGE_KEYS = {
  leadSession: "nikepromo.leadSession",
  utm: "nikepromo.utm",
  siteConfig: "nikepromo.siteConfig",
  leadDraft: "nikepromo.leadDraft",
  pageviews: "nikepromo.pageviews",
  pixelEvents: "nikepromo.pixelEvents",
} as const;

const state: {
  sessionPromise: Promise<void> | null;
  siteConfigPromise: Promise<SiteConfig | null> | null;
  siteConfig: SiteConfig | null;
} = {
  sessionPromise: null,
  siteConfigPromise: null,
  siteConfig: null,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore restricted environments.
  }
}

function readSessionStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeSessionStorage(key: string, value: unknown) {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore restricted environments.
  }
}

function generateSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeDigits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

function buildEventId(prefix: string, sessionId: string) {
  const suffix = String(sessionId || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-16)
    .toLowerCase();
  return `${prefix}_${suffix || "lead"}`;
}

export function getLeadSessionId() {
  if (!isBrowser()) return "";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEYS.leadSession);
    if (existing) return existing;
    const created = generateSessionId();
    window.localStorage.setItem(STORAGE_KEYS.leadSession, created);
    return created;
  } catch {
    return generateSessionId();
  }
}

export function saveLeadDraft(draft: LeadDraft) {
  const current = readStorage<LeadDraft>(STORAGE_KEYS.leadDraft, {});
  writeStorage(STORAGE_KEYS.leadDraft, { ...current, ...draft });
}

export function readLeadDraft() {
  return readStorage<LeadDraft>(STORAGE_KEYS.leadDraft, {});
}

export function captureUtmParams() {
  if (!isBrowser()) return {};

  const params = new URLSearchParams(window.location.search || "");
  const existing = readStorage<Record<string, string>>(STORAGE_KEYS.utm, {});
  const next = { ...existing };

  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
    "ttclid",
    "src",
    "sck",
  ].forEach((key) => {
    const value = params.get(key);
    if (value) {
      next[key] = value;
    }
  });

  if (Object.keys(next).length > 0) {
    writeStorage(STORAGE_KEYS.utm, next);
  }

  return next;
}

export function readUtmParams() {
  return readStorage<Record<string, string>>(STORAGE_KEYS.utm, {});
}

export async function ensureApiSession() {
  if (!isBrowser()) return;
  if (state.sessionPromise) return state.sessionPromise;

  state.sessionPromise = fetch("/api/site/session", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
  })
    .catch(() => null)
    .then(() => undefined)
    .finally(() => {
      state.sessionPromise = null;
    });

  return state.sessionPromise;
}

async function fetchSiteConfig(force = false) {
  if (!isBrowser()) return null;
  if (!force && state.siteConfig) return state.siteConfig;
  if (!force && state.siteConfigPromise) return state.siteConfigPromise;

  state.siteConfigPromise = fetch("/api/site/config", {
    cache: "no-store",
    credentials: "same-origin",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("site_config_failed");
      }

      const data = (await response.json()) as SiteConfig;
      state.siteConfig = data;
      writeStorage(STORAGE_KEYS.siteConfig, data);
      return data;
    })
    .catch(() => {
      const cached = readStorage<SiteConfig | null>(STORAGE_KEYS.siteConfig, null);
      state.siteConfig = cached;
      return cached;
    })
    .finally(() => {
      state.siteConfigPromise = null;
    });

  return state.siteConfigPromise;
}

function getSourcePlatform() {
  const utm = readUtmParams();
  const source = String(utm.utm_source || utm.src || "").toLowerCase();
  if (utm.ttclid || source.includes("tiktok")) return "tiktok";
  if (utm.fbclid || source.includes("facebook") || source.includes("instagram") || source.includes("meta")) {
    return "meta";
  }
  return "";
}

function getPixelEventCache() {
  return readSessionStorage<Record<string, true>>(STORAGE_KEYS.pixelEvents, {});
}

function markPixelEventSent(key: string) {
  const cache = getPixelEventCache();
  cache[key] = true;
  writeSessionStorage(STORAGE_KEYS.pixelEvents, cache);
}

function wasPixelEventSent(key: string) {
  return Boolean(getPixelEventCache()[key]);
}

function loadFacebookPixel(pixelId: string) {
  if (!isBrowser()) return;
  const id = String(pixelId || "").trim();
  if (!id) return;

  const win = window as typeof window & {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __nikeFbPixelInits?: Record<string, true>;
  };

  if (!win.__nikeFbPixelInits) {
    win.__nikeFbPixelInits = {};
  }
  if (win.__nikeFbPixelInits[id]) return;

  if (!win.fbq) {
    // Based on the standard Meta browser pixel loader.
    ((f: Window & typeof globalThis, b: Document, v: string) => {
      if ((f as typeof f & { fbq?: unknown }).fbq) return;
      const fbqFn: {
        (...args: unknown[]): void;
        callMethod?: (...input: unknown[]) => void;
        push?: (args: unknown[]) => number;
        loaded?: boolean;
        version?: string;
        queue?: unknown[][];
      } = function (...args: unknown[]) {
        if (fbqFn.callMethod) {
          fbqFn.callMethod(...args);
        } else {
          (fbqFn.queue ||= []).push(args);
        }
      };

      (f as typeof f & { fbq?: typeof fbqFn }).fbq = fbqFn;
      if (!(f as typeof f & { _fbq?: typeof fbqFn })._fbq) {
        (f as typeof f & { _fbq?: typeof fbqFn })._fbq = fbqFn;
      }
      fbqFn.push = (args: unknown[]) => (fbqFn.queue ||= []).push(args);
      fbqFn.loaded = true;
      fbqFn.version = "2.0";
      fbqFn.queue = [];

      const script = b.createElement("script");
      script.async = true;
      script.src = v;
      const first = b.getElementsByTagName("script")[0];
      first?.parentNode?.insertBefore(script, first);
    })(window, document, "https://connect.facebook.net/en_US/fbevents.js");
  }

  try {
    win.fbq?.("set", "autoConfig", false, id);
    win.fbq?.("init", id);
    win.__nikeFbPixelInits[id] = true;
  } catch {
    // Ignore transient browser pixel errors.
  }
}

function trackFacebookEvent(
  pixelId: string,
  eventName: string,
  payload?: Record<string, unknown>,
  eventId?: string,
) {
  if (!isBrowser()) return;
  loadFacebookPixel(pixelId);

  const win = window as typeof window & {
    fbq?: (...args: unknown[]) => void;
  };

  try {
    if (eventId) {
      win.fbq?.("trackSingle", pixelId, eventName, payload || {}, { eventID: eventId });
      return;
    }

    win.fbq?.("trackSingle", pixelId, eventName, payload || {});
  } catch {
    // Ignore browser pixel failures.
  }
}

function loadTikTokPixel(pixelId: string) {
  if (!isBrowser()) return;
  const id = String(pixelId || "").trim();
  if (!id) return;

  const win = window as typeof window & {
    ttq?: {
      _i?: Record<string, unknown[]>;
      _o?: Record<string, unknown>;
      _t?: Record<string, number>;
      instance?: (code: string) => { page?: () => void; track?: (event: string, payload?: Record<string, unknown>) => void };
      load?: (code: string, options?: Record<string, unknown>) => void;
      page?: () => void;
      track?: (event: string, payload?: Record<string, unknown>) => void;
      methods?: string[];
      setAndDefer?: (obj: Record<string, unknown>, method: string) => void;
    };
    __nikeTikTokPixelInits?: Record<string, true>;
  };

  if (!win.__nikeTikTokPixelInits) {
    win.__nikeTikTokPixelInits = {};
  }
  if (win.__nikeTikTokPixelInits[id]) return;

  if (!win.ttq) {
    const ttq: any = {
      _i: {},
      _o: {},
      _t: {},
      methods: [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ],
      setAndDefer(target: Record<string, unknown>, method: string) {
        const queue: unknown[][] = [];
        const deferred = Object.assign(
          (...args: unknown[]) => {
            queue.push(args);
          },
          {
            push(args: unknown[]) {
              return queue.push(args);
            },
            queue,
          },
        );
        target[method] = deferred;
      },
      instance(code: string) {
        return (ttq._i?.[code] || []) as {
          page?: () => void;
          track?: (event: string, payload?: Record<string, unknown>) => void;
        };
      },
      load(code: string, options?: Record<string, unknown>) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${code}&lib=ttq`;
        const first = document.getElementsByTagName("script")[0];
        first?.parentNode?.insertBefore(script, first);
        ttq._i![code] = [];
        ttq._o![code] = options || {};
        ttq._t![code] = Date.now();
      },
      page() {},
      track() {},
    };

    ttq.methods?.forEach((method: string) => {
      ttq.setAndDefer?.(ttq as unknown as Record<string, unknown>, method);
    });

    win.ttq = ttq;
  }

  try {
    win.ttq?.load?.(id, {});
    win.__nikeTikTokPixelInits[id] = true;
  } catch {
    // Ignore browser pixel failures.
  }
}

function trackTikTokEvent(
  pixelId: string,
  eventName: string,
  payload?: Record<string, unknown>,
  eventId?: string,
) {
  if (!isBrowser()) return;
  loadTikTokPixel(pixelId);

  const win = window as typeof window & {
    ttq?: {
      instance?: (code: string) => { page?: () => void; track?: (event: string, payload?: Record<string, unknown>) => void };
    };
  };

  try {
    const tracker = win.ttq?.instance?.(pixelId);
    const finalPayload = eventId ? { ...(payload || {}), event_id: eventId } : payload || {};
    tracker?.track?.(eventName, finalPayload);
  } catch {
    // Ignore browser pixel failures.
  }
}

async function firePagePixels(page: string) {
  const siteConfig = await fetchSiteConfig();
  const platform = getSourcePlatform();
  const sessionId = getLeadSessionId();
  const pageEventId = buildEventId(`page_${page}`, sessionId);
  const pagePayload = {
    content_name: page,
    content_category: "nike_promo",
  };

  const meta = siteConfig?.pixel;
  if (meta?.enabled && meta.id && meta.events?.page_view !== false) {
    trackFacebookEvent(meta.id, "PageView", pagePayload, pageEventId);
  }

  const tiktok = siteConfig?.tiktokPixel;
  if (tiktok?.enabled && tiktok.id && tiktok.events?.page_view !== false) {
    if (platform !== "meta") {
      trackTikTokEvent(tiktok.id, "PageView", pagePayload, pageEventId);
    }
  }
}

function fireLeadPixels(eventName: string, payload: LeadTrackPayload, siteConfig: SiteConfig | null) {
  const sessionId = getLeadSessionId();
  const sourcePlatform = getSourcePlatform();
  const eventId =
    String(payload.eventId || "").trim() ||
    buildEventId(eventName, sessionId);

  const meta = siteConfig?.pixel;
  const tiktok = siteConfig?.tiktokPixel;

  const fireMeta = (name: string, body: Record<string, unknown>) => {
    if (!meta?.enabled || !meta.id) return;
    if (sourcePlatform === "tiktok") return;
    trackFacebookEvent(meta.id, name, body, eventId);
  };

  const fireTikTok = (name: string, body: Record<string, unknown>) => {
    if (!tiktok?.enabled || !tiktok.id) return;
    if (sourcePlatform === "meta") return;
    trackTikTokEvent(tiktok.id, name, body, eventId);
  };

  if (eventName === "lead_submit") {
    if (meta?.events?.lead !== false) {
      fireMeta("Lead", {
        content_name: "dados",
        content_category: "nike_promo",
      });
    }
    if (tiktok?.events?.lead !== false) {
      fireTikTok("SubmitForm", {
        content_name: "dados",
        content_category: "nike_promo",
      });
    }
  }

  if (eventName === "checkout_view") {
    if (meta?.events?.checkout !== false) {
      fireMeta("InitiateCheckout", {
        value: Number(payload.amount || 0) || undefined,
        currency: "BRL",
        content_name: payload.page || "checkout",
      });
    }
    if (tiktok?.events?.checkout !== false) {
      fireTikTok("InitiateCheckout", {
        value: Number(payload.amount || 0) || undefined,
        currency: "BRL",
        content_name: payload.page || "checkout",
      });
    }
  }

  if (eventName === "payment_view") {
    const paymentPayload = {
      value: Number(payload.amount || 0) || undefined,
      currency: "BRL",
      content_name: payload.page || "pagamento",
    };

    if (
      meta?.enabled &&
      meta.id &&
      meta.events?.add_payment_info !== false &&
      meta.events?.checkout !== false
    ) {
      fireMeta("AddPaymentInfo", paymentPayload);
    }

    if (
      tiktok?.enabled &&
      tiktok.id &&
      tiktok.events?.add_payment_info !== false &&
      tiktok.events?.checkout !== false
    ) {
      fireTikTok("AddPaymentInfo", paymentPayload);
    }
  }

  if (eventName === "pix_paid") {
    if (meta?.events?.purchase !== false) {
      fireMeta("Purchase", {
        value: Number(payload.amount || 0) || undefined,
        currency: "BRL",
        content_name: payload.page || "pix",
      });
    }
    if (tiktok?.events?.purchase !== false) {
      fireTikTok("Purchase", {
        value: Number(payload.amount || 0) || undefined,
        currency: "BRL",
        content_name: payload.page || "pix",
      });
    }
  }
}

export async function trackPageView(page: string) {
  if (!isBrowser() || !page) return;

  const seen = readSessionStorage<Record<string, true>>(STORAGE_KEYS.pageviews, {});
  if (seen[page]) {
    return;
  }

  await ensureApiSession();

  const sessionId = getLeadSessionId();
  const body = {
    sessionId,
    page,
    stage: page,
    sourceUrl: window.location.href,
    utm: readUtmParams(),
  };

  try {
    await fetch("/api/lead/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Ignore tracking transport failures.
  }

  seen[page] = true;
  writeSessionStorage(STORAGE_KEYS.pageviews, seen);

  const pixelKey = `pageview:${page}`;
  if (!wasPixelEventSent(pixelKey)) {
    await firePagePixels(page);
    markPixelEventSent(pixelKey);
  }
}

export async function trackLeadEvent(payload: LeadTrackPayload) {
  if (!isBrowser() || !payload?.event) return;

  await ensureApiSession();
  captureUtmParams();

  const sessionId = getLeadSessionId();
  const siteConfig = await fetchSiteConfig();

  const body = {
    event: payload.event,
    stage: payload.stage || payload.page || "",
    page: payload.page || "",
    sessionId,
    sourceUrl: payload.sourceUrl || window.location.href,
    utm: readUtmParams(),
    personal: payload.personal || {},
    address: payload.address || {},
    extra: payload.extra || {},
    shipping: payload.shipping || {},
    reward: payload.reward || {},
    bump: payload.bump || {},
    pix: payload.pix || {},
    amount: payload.amount,
  };

  try {
    await fetch("/api/lead/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // Ignore tracking transport failures.
  }

  const dedupeKey = `event:${payload.event}:${payload.eventId || body.stage || body.page || ""}`;
  if (!wasPixelEventSent(dedupeKey)) {
    fireLeadPixels(payload.event, payload, siteConfig);
    markPixelEventSent(dedupeKey);
  }
}

export async function initTrackingForPage(page: string) {
  captureUtmParams();
  await fetchSiteConfig();
  if (page) {
    await trackPageView(page);
  }
}
