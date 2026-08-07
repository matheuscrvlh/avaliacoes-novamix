const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')
const { autenticar, requireAvaliacoesAccess } = require('./auth')

router.get('/', autenticar, requireAvaliacoesAccess, (req, res) => {
  if (req.filiaisPermitidas.length === 0) {
    return res.json([])
  }

  const placeholders = req.filiaisPermitidas.map(() => '?').join(', ')
  const dados = db.prepare(`
    SELECT *
    FROM avaliacoes
    WHERE idfilial IN (${placeholders})
  `).all(...req.filiaisPermitidas)

  res.json(dados)
})

module.exports = router