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
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-white/[0.58]">
            Etapa decisiva da campanha
          </div>

          <h1 className="font-hero mt-5 text-[2.9rem] leading-[0.88] text-white sm:text-[4.7rem]">
            Sua oferta esta
            <span className="mt-1 block text-white/[0.64]">quase liberada</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[42rem] text-[0.98rem] leading-7 text-white/[0.72] sm:text-[1.06rem] sm:leading-8">
            Abra a rodada promocional, encontre 2 premios e siga para o resgate
            da nova camisa com a condicao da campanha reservada para esta etapa.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-left sm:gap-3">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-3 py-3 sm:px-4">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.42]">
                Oferta
              </p>
              <p className="mt-2 text-[0.98rem] font-semibold text-white sm:text-[1.08rem]">
                Ate R$ 139,19
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-3 py-3 sm:px-4">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.42]">
                Meta
              </p>
              <p className="mt-2 text-[0.98rem] font-semibold text-white sm:text-[1.08rem]">
                2 premios
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-3 py-3 sm:px-4">
              <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.42]">
                Etapa
              </p>
              <p className="mt-2 text-[0.98rem] font-semibold text-white sm:text-[1.08rem]">
                Rodada rapida
              </p>
            </div>
          </div>
        </div>

        <PromoGame claimHref="/dados" />

        <p className="mt-3 text-center text-[0.74rem] uppercase tracking-[0.22em] text-white/[0.34] sm:text-[0.78rem]">
          Acerte 2 premios para seguir com o resgate
        </p>
      </section>
    </main>
  );
}
