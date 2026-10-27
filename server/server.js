require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Quantidade de proxies na frente do servidor (nginx do client + proxy externo),
// necessária para req.ip refletir o IP real do cliente.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 2));

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const avaliacoes = require("./routes/avaliacoes");
const dashboard = require("./routes/dashboard");
const auth = require("./routes/auth");

app.use("/avaliacoes", avaliacoes);
app.use("/dashboard", dashboard);
app.use("/auth", auth);

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status ?? 500).json({ erro: err.status ? err.message : "Erro interno do servidor." });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
