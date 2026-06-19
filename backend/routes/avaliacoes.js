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
    'INSERT INTO avaliacoes (idfilial, nomefilial, nota, comentario, data) VALUES (?, ?, ?, ?, ?)'
  )
  stmt.run(lojaId, nomeLoja, nota, comentario || null, data)

  res.json({ sucesso: true })
})

router.delete('/loja/:id', (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ erro: 'Id da avaliação obrigatório' })
  }

  const stmt = db.prepare('DELETE FROM avaliacoes WHERE id = ?')
  const result = stmt.run(Number(id))

  if (result.changes === 0) {
    return res.status(404).json({ erro: 'Avaliação não encontrada' })
  }

  res.json({ sucesso: true })
})


module.exports = router
