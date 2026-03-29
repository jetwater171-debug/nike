import NikeLiquidHeader from "../components/NikeLiquidHeader";
import DadosLeadForm from "./DadosLeadForm";

const infoChips = ["Nome completo", "CPF valido", "Email e telefone"];

export default function DadosPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 pb-16 pt-24 text-white sm:px-8 lg:px-12">
      <NikeLiquidHeader />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.42))]" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
        <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <div className="liquid-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-24 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_72%)] blur-3xl"
            />

            <div className="relative z-10">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.42]">
                Resgate Nike
              </p>
              <h1 className="font-hero mt-4 text-[2.4rem] text-white sm:text-[3.25rem]">
                Cupom pronto para seguir
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/[0.68] sm:text-[0.98rem]">
                Para resgatar o cupom da campanha, preencha suas informacoes.
                Esta etapa foi montada para liberar a continuidade da sua
                oferta de forma rapida, limpa e sem distracao.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {infoChips.map((chip) => (
                  <div
                    key={chip}
                    className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-center text-[0.64rem] uppercase tracking-[0.22em] text-white/[0.56]"
                  >
                    {chip}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/[0.38]">
                  Etapa de validacao
                </p>
                <p className="mt-2 text-sm leading-7 text-white/[0.6]">
                  Preencha os campos abaixo para continuar o resgate com a
                  mesma oferta mostrada na campanha.
                </p>
              </div>
            </div>
          </div>

          <DadosLeadForm />
        </div>
      </section>
    </main>
  );
}
