# ⭐ Sistema de Avaliações - Novamix Food Service

Sistema de avaliações de atendimento da **Novamix Food Service**. Os clientes avaliam as lojas e o Televendas por um formulário simples, e a equipe acompanha os resultados em um dashboard administrativo.

- ✅ Área pública para clientes enviarem avaliações
- ✅ Dashboard administrativo (acesso via Hub)
- ✅ Filtros por loja, nota e período (hoje, semana, mês)
- ✅ Ordenação, paginação e seleção múltipla
- ✅ Exportação CSV
- ✅ Dark Mode
- ✅ Redirecionamento para avaliação no Google em notas 5★
- ✅ Responsivo (mobile/desktop)

---

# 🔗 Links

- Área do cliente: https://avaliacoes.lojanovamix.com.br/?loja=1
- Televendas: https://avaliacoes.lojanovamix.com.br/televendas
- Dashboard: https://avaliacoes.lojanovamix.com.br/dashboard

O parâmetro `?loja=` identifica a filial avaliada. Sem ele, o cliente escolhe a filial numa tela de seleção.

| ID | Filial |
| -- | ------ |
| 1 | Prado |
| 2 | Centro |
| 3 | Olaria |
| 4 | Teresópolis |
| 5 | Televendas |

---

# 🧠 Funcionalidades

## 👤 Área do Cliente

- Avaliação de 1 a 5 estrelas
- Comentário opcional (até 500 caracteres)
- Identificação da loja via URL
- Link para avaliar no Google ao enviar 5 estrelas (lojas 1 a 4)

## 🔐 Dashboard

- Acesso protegido: não existe login neste sistema, a sessão vem do **Hub** (`hub.lojanovamix.com.br`). Sem sessão válida, o usuário é redirecionado para o Hub.
- Abas **Lojas** e **Televendas**
- Métricas (total, nota média, % de notas 5, comentários), cards por loja e distribuição de notas
- Filtros por loja, nota e período (fuso `America/Sao_Paulo`)
- Ordenação por loja, nota e data (vale para todos os resultados, não só a página atual)
- Seleção múltipla (o checkbox do cabeçalho seleciona todos os resultados filtrados, em todas as páginas)
- Exclusão de avaliações (apenas admin do módulo)
- Exportação CSV dos selecionados ou, sem seleção, de todos os resultados filtrados

---

# 🔑 Autenticação e permissões

O Hub emite um JWT (cookie `token`) assinado com o `JWT_SECRET`, que este servidor apenas valida. O token traz:

- `permissions[]`: o módulo `avaliacoes` com acesso `admin` ou outro. Sem o módulo, não há acesso.
- `branchs[]`: filiais do usuário. Quem tem a filial 1 (Prado) também enxerga o Televendas (5).

| Ação | Quem pode |
| ---- | --------- |
| Enviar avaliação | Público |
| Listar avaliações (`GET /dashboard`) | Qualquer usuário com o módulo, apenas das suas filiais |
| Excluir avaliação | Admin do módulo, apenas das suas filiais |

---

# 🛠️ Tecnologias

**Client** (`client/`): React 18, TypeScript, Vite, TailwindCSS, framer-motion, lucide-react, react-router.

**Server** (`server/`): Node.js 22, Express 5, PostgreSQL (`pg`), jsonwebtoken, cookie-parser, cors.

**Infra**: Docker Compose, nginx (serve o SPA e faz proxy de `/api/` para o server).

---

# 📂 Estrutura

```
avaliacoes-novamix/
├── client/
│   ├── src/
│   │   ├── components/       # formulário público e componentes de UI
│   │   ├── context/          # AuthContext (sessão)
│   │   ├── hooks/
│   │   ├── lib/              # api.ts (chamadas HTTP), csv.ts
│   │   ├── pages/
│   │   │   ├── admin/        # dashboard
│   │   │   └── public/       # páginas do cliente
│   │   └── types/            # tipos e cadastro de lojas (LOJAS)
│   ├── nginx.conf
│   └── Dockerfile
├── server/
│   ├── database/             # pool do PostgreSQL
│   ├── middleware/           # rate limit
│   ├── routes/               # auth, avaliacoes, dashboard
│   ├── lojas.js              # cadastro de lojas (ids e nomes)
│   ├── server.js
│   └── Dockerfile
└── docker-compose.yml
```

> Ao adicionar ou renomear uma loja, atualize `server/lojas.js` e `client/src/types/avaliacao.ts` (`LOJAS`).

---

# ⚙️ Como rodar

## Variáveis de ambiente

Copie os exemplos e preencha:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

| Arquivo | Variável | Descrição |
| ------- | -------- | --------- |
| server | `JWT_SECRET` | Mesmo segredo usado pelo Hub para assinar o JWT |
| server | `DATABASE_URL` | Conexão PostgreSQL (SSL com validação de certificado; schema `avaliacoes`) |
| server | `CORS_ORIGIN` | Origens permitidas, separadas por vírgula |
| server | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Servidor SMTP usado para enviar avaliações com nota baixa (porta 465 usa SSL) |
| server | `EMAIL_AVALIACAO_DESTINO` | E-mail que recebe as avaliações com nota menor que 4 |
| server | `TRUST_PROXY_HOPS` | Nº de proxies na frente do server (padrão `2`), usado no rate limit por IP |
| client | `VITE_API_URL` | URL base da API |
| client | `VITE_HUB_URL` | URL do Hub |

## Desenvolvimento

```bash
# Server (porta 3000)
cd server
npm install
npm run dev

# Client (porta 5173)
cd client
npm install
npm run dev
```

## Docker

```bash
docker-compose up --build
```

Client em `http://localhost:8082` e server em `http://localhost:3002`.

---

# 🛡️ Envio de avaliações

O `POST /avaliacoes/loja/:lojaId` é público, então o servidor valida: loja existente, nota inteira de 1 a 5 e comentário com até 500 caracteres. O nome da filial é definido pelo servidor, e há limite de 30 envios a cada 10 minutos por IP.

## Notas baixas vão por e-mail

Avaliações novas com nota **menor que 4** (em qualquer loja ou no Televendas) são enviadas por e-mail para `EMAIL_AVALIACAO_DESTINO` e **não são gravadas no banco**, então não aparecem no dashboard nem entram nas métricas (nota média e % de 5★ ficam acima da realidade). As avaliações antigas permanecem como estão.

- Se o e-mail falhar, o cliente recebe um erro (503) e pode tentar de novo.
- Se o SMTP não estiver configurado no `.env`, essas avaliações são gravadas no banco normalmente, para não se perderem.

---

# 👨‍💻 Desenvolvedores

- **Marlon Alves** (Front-end) — https://github.com/marlonalvees
- **Matheus Carvalho** — https://github.com/matheuscrvlh

# 📄 Licença

Projeto privado, desenvolvido exclusivamente para a Novamix Food Service.
