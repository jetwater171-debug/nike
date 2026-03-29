"use client";

type HeroScrollVideoProps = {
  className?: string;
};

export default function HeroScrollVideo({
  className = "",
}: HeroScrollVideoProps) {
  return (
    <div className="relative flex min-h-[28rem] items-center justify-center sm:min-h-[36rem] lg:min-h-[42rem] lg:justify-end">
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
        className={`hero-media pointer-events-none relative z-10 h-[27rem] w-full max-w-[17rem] select-none object-contain sm:h-[36rem] sm:max-w-[21rem] lg:h-[42rem] lg:max-w-[24rem] ${className}`}
      >
        <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
        <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
