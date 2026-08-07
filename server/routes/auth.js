const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("[auth] ERRO: JWT_SECRET não definido no .env");
}

const AVALIACOES_MODULE = "avaliacoes";
const PRADO_ID = 1;
const TELEVENDAS_ID = 5;

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.token ?? authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ erro: "Sessão não encontrada." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

function getAvaliacoesAccess(user) {
  const permissao = user?.permissions?.find((p) => p.module === AVALIACOES_MODULE);
  return permissao?.access ?? null;
}

function getFiliaisPermitidas(user) {
  const ids = (user?.branchs ?? []).map((b) => b.id);
  if (ids.includes(PRADO_ID) && !ids.includes(TELEVENDAS_ID)) {
    ids.push(TELEVENDAS_ID);
  }
  return ids;
}

function requireAvaliacoesAccess(req, res, next) {
  const access = getAvaliacoesAccess(req.user);

  if (!access) {
    return res.status(401).json({ erro: "Usuário sem acesso ao módulo de avaliações." });
  }

  req.avaliacoesAccess = access;
  req.filiaisPermitidas = getFiliaisPermitidas(req.user);
  next();
}

function requireAvaliacoesAdmin(req, res, next) {
  if (req.avaliacoesAccess !== "admin") {
    return res.status(403).json({ erro: "Apenas administradores do módulo podem executar esta ação." });
  }
  next();
}

router.get("/me", autenticar, requireAvaliacoesAccess, (req, res) => {
  res.json({
    access: req.avaliacoesAccess,
    filiais: req.filiaisPermitidas,
  });
});

module.exports = router;
module.exports.autenticar = autenticar;
module.exports.requireAvaliacoesAccess = requireAvaliacoesAccess;
module.exports.requireAvaliacoesAdmin = requireAvaliacoesAdmin;
