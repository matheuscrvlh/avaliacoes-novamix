// Dados de exemplo para `npm run dev:mock` (nada é enviado à API real).
import type { AvaliacaoApi } from "@/types/avaliacao";

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

  return Array.from({ length: 48 }, (_, i) => {
    const [idfilial, nomefilial] = LOJAS[i % LOJAS.length];
    return {
      id: 1000 - i,
      idfilial,
      nomefilial,
      nota: notas[i % notas.length],
      comentario: COMENTARIOS[i % COMENTARIOS.length],
      data: new Date(agora - i * 0.9 * DIA - (i % 7) * 3600 * 1000).toISOString(),
    };
  });
}
