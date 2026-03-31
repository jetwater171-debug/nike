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
          <div className="liquid-panel w-full max-w-[42rem] px-5 py-7 sm:px-8 sm:py-9">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/[0.48] sm:text-[0.76rem]">
              Campanha promocional Nike
            </p>

            <h1 className="font-hero mt-4 text-[2.95rem] leading-[0.88] text-white sm:text-[4.7rem] lg:text-[5.7rem]">
              Promocao exclusiva
              <span className="mt-1 block text-white/[0.64]">
                camisa do Brasil
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[34rem] text-[0.98rem] leading-7 text-white/[0.72] sm:text-[1.08rem] sm:leading-8">
              Desbloqueie ate 80% OFF na nova camisa da Selecao Brasileira em
              uma promocao relampago criada para liberar sua melhor oferta em
              poucos toques.
            </p>
          </div>

          <div className="mt-0 flex w-full max-w-[26rem] flex-col items-center sm:mt-1 sm:max-w-[30rem]">
            <HeroScrollVideo className="-mt-1 sm:-mt-2 lg:-mt-2 sm:max-w-[25.5rem] lg:max-w-[28rem]" />

            <div className="-mt-12 text-center sm:-mt-14">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/[0.56] sm:text-[0.8rem]">
                De <span className="line-through">R$ 749,99</span>
              </p>
              <p className="font-hero mt-2 text-[2.35rem] leading-[0.9] text-white sm:text-[3.2rem]">
                podendo chegar a
                <span className="mt-1 block text-emerald-400">R$ 139,19</span>
              </p>
            </div>

            <Link
              href="/mines"
              className="mt-6 inline-flex min-h-[3.9rem] w-full items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.07))] px-7 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.1))] hover:shadow-[0_28px_70px_rgba(0,0,0,0.58)] sm:min-h-[4.3rem] sm:text-[0.92rem]"
            >
              Desbloquear desconto
            </Link>

            <p className="mt-4 text-[0.74rem] uppercase tracking-[0.24em] text-white/[0.4] sm:text-[0.78rem]">
              Oferta por tempo limitado
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
