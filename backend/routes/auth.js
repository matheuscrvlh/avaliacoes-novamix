const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const USUARIOS = [
  {
    usuario: process.env.ADMIN_USER,
    senhaHash: process.env.ADMIN_SENHA_HASH,
  },
];

router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });
  }

  const user = USUARIOS.find((u) => u.usuario === usuario);

  if (!user) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  }

  const senhaCorreta = await bcrypt.compare(senha, user.senhaHash);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: "Usuário ou senha incorretos." });
  }

  const token = jwt.sign({ usuario: user.usuario }, JWT_SECRET, {
    expiresIn: "8h",
  });

  return res.json({ token });
});

module.exports = router;

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

module.exports.autenticar = autenticar;
