"use client";

import { useEffect, useRef } from "react";

const frameCount = 240;
const frames = Array.from(
  { length: frameCount },
  (_, index) => `/assets/jersey-frames/frame-${String(index + 1).padStart(3, "0")}.webp`,
);

const frameDuration = 1000 / 30;

export function JerseyFrameSequence({
  className = "",
}: {
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const cache = frames.map((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });

    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let currentFrame = 0;

    const tick = (now: number) => {
      if (document.visibilityState === "visible") {
        const elapsed = now - lastFrameTime;

        if (elapsed >= frameDuration) {
          const steps = Math.max(1, Math.floor(elapsed / frameDuration));
          currentFrame = (currentFrame + steps) % frames.length;
          lastFrameTime += steps * frameDuration;

          const nextFrame = cache[currentFrame];

          if (imgRef.current && nextFrame?.complete) {
            imgRef.current.src = nextFrame.src;
          }
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
      ref={imgRef}
      src={frames[0]}
      alt="Camisa Brasil Jordan II 2026/27 em movimento"
      className={className}
      draggable={false}
      loading="eager"
      fetchPriority="high"
    />
  );
}
