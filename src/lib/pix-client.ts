import {
  getLeadSessionId,
  readLeadDraft,
  readUtmParams,
} from "@/lib/site-tracking";

export type LeadDraft = {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

export type CheckoutShipping = {
  id?: string;
  cep?: string;
  address?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  number?: string;
  complement?: string;
  eta?: string;
  name?: string;
  price?: number;
  couponApplied?: boolean;
};

export type CartState = {
  title?: string;
  color?: string;
  size?: string;
  sku?: string;
  quantity?: number;
  image?: string;
  priceValue?: number;
  shipping?: CheckoutShipping;
};

export type PixData = {
  idTransaction: string;
  paymentCode?: string;
  paymentCodeBase64?: string;
  paymentQrUrl?: string;
  status?: string;
  gateway?: string;
  amount?: number;
  createdAt: number;
  orderNumber: string;
  sessionId?: string;
};

type CreatePixOptions = {
  sourceUrl?: string;
  sourceStage?: string;
  stage?: string;
  page?: string;
  force?: boolean;
};

const CART_STORAGE_KEY = "nikepromo.cartState";
const PIX_STORAGE_KEY = "nikepromo.pixState";

export const DEFAULT_PRICE_VALUE = 139.19;
export const PIX_UI_EXPIRATION_MS = 60 * 60 * 1000;
export const DEFAULT_CART: CartState = {
  title: "Camisa Brasil Jordan II 2026/27 Jogador Masculina",
  color: "Azul",
  size: "M",
  sku: "IU1074-417",
  quantity: 1,
  image: "/assets/nike-brazil-jordan-ii-a3.jpg",
  priceValue: DEFAULT_PRICE_VALUE,
  shipping: {
    id: "normal",
    name: "Normal",
    eta: "5 dias uteis",
    price: 0,
    couponApplied: true,
  },
};

export function readStoredCartState(): CartState {
  if (typeof window === "undefined") return DEFAULT_CART;

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return DEFAULT_CART;

    const parsed = JSON.parse(raw) as CartState;
    return {
      ...DEFAULT_CART,
      ...parsed,
      shipping: {
        ...DEFAULT_CART.shipping,
        ...(parsed.shipping || {}),
      },
    };
  } catch {
    return DEFAULT_CART;
  }
}

function parseAddressLine(address: string) {
  const parts = String(address || "")
    .split(/Ã¢â‚¬Â¢|â€¢/)
    .map((part) => part.trim())
    .filter(Boolean);

  const location = parts[parts.length - 1] || "";
  const [city = "", state = ""] = location.split("/").map((part) => part.trim());

  return {
    street: parts[0] || "",
    neighborhood: parts.length > 2 ? parts[1] : "",
    city,
    state,
  };
}

export function buildShippingFromCart(input?: CheckoutShipping): CheckoutShipping {
  const base = input || {};
  const parsed = parseAddressLine(base.address || "");

  return {
    ...base,
    ...parsed,
  };
}

export function persistPixState(pix: PixData) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PIX_STORAGE_KEY, JSON.stringify(pix));
  } catch {
    // Ignore storage failures in restricted browsers.
  }
}

export function readStoredPixState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PIX_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PixData;
  } catch {
    return null;
  }
}

function deriveOrderNumber(seed: string) {
  const digits = String(seed || "").replace(/\D/g, "");
  if (digits.length >= 9) return digits.slice(-9);

  let hash = 0;
  const source = String(seed || "nikepix");
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return String(hash || Date.now()).padStart(9, "0").slice(-9);
}

function hasUsableCachedPix(
  cached: PixData | null,
  sessionId: string,
  totalAmount: number,
) {
  if (!cached?.idTransaction || !cached.orderNumber) return false;

  const status = String(cached.status || "").toLowerCase();
  if (status === "refused" || status === "refunded") return false;

  if (
    String(cached.sessionId || "").trim() &&
    String(cached.sessionId || "").trim() !== String(sessionId || "").trim()
  ) {
    return false;
  }

  const cachedAmount = Number(cached.amount || 0);
  if (cachedAmount > 0 && Math.abs(cachedAmount - totalAmount) > 0.01) {
    return false;
  }

  if (status !== "paid") {
    const createdAt = Number(cached.createdAt || 0);
    if (!createdAt || Date.now() - createdAt > PIX_UI_EXPIRATION_MS) {
      return false;
    }
  }

  return true;
}

export async function createPixForCurrentSession(
  options: CreatePixOptions = {},
) {
  const lead = readLeadDraft() as LeadDraft;
  const cart = readStoredCartState();
  const shipping = buildShippingFromCart(cart.shipping);
  const sessionId = getLeadSessionId();

  const quantityValue = Number(cart.quantity || 1);
  const productUnit = Number(cart.priceValue || DEFAULT_PRICE_VALUE);
  const productSubtotal = Number((productUnit * quantityValue).toFixed(2));
  const shippingFee = Number(shipping.price || 0);
  const totalAmount = Number((productSubtotal + shippingFee).toFixed(2));

  if (!lead.name || !lead.cpf || !lead.email || !lead.phone) {
    throw new Error("Volte uma etapa e confirme seus dados antes de gerar o Pix.");
  }

  if (!shipping.cep || !shipping.street || !shipping.city || !shipping.state) {
    throw new Error("Volte para a identificacao e confirme o endereco de entrega.");
  }

  const cached = readStoredPixState();
  if (!options.force && hasUsableCachedPix(cached, sessionId, totalAmount)) {
    return cached as PixData;
  }

  const response = await fetch("/api/pix/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({
      sessionId,
      amount: totalAmount,
      stage: options.stage || "pix",
      page: options.page || "pix",
      event: "pix_create_requested",
      sourceUrl:
        options.sourceUrl ||
        (typeof window !== "undefined" ? window.location.href : ""),
      sourceStage: options.sourceStage || "checkout_pagamento",
      utm: readUtmParams(),
      personal: {
        name: lead.name || "",
        cpf: lead.cpf || "",
        email: lead.email || "",
        phone: lead.phone || "",
        phoneDigits: String(lead.phone || "").replace(/\D/g, ""),
      },
      address: {
        cep: shipping.cep || "",
        street: shipping.street || "",
        neighborhood: shipping.neighborhood || "",
        city: shipping.city || "",
        state: shipping.state || "",
      },
      extra: {
        number: shipping.number || "",
        complement: shipping.complement || "",
        productSubtotal,
        shippingSubtotal: shippingFee,
        sku: cart.sku || "",
      },
      shipping: {
        id: shipping.id || "normal",
        name: shipping.name || "Normal",
        price: shippingFee,
        originalPrice: shippingFee,
        basePrice: shippingFee,
        eta: shipping.eta || "",
        couponApplied: shipping.couponApplied !== false,
      },
      reward: {
        id: "bag",
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    idTransaction?: string;
    paymentCode?: string;
    paymentCodeBase64?: string;
    paymentQrUrl?: string;
    amount?: number;
    status?: string;
    gateway?: string;
  };

  if (!response.ok || !String(data.idTransaction || "").trim()) {
    throw new Error(String(data.error || "Falha ao gerar o Pix."));
  }

  const sameTransaction =
    cached &&
    String(cached.idTransaction || "").trim() === String(data.idTransaction || "").trim();

  const nextPix: PixData = {
    idTransaction: String(data.idTransaction || "").trim(),
    paymentCode: String(data.paymentCode || "").trim(),
    paymentCodeBase64: String(data.paymentCodeBase64 || "").trim(),
    paymentQrUrl: String(data.paymentQrUrl || "").trim(),
    status: String(data.status || "waiting_payment").trim(),
    gateway: String(data.gateway || "").trim(),
    amount: Number(data.amount || totalAmount),
    createdAt: sameTransaction ? Number(cached?.createdAt || Date.now()) : Date.now(),
    orderNumber:
      sameTransaction && String(cached?.orderNumber || "").trim()
        ? String(cached?.orderNumber || "").trim()
        : deriveOrderNumber(`${data.idTransaction || sessionId}`),
    sessionId,
  };

  persistPixState(nextPix);
  return nextPix;
}
