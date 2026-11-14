import type { ReactNode } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import { brandLogo, type Brand } from "@/lib/domain/schema/brand";
import {
  careView,
  divisionSessions,
  goldenRules,
  inlineSegments,
  intensityTerms,
  parseRichBlocks,
  phaseSteps,
  priorityTerms,
  progressionTerms,
  reportClosing,
  reportIntro,
  reportSections,
  resourceTerms,
  sessionMeaning,
  studentDiagnosisData,
  volumeBars,
  volumeInsight,
  volumeTotalTexto,
  weekPlan,
  type Term,
} from "@/lib/domain";
import type { ReportSection } from "@/lib/domain/report";
import { val, has, upperFirst, lowerFirst, firstName, toInt } from "@/lib/domain/util";
import { prioridadeGrupos } from "@/lib/domain/config";
import { whatsappLink, instagramLink } from "@/lib/premium/links";
import { PgIcon, PgCheck } from "./premium-icons";
import { QrBlock } from "./qr-block";

/** Marca gráfica: o logo enviado pelo treinador ou o logo oficial do Montinho. */
function PgMark({ brand, variant }: { brand: Brand; variant: "cover" | "sign" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo (data URL ou /brand), embutido também na exportação HTML
    <img src={brandLogo(brand)} alt={brand.nome} className={`pg-logo pg-logo--${variant}`} />
  );
}

function PageFoot({ brand, n, total }: { brand: Brand; n: number; total: number }) {
  return (
    <div className="pg-foot">
      <span>{brand.nome}</span>
      <span>Montinho Training Strategy</span>
      <span>{n} / {total}</span>
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

/* ------------------------------- páginas ------------------------------- */
export function CoverPage({ state, brand }: { state: StrategyState; brand: Brand }) {
  const a = state.anamnese;
  const nome = val(a.nome) || "Seu aluno";
  const titulo = val(a.tituloPlano) || "Estratégia de Treinamento";
  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const foot = [
    brand.nome,
    has(brand.whatsapp) ? `WhatsApp ${brand.whatsapp}` : "",
    brand.site,
    has(brand.instagram) ? brand.instagram.replace(/^@?/, "@") : "",
  ].filter(Boolean).join("   ·   ");
  return (
    <section className="premium__page pg-cover">
      <div className="pg-cover__top">
        <div className="pg-brand">
          <PgMark brand={brand} variant="cover" />
        </div>
        <div className="pg-cover__date">{date}</div>
      </div>
      <div className="pg-cover__mid">
        <div className="pg-eyebrow">Planejamento exclusivo</div>
        <div className="pg-cover__name">{nome}</div>
        <div className="pg-rule" />
        <h1 className="pg-cover__title">{titulo}</h1>
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

/* -------- helpers das páginas (decisão + tradução + porquê, juntos) -------- */
function Sec({ icon, title, children }: { icon: Parameters<typeof PgIcon>[0]["name"]; title: string; children: ReactNode }) {
  return (
    <div className="pg-sec">
      <div className="pg-block__h">
        <span className="pg-block__ic"><PgIcon name={icon} /></span>
        {title}
      </div>
      {children}
    </div>
  );
}

function Why({ text, label = "Por quê" }: { text: unknown; label?: string }) {
  if (!has(text)) return null;
  return <p className="pg-why"><b>{label}:</b> {val(text)}</p>;
}

function Terms({ items }: { items: Term[] }) {
  if (!items.length) return null;
  return (
    <div className="pg-terms">
      {items.map((t) => (
        <div key={t.nome} className="pg-term">
          <b>{t.nome}</b>
          {t.como && <span> — {lowerFirst(t.como)}</span>}
        </div>
      ))}
    </div>
  );
}

const Chips = ({ items }: { items: string[] }) => (
  <div className="pg-check-inline">
    {items.map((i) => <span key={i} className="pg-chip"><span className="pg-tick"><PgCheck /></span>{i}</span>)}
  </div>
);

const lista = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : has(v) ? [val(v)] : []);

/* ---------------------- 2 · Seu plano em 1 minuto ---------------------- */
export function ResumoPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
  const a = state.anamnese, x = state.answers;
  const rotina = [has(a.diasSemana) ? `${a.diasSemana} treinos por semana` : "", has(a.tempoSessao) ? `${toInt(a.tempoSessao) || val(a.tempoSessao)} min cada` : ""].filter(Boolean).join(" · ");
  const fases = phaseSteps(state);
  const semanas = fases.reduce((s, f) => s + (f.semanas ?? 0), 0);
  const prazo = val(x.objetivo_prazo) || (semanas ? `${semanas} semanas` : "");
  const week = weekPlan(state);
  const nome = firstName(a.nome);
  return (
    <section className="premium__page">
      <h2 className="pg-h2">Seu plano em 1 minuto</h2>
      <p className="pg-lead">
        {nome === "aluno" ? "Este" : `${nome}, este`} é o seu plano em resumo. Nas próximas páginas eu explico o porquê de cada escolha.
      </p>
      <div className="pg-grid4">
        <Card icon="target" label="Objetivo" value={val(x.objetivo_principal) || val(a.objetivo)} />
        <Card icon="calendar" label="Duração deste ciclo" value={prazo} />
        <Card icon="star" label="Prioridades" value={prioridadeGrupos(x).join(", ")} />
        <Card icon="dumbbell" label="Sua rotina" value={rotina} />
      </div>

      {week.dias.length > 0 && (
        <>
          <h3 className="pg-h3">A sua semana</h3>
          <div className={week.comDias ? "pg-week" : "pg-week pg-week--livre"}>
            {week.dias.map((d) => (
              <div key={d.dia} className={`pg-day ${d.treino ? "pg-day--on" : "pg-day--off"}`}>
                <b>{week.comDias ? d.dia.slice(0, 3) : d.dia}</b>
                <span>{d.treino ?? "Descanso"}</span>
                {d.significado && <small>{d.significado}</small>}
              </div>
            ))}
          </div>
        </>
      )}

      {fases.length > 0 && (
        <>
          <h3 className="pg-h3">As fases do seu plano</h3>
          <div className="pg-phases">
            {fases.map((f) => (
              <div key={f.numero} className="pg-phase">
                <b>Fase {f.numero}{f.semanas ? ` · ${f.semanas} semanas` : ""}</b>
                <span>{f.nome}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {has(x.filosofia_frase) && (
        <div className="pg-highlight" style={{ marginTop: 26 }}>
          <div className="pg-highlight__t">A ideia que guia o seu treino</div>
          <p>&ldquo;{val(x.filosofia_frase).replace(/^[“"]|[”"]$/g, "")}&rdquo;</p>
        </div>
      )}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}

/* ------------------------ 3 · De onde você parte ------------------------ */
export function PartidaPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
  const x = state.answers;
  const d = studentDiagnosisData(state);
  const care = careView(state);
  const fortes = d.fortes.length ? d.fortes : ["Ótima disposição para começar essa jornada"];
  // o cuidado com dor/lesão aparece de forma específica abaixo; aqui ficam os demais
  const atencao = d.atencao.filter((t) => !(care.contou.length && /incômodo/.test(t)));
  const prep = lista(x.mobilidade_o_que);
  const sec = lista(x.objetivo_secundario);
  return (
    <section className="premium__page">
      <h2 className="pg-h2">De onde você parte</h2>
      <div className="pg-box" style={{ marginTop: 26 }}>
        <div className="pg-box__t">O que joga a seu favor</div>
        <ul className="pg-check">
          {fortes.map((f, i) => (
            <li key={i}><span className="pg-tick"><PgCheck /></span>{upperFirst(f)}</li>
          ))}
        </ul>
      </div>

      {(care.contou.length > 0 || care.plano.length > 0 || atencao.length > 0) && (
        <div className="pg-box pg-box--warn" style={{ marginTop: 14 }}>
          <div className="pg-box__t">O que vamos cuidar juntos</div>
          {care.contou.length > 0 && (
            <>
              <div className="pg-mini">Você me contou</div>
              <ul className="pg-dot">{care.contou.map((t, i) => <li key={i}>{upperFirst(t)}</li>)}</ul>
            </>
          )}
          {(care.plano.length > 0 || atencao.length > 0) && (
            <>
              <div className="pg-mini" style={{ marginTop: care.contou.length ? 14 : 0 }}>O que o plano faz por isso</div>
              <ul className="pg-check">
                {[...care.plano, ...atencao].map((t, i) => (
                  <li key={i}><span className="pg-tick"><PgCheck /></span>{upperFirst(t)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {prep.length > 0 && (
        <>
          <h3 className="pg-h3">Antes de cada treino</h3>
          <Chips items={prep} />
          <p className="pg-muted">São poucos minutos que preparam o corpo e deixam o treino mais seguro.</p>
        </>
      )}

      {(has(x.objetivo_porque) || sec.length > 0) && (
        <div className="pg-highlight" style={{ marginTop: 26 }}>
          <div className="pg-highlight__t">Por que este é o foco agora</div>
          <p>
            {val(x.objetivo_porque) && <>{upperFirst(val(x.objetivo_porque))} </>}
            {sec.length > 0 && <>De quebra, também vamos trabalhar: {sec.map(lowerFirst).join(", ")}.</>}
          </p>
        </div>
      )}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}

/* --------------------- 4 · Como o treino foi montado --------------------- */
export function MontagemPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
  const x = state.answers;
  const grupos = prioridadeGrupos(x);
  const sessoes = [...new Set(divisionSessions(x.divisao_qual))].map((s) => ({ nome: s, como: sessionMeaning(s) })).filter((s) => s.como);
  const bars = volumeBars(state);
  const tot = volumeTotalTexto(state);
  const semCardio = val(x.cardio_have) === "Não";
  const logica = lista(x.exercicios_logica);
  return (
    <section className="premium__page pg-flow">
      <h2 className="pg-h2">Como o seu treino foi montado</h2>
      <p className="pg-lead">Cada decisão, o que ela significa na prática e por que eu escolhi assim para você.</p>

      {grupos.length > 0 && (
        <Sec icon="star" title="Suas prioridades">
          <div className="pg-sec__v">{grupos.join(" e ")}</div>
          <Terms items={priorityTerms(state)} />
        </Sec>
      )}

      {has(x.divisao_qual) && (
        <Sec icon="calendar" title="Como os treinos se dividem">
          <div className="pg-sec__v">{val(x.divisao_qual)}</div>
          <Terms items={sessoes} />
          <Why text={x.divisao_porque} />
          <Why text={x.divisao_vantagens} label="Vantagem para você" />
        </Sec>
      )}

      {bars.length > 0 && (
        <Sec icon="trend" title="Quanto cada músculo trabalha por semana">
          <p className="pg-sec__m">{volumeInsight(bars)}</p>
          <div className="pg-bars">
            {bars.map((b) => (
              <div key={b.grupo} className={`pg-bar${b.prioritario ? " pg-bar--pri" : ""}`}>
                <span className="pg-bar__g">{b.grupo}{b.prioritario && <i>prioridade</i>}</span>
                <span className="pg-bar__t"><span style={{ width: `${Math.max(b.pct, 4)}%` }} /></span>
                <span className="pg-bar__n">{b.texto} séries</span>
              </div>
            ))}
          </div>
          <p className="pg-muted">
            Uma “série” é cada sequência de repetições de um exercício.
            {tot != null && <> No total, são {tot} séries por semana.</>}
            {has(x.volume_frequencia) && <> Frequência: {lowerFirst(val(x.volume_frequencia))}.</>}
          </p>
          <Why text={x.volume_porque} />
        </Sec>
      )}

      {(has(x.intensidade_estrategia) || has(x.intensidade_reps)) && (
        <Sec icon="dumbbell" title="Como vamos trabalhar o esforço">
          {has(x.intensidade_reps) && <div className="pg-sec__v">Repetições: {val(x.intensidade_reps)}</div>}
          <Terms items={[...intensityTerms(state), ...resourceTerms(state)]} />
          <Why text={x.intensidade_porque} />
        </Sec>
      )}

      {(logica.length > 0 || has(x.exercicios_obrigatorio)) && (
        <Sec icon="medal" title="A escolha dos exercícios">
          {logica.length > 0 && <ul className="pg-dot" style={{ marginTop: 12 }}>{logica.map((t) => <li key={t}>{t}</li>)}</ul>}
          {has(x.exercicios_obrigatorio) && <p className="pg-sec__m"><b>Exercícios-chave do seu plano:</b> {val(x.exercicios_obrigatorio)}</p>}
          <Why text={x.exercicios_porque} />
        </Sec>
      )}

      {(has(x.cardio_have) || has(x.cardio_detalhe)) && (
        <Sec icon="pulse" title="Cardio">
          {semCardio ? (
            <div className="pg-sec__v">Sem cardio neste ciclo</div>
          ) : lista(x.cardio_detalhe).length ? (
            <div style={{ marginTop: 12 }}><Chips items={lista(x.cardio_detalhe)} /></div>
          ) : (
            <div className="pg-sec__v">Cardio incluído no plano</div>
          )}
          <Why text={x.cardio_porque} />
          <Why text={x.adapt_emagrecimento} label="Gasto energético" />
        </Sec>
      )}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}

/* --------------------- 5 · Sua jornada e o seu papel --------------------- */
export function JornadaPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
  const x = state.answers;
  const fases = phaseSteps(state);
  const prog = progressionTerms(state);
  const itens = lista(x.acompanhamento_info);
  return (
    <section className="premium__page">
      <h2 className="pg-h2">Sua jornada e o seu papel</h2>

      {fases.length > 0 && (
        <div className="pg-timeline" style={{ marginTop: 26 }}>
          <div className="pg-timeline__t">O que esperar de cada fase</div>
          {fases.map((f) => (
            <div key={f.numero} className="pg-tl">
              <span className="pg-tl__dot" />
              <div className="pg-tl__lbl">
                <b>Fase {f.numero}{f.semanas ? ` · ${f.semanas} semanas` : ""}</b>
                <strong>{f.nome}</strong>
                <span className="pg-tl__d">{f.esperar}</span>
              </div>
            </div>
          ))}
          {has(x.periodizacao_porque) && <p className="pg-timeline__why">{upperFirst(val(x.periodizacao_porque))}</p>}
          <p className="pg-timeline__why" style={{ borderTop: "none", paddingTop: 0, marginTop: 8 }}>
            A cada troca de fase, você recebe um documento mostrando o que conquistou e o que muda.
          </p>
        </div>
      )}

      {prog.length > 0 && (
        <>
          <h3 className="pg-h3">Como você vai evoluir</h3>
          <Terms items={prog} />
          <Why text={x.progressao_porque} />
        </>
      )}

      <h3 className="pg-h3">Regra de ouro: em todo treino</h3>
      <ol className="pg-mission">{goldenRules(state).map((t, i) => <li key={i}>{t}</li>)}</ol>

      {itens.length > 0 && (
        <div className="pg-highlight" style={{ marginTop: 26 }}>
          <div className="pg-highlight__t">Toda semana, me envie</div>
          <Chips items={itens} />
          <p className="pg-muted">
            {has(x.acompanhamento_porque)
              ? upperFirst(val(x.acompanhamento_porque))
              : "Com isso eu ajusto o seu treino na hora certa. A minha parte é planejar e ajustar; a sua é treinar e me contar como foi."}
          </p>
        </div>
      )}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}

/* ---- Detalhamento completo: todo o relatório escrito, no estilo premium ---- */
function renderInline(text: string, keyPrefix: string) {
  return inlineSegments(text).map((seg, i) =>
    seg.bold ? (
      <strong key={`${keyPrefix}-b-${i}`}>{seg.text}</strong>
    ) : (
      <span key={`${keyPrefix}-t-${i}`}>{seg.text}</span>
    ),
  );
}

function renderBody(body: string, keyPrefix: string) {
  return parseRichBlocks(body).map((b, i) => {
    const k = `${keyPrefix}-${i}`;
    if (b.type === "heading") {
      return <div key={k} className="pg-report__h">{renderInline(b.text, k)}</div>;
    }
    if (b.type === "list") {
      return (
        <ul key={k} className="pg-report__list">
          {b.items.map((it, j) => (
            <li key={j}>
              <span className="pg-tick"><PgCheck /></span>
              {renderInline(it, `${k}-${j}`)}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={k} className="pg-report__p">{renderInline(b.text, k)}</p>;
  });
}

export function DetalhamentoPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
  const intro = reportIntro(state);
  const sections: ReportSection[] = reportSections(state);
  return (
    <section className="premium__page pg-flow">
      <h2 className="pg-h2">Anexo: a estratégia por escrito</h2>
      {has(intro) && <div className="pg-report__lead">{renderBody(intro, "intro")}</div>}
      {sections.map((s) => (
        <div key={s.id} className="pg-report__sec">
          <h3 className="pg-report__t">{s.title}</h3>
          {renderBody(s.body, s.id)}
        </div>
      ))}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}

export function EncerramentoPage({ state, brand, n, total }: { state: StrategyState; brand: Brand; n: number; total: number }) {
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
        <PgMark brand={brand} variant="sign" />
        <div><b>{brand.nome}</b><span>Montinho Training Strategy</span></div>
      </div>
      {contacts.length > 0 && <div className="pg-contacts">{contacts}</div>}
      {(waLink || igLink) && (
        <div className="pg-qrs">
          {waLink && <QrBlock data={waLink} label="WhatsApp" />}
          {igLink && <QrBlock data={igLink} label="Instagram" />}
        </div>
      )}
      <PageFoot brand={brand} n={n} total={total} />
    </section>
  );
}
