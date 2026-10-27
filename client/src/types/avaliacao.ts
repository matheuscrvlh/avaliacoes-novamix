export interface AvaliacaoPayload {
  nota: number;
  comentario: string | null;
}

export interface AvaliacaoApi {
  id: number;
  idfilial: number;
  nomefilial: string;
  nota: number;
  comentario: string | null;
  data: string;
}

export interface LojaInfo {
  id: number;
  /** Nome exibido ao cliente no formulário */
  nome: string;
  /** Nome gravado no banco (avaliacoes.nomefilial) */
  nomeCurto: string;
  googleLink?: string;
}

export const TELEVENDAS_ID = 5;

export const LOJAS: Record<number, LojaInfo> = {
  1: {
    id: 1,
    nome: "Loja Prado",
    nomeCurto: "Prado",
    googleLink: "https://share.google/wuGWw3HAoDMr4W85S",
  },
  2: {
    id: 2,
    nome: "Loja Centro",
    nomeCurto: "Centro",
    googleLink: "https://share.google/xeXvVPvSIjM9jONa1",
  },
  3: {
    id: 3,
    nome: "Loja Olaria",
    nomeCurto: "Olaria",
    googleLink: "https://share.google/d6AqrNY9eXndwbPKr",
  },
  4: {
    id: 4,
    nome: "Loja Teresópolis",
    nomeCurto: "Teresopolis",
    googleLink: "https://share.google/BBYlzETG0WP0aLXnP",
  },
  [TELEVENDAS_ID]: {
    id: TELEVENDAS_ID,
    nome: "Televendas",
    nomeCurto: "Televendas",
  },
};


export type SubmitStatus = "idle" | "loading" | "success" | "error";


export const RATING_LABELS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente!",
};
