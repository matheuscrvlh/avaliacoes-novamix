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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">
          Avaliações das lojas
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {metrics.total} avaliações no total
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total de avaliações" value={metrics.total} />
        <MetricCard
          label="Nota média geral"
          value={metrics.media}
          sub="de 5.0"
        />
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
