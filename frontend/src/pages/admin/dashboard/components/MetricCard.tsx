interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div
      className="
        relative overflow-hidden
        bg-white/80 backdrop-blur-md
        rounded-xl p-4 shadow-md

        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

        hover:scale-[1.04]
        hover:-translate-y-1
        hover:shadow-2xl

        before:absolute before:inset-0
        before:bg-gradient-to-br
        before:from-white/40 before:to-transparent
        before:opacity-0
        before:transition-opacity before:duration-500
        
        hover:before:opacity-100
      "
    >
      <p className="text-xs text-zinc-400 mb-1">{label}</p>

      <p className="text-2xl font-semibold text-black">{value}</p>

      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}
