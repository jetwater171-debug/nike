import Image from "next/image";
import Link from "next/link";

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
    label: "Codigo",
    value: "IU1074-417",
    detail: "Edicao Match masculina para futebol.",
  },
];

const storyCards = [
  {
    eyebrow: "Nike Aero-FIT",
    title: "Ventilacao de elite",
    text: "Leveza, elasticidade e fluxo de ar direto na pele para segurar o ritmo quando o jogo sobe.",
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
    title: "Bastidores do design",
    text: "A leitura visual parte de um uniforme que parece bonito e perigoso ao mesmo tempo, com grafismo pensado para intimidar antes do primeiro toque.",
  },
  {
    title: "Corpo fresco sob pressao",
    text: "A pagina da Nike apresenta a Aero-FIT como a base de resfriamento da peça, feita para circular o ar e manter a sensacao seca em temperatura alta.",
  },
  {
    title: "Tamanhos e personalizacao",
    text: "A grade vai de P a GGG e a camisa aparece no site com opcao de personalizacao, reforcando o carater de produto principal da colecao.",
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
    <article className="liquid-panel h-full p-6">
      <p className="text-[0.68rem] uppercase tracking-[0.3em] text-white/[0.45]">
        {eyebrow}
      </p>
      <h3 className="mt-4 font-display text-2xl text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/[0.68]">{text}</p>
    </article>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white selection:bg-white selection:text-black">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-14rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(19,74,255,0.26),transparent_62%)] blur-3xl" />
        <div className="absolute left-[12%] top-[22rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(124,220,203,0.14),transparent_66%)] blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(24,73,255,0.18),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,15,0.08)_0%,rgba(4,4,4,0)_18%,rgba(4,4,4,0.22)_100%)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4">
        <div className="liquid-pill relative flex h-16 w-full max-w-[22rem] items-center justify-center rounded-full px-6 sm:max-w-[28rem]">
          <div className="absolute inset-y-[1px] left-[12%] right-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] opacity-60 blur-md" />
          <NikeSwoosh className="relative z-10 h-5 w-auto text-white/80 drop-shadow-[0_0_18px_rgba(255,255,255,0.14)]" />
        </div>
      </header>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 pb-20 pt-28 sm:px-8 lg:px-12">
        <div className="grid w-full gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.68rem] uppercase tracking-[0.32em] text-white/[0.55]">
              <span className="h-2 w-2 rounded-full bg-[#8fe4d3]" />
              Brasil Jordan II 2026/27
            </div>

            <h1 className="mt-8 font-display text-5xl leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-[5.8rem]">
              Brasil, em
              <span className="block text-white/[0.64]">modo noturno.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/[0.72] sm:text-lg">
              A camisa Brasil Jordan II 2026/27 Jogador chega com a base Match
              da Nike, tecnologia Aero-FIT e um visual azul-preto criado para
              parecer elegante, raro e intimidador no primeiro olhar.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={productUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/[0.15] bg-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform duration-300 hover:-translate-y-0.5"
              >
                Ver produto na Nike
              </Link>
              <Link
                href="#story"
                className="inline-flex items-center rounded-full border border-white/[0.15] bg-white/[0.06] px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/[0.88] transition-colors duration-300 hover:border-white/25 hover:bg-white/10"
              >
                Explorar a camisa
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <article key={item.label} className="liquid-panel p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.42]">
                    {item.label}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="liquid-stage relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.14))]" />
              <div className="absolute left-1/2 top-5 h-14 w-[70%] -translate-x-1/2 rounded-full bg-white/[0.16] blur-3xl" />
              <div className="absolute inset-x-10 top-10 h-[1px] bg-white/[0.12]" />
              <div className="absolute bottom-10 left-8 right-8 h-[38%] rounded-[2rem] border border-white/[0.08]" />

              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/[0.18] px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-white/[0.68] backdrop-blur-xl sm:left-6 sm:top-6">
                Edicao jogador
              </div>

              <div className="absolute bottom-5 left-5 hidden max-w-[13rem] rounded-[1.4rem] border border-white/[0.12] bg-black/[0.22] p-4 text-sm leading-6 text-white/[0.68] backdrop-blur-2xl xl:block">
                A Nike destaca a recomendacao de subir um tamanho para deixar o
                caimento mais confortavel.
              </div>

              <div className="absolute right-5 top-20 hidden max-w-[13rem] rounded-[1.4rem] border border-white/[0.12] bg-black/[0.22] p-4 text-sm leading-6 text-white/[0.68] backdrop-blur-2xl xl:block">
                Azul royal, preto, verde-agua e amarelo para um visual mais
                afiado e raro.
              </div>

              <Image
                src="/assets/nike-brazil-jordan-ii-a3.jpg"
                alt="Camisa Brasil Jordan II 2026/27 Jogador Masculina"
                width={1400}
                height={1400}
                priority
                className="relative z-10 mx-auto w-full max-w-[34rem] object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.78)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="story"
        className="relative mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-12 lg:py-12"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <article className="liquid-panel p-8 sm:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
              Manifesto
            </p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Um uniforme desenhado para parecer frio, tecnico e ameacador.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
              A narrativa oficial da Nike coloca a camisa nessa linha entre
              beleza e perigo. O resultado e uma peca com energia mais sombria,
              pensada para carregar a presenca da Selecao e o corte autentico de
              uma camisa de jogo.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {storyCards.map((item) => (
                <StoryCard key={item.title} {...item} />
              ))}
            </div>
          </article>

          <aside className="liquid-panel p-8 sm:p-10">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
              Ficha tecnica
            </p>
            <h2 className="mt-5 font-display text-3xl text-white sm:text-4xl">
              O essencial da peca.
            </h2>
            <ul className="mt-8 space-y-4 text-sm uppercase tracking-[0.2em] text-white/70">
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

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
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

      <section className="relative mx-auto w-full max-w-7xl px-6 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="liquid-panel relative min-h-[30rem] overflow-hidden p-8 sm:p-10">
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
                Lado sombrio do futebol
              </p>
              <h2 className="mt-5 max-w-lg font-display text-4xl leading-tight text-white sm:text-5xl">
                Presenca de colecao, leitura de jogo.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/[0.72]">
                A direcao criativa da camisa trabalha uma sensacao de ataque,
                com contraste escuro e detalhes vivos que reforcam o impacto da
                peca mesmo fora do campo.
              </p>
            </div>
          </article>

          <div className="grid gap-6">
            {buildNotes.map((item) => (
              <article key={item.title} className="liquid-panel p-8 sm:p-10">
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-white/[0.42]">
                  Insight
                </p>
                <h3 className="mt-5 font-display text-3xl text-white">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6 text-sm text-white/40 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>Camisa Brasil Jordan II 2026/27 Jogador Masculina.</p>
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
    </main>
  );
}
