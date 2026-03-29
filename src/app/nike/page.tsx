import Link from "next/link";
import NikeLiquidHeader from "../components/NikeLiquidHeader";

export default function NikePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 pb-16 pt-24 text-white sm:px-8 lg:px-12">
      <NikeLiquidHeader />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.42))]" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl items-center">
        <div className="liquid-panel w-full rounded-[2rem] p-6 text-center sm:p-8">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.42]">
            Proxima etapa
          </p>
          <h1 className="font-hero mt-4 text-[2.3rem] text-white sm:text-[3rem]">
            Pagina nike em montagem
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/[0.68]">
            O fluxo ja chegou na rota certa. Agora a gente pode montar essa
            etapa com o mesmo nivel premium da campanha.
          </p>

          <Link
            href="/dados"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] px-6 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:border-white/[0.24] hover:bg-white/[0.1]"
          >
            Voltar para dados
          </Link>
        </div>
      </section>
    </main>
  );
}
