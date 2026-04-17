/** Payload enviado ao back-end via POST /avaliacoes/loja/:lojaId */
export interface AvaliacaoPayload {
  nota: number;           // 1–5
  comentario: string | null;
}

/** Inf de cada loja */
export interface LojaInfo {
  id: number; 
  nome: string;
}

/* Lojas cadastradas  */
export const LOJAS: Record<number, LojaInfo> = {
  1: { id: 1, nome: "Loja Prado" },
  2: { id: 2, nome: "Loja Centro" },
  3: { id: 3, nome: "Loja Olaria" },
  4: { id: 4, nome: "Loja Teresópolis" },
};


export type SubmitStatus = "idle" | "loading" | "success" | "error";


export const RATING_LABELS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente!",
};
