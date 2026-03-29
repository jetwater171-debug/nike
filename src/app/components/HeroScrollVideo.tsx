"use client";

import { useEffect, useRef } from "react";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;

    if (!video || !wrapper) return;

    let rafId = 0;

    const updateVideoTime = () => {
      rafId = 0;

      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const duration = video.duration || 7.933333;
      const startOffset = viewportHeight * 0.12;
      const travel = Math.max(rect.height - viewportHeight * 0.24, 1);
      const progress = Math.min(
        Math.max((startOffset - rect.top) / travel, 0),
        1,
      );
      const targetTime = duration * progress;

      if (Math.abs(video.currentTime - targetTime) > 0.016) {
        video.currentTime = targetTime;
      }
    };

    const requestUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateVideoTime);
      }
    };

    const primeVideo = async () => {
      try {
        await video.play();
        video.pause();
      } catch {}
    };

    const handleLoaded = () => requestUpdate();

    primeVideo();
    video.pause();
    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("loadeddata", handleLoaded);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative flex min-h-[24rem] items-center justify-center sm:min-h-[32rem] lg:min-h-[38rem] lg:justify-end"
    >
      <video
        ref={videoRef}
        aria-hidden="true"
        disablePictureInPicture
        muted
        playsInline
        poster="/assets/hero-jersey-poster.webp"
        preload="auto"
        tabIndex={-1}
        className={`hero-media pointer-events-none relative z-10 h-[23rem] w-full max-w-[14.5rem] select-none object-contain sm:h-[32rem] sm:max-w-[17rem] lg:h-[38rem] lg:max-w-[20rem] ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
