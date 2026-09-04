import { useDashboard } from "./dashboard/hooks/useDashBoard";
import { MetricCard } from "./dashboard/components/MetricCard";
import { LojaCard } from "./dashboard/components/LojaCard";
import { DistribuicaoBar } from "./dashboard/components/DistribuicaoBar";
import { AvaliacoesTable } from "./dashboard/components/AvaliacoesTable";
import { Footer } from "./dashboard/components/Footer";
import { Sidebar } from "./dashboard/components/Sidebar";
import { motion } from "framer-motion";
import { Store, Phone, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { dark, toggle } = useTheme();

  const {
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
    filterPeriodo,
    page,
    totalPages,
    itemsPerPage,
    handleItemsPerPageChange,
    handleFilterLoja,
    handleFilterNota,
    handleFilterPeriodo,
    handlePageChange,
    handleDelete,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex w-full min-h-screen bg-[#f5f5f5] dark:bg-zinc-900">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 min-w-0 flex items-center justify-center lg:ml-64">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Carregando avaliações...</span>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full min-h-screen bg-[#f5f5f5] dark:bg-zinc-900">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 min-w-0 flex items-center justify-center lg:ml-64">
          <span className="text-sm text-red-500">{error}</span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-[#f5f5f5] dark:bg-zinc-900">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 min-w-0 flex flex-col lg:ml-64">
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 w-full max-w-6xl mx-auto px-6 pt-20 pb-10 lg:pt-10 space-y-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                {activeTab === "loja" ? (
                  <>
                    <Store className="text-orange-500" size={22} />
                    Avaliações das Lojas
                  </>
                ) : (
                  <>
                    <Phone className="text-orange-500" size={22} />
                    Avaliações do Televendas
                  </>
                )}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {activeTab === "loja"
                  ? "Acompanhe as avaliações e desempenho das filiais"
                  : "Acompanhe as avaliações do setor de televendas"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-500">
                  {metrics?.total || 0}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">avaliações</p>
              </div>

              <button
                onClick={toggle}
                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title={dark ? "Modo claro" : "Modo escuro"}
              >
                {dark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>

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

          {activeTab === "loja" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(lojas || []).map(([id, nome]) => (
                <LojaCard
                  key={id}
                  idfilial={id}
                  nome={nome}
                  avaliacoes={(avaliacoes || []).filter(
                    (a) => a.idfilial === id && a.tipo === "loja",
                  )}
                />
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <DistribuicaoBar data={distribuicao || []} />
          </div>

          <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <AvaliacoesTable
              data={pageData || []}
              totalFiltered={(filteredData || []).length}
              lojas={lojas || []}
              filterLoja={filterLoja}
              filterNota={filterNota}
              filterPeriodo={filterPeriodo}
              page={page}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onFilterLoja={handleFilterLoja}
              onFilterNota={handleFilterNota}
              onFilterPeriodo={handleFilterPeriodo}
              onPageChange={handlePageChange}
              onDelete={handleDelete}
              showLojaFilter={activeTab === "loja"}
              canDelete={isAdmin}
            />
          </div>
        </motion.section>

        <div className="pb-6">
          <Footer />
        </div>
      </main>
    </div>
  );
}
