"use client";

import React, { useState } from "react";
import { Truck, Ticket, Copy, Check } from "lucide-react";

type CellState = "hidden" | "empty" | "shipping" | "coupon";

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

export default function PromoGame() {
  const [grid, setGrid] = useState<CellState[]>(Array(16).fill("hidden"));
  const [clicks, setClicks] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const isInteractionLocked = gameOver || shippingModalOpen;

  const handleCellClick = (index: number) => {
    if (grid[index] !== "hidden" || isInteractionLocked) return;

    const newClicks = clicks + 1;
    let prize: CellState = "empty";

    if (newClicks === 1) {
      prize = "empty"; // 1st click: nothing
    } else if (newClicks === 2) {
      prize = "shipping"; // 2nd click: free shipping
      setShippingModalOpen(true);
    } else if (newClicks === 3) {
      prize = "empty"; // 3rd click: nothing
    } else if (newClicks === 4) {
      prize = "coupon"; // 4th click: discount coupon
      setGameOver(true);
    }

    const newGrid = [...grid];
    newGrid[index] = prize;
    setGrid(newGrid);
    setClicks(newClicks);
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText("JORDAN15");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="promo"
      className="section-shell relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="text-center mb-10">
          <h2 className="font-display text-[2.25rem] text-white sm:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Promocao de Cupons
          </h2>
          <p className="text-[0.98rem] text-white/70 leading-relaxed font-light">
            No tabuleiro 4x4, algumas casas nao liberam nada e outras escondem
            cupons da campanha. Para sair com vantagem, voce precisa encontrar
            2 acertos validos ao longo da rodada.
          </p>
        </div>

        <div className="liquid-panel p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-2xl rounded-3xl">
          {/* Subtle animated background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

          <div className="grid grid-cols-4 gap-3 sm:gap-4 relative z-10 w-full max-w-[280px] sm:max-w-[340px] mx-auto">
            {grid.map((cell, index) => {
              const canInteract = cell === "hidden" && !isInteractionLocked;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCellClick(index)}
                  disabled={!canInteract}
                  className={`relative aspect-square w-full rounded-2xl perspective-1000 sm:rounded-[1.25rem] ${
                    canInteract
                      ? "transition-transform duration-200 hover:scale-[1.035] active:scale-[0.97]"
                      : ""
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="promo-cell-inner absolute inset-0 w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform:
                        cell === "hidden" ? "rotateY(0deg)" : "rotateY(180deg)",
                    }}
                  >
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-inner backface-hidden sm:rounded-[1.25rem]">
                      <div className="absolute inset-x-2 top-2 h-8 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-lg" />
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.24] to-transparent" />
                    </div>

                    <div
                      className={`absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] backface-hidden sm:rounded-[1.25rem] ${
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
              );
            })}
          </div>

          <style dangerouslySetInnerHTML={{__html: `
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
          `}} />
        </div>
      </div>

      {shippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="promo-fade absolute inset-0 bg-black/72 backdrop-blur-md"
            onClick={() => setShippingModalOpen(false)}
          />

          <div className="promo-pop liquid-panel relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] p-6 sm:p-7">
            <div
              aria-hidden="true"
              className="promo-empty-glow absolute inset-x-10 top-0 h-32 bg-[radial-gradient(circle,rgba(96,165,250,0.28),transparent_70%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="promo-empty-sheen absolute inset-y-0 left-[-35%] w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
            />

            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 shadow-[0_0_30px_rgba(96,165,250,0.16)]">
                <Truck className="h-7 w-7 text-blue-300" />
              </div>

              <p className="mt-5 text-[0.64rem] uppercase tracking-[0.28em] text-blue-200/70">
                Cupom liberado
              </p>
              <h3 className="mt-3 font-display text-[2rem] leading-none text-white sm:text-[2.2rem]">
                Frete gratis
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/[0.68]">
                Voce ganhou o cupom de frete gratis. Falta acertar mais um
                premio para seguir com esse beneficio ja reservado no seu
                carrinho.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-white/[0.42]">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                2 de 4 jogadas
              </div>

              <button
                type="button"
                onClick={() => setShippingModalOpen(false)}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="promo-pop fixed inset-x-4 bottom-32 z-50 mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:bottom-12 sm:-translate-x-1/2">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/5 blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <Ticket className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="mb-2 text-xl font-display text-white">Beneficio liberado</h3>
            <p className="mb-6 text-sm text-white/60">
              Nesta etapa da promocao, voce liberou frete gratis e 15% OFF
              para finalizar a camisa com condicao especial.
            </p>

            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1.5">
              <span className="flex-1 font-mono text-lg font-bold tracking-wider text-emerald-400">
                JORDAN15
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
          </div>
        </div>
      )}
    </section>
  );
}
