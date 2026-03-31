import Link from "next/link";
import HeroScrollVideo from "./components/HeroScrollVideo";
import NikeLiquidHeader from "./components/NikeLiquidHeader";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0)_24%,rgba(0,0,0,0.18)_100%)]" />
      </div>

      <NikeLiquidHeader />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 pb-12 pt-24 sm:px-8 sm:pb-16 lg:px-12">
        <div className="flex w-full max-w-[46rem] flex-col items-center text-center">
          <div className="liquid-panel relative z-20 w-full max-w-[39rem] px-4 py-5 sm:px-6 sm:py-6">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-white/[0.44] sm:text-[0.68rem]">
              Campanha promocional Nike
            </p>

            <h1 className="font-hero mt-3 leading-[0.88] text-white">
              <span className="block whitespace-nowrap text-[clamp(2.15rem,8.5vw,4.5rem)]">
                Promocao exclusiva
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-[clamp(2.15rem,8.2vw,4.5rem)] text-white/[0.64]">
                camisa do Brasil
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-[30rem] text-[0.9rem] leading-6 text-white/[0.72] sm:text-[0.98rem] sm:leading-7">
              Desbloqueie ate 80% OFF na nova camisa da Selecao Brasileira em
              uma promocao relampago feita para liberar sua melhor oferta.
            </p>
          </div>

          <div className="relative -mt-2 flex w-full max-w-[26rem] flex-col items-center sm:-mt-3 sm:max-w-[30rem]">
            <HeroScrollVideo className="relative z-0 sm:max-w-[25.5rem] lg:max-w-[28rem]" />

            <div className="relative z-20 -mt-8 text-center sm:-mt-10">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/[0.56] sm:text-[0.8rem]">
                De <span className="line-through">R$ 749,99</span>
              </p>
              <p className="font-hero mt-2 text-[2.35rem] leading-[0.9] text-white sm:text-[3.2rem]">
                podendo chegar a
                <span className="mt-1 block text-emerald-400">R$ 139,19</span>
              </p>
            </div>

            <div className="liquid-cta-wrap relative z-20 mt-6 w-full">
              <Link
                href="/mines"
                className="liquid-cta font-hero inline-flex min-h-[4rem] w-full items-center justify-center rounded-full px-7 text-[1.05rem] tracking-[0.08em] text-white transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[4.4rem] sm:text-[1.18rem]"
              >
                <span className="relative z-10">Desbloquear a oferta</span>
              </Link>
            </div>

            <p className="relative z-20 mt-4 text-[0.74rem] uppercase tracking-[0.24em] text-white/[0.4] sm:text-[0.78rem]">
              Oferta por tempo limitado
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
