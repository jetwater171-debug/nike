"use client";

import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Loader2,
  QrCode,
  X,
} from "lucide-react";
import {
  getLeadSessionId,
  readLeadDraft,
  trackLeadEvent,
} from "@/lib/site-tracking";
import {
  createPixForCurrentSession,
  DEFAULT_CART,
  DEFAULT_PRICE_VALUE,
  persistPixState,
  PIX_UI_EXPIRATION_MS,
  readStoredCartState,
  readStoredPixState,
  type CartState,
  type CheckoutShipping,
  type LeadDraft,
  type PixData,
} from "@/lib/pix-client";

type PixStatusResponse = {
  ok?: boolean;
  status?: string;
  statusRaw?: string;
  paymentCode?: string;
  paymentCodeBase64?: string;
  paymentQrUrl?: string;
};

type PixStatus = "waiting_payment" | "paid" | "refused" | "refunded";

const ORIGINAL_PRICE_VALUE = 749.99;

function NikeSwoosh({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="135.5 361.38 1000 356.39"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}min e ${String(seconds).padStart(2, "0")}s`;
}

function normalizePixStatus(value: string): PixStatus {
  if (value === "paid" || value === "refused" || value === "refunded") {
    return value;
  }
  return "waiting_payment";
}

function parseAddressLine(address: string) {
  const parts = String(address || "")
    .split(/â€¢|•/)
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
    ...parsed,
  };
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

function normalizeQrSource(qrUrl = "", qrBase64 = "") {
  const cleanUrl = String(qrUrl || "").trim();
  if (cleanUrl) return cleanUrl;

  const cleanBase64 = String(qrBase64 || "").trim();
  if (!cleanBase64) return "";
  if (cleanBase64.startsWith("data:image")) return cleanBase64;
  return `data:image/png;base64,${cleanBase64}`;
}

async function copyText(text: string) {
  if (typeof window === "undefined") return;
  const value = String(text || "").trim();
  if (!value) return;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-black/10 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[1rem] font-semibold leading-6">{title}</span>
        <ChevronDown
          className={`h-5 w-5 flex-none text-black/62 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {open && <div className="pb-4 text-[0.92rem] leading-6 text-black/68">{children}</div>}
    </div>
  );
}

export default function PixPage() {
  const qrSectionRef = useRef<HTMLDivElement | null>(null);
  const paidTrackedRef = useRef(false);
  const [lead, setLead] = useState<LeadDraft>({});
  const [cart, setCart] = useState<CartState>(DEFAULT_CART);
  const [shipping, setShipping] = useState<CheckoutShipping>(
    DEFAULT_CART.shipping || {},
  );
  const [pix, setPix] = useState<PixData | null>(null);
  const [qrSource, setQrSource] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [activeAccordion, setActiveAccordion] = useState<"copy" | "qr">("copy");
  const [remainingSeconds, setRemainingSeconds] = useState(60 * 60);
  const [pixStatus, setPixStatus] = useState<PixStatus>("waiting_payment");

  const quantity = useMemo(() => Number(cart.quantity || 1), [cart.quantity]);
  const productPriceValue = useMemo(
    () => Number(cart.priceValue || DEFAULT_PRICE_VALUE),
    [cart.priceValue],
  );
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
  const totalSavingsValue = useMemo(
    () =>
      Number(
        Math.max(ORIGINAL_PRICE_VALUE * quantity - productSubtotalValue, 0).toFixed(2),
      ),
    [productSubtotalValue, quantity],
  );
  const deliveryLabel = useMemo(() => {
    if (shipping.id === "nike-expresso") {
      return "Entrega Nike Expresso - 2 dias uteis";
    }
    return "Entrega normal - 5 dias uteis";
  }, [shipping.id]);

  useEffect(() => {
    const storedLead = readLeadDraft() as LeadDraft;
    const storedCart = readStoredCartState();
    const normalizedShipping = buildShippingFromCart(storedCart.shipping);
    const cachedPix = readStoredPixState();
    const sessionId = getLeadSessionId();

    setLead(storedLead);
    setCart(storedCart);
    setShipping(normalizedShipping);

    if (cachedPix && cachedPix.idTransaction && cachedPix.orderNumber) {
      setPix(cachedPix);
      setPixStatus(normalizePixStatus(String(cachedPix.status || "")));
    }

    void trackLeadEvent({
      event: "pix_view",
      stage: "pix",
      page: "pix",
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
      extra: {
        number: normalizedShipping.number || "",
        complement: normalizedShipping.complement || "",
      },
      shipping: {
        id: normalizedShipping.id || "",
        name: normalizedShipping.name || "",
        price: normalizedShipping.price || 0,
      },
      pix: {
        sessionId,
      },
    });
  }, []);

  useEffect(() => {
    const createdAt = Number(pix?.createdAt || 0);
    if (!createdAt) return;

    const updateCountdown = () => {
      const diff = Math.floor((createdAt + PIX_UI_EXPIRATION_MS - Date.now()) / 1000);
      setRemainingSeconds(Math.max(diff, 0));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [pix?.createdAt]);

  useEffect(() => {
    const source = normalizeQrSource(pix?.paymentQrUrl, pix?.paymentCodeBase64);
    if (source) {
      setQrSource(source);
      return;
    }

    const paymentCode = String(pix?.paymentCode || "").trim();
    if (!paymentCode) {
      setQrSource("");
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(paymentCode, {
      width: 720,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrSource(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrSource("");
      });

    return () => {
      cancelled = true;
    };
  }, [pix?.paymentCode, pix?.paymentCodeBase64, pix?.paymentQrUrl]);

  useEffect(() => {
    const currentPix = pix;
    if (!currentPix?.idTransaction) return;
    if (pixStatus === "paid" || pixStatus === "refused" || pixStatus === "refunded") return;

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const response = await fetch("/api/pix/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            txid: currentPix.idTransaction,
            sessionId: getLeadSessionId(),
          }),
        });

        const data = (await response.json().catch(() => ({}))) as PixStatusResponse;
        if (cancelled || !response.ok) return;

        if (
          String(data.paymentCode || "").trim() ||
          String(data.paymentQrUrl || "").trim() ||
          String(data.paymentCodeBase64 || "").trim()
        ) {
          const nextPix = {
            ...currentPix,
            paymentCode: data.paymentCode || currentPix.paymentCode || "",
            paymentQrUrl: data.paymentQrUrl || currentPix.paymentQrUrl || "",
            paymentCodeBase64: data.paymentCodeBase64 || currentPix.paymentCodeBase64 || "",
            status: data.status || currentPix.status || "waiting_payment",
          };
          setPix(nextPix);
          persistPixState(nextPix);
        }

        if (data.status === "paid" || data.status === "refused" || data.status === "refunded") {
          setPixStatus(normalizePixStatus(String(data.status || "")));
          const terminalPix = {
            ...currentPix,
            status: String(data.status || currentPix.status || "waiting_payment"),
          };
          setPix(terminalPix);
          persistPixState(terminalPix);

          if (data.status === "paid" && !paidTrackedRef.current) {
            paidTrackedRef.current = true;
            void trackLeadEvent({
              event: "pix_paid",
              stage: "pix",
              page: "pix",
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
              pix: {
                txid: currentPix.idTransaction,
                gateway: currentPix.gateway || "",
                status: data.status || "",
                statusRaw: data.statusRaw || "",
              },
            });
          }
        }
      } catch {
        // Ignore polling noise and keep the page alive.
      }
    };

    void pollStatus();
    const interval = window.setInterval(pollStatus, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    lead.cpf,
    lead.email,
    lead.name,
    lead.phone,
    pix,
    pixStatus,
    shipping.cep,
    shipping.city,
    shipping.complement,
    shipping.id,
    shipping.name,
    shipping.neighborhood,
    shipping.number,
    shipping.price,
    shipping.state,
    shipping.street,
    totalPriceValue,
  ]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        setIsLoading(true);
        const nextPix = await createPixForCurrentSession({
          sourceUrl: window.location.href,
          sourceStage: "checkout_pagamento",
        });
        setPix(nextPix);
        setPixStatus(normalizePixStatus(String(nextPix.status || "")));
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Nao foi possivel gerar o Pix agora.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  const handleCopyPix = async () => {
    const code = String(pix?.paymentCode || "").trim();
    if (!code) return;

    try {
      await copyText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
      await trackLeadEvent({
        event: "pix_code_copied",
        stage: "pix",
        page: "pix",
        amount: totalPriceValue,
        pix: {
          txid: pix?.idTransaction || "",
          gateway: pix?.gateway || "",
        },
      });
    } catch {
      setCopyState("idle");
    }
  };

  const handleShowQr = () => {
    setActiveAccordion("qr");
    void trackLeadEvent({
      event: "pix_qr_opened",
      stage: "pix",
      page: "pix",
      amount: totalPriceValue,
      pix: {
        txid: pix?.idTransaction || "",
        gateway: pix?.gateway || "",
      },
    });
    window.setTimeout(() => {
      qrSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-[62px] w-full max-w-[1180px] items-center justify-between px-5 md:px-8">
          <div aria-hidden="true" className="h-10 w-10" />

          <NikeSwoosh className="h-5 w-auto text-black" />

          <Link
            href="/checkout/pagamento"
            aria-label="Fechar"
            className="inline-flex h-10 w-10 items-center justify-center text-black transition-colors duration-200 hover:bg-black/[0.04]"
          >
            <X className="h-5 w-5" strokeWidth={1.9} />
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[42rem] px-4 pb-12 pt-0 sm:px-5">
        <section className="border-b border-black/10 py-6">
          <h1 className="max-w-[27rem] text-[1.82rem] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[1.92rem]">
            Pague com Pix para garantir sua compra
          </h1>

          <p className="mt-6 text-[0.92rem] text-black/62">
            Numero do pedido:{" "}
            <span className="font-semibold text-black">
              {pix?.orderNumber || "000000000"}
            </span>
          </p>

          <div className="mt-7 text-center">
            <p className="text-[0.94rem] leading-6">O codigo Pix expira em:</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ff5a18] px-3.5 py-2 text-[0.98rem] font-medium text-[#ff5a18]">
              <Clock3 className="h-4 w-4" strokeWidth={2} />
              <span>
                {remainingSeconds > 0 ? formatCountdown(remainingSeconds) : "expirado"}
              </span>
            </div>
            <p className="mt-4 text-[0.9rem] leading-6 text-black/52">
              A confirmacao do pagamento sera por e-mail.
            </p>
          </div>

          {pixStatus === "paid" && (
            <div className="mt-6 rounded-[12px] border border-[#cde8d7] bg-[#f2fbf5] px-4 py-3.5 text-[#185233]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#0f6a3f]" strokeWidth={2.2} />
                <div>
                  <p className="text-[0.94rem] font-semibold text-[#0f6a3f]">
                    Pagamento confirmado
                  </p>
                  <p className="mt-1 text-[0.9rem] leading-6">
                    Seu Pix foi identificado. Agora sua compra segue para a proxima etapa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(pixStatus === "refused" || pixStatus === "refunded") && (
            <div className="mt-6 rounded-[12px] border border-[#f0d0d0] bg-[#fff4f4] px-4 py-3.5 text-[#7d1f1f]">
              <p className="text-[0.94rem] font-semibold">
                Esse Pix nao esta mais ativo.
              </p>
              <p className="mt-1 text-[0.9rem] leading-6">
                Volte uma etapa e gere um novo pagamento para concluir a compra.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-[12px] border border-[#f0d0d0] bg-[#fff4f4] px-4 py-3.5 text-[#7d1f1f]">
              <p className="text-[0.88rem] leading-6">{error}</p>
            </div>
          )}

          <div className="mt-7 rounded-[12px] border border-black/10 bg-[#f3f3f3] p-2.5">
            <div className="min-h-[5rem] break-all rounded-[10px] border border-black/8 bg-white px-4 py-3 text-[0.86rem] leading-6 text-black/62">
              {isLoading && !pix?.paymentCode ? (
                <div className="flex min-h-[4rem] items-center gap-3 text-black/46">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  <span>Gerando seu codigo Pix...</span>
                </div>
              ) : (
                pix?.paymentCode || "Seu codigo Pix vai aparecer aqui."
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyPix()}
            disabled={!pix?.paymentCode}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-[0.95rem] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copyState === "copied" ? "Codigo Pix copiado" : "Copiar codigo Pix"}
            <Copy className="h-4 w-4" strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={handleShowQr}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-black px-6 text-[0.95rem] font-medium text-black"
          >
            Pagar com QR Code
            <QrCode className="h-4 w-4" strokeWidth={2} />
          </button>

          <p className="mt-7 text-center text-[1.24rem] font-semibold leading-none">
            Total da compra: {formatCurrency(totalPriceValue)}
          </p>
        </section>

        <section className="py-2" ref={qrSectionRef}>
          <Accordion
            title="Como pagar com Pix copia e cola?"
            open={activeAccordion === "copy"}
            onToggle={() =>
              setActiveAccordion((current) => (current === "copy" ? "qr" : "copy"))
            }
          >
            <ol className="space-y-2">
              <li>1. Toque em <strong>Copiar codigo Pix</strong>.</li>
              <li>2. Abra o app do seu banco e entre na area Pix copia e cola.</li>
              <li>3. Cole o codigo, confira o valor e finalize o pagamento.</li>
            </ol>
          </Accordion>

          <Accordion
            title="Pagar com QR Code"
            open={activeAccordion === "qr"}
            onToggle={() =>
              setActiveAccordion((current) => (current === "qr" ? "copy" : "qr"))
            }
          >
            <div className="rounded-[12px] border border-black/10 bg-[#f8f8f8] p-4">
              {qrSource ? (
                <div className="mx-auto flex w-full max-w-[15rem] items-center justify-center rounded-[12px] bg-white p-4 shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSource}
                    alt="QR Code Pix"
                    className="h-auto w-full"
                  />
                </div>
              ) : (
                <div className="flex min-h-[16rem] items-center justify-center rounded-[12px] border border-dashed border-black/14 bg-white px-5 text-center text-[0.9rem] leading-6 text-black/48">
                  O QR Code ainda esta sendo preparado. Enquanto isso, voce ja pode pagar com o codigo copia e cola acima.
                </div>
              )}

              <p className="mt-4 text-center text-[0.88rem] leading-6 text-black/58">
                Escaneie com o banco ou app de pagamento e conclua o Pix com o mesmo valor da oferta reservada.
              </p>
            </div>
          </Accordion>
        </section>

        <section className="border-b border-black/10 py-7">
          <h2 className="text-[1.58rem] font-medium leading-none">Resumo da compra</h2>

          <div className="mt-6 space-y-3.5 text-[0.94rem]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-black/72">Valor dos produtos</span>
              <span>{formatCurrency(productSubtotalValue)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-black/72">Frete</span>
              <span className={shippingPriceValue === 0 ? "font-medium text-[#0f6a3f]" : ""}>
                {shippingPriceValue === 0 ? "Gratis" : formatCurrency(shippingPriceValue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="text-[1.16rem] font-semibold leading-none">
                Total da compra
              </span>
              <span className="text-[1.16rem] font-semibold leading-none">
                {formatCurrency(totalPriceValue)}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-[12px] border border-[#cde8d7] bg-[#f2fbf5] px-4 py-3.5 text-[#185233]">
            <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-[#0f6a3f]">
              Cupom aplicado
            </p>
            <p className="mt-2 text-[0.9rem] leading-6">
              Voce esta economizando {formatCurrency(totalSavingsValue)} com o valor da campanha.
            </p>
          </div>
        </section>

        <section className="border-b border-black/10 py-7">
          <h2 className="text-[1.58rem] font-medium leading-none">Endereco de entrega</h2>

          <div className="mt-5 text-[0.92rem] leading-7 text-black/72">
            <p className="font-medium text-black">{lead.name || "-"}</p>
            <p>
              {[shipping.street, shipping.number].filter(Boolean).join(", ") || "-"}
            </p>
            {shipping.neighborhood && <p>Bairro {shipping.neighborhood}</p>}
            {shipping.complement && <p>Complemento {shipping.complement}</p>}
            <p>{[shipping.city, shipping.state].filter(Boolean).join(" - ") || "-"}</p>
            {shipping.cep && <p>CEP {shipping.cep}</p>}
            <p className="mt-3 font-medium text-[#0f6a3f]">{deliveryLabel}</p>
            <p className="mt-2 max-w-[31rem] leading-6 text-black/54">
              O prazo de entrega sera contado a partir do primeiro dia util apos a confirmacao do pagamento.
            </p>
          </div>
        </section>

        <section className="py-7">
          <h2 className="text-[1.58rem] font-medium leading-none">Itens do carrinho</h2>

          <div className="mt-5 flex items-start gap-4">
            <div className="overflow-hidden bg-[#f3f3f3]">
              <Image
                src={cart.image || DEFAULT_CART.image || ""}
                alt={cart.title || DEFAULT_CART.title || "Camisa Nike"}
                width={84}
                height={84}
                className="h-[84px] w-[84px] object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[0.96rem] font-semibold leading-6">
                {cart.title || DEFAULT_CART.title}
              </p>

              <div className="mt-2.5 space-y-0.5 text-[0.9rem] leading-6 text-black/72">
                <p>Quantidade: {quantity}</p>
                <p>Cor: {cart.color || DEFAULT_CART.color}</p>
                <p>Tamanho: {cart.size || DEFAULT_CART.size}</p>
                <p>Estilo: {cart.sku || DEFAULT_CART.sku}</p>
                {cart.personalizationWanted && (
                  <p>
                    Personalizacao:{" "}
                    {personalizationSummary || "selecionada"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
