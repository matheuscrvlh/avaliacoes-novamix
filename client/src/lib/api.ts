/// <reference types="vite/client" />
import type { AvaliacaoApi, AvaliacaoPayload } from "@/types/avaliacao";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://avaliacoes.lojanovamix.com.br/api";
export const HUB_URL = import.meta.env.VITE_HUB_URL ?? "https://hub.lojanovamix.com.br";

function redirectToHub() {
  window.location.href = HUB_URL;
}

async function lerErro(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");

  try {
    const erro = JSON.parse(text)?.erro;
    if (typeof erro === "string") return erro;
  } catch {
    // resposta não é JSON
  }

  return `Erro ${response.status}: ${text || response.statusText}`;
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

export async function getAvaliacoes(): Promise<AvaliacaoApi[]> {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  if (response.status === 401) {
    redirectToHub();
    return [];
  }

  if (!response.ok) {
    throw new Error(await lerErro(response));
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
    throw new Error(await lerErro(response));
  }
}

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
    throw new Error(await lerErro(response));
  }
}
