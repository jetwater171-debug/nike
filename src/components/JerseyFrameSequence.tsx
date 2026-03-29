"use client";

import { useEffect, useRef } from "react";

const frameCount = 238;
const frames = Array.from(
  { length: frameCount },
  (_, index) => `/assets/jersey-frames/frame-${String(index + 1).padStart(3, "0")}.webp`,
);

const frameDuration = 1000 / 30;
const eagerFrameCount = 36;
const preloadBatchSize = 12;
const preloadAhead = 8;

type IdleHandle = number;
type IdleCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: IdleHandle) => void;
  requestIdleCallback?: (callback: IdleCallback, options?: { timeout: number }) => IdleHandle;
};

export function JerseyFrameSequence({
  className = "",
}: {
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const imageCache = new Array<HTMLImageElement | null>(frames.length).fill(null);
    const frameReady = new Array<boolean>(frames.length).fill(false);
    const idleWindow = window as IdleWindow;

    let nextFrameToWarm = 0;
    let warmTimeout = 0;
    let idleHandle: IdleHandle | null = null;
    let disposed = false;

    const markReady = (index: number) => {
      frameReady[index] = true;
    };

    const loadFrame = (index: number) => {
      if (index < 0 || index >= frames.length || imageCache[index]) {
        return;
      }

      const img = new window.Image();
      img.decoding = index < 12 ? "sync" : "async";
      img.fetchPriority = index < 8 ? "high" : "auto";
      img.src = frames[index];

      if (img.complete) {
        markReady(index);
      } else {
        img.onload = () => markReady(index);
      }

      imageCache[index] = img;
    };

    const scheduleWarm = () => {
      if (disposed || nextFrameToWarm >= frames.length) {
        return;
      }

      const runWarm = () => {
        const limit = Math.min(nextFrameToWarm + preloadBatchSize, frames.length);

        while (nextFrameToWarm < limit) {
          loadFrame(nextFrameToWarm);
          nextFrameToWarm += 1;
        }

        scheduleWarm();
      };

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(
          () => {
            idleHandle = null;
            runWarm();
          },
          { timeout: 180 },
        );
        return;
      }

      warmTimeout = window.setTimeout(runWarm, 120);
    };

    while (nextFrameToWarm < Math.min(eagerFrameCount, frames.length)) {
      loadFrame(nextFrameToWarm);
      nextFrameToWarm += 1;
    }

    scheduleWarm();

    let animationFrame = 0;
    let startTime = performance.now();
    let renderedFrame = 0;

    const renderFrame = (frameIndex: number) => {
      const imgElement = imgRef.current;
      const frame = imageCache[frameIndex];

      if (!imgElement || !frame || !frameReady[frameIndex]) {
        return false;
      }

      imgElement.src = frame.src;
      renderedFrame = frameIndex;
      return true;
    };

    const tick = (now: number) => {
      if (document.visibilityState !== "visible") {
        startTime = now - renderedFrame * frameDuration;
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }

      const desiredFrame = Math.floor((now - startTime) / frameDuration) % frames.length;
      let frameToRender = desiredFrame;

      for (let offset = 1; offset <= preloadAhead; offset += 1) {
        loadFrame((desiredFrame + offset) % frames.length);
      }

      while (frameToRender !== renderedFrame && !frameReady[frameToRender]) {
        frameToRender = (frameToRender - 1 + frames.length) % frames.length;
      }

      if (frameToRender !== renderedFrame) {
        renderFrame(frameToRender);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    renderFrame(0);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      if (warmTimeout) {
        window.clearTimeout(warmTimeout);
      }
      if (idleHandle !== null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
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
