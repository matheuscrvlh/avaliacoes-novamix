require("dotenv").config();

// Envio pela API oficial do WhatsApp (WhatsApp Business Cloud API, da Meta).
// Mensagem iniciada pela empresa exige um modelo aprovado pela Meta: o PDF vai
// no cabeçalho do modelo e o corpo recebe {{1}} = loja e {{2}} = período.
const {
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_TEMPLATE = "relatorio_avaliacoes",
  WHATSAPP_TEMPLATE_IDIOMA = "pt_BR",
  WHATSAPP_API_VERSION = "v23.0",
} = process.env;

const configurado = Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID);

if (!configurado) {
  console.warn(
    "[whatsapp] WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não definidos no .env: " +
      "o envio direto de relatórios pelo WhatsApp fica desativado."
  );
}

const BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`;

function whatsappConfigurado() {
  return configurado;
}

async function chamarApi(caminho, { headers, ...init }) {
  const response = await fetch(`${BASE_URL}/${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, ...headers },
    signal: AbortSignal.timeout(30000),
  });

  const corpo = await response.json().catch(() => ({}));

  if (!response.ok) {
    const erro = corpo?.error;
    throw new Error(erro?.error_data?.details || erro?.message || `HTTP ${response.status}`);
  }

  return corpo;
}

// Sobe o PDF uma vez e devolve o id, reaproveitado para todos os destinatários
async function subirPdf(pdf, nomeArquivo) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([pdf], { type: "application/pdf" }), nomeArquivo);

  const { id } = await chamarApi("media", { method: "POST", body: form });
  return id;
}

async function enviarRelatorio({ para, mediaId, nomeArquivo, nomeLoja, periodo }) {
  await chamarApi("messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: para,
      type: "template",
      template: {
        name: WHATSAPP_TEMPLATE,
        language: { code: WHATSAPP_TEMPLATE_IDIOMA },
        components: [
          {
            type: "header",
            parameters: [{ type: "document", document: { id: mediaId, filename: nomeArquivo } }],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: nomeLoja },
              { type: "text", text: periodo },
            ],
          },
        ],
      },
    }),
  });
}

module.exports = { whatsappConfigurado, subirPdf, enviarRelatorio };
