import { useState } from "react";
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

  // Ordenação
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField as keyof Avaliacao];
    const bValue = b[sortField as keyof Avaliacao];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Seleção múltipla
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === sortedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedData.map((a) => a.id));
    }
  }

  // Exportar CSV
  function exportarCSV() {
    const dadosParaExportar =
      selectedIds.length > 0
        ? sortedData.filter((a) => selectedIds.includes(a.id))
        : sortedData;

    const cabecalho = ["ID", "Loja", "Nota", "Comentário", "Data"];
    const linhas = dadosParaExportar.map((a) => [
      a.id,
      a.nomefilial,
      a.nota,
      a.comentario?.replace(/,/g, " "),
      a.data ? String(a.data).slice(0, 10) : "",
    ]);

    const csvContent = [cabecalho, ...linhas]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "avaliacoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      {/* Ações em lote */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
          <span className="text-sm text-orange-700">
            {selectedIds.length} selecionado(s)
          </span>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 bg-red-500 text-white rounded">
              Deletar
            </button>
            <button className="text-xs px-3 py-1 bg-zinc-700 text-white rounded">
              Exportar
            </button>
          </div>
        </div>
      )}

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
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* card mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {sortedData.length === 0 ? (
          <p className="text-center py-10 text-zinc-500 text-sm">
            Nenhuma avaliação encontrada.
          </p>
        ) : (
          sortedData.map((a) => (
            <div
              key={a.id}
              onClick={() => toggleSelect(a.id)}
              className={`
                border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors
                ${
                  selectedIds.includes(a.id)
                    ? "bg-orange-50 border-orange-300"
                    : "bg-white border-zinc-200"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(a.id)}
                    onChange={() => toggleSelect(a.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-orange-500"
                  />
                  <span className="font-semibold text-sm text-black">
                    {a.nomefilial}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">#{a.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <NotaBadge nota={Number(a.nota)} />
                <span className="text-xs text-zinc-400">
                  {a.data ? String(a.data).slice(0, 10) : "—"}
                </span>
              </div>

              {a.comentario?.trim() && (
                <p className="text-sm text-zinc-600 border-t border-zinc-100 pt-2">
                  {a.comentario}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* tabela desk */}
      <div className="hidden sm:block bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-orange-500 to-orange-400">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === sortedData.length &&
                    sortedData.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-white text-xs">#</th>
              <th
                onClick={() => handleSort("nomefilial")}
                className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left"
              >
                Loja{" "}
                {sortField === "nomefilial" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("nota")}
                className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left"
              >
                Nota{" "}
                {sortField === "nota" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left">
                Comentário
              </th>
              <th
                onClick={() => handleSort("data")}
                className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left"
              >
                Data{" "}
                {sortField === "data" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-zinc-500 text-sm"
                >
                  Nenhuma avaliação encontrada.
                </td>
              </tr>
            ) : (
              sortedData.map((a, index) => (
                <tr
                  key={a.id}
                  className={`
                    transition-all duration-200 hover:bg-orange-50
                    ${selectedIds.includes(a.id) ? "bg-orange-100" : ""}
                    ${index % 2 === 0 ? "bg-white" : "bg-orange-50/40"}
                  `}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a.id)}
                      onChange={() => toggleSelect(a.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{a.id}</td>
                  <td className="px-4 py-3 font-semibold text-black">
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

      {/* paginacao */}
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
