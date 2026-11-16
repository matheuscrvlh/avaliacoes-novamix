// Dados de exemplo para `npm run dev:mock` (nada é enviado à API real).
import type { AvaliacaoApi } from "@/types/avaliacao";
import type { Supervisor, SupervisorPayload } from "@/types/supervisor";

const DIA = 24 * 60 * 60 * 1000;

const COMENTARIOS: (string | null)[] = [
  "Atendimento excelente, super recomendo!",
  null,
  "Demorou muito para ser atendido, mas o atendente foi educado.",
  "Produto fresco e entrega rápida.\nVoltarei com certeza!",
  "Ótimo preço, ótimo atendimento. Parabéns à equipe!",
  null,
  "Não encontrei o produto que queria e ninguém soube me informar quando chegaria. Fiquei esperando mais de vinte minutos no balcão sem que ninguém viesse me atender, e quando fui atendido o funcionário pareceu desinteressado. Espero que melhorem, porque a loja tem potencial e os preços são bons.",
  "Bom",
  "Péssimo, nunca mais volto.",
  "Televendas muito atencioso, resolveu meu pedido na hora.",
  "Faltou troco e o caixa estava lento.",
  null,
  "Tudo certo, sem reclamações.",
];

const LOJAS: [number, string][] = [
  [1, "Prado"],
  [2, "Centro"],
  [3, "Olaria"],
  [4, "Teresopolis"],
  [5, "Televendas"],
];

export function avaliacoesMock(): AvaliacaoApi[] {
  const agora = Date.now();
  const notas = [5, 5, 4, 5, 3, 5, 1, 4, 2, 5, 5, 4, 3];

  // ~70 dias de dados, para os relatórios semanais e mensais terem volume
  return Array.from({ length: 200 }, (_, i) => {
    const [idfilial, nomefilial] = LOJAS[i % LOJAS.length];
    return {
      id: 1000 - i,
      idfilial,
      nomefilial,
      nota: notas[i % notas.length],
      comentario: COMENTARIOS[i % COMENTARIOS.length],
      data: new Date(agora - i * 0.35 * DIA - (i % 7) * 3600 * 1000).toISOString(),
    };
  });
}

// Supervisores em memória (somem ao recarregar a página).
// VITE_MOCK_WHATSAPP_API=0 simula o servidor sem a API do WhatsApp configurada.
export const WHATSAPP_API_MOCK = import.meta.env.VITE_MOCK_WHATSAPP_API !== "0";

let supervisores: Supervisor[] = [
  { id: 1, idfilial: 1, nome: "Carlos Souza", whatsapp: "5521999990001" },
  { id: 2, idfilial: 1, nome: "Ana Lima", whatsapp: "5521988880002" },
  { id: 3, idfilial: 2, nome: "Marcos Pereira", whatsapp: "5521977770003" },
];
let proximoId = 4;

export function supervisoresMock(): Supervisor[] {
  return [...supervisores];
}

export function salvarSupervisorMock(dados: SupervisorPayload, id?: number): Supervisor {
  let whatsapp = dados.whatsapp.replace(/\D/g, "");
  if (whatsapp.length === 10 || whatsapp.length === 11) whatsapp = `55${whatsapp}`;
  if (!/^55[1-9]{2}\d{8,9}$/.test(whatsapp)) {
    throw new Error("WhatsApp inválido. Informe DDD e número, ex.: (21) 99999-9999");
  }

  const salvo = { ...dados, nome: dados.nome.trim(), whatsapp, id: id ?? proximoId++ };
  supervisores = id
    ? supervisores.map((s) => (s.id === id ? salvo : s))
    : [...supervisores, salvo];
  return salvo;
}

export function excluirSupervisorMock(id: number) {
  supervisores = supervisores.filter((s) => s.id !== id);
}
