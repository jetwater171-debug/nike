import Link from "next/link";
import NikeCheckoutHeader from "../components/NikeCheckoutHeader";

export default function PagamentoPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <NikeCheckoutHeader backHref="/carrinho" />

      <div className="mx-auto flex min-h-screen w-full max-w-[38rem] items-center px-4 pb-10 pt-20">
        <section className="w-full rounded-[2rem] border border-black/10 bg-[#f6f6f6] px-6 py-8">
          <p className="text-[0.75rem] uppercase tracking-[0.22em] text-black/46">
            Pagamento
          </p>
          <h1 className="mt-4 text-[2.4rem] font-semibold leading-[0.95]">
            A etapa de pagamento entra aqui na proxima sequencia.
          </h1>
          <p className="mt-4 max-w-[28rem] text-[1.02rem] leading-7 text-black/68">
            O carrinho ja esta pronto. Agora a proxima tela pode receber PIX,
            identificacao final e confirmacao do pedido.
          </p>

          <Link
            href="/carrinho"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-6 text-[0.96rem] font-medium text-white transition-transform duration-300 hover:scale-[1.01]"
          >
            Voltar ao carrinho
          </Link>
        </section>
      </div>
    </main>
  );
}
