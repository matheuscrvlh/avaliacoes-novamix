import { useState } from "react";
import { RATING_LABELS } from "@/types/avaliacao";

interface StarRatingProps {
  value: number;
  onChange: (nota: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const active = hovered || value;

  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Selecione uma nota
      </p>

      {/* Estrelas */}
      <div
        className="flex justify-center gap-2"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Nota ${star}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="bg-transparent border-none p-1 cursor-pointer transition-transform duration-150 hover:scale-125 active:scale-95"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill={star <= active ? "#ff8d0a" : "none"}
              stroke={star <= active ? "#ff8d0a" : "#d1d5db"}
              strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>

      {/* Rótulo da nota */}
      <div className="h-6 mt-2">
        {active > 0 && (
          <p
            key={active}
            className="animate-fade-up text-sm font-bold text-novamix-orange"
          >
            {RATING_LABELS[active]}
          </p>
        )}
      </div>
    </div>
  );
}
