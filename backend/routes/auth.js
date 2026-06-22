const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_SENHA_HASH = process.env.ADMIN_SENHA_HASH;

if (!JWT_SECRET || !ADMIN_USER || !ADMIN_SENHA_HASH) {
  console.error("[auth] ERRO: JWT_SECRET, ADMIN_USER ou ADMIN_SENHA_HASH não definidos no .env");
}

router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });
    }

    if (!JWT_SECRET || !ADMIN_USER || !ADMIN_SENHA_HASH) {
      return res.status(500).json({ erro: "Servidor mal configurado. Contate o administrador." });
    }

    if (usuario !== ADMIN_USER) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }

    const senhaCorreta = await bcrypt.compare(senha, ADMIN_SENHA_HASH);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }

    const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: "8h" });

    return res.json({ token });
  } catch (err) {
    console.error("[auth] Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = router;
module.exports.autenticar = autenticar;
