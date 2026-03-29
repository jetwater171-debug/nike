"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[24rem] items-center justify-center sm:min-h-[32rem] lg:min-h-[38rem] lg:justify-end">
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
        className={`hero-media pointer-events-none relative z-10 h-[23rem] w-full max-w-[14.5rem] select-none object-contain sm:h-[32rem] sm:max-w-[17rem] lg:h-[38rem] lg:max-w-[20rem] ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
