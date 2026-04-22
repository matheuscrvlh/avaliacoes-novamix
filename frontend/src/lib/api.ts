/// <reference types="vite/client" />
import type { AvaliacaoPayload } from "@/types/avaliacao";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3002";

// Funcao de pegar loja
const LOJAS: Record<number, string> = {
  1: 'Prado',
  2: 'Centro',
  3: 'Olaria',
  4: 'Teresopolis',
};

export function getNomeLoja(lojaId: number): string {
  return LOJAS[lojaId] ?? 'Loja desconhecida';
}

export async function getAvaliacoes() {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    
    const res = await response.json()
    console.log(res)
    return res
  } catch(err) {
    console.error('Erro ao buscar avaliacoes', err)
  }
}

export async function postAvaliacao(
  lojaId: number,
  payload: AvaliacaoPayload
): Promise<void> {
  const nomeLoja = getNomeLoja(lojaId);

  const response = await fetch(`${BASE_URL}/avaliacoes/loja/${lojaId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, nomeLoja}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
  }
}
