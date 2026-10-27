import { useEffect, useState, useMemo } from "react";
import { getAvaliacoes, deleteAvaliacao } from "../../../../lib/api";
import { TELEVENDAS_ID } from "@/types/avaliacao";
import { Avaliacao } from "../types/avaliacao";

export type DashboardTab = "loja" | "televendas";
export type PeriodoFiltro = "all" | "dia" | "semana" | "mes";
export type SortField = "nomefilial" | "nota" | "data";
export type SortDirection = "asc" | "desc";

const TIMEZONE = "America/Sao_Paulo";

function getDataKeyEmSaoPaulo(data: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));

  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);

  return {
    year,
    month,
    day,
    epochDay: Math.floor(Date.UTC(year, month - 1, day) / 86400000),
  };
}

function estaNoPeriodo(dataIso: string, periodo: PeriodoFiltro) {
  if (periodo === "all") return true;

  const alvo = getDataKeyEmSaoPaulo(new Date(dataIso));
  const agora = getDataKeyEmSaoPaulo(new Date());

  if (periodo === "dia") {
    return (
      alvo.year === agora.year &&
      alvo.month === agora.month &&
      alvo.day === agora.day
    );
  }

  if (periodo === "mes") {
    return alvo.year === agora.year && alvo.month === agora.month;
  }

  // semana: semana corrente, de segunda a domingo
  const diaSemanaAgora = new Date(
    Date.UTC(agora.year, agora.month - 1, agora.day),
  ).getUTCDay();
  const indiceSegunda = (diaSemanaAgora + 6) % 7; // Seg=0 ... Dom=6
  const inicioSemana = agora.epochDay - indiceSegunda;
  const fimSemana = inicioSemana + 6;

  return alvo.epochDay >= inicioSemana && alvo.epochDay <= fimSemana;
}

export function useDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("loja");
  const [filterLoja, setFilterLoja] = useState("all");
  const [filterNota, setFilterNota] = useState("all");
  const [filterPeriodo, setFilterPeriodo] = useState<PeriodoFiltro>("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    async function fetchAvaliacoes() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAvaliacoes();

        const dadosFormatados: Avaliacao[] = res.map((a) => {
          const idfilial = Number(a.idfilial);
          return {
            id: Number(a.id),
            idfilial,
            nomefilial: a.nomefilial,
            nota: Number(a.nota),
            comentario: a.comentario,
            data: a.data,
            tipo: idfilial === TELEVENDAS_ID ? "televendas" : "loja",
          };
        });

        setAvaliacoes(dadosFormatados);
      } catch {
        setError("Não foi possível carregar as avaliações.");
      } finally {
        setLoading(false);
      }
    }
    fetchAvaliacoes();
  }, []);

  const tabData = useMemo(
    () => avaliacoes.filter((a) => a.tipo === activeTab),
    [avaliacoes, activeTab],
  );

  const lojas = useMemo(() => {
    const map = new Map<number, string>();
    tabData.forEach((a) => map.set(a.idfilial, a.nomefilial));
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [tabData]);

  const metrics = useMemo(() => {
    const total = tabData.length;
    const media = total
      ? tabData.reduce((s, a) => s + a.nota, 0) / total
      : null;
    const pct5 = total
      ? Math.round((tabData.filter((a) => a.nota === 5).length / total) * 100)
      : 0;
    const withComment = tabData.filter((a) => a.comentario?.trim()).length;
    return { total, media, pct5, withComment };
  }, [tabData]);

  const distribuicao = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((nota) => ({
        nota,
        count: tabData.filter((a) => a.nota === nota).length,
      })),
    [tabData],
  );

  const filteredData = useMemo(
    () =>
      tabData.filter((a) => {
        const okLoja =
          filterLoja === "all" || String(a.idfilial) === filterLoja;
        const okNota = filterNota === "all" || String(a.nota) === filterNota;
        const okPeriodo = estaNoPeriodo(a.data, filterPeriodo);
        return okLoja && okNota && okPeriodo;
      }),
    [tabData, filterLoja, filterNota, filterPeriodo],
  );

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    const direcao = sortDirection === "asc" ? 1 : -1;

    return [...filteredData].sort((a, b) => {
      if (sortField === "nomefilial") {
        return direcao * a.nomefilial.localeCompare(b.nomefilial);
      }
      if (sortField === "nota") {
        return direcao * (a.nota - b.nota);
      }
      return direcao * (new Date(a.data).getTime() - new Date(b.data).getTime());
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  // Após excluir itens a página salva pode deixar de existir
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab);
    setFilterLoja("all");
    setFilterNota("all");
    setFilterPeriodo("all");
    setPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function handleFilterLoja(val: string) {
    setFilterLoja(val);
    setPage(1);
  }
  function handleFilterNota(val: string) {
    setFilterNota(val);
    setPage(1);
  }
  function handleFilterPeriodo(val: PeriodoFiltro) {
    setFilterPeriodo(val);
    setPage(1);
  }
  function handlePageChange(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function handleItemsPerPageChange(value: number) {
    setItemsPerPage(value);
    setPage(1);
  }

  async function handleDelete(ids: number[]) {
    await Promise.all(ids.map((id) => deleteAvaliacao(id)));
    setAvaliacoes((prev) => prev.filter((a) => !ids.includes(a.id)));
  }

  return {
    avaliacoes,
    loading,
    error,
    activeTab,
    handleTabChange,
    lojas,
    metrics,
    distribuicao,
    sortedData,
    pageData,
    filterLoja,
    filterNota,
    filterPeriodo,
    sortField,
    sortDirection,
    page: currentPage,
    totalPages,
    itemsPerPage,
    handleItemsPerPageChange,
    handleSort,
    handleFilterLoja,
    handleFilterNota,
    handleFilterPeriodo,
    handlePageChange,
    handleDelete,
  };
}
