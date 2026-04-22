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
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{nome}</span>
        <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-0.5 rounded-full">
          Filial {idfilial}
        </span>
      </div>
      <Stars nota={Math.round(media)} />
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-700">
        <div>
          <p className="text-xs text-zinc-500">Média</p>
          <p className="text-lg font-semibold text-zinc-100">
            {media.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Avaliações</p>
          <p className="text-lg font-semibold text-zinc-100">{notas.length}</p>
        </div>
      </div>
    </div>
  );
}
