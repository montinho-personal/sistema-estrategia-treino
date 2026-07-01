import Link from "next/link";
import { ShieldCheck, Sparkles, MessageSquareText, Check, ArrowRight } from "lucide-react";

import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IDENTITY, PRINCIPLES, FLOW, MODULES } from "@/lib/site-content";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lead}</p>
      ) : null}
    </div>
  );
}

const PHILOSOPHY = [
  {
    icon: ShieldCheck,
    title: "O treinador decide",
    desc: "A IA questiona, sugere, explica e organiza. Nunca substitui o seu conhecimento — ele continua no centro de tudo.",
  },
  {
    icon: Sparkles,
    title: "Baseado em ciência",
    desc: "Fundamentado nas evidências atuais e nas metodologias dos maiores especialistas — sempre adaptado ao contexto.",
  },
  {
    icon: MessageSquareText,
    title: "Clareza acima de tudo",
    desc: "O aluno entende o motivo de cada decisão. Comunicação direta, com a percepção de valor de uma consultoria premium.",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_srgb,var(--gold)_10%,transparent)_0%,transparent_70%)]"
          />
          <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 md:pt-36">
            <Badge variant="outline" className="gap-2 bg-surface shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-foreground">v2.0</span>
              <span>Plataforma profissional · Next.js</span>
            </Badge>

            <h1 className="mt-6 max-w-[16ch] text-balance text-5xl font-[680] leading-[1.02] tracking-[-0.045em] sm:text-6xl md:text-7xl">
              A estratégia de treino do seu aluno, elevada a outro nível.
            </h1>

            <p className="mt-6 max-w-[52ch] text-xl leading-relaxed text-muted-foreground">
              Um assistente estratégico para Personal Trainers. Transforma uma
              simples anamnese em uma estratégia personalizada extremamente
              profissional — sem nunca decidir por você.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/alunos">
                  Abrir workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#fluxo">Ver como funciona</a>
              </Button>
            </div>

            <div className="mt-24 flex flex-wrap items-baseline gap-x-12 gap-y-4 border-t border-border pt-12">
              <p className="text-xl font-semibold tracking-[-0.02em]">
                {IDENTITY.slogan[0]}
                <br />
                {IDENTITY.slogan[1]}
              </p>
              <p className="max-w-sm text-[15px] text-muted-foreground">
                Não é um gerador de treino. É a forma como você entrega o seu
                trabalho.
              </p>
            </div>
          </div>
        </section>

        {/* FILOSOFIA */}
        <section id="filosofia" className="border-y border-border bg-surface py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead
              eyebrow="Filosofia"
              title="Como um treinador de elite explicaria ao seu aluno."
              lead="Antes de qualquer resposta, o sistema pensa como um Personal experiente. Toda decisão possui justificativa. Todo material parece feito exclusivamente para aquele aluno."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {PHILOSOPHY.map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-bg p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(10,10,11,0.05)]"
                >
                  <div className="mb-5 grid size-11 place-items-center rounded-xl bg-gold-soft text-gold">
                    <c.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{c.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FLUXO */}
        <section id="fluxo" className="py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead
              eyebrow="Como funciona"
              title="Do primeiro dado à entrega premium."
              lead="O sistema nunca gera a estratégia sozinho. Primeiro conduz uma entrevista inteligente com você. Depois transforma cada decisão em uma apresentação impecável."
            />
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {FLOW.map((s) => (
                <div key={s.n} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <span className="text-xs font-semibold tabular-nums tracking-wide text-gold">
                    {s.n}
                  </span>
                  <h4 className="mt-2.5 text-base font-semibold tracking-[-0.02em]">{s.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRINCÍPIOS */}
        <section className="border-t border-border py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead eyebrow="Princípios" title="Quatro regras que guiam cada resposta." />
            <div className="grid gap-6 md:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <div key={p.n} className="rounded-2xl border border-border bg-surface p-8">
                  <span className="text-sm font-semibold tabular-nums text-gold">
                    Princípio {p.n}
                  </span>
                  <h3 className="mt-2.5 text-lg font-semibold tracking-[-0.02em]">{p.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POSICIONAMENTO */}
        <section className="py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground shadow-[0_30px_80px_rgba(10,10,11,0.18)] sm:px-16 sm:py-20">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Posicionamento
              </span>
              <h2 className="mx-auto mt-4 max-w-[20ch] text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                É um assistente estratégico. Não um chatbot.
              </h2>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {IDENTITY.positioningNegatives.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/50 line-through"
                  >
                    {n}
                  </span>
                ))}
                <span className="rounded-full bg-white/12 px-4 py-2 text-sm text-white">
                  {IDENTITY.positioningPositive}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MÓDULOS */}
        <section id="modulos" className="py-28">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHead
              eyebrow="Roadmap"
              title="Construído em módulos."
              lead="Oito módulos, do conceito à entrega premium — cada um mantendo o mesmo padrão."
            />
            <div className="overflow-hidden rounded-2xl border border-border">
              {MODULES.map((m, i) => (
                <div
                  key={m.id}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-5 bg-surface p-6 transition-colors hover:bg-bg ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="hidden text-sm font-semibold tabular-nums text-muted-foreground sm:block">
                    {m.id}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{m.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                  <Badge variant={m.status === "now" ? "gold" : "outline"}>
                    {m.status === "now" ? (
                      <>
                        <Check className="size-3" /> Disponível
                      </>
                    ) : (
                      "Em breve"
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REGRA */}
        <section className="border-t border-border bg-surface py-28">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Eyebrow>A regra mais importante</Eyebrow>
            <blockquote className="mt-6 text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
              &ldquo;Se eu fosse um aluno pagando uma consultoria premium, eu ficaria{" "}
              <span className="text-gold">impressionado</span> ao receber esse
              material?&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground">
              Se a resposta for não, o sistema melhora o material — e repete até
              atingir o nível premium.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
