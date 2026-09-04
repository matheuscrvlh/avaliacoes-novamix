import { useState } from "react";
import { Avaliacao } from "../types/avaliacao";
import { PeriodoFiltro } from "../hooks/useDashBoard";
import { NotaBadge } from "./NotaBadge";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface AvaliacoesTableProps {
  data: Avaliacao[];
  totalFiltered: number;
  lojas: [number, string][];
  filterLoja: string;
  filterNota: string;
  filterPeriodo: PeriodoFiltro;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onFilterLoja: (val: string) => void;
  onFilterNota: (val: string) => void;
  onFilterPeriodo: (val: PeriodoFiltro) => void;
  onPageChange: (page: number) => void;
  onDelete: (ids: number[]) => Promise<void>;
  showLojaFilter?: boolean;
  canDelete?: boolean;
}

function formatarDataHora(valor: string | null | undefined) {
  if (!valor) return { data: "—", hora: "—" };

  const date = new Date(valor)

  const data = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const hora = date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit"
  })

  return { data, hora };
}

export function AvaliacoesTable({
  data,
  totalFiltered,
  lojas,
  filterLoja,
  filterNota,
  filterPeriodo,
  page,
  totalPages,
  itemsPerPage,
  onItemsPerPageChange,
  onFilterLoja,
  onFilterNota,
  onFilterPeriodo,
  onPageChange,
  onDelete,
  showLojaFilter = true,
  canDelete = false,
}: AvaliacoesTableProps) {
  const hasFilters =
    filterLoja !== "all" || filterNota !== "all" || filterPeriodo !== "all";

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await onDelete(selectedIds);
      setSelectedIds([]);
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  function exportarCSV() {
    const dadosParaExportar =
      selectedIds.length > 0
        ? sortedData.filter((a) => selectedIds.includes(a.id))
        : sortedData;

    const cabecalho = ["ID", "Loja", "Nota", "Comentário", "Data", "Hora"];
    const linhas = dadosParaExportar.map((a) => {
      const { data: d, hora: h } = formatarDataHora(a.data);
      return [
        a.id,
        a.nomefilial,
        a.nota,
        a.comentario?.replace(/,/g, " "),
        d,
        h,
      ];
    });

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
      {showConfirm && (
        <ConfirmDeleteModal
          count={selectedIds.length}
          deleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-2">
          <span className="text-sm text-orange-700 dark:text-orange-400">
            {selectedIds.length} selecionado(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={deleting || !canDelete}
              title={
                canDelete
                  ? undefined
                  : "Você precisa ser administrador do módulo avaliações para fazer essa ação."
              }
              className={`text-xs px-3 py-1 rounded transition-colors ${
                canDelete
                  ? "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                  : "bg-zinc-300 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              }`}
            >
              Deletar
            </button>
            <button
              onClick={exportarCSV}
              className="text-xs px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-800 transition-colors"
            >
              Exportar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Filtrar por:</span>
        {showLojaFilter && (
          <select
            value={filterLoja}
            onChange={(e) => onFilterLoja(e.target.value)}
            className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 shadow-sm text-black dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">Todas as lojas</option>
            {lojas.map(([id, nome]) => (
              <option key={id} value={String(id)}>
                {nome}
              </option>
            ))}
          </select>
        )}
        <select
          value={filterNota}
          onChange={(e) => onFilterNota(e.target.value)}
          className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 shadow-sm text-black dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">Todas as notas</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              ★ {n}
            </option>
          ))}
        </select>
        <select
          value={filterPeriodo}
          onChange={(e) => onFilterPeriodo(e.target.value as PeriodoFiltro)}
          className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 shadow-sm text-black dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">Qualquer período</option>
          <option value="dia">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              onFilterLoja("all");
              onFilterNota("all");
              onFilterPeriodo("all");
            }}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 underline"
          >
            Limpar filtros
          </button>
        )}

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 shadow-sm text-black dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value={10}>10 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>

        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200"
        >
          📥 Exportar CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {sortedData.length === 0 ? (
          <p className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-sm">
            Nenhuma avaliação encontrada.
          </p>
        ) : (
          sortedData.map((a) => {
            const { data: d, hora: h } = formatarDataHora(a.data);
            return (
              <div
                key={a.id}
                onClick={() => toggleSelect(a.id)}
                className={`
                  border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors
                  ${
                    selectedIds.includes(a.id)
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
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
                    <span className="font-semibold text-sm text-black dark:text-zinc-100">
                      {a.nomefilial}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">#{a.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <NotaBadge nota={Number(a.nota)} />
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{d}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{h}</p>
                  </div>
                </div>

                {a.comentario?.trim() && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-700 pt-2">
                    {a.comentario}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="hidden sm:block bg-white dark:bg-zinc-800 shadow-md rounded-xl overflow-hidden">
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
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left">
                Hora
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-sm"
                >
                  Nenhuma avaliação encontrada.
                </td>
              </tr>
            ) : (
              sortedData.map((a, index) => {
                const { data: d, hora: h } = formatarDataHora(a.data);
                return (
                  <tr
                    key={a.id}
                    className={`
                      transition-all duration-200 hover:bg-orange-50 dark:hover:bg-zinc-700
                      ${selectedIds.includes(a.id) ? "bg-orange-100 dark:bg-orange-900/30" : ""}
                      ${index % 2 === 0 ? "bg-white dark:bg-zinc-800" : "bg-orange-50/40 dark:bg-zinc-700/40"}
                    `}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(a.id)}
                        onChange={() => toggleSelect(a.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{a.id}</td>
                    <td className="px-4 py-3 font-semibold text-black dark:text-zinc-100">
                      {a.nomefilial}
                    </td>
                    <td className="px-4 py-3">
                      <NotaBadge nota={Number(a.nota)} />
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 max-w-sm">
                      {a.comentario?.trim() ? (
                        <span className="whitespace-pre-wrap break-words">{a.comentario}</span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs">{d}</td>
                    <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 text-xs">{h}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {totalFiltered} resultado{totalFiltered !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              Próxima →
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
