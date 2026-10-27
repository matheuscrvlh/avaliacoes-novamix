type Celula = string | number | null | undefined;

function escapar(valor: Celula): string {
  let texto = valor == null ? "" : String(valor);

  // Evita que o Excel interprete comentários de clientes como fórmulas
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;

  if (/[",\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;

  return texto;
}

export function baixarCSV(nomeArquivo: string, cabecalho: string[], linhas: Celula[][]) {
  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map(escapar).join(","))
    .join("\r\n");

  // BOM para o Excel reconhecer UTF-8 (acentos)
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
