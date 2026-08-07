import { Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  count: number;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ count, deleting, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                Excluir avaliação{count > 1 ? "ões" : ""}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
          Você está prestes a excluir{" "}
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">
            {count} avaliação{count > 1 ? "ões" : ""}
          </span>
          . Deseja continuar?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
