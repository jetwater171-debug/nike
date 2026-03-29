"use client";

import { useEffect, useState } from "react";

const frameCount = 96;
const frames = Array.from(
  { length: frameCount },
  (_, index) => `/assets/jersey-frames/frame-${String(index + 1).padStart(3, "0")}.webp`,
);

const frameDuration = 1000 / 12;

export function JerseyFrameSequence({
  className = "",
}: {
  className?: string;
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    frames.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });

    let animationFrame = 0;
    let lastFrameTime = performance.now();

    const tick = (now: number) => {
      if (document.visibilityState === "visible") {
        const elapsed = now - lastFrameTime;

        if (elapsed >= frameDuration) {
          const steps = Math.max(1, Math.floor(elapsed / frameDuration));
          lastFrameTime = now;
          setFrameIndex((current) => (current + steps) % frames.length);
        }
      } else {
        lastFrameTime = now;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <img
      src={frames[frameIndex]}
      alt="Camisa Brasil Jordan II 2026/27 girando em 360 graus"
      className={className}
      draggable={false}
      loading="eager"
    />
  );
}
