const express = require("express");
const router = express.Router();
const pool = require("../database/database");
const rateLimit = require("../middleware/rateLimit");
const { LOJAS, NOMES_EXIBICAO } = require("../lojas");
const { autenticar, requireAvaliacoesAccess } = require("./auth");
const { whatsappConfigurado, subirPdf, enviarRelatorio } = require("../services/whatsapp");

const PERIODO_MAX = 60;

const limitarEnvio = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  mensagem: "Muitos envios seguidos. Tente novamente em alguns minutos.",
});

// O PDF é gerado no navegador (igual à prévia que a pessoa vê) e chega aqui como corpo bruto.
// Vai só para os supervisores cadastrados da filial, nunca para um número vindo da requisição.
router.post(
  "/whatsapp",
  autenticar,
  requireAvaliacoesAccess,
  limitarEnvio,
  express.raw({ type: "application/pdf", limit: "15mb" }),
  async (req, res) => {
    if (!whatsappConfigurado()) {
      return res.status(503).json({ erro: "O envio pelo WhatsApp não está configurado no servidor." });
    }

    const idfilial = Number(req.query.filial);
    if (!Number.isInteger(idfilial) || !LOJAS[idfilial]) {
      return res.status(400).json({ erro: "Filial inválida" });
    }
    if (!req.filiaisPermitidas.includes(idfilial)) {
      return res.status(403).json({ erro: "Sem permissão para esta filial." });
    }

    const periodo = String(req.query.periodo ?? "").trim();
    if (!periodo || periodo.length > PERIODO_MAX || /[\r\n\t]/.test(periodo)) {
      return res.status(400).json({ erro: "Período inválido" });
    }

    const pdf = req.body;
    if (!Buffer.isBuffer(pdf) || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return res.status(400).json({ erro: "Arquivo PDF inválido" });
    }

    const arquivo = String(req.query.arquivo ?? "");
    const nomeArquivo = /^[\w.-]{1,120}\.pdf$/.test(arquivo) ? arquivo : "relatorio-avaliacoes.pdf";

    const { rows: supervisores } = await pool.query(
      "SELECT id, nome, whatsapp FROM supervisores WHERE idfilial = $1 ORDER BY nome",
      [idfilial]
    );

    if (supervisores.length === 0) {
      return res.status(400).json({ erro: "Nenhum supervisor cadastrado para esta filial." });
    }

    let mediaId;
    try {
      mediaId = await subirPdf(pdf, nomeArquivo);
    } catch (err) {
      console.error("[whatsapp] falha ao subir o PDF:", err);
      return res.status(502).json({ erro: `O WhatsApp recusou o arquivo: ${err.message}` });
    }

    const resultados = await Promise.all(
      supervisores.map(async (s) => {
        try {
          await enviarRelatorio({
            para: s.whatsapp,
            mediaId,
            nomeArquivo,
            nomeLoja: NOMES_EXIBICAO[idfilial],
            periodo,
          });
          return { id: s.id, nome: s.nome, ok: true };
        } catch (err) {
          console.error(`[whatsapp] falha ao enviar para o supervisor ${s.id}:`, err);
          return { id: s.id, nome: s.nome, ok: false, erro: err.message };
        }
      })
    );

    res.json({ resultados });
  }
);

module.exports = router;
