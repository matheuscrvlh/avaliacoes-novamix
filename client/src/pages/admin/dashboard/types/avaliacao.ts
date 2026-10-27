import type { AvaliacaoApi } from "@/types/avaliacao"

export interface Avaliacao extends AvaliacaoApi {
  tipo: 'loja' | 'televendas'
}
