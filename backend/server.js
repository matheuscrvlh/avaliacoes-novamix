const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const avaliacoes = require('./routes/avaliacoes')
const dashboard = require('./routes/dashboard')

app.use('/avaliacoes', avaliacoes)
app.use('/dashboard', dashboard)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})