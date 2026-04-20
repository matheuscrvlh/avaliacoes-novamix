const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')

router.post('/loja/:lojaId', (req, res) => {
  const { lojaId } = req.params
  const { nota, comentario } = req.body

  if (!lojaId || !nota) {
    return res.status(400).json({ erro: 'Loja e nota são obrigatórios' })
  }

  const stmt = db.prepare(
    'INSERT INTO avaliacoes (filial, nota, comentario) VALUES (?, ?, ?)'
  )
  stmt.run(lojaId, nota, comentario || null)

  res.json({ sucesso: true })
})

module.exports = router