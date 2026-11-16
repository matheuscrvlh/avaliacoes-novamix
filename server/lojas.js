const PRADO_ID = 1;
const TELEVENDAS_ID = 5;

// O nome é o mesmo gravado em avaliacoes.nomefilial
const LOJAS = {
  1: "Prado",
  2: "Centro",
  3: "Olaria",
  4: "Teresopolis",
  5: "Televendas",
};

// Nome com acentos, usado em mensagens (relatório enviado pelo WhatsApp)
const NOMES_EXIBICAO = { ...LOJAS, 4: "Teresópolis" };

module.exports = { LOJAS, NOMES_EXIBICAO, PRADO_ID, TELEVENDAS_ID };
