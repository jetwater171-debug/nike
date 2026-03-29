"use client";

import { useEffect, useRef } from "react";

const fps = 30;
const frameDuration = 1000 / fps;
const columns = 10;
const rows = 8;
const totalFrames = 238;

const sheets = [
  { src: "/assets/jersey-sprites/sheet-1.webp", frames: 80 },
  { src: "/assets/jersey-sprites/sheet-2.webp", frames: 80 },
  { src: "/assets/jersey-sprites/sheet-3.webp", frames: 78 },
];

function resolveFrame(frameIndex: number) {
  let remaining = frameIndex;

  for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex += 1) {
    const sheet = sheets[sheetIndex];

    if (remaining < sheet.frames) {
      return {
        sheetIndex,
        frameWithinSheet: remaining,
      };
    }

    remaining -= sheet.frames;
  }

  return {
    sheetIndex: sheets.length - 1,
    frameWithinSheet: 0,
  };
}

export function JerseyFrameSequence({
  className = "",
}: {
  className?: string;
}) {
  const spriteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    sheets.forEach(({ src }) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });

    let animationFrame = 0;
    let lastFrame = -1;
    let activeSheet = -1;
    let startTime = performance.now();

    const applyFrame = (frameIndex: number) => {
      const sprite = spriteRef.current;

      if (!sprite) {
        return;
      }

      const { sheetIndex, frameWithinSheet } = resolveFrame(frameIndex);
      const column = frameWithinSheet % columns;
      const row = Math.floor(frameWithinSheet / columns);
      const x = columns > 1 ? (column / (columns - 1)) * 100 : 0;
      const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;

      if (sheetIndex !== activeSheet) {
        sprite.style.backgroundImage = `url(${sheets[sheetIndex].src})`;
        activeSheet = sheetIndex;
      }

      sprite.style.backgroundPosition = `${x}% ${y}%`;
    };

    applyFrame(0);

    const tick = (now: number) => {
      if (document.visibilityState !== "visible") {
        startTime = now - Math.max(lastFrame, 0) * frameDuration;
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }

      const frameIndex =
        Math.floor((now - startTime) / frameDuration) % totalFrames;

      if (frameIndex !== lastFrame) {
        lastFrame = frameIndex;
        applyFrame(frameIndex);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      ref={spriteRef}
      aria-label="Camisa Brasil Jordan II 2026/27 em movimento"
      role="img"
      className={className}
      style={{
        aspectRatio: "280 / 498",
        backgroundImage: `url(${sheets[0].src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: "0% 0%",
      }}
    />
  );
}
