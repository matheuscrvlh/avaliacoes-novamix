import { useMemo, type ReactNode } from "react";
import type { AvaliacaoApi } from "@/types/avaliacao";
import { resumir, type Resumo } from "../resumo";
import { formatarDia, rotuloPeriodo, tituloPeriodo, type Periodo } from "../periodo";

// Largura de uma folha A4 a 96 dpi. O layout é fixo (sem breakpoints) para a
// imagem e o PDF saírem iguais no celular e no computador.
export const LARGURA_RELATORIO = 794;

const TIMEZONE = "America/Sao_Paulo";

const formatoQuando = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatoGeradoEm = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  dateStyle: "short",
  timeStyle: "short",
});

const COR_BARRA: Record<number, string> = {
  5: "bg-green-500",
  4: "bg-green-400",
  3: "bg-amber-400",
  2: "bg-orange-400",
  1: "bg-red-500",
};

// Mesmas cores da distribuição, na faixa à esquerda de cada avaliação
const COR_FAIXA: Record<number, string> = {
  5: "border-l-green-500",
  4: "border-l-green-400",
  3: "border-l-amber-400",
  2: "border-l-orange-400",
  1: "border-l-red-500",
};

function maisRecentePrimeiro(a: AvaliacaoApi, b: AvaliacaoApi) {
  return new Date(b.data).getTime() - new Date(a.data).getTime();
}

interface RelatorioFilialProps {
  nomeLoja: string;
  periodo: Periodo;
  periodoAnterior: Periodo;
  hoje: string;
  /** Avaliações da filial dentro do período */
  avaliacoes: AvaliacaoApi[];
  anterior: Resumo;
  /** Identifica o relatório na hora de exportar */
  marcador?: string;
}

function ItemAvaliacao({ avaliacao: a }: { avaliacao: AvaliacaoApi }) {
  return (
    <div
      data-quebra
      className={`rounded-xl border border-l-4 border-zinc-200 bg-zinc-50 px-4 py-3 ${COR_FAIXA[a.nota] ?? ""}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold tracking-wider text-amber-500">
          {"★".repeat(a.nota)}
          <span className="text-zinc-300">{"★".repeat(5 - a.nota)}</span>
          <span className="ml-1.5 tracking-normal text-zinc-600">{a.nota}</span>
        </span>
        <span className="text-zinc-500">{formatoQuando.format(new Date(a.data))}</span>
      </div>
      {a.comentario?.trim() ? (
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-700">
          {a.comentario}
        </p>
      ) : (
        <p className="mt-1.5 text-sm italic text-zinc-400">Sem comentário</p>
      )}
    </div>
  );
}

function SecaoAvaliacoes({
  titulo,
  detalhe,
  vazio,
  itens,
}: {
  titulo: string;
  detalhe?: string;
  vazio: string;
  itens: AvaliacaoApi[];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {titulo} ({itens.length})
        {detalhe && itens.length > 1 && (
          <span className="ml-2 font-medium normal-case tracking-normal text-zinc-400">
            {detalhe}
          </span>
        )}
      </h2>
      {itens.length === 0 ? (
        <p data-quebra className="mt-3 text-sm text-zinc-500">
          {vazio}
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {itens.map((a) => (
            <ItemAvaliacao key={a.id} avaliacao={a} />
          ))}
        </div>
      )}
    </section>
  );
}

function Variacao({
  atual,
  anterior,
  casas = 0,
  sufixo = "",
}: {
  atual: number;
  anterior: number;
  casas?: number;
  sufixo?: string;
}) {
  const diff = Number((atual - anterior).toFixed(casas));

  if (diff === 0) {
    return <p className="mt-1 text-[11px] font-semibold text-zinc-400">= igual</p>;
  }

  const subiu = diff > 0;
  return (
    <p className={`mt-1 text-[11px] font-semibold ${subiu ? "text-green-600" : "text-red-600"}`}>
      {subiu ? "▲" : "▼"} {Math.abs(diff).toFixed(casas).replace(".", ",")}
      {sufixo}
    </p>
  );
}

function Metrica({
  rotulo,
  valor,
  complemento,
  variacao,
}: {
  rotulo: string;
  valor: string | number;
  complemento?: string;
  variacao?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{rotulo}</p>
      <p className="mt-1 text-[26px] font-extrabold leading-none text-zinc-900">
        {valor}
        {complemento && (
          <span className="ml-1 text-xs font-medium text-zinc-400">{complemento}</span>
        )}
      </p>
      {variacao}
    </div>
  );
}

export function RelatorioFilial({
  nomeLoja,
  periodo,
  periodoAnterior,
  hoje,
  avaliacoes,
  anterior,
  marcador,
}: RelatorioFilialProps) {
  const resumo = useMemo(() => resumir(avaliacoes), [avaliacoes]);

  // Toda nota abaixo de 5 aparece (com ou sem comentário), da pior para a melhor.
  // Das notas 5, aparecem as que têm comentário.
  const abaixoDe5 = useMemo(
    () => avaliacoes.filter((a) => a.nota < 5).sort((a, b) => a.nota - b.nota || maisRecentePrimeiro(a, b)),
    [avaliacoes],
  );
  const comentarios5 = useMemo(
    () => avaliacoes.filter((a) => a.nota === 5 && a.comentario?.trim()).sort(maisRecentePrimeiro),
    [avaliacoes],
  );

  const semanal = periodo.tipo === "semana";
  const parcial = periodo.fim > hoje;
  const comparar = resumo.total > 0 && anterior.total > 0;
  const textoAnterior = semanal
    ? `a semana anterior (${rotuloPeriodo(periodoAnterior)})`
    : rotuloPeriodo(periodoAnterior);

  return (
    <div
      data-relatorio={marcador}
      className="bg-white p-10 text-zinc-800"
      style={{ width: LARGURA_RELATORIO }}
    >
      <header
        data-quebra
        className="flex items-center justify-between border-b-4 border-orange-500 pb-5"
      >
        <img src="/logo.webp" alt="Novamix Food Service" className="h-12 w-auto" />
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
            Relatório de avaliações
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {semanal ? "Semanal · sábado a sexta" : "Mensal"}
          </p>
        </div>
      </header>

      <section data-quebra className="pt-6">
        <h1 className="text-[32px] font-extrabold leading-tight text-zinc-900">{nomeLoja}</h1>
        <p className="mt-1 flex items-center gap-2 text-base text-zinc-600">
          <span>{tituloPeriodo(periodo)}</span>
          {parcial && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              parcial, até {formatarDia(hoje, false)}
            </span>
          )}
        </p>
      </section>

      <section data-quebra className="mt-6">
        <div className="grid grid-cols-4 gap-3">
          <Metrica
            rotulo="Avaliações"
            valor={resumo.total}
            variacao={
              // Período em andamento sempre "perde" em quantidade para um período inteiro
              comparar && !parcial && <Variacao atual={resumo.total} anterior={anterior.total} />
            }
          />
          <Metrica
            rotulo="Nota média"
            valor={resumo.media === null ? "—" : resumo.media.toFixed(1).replace(".", ",")}
            complemento="de 5"
            variacao={
              comparar && (
                <Variacao atual={resumo.media ?? 0} anterior={anterior.media ?? 0} casas={1} />
              )
            }
          />
          <Metrica
            rotulo="Notas 5 ★"
            valor={`${resumo.pct5}%`}
            variacao={
              comparar && <Variacao atual={resumo.pct5} anterior={anterior.pct5} sufixo=" p.p." />
            }
          />
          <Metrica rotulo="Com comentário" valor={resumo.comComentario} />
        </div>
        {resumo.total > 0 && (
          <p className="mt-2 text-[11px] text-zinc-400">
            {comparar
              ? `Setas: comparação com ${textoAnterior}.${
                  parcial ? " A quantidade não é comparada porque o período ainda não terminou." : ""
                }`
              : `Sem avaliações em ${textoAnterior} para comparar.`}
          </p>
        )}
      </section>

      {resumo.total === 0 ? (
        <p
          data-quebra
          className="mt-8 rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center text-sm text-zinc-500"
        >
          Nenhuma avaliação neste período.
        </p>
      ) : (
        <>
          <section data-quebra className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Distribuição das notas
            </h2>
            <div className="mt-3 space-y-2">
              {resumo.distribuicao.map(({ nota, count }) => {
                const pct = Math.round((count / resumo.total) * 100);
                return (
                  <div key={nota} className="flex items-center gap-3">
                    <span className="w-9 text-sm font-semibold text-zinc-700">{nota} ★</span>
                    <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full ${COR_BARRA[nota]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm text-zinc-600">
                      {count} <span className="text-zinc-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <SecaoAvaliacoes
            titulo="Notas abaixo de 5 ★"
            detalhe="da pior para a melhor"
            vazio="Nenhuma nota abaixo de 5 ★ neste período."
            itens={abaixoDe5}
          />

          <SecaoAvaliacoes
            titulo="Comentários com 5 ★"
            vazio="Nenhum comentário com nota 5 neste período."
            itens={comentarios5}
          />
        </>
      )}

      {/* No PDF este rodapé não entra: o "Gerado em" vai na margem de cada folha */}
      <footer
        data-rodape
        className="mt-10 flex justify-between border-t border-zinc-200 pt-4 text-[11px] text-zinc-400"
      >
        <span data-gerado-em>Gerado em {formatoGeradoEm.format(new Date())}</span>
        <span>Novamix Food Service · Avaliações de atendimento</span>
      </footer>
    </div>
  );
}
