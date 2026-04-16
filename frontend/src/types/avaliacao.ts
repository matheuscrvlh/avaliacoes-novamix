/** Payload enviado ao back-end via POST /avaliacoes */
export interface AvaliacaoPayload {
  nota: number;           // 1–5
  comentario: string | null;
}

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
