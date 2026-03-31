"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[24.5rem] items-start justify-center sm:min-h-[32rem] lg:min-h-[37rem] lg:justify-end">
      <div
        className={`relative z-10 h-[24.75rem] w-full max-w-[16rem] overflow-hidden sm:h-[33rem] sm:max-w-[20.25rem] lg:h-[38rem] lg:max-w-[22.75rem] ${className}`}
      >
        <video
          aria-hidden="true"
          autoPlay
          disablePictureInPicture
          loop
          muted
          playsInline
          poster="/assets/hero-jersey-poster.webp"
          preload="metadata"
          tabIndex={-1}
          className="hero-media pointer-events-none absolute left-1/2 top-[45%] h-[134%] w-[114%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-cover object-center"
        >
          <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
          <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
