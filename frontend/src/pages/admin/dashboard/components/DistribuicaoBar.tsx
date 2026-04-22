import { BAR_COLORS } from "../constants";

interface DistribuicaoBarProps {
  data: { nota: number; count: number }[];
}

export function DistribuicaoBar({ data }: DistribuicaoBarProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <p className="text-sm font-medium text-zinc-300 mb-4">
        Distribuição de notas
      </p>
      <div className="flex flex-col gap-2">
        {data.map(({ nota, count }) => (
          <div key={nota} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-4 text-right">{nota}</span>
            <div className="flex-1 bg-zinc-700 rounded h-5 overflow-hidden">
              <div
                className={`h-full rounded transition-all duration-500 ${BAR_COLORS[nota]}`}
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 w-6 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
