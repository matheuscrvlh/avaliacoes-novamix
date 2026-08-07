import { useMemo } from "react";
import { LOJAS } from "@/types/avaliacao";
import type { LojaInfo } from "@/types/avaliacao";

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
