const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')

router.post('/', (req, res) => {
  const { filial, nota, comentario } = req.body

  if (!filial || !nota) {
    return res.status(400).json({ erro: 'Filial e nota são obrigatórios' })
  }

  const stmt = db.prepare(
    'INSERT INTO avaliacoes (filial, nota, comentario) VALUES (?, ?, ?)'
  )
  stmt.run(filial, nota, comentario || null)

  res.json({ sucesso: true })
})

module.exports = router