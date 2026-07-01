import type { ReactNode } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import type { Brand } from "@/lib/domain/schema/brand";
import { reportClosing, studentDiagnosisData } from "@/lib/domain";
import { val, has, upperFirst, lowerFirst } from "@/lib/domain/util";
import { whatsappLink, instagramLink } from "@/lib/premium/links";
import { PgIcon, PgCheck } from "./premium-icons";
import { QrBlock } from "./qr-block";

function PageFoot({ brand, n }: { brand: Brand; n: number }) {
  return (
    <div className="pg-foot">
      <span>{brand.nome}</span>
      <span>Montinho Training Strategy</span>
      <span>{n} / 5</span>
    </div>
  );
}

function Card({ icon, label, value }: { icon: Parameters<typeof PgIcon>[0]["name"]; label: string; value: string }) {
  return (
    <div className="pg-card">
      <span className="pg-card__ic"><PgIcon name={icon} /></span>
      <div className="pg-card__lbl">{label}</div>
      <div className="pg-card__val">{value || "—"}</div>
    </div>
  );
}

function Block({ title, icon, value, detail, badges }: { title: string; icon: Parameters<typeof PgIcon>[0]["name"]; value: string; detail?: string; badges?: string[] }) {
  return (
    <div className="pg-block">
      <div className="pg-block__h">
        <span className="pg-block__ic"><PgIcon name={icon} /></span>
        {title}
      </div>
      {has(value) && <div className="pg-block__v">{value}</div>}
      {has(detail) && <div className="pg-block__d">{detail}</div>}
      {badges && badges.length > 0 && (
        <div className="pg-badges">
          {badges.map((b) => <span key={b} className="pg-badge">{b}</span>)}
        </div>
      )}
    </div>
  );
}

function timelineSteps(fases: unknown): string[] {
  const raw = String(fases ?? "")
    .split(/;|→|\n|\.(?=\s*Fase)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  if (raw.length >= 2) return raw.slice(0, 5);
  return ["Adaptação e técnica", "Mais volume de treino", "Mais intensidade", "Técnicas avançadas"];
}

/* ------------------------------- páginas ------------------------------- */
export function CoverPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const a = state.anamnese;
  const nome = val(a.nome) || "Seu aluno";
  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const foot = [brand.nome, has(brand.whatsapp) ? `WhatsApp ${brand.whatsapp}` : "", brand.site].filter(Boolean).join("   ·   ");
  return (
    <section className="premium__page pg-cover">
      <div className="pg-cover__top">
        <div className="pg-brand"><span className="pg-mark">M</span><span>{brand.nome}</span></div>
        <div className="pg-cover__date">{date}</div>
      </div>
      <div className="pg-cover__mid">
        <div className="pg-eyebrow">Planejamento exclusivo</div>
        <div className="pg-cover__name">{nome}</div>
        <div className="pg-rule" />
        <h1 className="pg-cover__title">Montinho Training Strategy</h1>
        <div className="pg-cover__sub">Estratégia Personalizada de Treinamento</div>
        <p className="pg-cover__phrase">
          &ldquo;Este planejamento foi desenvolvido exclusivamente para os seus objetivos, a sua rotina
          e as suas necessidades.&rdquo;
        </p>
      </div>
      <div className="pg-cover__foot">{foot}</div>
    </section>
  );
}

export function DiagnosticoPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const a = state.anamnese, x = state.answers;
  const disp = [has(a.diasSemana) ? `${a.diasSemana} dias/semana` : "", has(a.tempoSessao) ? `${a.tempoSessao} min` : ""].filter(Boolean).join(" · ");
  const d = studentDiagnosisData(state);
  const fortes = d.fortes.length ? d.fortes : ["Ótima disposição para começar essa jornada"];
  const atencao = d.atencao.length ? d.atencao : ["Nada crítico — vamos apenas construir consistência"];
  return (
    <section className="premium__page">
      <h2 className="pg-h2">Diagnóstico Inicial</h2>
      <div className="pg-grid4">
        <Card icon="target" label="Objetivo" value={val(x.objetivo_principal) || val(a.objetivo)} />
        <Card icon="medal" label="Experiência" value={val(a.experiencia)} />
        <Card icon="calendar" label="Disponibilidade" value={disp} />
        <Card icon="star" label="Prioridades" value={val(x.objetivo_prioridade)} />
      </div>
      <div className="pg-2col">
        <div className="pg-box">
          <div className="pg-box__t">Pontos fortes</div>
          <ul className="pg-check">
            {fortes.map((f, i) => (
              <li key={i}><span className="pg-tick"><PgCheck /></span>{upperFirst(f)}</li>
            ))}
          </ul>
        </div>
        <div className="pg-box">
          <div className="pg-box__t">Pontos de atenção</div>
          <ul className="pg-dot">
            {atencao.map((t, i) => <li key={i}>{upperFirst(t)}</li>)}
          </ul>
        </div>
      </div>
      <div className="pg-highlight">
        <div className="pg-highlight__t">Nossa filosofia</div>
        <p>
          {has(x.filosofia_frase) && <>&ldquo;{val(x.filosofia_frase)}&rdquo; </>}
          Cada escolha do seu treino tem um motivo. Nada aqui é por acaso — este plano foi montado
          para fazer sentido para você e para a sua realidade.
        </p>
      </div>
      <PageFoot brand={brand} n={2} />
    </section>
  );
}

export function EstrategiaPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const x = state.answers;
  const reps = has(x.intensidade_reps) ? `Repetições: ${val(x.intensidade_reps)}` : "";
  const tec = Array.isArray(x.intensidade_tecnicas) ? x.intensidade_tecnicas : [];
  const steps = timelineSteps(x.periodizacao_fases);
  return (
    <section className="premium__page">
      <h2 className="pg-h2">Estratégia</h2>
      <div className="pg-blocks">
        <Block title="Divisão semanal" icon="calendar" value={val(x.divisao_qual)} detail={val(x.divisao_porque)} />
        <Block title="Intensidade" icon="dumbbell" value={val(x.intensidade_estrategia)} detail={reps} badges={tec} />
      </div>
      <div className="pg-timeline">
        <div className="pg-timeline__t">A evolução do seu plano</div>
        <div>
          {steps.map((s, i) => (
            <div key={i} className="pg-tl">
              <span className="pg-tl__dot" />
              <span className="pg-tl__lbl"><b>{i === 0 ? "Início" : `Etapa ${i + 1}`}</b>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <PageFoot brand={brand} n={3} />
    </section>
  );
}

export function EvolucaoPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const x = state.answers;
  const mobItens = Array.isArray(x.mobilidade_o_que) ? x.mobilidade_o_que.join(", ") : "";
  const itens = Array.isArray(x.acompanhamento_info) ? x.acompanhamento_info : [];
  return (
    <section className="premium__page">
      <h2 className="pg-h2">Evolução</h2>
      <div className="pg-2col">
        <div className="pg-box">
          <div className="pg-box__t"><span className="pg-ic"><PgIcon name="mobility" /></span> Mobilidade e preparação</div>
          <p>
            {mobItens ? `Antes de cada treino: ${mobItens}. ` : ""}
            {has(x.mobilidade_porque) ? val(x.mobilidade_porque) : "Poucos minutos que preparam o corpo e protegem você."}
          </p>
        </div>
        <div className="pg-box">
          <div className="pg-box__t"><span className="pg-ic"><PgIcon name="trend" /></span> Regras de progressão</div>
          <p>{has(x.progressao_como) ? val(x.progressao_como) : "Você avança quando domina a etapa atual — evolução segura e constante."}</p>
        </div>
      </div>
      <div className="pg-highlight">
        <div className="pg-highlight__t">Seu papel no processo</div>
        {itens.length > 0 && (
          <>
            <div className="pg-check-inline__lead">Toda semana, me envie:</div>
            <div className="pg-check-inline">
              {itens.map((i) => <span key={i} className="pg-chip"><span className="pg-tick"><PgCheck /></span>{i}</span>)}
            </div>
          </>
        )}
        {has(x.acompanhamento_porque) && <p className="pg-muted">Isso me permite {lowerFirst(val(x.acompanhamento_porque))}</p>}
      </div>
      <PageFoot brand={brand} n={4} />
    </section>
  );
}

export function EncerramentoPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const contacts: ReactNode[] = [];
  if (has(brand.whatsapp)) contacts.push(<span key="w"><span className="pg-ic"><PgIcon name="chat" /></span>{brand.whatsapp}</span>);
  if (has(brand.site)) contacts.push(<span key="s"><span className="pg-ic"><PgIcon name="globe" /></span>{brand.site}</span>);
  if (has(brand.instagram)) contacts.push(<span key="i"><span className="pg-ic"><PgIcon name="instagram" /></span>{brand.instagram.replace(/^@?/, "@")}</span>);
  const waLink = whatsappLink(brand.whatsapp);
  const igLink = instagramLink(brand.instagram);
  return (
    <section className="premium__page pg-close">
      <div className="pg-eyebrow">Encerramento</div>
      <p className="pg-close__msg">{reportClosing(state)}</p>
      <p className="pg-close__commit">
        &ldquo;Estou muito feliz por fazer parte da sua evolução. Agora temos um planejamento sólido, e o
        meu compromisso é acompanhar cada passo e fazer todos os ajustes necessários para você chegar
        aonde quer, da melhor forma possível.&rdquo;
      </p>
      <div className="pg-sign">
        <span className="pg-mark">M</span>
        <div><b>{brand.nome}</b><span>Montinho Training Strategy</span></div>
      </div>
      {contacts.length > 0 && <div className="pg-contacts">{contacts}</div>}
      {(waLink || igLink) && (
        <div className="pg-qrs">
          {waLink && <QrBlock data={waLink} label="WhatsApp" />}
          {igLink && <QrBlock data={igLink} label="Instagram" />}
        </div>
      )}
      <PageFoot brand={brand} n={5} />
    </section>
  );
}
