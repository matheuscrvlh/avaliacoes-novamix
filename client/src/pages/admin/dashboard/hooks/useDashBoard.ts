import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getAvaliacoes, deleteAvaliacao } from "../../../../lib/api";
import { TELEVENDAS_ID } from "@/types/avaliacao";
import { Avaliacao } from "../types/avaliacao";

export type DashboardTab = "loja" | "televendas";
export type PeriodoFiltro = "all" | "dia" | "semana" | "mes" | "custom";
export type SortField = "nomefilial" | "nota" | "data";
export type SortDirection = "asc" | "desc";

const TIMEZONE = "America/Sao_Paulo";

const PERIODOS: PeriodoFiltro[] = ["all", "dia", "semana", "mes", "custom"];
const SORT_FIELDS: SortField[] = ["nomefilial", "nota", "data"];
const ITENS_POR_PAGINA = [10, 50, 100];
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

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

// AAAA-MM-DD no fuso de São Paulo, comparável com o valor de <input type="date">
function getDiaIsoEmSaoPaulo(dataIso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dataIso));
}

function estaNoPeriodo(
  dataIso: string,
  periodo: PeriodoFiltro,
  inicio: string,
  fim: string,
) {
  if (periodo === "all") return true;

  if (periodo === "custom") {
    if (!inicio && !fim) return true;
    const dia = getDiaIsoEmSaoPaulo(dataIso);
    return (!inicio || dia >= inicio) && (!fim || dia <= fim);
  }

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

// Busca sem diferenciar maiúsculas/minúsculas nem acentos
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function useDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros, ordenação e página ficam na URL para sobreviverem a um F5
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: DashboardTab =
    searchParams.get("aba") === "televendas" ? "televendas" : "loja";
  const filterLoja = searchParams.get("loja") ?? "all";
  const filterNota = searchParams.get("nota") ?? "all";
  const periodoParam = searchParams.get("periodo") as PeriodoFiltro | null;
  const filterPeriodo: PeriodoFiltro =
    periodoParam && PERIODOS.includes(periodoParam) ? periodoParam : "all";
  const deParam = searchParams.get("de") ?? "";
  const ateParam = searchParams.get("ate") ?? "";
  const dataInicio = DATA_ISO.test(deParam) ? deParam : "";
  const dataFim = DATA_ISO.test(ateParam) ? ateParam : "";
  const filterBusca = searchParams.get("busca") ?? "";
  const ordemParam = searchParams.get("ordem") as SortField | null;
  const sortField: SortField | null =
    ordemParam && SORT_FIELDS.includes(ordemParam) ? ordemParam : null;
  const sortDirection: SortDirection =
    searchParams.get("dir") === "desc" ? "desc" : "asc";
  const porPaginaParam = Number(searchParams.get("porPagina"));
  const itemsPerPage = ITENS_POR_PAGINA.includes(porPaginaParam)
    ? porPaginaParam
    : 10;
  const page = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10) || 1);

  // Valor null/"" remove o parâmetro (mantém a URL limpa com os valores padrão).
  // Agrupe todas as mudanças de uma ação em uma única chamada.
  const atualizar = useCallback(
    (mudancas: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [chave, valor] of Object.entries(mudancas)) {
            if (valor === null || valor === "") next.delete(chave);
            else next.set(chave, valor);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const carregar = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

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

  const filteredData = useMemo(() => {
    const termo = normalizar(filterBusca.trim());

    return tabData.filter((a) => {
      const okLoja = filterLoja === "all" || String(a.idfilial) === filterLoja;
      const okNota = filterNota === "all" || String(a.nota) === filterNota;
      const okPeriodo = estaNoPeriodo(
        a.data,
        filterPeriodo,
        dataInicio,
        dataFim,
      );
      const okBusca = !termo || normalizar(a.comentario ?? "").includes(termo);
      return okLoja && okNota && okPeriodo && okBusca;
    });
  }, [
    tabData,
    filterLoja,
    filterNota,
    filterPeriodo,
    dataInicio,
    dataFim,
    filterBusca,
  ]);

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

  const LIMPAR_FILTROS = {
    loja: null,
    nota: null,
    periodo: null,
    de: null,
    ate: null,
    busca: null,
    pagina: null,
  };

  function handleTabChange(tab: DashboardTab) {
    atualizar({ ...LIMPAR_FILTROS, aba: tab === "loja" ? null : tab });
  }

  function handleLimparFiltros() {
    atualizar(LIMPAR_FILTROS);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      atualizar({ dir: sortDirection === "asc" ? "desc" : null, pagina: null });
    } else {
      atualizar({ ordem: field, dir: null, pagina: null });
    }
  }

  function handleFilterLoja(val: string) {
    atualizar({ loja: val === "all" ? null : val, pagina: null });
  }
  function handleFilterNota(val: string) {
    atualizar({ nota: val === "all" ? null : val, pagina: null });
  }
  function handleFilterPeriodo(val: PeriodoFiltro) {
    atualizar({
      periodo: val === "all" ? null : val,
      // as datas só valem no intervalo personalizado
      ...(val === "custom" ? {} : { de: null, ate: null }),
      pagina: null,
    });
  }
  function handleDataInicio(val: string) {
    atualizar({ de: val, pagina: null });
  }
  function handleDataFim(val: string) {
    atualizar({ ate: val, pagina: null });
  }
  function handleFilterBusca(val: string) {
    atualizar({ busca: val.trim() ? val : null, pagina: null });
  }
  function handlePageChange(p: number) {
    const pagina = Math.min(Math.max(1, p), Math.max(totalPages, 1));
    atualizar({ pagina: pagina === 1 ? null : String(pagina) });
  }

  function handleItemsPerPageChange(value: number) {
    atualizar({ porPagina: value === 10 ? null : String(value), pagina: null });
  }

  async function handleDelete(ids: number[]) {
    await Promise.all(ids.map((id) => deleteAvaliacao(id)));
    setAvaliacoes((prev) => prev.filter((a) => !ids.includes(a.id)));
  }

  return {
    avaliacoes,
    loading,
    error,
    reload: carregar,
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
    dataInicio,
    dataFim,
    filterBusca,
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
    handleDataInicio,
    handleDataFim,
    handleFilterBusca,
    handleLimparFiltros,
    handlePageChange,
    handleDelete,
  };
}
