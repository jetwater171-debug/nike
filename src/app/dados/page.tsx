import NikeLiquidHeader from "../components/NikeLiquidHeader";
import DadosLeadForm from "./DadosLeadForm";

export default function DadosPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 pb-16 pt-24 text-white sm:px-8 lg:px-12">
      <NikeLiquidHeader />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.42))]" />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl items-center">
        <div className="w-full">
          <DadosLeadForm />
        </div>
      </section>
    </main>
  );
}
