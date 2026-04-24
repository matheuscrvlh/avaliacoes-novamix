interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-black">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}
