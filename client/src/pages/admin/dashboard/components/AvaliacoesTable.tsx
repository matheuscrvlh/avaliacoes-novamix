import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search, X } from "lucide-react";
import { Avaliacao } from "../types/avaliacao";
import { PeriodoFiltro, SortDirection, SortField } from "../hooks/useDashBoard";
import { NotaBadge } from "./NotaBadge";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { AvaliacaoPeekModal } from "./AvaliacaoPeekModal";
import { formatarDataHora } from "../utils/formatarDataHora";
import { baixarCSV } from "../../../../lib/csv";

interface AvaliacoesTableProps {
  /** Linhas da página atual */
  data: Avaliacao[];
  /** Todas as linhas que passam pelos filtros, já ordenadas (todas as páginas) */
  allData: Avaliacao[];
  lojas: [number, string][];
  filterLoja: string;
  filterNota: string;
  filterPeriodo: PeriodoFiltro;
  dataInicio: string;
  dataFim: string;
  filterBusca: string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  page: number;
  totalPages: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onFilterLoja: (val: string) => void;
  onFilterNota: (val: string) => void;
  onFilterPeriodo: (val: PeriodoFiltro) => void;
  onDataInicio: (val: string) => void;
  onDataFim: (val: string) => void;
  onFilterBusca: (val: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onDelete: (ids: number[]) => Promise<void>;
  showLojaFilter?: boolean;
  canDelete?: boolean;
}

const campoClass =
  "text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1.5 shadow-sm text-black dark:text-zinc-100 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:[color-scheme:dark]";

export function AvaliacoesTable({
  data,
  allData,
  lojas,
  filterLoja,
  filterNota,
  filterPeriodo,
  dataInicio,
  dataFim,
  filterBusca,
  sortField,
  sortDirection,
  onSort,
  page,
  totalPages,
  itemsPerPage,
  onItemsPerPageChange,
  onFilterLoja,
  onFilterNota,
  onFilterPeriodo,
  onDataInicio,
  onDataFim,
  onFilterBusca,
  onClearFilters,
  onPageChange,
  onDelete,
  showLojaFilter = true,
  canDelete = false,
}: AvaliacoesTableProps) {
  const hasFilters =
    filterLoja !== "all" ||
    filterNota !== "all" ||
    filterPeriodo !== "all" ||
    filterBusca !== "";

  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rawSelectedIds, setRawSelectedIds] = useState<number[]>([]);

  // Prévia (celular): avaliação aberta e de onde na tela ela "nasce".
  // Se a avaliação sair do resultado (excluída, filtro alterado), a prévia fecha sozinha.
  const [peek, setPeek] = useState<{ id: number; origemY: number } | null>(null);
  const peekAvaliacao = peek
    ? (allData.find((a) => a.id === peek.id) ?? null)
    : null;

  // O campo de busca é local e só atualiza a URL depois que a pessoa para de digitar
  const [buscaLocal, setBuscaLocal] = useState(filterBusca);

  useEffect(() => {
    setBuscaLocal(filterBusca);
  }, [filterBusca]);

  useEffect(() => {
    if (buscaLocal === filterBusca) return;
    const timer = setTimeout(() => onFilterBusca(buscaLocal), 300);
    return () => clearTimeout(timer);
  }, [buscaLocal, filterBusca, onFilterBusca]);

  // Ignora seleções que saíram do resultado (filtro alterado, aba trocada),
  // para nunca excluir/exportar linhas que o usuário não está vendo.
  const selectedIds = useMemo(() => {
    const visiveis = new Set(allData.map((a) => a.id));
    return rawSelectedIds.filter((id) => visiveis.has(id));
  }, [rawSelectedIds, allData]);

  const todosSelecionados =
    allData.length > 0 && selectedIds.length === allData.length;

  function toggleSelect(id: number) {
    setRawSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    );
  }

  function toggleSelectAll() {
    setRawSelectedIds(todosSelecionados ? [] : allData.map((a) => a.id));
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await onDelete(selectedIds);
      setRawSelectedIds([]);
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  function exportarCSV() {
    const dadosParaExportar =
      selectedIds.length > 0
        ? allData.filter((a) => selectedIds.includes(a.id))
        : allData;

    const cabecalho = ["ID", "Loja", "Nota", "Comentário", "Data", "Hora"];
    const linhas = dadosParaExportar.map((a) => {
      const { data: d, hora: h } = formatarDataHora(a.data);
      return [a.id, a.nomefilial, a.nota, a.comentario, d, h];
    });

    baixarCSV("avaliacoes.csv", cabecalho, linhas);
  }

  function cabecalhoOrdenavel(field: SortField, label: string) {
    const ativo = sortField === field;
    const Icone = !ativo ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;

    return (
      <th
        scope="col"
        aria-sort={
          ativo ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
        }
        className="px-4 py-3 text-left"
      >
        <button
          type="button"
          onClick={() => onSort(field)}
          className="group inline-flex items-center gap-1 rounded text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {label}
          <Icone
            size={13}
            aria-hidden="true"
            className={ativo ? "opacity-100" : "opacity-60 group-hover:opacity-100"}
          />
        </button>
      </th>
    );
  }

  const nenhumResultado = (
    <>
      Nenhuma avaliação encontrada.
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="ml-2 underline hover:text-black dark:hover:text-zinc-100"
        >
          Limpar filtros
        </button>
      )}
    </>
  );

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
          {canDelete ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
              className="text-xs px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              Deletar
            </button>
          ) : (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Só administradores do módulo podem excluir avaliações.
            </span>
          )}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            value={buscaLocal}
            onChange={(e) => setBuscaLocal(e.target.value)}
            placeholder="Buscar nos comentários..."
            aria-label="Buscar nos comentários"
            className={`${campoClass} w-full pl-9 pr-8 [&::-webkit-search-cancel-button]:hidden`}
          />
          {buscaLocal && (
            <button
              type="button"
              onClick={() => {
                setBuscaLocal("");
                onFilterBusca("");
              }}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Filtrar por:</span>
        {showLojaFilter && (
          <select
            value={filterLoja}
            onChange={(e) => onFilterLoja(e.target.value)}
            aria-label="Filtrar por loja"
            className={campoClass}
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
          aria-label="Filtrar por nota"
          className={campoClass}
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
          aria-label="Filtrar por período"
          className={campoClass}
        >
          <option value="all">Qualquer período</option>
          <option value="dia">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
          <option value="custom">Intervalo de datas</option>
        </select>
        {filterPeriodo === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dataInicio}
              max={dataFim || undefined}
              onChange={(e) => onDataInicio(e.target.value)}
              aria-label="Data inicial"
              className={campoClass}
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">até</span>
            <input
              type="date"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(e) => onDataFim(e.target.value)}
              aria-label="Data final"
              className={campoClass}
            />
          </div>
        )}
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 underline"
          >
            Limpar filtros
          </button>
        )}

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          aria-label="Itens por página"
          className={campoClass}
        >
          <option value={10}>10 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>

        <button
          onClick={exportarCSV}
          disabled={allData.length === 0}
          className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:hover:shadow-sm disabled:active:scale-100"
        >
          <Download size={14} aria-hidden="true" />
          {selectedIds.length > 0
            ? `Exportar selecionados (${selectedIds.length})`
            : "Exportar CSV"}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {data.length === 0 ? (
          <p className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-sm">
            {nenhumResultado}
          </p>
        ) : (
          data.map((a) => {
            const { data: d, hora: h } = formatarDataHora(a.data);
            return (
              <div
                key={a.id}
                role="button"
                tabIndex={0}
                aria-label={`Abrir avaliação ${a.id} de ${a.nomefilial}`}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setPeek({
                    id: a.id,
                    origemY: r.top + r.height / 2 - window.innerHeight / 2,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
                className={`
                  border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-all duration-150 active:scale-[0.98]
                  ${
                    selectedIds.includes(a.id)
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Área de toque maior; selecionar não abre a prévia */}
                    <label
                      className="-m-2 flex items-center p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(a.id)}
                        onChange={() => toggleSelect(a.id)}
                        aria-label={`Selecionar avaliação ${a.id}`}
                        className="accent-orange-500"
                      />
                    </label>
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

      <AvaliacaoPeekModal
        avaliacao={peekAvaliacao}
        origemY={peek?.origemY ?? 0}
        selecionada={peekAvaliacao ? selectedIds.includes(peekAvaliacao.id) : false}
        onToggleSelect={() => peekAvaliacao && toggleSelect(peekAvaliacao.id)}
        onClose={() => setPeek(null)}
      />

      <div className="hidden sm:block bg-white dark:bg-zinc-800 shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-orange-500 to-orange-400">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todos os resultados (todas as páginas)"
                  title="Selecionar todos os resultados (todas as páginas)"
                />
              </th>
              <th className="px-4 py-3 text-white text-xs">#</th>
              {cabecalhoOrdenavel("nomefilial", "Loja")}
              {cabecalhoOrdenavel("nota", "Nota")}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left">
                Comentário
              </th>
              {cabecalhoOrdenavel("data", "Data")}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 text-left">
                Hora
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-sm"
                >
                  {nenhumResultado}
                </td>
              </tr>
            ) : (
              data.map((a, index) => {
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
                        aria-label={`Selecionar avaliação ${a.id}`}
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
        <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400">
            {allData.length} resultado{allData.length !== 1 ? "s" : ""}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              aria-label="Primeira página"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              ←<span className="hidden sm:inline"> Anterior</span>
            </button>
            <span className="whitespace-nowrap px-1 text-xs text-zinc-500 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Próxima página"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span className="hidden sm:inline">Próxima </span>→
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              aria-label="Última página"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
