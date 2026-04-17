import { useMemo } from "react";
import { LOJAS } from "@/types/avaliacao";
import type { LojaInfo } from "@/types/avaliacao";

/**
 * Lê o parâmetro ?loja=N da URL e retorna as informações da loja.
 * Retorna null se o parâmetro estiver ausente ou inválido.
 */
export function useLojaParam(): LojaInfo | null {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("loja");
    if (!raw) return null;

    const id = parseInt(raw, 10);
    if (isNaN(id)) return null;

    return LOJAS[id] ?? null;
  }, []);
}
