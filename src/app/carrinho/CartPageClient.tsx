"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  Minus,
  Plus,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import NikeCheckoutHeader from "../components/NikeCheckoutHeader";
import { trackLeadEvent } from "@/lib/site-tracking";

type CartShipping = {
  cep?: string;
  address?: string;
  eta?: string;
  name?: string;
  price?: number;
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
  shipping?: CartShipping;
};

const CART_STORAGE_KEY = "nikepromo.cartState";
const OFFER_PRICE_VALUE = 139.19;

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
      size: String(parsed.size || defaultCartState.size).trim() || defaultCartState.size,
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

function CheckoutSteps() {
  const steps = [
    { number: 1, label: "Carrinho", active: true },
    { number: 2, label: "Identificacao", active: false },
    { number: 3, label: "Pagamento", active: false },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#ececec]">
      <div className="flex">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`relative flex min-h-12 flex-1 items-center justify-center gap-2 px-3 text-[0.84rem] font-semibold ${
              step.active ? "bg-white text-black" : "bg-[#e7e7e7] text-[#757575]"
            }`}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-5 bg-white"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
              />
            )}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute -right-5 top-0 h-full w-5 ${
                  step.active ? "bg-white" : "bg-[#e7e7e7]"
                }`}
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
              />
            )}
            <span
              className={`relative z-10 inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.68rem] ${
                step.active ? "bg-black text-white" : "bg-[#8d8d8d] text-white"
              }`}
            >
              {step.number}
            </span>
            <span className="relative z-10 whitespace-nowrap">{step.label}</span>
          </div>
        ))}
      </div>
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
    setCart(stored);
    setCep(stored.shipping?.cep || "");
    setHasHydrated(true);

    if (stored.shipping?.address) {
      setShippingState({
        status: "success",
        message: stored.shipping?.eta || "3 dias uteis",
        address: stored.shipping.address,
      });
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

  const totalLabel = useMemo(() => formatCurrency(subtotal), [subtotal]);

  const handleQuantityChange = (direction: "decrease" | "increase") => {
    setCart((current) => {
      const nextQuantity =
        direction === "increase"
          ? Math.min(current.quantity + 1, 5)
          : Math.max(current.quantity - 1, 1);

      return {
        ...current,
        quantity: nextQuantity,
      };
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

      const line1 = [data.logradouro, data.complemento].filter(Boolean).join(", ");
      const line2 = [
        data.bairro,
        data.localidade && data.uf ? `${data.localidade}/${data.uf}` : data.localidade || data.uf,
      ]
        .filter(Boolean)
        .join(" • ");
      const address = [line1, line2].filter(Boolean).join(" • ") || `CEP ${formatCep(sanitizedCep)}`;

      setShippingState({
        status: "success",
        message: "3 dias uteis",
        address,
      });

      const nextCart = {
        ...cart,
        shipping: {
          cep: formatCep(sanitizedCep),
          address,
          eta: "3 dias uteis",
          name: "Normal",
          price: 0,
        },
      };
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
          id: "normal",
          name: "Normal",
          price: 0,
        },
        extra: {
          eta: "3 dias uteis",
          size: cart.size,
        },
      });
    } catch {
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
      ? `Cupom ${normalized} analisado. A oferta da campanha continua ativa no seu carrinho.`
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

  const handleContinue = async () => {
    await trackLeadEvent({
      event: "checkout_view",
      stage: "carrinho",
      page: "carrinho",
      amount: subtotal,
      shipping: {
        id: cart.shipping?.name ? "normal" : "",
        name: cart.shipping?.name || "",
        price: cart.shipping?.price || 0,
      },
      extra: {
        size: cart.size,
        quantity: cart.quantity,
      },
    });

    router.push("/pagamento");
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
    <main className="min-h-screen bg-white text-black">
      <NikeCheckoutHeader backHref="/nike" />

      <div className="mx-auto w-full max-w-[38rem] px-4 pb-10 pt-20">
        <CheckoutSteps />

        {noticeVisible && (
          <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl bg-[#f7f7f7] px-4 py-4">
            <p className="text-[1rem] font-medium leading-6 text-black">
              Os produtos no carrinho nao estao reservados. Finalize seu pedido
              antes que o estoque acabe.
            </p>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setNoticeVisible(false)}
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/[0.05]"
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        )}

        <section className="mt-6 border-b border-black/10 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="max-w-[18rem] text-[1.75rem] font-semibold leading-[1.16]">
                {cart.title}
              </h1>
              <div className="mt-4 space-y-1.5 text-[1rem] leading-7 text-black">
                <p>Quantidade: {cart.quantity}</p>
                <p>Cor: {cart.color}</p>
                <p>Tamanho: {cart.size}</p>
                <p>Estilo: {cart.sku}</p>
                {cart.personalizationWanted && (
                  <p>Personalizacao: selecionada</p>
                )}
              </div>
              <p className="mt-4 text-[1rem] font-medium text-[#cc1818]">
                Oferta da campanha reservada neste carrinho.
              </p>
            </div>

            <button
              type="button"
              aria-label="Remover produto"
              onClick={handleRemoveProduct}
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-black/10 text-black transition-colors hover:bg-black/[0.04]"
            >
              <Trash2 className="h-5 w-5" strokeWidth={1.9} />
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.6rem] bg-[#f1f1f1]">
            <Image
              src={cart.image}
              alt={cart.title}
              width={780}
              height={980}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </section>

        <section className="border-b border-black/10 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex overflow-hidden rounded-xl border border-black/12">
              <button
                type="button"
                onClick={() => handleQuantityChange("decrease")}
                className="inline-flex h-12 w-12 items-center justify-center bg-white text-black transition-colors hover:bg-black/[0.04]"
              >
                <Minus className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <div className="inline-flex h-12 min-w-12 items-center justify-center border-x border-black/12 px-4 text-[1rem] font-medium">
                {cart.quantity}
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange("increase")}
                className="inline-flex h-12 w-12 items-center justify-center bg-white text-black transition-colors hover:bg-black/[0.04]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>

            <div className="text-right">
              <p className="text-[1.9rem] font-semibold leading-none">
                {totalLabel}
              </p>
              <p className="mt-2 text-[1rem] font-medium text-[#1b6d38]">
                Frete gratis da campanha
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 py-7">
          <h2 className="text-[2rem] font-semibold leading-none">Prazo de entrega</h2>

          <div className="mt-5 flex overflow-hidden rounded-2xl border border-black/16">
            <input
              type="text"
              value={cep}
              onChange={(event) => setCep(formatCep(event.target.value))}
              inputMode="numeric"
              placeholder="00000-000"
              className="h-14 min-w-0 flex-1 border-0 px-5 text-[1rem] text-black outline-none placeholder:text-black/40"
            />
            <button
              type="button"
              onClick={handleShippingLookup}
              disabled={shippingState.status === "loading"}
              className="m-1 inline-flex min-w-[8.75rem] items-center justify-center rounded-full border border-black/20 px-5 text-[1rem] font-medium text-black transition-colors hover:bg-black/[0.04] disabled:opacity-60"
            >
              {shippingState.status === "loading" ? "Calculando" : "Calcular"}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-[0.95rem] text-black/55">
            <span>Confira a nossa Politica de Frete e Entregas.</span>
            <span>Nao sei o CEP</span>
          </div>

          {shippingState.status === "success" && (
            <div className="mt-4 space-y-3">
              <p className="text-[1rem] font-medium leading-6 text-black">
                {shippingState.address}
              </p>
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl bg-[#f5f5f5] px-4 py-4">
                <div className="flex items-center gap-2 text-[1.15rem] font-medium text-black">
                  <Truck className="h-5 w-5" strokeWidth={1.9} />
                  <span>Normal</span>
                </div>
                <p className="text-[1.2rem] font-semibold text-[#0f6a3f]">
                  Frete gratis
                </p>
                <p className="pl-7 text-[0.98rem] text-black/62">
                  {shippingState.message}
                </p>
              </div>
            </div>
          )}

          {shippingState.status === "error" && (
            <p className="mt-4 rounded-2xl border border-[#f0d1d1] bg-[#fff6f6] px-4 py-3 text-[0.95rem] text-[#9a1d1d]">
              {shippingState.message}
            </p>
          )}
        </section>

        <section className="border-b border-black/10 py-7">
          <h2 className="text-[2rem] font-semibold leading-none">
            Cupom de desconto
          </h2>

          <div className="mt-5 flex overflow-hidden rounded-2xl border border-black/16">
            <input
              type="text"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Digite seu cupom"
              className="h-14 min-w-0 flex-1 border-0 px-5 text-[1rem] text-black outline-none placeholder:text-black/40"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="m-1 inline-flex min-w-[8.75rem] items-center justify-center rounded-full border border-black/20 px-5 text-[1rem] font-medium text-black transition-colors hover:bg-black/[0.04]"
            >
              Aplicar
            </button>
          </div>

          <div className="mt-4 flex items-start gap-3 text-[1rem] leading-6 text-black/72">
            <div className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-black/15">
              <Tag className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <p>
              Tem um vale-troca ou cartao presente? Voce podera usa-los na
              etapa de pagamento.
            </p>
          </div>

          {couponMessage && (
            <p className="mt-4 rounded-2xl bg-[#f5f5f5] px-4 py-3 text-[0.95rem] leading-6 text-black/78">
              {couponMessage}
            </p>
          )}
        </section>

        <section className="py-7">
          <h2 className="text-[2rem] font-semibold leading-none">Resumo</h2>

          <div className="mt-6 space-y-3 text-[1.1rem]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-black/74">Valor dos produtos</span>
              <span>{totalLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-black/74">Frete</span>
              <span>
                {shippingState.status === "success" ? "Frete gratis" : "A calcular"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between gap-4">
            <span className="text-[1.6rem] font-semibold leading-none">
              Total da compra
            </span>
            <div className="text-right">
              <p className="text-[1.85rem] font-semibold leading-none">
                {totalLabel} no Pix
              </p>
              <p className="mt-2 text-[1rem] text-black/46">
                {totalLabel} no cartao
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-[1.4rem] bg-[#f6f6f6] px-4 py-3 text-[0.94rem] leading-6 text-black/68">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 flex-none" strokeWidth={2.1} />
              <p>
                O desconto da campanha ja esta aplicado neste carrinho. Agora e
                so seguir para a etapa de pagamento.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-[1.02rem] font-medium text-white transition-transform duration-300 hover:scale-[1.01]"
          >
            Continuar
          </button>
        </section>
      </div>
    </main>
  );
}
