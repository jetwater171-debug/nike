import Link from "next/link";

export default function DadosPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10 text-white">
      <section className="liquid-panel w-full max-w-md rounded-[2rem] p-7 text-center sm:p-9">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
          Proxima etapa
        </p>
        <h1 className="font-hero mt-4 text-[2rem] text-white sm:text-[2.6rem]">
          Dados em montagem
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/[0.68]">
          Essa tela de dados vai ser montada na proxima etapa. Por enquanto, o
          fluxo ja chega aqui sem quebrar a navegacao.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.06] px-6 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:border-white/[0.24] hover:bg-white/[0.1]"
        >
          Voltar para a campanha
        </Link>
      </section>
    </main>
  );
}
