require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const avaliacoes = require("./routes/avaliacoes");
const dashboard = require("./routes/dashboard");
const auth = require("./routes/auth");

app.use("/avaliacoes", avaliacoes);
app.use("/dashboard", dashboard);
app.use("/auth", auth);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
