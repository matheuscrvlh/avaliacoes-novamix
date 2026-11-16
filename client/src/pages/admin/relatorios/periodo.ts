// Períodos do relatório, sempre em dias de São Paulo no formato AAAA-MM-DD
// (comparáveis como texto). Os dois limites entram no período.

export type TipoPeriodo = "semana" | "mes";

export interface Periodo {
  tipo: TipoPeriodo;
  inicio: string;
  fim: string;
}

const TIMEZONE = "America/Sao_Paulo";
const DIA_MS = 86400000;

// A semana do relatório vai de sábado a sexta: enviando toda sexta, os relatórios
// cobrem todos os dias, sem buracos nem repetições.
const SEXTA = 5;

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const formatoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function diaEmSaoPaulo(data: Date | string) {
  return formatoDia.format(new Date(data));
}

export function hojeEmSaoPaulo() {
  return diaEmSaoPaulo(new Date());
}

function paraMs(dia: string) {
  return Date.parse(`${dia}T00:00:00Z`);
}

function deMs(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

function somarDias(dia: string, dias: number) {
  return deMs(paraMs(dia) + dias * DIA_MS);
}

function semanaTerminandoEm(fim: string): Periodo {
  return { tipo: "semana", inicio: somarDias(fim, -6), fim };
}

function mesDe(ano: number, mes: number): Periodo {
  const inicio = deMs(Date.UTC(ano, mes - 1, 1));
  const fim = deMs(Date.UTC(ano, mes, 0)); // dia 0 do mês seguinte = último dia
  return { tipo: "mes", inicio, fim };
}

/** Semana: a que terminou na última sexta (ou hoje, se for sexta). Mês: o mês atual. */
export function periodoPadrao(tipo: TipoPeriodo, hoje = hojeEmSaoPaulo()): Periodo {
  if (tipo === "mes") {
    const [ano, mes] = hoje.split("-").map(Number);
    return mesDe(ano, mes);
  }

  const diaSemana = new Date(paraMs(hoje)).getUTCDay();
  const diasDesdeSexta = (diaSemana - SEXTA + 7) % 7;
  return semanaTerminandoEm(somarDias(hoje, -diasDesdeSexta));
}

/** Período anterior (passos < 0) ou seguinte (passos > 0) do mesmo tipo. */
export function deslocarPeriodo(periodo: Periodo, passos: number): Periodo {
  if (periodo.tipo === "semana") {
    return semanaTerminandoEm(somarDias(periodo.fim, 7 * passos));
  }

  const [ano, mes] = periodo.inicio.split("-").map(Number);
  const alvo = new Date(Date.UTC(ano, mes - 1 + passos, 1));
  return mesDe(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1);
}

export function contemDia(periodo: Periodo, dia: string) {
  return dia >= periodo.inicio && dia <= periodo.fim;
}

export function formatarDia(dia: string, comAno = true) {
  const [ano, mes, d] = dia.split("-");
  return comAno ? `${d}/${mes}/${ano}` : `${d}/${mes}`;
}

/** "08/11 a 14/11/2026" ou "novembro de 2026" */
export function rotuloPeriodo(periodo: Periodo) {
  if (periodo.tipo === "mes") {
    const [ano, mes] = periodo.inicio.split("-").map(Number);
    return `${MESES[mes - 1]} de ${ano}`;
  }

  const mesmoAno = periodo.inicio.slice(0, 4) === periodo.fim.slice(0, 4);
  return `${formatarDia(periodo.inicio, !mesmoAno)} a ${formatarDia(periodo.fim)}`;
}

/** Texto usado em mensagens: "semana de 08/11 a 14/11/2026" ou "novembro de 2026" */
export function descreverPeriodo(periodo: Periodo) {
  return periodo.tipo === "semana"
    ? `semana de ${rotuloPeriodo(periodo)}`
    : rotuloPeriodo(periodo);
}

/** Para títulos: "Semana de 08/11 a 14/11/2026" ou "Novembro de 2026" */
export function tituloPeriodo(periodo: Periodo) {
  const texto = descreverPeriodo(periodo);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** avaliacoes-prado-semana-2026-11-08-a-2026-11-14.pdf / avaliacoes-prado-2026-11.png */
export function nomeArquivo(nomeLoja: string, periodo: Periodo, extensao: "png" | "pdf") {
  const sufixo =
    periodo.tipo === "semana"
      ? `semana-${periodo.inicio}-a-${periodo.fim}`
      : periodo.inicio.slice(0, 7);
  return `avaliacoes-${slug(nomeLoja)}-${sufixo}.${extensao}`;
}
