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
        <div className="w-full max-w-2xl text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/[0.45]">
            Rodada promocional
          </p>
          <h1 className="font-hero mt-4 text-[2.9rem] leading-[0.88] text-white sm:text-[4.6rem]">
            Desbloqueie
            <span className="mt-1 block text-white/[0.64]">sua oferta</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[34rem] text-[0.98rem] leading-7 text-white/[0.72] sm:text-[1.05rem] sm:leading-8">
            Complete a rodada para liberar os beneficios da campanha e seguir
            com a nova camisa da Selecao Brasileira na oferta promocional.
          </p>
        </div>

        <PromoGame claimHref="/dados" />
      </section>
    </main>
  );
}
