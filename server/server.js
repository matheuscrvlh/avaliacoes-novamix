require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

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
