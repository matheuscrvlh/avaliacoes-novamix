const express = require('express')
const router = express.Router()
const pool = require('../database/database')
const { autenticar, requireAvaliacoesAccess } = require('./auth')

router.get('/', autenticar, requireAvaliacoesAccess, async (req, res) => {
  if (req.filiaisPermitidas.length === 0) {
    return res.json([])
  }

  const placeholders = req.filiaisPermitidas.map((_, i) => `$${i + 1}`).join(', ')
  const { rows } = await pool.query(
    `SELECT * FROM avaliacoes WHERE idfilial IN (${placeholders})`,
    req.filiaisPermitidas
  )

  res.json(rows)
})

module.exports = router