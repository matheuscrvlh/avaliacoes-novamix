import { useDashboard } from "../../pages/admin/dashboard/hooks/useDashBoard";
import { MetricCard } from "../../pages/admin/dashboard/components/MetricCard";
import { LojaCard } from "../../pages/admin/dashboard/components/LojaCard";
import { DistribuicaoBar } from "../../pages/admin/dashboard/components/DistribuicaoBar";
import { AvaliacoesTable } from "../../pages/admin/dashboard/components/AvaliacoesTable";
import { Footer } from "../admin/dashboard/components/Footer";
//
import { motion } from "framer-motion";
import { Store, ChevronRight, LogOut, Phone, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
    page,
    totalPages,
    itemsPerPage,
    handleItemsPerPageChange,
    handleFilterLoja,
    handleFilterNota,
    handlePageChange,
  } = useDashboard();

  function handleLogout() {
    logout();
    navigate("/login");
  }

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
    <div className="p-6 space-y-6 max-w-6xl mx-auto bg-[#f5f5f5] dark:bg-zinc-900 min-h-screen">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 gap-1">
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <span className="text-zinc-600 dark:text-zinc-300 font-medium">Avaliações</span>
        </div>

        {/* Header principal */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
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
            {/* Tabs Lojas / Televendas */}
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg p-1">
              <button
                onClick={() => handleTabChange("loja")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  activeTab === "loja"
                    ? "bg-white dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                <Store size={13} />
                Lojas
              </button>
              <button
                onClick={() => handleTabChange("televendas")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  activeTab === "televendas"
                    ? "bg-white dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                <Phone size={13} />
                Televendas
              </button>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">
                {metrics?.total || 0}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">avaliações</p>
            </div>

            {/* button dark mode */}
            <button
              onClick={toggle}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title={dark ? "Modo claro" : "Modo escuro"}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* button 'sair' */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 transition-colors"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </motion.div>

      {/* metricas */}
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

      {/* cards lojas — apenas na aba de lojas */}
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

      {/* graficos */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <DistribuicaoBar data={distribuicao || []} />
      </div>

      {/* tabela */}
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
        <AvaliacoesTable
          data={pageData || []}
          totalFiltered={(filteredData || []).length}
          lojas={lojas || []}
          filterLoja={filterLoja}
          filterNota={filterNota}
          page={page}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onFilterLoja={handleFilterLoja}
          onFilterNota={handleFilterNota}
          onPageChange={handlePageChange}
          showLojaFilter={activeTab === "loja"}
        />
      </div>
      <Footer />
    </div>
  );
}
