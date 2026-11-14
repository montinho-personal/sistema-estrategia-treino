import type { RefObject } from "react";

import {
  filledChanges,
  filledSwaps,
  filledVolume,
  linesOf,
  nextChangeDate,
  phaseTimeline,
  phaseTitle,
  techniqueNotes,
  type PhaseChange,
} from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { brandLogo, type Brand } from "@/lib/domain/schema/brand";
import { has, val } from "@/lib/domain/util";
import { PREMIUM_CSS } from "@/lib/premium/premium-css";
import { PgCheck, PgIcon } from "@/components/premium/premium-icons";

function Foot({ brand, n, total }: { brand: Brand; n: number; total: number }) {
  return (
    <div className="pg-foot">
      <span>{brand.nome}</span>
      <span>Troca de fase</span>
      <span>{n} / {total}</span>
    </div>
  );
}

const Checks = ({ items }: { items: string[] }) => (
  <ul className="pg-check">
    {items.map((t, i) => (
      <li key={i}><span className="pg-tick"><PgCheck /></span>{t}</li>
    ))}
  </ul>
);
const Dots = ({ items }: { items: string[] }) => (
  <ul className="pg-dot">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
);

/** PDF Premium da troca de fase (mesmo visual do relatório da estratégia). */
export function PhaseDocument({
  state,
  pc,
  brand,
  containerRef,
}: {
  state: StrategyState;
  pc: PhaseChange;
  brand: Brand;
  containerRef?: RefObject<HTMLDivElement | null>;
}) {
  const nome = val(state.anamnese.nome) || "Seu aluno";
  const [y, m, d] = pc.inicio.split("-").map(Number);
  const inicio = y && m && d ? new Date(y, m - 1, d, 12) : new Date();
  const longa = (dt: Date) => dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const tl = phaseTimeline(state, pc);
  const conquistas = linesOf(pc.conquistas);
  const mudancas = filledChanges(pc);
  const tecnicas = techniqueNotes(pc);
  const volume = filledVolume(pc);
  const trocas = filledSwaps(pc);
  const mantem = linesOf(pc.mantem);
  const normal = linesOf(pc.normal), avisar = linesOf(pc.avisar);
  const missao = linesOf(pc.missao), medir = linesOf(pc.medir);
  const prox = nextChangeDate(pc);
  const temMudancas = mudancas.length + tecnicas.length + volume.length + trocas.length + mantem.length > 0;
  const total = temMudancas ? 4 : 3;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
      <div className="premium" ref={containerRef}>
        <section className="premium__page pg-cover">
          <div className="pg-cover__top">
            <div className="pg-brand">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo (data URL ou /brand) */}
              <img src={brandLogo(brand)} alt={brand.nome} className="pg-logo pg-logo--cover" />
            </div>
            <div className="pg-cover__date">{longa(inicio)}</div>
          </div>
          <div className="pg-cover__mid">
            <div className="pg-eyebrow">Troca de fase</div>
            <div className="pg-cover__name">{nome}</div>
            <div className="pg-rule" />
            <h1 className="pg-cover__title">{phaseTitle(pc)}</h1>
            {has(state.anamnese.tituloPlano) && <div className="pg-cover__sub">{val(state.anamnese.tituloPlano)}</div>}
            <p className="pg-cover__phrase">
              &ldquo;Você fechou a fase {pc.deNome}. Este documento mostra o que você conquistou, o que muda agora e
              por quê.&rdquo;
            </p>
          </div>
          <div className="pg-cover__foot">{brand.nome}</div>
        </section>

        <section className="premium__page">
          <h2 className="pg-h2">Onde você está</h2>
          <div className="pg-timeline" style={{ marginTop: 24 }}>
            <div className="pg-timeline__t">O mapa do seu protocolo</div>
            {tl.map((f) => (
              <div key={f.numero} className={`pg-tl pg-tl--${f.status === "feita" ? "done" : f.status === "atual" ? "now" : "next"}`}>
                <span className="pg-tl__dot" />
                <div className="pg-tl__lbl">
                  <b>
                    Fase {f.numero}
                    {f.semanas ? ` · ${f.semanas} semanas` : ""}
                    {f.status === "feita" ? " · concluída" : ""}
                  </b>
                  {f.nome}
                  {f.status === "atual" && <span className="pg-here">Você está aqui</span>}
                </div>
              </div>
            ))}
          </div>

          {conquistas.length > 0 && (
            <>
              <h3 className="pg-h3">O que você conquistou na fase {pc.deNome}</h3>
              <Checks items={conquistas} />
            </>
          )}

          {has(pc.porque) && (
            <div className="pg-highlight" style={{ marginTop: 26 }}>
              <div className="pg-highlight__t">Por que mudar agora</div>
              <p>{pc.porque}</p>
            </div>
          )}
          <Foot brand={brand} n={2} total={total} />
        </section>

        {temMudancas && (
          <section className="premium__page">
            <h2 className="pg-h2">O que muda nesta fase</h2>

            {mudancas.length > 0 && (
              <table className="pg-cmp" style={{ marginTop: 26 }}>
                <thead>
                  <tr><th /><th>Fase que termina</th><th>Fase nova</th></tr>
                </thead>
                <tbody>
                  {mudancas.map((r, i) => (
                    <tr key={i}>
                      <td>{r.item}</td>
                      <td>{r.antes || "—"}</td>
                      <td><span className="pg-cmp__arrow">→</span>{r.agora || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tecnicas.length > 0 && (
              <>
                <h3 className="pg-h3">Técnicas novas — o que é cada uma</h3>
                <div className="pg-tech">
                  {tecnicas.map((t) => (
                    <div key={t.nome}><b>{t.nome}</b>{t.como}</div>
                  ))}
                </div>
              </>
            )}

            {volume.length > 0 && (
              <>
                <h3 className="pg-h3">Séries por semana</h3>
                <table className="pg-cmp">
                  <thead>
                    <tr><th>Grupo muscular</th><th>Antes</th><th>Agora</th></tr>
                  </thead>
                  <tbody>
                    {volume.map((v) => (
                      <tr key={v.grupo}>
                        <td>{v.grupo}</td>
                        <td>{v.antes || "—"}</td>
                        <td><span className="pg-cmp__arrow">→</span>{v.agora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {trocas.length > 0 && (
              <>
                <h3 className="pg-h3">Exercícios que mudam</h3>
                <table className="pg-cmp">
                  <thead>
                    <tr><th>Sai</th><th>Entra</th><th>Por quê</th></tr>
                  </thead>
                  <tbody>
                    {trocas.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 400 }}>{t.sai || "—"}</td>
                        <td style={{ color: "var(--pg-ink)", fontWeight: 600 }}><span className="pg-cmp__arrow">→</span>{t.entra || "—"}</td>
                        <td style={{ fontWeight: 400, color: "var(--pg-mut)" }}>{t.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {mantem.length > 0 && (
              <>
                <h3 className="pg-h3">O que continua igual</h3>
                <Checks items={mantem} />
              </>
            )}
            <Foot brand={brand} n={3} total={total} />
          </section>
        )}

        <section className="premium__page">
          <h2 className="pg-h2">Como viver esta fase</h2>

          {(normal.length > 0 || avisar.length > 0) && (
            <div className="pg-2col" style={{ marginTop: 26 }}>
              {normal.length > 0 && (
                <div className="pg-box">
                  <div className="pg-box__t"><span className="pg-ic"><PgIcon name="pulse" /></span>É normal sentir</div>
                  <Dots items={normal} />
                </div>
              )}
              {avisar.length > 0 && (
                <div className="pg-box pg-box--warn">
                  <div className="pg-box__t"><span className="pg-ic"><PgIcon name="chat" /></span>Me avise se sentir</div>
                  <Dots items={avisar} />
                </div>
              )}
            </div>
          )}

          {missao.length > 0 && (
            <>
              <h3 className="pg-h3">Sua missão nesta fase</h3>
              <ol className="pg-mission">{missao.map((t, i) => <li key={i}>{t}</li>)}</ol>
            </>
          )}

          {(medir.length > 0 || prox) && (
            <>
              <h3 className="pg-h3">Como vamos acompanhar</h3>
              <Checks items={medir} />
              {prox && (
                <p className="pg-next">
                  Próxima troca de fase prevista: <b>{longa(prox)}</b>
                </p>
              )}
            </>
          )}

          {has(pc.mensagem) && <p className="pg-close__msg">{pc.mensagem}</p>}
          <p className="pg-muted">O treino novo já está liberado no aplicativo, com séries, repetições e a estrutura completa.</p>
          <div className="pg-sign" style={{ marginTop: 22 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- logo (data URL ou /brand) */}
            <img src={brandLogo(brand)} alt={brand.nome} className="pg-logo pg-logo--sign" />
            <div><b>{brand.nome}</b><span>Montinho Training Strategy</span></div>
          </div>
          <Foot brand={brand} n={total} total={total} />
        </section>
      </div>
    </>
  );
}
