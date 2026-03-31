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
        className={`hero-media pointer-events-none relative z-10 h-[29rem] w-full max-w-[18rem] select-none object-contain object-center sm:h-[38rem] sm:max-w-[23rem] lg:h-[43rem] lg:max-w-[25.5rem] ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
