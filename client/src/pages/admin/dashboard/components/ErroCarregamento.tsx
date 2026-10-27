import { RefreshCw, TriangleAlert } from "lucide-react";

interface ErroCarregamentoProps {
  mensagem: string;
  onTentarNovamente: () => void;
}

export function ErroCarregamento({
  mensagem,
  onTentarNovamente,
}: ErroCarregamentoProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm px-6 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <TriangleAlert className="text-red-500" size={26} aria-hidden="true" />
      </div>

      <div>
        <p className="font-semibold text-zinc-800 dark:text-zinc-100">{mensagem}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Verifique sua conexão e tente novamente.
        </p>
      </div>

      <button
        type="button"
        onClick={onTentarNovamente}
        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
      >
        <RefreshCw size={15} aria-hidden="true" />
        Tentar de novo
      </button>
    </div>
  );
}
