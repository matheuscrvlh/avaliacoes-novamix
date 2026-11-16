// Gera a imagem (PNG) e o PDF a partir do relatório renderizado na página.
// As bibliotecas só são baixadas no primeiro uso, para não pesar a abertura do painel.

const A4_LARGURA_MM = 210;
const A4_ALTURA_MM = 297;
const MARGEM_MM = 10;

// O Safari do iPhone devolve canvas em branco acima de ~16,7 milhões de pixels,
// e o Chrome não passa de 32.767 px de altura. Relatórios longos saem com escala menor.
const LIMITE_PIXELS = 16_000_000;
const LIMITE_ALTURA_PX = 32_000;

async function capturar(no: HTMLElement) {
  const { domToCanvas } = await import("modern-screenshot");
  const largura = no.offsetWidth;
  const altura = no.offsetHeight;
  const escala = Math.min(
    2,
    Math.sqrt(LIMITE_PIXELS / (largura * altura)),
    LIMITE_ALTURA_PX / altura,
  );

  return domToCanvas(no, { scale: escala, backgroundColor: "#ffffff", font: false });
}

export async function gerarPng(no: HTMLElement): Promise<Blob> {
  const canvas = await capturar(no);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível gerar a imagem."))),
      "image/png",
    );
  });
}

// Posições (px, a partir do topo do relatório) onde a página pode ser cortada:
// logo abaixo de cada bloco marcado com data-quebra. Assim nenhuma avaliação fica partida
// ao meio. Os 3 px a mais caem no espaço entre blocos e evitam um fio da borda na folha seguinte.
function pontosDeQuebra(no: HTMLElement) {
  const topo = no.getBoundingClientRect().top;
  return [...no.querySelectorAll<HTMLElement>("[data-quebra]")]
    .map((el) => Math.ceil(el.getBoundingClientRect().bottom - topo) + 3)
    .sort((a, b) => a - b);
}

function paginar(altura: number, pontos: number[], pxPorMm: number) {
  const paginas: [number, number][] = [];
  let inicio = 0;

  while (inicio < altura - 1) {
    // A 1ª página já tem o respiro do próprio relatório no topo; as outras ganham margem
    const margens = paginas.length === 0 ? MARGEM_MM : 2 * MARGEM_MM;
    const limite = inicio + (A4_ALTURA_MM - margens) * pxPorMm;

    if (limite >= altura) {
      paginas.push([inicio, altura]);
      break;
    }

    const corte = pontos.filter((p) => p > inicio + 1 && p <= limite).pop() ?? limite;
    paginas.push([inicio, corte]);
    inicio = corte;
  }

  return paginas;
}

export async function gerarPdf(no: HTMLElement): Promise<Blob> {
  const [{ jsPDF }, canvas] = await Promise.all([import("jspdf"), capturar(no)]);

  const largura = no.offsetWidth;
  const escala = canvas.width / largura;
  const pxPorMm = largura / A4_LARGURA_MM;
  const pontos = pontosDeQuebra(no);
  // O rodapé do relatório fica de fora (iria parar sozinho numa folha nova);
  // o "Gerado em" é escrito na margem de baixo de cada folha
  const fimConteudo = Math.min(no.offsetHeight, pontos[pontos.length - 1] ?? no.offsetHeight);
  const paginas = paginar(fimConteudo, pontos, pxPorMm);
  const geradoEm = no.querySelector("[data-gerado-em]")?.textContent ?? "";
  const margemLateralMm = 40 / pxPorMm; // mesmo respiro lateral do relatório (p-10)

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const fatia = document.createElement("canvas");
  const ctx = fatia.getContext("2d");
  if (!ctx) throw new Error("Não foi possível gerar o PDF.");

  paginas.forEach(([inicio, fim], i) => {
    if (i > 0) pdf.addPage();

    const y = Math.round(inicio * escala);
    const h = Math.min(Math.round(fim * escala), canvas.height) - y;

    fatia.width = canvas.width;
    fatia.height = h;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, fatia.width, h);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);

    pdf.addImage(
      fatia.toDataURL("image/jpeg", 0.9),
      "JPEG",
      0,
      i === 0 ? 0 : MARGEM_MM,
      A4_LARGURA_MM,
      h / escala / pxPorMm,
    );

    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(geradoEm, margemLateralMm, A4_ALTURA_MM - 5);
    pdf.text(`Página ${i + 1} de ${paginas.length}`, A4_LARGURA_MM - margemLateralMm, A4_ALTURA_MM - 5, {
      align: "right",
    });
  });

  return pdf.output("blob");
}

export function baixarArquivo(arquivo: File) {
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = arquivo.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** O navegador consegue mandar arquivos deste tipo pela folha de compartilhar do sistema? */
export function podeCompartilhar(tipo: "image/png" | "application/pdf") {
  try {
    const nome = tipo === "image/png" ? "teste.png" : "teste.pdf";
    return (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [new File([""], nome, { type: tipo })] })
    );
  } catch {
    return false;
  }
}
