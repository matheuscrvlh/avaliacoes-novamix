import type { AvaliacaoApi } from "@/types/avaliacao";

export interface Resumo {
  total: number;
  media: number | null;
  /** % de notas 5, arredondado */
  pct5: number;
  comComentario: number;
  distribuicao: { nota: number; count: number }[];
}

export function resumir(avaliacoes: AvaliacaoApi[]): Resumo {
  const total = avaliacoes.length;
  const soma = avaliacoes.reduce((s, a) => s + a.nota, 0);
  const cinco = avaliacoes.filter((a) => a.nota === 5).length;

  return {
    total,
    media: total ? soma / total : null,
    pct5: total ? Math.round((cinco / total) * 100) : 0,
    comComentario: avaliacoes.filter((a) => a.comentario?.trim()).length,
    distribuicao: [5, 4, 3, 2, 1].map((nota) => ({
      nota,
      count: avaliacoes.filter((a) => a.nota === nota).length,
    })),
  };
}
