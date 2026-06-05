const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')

router.post('/loja/:lojaId', (req, res) => {
  const { lojaId } = req.params
  const { nomeLoja, nota, comentario } = req.body

  if (!lojaId || !nota) {
    return res.status(400).json({ erro: 'Loja e nota são obrigatórios' })
  }

  const data = new Date().toISOString()
  const stmt = db.prepare(
    'INSERT INTO avaliacoes (idfilial, nomefilial, nota, comentario, data, tipo) VALUES (?, ?, ?, ?, ?, ?)'
  )
  stmt.run(lojaId, nomeLoja, nota, comentario || null, data, 'loja')

  res.json({ sucesso: true })
})

router.post('/televendas', (req, res) => {
  const { nota, comentario } = req.body

  if (!nota) {
    return res.status(400).json({ erro: 'Nota é obrigatória' })
  }

  const data = new Date().toISOString()
  const stmt = db.prepare(
    'INSERT INTO avaliacoes (idfilial, nomefilial, nota, comentario, data, tipo) VALUES (?, ?, ?, ?, ?, ?)'
  )
  stmt.run(0, 'Televendas', nota, comentario || null, data, 'televendas')

  res.json({ sucesso: true })
})

module.exports = router
