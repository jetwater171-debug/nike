"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[23.5rem] items-center justify-center sm:min-h-[31rem] lg:min-h-[36rem] lg:justify-end">
      <div
        className={`relative z-10 h-[25.5rem] w-full max-w-[16.8rem] overflow-hidden sm:h-[34rem] sm:max-w-[21rem] lg:h-[39rem] lg:max-w-[23.5rem] ${className}`}
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
          className="hero-media pointer-events-none absolute left-1/2 top-1/2 h-[128%] w-[110%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-cover object-center"
        >
          <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
          <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
