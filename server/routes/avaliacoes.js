const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const db = new Database('./database/banco.db')
const { autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin } = require('./auth')

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

router.delete('/loja/:id', autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin, (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ erro: 'Id da avaliação obrigatório' })
  }

  const avaliacao = db.prepare('SELECT idfilial FROM avaliacoes WHERE id = ?').get(Number(id))

  if (!avaliacao) {
    return res.status(404).json({ erro: 'Avaliação não encontrada' })
  }

  if (!req.filiaisPermitidas.includes(avaliacao.idfilial)) {
    return res.status(403).json({ erro: 'Sem permissão para excluir avaliações desta filial.' })
  }

  const stmt = db.prepare('DELETE FROM avaliacoes WHERE id = ?')
  stmt.run(Number(id))

  res.json({ sucesso: true })
})


module.exports = router
