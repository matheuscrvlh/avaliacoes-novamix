require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const app = express();

app.use(cors());
app.use(express.json());

// Migração: adiciona coluna tipo para separar lojas de televendas
const db = new Database("./database/banco.db");
try {
  db.exec("ALTER TABLE avaliacoes ADD COLUMN tipo TEXT DEFAULT 'loja'");
} catch {
  // coluna já existe
}
db.exec("UPDATE avaliacoes SET tipo = 'loja' WHERE tipo IS NULL");

const avaliacoes = require("./routes/avaliacoes");
const dashboard = require("./routes/dashboard");
const auth = require("./routes/auth");

app.use("/avaliacoes", avaliacoes);
app.use("/dashboard", dashboard);
app.use("/auth", auth);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
