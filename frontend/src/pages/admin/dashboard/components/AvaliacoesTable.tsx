import { Avaliacao } from "../types/avaliacao";
import { NotaBadge } from "./NotaBadge";

interface AvaliacoesTableProps {
  data: Avaliacao[];
  totalFiltered: number;
  lojas: [number, string][];
  filterLoja: string;
  filterNota: string;
  page: number;
  totalPages: number;
  onFilterLoja: (val: string) => void;
  onFilterNota: (val: string) => void;
  onPageChange: (page: number) => void;
}

export function AvaliacoesTable({
  data,
  totalFiltered,
  lojas,
  filterLoja,
  filterNota,
  page,
  totalPages,
  onFilterLoja,
  onFilterNota,
  onPageChange,
}: AvaliacoesTableProps) {
  const hasFilters = filterLoja !== "all" || filterNota !== "all";

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm text-zinc-500">Filtrar por:</span>

        <select
          value={filterLoja}
          onChange={(e) => onFilterLoja(e.target.value)}
          className="text-sm border border-zinc-300 rounded-lg px-3 py-1.5 shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          onChange={(e) => onFilterNota(e.target.value)}
          className="text-sm border border-zinc-300 rounded-lg px-3 py-1.5 shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">Todas as notas</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              ★ {n}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              onFilterLoja("all");
              onFilterNota("all");
            }}
            className="text-xs text-zinc-500 hover:text-black underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#ff8d0a]">
              <th className="text-left text-xs font-medium text-white px-4 py-3 w-12">
                #
              </th>
              <th className="text-left text-xs font-medium text-white px-4 py-3">
                Loja
              </th>
              <th className="text-left text-xs font-medium text-white px-4 py-3 w-32">
                Nota
              </th>
              <th className="text-left text-xs font-medium text-white px-4 py-3">
                Comentário
              </th>
              <th className="text-left text-xs font-medium text-white px-4 py-3 w-28">
                Data
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-zinc-500 text-sm"
                >
                  Nenhuma avaliação encontrada.
                </td>
              </tr>
            ) : (
              data.map((a, index) => (
                <tr
                  key={a.id}
                  className={`transition-all duration-200 hover:bg-orange-50 hover:translate-x-[2px] ${
                    index % 2 === 0 ? "bg-white" : "bg-orange-50/40"
                  }`}
                >
                  <td className="px-4 py-3 text-zinc-600">{a.id}</td>

                  <td className="px-4 py-3 text-black font-semibold">
                    {a.nomefilial}
                  </td>

                  <td className="px-4 py-3">
                    <NotaBadge nota={Number(a.nota)} />
                  </td>

                  <td className="px-4 py-3 text-zinc-600 max-w-xs">
                    {a.comentario?.trim() ? (
                      <span className="line-clamp-2">{a.comentario}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {a.data ? String(a.data).slice(0, 10) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-500">
            {totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 text-xs disabled:opacity-30 hover:bg-zinc-100 transition-colors"
            >
              ← Anterior
            </button>

            <span className="text-xs text-zinc-500">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 text-xs disabled:opacity-30 hover:bg-zinc-100 transition-colors"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
