/// <reference types="vite/client" />
import type { AvaliacaoApi, AvaliacaoPayload } from "@/types/avaliacao";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://avaliacoes.lojanovamix.com.br/api";
export const HUB_URL = import.meta.env.VITE_HUB_URL ?? "https://hub.lojanovamix.com.br";

// `npm run dev:mock`: usa dados de exemplo e não chama a API real. Em build de produção vira `false`.
const MOCK = import.meta.env.MODE === "mock";
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  if (MOCK) return { access: "admin", filiais: [1, 2, 3, 4, 5] };

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getAvaliacoes(): Promise<AvaliacaoApi[]> {
  if (MOCK) {
    await esperar(1200); // deixa o esqueleto de carregamento visível
    const { avaliacoesMock } = await import("./mock");
    return avaliacoesMock();
  }

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
  if (MOCK) {
    await esperar(400);
    return;
  }

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
  if (MOCK) {
    await esperar(600);
    return;
  }

  const response = await fetch(`${BASE_URL}/avaliacoes/loja/${lojaId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await lerErro(response));
  }
}
