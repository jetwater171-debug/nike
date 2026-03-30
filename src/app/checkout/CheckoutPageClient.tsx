"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Truck, X } from "lucide-react";
import NikeCheckoutHeader from "../components/NikeCheckoutHeader";
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
  priceValue?: number;
  shipping?: CheckoutShipping;
};

type CheckoutStepsProps = {
  activeStep: 1 | 2 | 3;
};

const CART_STORAGE_KEY = "nikepromo.cartState";
const ORIGINAL_PRICE_VALUE = 749.99;
const DEFAULT_OFFER_PRICE_VALUE = 139.19;
const NORMAL_SHIPPING = {
  id: "normal",
  name: "Normal",
  eta: "5 dias uteis",
  price: 0,
  label: "Frete Gratis",
  note: "Cupom de frete gratis aplicado",
};
const EXPRESS_SHIPPING = {
  id: "nike-expresso",
  name: "Nike Expresso",
  eta: "2 dias uteis",
  price: 18.71,
  label: "R$ 18,71",
  note: "Entrega mais rapida da Nike",
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

function readStoredCartState(): CartState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartState) : {};
  } catch {
    return {};
  }
}

function persistStoredCartState(next: CartState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage restrictions.
  }
}

function parseAddressLine(address: string) {
  const parts = String(address || "")
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
  const shippingId =
    base.id === EXPRESS_SHIPPING.id ? EXPRESS_SHIPPING.id : NORMAL_SHIPPING.id;
  const option =
    shippingId === EXPRESS_SHIPPING.id ? EXPRESS_SHIPPING : NORMAL_SHIPPING;

  return {
    ...base,
    ...parsed,
    id: shippingId,
    name: base.name || option.name,
    eta: base.eta || option.eta,
    price: Number.isFinite(Number(base.price)) ? Number(base.price) : option.price,
    couponApplied:
      typeof base.couponApplied === "boolean"
        ? base.couponApplied
        : shippingId === NORMAL_SHIPPING.id,
  };
}

function CheckoutSteps({ activeStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, label: "Carrinho" },
    { number: 2, label: "Identificacao" },
    { number: 3, label: "Pagamento" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#ececec]">
      <div className="flex">
        {steps.map((step, index) => {
          const isActive = step.number === activeStep;

          return (
            <div
              key={step.label}
              className={`relative flex min-h-12 flex-1 items-center justify-center gap-2 px-3 text-[0.84rem] font-semibold ${
                isActive ? "bg-white text-black" : "bg-[#e7e7e7] text-[#757575]"
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
                    isActive ? "bg-white" : "bg-[#e7e7e7]"
                  }`}
                  style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
                />
              )}
              <span
                className={`relative z-10 inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.68rem] ${
                  isActive ? "bg-black text-white" : "bg-[#8d8d8d] text-white"
                }`}
              >
                {step.number}
              </span>
              <span className="relative z-10 whitespace-nowrap">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type AddressModalProps = {
  initialShipping: CheckoutShipping;
  onClose: () => void;
  onSave: (shipping: CheckoutShipping) => void;
};

function AddressModal({
  initialShipping,
  onClose,
  onSave,
}: AddressModalProps) {
  const [cep, setCep] = useState(initialShipping.cep || "");
  const [street, setStreet] = useState(initialShipping.street || "");
  const [number, setNumber] = useState(initialShipping.number || "");
  const [complement, setComplement] = useState(initialShipping.complement || "");
  const [addressHint, setAddressHint] = useState(
    [initialShipping.neighborhood, initialShipping.city && initialShipping.state
      ? `${initialShipping.city}/${initialShipping.state}`
      : initialShipping.city || initialShipping.state]
      .filter(Boolean)
      .join(" • "),
  );
  const [lookupState, setLookupState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleCepLookup = async () => {
    const sanitizedCep = cep.replace(/\D/g, "");

    if (sanitizedCep.length !== 8) {
      setLookupState("error");
      setMessage("Digite um CEP valido com 8 numeros.");
      return;
    }

    setLookupState("loading");
    setMessage("Buscando o endereco desse CEP...");

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
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        throw new Error("cep_not_found");
      }

      setStreet(data.logradouro || "");
      setAddressHint(
        [data.bairro, data.localidade && data.uf ? `${data.localidade}/${data.uf}` : data.localidade || data.uf]
          .filter(Boolean)
          .join(" • "),
      );
      setLookupState("success");
      setMessage("Endereco encontrado. Agora preencha numero e complemento.");
    } catch {
      setLookupState("error");
      setMessage("Nao foi possivel encontrar esse CEP agora.");
    }
  };

  const handleSave = () => {
    if (!street.trim() || !number.trim()) {
      setLookupState("error");
      setMessage("Preencha o CEP e o numero para continuar.");
      return;
    }

    const [neighborhood = "", location = ""] = addressHint
      .split("•")
      .map((part) => part.trim());
    const [city = "", state = ""] = location.split("/").map((part) => part.trim());

    onSave({
      ...initialShipping,
      cep: formatCep(cep),
      street: street.trim(),
      neighborhood,
      city,
      state,
      number: number.trim(),
      complement: complement.trim(),
      address: [street.trim(), neighborhood, city && state ? `${city}/${state}` : city || state]
        .filter(Boolean)
        .join(" • "),
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/52 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-[38rem] rounded-t-[2rem] bg-white px-5 pb-6 pt-5 text-black sm:rounded-[2rem] sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[1.9rem] font-semibold">Cadastrar endereco</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-black/72 transition-colors hover:bg-black/[0.04]"
          >
            <X className="h-5 w-5" strokeWidth={1.9} />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="mb-2 block text-[0.95rem] text-black/82">CEP</label>
            <div className="flex overflow-hidden rounded-2xl border border-black/16">
              <input
                type="text"
                value={cep}
                onChange={(event) => setCep(formatCep(event.target.value))}
                placeholder="00000-000"
                inputMode="numeric"
                className="h-14 min-w-0 flex-1 border-0 px-5 text-[1rem] text-black outline-none placeholder:text-black/40"
              />
              <button
                type="button"
                onClick={handleCepLookup}
                className="m-1 inline-flex min-w-[7rem] items-center justify-center gap-2 rounded-full border border-black/18 px-4 text-[0.98rem] font-medium text-black"
              >
                <Search className="h-4 w-4" strokeWidth={2} />
                Buscar
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[0.95rem] text-black/82">Endereco</label>
            <input
              type="text"
              value={street}
              readOnly
              placeholder="O endereco vai aparecer aqui"
              className="h-14 w-full rounded-2xl border border-black/12 bg-[#f5f5f5] px-5 text-[1rem] text-black/72 outline-none placeholder:text-black/34"
            />
            {addressHint && (
              <p className="mt-2 text-[0.92rem] text-black/56">{addressHint}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[0.95rem] text-black/82">Numero</label>
              <input
                type="text"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="402"
                className="h-14 w-full rounded-2xl border border-black/16 px-4 text-[1rem] text-black outline-none placeholder:text-black/34"
              />
            </div>

            <div>
              <label className="mb-2 block text-[0.95rem] text-black/82">Complemento</label>
              <input
                type="text"
                value={complement}
                onChange={(event) => setComplement(event.target.value)}
                placeholder="Apto 31"
                className="h-14 w-full rounded-2xl border border-black/16 px-4 text-[1rem] text-black outline-none placeholder:text-black/34"
              />
            </div>
          </div>

          {message && (
            <p
              className={`rounded-2xl px-4 py-3 text-[0.95rem] leading-6 ${
                lookupState === "error"
                  ? "bg-[#fff4f4] text-[#a11d1d]"
                  : "bg-[#f4f7f7] text-black/66"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-[1rem] font-medium text-white"
        >
          Salvar endereco
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const [lead, setLead] = useState<LeadDraft>({});
  const [cart, setCart] = useState<CartState>({});
  const [shipping, setShipping] = useState<CheckoutShipping>({});
  const [selectedShippingId, setSelectedShippingId] = useState(
    NORMAL_SHIPPING.id,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");

  useEffect(() => {
    setLead(readLeadDraft() as LeadDraft);
    const storedCart = readStoredCartState();
    const normalizedShipping = buildShippingFromCart(storedCart.shipping);

    setCart(storedCart);
    setShipping(normalizedShipping);
    setSelectedShippingId(
      normalizedShipping.id === EXPRESS_SHIPPING.id
        ? EXPRESS_SHIPPING.id
        : NORMAL_SHIPPING.id,
    );
    setNumber(normalizedShipping.number || "");
    setComplement(normalizedShipping.complement || "");

    void trackLeadEvent({
      event: "checkout_identification_view",
      stage: "checkout",
      page: "checkout",
      amount: Number(storedCart.priceValue || 0) || undefined,
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

  useEffect(() => {
    if (!cart || !Object.keys(cart).length) {
      return;
    }

    persistStoredCartState({
      ...cart,
      shipping,
    });
  }, [cart, shipping]);

  const shippingOption = useMemo(
    () =>
      selectedShippingId === EXPRESS_SHIPPING.id
        ? EXPRESS_SHIPPING
        : NORMAL_SHIPPING,
    [selectedShippingId],
  );
  const productPriceValue = useMemo(
    () => Number(cart.priceValue || DEFAULT_OFFER_PRICE_VALUE),
    [cart.priceValue],
  );
  const campaignSavingsValue = useMemo(
    () =>
      Number(
        Math.max(ORIGINAL_PRICE_VALUE - productPriceValue, 0).toFixed(2),
      ),
    [productPriceValue],
  );

  const addressReady = Boolean(shipping.street && shipping.cep);
  const fullAddressLine = [
    shipping.street,
    shipping.number || number,
    shipping.complement || complement,
  ]
    .filter(Boolean)
    .join(" - ");
  const locationLine = [shipping.neighborhood, shipping.city, shipping.state]
    .filter(Boolean)
    .join(", ");

  const handleSaveAddress = async (nextShipping: CheckoutShipping) => {
    const option =
      selectedShippingId === EXPRESS_SHIPPING.id ? EXPRESS_SHIPPING : NORMAL_SHIPPING;
    const merged = {
      ...shipping,
      ...nextShipping,
      id: option.id,
      name: option.name,
      eta: option.eta,
      price: option.price,
      couponApplied: option.id === NORMAL_SHIPPING.id,
    };

    setShipping(merged);
    setNumber(merged.number || "");
    setComplement(merged.complement || "");
    setIsAddressModalOpen(false);

    await trackLeadEvent({
      event: "checkout_address_saved",
      stage: "checkout",
      page: "checkout",
      address: {
        cep: merged.cep || "",
        street: merged.street || "",
        neighborhood: merged.neighborhood || "",
        city: merged.city || "",
        state: merged.state || "",
      },
      extra: {
        number: merged.number || "",
        complement: merged.complement || "",
      },
      shipping: {
        id: merged.id || "",
        name: merged.name || "",
        price: merged.price || 0,
      },
    });
  };

  const handleInlineAddressSave = async () => {
    if (!addressReady || !number.trim()) {
      setIsAddressModalOpen(true);
      return;
    }

    const merged = {
      ...shipping,
      number: number.trim(),
      complement: complement.trim(),
    };
    setShipping(merged);

    await trackLeadEvent({
      event: "checkout_address_completed",
      stage: "checkout",
      page: "checkout",
      address: {
        cep: merged.cep || "",
        street: merged.street || "",
        neighborhood: merged.neighborhood || "",
        city: merged.city || "",
        state: merged.state || "",
      },
      extra: {
        number: merged.number || "",
        complement: merged.complement || "",
      },
      shipping: {
        id: merged.id || "",
        name: merged.name || "",
        price: merged.price || 0,
      },
    });
  };

  const handleSelectShipping = async (
    option: typeof NORMAL_SHIPPING | typeof EXPRESS_SHIPPING,
  ) => {
    setSelectedShippingId(option.id);
    const nextShipping = {
      ...shipping,
      id: option.id,
      name: option.name,
      eta: option.eta,
      price: option.price,
      couponApplied: option.id === NORMAL_SHIPPING.id,
    };
    setShipping(nextShipping);

    await trackLeadEvent({
      event: "checkout_shipping_selected",
      stage: "checkout",
      page: "checkout",
      shipping: {
        id: option.id,
        name: option.name,
        price: option.price,
      },
      extra: {
        eta: option.eta,
      },
    });
  };

  const handleContinue = async () => {
    const finalNumber = shipping.number || number;
    const finalComplement = shipping.complement || complement;

    if (!addressReady || !String(finalNumber || "").trim()) {
      setIsAddressModalOpen(true);
      return;
    }

    const nextShipping = {
      ...shipping,
      id: shippingOption.id,
      name: shippingOption.name,
      eta: shippingOption.eta,
      price: shippingOption.price,
      couponApplied: shippingOption.id === NORMAL_SHIPPING.id,
      number: String(finalNumber || "").trim(),
      complement: String(finalComplement || "").trim(),
    };
    setShipping(nextShipping);

    await trackLeadEvent({
      event: "checkout_continue",
      stage: "checkout",
      page: "checkout",
      amount: Number(cart.priceValue || 0) + shippingOption.price,
      personal: {
        name: lead.name || "",
        cpf: lead.cpf || "",
        email: lead.email || "",
        phone: lead.phone || "",
      },
      address: {
        cep: nextShipping.cep || "",
        street: nextShipping.street || "",
        neighborhood: nextShipping.neighborhood || "",
        city: nextShipping.city || "",
        state: nextShipping.state || "",
      },
      extra: {
        number: nextShipping.number || "",
        complement: nextShipping.complement || "",
      },
      shipping: {
        id: nextShipping.id || "",
        name: nextShipping.name || "",
        price: nextShipping.price || 0,
      },
    });

    router.push("/pagamento");
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <NikeCheckoutHeader backHref="/carrinho" />

      <div className="mx-auto w-full max-w-[38rem] px-4 pb-10 pt-20">
        <CheckoutSteps activeStep={2} />

        <section className="border-b border-black/10 py-8">
          <h1 className="text-[2.35rem] font-semibold leading-none">
            Identificacao
          </h1>

          <div className="mt-6 rounded-[1.8rem] border border-[#cde8d7] bg-[#f2fbf5] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex min-h-8 items-center rounded-full bg-[#daf2e3] px-3 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#0f6a3f]">
                Cupom aplicado
              </span>
              <span className="text-[0.95rem] font-semibold text-[#0f6a3f]">
                Economia de {formatCurrency(campaignSavingsValue)}
              </span>
            </div>

            <p className="mt-4 text-[1rem] leading-6 text-[#185233]">
              Voce esta usando o desconto que ganhou na campanha da camisa.
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-[1.05rem] font-medium text-black/42 line-through">
                {formatCurrency(ORIGINAL_PRICE_VALUE)}
              </span>
              <span className="text-[2rem] font-semibold leading-none text-[#0f6a3f]">
                {formatCurrency(productPriceValue)}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-[0.96rem] text-black/56">Nome</p>
              <p className="mt-1 text-[1.08rem] font-medium text-black">
                {lead.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-[0.96rem] text-black/56">CPF</p>
              <p className="mt-1 text-[1.08rem] font-medium text-black">
                {lead.cpf || "-"}
              </p>
            </div>

            <div>
              <p className="text-[0.96rem] text-black/56">Email</p>
              <p className="mt-1 text-[1.08rem] font-medium text-black">
                {lead.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-[0.96rem] text-black/56">Telefone</p>
              <p className="mt-1 text-[1.08rem] font-medium text-black">
                {lead.phone || "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-black/10 py-8">
          <h2 className="text-[2.2rem] font-semibold leading-none">
            Endereco de entrega
          </h2>

          {addressReady ? (
            <div className="mt-6 rounded-[1.8rem] border border-black/10 bg-[#fafafa] p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-black/18">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={2.1} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[1.08rem] font-semibold">Endereco de Entrega</p>
                  <p className="mt-2 text-[1rem] leading-7">
                    {fullAddressLine || shipping.street}
                  </p>
                  {locationLine && (
                    <p className="text-[1rem] leading-7 text-black/74">
                      {locationLine}
                    </p>
                  )}
                  {shipping.cep && (
                    <p className="mt-1 text-[0.96rem] text-black/56">
                      CEP {shipping.cep}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="mt-3 inline-flex text-[0.98rem] font-medium underline underline-offset-4"
                  >
                    Editar endereco
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[0.92rem] text-black/62">
                    Numero
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    placeholder="402"
                    className="h-14 w-full rounded-2xl border border-black/14 px-4 text-[1rem] text-black outline-none placeholder:text-black/34"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.92rem] text-black/62">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(event) => setComplement(event.target.value)}
                    placeholder="Apto 31"
                    className="h-14 w-full rounded-2xl border border-black/14 px-4 text-[1rem] text-black outline-none placeholder:text-black/34"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleInlineAddressSave()}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-black/18 px-5 text-[0.98rem] font-medium text-black"
              >
                Salvar endereco
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-full border border-black/20 px-6 text-[1rem] font-medium text-black"
            >
              Cadastrar endereco
            </button>
          )}
        </section>

        <section className="py-8">
          <h2 className="text-[2.2rem] font-semibold leading-none">
            Escolha o tipo de entrega
          </h2>

          <div className="mt-6 rounded-[1.8rem] border border-black/10 p-4">
            <p className="px-2 text-[1rem] font-semibold">Entrega 1 de 1</p>

            <div className="mt-4 grid gap-3">
              {[NORMAL_SHIPPING, EXPRESS_SHIPPING].map((option) => {
                const isSelected = selectedShippingId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => void handleSelectShipping(option)}
                    className={`flex items-start gap-4 rounded-[1.4rem] border px-4 py-4 text-left transition-colors ${
                      isSelected
                        ? "border-black bg-[#f7f7f7]"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    <span
                      className={`mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border ${
                        isSelected ? "border-black" : "border-black/24"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isSelected ? "bg-black" : "bg-transparent"
                        }`}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[1.08rem] font-semibold">
                            {option.name} - {option.label}
                          </p>
                          <p className="mt-1 text-[0.98rem] text-black/64">
                            {option.eta}
                          </p>
                        </div>
                        <Truck className="h-5 w-5 flex-none text-black/72" strokeWidth={1.9} />
                      </div>
                      <p className="mt-1.5 text-[0.92rem] text-black/54">
                        {option.note}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-[#cde8d7] bg-[#f2fbf5] px-4 py-4 text-[#185233]">
            <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[#0f6a3f]">
              Oferta ativa
            </p>
            <p className="mt-2 text-[1rem] leading-6">
              Voce continua economizando {formatCurrency(campaignSavingsValue)} com o valor reservado da campanha.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleContinue()}
            className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-black px-6 text-[1rem] font-medium text-white"
          >
            Continuar
          </button>
        </section>
      </div>

      {isAddressModalOpen && (
        <AddressModal
          initialShipping={shipping}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={(nextShipping) => void handleSaveAddress(nextShipping)}
        />
      )}
    </main>
  );
}
