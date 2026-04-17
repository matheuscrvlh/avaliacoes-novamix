/** Payload enviado ao back-end via POST /avaliacoes/loja/:lojaId */
export interface AvaliacaoPayload {
  nota: number;           // 1–5
  comentario: string | null;
}

/** Informações de cada loja */
export interface LojaInfo {
  id: number;
  nome: string;
}

/** Lojas cadastradas — ajuste os nomes conforme necessário */
export const LOJAS: Record<number, LojaInfo> = {
  1: { id: 1, nome: "Loja 1" },
  2: { id: 2, nome: "Loja 2" },
  3: { id: 3, nome: "Loja 3" },
  4: { id: 4, nome: "Loja 4" },
};

/** Status possíveis do formulário */
export type SubmitStatus = "idle" | "loading" | "success" | "error";

/** Mapeamento de nota → rótulo */
export const RATING_LABELS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente!",
};
