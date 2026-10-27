const express = require('express')
const router = express.Router()
const pool = require('../database/database')
const rateLimit = require('../middleware/rateLimit')
const { LOJAS } = require('../lojas')
const { emailConfigurado, enviarAvaliacaoBaixa } = require('../services/email')
const { autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin } = require('./auth')

const COMENTARIO_MAX = 500
const NOTA_MINIMA_DASHBOARD = 4

const limitarEnvio = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 })

router.post('/loja/:lojaId', limitarEnvio, async (req, res) => {
  const lojaId = Number(req.params.lojaId)
  const { nota, comentario } = req.body ?? {}

  if (!Number.isInteger(lojaId) || !LOJAS[lojaId]) {
    return res.status(400).json({ erro: 'Loja inválida' })
  }

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({ erro: 'A nota deve ser um número inteiro de 1 a 5' })
  }

  if (comentario != null && typeof comentario !== 'string') {
    return res.status(400).json({ erro: 'Comentário inválido' })
  }

  const comentarioLimpo = comentario?.trim() || null

  if (comentarioLimpo && comentarioLimpo.length > COMENTARIO_MAX) {
    return res.status(400).json({ erro: `O comentário deve ter no máximo ${COMENTARIO_MAX} caracteres` })
  }

  const data = new Date().toISOString()

  // Notas baixas vão por e-mail e não são gravadas (não aparecem no dashboard).
  // Sem SMTP configurado, grava normalmente para não perder a avaliação.
  if (nota < NOTA_MINIMA_DASHBOARD && emailConfigurado()) {
    try {
      await enviarAvaliacaoBaixa({ nomeLoja: LOJAS[lojaId], nota, comentario: comentarioLimpo, data })
    } catch (err) {
      console.error('[email] falha ao enviar avaliação com nota baixa:', err)
      return res.status(503).json({ erro: 'Não foi possível enviar sua avaliação agora. Tente novamente.' })
    }

    return res.json({ sucesso: true })
  }

  await pool.query(
    'INSERT INTO avaliacoes (idfilial, nomefilial, nota, comentario, data) VALUES ($1, $2, $3, $4, $5)',
    [lojaId, LOJAS[lojaId], nota, comentarioLimpo, data]
  )

  res.json({ sucesso: true })
})

router.delete('/loja/:id', autenticar, requireAvaliacoesAccess, requireAvaliacoesAdmin, async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'Id da avaliação inválido' })
  }

  const { rows: [avaliacao] } = await pool.query('SELECT idfilial FROM avaliacoes WHERE id = $1', [id])

  if (!avaliacao) {
    return res.status(404).json({ erro: 'Avaliação não encontrada' })
  }

  if (!req.filiaisPermitidas.includes(avaliacao.idfilial)) {
    return res.status(403).json({ erro: 'Sem permissão para excluir avaliações desta filial.' })
  }

  await pool.query('DELETE FROM avaliacoes WHERE id = $1', [id])

  res.json({ sucesso: true })
})


module.exports = router
