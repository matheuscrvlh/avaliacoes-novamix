const pool = require("./database");

// Cria as tabelas novas na subida do servidor. Se o usuário do banco não tiver
// permissão de CREATE, rode o SQL abaixo manualmente (também está no README).
const SQL_SUPERVISORES = `
  CREATE TABLE IF NOT EXISTS supervisores (
    id SERIAL PRIMARY KEY,
    idfilial INTEGER NOT NULL,
    nome VARCHAR(80) NOT NULL,
    whatsapp VARCHAR(15) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

async function executarMigracoes() {
  try {
    await pool.query(SQL_SUPERVISORES);
  } catch (err) {
    console.error(
      "[database] não foi possível criar a tabela supervisores (crie manualmente, ver README):",
      err.message
    );
  }
}

module.exports = { executarMigracoes };
