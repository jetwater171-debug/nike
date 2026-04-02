"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const PRODUCT_HREF = "/nike";
const PAYMENT_METHODS = [
  {
    alt: "Mastercard",
    width: 35,
    height: 22,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/mastercard.svg",
  },
  {
    alt: "Visa",
    width: 40,
    height: 16,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/visa.svg",
  },
  {
    alt: "Amex",
    width: 27,
    height: 20,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/american-express.svg",
  },
  {
    alt: "Elo",
    width: 22,
    height: 22,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/elo.svg",
  },
  {
    alt: "Hipercard",
    width: 38,
    height: 16,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/hipercard.svg",
  },
  {
    alt: "Discover",
    width: 37,
    height: 10,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/discover.svg",
  },
  {
    alt: "Pix",
    width: 22,
    height: 22,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/pix.svg",
  },
  {
    alt: "Clearsale",
    width: 90,
    height: 33,
    src: "https://static.nike.com.br/v11-293-0/images/paymentMethods/clearsale.svg",
  },
] as const;

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

  const handleQuantityChange = (direction: "decrease" | "increase") => {
    const nextQuantity =
      direction === "increase"
        ? Math.min(cart.quantity + 1, 5)
        : Math.max(cart.quantity - 1, 1);

    if (nextQuantity === cart.quantity) {
      return;
    }

    setCart((current) => {
      return {
        ...current,
        quantity: nextQuantity,
      };
    });

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
    <main className="min-h-screen bg-white text-black">
      <header
        data-testid="header"
        className="Header-styled__Wrapper-sc-833d32f0-0 dTstYF"
      >
        <div className="mx-auto flex h-[64px] w-full max-w-[430px] items-center justify-between px-6">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => router.push("/nike")}
            className="Buttonstyled__Wrapper-sc-1l40qr2-0 htczEW inline-flex h-10 w-10 items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.75 5.75 8.5 12l6.25 6.25"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <img
            alt="Nike"
            width="61"
            height="21"
            src="https://static.nike.com.br/v11-293-0/images/brands/logo.svg"
          />

          <span aria-hidden="true" className="inline-block h-10 w-10" />
        </div>
      </header>

      <div
        data-testid="container"
        className="CheckoutWrapper-styled__CartContainer-sc-92af4e1e-1 fjHOCk mx-auto w-full max-w-[430px]"
      >
        <ol data-testid="tracking-step" className="Tracking-styled__Wrapper-sc-954d3648-0 hRlGEM">
          <li aria-label="Etapa 1 - Carrinho" aria-disabled="true" className="Tracking-styled__StyledStep-sc-954d3648-1 flXux">
            <div className="Tracking-styled__StepNumberWrapper-sc-954d3648-2 cSztIy">
              <span className="Tracking-styled__StepNumber-sc-954d3648-3 cAeeIl">1</span>
            </div>
            <div className="Tracking-styled__Content-sc-954d3648-4 ceglMw">Carrinho</div>
          </li>
          <li aria-label="Etapa 2 - Identificação" aria-disabled="true" className="Tracking-styled__StyledStep-sc-954d3648-1 gWmLkc">
            <div className="Tracking-styled__StepNumberWrapper-sc-954d3648-2 dIjVWc">
              <span className="Tracking-styled__StepNumber-sc-954d3648-3 cAeeIl">2</span>
            </div>
            <div className="Tracking-styled__Content-sc-954d3648-4 ceglMw">Identificação</div>
          </li>
          <li aria-label="Etapa 3 - Pagamento" aria-disabled="true" className="Tracking-styled__StyledStep-sc-954d3648-1 gWmLkc">
            <div className="Tracking-styled__StepNumberWrapper-sc-954d3648-2 dIjVWc">
              <span className="Tracking-styled__StepNumber-sc-954d3648-3 cAeeIl">3</span>
            </div>
            <div className="Tracking-styled__Content-sc-954d3648-4 ceglMw">Pagamento</div>
          </li>
        </ol>

        {noticeVisible && (
          <div data-testid="pix-info-wrapper" className="Cart-styled__DiscountAlertMessageWrapper-sc-8dbd32cd-0 ElFSe">
            <div className="Alert-styled__AlertBox-sc-7ecd97c0-0 eMuJwV">
              <div className="Alert-styled__InformationText-sc-7ecd97c0-1 lejUhH">
                <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj Alert-styled__CustomTypography-sc-7ecd97c0-2 kEtMQN">
                  <strong className="Typographystyled__Simple-sc-bdxvrr-5 jATnYO">
                    Os produtos no carrinho não estão reservados.
                  </strong>{" "}
                  Finalize seu pedido antes que o estoque acabe.
                </p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => {
                  setNoticeVisible(false);
                  void trackLeadEvent({
                    event: "cart_notice_dismissed",
                    stage: "carrinho",
                    page: "carrinho",
                  });
                }}
                className="Buttonstyled__Wrapper-sc-1l40qr2-0 htczEW Alert-styled__ButtonClose-sc-7ecd97c0-3 liYsLx"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12.5 13.56 18.94 20 20 18.94l-6.44-6.44L20 6.06 18.94 5l-6.44 6.44L6.06 5 5 6.06l6.44 6.44L5 18.94 6.06 20l6.44-6.44Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div data-testid="product-summary-cart" className="ProductSummaryCart-styled__Wrapper-sc-94cd0c19-0 dnflww">
          <div className="ProductSummaryCartInfo-styled__MainGrid-sc-e115537b-2 iyzbIP">
            <div className="ProductSummaryCartInfo-styled__Products-sc-e115537b-1 epjGLV">
              <div className="ProductInfo-styled__Wrapper-sc-51f3c98b-0 dJwLeT">
                <div className="ProductInfo-styled__ImageBox-sc-51f3c98b-1 kpiChv">
                  <Link href={PRODUCT_HREF}>
                    <Image
                      src={cart.image}
                      alt={cart.title}
                      width={400}
                      height={400}
                      priority
                      className="ProductImage__ProductImageStyled-sc-29956498-0 guxEFA"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </Link>
                </div>

                <div className="ProductInfo-styled__Content-sc-51f3c98b-2 buCdHn">
                  <div className="ProductInfo-styled__WrapperTitle-sc-51f3c98b-3 ilosoJ">
                    <Link href={PRODUCT_HREF} className="Linkstyled__Link-sc-111jz8f-0 ftwZPE ProductInfo-styled__TitleLink-sc-51f3c98b-4 jSSEJb">
                      {cart.title}
                    </Link>
                    <button
                      type="button"
                      aria-label="Remover este item do carrinho"
                      onClick={() => void handleRemoveProduct()}
                      className="Buttonstyled__Wrapper-sc-1l40qr2-0 htczEW ProductSummaryCartInfo-styled__TrashButton-sc-e115537b-10 loLMPf"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.838 3.429h5.108a.72.72 0 0 1 .73.714.72.72 0 0 1-.73.714H3v1.429h1.46v12.857C4.46 20.718 5.768 22 7.377 22h8.757c1.61 0 2.92-1.282 2.92-2.857V6.286H21V4.857h-3.405v14.286c0 .786-.656 1.428-1.46 1.428H7.378c-.803 0-1.46-.642-1.46-1.428V6.286h8.028c1.21 0 2.19-.958 2.19-2.143 0-1.185-.98-2.143-2.19-2.143H8.838v1.429Z"
                          fill="currentColor"
                        />
                        <path d="M8.838 19.143V7.714h1.46v11.429h-1.46ZM13.216 19.143V7.714h1.46v11.429h-1.46Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>

                  <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Quantidade: {cart.quantity}</p>
                  <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Cor: {cart.color}</p>
                  <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Tamanho: {cart.size}</p>
                  <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Estilo: {cart.sku}</p>

                  {cart.personalizationWanted && (
                    <>
                      <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Personalização</p>
                      <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Posição: {cart.personalizationPosition || "Costas"}</p>
                      {cart.personalizationPlayer ? (
                        <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Nome: {cart.personalizationPlayer}</p>
                      ) : (
                        <>
                          {cart.personalizationName ? (
                            <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Nome: {cart.personalizationName}</p>
                          ) : null}
                          {cart.personalizationNumber ? (
                            <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Número: {cart.personalizationNumber}</p>
                          ) : null}
                          {!cart.personalizationName && !cart.personalizationNumber ? (
                            <p className="Typographystyled__Paragraph-sc-bdxvrr-1 hCvUkj ProductInfo-styled__Features-sc-51f3c98b-5 hrKTQY">Personalização: {personalizationSummary || "selecionada"}</p>
                          ) : null}
                        </>
                      )}
                    </>
                  )}

                  <div>
                    <p data-testid="pix-rules-description" className="Typographystyled__Paragraph-sc-bdxvrr-1 dczUub Pix-styled__PixPaymentDescription-sc-3eb2bbf9-0 Pix-styled__PixRulesDescription-sc-3eb2bbf9-5 kExWFs gFYOkt">
                      Este produto não é elegível para o desconto no Pix.
                    </p>
                    <a href="#" className="Linkstyled__Link-sc-111jz8f-0 koQIWd PixDiscountLabel-styled__LinkPix-sc-74f0d95a-1 TpBky">
                      Ver regras.
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="ProductSummaryCartInfo-styled__ColumnWrapper-sc-e115537b-3 dyrMGt">
              <div className="ProductSummaryCartInfo-styled__ProductQuantityWrapper-sc-e115537b-4 wqeIR">
                <button type="button" onClick={() => handleQuantityChange("decrease")} className="Buttonstyled__Wrapper-sc-1l40qr2-0 htczEW ProductSummaryCartInfo-styled__ProductQuantityButton-sc-e115537b-6 bMqWSx">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M6 11.25h12v1.5H6v-1.5Z" fill="currentColor" />
                  </svg>
                </button>
                <div className="ProductSummaryCartInfo-styled__ProductQuantity-sc-e115537b-5 kfuilx">{cart.quantity}</div>
                <button type="button" onClick={() => handleQuantityChange("increase")} className="Buttonstyled__Wrapper-sc-1l40qr2-0 htczEW ProductSummaryCartInfo-styled__ProductQuantityButton-sc-e115537b-6 kFYUMV">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13.25 11.75V5h-1.5v6.75H5v1.5h6.75V20h1.5v-6.75H20v-1.5h-6.75Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="ProductSummaryCartInfo-styled__ColumnWrapper-sc-e115537b-3 dyrMGt">
              <strong className="ProductSummaryCartInfo-styled__TotalPrice-sc-e115537b-9 hMFpmw">{formatCurrency(subtotal)}</strong>
            </div>
          </div>
        </div>

        <div className="px-[22px]">
          <div className="Cart-styled__ShippingCalcWrapper-sc-8dbd32cd-3 ezOeGz">
            <div data-testid="shipping-cart" className="ShippingFreightGuestCheckout-styled__ShippingCart-sc-62b30690-6 iuChhU">
              <h1 className="Typographystyled__Title-sc-bdxvrr-0 kPDEVU Cart-styled__TitleStyled-sc-8dbd32cd-5 eorECh">
                Prazo de entrega
              </h1>

              <form
                className="ShippingFreightGuestCheckout-styled__InputWrapper-sc-62b30690-7 djwivK"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleShippingLookup();
                }}
              >
                <div data-testid="form-control" className="FormControlstyled__FormControlWrapper-sc-tradjv-2 jDtubz">
                  <div className="FormControlstyled__LabelFormWrapper-sc-tradjv-1">
                    <div data-testid="input-wrapper" className="FormControlstyled__BaseInput-sc-tradjv-0 TextInputstyled__InputWrapper-sc-1v2a0jn-0 hSofEg kYEVtK">
                      <input
                        type="text"
                        id="label-input"
                        maxLength={9}
                        data-testid="zipcode-input"
                        aria-label="Insira o cep"
                        placeholder="00000-000"
                        name="zipCode"
                        value={cep}
                        onChange={(event) => setCep(formatCep(event.target.value))}
                        className="TextInputstyled__StyledInput-sc-1v2a0jn-1 kPaxXN"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  aria-label="Calcular"
                  disabled={shippingState.status === "loading"}
                  className="Buttonstyled__Wrapper-sc-1l40qr2-0 dqeddn ShippingFreightGuestCheckout-styled__CalculateButton-sc-62b30690-10 dyYzBy"
                >
                  {shippingState.status === "loading" ? "Calculando" : "Calcular"}
                </button>
              </form>

              <div className="ShippingFreightGuestCheckout-styled__LinkFreigthWrapper-sc-62b30690-8 jmBOQB">
                <a href="#" className="Linkstyled__Link-sc-111jz8f-0 hgCPJy ShippingFreightGuestCheckout-styled__LinkFreigth-sc-62b30690-9 kGOdsD">
                  <p className="Typographystyled__Simple-sc-bdxvrr-5 fSEwAW">Confira a nossa Política de Frete e Entregas.</p>
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  className="Linkstyled__Link-sc-111jz8f-0 hgCPJy ShippingFreightGuestCheckout-styled__LinkFreigth-sc-62b30690-9 kGOdsD"
                >
                  <p className="Typographystyled__Simple-sc-bdxvrr-5 fSEwAW">Não sei o CEP</p>
                </a>
              </div>

              {shippingState.status === "success" && (
                <div className="mt-4 space-y-3">
                  <p className="text-[14px] font-medium leading-6 text-[#111111]">{shippingState.address}</p>
                  {[NORMAL_SHIPPING, EXPRESS_SHIPPING].map((option) => {
                    const selected = selectedShippingId === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => void handleSelectShipping(option)}
                        className={`w-full rounded-[12px] border px-4 py-4 text-left transition-colors ${
                          selected ? "border-[#111111] bg-[#f5f5f5]" : "border-[#d9d9d9] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[15px] font-medium leading-5 text-[#111111]">{option.name}</p>
                            <p className="mt-1 text-[13px] leading-5 text-[#6f6f6f]">{option.eta}</p>
                            <p className="mt-1 text-[12px] leading-5 text-[#6f6f6f]">{option.note}</p>
                          </div>
                          <p className="text-[14px] font-medium leading-5 text-[#111111]">{option.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {shippingState.status === "error" && (
                <p className="mt-4 text-[14px] leading-6 text-[#d30005]">{shippingState.message}</p>
              )}
            </div>
          </div>

          <div className="Cart-styled__CouponWrapper-sc-8dbd32cd-4 hNJUmS">
            <div className="CouponDiscount-styled__Wrapper-sc-172711cf-0 eIiuDL">
              <h1 data-testid="coupon-title" className="Typographystyled__Title-sc-bdxvrr-0 ldZRhW Cart-styled__TitleStyled-sc-8dbd32cd-5 eorECh">
                Cupom de desconto
              </h1>

              <form
                className="CouponDiscount-styled__InputWrapper-sc-172711cf-1 fQoZCU"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleApplyCoupon();
                }}
              >
                <div data-testid="form-control" className="FormControlstyled__FormControlWrapper-sc-tradjv-2 jDtubz">
                  <div className="FormControlstyled__LabelFormWrapper-sc-tradjv-1">
                    <div data-testid="input-wrapper" className="FormControlstyled__BaseInput-sc-tradjv-0 TextInputstyled__InputWrapper-sc-1v2a0jn-0 hSofEg kYEVtK">
                      <input
                        type="text"
                        id="coupon"
                        maxLength={100}
                        data-testid="coupon-input"
                        aria-label="Insira o código do cupom de desconto"
                        placeholder="Digite seu cupom"
                        name="coupon"
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                        className="TextInputstyled__StyledInput-sc-1v2a0jn-1 kPaxXN"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" data-testid="coupon-button" className="Buttonstyled__Wrapper-sc-1l40qr2-0 dqeddn CouponDiscount-styled__CouponButton-sc-172711cf-2 jQOlhG">
                  Aplicar
                </button>
              </form>

              <p className="Typographystyled__Paragraph-sc-bdxvrr-1 gffwRP">
                <span className="Typographystyled__Simple-sc-bdxvrr-5 jKrXkM">Tem um vale-troca ou cartão presente?</span>{" "}
                Você poderá usá-los na etapa de pagamento.
              </p>

              {couponMessage && <p className="mt-3 text-[14px] leading-6 text-[#6f6f6f]">{couponMessage}</p>}
            </div>
          </div>

          <div data-testid="cart-order-summary" className="SummaryCart-styled__OrderSummary-sc-bbaaeb59-0 cIazgP">
            <h1 className="Typographystyled__Title-sc-bdxvrr-0 ldZRhW Cart-styled__TitleStyled-sc-8dbd32cd-5 eorECh">
              Resumo
            </h1>

            <ul className="d_flex flex-d_column gap_sm-plus li-s_none mb_xl-plus!" data-testid="summary-info">
              <li className="d_flex ai_flex-start jc_space-between">
                <p className="d_inline-flex ai_center textStyle_text-small-normal" data-testid="summary-product-value">
                  Valor dos produtos
                </p>
                <p className="d_inline-flex ai_center textStyle_text-small-normal">{formatCurrency(subtotal)}</p>
              </li>
              <li className="d_flex ai_flex-start jc_space-between">
                <p className="d_inline-flex ai_center textStyle_text-small-normal" data-testid="summary-freight">
                  Frete
                </p>
                <p className="d_inline-flex ai_center textStyle_text-small-normal">
                  {shippingState.status === "success"
                    ? shippingOption.price === 0
                      ? "Grátis"
                      : formatCurrency(shippingOption.price)
                    : "A calcular"}
                </p>
              </li>
              <li className="d_flex ai_flex-start jc_space-between">
                <strong className="fs_base fw_medium c_primary" data-testid="summary-payment-total">
                  Total da compra
                </strong>
                <div className="d_flex flex-d_column ai_flex-end fs_small ta_end">
                  <strong className="fs_base fw_medium c_primary">{totalLabel} no Pix</strong>
                  <span className="c_neutral.500">{totalLabel} no cartão</span>
                </div>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => void handleContinue()}
              data-testid="cart-order-button"
              className="Buttonstyled__Wrapper-sc-1l40qr2-0 jmNDeW"
              style={{ marginBottom: 16 }}
            >
              Continuar
            </button>

            <p className="text-[13px] leading-5 text-[#2e6344]">
              Você economiza {formatCurrency(campaignSavingsValue)} nesta campanha.
            </p>
          </div>

          <footer className="d_flex flex-d_column ai_center mx_auto! my_7xl-plus! grid-area_footer w_264px lg:w_100%" data-testid="footer-payments">
            <div className="d_flex jc_center flex-wrap_wrap gap_sm mb_4xl-plus!">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.alt} className="d_grid gap_8px h_40px w_60px place-content_center last:w_90px">
                  <img alt={method.alt} loading="lazy" width={method.width} height={method.height} src={method.src} />
                </div>
              ))}
            </div>

            <button type="button" className="Buttonstyled__Wrapper-sc-1l40qr2-0 KjwXp ProblemReport-styled__ButtonStyled-sc-4d31adaf-0 inlapv">
              Relatar problema
            </button>
          </footer>
        </div>
      </div>
    </main>
  );
}
