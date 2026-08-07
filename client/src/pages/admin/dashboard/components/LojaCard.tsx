import { Avaliacao } from "../types/avaliacao";
import { Stars } from "./Stars";

interface LojaCardProps {
  nome: string;
  idfilial: number;
  avaliacoes: Avaliacao[];
}

export function LojaCard({ nome, idfilial, avaliacoes }: LojaCardProps) {
  const notas = avaliacoes.map((a) => Number(a.nota));
  const media = notas.length
    ? notas.reduce((s, n) => s + n, 0) / notas.length
    : 0;

  return (
    <div
      className="
        relative overflow-hidden
        bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md
        rounded-xl p-5 flex flex-col gap-3 shadow-md

        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

        hover:scale-[1.02]
        hover:-translate-y-1
        hover:shadow-2xl

        before:absolute before:inset-0
        before:bg-gradient-to-br
        before:from-white/30 before:to-transparent
        before:opacity-0
        before:transition-opacity before:duration-500
        
        hover:before:opacity-100
      "
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black dark:text-zinc-100">{nome}</span>

        <span className="text-xs text-white bg-[#ee9229] px-2 py-0.5 rounded-full">
          Filial {idfilial}
        </span>
      </div>

      <Stars nota={Math.round(media)} />

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Média</p>
          <p className="text-lg font-semibold text-black dark:text-zinc-100">{media.toFixed(1)}</p>
        </div>

        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Avaliações</p>
          <p className="text-lg font-semibold text-black dark:text-zinc-100">{notas.length}</p>
        </div>
      </div>
    </div>
  );
}
