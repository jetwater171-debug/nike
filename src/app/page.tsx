import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const PromoGame = dynamic(() => import("./components/PromoGame"), {
  ssr: false,
  loading: () => <PromoGameSkeleton />,
});

const productUrl =
  "https://www.nike.com.br/camisa-brasil-jordan-ii-2026-27-jogador-masculina-097619.html";

const heroStats = [
  {
    label: "Preco",
    value: "R$ 749,99",
    detail: "ou 7x de R$ 107,14 sem juros",
  },
  {
    label: "Caimento",
    value: "Player issue",
    detail: "A Nike recomenda um tamanho acima para mais conforto.",
  },
  {
    label: "Promocao",
    value: "Cupons ativos",
    detail: "A home tambem abre acesso a frete gratis e desconto na oferta.",
  },
];

const mobileSignals = ["Aero-FIT", "Player issue", "P ao GGG"];

const storyCards = [
  {
    eyebrow: "Promocao Nike",
    title: "Cupons dentro da campanha",
    text: "A pagina combina apresentacao premium da camisa com uma dinamica promocional pensada para liberar beneficios durante a navegacao.",
  },
  {
    eyebrow: "Colecao Match",
    title: "Mesma presenca de campo",
    text: "A construcao replica a camisa usada pelos profissionais, com acabamento autentico e sensacao de partida.",
  },
  {
    eyebrow: "Direcao visual",
    title: "Azul royal com sombra",
    text: "A base azul e preta recebe pontos em verde-agua e amarelo para deixar o uniforme mais ameaçador e raro.",
  },
];

const productSpecs = [
  "Futebol",
  "Masculina",
  "100% poliester",
  "Lavavel a maquina",
  "Design autentico",
  "Importada",
  "Cor azul",
];

const buildNotes = [
  {
    title: "Campanha com foco em conversao",
    text: "A narrativa da landing foi ajustada para vender a camisa como produto principal e, ao mesmo tempo, posicionar a promocao de cupons como reforco da oferta.",
  },
  {
    title: "Corpo fresco sob pressao",
    text: "A pagina da Nike apresenta a Aero-FIT como a base de resfriamento da peça, feita para circular o ar e manter a sensacao seca em temperatura alta.",
  },
  {
    title: "Beneficios sem poluir o hero",
    text: "Os cupons entram como camada de incentivo logo abaixo da apresentacao principal, preservando o visual premium e mantendo a leitura comercial da pagina.",
  },
];

function NikeSwoosh({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="135.5 361.38 1000 356.39"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 301.0914-38.08158 16.2806-48.26521 20.3928-66.16827 26.6785-45.76525 16.0714-86.76008 23.7398-119.89779 22.4235z"
        fill="currentColor"
      />
    </svg>
  );
}

function StoryCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <article className="liquid-panel h-full p-5 sm:p-6">
      <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/[0.45]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-[1.65rem] text-white sm:mt-4 sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/[0.68] sm:leading-7">
        {text}
      </p>
    </article>
  );
}

function PromoGameSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="section-shell relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-16 sm:px-8 lg:px-12"
    >
      <div className="liquid-panel mx-auto max-w-lg overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-10 w-48 rounded-full bg-white/[0.08]" />
        <div className="mx-auto mt-4 h-4 w-full max-w-sm rounded-full bg-white/[0.06]" />
        <div className="mx-auto mt-2 h-4 w-5/6 rounded-full bg-white/[0.05]" />

        <div className="mx-auto mt-10 grid w-full max-w-[280px] grid-cols-4 gap-3 sm:max-w-[340px] sm:gap-4">
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] sm:rounded-[1.25rem]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden pb-28 text-white selection:bg-white selection:text-black md:pb-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_46%,rgba(0,0,0,0.22)_100%)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
        <div className="liquid-pill relative flex h-16 w-full max-w-[22rem] items-center justify-center rounded-full px-6 sm:max-w-[28rem]">
          <div className="absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] opacity-60 blur-md" />
          <NikeSwoosh className="relative z-10 h-5 w-auto text-white/80 drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]" />
        </div>
      </header>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pb-16 pt-24 sm:px-8 lg:px-12">
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-4">
            <div className="liquid-panel p-5 sm:p-8 sm:pr-5 lg:pr-6">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.58] sm:gap-3 sm:px-4 sm:text-[0.68rem] sm:tracking-[0.32em]">
                  <span className="h-2 w-2 rounded-full bg-[#8fe4d3]" />
                  Promocao Mines Nike
                </div>

                <p className="mt-4 text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.42] sm:text-[0.68rem] sm:tracking-[0.3em]">
                  Cupons da campanha oficial
                </p>

                <h1 className="mt-3 max-w-3xl font-display text-[2.35rem] leading-[0.9] text-white sm:text-[4.1rem] lg:text-[5.4rem]">
                  Promocao Mines.
                  <span className="block text-white/[0.62]">Cupons da Nike.</span>
                </h1>

                <p className="mt-3 max-w-2xl text-[0.9rem] leading-6 text-white/[0.68] sm:mt-5 sm:text-base sm:leading-7">
                  Role a pagina, toque em iniciar e acerte apenas 2 cupons para
                  liberar os dois beneficios da campanha para voce. A proposta
                  e simples: entrar na dinamica, ganhar frete gratis e ainda
                  buscar o cupom de desconto na mesma experiencia.
                </p>

                <div className="mt-4 sm:mt-6">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/[0.42] sm:text-[0.68rem] sm:tracking-[0.3em]">
                    Preco
                  </p>
                  <p className="mt-1 text-[1.35rem] font-semibold text-white sm:text-[2rem]">
                    R$ 749,99
                  </p>
                  <p className="text-[0.72rem] text-white/[0.58] sm:text-sm">
                    7x de R$ 107,14 sem juros
                  </p>
                </div>

                <div className="mt-5 grid gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
                  <Link
                    href={productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-black sm:min-h-12 sm:w-auto sm:px-7 sm:text-sm sm:tracking-[0.18em]"
                  >
                    Abrir na Nike
                  </Link>
                  <Link
                    href="#promo"
                    className="hidden min-h-12 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.06] px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white/[0.88] transition-colors duration-300 hover:border-white/25 hover:bg-white/10 sm:inline-flex"
                  >
                    Rolar para iniciar
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[20rem] items-center justify-center sm:min-h-[28rem] lg:-ml-4 lg:min-h-[34rem] lg:justify-end">
              <video
                aria-hidden="true"
                autoPlay
                disablePictureInPicture
                loop
                muted
                playsInline
                poster="/assets/hero-jersey-poster.webp"
                preload="metadata"
                tabIndex={-1}
                className="hero-media pointer-events-none relative z-10 h-[19rem] w-full max-w-[11.5rem] select-none object-contain sm:h-[28rem] sm:max-w-[14rem] lg:h-[34rem] lg:max-w-[16rem]"
              >
                <source src="/assets/hero-jersey-loop.webm" type="video/webm" />
                <source src="/assets/hero-jersey-loop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-1 md:hidden">
            {mobileSignals.map((signal) => (
              <div
                key={signal}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center text-[0.62rem] uppercase tracking-[0.24em] text-white/[0.62]"
              >
                {signal}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {heroStats.map((item, index) => (
              <article
                key={item.label}
                className={`liquid-panel p-4 sm:p-5 ${
                  index === 0 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.42]">
                  {item.label}
                </p>
                <p
                  className={`mt-3 font-semibold text-white ${
                    index === 0
                      ? "text-[1.9rem] sm:mt-4 sm:text-2xl"
                      : "text-[1.15rem] sm:mt-4 sm:text-2xl"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-[0.82rem] leading-5 text-white/60 sm:text-sm sm:leading-6">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="story"
        className="section-shell relative mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-6 sm:px-8 lg:px-12 lg:py-12"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <article className="liquid-panel p-6 sm:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
              Manifesto
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-[2.25rem] leading-tight text-white sm:mt-5 sm:text-5xl">
              Uma promocao premium montada para vender a camisa e valorizar a oferta.
            </h2>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-white/70 sm:mt-6 sm:text-base sm:leading-8">
              A narrativa oficial da Nike continua no centro, mas agora a pagina
              tambem enquadra a camisa como nucleo de uma campanha promocional
              de cupons. O visual segue limpo, escuro e mais editorial para nao
              parecer uma oferta comum.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {storyCards.map((item) => (
                <StoryCard key={item.title} {...item} />
              ))}
            </div>
          </article>

          <aside className="liquid-panel p-6 sm:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
              Ficha tecnica
            </p>
            <h2 className="mt-4 font-display text-[2rem] text-white sm:mt-5 sm:text-4xl">
              O essencial da peca.
            </h2>
            <ul className="mt-6 space-y-3 text-[0.76rem] uppercase tracking-[0.18em] text-white/70 sm:mt-8 sm:space-y-4 sm:text-sm sm:tracking-[0.2em]">
              {productSpecs.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4"
                >
                  <span>{item}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8fe4d3]" />
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:mt-8 sm:p-6">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/[0.42]">
                Grade
              </p>
              <p className="mt-4 text-2xl font-semibold text-white">
                P ao GGG
              </p>
              <p className="mt-3 text-sm leading-7 text-white/[0.63]">
                A pagina oficial mostra a grade completa e ativa opcao de
                personalizacao para o modelo.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-shell relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="liquid-panel relative min-h-[24rem] overflow-hidden p-6 sm:min-h-[30rem] sm:p-10">
            <div className="absolute inset-0">
              <Image
                src="/assets/nike-brazil-jordan-ii-a3.jpg"
                alt="Detalhe da Camisa Brasil Jordan II 2026/27 Jogador Masculina"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-top opacity-55"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.08),rgba(4,4,4,0.58)_54%,rgba(4,4,4,0.92))]" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.48]">
                Campanha promocional
              </p>
              <h2 className="mt-4 max-w-lg font-display text-[2.25rem] leading-tight text-white sm:mt-5 sm:text-5xl">
                A camisa no centro. Os cupons como impulso.
              </h2>
              <p className="mt-4 max-w-lg text-[0.98rem] leading-7 text-white/[0.72] sm:mt-5 sm:text-base sm:leading-8">
                O produto continua sendo o protagonista. A promocao entra como
                camada de interesse para aumentar a permanencia, aquecer o lead
                e empurrar o clique para a oferta oficial.
              </p>
            </div>
          </article>

          <div className="grid gap-6">
            {buildNotes.map((item) => (
              <article key={item.title} className="liquid-panel p-6 sm:p-10">
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
                  Insight
                </p>
                <h3 className="mt-4 font-display text-[2rem] text-white sm:mt-5 sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-white/70 sm:text-base sm:leading-8">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PromoGame />

      <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 text-sm text-white/40 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>Camisa Brasil Jordan II 2026/27 Jogador Masculina em campanha promocional.</p>
          <Link
            href={productUrl}
            target="_blank"
            rel="noreferrer"
            className="uppercase tracking-[0.24em] text-white/[0.58] transition-colors hover:text-white"
          >
            Fonte oficial Nike
          </Link>
        </div>
      </footer>

      <div className="mobile-buy-bar md:hidden">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.24em] text-white/[0.46]">
            Camisa Brasil Jordan II 26/27
          </p>
          <p className="mt-1 text-lg font-semibold text-white">R$ 749,99</p>
          <p className="text-[0.72rem] text-white/[0.58]">
            7x de R$ 107,14 sem juros
          </p>
        </div>
        <Link
          href={productUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-black"
        >
          Ver na Nike
        </Link>
      </div>
    </main>
  );
}
