import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { HUB_URL } from "../../../../lib/api";
import type { DashboardTab } from "../hooks/useDashBoard";

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

const linkBase =
  "block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors";
const linkActive = "bg-orange-500 text-white";
const linkInactive =
  "text-zinc-600 hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-400";

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function fechar() {
    setIsOpen(false);
  }

  function selecionarTab(tab: DashboardTab) {
    onTabChange(tab);
    fechar();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 rounded-md bg-orange-500 p-2 text-white shadow-lg transition-colors hover:bg-orange-600 lg:hidden"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div
        className={`fixed inset-0 z-30 bg-black transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-50" : "pointer-events-none opacity-0"
        }`}
        onClick={fechar}
      />

      <aside
        className={`fixed top-0 left-0 z-40 flex h-dvh w-64 flex-col border-r border-zinc-200 bg-white shadow-sm transition-transform duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-800 lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center py-4">
          <img
            src="/logo.webp"
            alt="Novamix Food Service"
            className="w-[55%] max-w-32 rounded-lg bg-white object-contain dark:p-1.5"
          />
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto px-4">
          <button
            type="button"
            onClick={() => selecionarTab("loja")}
            className={`${linkBase} ${activeTab === "loja" ? linkActive : linkInactive}`}
          >
            Lojas
          </button>
          <button
            type="button"
            onClick={() => selecionarTab("televendas")}
            className={`${linkBase} ${activeTab === "televendas" ? linkActive : linkInactive}`}
          >
            Televendas
          </button>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} ${linkInactive}`}
          >
            Área Cliente
          </Link>
        </nav>

        <a
          href={HUB_URL}
          className="mx-4 mb-6 flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
        >
          <LogOut size={16} />
          Voltar ao Hub
        </a>
      </aside>
    </>
  );
}
