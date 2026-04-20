/// <reference types="vite/client" />
import type { AvaliacaoPayload } from "@/types/avaliacao";

/** Troque pela URL real do back-end quando estiver pronto */
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/**
 * Envia uma avaliação para POST /avaliacoes/loja/:lojaId
 * Lança um Error se a resposta não for ok.
 */
export async function postAvaliacao(
  lojaId: number,
  payload: AvaliacaoPayload
): Promise<void> {
  const response = await fetch(`${BASE_URL}/avaliacoes/loja/${lojaId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
  }
}
