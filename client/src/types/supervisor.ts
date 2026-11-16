export interface Supervisor {
  id: number;
  idfilial: number;
  nome: string;
  /** Só dígitos, com DDI: 5521999999999 */
  whatsapp: string;
}

export interface SupervisorPayload {
  idfilial: number;
  nome: string;
  whatsapp: string;
}

export interface SupervisoresResposta {
  supervisores: Supervisor[];
  /** true quando o servidor tem a API do WhatsApp configurada (envio direto) */
  whatsappApi: boolean;
}

export interface ResultadoEnvioWhatsapp {
  id: number;
  nome: string;
  ok: boolean;
  erro?: string;
}
