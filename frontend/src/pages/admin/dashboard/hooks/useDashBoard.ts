import { useEffect, useState, useMemo } from "react";
import { getAvaliacoes } from "../../../../lib/api";
import { Avaliacao } from "../types/avaliacao";

export type DashboardTab = "loja" | "televendas";

export function useDashboard() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("loja");
  const [filterLoja, setFilterLoja] = useState("all");
  const [filterNota, setFilterNota] = useState("all");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function fetchAvaliacoes() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAvaliacoes();

        const dadosFormatados = res.map((a: any) => ({
          id: a.id,
          idfilial: a.idfilial,
          nomefilial: a.nomefilial,
          nota: a.nota,
          comentario: a.comentario,
          data: a.data,
          tipo: a.tipo ?? "loja",
        }));

        setAvaliacoes(dadosFormatados);
      } catch {
        setError("Não foi possível carregar as avaliações.");
      } finally {
        setLoading(false);
      }
    }
    fetchAvaliacoes();
  }, []);

  // Dados filtrados pela aba ativa
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
      ? (tabData.reduce((s, a) => s + Number(a.nota), 0) / total).toFixed(1)
      : "—";
    const pct5 = total
      ? Math.round(
          (tabData.filter((a) => Number(a.nota) === 5).length / total) * 100,
        )
      : 0;
    const withComment = tabData.filter((a) => a.comentario?.trim()).length;
    return { total, media, pct5, withComment };
  }, [tabData]);

  const distribuicao = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((nota) => ({
        nota,
        count: tabData.filter((a) => Number(a.nota) === nota).length,
      })),
    [tabData],
  );

  const filteredData = useMemo(
    () =>
      tabData.filter((a) => {
        const okLoja =
          filterLoja === "all" || String(a.idfilial) === filterLoja;
        const okNota = filterNota === "all" || String(a.nota) === filterNota;
        return okLoja && okNota;
      }),
    [tabData, filterLoja, filterNota],
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pageData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab);
    setFilterLoja("all");
    setFilterNota("all");
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
  function handlePageChange(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function handleItemsPerPageChange(value: number) {
    setItemsPerPage(value);
    setPage(1);
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
    filteredData,
    pageData,
    filterLoja,
    filterNota,
    page,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    handleItemsPerPageChange,
    handleFilterLoja,
    handleFilterNota,
    handlePageChange,
  };
}
