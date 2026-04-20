"use client";

import { useEffect, useState, useMemo } from "react";

import { getAvaliacoes } from "@/lib/api";

interface Avaliacao {
  id: number;
  idfilial: number;
  nomefilial: string;
  nota: number;
  comentario: string;
  data: string;
}

const PER_PAGE = 10;

const NOTA_COLORS: Record<number, { bg: string; text: string }> = {
  5: { bg: "bg-green-900/40", text: "text-green-400" },
  4: { bg: "bg-green-900/40", text: "text-green-400" },
  3: { bg: "bg-amber-900/40", text: "text-amber-400" },
  2: { bg: "bg-orange-900/40", text: "text-orange-400" },
  1: { bg: "bg-red-900/40", text: "text-red-400" },
};

const BAR_COLORS: Record<number, string> = {
  5: "bg-green-500",
  4: "bg-green-400",
  3: "bg-amber-400",
  2: "bg-orange-400",
  1: "bg-red-500",
};

// sub componentes

function Stars({ nota }: { nota: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < nota ? "text-amber-400" : "text-zinc-600"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function NotaBadge({ nota }: { nota: number }) {
  const c = NOTA_COLORS[nota] ?? NOTA_COLORS[3];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}
    >
      {"★".repeat(nota)}
      {"☆".repeat(5 - nota)} {nota}
    </span>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-100">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function LojaCard({
  nome,
  idfilial,
  avaliacoes,
}: {
  nome: string;
  idfilial: number;
  avaliacoes: Avaliacao[];
}) {
  const notas = avaliacoes.map((a) => Number(a.nota));
  const media = notas.length
    ? notas.reduce((s, n) => s + n, 0) / notas.length
    : 0;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{nome}</span>
        <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded-full">
          Filial {idfilial}
        </span>
      </div>
      <Stars nota={Math.round(media)} />
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-700">
        <div>
          <p className="text-xs text-zinc-500">Média</p>
          <p className="text-lg font-semibold text-zinc-100">
            {media.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Avaliações</p>
          <p className="text-lg font-semibold text-zinc-100">{notas.length}</p>
        </div>
      </div>
    </div>
  );
}

function DistribuicaoBar({
  data,
}: {
  data: { nota: number; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <p className="text-sm font-medium text-zinc-300 mb-4">
        Distribuição de notas
      </p>
      <div className="flex flex-col gap-2">
        {data.map(({ nota, count }) => (
          <div key={nota} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-4 text-right">{nota}</span>
            <div className="flex-1 bg-zinc-700 rounded h-5 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-500 ${BAR_COLORS[nota]}`}
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 w-6 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// componentes principais

export default function DashboardPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterLoja, setFilterLoja] = useState<string>("all");
  const [filterNota, setFilterNota] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchAvaliacoes() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAvaliacoes();
        setAvaliacoes(res);
      } catch {
        setError("Não foi possível carregar as avaliações.");
      } finally {
        setLoading(false);
      }
    }
    fetchAvaliacoes();
  }, []);

  const lojas = useMemo(() => {
    const map = new Map<number, string>();
    avaliacoes.forEach((a) => map.set(a.idfilial, a.nomefilial));
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [avaliacoes]);

  const totalGeral = avaliacoes.length;
  const mediaGeral = totalGeral
    ? (avaliacoes.reduce((s, a) => s + Number(a.nota), 0) / totalGeral).toFixed(
        1,
      )
    : "—";
  const pct5 = totalGeral
    ? Math.round(
        (avaliacoes.filter((a) => Number(a.nota) === 5).length / totalGeral) *
          100,
      )
    : 0;
  const withComment = avaliacoes.filter((a) => a.comentario?.trim()).length;

  const distribuicao = [5, 4, 3, 2, 1].map((nota) => ({
    nota,
    count: avaliacoes.filter((a) => Number(a.nota) === nota).length,
  }));

  const filteredData = useMemo(() => {
    return avaliacoes.filter((a) => {
      const okLoja = filterLoja === "all" || String(a.idfilial) === filterLoja;
      const okNota = filterNota === "all" || String(a.nota) === filterNota;
      return okLoja && okNota;
    });
  }, [avaliacoes, filterLoja, filterNota]);

  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  const pageData = filteredData.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilterLoja(val: string) {
    setFilterLoja(val);
    setPage(1);
  }

  function handleFilterNota(val: string) {
    setFilterNota(val);
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 text-zinc-500 text-sm">
        Carregando avaliações...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-900/30 text-red-400 text-sm p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 min-h-screen p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">
          Avaliações das lojas
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {totalGeral} avaliações no total
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total de avaliações" value={totalGeral} />
        <MetricCard label="Nota média geral" value={mediaGeral} sub="de 5.0" />
        <MetricCard label="Notas máximas (5★)" value={`${pct5}%`} />
        <MetricCard
          label="Com comentário"
          value={withComment}
          sub={`de ${totalGeral}`}
        />
      </div>

      {/* Cards por loja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {lojas.map(([id, nome]) => (
          <LojaCard
            key={id}
            idfilial={id}
            nome={nome}
            avaliacoes={avaliacoes.filter((a) => a.idfilial === id)}
          />
        ))}
      </div>

      {/* Distribuição */}
      <DistribuicaoBar data={distribuicao} />

      {/* Tabela */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-sm text-zinc-500">Filtrar por:</span>
          <select
            value={filterLoja}
            onChange={(e) => handleFilterLoja(e.target.value)}
            className="text-sm border border-zinc-700 rounded-lg px-3 py-1.5 bg-zinc-800 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            <option value="all">Todas as lojas</option>
            {lojas.map(([id, nome]) => (
              <option key={id} value={String(id)}>
                {nome}
              </option>
            ))}
          </select>
          <select
            value={filterNota}
            onChange={(e) => handleFilterNota(e.target.value)}
            className="text-sm border border-zinc-700 rounded-lg px-3 py-1.5 bg-zinc-800 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-600"
          >
            <option value="all">Todas as notas</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={String(n)}>
                ★ {n}
              </option>
            ))}
          </select>
          {(filterLoja !== "all" || filterNota !== "all") && (
            <button
              onClick={() => {
                handleFilterLoja("all");
                handleFilterNota("all");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-700">
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3 w-12">
                  #
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">
                  Loja
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3 w-32">
                  Nota
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">
                  Comentário
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3 w-28">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/50">
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-zinc-500 text-sm"
                  >
                    Nenhuma avaliação encontrada.
                  </td>
                </tr>
              ) : (
                pageData.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-zinc-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-600">{a.id}</td>
                    <td className="px-4 py-3 text-zinc-200 font-medium">
                      {a.nomefilial}
                    </td>
                    <td className="px-4 py-3">
                      <NotaBadge nota={Number(a.nota)} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-xs">
                      {a.comentario?.trim() ? (
                        <span className="line-clamp-2">{a.comentario}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {a.data ? String(a.data).slice(0, 10) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-zinc-500">
              {filteredData.length} resultado
              {filteredData.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs disabled:opacity-30 hover:bg-zinc-700 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-xs text-zinc-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs disabled:opacity-30 hover:bg-zinc-700 transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
