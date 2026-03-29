"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Truck, Ticket, Copy, Check, RotateCcw } from "lucide-react";

type CellState = "hidden" | "empty" | "shipping" | "coupon";
type ModalState = "progress" | "success" | null;

const COUPON_CODE = "JORDAN15";

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

function createHiddenGrid() {
  return Array(16).fill("hidden") as CellState[];
}

export default function PromoGame() {
  const [grid, setGrid] = useState<CellState[]>(createHiddenGrid);
  const [clicks, setClicks] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);
  const progressModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearProgressModalTimeout = () => {
    if (progressModalTimeoutRef.current) {
      clearTimeout(progressModalTimeoutRef.current);
      progressModalTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearProgressModalTimeout();
  }, []);

  const closeActiveModal = () => {
    setActiveModal(null);
  };

  const startGame = () => {
    clearProgressModalTimeout();
    setGrid(createHiddenGrid());
    setClicks(0);
    setGameStarted(true);
    setGameOver(false);
    setCopied(false);
    setActiveModal(null);
    setIsResolvingTurn(false);
  };

  const handleCellClick = (index: number) => {
    if (
      grid[index] !== "hidden" ||
      !gameStarted ||
      gameOver ||
      activeModal !== null ||
      isResolvingTurn
    ) {
      return;
    }

    const newClicks = clicks + 1;
    let prize: CellState = "empty";

    if (newClicks === 1) {
      prize = "empty";
    } else if (newClicks === 2) {
      prize = "shipping";
    } else if (newClicks === 3) {
      prize = "empty";
    } else if (newClicks === 4) {
      prize = "coupon";
    }

    const nextGrid = [...grid];
    nextGrid[index] = prize;
    setGrid(nextGrid);
    setClicks(newClicks);

    if (prize === "shipping") {
      setIsResolvingTurn(true);
      clearProgressModalTimeout();
      progressModalTimeoutRef.current = setTimeout(() => {
        setIsResolvingTurn(false);
        setActiveModal("progress");
        progressModalTimeoutRef.current = null;
      }, 650);
      return;
    }

    if (prize === "coupon") {
      setGameOver(true);
      setActiveModal("success");
    }
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canInteract = (cell: CellState) =>
    gameStarted &&
    cell === "hidden" &&
    !gameOver &&
    activeModal === null &&
    !isResolvingTurn;

  return (
    <section
      id="promo"
      className="section-shell relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <h2 className="font-hero mb-4 text-[2rem] text-white sm:text-[3.6rem]">
            Promocao Mines Nike
          </h2>
          <p className="text-[0.98rem] font-light leading-relaxed text-white/70">
            Essa e uma promocao da Nike para testar a sua sorte e concorrer a
            descontassos na nova camisa da Selecao Brasileira. Ao longo da
            rodada, algumas tentativas nao liberam nada e outras escondem
            premios da campanha. Para sair com vantagem, voce precisa acertar 2
            premios.
          </p>
        </div>

        <div className="liquid-panel relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

          {!gameStarted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
              <div className="absolute inset-0 rounded-[inherit] bg-[rgba(3,3,3,0.97)] backdrop-blur-xl" />
              <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(3,3,3,0.16)_36%,rgba(3,3,3,0.84)_100%)]" />
              <div className="promo-pop relative z-10 flex max-w-md flex-col items-center text-center">
                <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/[0.42]">
                  Rodada travada
                </p>
                <h3 className="font-hero mt-4 text-[1.7rem] text-white sm:text-[2.3rem]">
                  Assuma o risco
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/[0.66]">
                  Toque no botao para liberar o tabuleiro e comecar a sua
                  tentativa. A rodada mistura casas vazias e premios escondidos
                  na campanha.
                </p>

                <button
                  type="button"
                  onClick={startGame}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
                >
                  Assumir o risco
                </button>
              </div>
            </div>
          )}

          <div
            className={`relative z-10 mx-auto grid w-full max-w-[344px] grid-cols-4 gap-3.5 transition-[opacity,filter] duration-300 sm:max-w-[420px] sm:gap-[1.125rem] ${
              gameStarted ? "opacity-100 blur-0" : "opacity-[0.18] blur-[1.6px]"
            }`}
          >
            {grid.map((cell, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCellClick(index)}
                disabled={!canInteract(cell)}
                className={`relative aspect-square w-full rounded-2xl perspective-1000 sm:rounded-[1.25rem] ${
                  canInteract(cell)
                    ? "transition-transform duration-200 hover:scale-[1.035] active:scale-[0.97]"
                    : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="promo-cell-inner absolute inset-0 h-full w-full"
                  style={{
                    transformStyle: "preserve-3d",
                    transform:
                      cell === "hidden" ? "rotateY(0deg)" : "rotateY(180deg)",
                  }}
                >
                  <div className="backface-hidden absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-inner sm:rounded-[1.25rem]">
                    <div className="absolute inset-x-2 top-2 h-8 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-lg" />
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.24] to-transparent" />
                  </div>

                  <div
                    className={`backface-hidden absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] sm:rounded-[1.25rem] ${
                      cell === "empty"
                        ? "overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),rgba(255,255,255,0.025)_48%,rgba(255,255,255,0.02)_100%)] text-white/20"
                        : cell === "shipping"
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : cell === "coupon"
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                        : ""
                    }`}
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    {cell === "empty" && (
                      <div className="promo-enter relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-2 text-center">
                        <div
                          aria-hidden="true"
                          className="promo-empty-glow absolute inset-x-2 top-2 h-10 rounded-full bg-[radial-gradient(circle,rgba(143,228,211,0.18),transparent_72%)] blur-xl"
                        />
                        <div
                          aria-hidden="true"
                          className="promo-empty-sheen absolute inset-y-0 left-[-60%] w-[55%] skew-x-[-24deg] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent blur-[2px]"
                        />
                        <div className="promo-empty-float relative flex flex-col items-center">
                          <NikeSwoosh className="h-3 w-auto text-white/80 drop-shadow-[0_0_16px_rgba(255,255,255,0.16)] sm:h-4" />
                          <span className="promo-empty-label mt-1.5 text-[0.42rem] uppercase tracking-[0.2em] text-white/[0.58] sm:text-[0.5rem]">
                            Sem premiacao
                          </span>
                        </div>
                      </div>
                    )}

                    {cell === "shipping" && (
                      <div className="promo-enter flex flex-col items-center justify-center">
                        <Truck className="h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-blue-200/80 sm:text-[0.5rem]">
                          Frete
                        </span>
                      </div>
                    )}

                    {cell === "coupon" && (
                      <div className="promo-enter flex flex-col items-center justify-center">
                        <Ticket className="h-7 w-7 sm:h-9 sm:w-9" />
                        <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-emerald-200/80 sm:text-[0.5rem]">
                          Cupom
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            .perspective-1000 { perspective: 1000px; }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            .promo-cell-inner { transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1); }
            .promo-enter { animation: promoPopIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            .promo-fade { animation: promoFadeIn 260ms ease-out both; }
            .promo-pop { animation: promoDialogIn 460ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            .promo-empty-glow { animation: promoPulse 3.2s ease-in-out infinite; }
            .promo-empty-sheen { animation: promoSweep 2.6s ease-in-out infinite; }
            .promo-empty-float { animation: promoFloat 3s ease-in-out infinite; }
            .promo-empty-label { animation: promoLabel 2.8s ease-in-out infinite; }
            @keyframes promoPopIn {
              from { opacity: 0; transform: translateY(8px) scale(0.94); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes promoFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes promoDialogIn {
              from { opacity: 0; transform: translateY(24px) scale(0.92); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes promoPulse {
              0%, 100% { opacity: 0.45; transform: scale(0.92); }
              50% { opacity: 0.95; transform: scale(1.05); }
            }
            @keyframes promoSweep {
              from { transform: translateX(0) skewX(-24deg); }
              to { transform: translateX(220%) skewX(-24deg); }
            }
            @keyframes promoFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
            @keyframes promoLabel {
              0%, 100% { opacity: 0.52; }
              50% { opacity: 0.92; }
            }
            @media (prefers-reduced-motion: reduce) {
              .promo-cell-inner,
              .promo-enter,
              .promo-fade,
              .promo-pop,
              .promo-empty-glow,
              .promo-empty-sheen,
              .promo-empty-float,
              .promo-empty-label {
                animation: none !important;
                transition: none !important;
              }
            }
          `,
            }}
          />
        </div>
      </div>

      {activeModal === "progress" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="promo-fade absolute inset-0 bg-black/72 backdrop-blur-md"
            onClick={closeActiveModal}
            onTouchEnd={closeActiveModal}
          />

          <div className="promo-pop liquid-panel relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] p-6 sm:p-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-32 bg-[radial-gradient(circle,rgba(96,165,250,0.28),transparent_70%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[-35%] w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
            />

            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 shadow-[0_0_30px_rgba(96,165,250,0.16)]">
                <Truck className="h-7 w-7 text-blue-300" />
              </div>

              <p className="mt-5 text-[0.64rem] uppercase tracking-[0.28em] text-blue-200/70">
                Cupom liberado
              </p>
              <h3 className="mt-3 font-hero text-[1.7rem] text-white sm:text-[2.2rem]">
                Frete gratis
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/[0.68]">
                Voce ganhou o cupom de frete gratis. Falta acertar mais um
                premio para seguir com esse beneficio ja reservado no seu
                carrinho.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-white/[0.42]">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                1 de 2 premios
              </div>

              <button
                type="button"
                onClick={closeActiveModal}
                onTouchEnd={closeActiveModal}
                className="mt-6 inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-full bg-white px-5 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="promo-fade absolute inset-0 bg-black/72 backdrop-blur-md" />

          <div className="promo-pop liquid-panel relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] p-6 sm:p-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-32 bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_70%)] blur-3xl"
            />

            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.14)]">
                <Ticket className="h-7 w-7 text-emerald-300" />
              </div>

              <p className="mt-5 text-[0.64rem] uppercase tracking-[0.28em] text-emerald-200/70">
                Desconto liberado
              </p>
              <h3 className="mt-3 font-hero text-[1.7rem] text-white sm:text-[2.2rem]">
                Cupom confirmado
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/[0.68]">
                Voce chegou ao segundo premio da rodada e liberou o desconto da
                campanha para finalizar a nova camisa da Selecao com mais
                vantagem.
              </p>

              <div className="relative mx-auto mt-6 max-w-[19rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-2">
                <div className="relative aspect-[1.5] overflow-hidden rounded-[1.2rem] bg-white">
                  <Image
                    src="/assets/desconto.png"
                    alt="Arte do desconto liberado"
                    fill
                    sizes="(max-width: 640px) 70vw, 304px"
                    className="object-cover object-center"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(9,9,9,0.56)_100%)]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#111] via-[#111]/55 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#111] via-[#111]/65 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#111] via-[#111]/60 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#111] via-[#111]/60 to-transparent" />
                </div>
              </div>

              <div className="mt-6 flex items-center rounded-full border border-white/10 bg-white/5 p-1.5">
                <span className="flex-1 font-mono text-lg font-bold tracking-wider text-emerald-400">
                  {COUPON_CODE}
                </span>
                <button
                  type="button"
                  onClick={copyCoupon}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-white/90"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copiar
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.05] px-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/[0.88]"
              >
                <RotateCcw className="h-4 w-4" />
                Nova rodada
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
