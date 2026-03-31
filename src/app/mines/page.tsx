import PromoGame from "../components/PromoGame";
import NikeLiquidHeader from "../components/NikeLiquidHeader";

export default function MinesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_62%)]" />
      </div>

      <NikeLiquidHeader />

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-12 pt-24 sm:px-8 lg:px-12">
        <div className="liquid-panel relative z-10 w-full max-w-[39rem] px-4 py-5 text-center sm:px-6 sm:py-6">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-white/[0.44] sm:text-[0.68rem]">
            Rodada promocional
          </p>

          <h1 className="font-hero mt-3 leading-[0.88] text-white">
            <span className="block whitespace-nowrap text-[clamp(2rem,8vw,4rem)]">
              Encontre 2 premios
            </span>
            <span className="mt-0.5 block whitespace-nowrap text-[clamp(2rem,7.7vw,4rem)] text-white/[0.64]">
              e libere sua oferta
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-[31rem] text-[0.93rem] leading-6 text-white/[0.72] sm:text-[1.02rem] sm:leading-7">
            Algumas casas escondem prêmios, umas estão vazias e tem <strong className="font-semibold text-white/90">4 bombas</strong> espalhadas. Você deve acertar 2 prêmios sem clicar em nenhuma das bombas!
          </p>
        </div>

        <PromoGame claimHref="/dados" />
      </section>
    </main>
  );
}
