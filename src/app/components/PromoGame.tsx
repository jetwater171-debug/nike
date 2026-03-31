"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Truck, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { trackLeadEvent, trackPageView } from "@/lib/site-tracking";

type CellState = "hidden" | "empty" | "shipping" | "coupon" | "bomb";
type ModalState = "progress" | "success" | null;
type ConfettiVariant = "shipping" | "coupon";
type PromoGameProps = {
  claimHref: string;
};

type PromoConfettiPiece = {
  left: string;
  width: number;
  height: number;
  delayMs: number;
  durationMs: number;
  drift: string;
  rotate: string;
  scale: number;
};

type PromoConfettiStyle = React.CSSProperties & {
  "--promo-confetti-delay": string;
  "--promo-confetti-duration": string;
  "--promo-confetti-drift": string;
  "--promo-confetti-rotate": string;
  "--promo-confetti-scale": string;
};

const PROMO_CONFETTI_PIECES: PromoConfettiPiece[] = [
  {
    left: "4%",
    width: 10,
    height: 24,
    delayMs: 0,
    durationMs: 1240,
    drift: "-28px",
    rotate: "-18deg",
    scale: 0.88,
  },
  {
    left: "10%",
    width: 12,
    height: 18,
    delayMs: 70,
    durationMs: 1420,
    drift: "30px",
    rotate: "22deg",
    scale: 1.04,
  },
  {
    left: "15%",
    width: 8,
    height: 22,
    delayMs: 110,
    durationMs: 1360,
    drift: "-18px",
    rotate: "-32deg",
    scale: 0.96,
  },
  {
    left: "21%",
    width: 14,
    height: 14,
    delayMs: 20,
    durationMs: 1180,
    drift: "14px",
    rotate: "34deg",
    scale: 1.08,
  },
  {
    left: "27%",
    width: 11,
    height: 26,
    delayMs: 90,
    durationMs: 1480,
    drift: "-34px",
    rotate: "-20deg",
    scale: 0.92,
  },
  {
    left: "33%",
    width: 9,
    height: 18,
    delayMs: 160,
    durationMs: 1280,
    drift: "22px",
    rotate: "30deg",
    scale: 1.02,
  },
  {
    left: "40%",
    width: 14,
    height: 24,
    delayMs: 30,
    durationMs: 1440,
    drift: "-12px",
    rotate: "-24deg",
    scale: 1.1,
  },
  {
    left: "46%",
    width: 8,
    height: 16,
    delayMs: 120,
    durationMs: 1160,
    drift: "12px",
    rotate: "18deg",
    scale: 0.9,
  },
  {
    left: "51%",
    width: 12,
    height: 28,
    delayMs: 40,
    durationMs: 1500,
    drift: "-8px",
    rotate: "-14deg",
    scale: 1.14,
  },
  {
    left: "58%",
    width: 9,
    height: 20,
    delayMs: 145,
    durationMs: 1300,
    drift: "26px",
    rotate: "28deg",
    scale: 0.98,
  },
  {
    left: "64%",
    width: 13,
    height: 16,
    delayMs: 60,
    durationMs: 1200,
    drift: "-22px",
    rotate: "-28deg",
    scale: 1.06,
  },
  {
    left: "70%",
    width: 10,
    height: 24,
    delayMs: 95,
    durationMs: 1460,
    drift: "18px",
    rotate: "24deg",
    scale: 0.94,
  },
  {
    left: "76%",
    width: 12,
    height: 18,
    delayMs: 15,
    durationMs: 1260,
    drift: "-30px",
    rotate: "-34deg",
    scale: 0.96,
  },
  {
    left: "82%",
    width: 8,
    height: 22,
    delayMs: 105,
    durationMs: 1380,
    drift: "28px",
    rotate: "16deg",
    scale: 1.08,
  },
  {
    left: "89%",
    width: 11,
    height: 16,
    delayMs: 65,
    durationMs: 1340,
    drift: "-20px",
    rotate: "-18deg",
    scale: 0.9,
  },
  {
    left: "94%",
    width: 9,
    height: 20,
    delayMs: 150,
    durationMs: 1220,
    drift: "16px",
    rotate: "36deg",
    scale: 1.04,
  },
];

const PROMO_CONFETTI_COLORS: Record<ConfettiVariant, string[]> = {
  shipping: [
    "#f8fafc",
    "#7dd3fc",
    "#38bdf8",
    "#93c5fd",
    "#c4b5fd",
    "#67e8f9",
  ],
  coupon: [
    "#f8fafc",
    "#facc15",
    "#4ade80",
    "#86efac",
    "#34d399",
    "#fde68a",
  ],
};

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

function PromoModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

function PromoConfetti({ variant }: { variant: ConfettiVariant }) {
  const colors = PROMO_CONFETTI_COLORS[variant];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    >
      {PROMO_CONFETTI_PIECES.map((piece, index) => {
        const style: PromoConfettiStyle = {
          left: piece.left,
          width: `${piece.width}px`,
          height: `${piece.height}px`,
          backgroundColor: colors[index % colors.length],
          "--promo-confetti-delay": `${piece.delayMs}ms`,
          "--promo-confetti-duration": `${piece.durationMs}ms`,
          "--promo-confetti-drift": piece.drift,
          "--promo-confetti-rotate": piece.rotate,
          "--promo-confetti-scale": `${piece.scale}`,
        };

        return <span key={`${variant}-${index}`} className="promo-confetti" style={style} />;
      })}
    </div>
  );
}

export default function PromoGame({ claimHref }: PromoGameProps) {
  const router = useRouter();
  const [grid, setGrid] = useState<CellState[]>(createHiddenGrid);
  const [clicks, setClicks] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [isResolvingTurn, setIsResolvingTurn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const progressModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scrollLockRef = useRef<{
    scrollY: number;
    bodyPosition: string;
    bodyTop: string;
    bodyLeft: string;
    bodyRight: string;
    bodyWidth: string;
    bodyOverflow: string;
    bodyScrollBehavior: string;
    htmlOverflow: string;
    htmlScrollBehavior: string;
  } | null>(null);

  const getAudioContext = async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch {
        return null;
      }
    }

    return audioContextRef.current;
  };

  const playTone = (
    context: AudioContext,
    {
      frequency,
      startAt,
      duration,
      volume,
      type = "sine",
    }: {
      frequency: number;
      startAt: number;
      duration: number;
      volume: number;
      type?: OscillatorType;
    },
  ) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + duration,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.04);
  };

  const playNoiseBurst = (
    context: AudioContext,
    {
      startAt,
      duration,
      volume,
      centerFrequency,
    }: {
      startAt: number;
      duration: number;
      volume: number;
      centerFrequency: number;
    },
  ) => {
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gainNode = context.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(centerFrequency, startAt);
    filter.Q.setValueAtTime(1.1, startAt);

    gainNode.gain.setValueAtTime(volume, startAt);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + duration,
    );

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(startAt);
    source.stop(startAt + duration + 0.03);
  };

  const playGameSound = async (
    kind: "start" | "empty" | "shipping" | "coupon",
  ) => {
    const context = await getAudioContext();
    if (!context) {
      return;
    }

    const now = context.currentTime + 0.01;

    if (kind === "start") {
      playTone(context, {
        frequency: 340,
        startAt: now,
        duration: 0.12,
        volume: 0.02,
        type: "triangle",
      });
      playTone(context, {
        frequency: 440,
        startAt: now + 0.08,
        duration: 0.18,
        volume: 0.018,
        type: "sine",
      });
      return;
    }

    if (kind === "empty") {
      playTone(context, {
        frequency: 320,
        startAt: now,
        duration: 0.08,
        volume: 0.028,
        type: "triangle",
      });
      playTone(context, {
        frequency: 246,
        startAt: now + 0.06,
        duration: 0.14,
        volume: 0.024,
        type: "sine",
      });
      playTone(context, {
        frequency: 185,
        startAt: now + 0.16,
        duration: 0.2,
        volume: 0.02,
        type: "sine",
      });
      return;
    }

    if (kind === "shipping") {
      playNoiseBurst(context, {
        startAt: now,
        duration: 0.18,
        volume: 0.006,
        centerFrequency: 1200,
      });
      playTone(context, {
        frequency: 462,
        startAt: now,
        duration: 0.14,
        volume: 0.014,
        type: "triangle",
      });
      playTone(context, {
        frequency: 620,
        startAt: now + 0.07,
        duration: 0.18,
        volume: 0.018,
        type: "sine",
      });
      playTone(context, {
        frequency: 740,
        startAt: now + 0.16,
        duration: 0.2,
        volume: 0.014,
        type: "sine",
      });
      playTone(context, {
        frequency: 934,
        startAt: now + 0.24,
        duration: 0.26,
        volume: 0.012,
        type: "sine",
      });
      return;
    }

    playNoiseBurst(context, {
      startAt: now,
      duration: 0.22,
      volume: 0.008,
      centerFrequency: 1800,
    });
    playTone(context, {
      frequency: 310,
      startAt: now,
      duration: 0.18,
      volume: 0.012,
      type: "triangle",
    });
    playTone(context, {
      frequency: 620,
      startAt: now + 0.02,
      duration: 0.18,
      volume: 0.017,
      type: "triangle",
    });
    playTone(context, {
      frequency: 784,
      startAt: now + 0.1,
      duration: 0.22,
      volume: 0.016,
      type: "sine",
    });
    playTone(context, {
      frequency: 932,
      startAt: now + 0.18,
      duration: 0.26,
      volume: 0.015,
      type: "sine",
    });
    playTone(context, {
      frequency: 1244,
      startAt: now + 0.28,
      duration: 0.34,
      volume: 0.012,
      type: "sine",
    });
  };

  const clearProgressModalTimeout = () => {
    if (progressModalTimeoutRef.current) {
      clearTimeout(progressModalTimeoutRef.current);
      progressModalTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearProgressModalTimeout();
  }, []);

  useEffect(() => {
    if (activeModal === null) {
      return;
    }

    const lockState = {
      scrollY: window.scrollY,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
      bodyOverflow: document.body.style.overflow,
      bodyScrollBehavior: document.body.style.scrollBehavior,
      htmlOverflow: document.documentElement.style.overflow,
      htmlScrollBehavior: document.documentElement.style.scrollBehavior,
    };
    scrollLockRef.current = lockState;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockState.scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      const lockState = scrollLockRef.current;

      if (!lockState) {
        return;
      }

      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      document.body.style.position = lockState.bodyPosition;
      document.body.style.top = lockState.bodyTop;
      document.body.style.left = lockState.bodyLeft;
      document.body.style.right = lockState.bodyRight;
      document.body.style.width = lockState.bodyWidth;
      document.body.style.overflow = lockState.bodyOverflow;
      document.documentElement.style.overflow = lockState.htmlOverflow;
      window.scrollTo({ top: lockState.scrollY, left: 0, behavior: "auto" });

      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior =
          lockState.htmlScrollBehavior;
        document.body.style.scrollBehavior = lockState.bodyScrollBehavior;
        scrollLockRef.current = null;
      });
    };
  }, [activeModal]);

  const blurActiveElement = () => {
    if (typeof document === "undefined") {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  };

  const closeActiveModal = () => {
    blurActiveElement();
    setActiveModal(null);
  };

  const startGame = () => {
    clearProgressModalTimeout();
    setGrid(createHiddenGrid());
    setClicks(0);
    setGameStarted(true);
    setGameOver(false);
    setActiveModal(null);
    setIsResolvingTurn(false);
    void playGameSound("start");
    void trackPageView("promo");
    void trackLeadEvent({
      event: "promo_started",
      stage: "promo",
      page: "promo",
    });
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
      void playGameSound("shipping");
      setIsResolvingTurn(true);
      clearProgressModalTimeout();
      progressModalTimeoutRef.current = setTimeout(() => {
        setIsResolvingTurn(false);
        setActiveModal("progress");
        void trackLeadEvent({
          event: "promo_shipping_reward",
          stage: "promo",
          page: "promo",
          reward: {
            id: "shipping",
            name: "Frete gratis",
          },
        });
        progressModalTimeoutRef.current = null;
      }, 650);
      return;
    }

    if (prize === "coupon") {
      void playGameSound("coupon");
      setGameOver(true);
      
      const hiddenIndices = nextGrid
        .map((c, idx) => (c === "hidden" ? idx : -1))
        .filter((i) => i !== -1);
        
      const shuffled = hiddenIndices.sort(() => 0.5 - Math.random());
      const bombIndices = shuffled.slice(0, 4);
      
      bombIndices.forEach((idx) => {
        nextGrid[idx] = "bomb";
      });
      
      setGrid([...nextGrid]);

      clearProgressModalTimeout();
      progressModalTimeoutRef.current = setTimeout(() => {
        setActiveModal("success");
        void trackLeadEvent({
          event: "promo_discount_reward",
          stage: "promo",
          page: "promo",
          amount: 139.19,
          reward: {
            id: "coupon",
            name: "Desconto liberado",
          },
        });
        progressModalTimeoutRef.current = null;
      }, 1600);
      return;
    }

    void playGameSound("empty");
  };

  const handleClaimClick = async () => {
    blurActiveElement();
    await trackLeadEvent({
      event: "promo_claim_click",
      stage: "promo",
      page: "promo",
      amount: 139.19,
    });
    router.push(claimHref);
  };

  const canInteract = (cell: CellState) =>
    gameStarted &&
    cell === "hidden" &&
    !gameOver &&
    activeModal === null &&
    !isResolvingTurn;

  const rewardsFound = grid.filter(
    (cell) => cell === "shipping" || cell === "coupon",
  ).length;

  const progressModal =
    activeModal === "progress" ? (
      <PromoModalPortal>
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <PromoConfetti variant="shipping" />

          <div
            className="promo-fade pointer-events-auto absolute inset-0 bg-black/78 backdrop-blur-md"
            onClick={closeActiveModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="promo-pop promo-pop--shipping liquid-panel pointer-events-auto relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.68)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-10 top-0 h-32 bg-[radial-gradient(circle,rgba(96,165,250,0.35),transparent_70%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[-35%] w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent"
            />
            <div
              aria-hidden="true"
              className="promo-modal-beam absolute inset-x-8 top-[-18%] h-28 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.28),transparent_72%)] blur-3xl"
            />

            <div className="relative z-10 text-center">
              <div className="promo-modal-icon promo-modal-icon--shipping mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/30 bg-blue-400/10 shadow-[0_0_30px_rgba(96,165,250,0.16)]">
                <span
                  aria-hidden="true"
                  className="promo-modal-ring promo-modal-ring--shipping absolute inset-[-8px] rounded-full border border-blue-300/20"
                />
                <Truck className="relative z-10 h-7 w-7 text-blue-300" />
              </div>

              <p className="mt-5 text-[0.64rem] uppercase tracking-[0.28em] text-blue-200/78">
                Primeiro premio liberado
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
                className="promo-modal-cta mt-6 inline-flex min-h-12 w-full touch-manipulation select-none items-center justify-center rounded-full bg-white px-5 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
              >
                Continuar rodada
              </button>
            </div>
          </div>
        </div>
      </PromoModalPortal>
    ) : null;

  const successModal =
    activeModal === "success" ? (
      <PromoModalPortal>
        <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <PromoConfetti variant="coupon" />

          <div className="promo-fade pointer-events-auto absolute inset-0 bg-black/82 backdrop-blur-md" />

          <div
            role="dialog"
            aria-modal="true"
            className="promo-pop promo-pop--coupon liquid-panel pointer-events-auto relative z-10 w-full max-w-[21.75rem] overflow-hidden rounded-[1.7rem] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.74)] sm:max-w-sm sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-8 top-0 h-24 bg-[radial-gradient(circle,rgba(255,255,255,0.22),transparent_72%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-10 bottom-6 h-20 bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_72%)] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[-18%] w-[45%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
            />
            <div
              aria-hidden="true"
              className="promo-modal-beam absolute inset-x-10 top-[-18%] h-28 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.22),transparent_72%)] blur-3xl"
            />

            <div className="relative z-10 text-center">
              <div className="promo-modal-icon promo-modal-icon--coupon mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.14)]">
                <span
                  aria-hidden="true"
                  className="promo-modal-ring promo-modal-ring--coupon absolute inset-[-8px] rounded-full border border-emerald-300/18"
                />
                <Ticket className="relative z-10 h-6 w-6 text-emerald-300" />
              </div>

              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.26em] text-emerald-200/70">
                Desconto liberado
              </p>
              <h3 className="mt-2.5 font-hero text-[1.45rem] text-white sm:text-[1.9rem]">
                Oferta confirmada
              </h3>
              <p className="mt-3 text-[0.92rem] leading-6 text-white/[0.68]">
                Voce bateu os 2 premios da rodada e agora ja pode seguir para a
                nova camisa com a oferta desta campanha destravada.
              </p>

              <div className="relative mx-auto mt-5 w-full max-w-[18.3rem] overflow-hidden rounded-[1.5rem] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.035))] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:max-w-[18.8rem] sm:px-5 sm:py-6">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-12 bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_72%)] blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-10 bottom-0 h-14 bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_72%)] blur-2xl"
                />

                <div className="relative text-center">
                  <NikeSwoosh className="mx-auto h-4 w-auto text-white/72" />
                  <p className="mt-4 text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.38]">
                    Campanha nike
                  </p>
                  <p className="mx-auto mt-2.5 max-w-[12ch] font-hero text-[1.55rem] leading-[0.92] text-white sm:text-[1.85rem]">
                    Descontasso na camisa do Brasil
                  </p>

                  <div className="mt-4.5 flex items-center justify-center gap-2">
                    <span className="text-[0.7rem] uppercase tracking-[0.08em] text-white/[0.42]">
                      de
                    </span>
                    <span className="relative text-[1rem] font-medium text-white/[0.4]">
                      R$ 749,99
                      <span className="absolute left-[-4%] right-[-4%] top-1/2 h-[2px] -translate-y-1/2 rotate-[-6deg] bg-[#d84d4d]" />
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-end justify-center gap-2">
                    <span className="text-[1.45rem] leading-none text-white/[0.84] sm:text-[1.7rem]">
                      por
                    </span>
                    <span className="font-hero text-[2.95rem] leading-none text-emerald-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.22)] sm:text-[3.4rem]">
                      R$ 139,19
                    </span>
                  </div>

                  <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
                  <p className="mt-4 text-[0.88rem] leading-6 text-white/[0.58]">
                    Sua oferta reservada segue para a proxima etapa do resgate.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimClick}
                className="promo-modal-cta mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
              >
                Resgatar camisa agora
              </button>
            </div>
          </div>
        </div>
      </PromoModalPortal>
    ) : null;

  return (
    <section
      id="promo"
      className="section-shell relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-10 sm:px-8 sm:py-12 lg:px-12"
    >
      <div className="relative z-10 mx-auto w-full max-w-[46rem]">
        <div className="liquid-panel relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

          <div className="relative z-10 mb-5 flex justify-center text-center sm:mb-6">
            <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/[0.72]">
              {rewardsFound}/2 premios encontrados
            </div>
          </div>

          {!gameStarted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
              <div className="absolute inset-0 rounded-[inherit] bg-black/[0.26] backdrop-blur-[1.5px]" />
              <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(7,7,7,0.16)_32%,rgba(5,5,5,0.28)_100%)]" />
              <div className="promo-pop relative z-10 flex h-full w-full flex-col items-center justify-center rounded-[2.15rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(18,18,18,0.8),rgba(9,9,9,0.74))] px-6 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_22px_60px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:rounded-[2.35rem] sm:px-9 sm:py-9">
                <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/[0.42]">
                  Rodada travada
                </p>
                <h3 className="font-hero mt-4 text-[2.05rem] text-white sm:text-[2.9rem]">
                  Liberar rodada
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/[0.66]">
                  Seu objetivo é acertar 2 premios sem clicar em nenhuma das 4 bombas. Boa sorte!
                </p>

                <button
                  type="button"
                  onClick={startGame}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-black transition-transform duration-300 hover:scale-[1.01]"
                >
                  Abrir rodada
                </button>
              </div>
            </div>
          )}

          <div
            className={`relative z-10 mx-auto grid w-full max-w-[406px] grid-cols-4 gap-[1.05rem] transition-[opacity,filter] duration-300 sm:max-w-[496px] sm:gap-[1.3rem] ${
              gameStarted ? "opacity-100 blur-0" : "opacity-[0.84] blur-0"
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
                  <div
                    className={`backface-hidden absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border shadow-inner sm:rounded-[1.25rem] ${
                      gameStarted
                        ? "border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
                        : "border-white/[0.18] bg-gradient-to-br from-white/[0.16] to-white/[0.05]"
                    }`}
                  >
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
                        : cell === "bomb"
                        ? "border-red-500/40 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),rgba(239,68,68,0.05)_50%,transparent_100%)] text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
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
                      <div className="promo-enter promo-hit-cell promo-hit-cell--shipping relative flex flex-col items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="promo-hit-ripple promo-hit-ripple--shipping absolute inset-0 rounded-2xl sm:rounded-[1.25rem]"
                        />
                        <Truck className="promo-hit-icon relative z-10 h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-blue-200/80 sm:text-[0.5rem]">
                          Frete
                        </span>
                      </div>
                    )}

                    {cell === "coupon" && (
                      <div className="promo-enter promo-hit-cell promo-hit-cell--coupon relative flex flex-col items-center justify-center">
                        <span
                          aria-hidden="true"
                          className="promo-hit-ripple promo-hit-ripple--coupon absolute inset-0 rounded-2xl sm:rounded-[1.25rem]"
                        />
                        <Ticket className="promo-hit-icon relative z-10 h-7 w-7 sm:h-9 sm:w-9" />
                        <span className="mt-2 text-[0.44rem] uppercase tracking-[0.18em] text-emerald-200/80 sm:text-[0.5rem]">
                          Cupom
                        </span>
                      </div>
                    )}

                    {cell === "bomb" && (
                      <div className="promo-enter flex h-full w-full flex-col items-center justify-center">
                        <img 
                          src="/assets/bomba.webp" 
                          alt="Bomba" 
                          className="h-[65%] w-[65%] object-contain drop-shadow-[0_0_16px_rgba(239,68,68,0.7)]" 
                        />
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
            .promo-pop { transform-origin: center 14%; animation: promoDialogIn 560ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            .promo-pop--shipping { animation-name: promoDialogInBlue; }
            .promo-pop--coupon { animation-name: promoDialogInGreen; }
            .promo-modal-beam { animation: promoBeam 2.8s ease-in-out infinite; }
            .promo-modal-icon { position: relative; isolation: isolate; animation: promoBadgeLift 2.4s ease-in-out infinite; }
            .promo-modal-icon--shipping::before,
            .promo-modal-icon--coupon::before {
              content: "";
              position: absolute;
              inset: -22%;
              border-radius: 999px;
              z-index: -1;
              filter: blur(18px);
            }
            .promo-modal-icon--shipping::before {
              background: radial-gradient(circle, rgba(125,211,252,0.34), transparent 66%);
            }
            .promo-modal-icon--coupon::before {
              background: radial-gradient(circle, rgba(74,222,128,0.28), rgba(250,204,21,0.12) 48%, transparent 70%);
            }
            .promo-modal-ring { animation: promoRingPulse 2.2s ease-out infinite; }
            .promo-modal-cta { position: relative; overflow: hidden; box-shadow: 0 16px 44px rgba(255,255,255,0.14); }
            .promo-modal-cta::after {
              content: "";
              position: absolute;
              inset: -36% auto -36% -18%;
              width: 34%;
              transform: skewX(-24deg);
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.52), transparent);
              opacity: 0.72;
              animation: promoCtaSweep 2.5s ease-in-out infinite;
              pointer-events: none;
            }
            .promo-hit-cell { isolation: isolate; }
            .promo-hit-cell--shipping { text-shadow: 0 0 22px rgba(125,211,252,0.2); }
            .promo-hit-cell--coupon { text-shadow: 0 0 22px rgba(74,222,128,0.22); }
            .promo-hit-icon { animation: promoPrizeBounce 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            .promo-hit-ripple { animation: promoPrizeRipple 780ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            .promo-hit-ripple--shipping { background: radial-gradient(circle, rgba(125,211,252,0.3), transparent 64%); }
            .promo-hit-ripple--coupon { background: radial-gradient(circle, rgba(74,222,128,0.34), transparent 64%); }
            .promo-empty-glow { animation: promoPulse 3.2s ease-in-out infinite; }
            .promo-empty-sheen { animation: promoSweep 2.6s ease-in-out infinite; }
            .promo-empty-float { animation: promoFloat 3s ease-in-out infinite; }
            .promo-empty-label { animation: promoLabel 2.8s ease-in-out infinite; }
            .promo-confetti {
              position: absolute;
              top: -8%;
              border-radius: 999px;
              box-shadow: 0 0 18px rgba(255,255,255,0.18);
              opacity: 0;
              animation: promoConfettiDrop var(--promo-confetti-duration) cubic-bezier(0.2, 0.9, 0.25, 1) var(--promo-confetti-delay) both;
            }
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
            @keyframes promoDialogInBlue {
              0% { opacity: 0; transform: translateY(28px) scale(0.88) rotateX(-12deg); filter: blur(14px); }
              58% { opacity: 1; transform: translateY(-4px) scale(1.02) rotateX(0deg); filter: blur(0); }
              100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
            @keyframes promoDialogInGreen {
              0% { opacity: 0; transform: translateY(32px) scale(0.86) rotateX(-14deg); filter: blur(16px); }
              52% { opacity: 1; transform: translateY(-6px) scale(1.03) rotateX(0deg); filter: blur(0); }
              100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
            @keyframes promoBeam {
              0%, 100% { opacity: 0.58; transform: scale(0.92); }
              50% { opacity: 0.95; transform: scale(1.08); }
            }
            @keyframes promoBadgeLift {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-4px) scale(1.04); }
            }
            @keyframes promoRingPulse {
              0% { opacity: 0.4; transform: scale(0.78); }
              70% { opacity: 0; transform: scale(1.28); }
              100% { opacity: 0; transform: scale(1.32); }
            }
            @keyframes promoCtaSweep {
              0%, 100% { transform: translateX(0) skewX(-24deg); opacity: 0; }
              22% { opacity: 0; }
              48% { transform: translateX(260%) skewX(-24deg); opacity: 0.76; }
              60% { opacity: 0; }
            }
            @keyframes promoPrizeBounce {
              0% { transform: translateY(16px) scale(0.52) rotate(-12deg); opacity: 0; }
              55% { transform: translateY(-4px) scale(1.12) rotate(4deg); opacity: 1; }
              100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes promoPrizeRipple {
              0% { opacity: 0.46; transform: scale(0.45); }
              100% { opacity: 0; transform: scale(1.38); }
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
            @keyframes promoConfettiDrop {
              0% {
                opacity: 0;
                transform: translate3d(0, -36px, 0) rotate(0deg) scale(0.38);
              }
              12% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: translate3d(var(--promo-confetti-drift), 320px, 0) rotate(var(--promo-confetti-rotate)) scale(var(--promo-confetti-scale));
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .promo-cell-inner,
              .promo-enter,
              .promo-fade,
              .promo-pop,
              .promo-modal-beam,
              .promo-modal-icon,
              .promo-modal-ring,
              .promo-modal-cta::after,
              .promo-hit-icon,
              .promo-hit-ripple,
              .promo-empty-glow,
              .promo-empty-sheen,
              .promo-empty-float,
              .promo-empty-label,
              .promo-confetti {
                animation: none !important;
                transition: none !important;
              }
            }
          `,
            }}
          />
        </div>
      </div>

      {progressModal}
      {successModal}
    </section>
  );
}
