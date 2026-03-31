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
        className={`hero-media pointer-events-none relative z-0 h-[27rem] w-full max-w-[16.75rem] -translate-y-2 select-none object-contain object-center sm:h-[35rem] sm:max-w-[21rem] sm:-translate-y-3 lg:h-[39rem] lg:max-w-[23.25rem] lg:-translate-y-4 ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
