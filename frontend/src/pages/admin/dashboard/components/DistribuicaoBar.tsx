import { useEffect, useState } from "react";
import { BAR_COLORS } from "../../constants";

interface DistribuicaoBarProps {
  data: { nota: number; count: number }[];
}

export function DistribuicaoBar({ data }: DistribuicaoBarProps) {
  const [animated, setAnimated] = useState(false);

  const max = data.length ? Math.max(...data.map((d) => d.count)) : 0;

  useEffect(() => {
    setAnimated(true);
  }, []);

  if (!data.length) {
    return (
      <div className="bg-white shadow-md rounded-xl p-5 text-sm text-zinc-500">
        Nenhuma avaliação disponível no momento.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-800 mb-4">
        Distribuição de notas
      </p>

      <div className="flex flex-col gap-3">
        {data.map(({ nota, count }, index) => {
          const percentage = max ? (count / max) * 100 : 0;
          const barColor = BAR_COLORS[nota] ?? "bg-zinc-400";

          return (
            <div
              key={nota}
              className={`
                flex items-center gap-3
                transition-all duration-700 ease-out
                ${animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
              style={{
                transitionDelay: `${index * 120}ms`,
              }}
            >
              <span className="text-xs text-zinc-500 w-4 text-right">
                {nota}
              </span>

              <div
                className="flex-1 bg-zinc-200 rounded-full h-5 overflow-hidden relative group"
                title={`Nota ${nota}: ${count} avaliações (${Math.round(
                  percentage,
                )}%)`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                  style={{
                    width: animated ? `${percentage}%` : "0%",
                  }}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition">
                  {Math.round(percentage)}%
                </div>
              </div>

              <span className="text-xs text-zinc-500 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
