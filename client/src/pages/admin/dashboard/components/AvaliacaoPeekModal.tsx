import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { RATING_LABELS } from "@/types/avaliacao";
import { Avaliacao } from "../types/avaliacao";
import { NotaBadge } from "./NotaBadge";
import { formatarDataHora } from "../utils/formatarDataHora";

interface AvaliacaoPeekModalProps {
  avaliacao: Avaliacao | null;
  /** Distância vertical (px) do card tocado até o centro da tela, de onde a prévia "nasce" */
  origemY: number;
  selecionada: boolean;
  onToggleSelect: () => void;
  onClose: () => void;
}

const DISTANCIA_PARA_FECHAR = 100;
const VELOCIDADE_PARA_FECHAR = 600;

export function AvaliacaoPeekModal({
  avaliacao,
  origemY,
  selecionada,
  onToggleSelect,
  onClose,
}: AvaliacaoPeekModalProps) {
  const aberto = avaliacao !== null;
  const controles = useDragControls();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Mantém o último conteúdo para a animação de saída não ficar vazia
  const ultima = useRef<Avaliacao | null>(avaliacao);
  if (avaliacao) ultima.current = avaliacao;
  const a = avaliacao ?? ultima.current;

  useEffect(() => {
    if (!aberto) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    // A prévia é só para celular: se a tela crescer, fecha
    const desktop = window.matchMedia?.("(min-width: 640px)");
    const aoRedimensionar = (e: MediaQueryListEvent) => {
      if (e.matches) onCloseRef.current();
    };

    window.addEventListener("keydown", aoTeclar);
    desktop?.addEventListener("change", aoRedimensionar);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", aoTeclar);
      desktop?.removeEventListener("change", aoRedimensionar);
    };
  }, [aberto]);

  function aoSoltar(_: unknown, info: PanInfo) {
    if (
      info.offset.y > DISTANCIA_PARA_FECHAR ||
      info.velocity.y > VELOCIDADE_PARA_FECHAR
    ) {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {aberto && a && (
        <motion.div
          key="peek-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-md sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Avaliação ${a.id} - ${a.nomefilial}`}
            className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800"
            initial={{ scale: 0.6, opacity: 0, y: origemY }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.8 }}
            drag="y"
            dragListener={false}
            dragControls={controles}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={aoSoltar}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Só o "grabber" arrasta, para a rolagem do comentário continuar funcionando */}
            <div
              className="flex cursor-grab touch-none justify-center pt-3 pb-1"
              onPointerDown={(e) => controles.start(e)}
              aria-hidden="true"
            >
              <span className="h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pt-2">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-zinc-800 dark:text-zinc-100">
                  {a.nomefilial}
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Avaliação #{a.id}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar prévia"
                className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 pt-4">
              <div className="flex items-center gap-2">
                <NotaBadge nota={a.nota} />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {RATING_LABELS[a.nota]}
                </span>
              </div>
              <PeekData data={a.data} />
            </div>

            <div className="px-5 pt-4">
              <div className="max-h-[40vh] overflow-y-auto rounded-2xl bg-zinc-50 p-4 text-sm leading-relaxed dark:bg-zinc-900/50">
                {a.comentario?.trim() ? (
                  <p className="whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-200">
                    {a.comentario}
                  </p>
                ) : (
                  <p className="italic text-zinc-400 dark:text-zinc-500">
                    Sem comentário.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-5 pt-4">
              <button
                type="button"
                onClick={onToggleSelect}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  selecionada
                    ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {selecionada ? "Remover seleção" : "Selecionar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PeekData({ data }: { data: string }) {
  const { data: d, hora: h } = formatarDataHora(data);
  return (
    <div className="text-right text-xs text-zinc-400 dark:text-zinc-500">
      <p>{d}</p>
      <p>{h}</p>
    </div>
  );
}
