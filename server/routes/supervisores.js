const express = require("express");
const router = express.Router();
const pool = require("../database/database");
const { LOJAS } = require("../lojas");
const { autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin } = require("./auth");
const { whatsappConfigurado } = require("../services/whatsapp");

const NOME_MAX = 80;

// Guarda só dígitos, com o DDI 55: "(21) 99999-9999" -> "5521999999999"
function normalizarWhatsapp(valor) {
  if (typeof valor !== "string") return null;
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) digitos = `55${digitos}`;
  return /^55[1-9]{2}\d{8,9}$/.test(digitos) ? digitos : null;
}

function validar(req) {
  const { idfilial, nome, whatsapp } = req.body ?? {};
  const filial = Number(idfilial);

  if (!Number.isInteger(filial) || !LOJAS[filial]) {
    return { status: 400, erro: "Filial inválida" };
  }
  if (!req.filiaisPermitidas.includes(filial)) {
    return { status: 403, erro: "Sem permissão para esta filial." };
  }

  const nomeLimpo = typeof nome === "string" ? nome.trim() : "";
  if (!nomeLimpo || nomeLimpo.length > NOME_MAX) {
    return { status: 400, erro: `Informe o nome (até ${NOME_MAX} caracteres)` };
  }

  const numero = normalizarWhatsapp(whatsapp);
  if (!numero) {
    return { status: 400, erro: "WhatsApp inválido. Informe DDD e número, ex.: (21) 99999-9999" };
  }

  return { dados: { idfilial: filial, nome: nomeLimpo, whatsapp: numero } };
}

// Devolve o id se o supervisor existir e for de uma filial do usuário; senão responde o erro
async function buscarPermitido(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ erro: "Id do supervisor inválido" });
    return null;
  }

  const { rows: [supervisor] } = await pool.query("SELECT idfilial FROM supervisores WHERE id = $1", [id]);

  if (!supervisor) {
    res.status(404).json({ erro: "Supervisor não encontrado" });
    return null;
  }
  if (!req.filiaisPermitidas.includes(supervisor.idfilial)) {
    res.status(403).json({ erro: "Sem permissão para esta filial." });
    return null;
  }

  return id;
}

router.use(autenticar, requireAvaliacoesAccess);

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, idfilial, nome, whatsapp FROM supervisores WHERE idfilial = ANY($1::int[]) ORDER BY idfilial, nome",
    [req.filiaisPermitidas]
  );

  res.json({ supervisores: rows, whatsappApi: whatsappConfigurado() });
});

router.post("/", requireAvaliacoesAdmin, async (req, res) => {
  const { status, erro, dados } = validar(req);
  if (erro) return res.status(status).json({ erro });

  const { rows: [supervisor] } = await pool.query(
    "INSERT INTO supervisores (idfilial, nome, whatsapp) VALUES ($1, $2, $3) RETURNING id, idfilial, nome, whatsapp",
    [dados.idfilial, dados.nome, dados.whatsapp]
  );

  res.status(201).json(supervisor);
});

router.put("/:id", requireAvaliacoesAdmin, async (req, res) => {
  const id = await buscarPermitido(req, res);
  if (id === null) return;

  const { status, erro, dados } = validar(req);
  if (erro) return res.status(status).json({ erro });

  const { rows: [supervisor] } = await pool.query(
    "UPDATE supervisores SET idfilial = $1, nome = $2, whatsapp = $3 WHERE id = $4 RETURNING id, idfilial, nome, whatsapp",
    [dados.idfilial, dados.nome, dados.whatsapp, id]
  );

  res.json(supervisor);
});

router.delete("/:id", requireAvaliacoesAdmin, async (req, res) => {
  const id = await buscarPermitido(req, res);
  if (id === null) return;

  await pool.query("DELETE FROM supervisores WHERE id = $1", [id]);
  res.json({ sucesso: true });
});

module.exports = router;
