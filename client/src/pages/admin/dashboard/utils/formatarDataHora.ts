export function formatarDataHora(valor: string | null | undefined) {
  if (!valor) return { data: "—", hora: "—" };

  const date = new Date(valor)

  const data = date.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const hora = date.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit"
  })

  return { data, hora };
}
