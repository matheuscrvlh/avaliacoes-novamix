/// <reference types="vite/client" />
import type { AvaliacaoPayload } from "@/types/avaliacao";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://avaliacoes.lojanovamix.com.br/api";
export const HUB_URL = import.meta.env.VITE_HUB_URL ?? "https://hub.lojanovamix.com.br";

function redirectToHub() {
  window.location.href = HUB_URL;
}

const LOJAS: Record<number, string> = {
  1: 'Prado',
  2: 'Centro',
  3: 'Olaria',
  4: 'Teresopolis',
  5: 'Televendas',
};

export function getNomeLoja(lojaId: number): string {
  return LOJAS[lojaId] ?? 'Loja desconhecida';
}

export interface SessaoAvaliacoes {
  access: "admin" | "user" | string;
  filiais: number[];
}

export async function getSessao(): Promise<SessaoAvaliacoes | null> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getAvaliacoes() {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (response.status === 401) {
    redirectToHub();
    return [];
  }

  return response.json();
}

export async function deleteAvaliacao(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/avaliacoes/loja/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (response.status === 401) {
    redirectToHub();
    return;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
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
