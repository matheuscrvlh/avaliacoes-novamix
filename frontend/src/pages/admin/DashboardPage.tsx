import { useDashboard } from "../../pages/admin/dashboard/hooks/useDashBoard";
import { MetricCard } from "../../pages/admin/dashboard/components/MetricCard";
import { LojaCard } from "../../pages/admin/dashboard/components/LojaCard";
import { DistribuicaoBar } from "../../pages/admin/dashboard/components/DistribuicaoBar";
import { AvaliacoesTable } from "../../pages/admin/dashboard/components/AvaliacoesTable";

export default function DashboardPage() {
  const {
    avaliacoes,
    loading,
    error,
    lojas,
    metrics,
    distribuicao,
    filteredData,
    pageData,
    filterLoja,
    filterNota,
    page,
    totalPages,
    handleFilterLoja,
    handleFilterNota,
    handlePageChange,
  } = useDashboard();

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
    <div className="p-6 space-y-6 max-w-6xl mx-auto shadow-lg bg-[#f5f5f5]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
            Avaliações das Lojas
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
              Dashboard
            </span>
          </h1>

          <p className="text-sm text-zinc-500 mt-1">
            Acompanhe as avaliações e desempenho das filiais
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-orange-500">{metrics.total}</p>
          <p className="text-xs text-zinc-500">avaliações</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
        <MetricCard label="Total de avaliações" value={metrics.total} />
        <MetricCard label="Nota média" value={metrics.media} sub="de 5.0" />
        <MetricCard label="Notas máximas (5★)" value={`${metrics.pct5}%`} />
        <MetricCard
          label="Com comentário"
          value={metrics.withComment}
          sub={`de ${metrics.total}`}
        />
      </div>

      {/* cards */}
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

      {/* distr.notas */}
      <DistribuicaoBar data={distribuicao} />

      {/* filtros e paginação */}
      <AvaliacoesTable
        data={pageData}
        totalFiltered={filteredData.length}
        lojas={lojas}
        filterLoja={filterLoja}
        filterNota={filterNota}
        page={page}
        totalPages={totalPages}
        onFilterLoja={handleFilterLoja}
        onFilterNota={handleFilterNota}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
