"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
  Info,
  Lock,
  MapPin,
  Minus,
  Package,
  Plus,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import NikeCheckoutHeader from "../components/NikeCheckoutHeader";
import NikeCheckoutSteps from "../components/NikeCheckoutSteps";
import { trackLeadEvent } from "@/lib/site-tracking";

type CartShipping = {
  id?: string;
  cep?: string;
  address?: string;
  eta?: string;
  name?: string;
  price?: number;
  couponApplied?: boolean;
};

type CartState = {
  title: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  image: string;
  priceValue: number;
  priceLabel: string;
  originalPriceLabel: string;
  installmentLabel: string;
  personalizationWanted?: boolean;
  personalizationName?: string;
  personalizationNumber?: string;
  personalizationPlayer?: string;
  personalizationPosition?: string;
  personalizationMode?: string;
  personalizationExtraValue?: number;
  personalizationSummary?: string;
  shipping?: CartShipping;
};

const CART_STORAGE_KEY = "nikepromo.cartState";
const ORIGINAL_PRICE_VALUE = 749.99;
const OFFER_PRICE_VALUE = 139.19;
const NORMAL_SHIPPING = {
  id: "normal",
  name: "Normal",
  eta: "5 dias uteis",
  price: 0,
  label: "Frete gratis",
  note: "Cupom de frete gratis aplicado automaticamente",
};
const EXPRESS_SHIPPING = {
  id: "nike-expresso",
  name: "Nike Expresso",
  eta: "2 dias uteis",
  price: 18.71,
  label: "R$ 18,71",
  note: "Entrega mais rapida para a sua campanha",
};

const defaultCartState: CartState = {
  title: "Camisa Brasil Jordan II 2026/27 Jogador Masculina",
  color: "Azul",
  size: "M",
  sku: "IU1074-417",
  quantity: 1,
  image: "/assets/nike-brazil-jordan-ii-a3.jpg",
  priceValue: OFFER_PRICE_VALUE,
  priceLabel: "R$ 139,19",
  originalPriceLabel: "R$ 749,99",
  installmentLabel: "ou 12x de R$ 11,60 sem juros",
  personalizationWanted: false,
  shipping: {},
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function readStoredCartState() {
  if (typeof window === "undefined") {
    return defaultCartState;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return defaultCartState;
    }

    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      ...defaultCartState,
      ...parsed,
      shipping: {
        ...defaultCartState.shipping,
        ...(parsed.shipping || {}),
      },
      quantity: Math.min(Math.max(Number(parsed.quantity || 1), 1), 5),
      size:
        String(parsed.size || defaultCartState.size).trim() || defaultCartState.size,
    };
  } catch {
    return defaultCartState;
  }
}

function persistCartState(next: CartState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage limits.
  }
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-black/8 bg-[#f8f8f8] px-4 py-3">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-black/42">
        {label}
      </p>
      <p className="mt-2 text-[1rem] font-medium text-black">{value}</p>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  emphasize,
  success,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[1rem]">
      <span className="text-black/64">{label}</span>
      <span
        className={`text-right ${
          emphasize
            ? "font-semibold text-black"
            : success
              ? "font-medium text-[#14804a]"
              : "text-black"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function CartPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartState>(defaultCartState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [cep, setCep] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [selectedShippingId, setSelectedShippingId] = useState(
    defaultCartState.shipping?.id || NORMAL_SHIPPING.id,
  );
  const [shippingState, setShippingState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
    address: string;
  }>({
    status: "idle",
    message: "",
    address: "",
  });

  useEffect(() => {
    const stored = readStoredCartState();
    const normalizedShippingId =
      stored.shipping?.id === EXPRESS_SHIPPING.id
        ? EXPRESS_SHIPPING.id
        : NORMAL_SHIPPING.id;
    const normalizedShipping =
      normalizedShippingId === EXPRESS_SHIPPING.id
        ? EXPRESS_SHIPPING
        : NORMAL_SHIPPING;

    setCart(stored);
    setCep(stored.shipping?.cep || "");
    setSelectedShippingId(normalizedShippingId);
    setHasHydrated(true);

    if (stored.shipping?.address) {
      setShippingState({
        status: "success",
        message: normalizedShipping.eta,
        address: stored.shipping.address,
      });

      setCart((current) => ({
        ...current,
        shipping: {
          ...current.shipping,
          ...normalizedShipping,
          address: stored.shipping?.address || "",
          cep: stored.shipping?.cep || "",
          couponApplied: normalizedShippingId === NORMAL_SHIPPING.id,
        },
      }));
    }

    void trackLeadEvent({
      event: "cart_view",
      stage: "carrinho",
      page: "carrinho",
      amount: (stored.priceValue || OFFER_PRICE_VALUE) * stored.quantity,
      extra: {
        size: stored.size,
        quantity: stored.quantity,
        personalizationWanted: stored.personalizationWanted ? "sim" : "nao",
        personalizationSummary: stored.personalizationSummary || "",
        personalizationPosition: stored.personalizationPosition || "",
        personalizationExtraValue:
          Number(stored.personalizationExtraValue || 0) || 0,
      },
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    persistCartState(cart);
  }, [cart, hasHydrated]);

  const subtotal = useMemo(
    () => Number((cart.priceValue * cart.quantity).toFixed(2)),
    [cart.priceValue, cart.quantity],
  );

  const shippingOption = useMemo(
    () =>
      selectedShippingId === EXPRESS_SHIPPING.id
        ? EXPRESS_SHIPPING
        : NORMAL_SHIPPING,
    [selectedShippingId],
  );

  const total = useMemo(
    () => Number((subtotal + shippingOption.price).toFixed(2)),
    [shippingOption.price, subtotal],
  );

  const campaignSavingsValue = useMemo(
    () =>
      Number(
        Math.max(
          ORIGINAL_PRICE_VALUE * cart.quantity - cart.priceValue * cart.quantity,
          0,
        ).toFixed(2),
      ),
    [cart.priceValue, cart.quantity],
  );

  const totalLabel = useMemo(() => formatCurrency(total), [total]);
  const subtotalLabel = useMemo(() => formatCurrency(subtotal), [subtotal]);
  const unitPriceLabel = useMemo(
    () => formatCurrency(Number(cart.priceValue || OFFER_PRICE_VALUE)),
    [cart.priceValue],
  );
  const originalLineLabel = useMemo(
    () => formatCurrency(Number((ORIGINAL_PRICE_VALUE * cart.quantity).toFixed(2))),
    [cart.quantity],
  );
  const campaignSavingsLabel = useMemo(
    () => formatCurrency(campaignSavingsValue),
    [campaignSavingsValue],
  );
  const personalizationExtraLabel = useMemo(
    () => formatCurrency(Number(cart.personalizationExtraValue || 0)),
    [cart.personalizationExtraValue],
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

  const installmentCopy = useMemo(() => {
    if (cart.installmentLabel) {
      return cart.installmentLabel;
    }

    return `ou 12x de ${formatCurrency(
      Number(((cart.priceValue || OFFER_PRICE_VALUE) / 12).toFixed(2)),
    )} sem juros por unidade`;
  }, [cart.installmentLabel, cart.priceValue]);

  const itemCountLabel = cart.quantity === 1 ? "1 item" : `${cart.quantity} itens`;
  const hasPersonalization = Boolean(
    cart.personalizationWanted || personalizationSummary,
  );
  const hasShippingAddress = shippingState.status === "success";
  const shippingLabel =
    shippingState.status === "success"
      ? shippingOption.price === 0
        ? "Frete gratis"
        : formatCurrency(shippingOption.price)
      : "A calcular";
  const shippingStatusCopy = hasShippingAddress
    ? shippingOption.id === EXPRESS_SHIPPING.id
      ? "Nike Expresso selecionado para esta compra."
      : "Frete gratis da campanha aplicado automaticamente."
    : "Voce pode calcular o frete agora ou revisar a entrega no proximo passo.";
  const assuranceItems = [
    {
      icon: CreditCard,
      title: "Pix mantido no fluxo atual",
      text: "O pagamento continua no nosso checkout com o mesmo processo de geracao do QR Code.",
    },
    {
      icon: Lock,
      title: "Dados e tracking preservados",
      text: "Eventos de carrinho, checkout e pagamento seguem ativos como no fluxo atual.",
    },
    {
      icon: Package,
      title: "Pedido ja carregado",
      text: "Tamanho, quantidade, preco e personalizacao escolhida vao junto para a proxima etapa.",
    },
  ];

  const handleQuantityChange = (direction: "decrease" | "increase") => {
    const nextQuantity =
      direction === "increase"
        ? Math.min(cart.quantity + 1, 5)
        : Math.max(cart.quantity - 1, 1);

    if (nextQuantity === cart.quantity) {
      return;
    }

    setCart((current) => ({
      ...current,
      quantity: nextQuantity,
    }));

    void trackLeadEvent({
      event: "cart_quantity_changed",
      stage: "carrinho",
      page: "carrinho",
      amount: Number((cart.priceValue * nextQuantity).toFixed(2)),
      extra: {
        direction,
        quantity: nextQuantity,
        size: cart.size,
      },
    });
  };

  const handleShippingLookup = async () => {
    const sanitizedCep = cep.replace(/\D/g, "");
    if (sanitizedCep.length !== 8) {
      setShippingState({
        status: "error",
        message: "Digite um CEP valido com 8 numeros.",
        address: "",
      });
      return;
    }

    setShippingState({
      status: "loading",
      message: "Consultando o prazo da sua oferta...",
      address: "",
    });

    try {
      const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("cep_http_error");
      }

      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        complemento?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        throw new Error("cep_not_found");
      }

      const line1 = [data.logradouro, data.complemento]
        .filter(Boolean)
        .join(", ");
      const line2 = [
        data.bairro,
        data.localidade && data.uf
          ? `${data.localidade}/${data.uf}`
          : data.localidade || data.uf,
      ]
        .filter(Boolean)
        .join(" - ");
      const address =
        [line1, line2].filter(Boolean).join(" - ") ||
        `CEP ${formatCep(sanitizedCep)}`;

      setShippingState({
        status: "success",
        message: NORMAL_SHIPPING.eta,
        address,
      });

      const nextCart = {
        ...cart,
        shipping: {
          id: NORMAL_SHIPPING.id,
          cep: formatCep(sanitizedCep),
          address,
          eta: NORMAL_SHIPPING.eta,
          name: NORMAL_SHIPPING.name,
          price: NORMAL_SHIPPING.price,
          couponApplied: true,
        },
      };

      setSelectedShippingId(NORMAL_SHIPPING.id);
      setCart(nextCart);

      await trackLeadEvent({
        event: "cart_shipping_lookup",
        stage: "carrinho",
        page: "carrinho",
        address: {
          cep: formatCep(sanitizedCep),
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        },
        shipping: {
          id: NORMAL_SHIPPING.id,
          name: NORMAL_SHIPPING.name,
          price: NORMAL_SHIPPING.price,
        },
        extra: {
          eta: NORMAL_SHIPPING.eta,
          size: cart.size,
          couponApplied: "sim",
        },
      });
    } catch {
      await trackLeadEvent({
        event: "cart_shipping_lookup_error",
        stage: "carrinho",
        page: "carrinho",
        address: {
          cep: formatCep(sanitizedCep),
        },
      });
      setShippingState({
        status: "error",
        message: "Nao foi possivel consultar esse CEP agora. Tente novamente.",
        address: "",
      });
    }
  };

  const handleApplyCoupon = async () => {
    const normalized = coupon.trim().toUpperCase();
    const message = normalized
      ? `Cupom ${normalized} analisado. A oferta da campanha continua ativa no valor final do seu carrinho.`
      : "A oferta da campanha ja esta aplicada no valor final do seu carrinho.";

    setCouponMessage(message);

    await trackLeadEvent({
      event: "cart_coupon_apply",
      stage: "carrinho",
      page: "carrinho",
      extra: {
        coupon: normalized || "campanha_ativa",
      },
    });
  };

  const handleSelectShipping = async (
    option: typeof NORMAL_SHIPPING | typeof EXPRESS_SHIPPING,
  ) => {
    setSelectedShippingId(option.id);

    setCart((current) => ({
      ...current,
      shipping: {
        ...current.shipping,
        id: option.id,
        name: option.name,
        price: option.price,
        eta: option.eta,
        couponApplied: option.id === NORMAL_SHIPPING.id,
      },
    }));

    await trackLeadEvent({
      event: "cart_shipping_selected",
      stage: "carrinho",
      page: "carrinho",
      shipping: {
        id: option.id,
        name: option.name,
        price: option.price,
      },
      extra: {
        eta: option.eta,
        couponApplied: option.id === NORMAL_SHIPPING.id ? "sim" : "nao",
      },
    });
  };

  const handleContinue = async () => {
    await trackLeadEvent({
      event: "checkout_view",
      stage: "carrinho",
      page: "carrinho",
      amount: total,
      shipping: {
        id: shippingState.status === "success" ? shippingOption.id : "",
        name: shippingState.status === "success" ? shippingOption.name : "",
        price: shippingState.status === "success" ? shippingOption.price : 0,
      },
      extra: {
        size: cart.size,
        quantity: cart.quantity,
      },
    });

    router.push("/checkout");
  };

  const handleRemoveProduct = async () => {
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore storage restrictions.
    }

    await trackLeadEvent({
      event: "cart_remove_item",
      stage: "carrinho",
      page: "carrinho",
      extra: {
        sku: cart.sku,
      },
    });

    router.push("/nike");
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-black">
      <NikeCheckoutHeader
        backHref="/nike"
        contentClassName="max-w-[74rem] px-4 sm:px-6 lg:px-8"
      />

      <div className="mx-auto w-full max-w-[74rem] px-4 pb-24 pt-[84px] sm:px-6 lg:px-8">
        <NikeCheckoutSteps activeStep={1} />

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div>
            <p className="text-[0.76rem] font-semibold uppercase tracking-[0.3em] text-black/42">
              Sacola Nike
            </p>
            <h1 className="mt-3 text-[2.85rem] font-semibold leading-none sm:text-[3.6rem]">
              Seu carrinho
            </h1>
            <p className="mt-4 max-w-[38rem] text-[1rem] leading-7 text-black/62">
              Layout no estilo Nike usando o nosso fluxo real de carrinho,
              checkout, PIX, tracking e personalizacao.
            </p>
          </div>

          <div className="rounded-[28px] bg-black px-6 py-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.16)]">
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-white/56">
              Oferta da campanha
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[2.5rem] font-semibold leading-none">
                  {totalLabel}
                </p>
                <p className="mt-2 text-[0.98rem] text-white/72">
                  mesmo valor no Pix e no cartao
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.82rem] font-medium text-white/92">
                {itemCountLabel}
              </span>
            </div>
            <div className="mt-5 space-y-3 text-[0.95rem] leading-6 text-white/82">
              <p className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2.4} />
                <span>{shippingStatusCopy}</span>
              </p>
              <p className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2.4} />
                <span>
                  {hasPersonalization
                    ? `Personalizacao carregada: ${personalizationSummary || "selecionada"}.`
                    : "O produto segue pronto para a etapa de identificacao."}
                </span>
              </p>
            </div>
          </div>
        </section>

        {noticeVisible && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-[24px] border border-black/8 bg-white px-5 py-4 shadow-[0_18px_55px_rgba(17,17,17,0.05)]">
            <p className="text-[0.98rem] font-medium leading-6 text-black">
              Os produtos no carrinho nao estao reservados. Finalize seu pedido
              antes que o estoque acabe.
            </p>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => {
                setNoticeVisible(false);
                void trackLeadEvent({
                  event: "cart_notice_dismissed",
                  stage: "carrinho",
                  page: "carrinho",
                });
              }}
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-black/72 transition-colors hover:bg-black/[0.04]"
            >
              <X className="h-5 w-5" strokeWidth={1.9} />
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_23.5rem]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_24px_72px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-black/8 px-5 py-4 sm:px-7">
                <div>
                  <p className="text-[1rem] font-semibold text-black">Produto</p>
                  <p className="mt-1 text-[0.95rem] text-black/48">
                    {itemCountLabel} no seu carrinho
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveProduct}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[0.92rem] font-medium text-black transition-colors hover:bg-black/[0.04]"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  Remover
                </button>
              </div>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-[24px] bg-[#f1f1f1]">
                  <Image
                    src={cart.image}
                    alt={cart.title}
                    width={720}
                    height={900}
                    priority
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-col">
                  <div>
                    <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-black/42">
                      Selecao brasileira
                    </p>
                    <h2 className="mt-3 text-[1.5rem] font-semibold leading-tight text-black sm:text-[1.92rem]">
                      {cart.title}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-end gap-3">
                      <span className="text-[2.1rem] font-semibold leading-none text-black">
                        {subtotalLabel}
                      </span>
                      <span className="pb-1 text-[1.02rem] text-black/34 line-through">
                        {originalLineLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.98rem] text-black/58">
                      {installmentCopy}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailChip label="Cor" value={cart.color} />
                    <DetailChip label="Tamanho" value={cart.size} />
                    <DetailChip label="SKU" value={cart.sku} />
                    <DetailChip label="Preco por unidade" value={unitPriceLabel} />
                  </div>

                  {hasPersonalization && (
                    <div className="mt-5 rounded-[24px] border border-black/8 bg-[#f8f8f8] p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-black/42">
                            Personalizacao
                          </p>
                          <p className="mt-2 text-[1.04rem] font-medium text-black">
                            {personalizationSummary || "Selecionada"}
                          </p>
                        </div>
                        {Number(cart.personalizationExtraValue || 0) > 0 ? (
                          <span className="rounded-full bg-black px-3 py-1 text-[0.8rem] font-medium text-white">
                            +{personalizationExtraLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-2 text-[0.96rem] leading-6 text-black/68">
                        <p>
                          Posicao: {cart.personalizationPosition || "Costas"}
                        </p>
                        {cart.personalizationPlayer ? (
                          <p>Atleta: {cart.personalizationPlayer}</p>
                        ) : null}
                        {cart.personalizationName ? (
                          <p>Nome: {cart.personalizationName}</p>
                        ) : null}
                        {cart.personalizationNumber ? (
                          <p>Numero: {cart.personalizationNumber}</p>
                        ) : null}
                        {cart.personalizationMode ? (
                          <p>Modo: {cart.personalizationMode}</p>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-5 border-t border-black/8 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-black/42">
                        Quantidade
                      </p>
                      <div className="mt-3 inline-flex overflow-hidden rounded-full border border-black/12 bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange("decrease")}
                          className="inline-flex h-12 w-12 items-center justify-center text-black transition-colors hover:bg-black/[0.04]"
                        >
                          <Minus className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                        <div className="inline-flex h-12 min-w-12 items-center justify-center border-x border-black/12 px-4 text-[1rem] font-medium text-black">
                          {cart.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange("increase")}
                          className="inline-flex h-12 w-12 items-center justify-center text-black transition-colors hover:bg-black/[0.04]"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>

                    <div className="max-w-[20rem]">
                      <p className="text-[0.95rem] leading-6 text-black/58">
                        O item continua com o preco promocional e segue para o
                        nosso checkout com PIX, tracking e personalizacao
                        preservados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-black/8 bg-white px-5 py-5 shadow-[0_24px_72px_rgba(17,17,17,0.06)] sm:px-7 sm:py-7">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#f4f4f4] text-black">
                  <Truck className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="text-[1.7rem] font-semibold leading-none text-black sm:text-[2rem]">
                    Entrega
                  </h2>
                  <p className="mt-3 max-w-[34rem] text-[1rem] leading-7 text-black/60">
                    Consulte o CEP para liberar o prazo e manter o frete da
                    campanha no seu pedido.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={cep}
                  onChange={(event) => setCep(formatCep(event.target.value))}
                  inputMode="numeric"
                  placeholder="00000-000"
                  className="h-14 min-w-0 flex-1 rounded-full border border-black/14 bg-white px-5 text-[1rem] text-black outline-none transition-colors placeholder:text-black/38 focus:border-black/28"
                />
                <button
                  type="button"
                  onClick={handleShippingLookup}
                  disabled={shippingState.status === "loading"}
                  className="inline-flex h-14 min-w-[10rem] items-center justify-center rounded-full border border-black bg-black px-6 text-[1rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {shippingState.status === "loading" ? "Calculando" : "Calcular"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.94rem] text-black/48">
                <span>Politica de frete e entregas.</span>
                <span className="h-1 w-1 rounded-full bg-black/20" />
                <span>Voce pode revisar o endereco no checkout.</span>
              </div>

              {shippingState.status === "success" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[24px] border border-[#dcecdf] bg-[#eef8f1] px-4 py-4 text-[#106a40]">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 flex-none" strokeWidth={2} />
                      <div>
                        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#106a40]/72">
                          Endereco encontrado
                        </p>
                        <p className="mt-2 text-[0.98rem] leading-6">
                          {shippingState.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {[NORMAL_SHIPPING, EXPRESS_SHIPPING].map((option) => {
                    const selected = selectedShippingId === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void handleSelectShipping(option)}
                        className={`grid w-full gap-3 rounded-[24px] border px-4 py-4 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
                          selected
                            ? "border-black/18 bg-[#f6f6f6]"
                            : "border-black/10 bg-white hover:bg-[#fafafa]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" strokeWidth={1.9} />
                            <span className="text-[1.06rem] font-semibold text-black">
                              {option.name}
                            </span>
                          </div>
                          <p className="mt-2 pl-7 text-[0.95rem] leading-6 text-black/58">
                            {option.eta} - {option.note}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <span
                            className={`text-[1.15rem] font-semibold ${
                              option.price === 0 ? "text-[#14804a]" : "text-black"
                            }`}
                          >
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="inline-flex rounded-full bg-black px-3 py-1 text-[0.76rem] font-medium text-white">
                              Selecionado
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {shippingState.status === "error" && (
                <p className="mt-5 rounded-[22px] border border-[#f0d1d1] bg-[#fff6f6] px-4 py-4 text-[0.96rem] leading-6 text-[#9a1d1d]">
                  {shippingState.message}
                </p>
              )}
            </section>

            <section className="rounded-[30px] border border-black/8 bg-white px-5 py-5 shadow-[0_24px_72px_rgba(17,17,17,0.06)] sm:px-7 sm:py-7">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#f4f4f4] text-black">
                  <Tag className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <div>
                  <h2 className="text-[1.7rem] font-semibold leading-none text-black sm:text-[2rem]">
                    Cupom
                  </h2>
                  <p className="mt-3 max-w-[34rem] text-[1rem] leading-7 text-black/60">
                    A oferta ja esta aplicada. Se quiser testar um cupom, o
                    carrinho continua respeitando o nosso valor final.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Digite seu cupom"
                  className="h-14 min-w-0 flex-1 rounded-full border border-black/14 bg-white px-5 text-[1rem] text-black outline-none transition-colors placeholder:text-black/38 focus:border-black/28"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="inline-flex h-14 min-w-[10rem] items-center justify-center rounded-full border border-black/12 bg-white px-6 text-[1rem] font-medium text-black transition-colors hover:bg-black/[0.04]"
                >
                  Aplicar
                </button>
              </div>

              <div className="mt-4 rounded-[24px] bg-[#f6f6f6] px-4 py-4 text-[0.97rem] leading-6 text-black/68">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2.1} />
                  <p>
                    Tem um vale-troca ou cartao presente? Voce podera usa-los na
                    etapa de pagamento.
                  </p>
                </div>
              </div>

              {couponMessage && (
                <p className="mt-4 rounded-[22px] border border-black/8 bg-[#fbfbfb] px-4 py-4 text-[0.96rem] leading-6 text-black/76">
                  {couponMessage}
                </p>
              )}
            </section>
          </div>

          <aside className="xl:sticky xl:top-[92px] xl:self-start">
            <section className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_24px_72px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-black/42">
                    Resumo
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold leading-none text-black">
                    Fechar pedido
                  </h2>
                </div>
                <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-[0.82rem] font-medium text-black/72">
                  {itemCountLabel}
                </span>
              </div>

              <div className="mt-6 space-y-3 border-b border-black/8 pb-5">
                <SummaryLine label="Valor dos produtos" value={subtotalLabel} />
                {hasPersonalization ? (
                  <SummaryLine
                    label="Personalizacao"
                    value={
                      Number(cart.personalizationExtraValue || 0) > 0
                        ? `Incluida (+${personalizationExtraLabel})`
                        : "Incluida"
                    }
                  />
                ) : null}
                <SummaryLine
                  label="Desconto da campanha"
                  value={`-${campaignSavingsLabel}`}
                  success
                />
                <SummaryLine
                  label="Frete"
                  value={shippingLabel}
                  success={shippingLabel === "Frete gratis"}
                />
              </div>

              <div className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="pt-1 text-[1.08rem] text-black/64">
                    Total da compra
                  </span>
                  <div className="text-right">
                    <p className="text-[2rem] font-semibold leading-none text-black">
                      {totalLabel}
                    </p>
                    <p className="mt-2 text-[0.96rem] text-black/48">
                      {totalLabel} no cartao
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {assuranceItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-black/8 bg-[#fafafa] px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white text-black shadow-[0_8px_20px_rgba(17,17,17,0.06)]">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[0.96rem] font-semibold text-black">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[0.92rem] leading-6 text-black/58">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[24px] bg-[#f6f6f6] px-4 py-4 text-[0.95rem] leading-6 text-black/68">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2.1} />
                  <p>
                    O desconto da campanha ja esta aplicado neste carrinho.
                    Agora e so seguir para a etapa de identificacao.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-[1.02rem] font-medium text-white transition-opacity hover:opacity-90"
              >
                Continuar
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </button>

              <p className="mt-4 text-[0.86rem] leading-6 text-black/46">
                Ao continuar, o pedido segue para identificacao, pagamento via
                PIX e rastreamento dos eventos sem alterar o fluxo atual.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
