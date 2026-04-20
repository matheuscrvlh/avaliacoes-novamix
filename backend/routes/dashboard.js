const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')

router.get('/', (req, res) => {
  const dados = db.prepare(`
    SELECT 
      *
    FROM avaliacoes
  `).all()

  res.json(dados)
})

module.exports = router