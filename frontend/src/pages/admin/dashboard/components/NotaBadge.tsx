import { NOTA_COLORS } from "../constants";

interface NotaBadgeProps {
  nota: number;
}

export function NotaBadge({ nota }: NotaBadgeProps) {
  const c = NOTA_COLORS[nota] ?? NOTA_COLORS[3];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold bg-green-50 ${c.text}`}
    >
      {"★".repeat(nota)}
      {"☆".repeat(5 - nota)} {nota}
    </span>
  );
}
