"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[25rem] items-center justify-center sm:min-h-[32rem] lg:min-h-[37rem] lg:justify-end">
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
        className={`hero-media pointer-events-none relative z-0 h-[30.5rem] w-full max-w-[19rem] -translate-y-3 scale-[1.15] select-none object-contain object-center sm:h-[40rem] sm:max-w-[24.25rem] sm:-translate-y-4 lg:h-[45rem] lg:max-w-[26.75rem] lg:-translate-y-5 ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
