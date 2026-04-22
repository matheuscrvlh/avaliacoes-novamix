interface StarsProps {
  nota: number;
}

export function Stars({ nota }: StarsProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < nota ? "text-amber-400" : "text-zinc-600"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
