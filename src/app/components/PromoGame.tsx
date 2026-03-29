"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, Ticket, Copy, Check } from "lucide-react";

type CellState = "hidden" | "empty" | "shipping" | "coupon";

export default function PromoGame() {
  const [grid, setGrid] = useState<CellState[]>(Array(16).fill("hidden"));
  const [clicks, setClicks] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCellClick = (index: number) => {
    if (grid[index] !== "hidden" || gameOver) return;

    const newClicks = clicks + 1;
    let prize: CellState = "empty";

    if (newClicks === 1) {
      prize = "empty"; // 1st click: nothing
    } else if (newClicks === 2) {
      prize = "shipping"; // 2nd click: free shipping
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
      className="relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-lg">
        <div className="text-center mb-10">
          <h2 className="font-display text-[2.25rem] text-white sm:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Promocao de Cupons
          </h2>
          <p className="text-[0.98rem] text-white/70 leading-relaxed font-light">
            Entre na dinamica promocional da Nike e revele beneficios da oferta
            da camisa. Ao longo das jogadas, a pagina libera frete gratis e um
            cupom para fechar a compra com mais vantagem.
          </p>
        </div>

        <div className="liquid-panel p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] shadow-2xl rounded-3xl">
          {/* Subtle animated background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

          <div className="grid grid-cols-4 gap-3 sm:gap-4 relative z-10 w-full max-w-[280px] sm:max-w-[340px] mx-auto">
            {grid.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={cell === "hidden" && !gameOver ? { scale: 1.05 } : {}}
                whileTap={cell === "hidden" && !gameOver ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(index)}
                disabled={cell !== "hidden" || gameOver}
                className="relative aspect-square w-full rounded-2xl sm:rounded-[1.25rem] perspective-1000"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 w-full h-full duration-500 ease-out" style={{ transformStyle: "preserve-3d", transform: cell === "hidden" ? "rotateY(0deg)" : "rotateY(180deg)" }}>
                  
                  {/* Front (Hidden) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl sm:rounded-[1.25rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.1] shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="w-1/2 h-full absolute top-0 -left-1/2 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
                  </div>

                  {/* Back (Revealed) */}
                  <div
                    className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl sm:rounded-[1.25rem] flex items-center justify-center border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] ${
                      cell === "empty"
                        ? "bg-white/[0.03] border-white/5 text-white/20"
                        : cell === "shipping"
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        : cell === "coupon"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                        : ""
                    }`}
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    {cell === "empty" && <X className="w-6 h-6 sm:w-8 sm:h-8 opacity-40" />}
                    {cell === "shipping" && <Truck className="w-6 h-6 sm:w-8 sm:h-8" />}
                    {cell === "coupon" && <Ticket className="w-7 h-7 sm:w-9 sm:h-9" />}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .perspective-1000 { perspective: 1000px; }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            @keyframes shine {
              0% { left: -100%; transition-property: left; }
              100% { left: 200%; transition-property: left; }
            }
          `}} />
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 bottom-32 sm:bottom-12 z-50 bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden max-w-sm w-full mx-auto"
          >
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-3xl" />
            
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-display text-white mb-2">Beneficio liberado</h3>
              <p className="text-sm text-white/60 mb-6">
                Nesta etapa da promocao, voce liberou frete gratis e 15% OFF
                para finalizar a camisa com condicao especial.
              </p>

              <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-full items-center">
                <span className="flex-1 font-mono text-lg font-bold tracking-wider text-emerald-400">JORDAN15</span>
                <button
                  onClick={copyCoupon}
                  className="bg-white text-black px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white/90 transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5" /> Copiado</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copiar</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
