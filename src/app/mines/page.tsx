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
        <PromoGame claimHref="/dados" />
      </section>
    </main>
  );
}
