const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')

router.get('/', (req, res) => {
  const dados = db.prepare(`
    SELECT 
      filial,
      ROUND(AVG(nota), 1) AS media,
      COUNT(*) AS total
    FROM avaliacoes
    GROUP BY filial
    ORDER BY media DESC
  `).all()

  res.json(dados)
})

module.exports = router