import { useDashboard } from "../../pages/admin/dashboard/hooks/useDashBoard";
import { MetricCard } from "../../pages/admin/dashboard/components/MetricCard";
import { LojaCard } from "../../pages/admin/dashboard/components/LojaCard";
import { DistribuicaoBar } from "../../pages/admin/dashboard/components/DistribuicaoBar";
import { AvaliacoesTable } from "../../pages/admin/dashboard/components/AvaliacoesTable";
import { motion } from "framer-motion";
import { Store, ChevronRight } from "lucide-react";

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
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-[#f5f5f5]">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-zinc-400 gap-1">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className="text-zinc-600 font-medium">Avaliações</span>
        </div>

        {/* Header principal */}
        <div className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-800">
              <Store className="text-orange-500" size={22} />
              Avaliações das Lojas
            </h1>

            <p className="text-sm text-zinc-500 mt-1">
              Acompanhe as avaliações e desempenho das filiais
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-orange-500">
              {metrics?.total || 0}
            </p>
            <p className="text-xs text-zinc-500">avaliações</p>
          </div>
        </div>
      </motion.div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total de avaliações" value={metrics?.total || 0} />
        <MetricCard
          label="Nota média"
          value={metrics?.media || 0}
          sub="de 5.0"
        />
        <MetricCard
          label="Notas máximas (5★)"
          value={`${metrics?.pct5 || 0}%`}
        />
        <MetricCard
          label="Com comentário"
          value={metrics?.withComment || 0}
          sub={`de ${metrics?.total || 0}`}
        />
      </div>

      {/* CARDS DAS LOJAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(lojas || []).map(([id, nome]) => (
          <LojaCard
            key={id}
            idfilial={id}
            nome={nome}
            avaliacoes={(avaliacoes || []).filter((a) => a.idfilial === id)}
          />
        ))}
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
        <DistribuicaoBar data={distribuicao || []} />
      </div>

      {/* TABELA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
        <AvaliacoesTable
          data={pageData || []}
          totalFiltered={(filteredData || []).length}
          lojas={lojas || []}
          filterLoja={filterLoja}
          filterNota={filterNota}
          page={page}
          totalPages={totalPages}
          onFilterLoja={handleFilterLoja}
          onFilterNota={handleFilterNota}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
