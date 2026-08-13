const express = require('express')
const router = express.Router()
const pool = require('../database/database')
const { autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin } = require('./auth')

router.post('/loja/:lojaId', async (req, res) => {
  const { lojaId } = req.params
  const { nomeLoja, nota, comentario } = req.body

  if (!lojaId || !nota) {
    return res.status(400).json({ erro: 'Loja e nota são obrigatórios' })
  }

  const data = new Date().toISOString()
  await pool.query(
    'INSERT INTO avaliacoes (idfilial, nomefilial, nota, comentario, data) VALUES ($1, $2, $3, $4, $5)',
    [lojaId, nomeLoja, nota, comentario || null, data]
  )

  res.json({ sucesso: true })
})

router.delete('/loja/:id', autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin, async (req, res) => {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ erro: 'Id da avaliação obrigatório' })
  }

  const { rows: [avaliacao] } = await pool.query('SELECT idfilial FROM avaliacoes WHERE id = $1', [Number(id)])

  if (!avaliacao) {
    return res.status(404).json({ erro: 'Avaliação não encontrada' })
  }

  if (!req.filiaisPermitidas.includes(avaliacao.idfilial)) {
    return res.status(403).json({ erro: 'Sem permissão para excluir avaliações desta filial.' })
  }

  await pool.query('DELETE FROM avaliacoes WHERE id = $1', [Number(id)])

  res.json({ sucesso: true })
})


module.exports = router
