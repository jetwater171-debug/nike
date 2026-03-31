"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[22rem] items-center justify-center sm:min-h-[28rem] lg:min-h-[32rem] lg:justify-end">
      <div
        className={`relative h-[22.25rem] w-full max-w-[18.2rem] overflow-hidden sm:h-[29rem] sm:max-w-[23rem] lg:h-[32.5rem] lg:max-w-[25.5rem] ${className}`}
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
          className="hero-media pointer-events-none absolute inset-0 h-full w-full scale-[1.08] select-none object-cover object-center"
        >
          <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
          <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
