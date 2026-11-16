export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/** "5521999999999" ou "21999999999" -> "(21) 99999-9999". Também serve de máscara ao digitar. */
export function formatarTelefone(valor: string) {
  let d = apenasDigitos(valor);
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.slice(0, 11);

  if (d.length <= 2) return d ? `(${d}` : "";

  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;

  const corte = resto.length <= 8 ? 4 : 5;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** Abre a conversa com o número no WhatsApp (app ou web), com a mensagem já digitada. */
export function linkWhatsapp(numero: string, texto: string) {
  return `https://wa.me/${apenasDigitos(numero)}?text=${encodeURIComponent(texto)}`;
}
