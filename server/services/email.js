const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  EMAIL_AVALIACAO_DESTINO,
} = process.env;

const configurado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_AVALIACAO_DESTINO);

if (!configurado) {
  console.warn(
    "[email] SMTP_HOST, SMTP_USER, SMTP_PASS ou EMAIL_AVALIACAO_DESTINO não definidos no .env: " +
      "avaliações com nota baixa serão gravadas no banco em vez de enviadas por e-mail."
  );
}

const transporter = configurado
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

function emailConfigurado() {
  return configurado;
}

async function enviarAvaliacaoBaixa({ nomeLoja, nota, comentario, data }) {
  const quando = new Date(data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: EMAIL_AVALIACAO_DESTINO,
    subject: `Avaliação ${nota}★ - ${nomeLoja}`,
    text: [
      `Nova avaliação com nota baixa.`,
      ``,
      `Loja: ${nomeLoja}`,
      `Nota: ${nota} de 5`,
      `Data: ${quando}`,
      ``,
      `Comentário:`,
      comentario || "(sem comentário)",
    ].join("\n"),
  });
}

module.exports = { emailConfigurado, enviarAvaliacaoBaixa };
