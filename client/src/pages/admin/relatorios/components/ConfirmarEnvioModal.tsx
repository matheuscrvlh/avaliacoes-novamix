import { Send, X } from "lucide-react";

interface ConfirmarEnvioModalProps {
  titulo: string;
  descricao: string;
  destinatarios: string[];
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmarEnvioModal({
  titulo,
  descricao,
  destinatarios,
  onConfirmar,
  onCancelar,
}: ConfirmarEnvioModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancelar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-envio-titulo"
        className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Send size={18} className="text-green-600" />
            </div>
            <h2
              id="confirmar-envio-titulo"
              className="text-base font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Fechar"
            className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300">{descricao}</p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-zinc-700 dark:text-zinc-200">
          {destinatarios.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            autoFocus
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
