# ⭐ Sistema de Avaliações - Novamix Food Service

Sistema de avaliações de atendimento da **Novamix Food Service**. Os clientes avaliam as lojas e o Televendas por um formulário simples, e a equipe acompanha os resultados em um dashboard administrativo.

- ✅ Área pública para clientes enviarem avaliações
- ✅ Dashboard administrativo (acesso via Hub)
- ✅ Filtros por loja, nota e período (hoje, semana, mês)
- ✅ Ordenação, paginação e seleção múltipla
- ✅ Exportação CSV
- ✅ Relatórios semanais e mensais por filial em imagem ou PDF, com envio aos supervisores pelo WhatsApp
- ✅ Dark Mode
- ✅ Redirecionamento para avaliação no Google em notas 5★
- ✅ Responsivo (mobile/desktop)

---

# 🔗 Links

- Área do cliente: https://avaliacoes.lojanovamix.com.br/?loja=1
- Televendas: https://avaliacoes.lojanovamix.com.br/televendas
- Dashboard: https://avaliacoes.lojanovamix.com.br/dashboard
- Relatórios: https://avaliacoes.lojanovamix.com.br/dashboard/relatorios

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
- Filtros por loja, nota, período (hoje, semana, mês ou intervalo de datas, no fuso `America/Sao_Paulo`) e busca por texto nos comentários (ignora acentos e maiúsculas)
- Filtros, ordenação e página ficam na URL, então atualizar a página (F5) ou compartilhar o link mantém a visão
- Ordenação por loja, nota e data (vale para todos os resultados, não só a página atual), com cabeçalhos acessíveis por teclado
- No celular, tocar em uma avaliação abre uma prévia flutuante (estilo "peek" do iPhone) com o comentário completo; o checkbox do card continua selecionando sem abrir a prévia
- Esqueleto de carregamento e botão "Tentar de novo" quando a API falha
- Seleção múltipla (o checkbox do cabeçalho seleciona todos os resultados filtrados, em todas as páginas)
- Exclusão de avaliações (apenas admin do módulo)
- Exportação CSV dos selecionados ou, sem seleção, de todos os resultados filtrados

## 📊 Relatórios por filial

Página **Relatórios** no menu lateral, feita para o envio de toda sexta-feira aos supervisores.

- Escolha a filial (o número ao lado do nome é a quantidade de avaliações no período) e o período:
  - **Semanal**: de sábado a sexta. Assim os envios de sexta cobrem todos os dias, sem buracos nem repetições. Abre na semana que terminou na última sexta (ou hoje, se for sexta).
  - **Mensal**: mês do calendário. Abre no mês atual.
  - As setas navegam para períodos anteriores. Período ainda em andamento aparece como "parcial".
- O relatório traz total, nota média, % de notas 5, comentários e distribuição das notas, com setas de variação em relação ao período anterior. Em período parcial a quantidade não é comparada, porque um período incompleto sempre teria menos avaliações.
- Lista de avaliações em duas partes: **todas as notas abaixo de 5** (com ou sem comentário, da pior para a melhor) e **todos os comentários com nota 5** (mais recentes primeiro). Notas 5 sem comentário só entram na contagem.
- **Imagem (PNG)** e **PDF** têm o mesmo conteúdo. O PDF sai em folhas A4, sem cortar nenhuma avaliação entre páginas.
- **Baixar** ou **Compartilhar**: no celular (e no Chrome/Edge do Windows) abre a tela de compartilhar do sistema, de onde dá para escolher o WhatsApp e o contato.
- **Supervisores**: cada filial tem uma lista de supervisores com nome e WhatsApp. O ícone do WhatsApp ao lado de cada um abre a conversa com a mensagem já escrita.
- **Envio direto pelo WhatsApp** (quando a API está configurada, ver abaixo): o botão "Enviar PDF pelo WhatsApp" manda o PDF da filial para todos os supervisores dela, e "Enviar todas as filiais" faz isso para cada filial de uma vez, sempre com confirmação antes.
- Imagem e PDF são gerados no próprio navegador. As bibliotecas (`modern-screenshot` e `jspdf`) só são baixadas no primeiro clique em exportar.

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
| Ver supervisores (`GET /supervisores`) | Qualquer usuário com o módulo, apenas das suas filiais |
| Cadastrar, editar e excluir supervisores | Admin do módulo, apenas das suas filiais |
| Enviar relatório pelo WhatsApp (`POST /relatorios/whatsapp`) | Qualquer usuário com o módulo, apenas das suas filiais. O PDF vai só para os supervisores cadastrados da filial, nunca para um número vindo da requisição. Limite de 30 envios a cada 10 minutos por IP |

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
│   │   ├── lib/              # api.ts (chamadas HTTP), csv.ts, telefone.ts
│   │   ├── pages/
│   │   │   ├── admin/        # dashboard e relatórios (relatorios/: período, exportação PNG/PDF)
│   │   │   └── public/       # páginas do cliente
│   │   └── types/            # tipos e cadastro de lojas (LOJAS)
│   ├── nginx.conf
│   └── Dockerfile
├── server/
│   ├── database/             # pool do PostgreSQL e criação da tabela supervisores
│   ├── middleware/           # rate limit
│   ├── routes/               # auth, avaliacoes, dashboard, supervisores, relatorios
│   ├── services/             # e-mail (SMTP) e WhatsApp (API da Meta)
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
| server | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | API oficial do WhatsApp para o envio direto dos relatórios (ver "Envio pelo WhatsApp"). Vazios, o envio direto fica desativado |
| server | `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_IDIOMA`, `WHATSAPP_API_VERSION` | Nome e idioma do modelo aprovado na Meta (padrão `relatorio_avaliacoes` e `pt_BR`) e versão da Graph API (padrão `v23.0`) |
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

Para mexer no visual sem servidor nem banco, `npm run dev:mock` (no `client/`) usa dados de exemplo, inclusive supervisores e um envio pelo WhatsApp simulado. Com `VITE_MOCK_WHATSAPP_API=0` ele simula o servidor sem a API do WhatsApp configurada.

## Docker

```bash
docker-compose up --build
```

Client em `http://localhost:8082` e server em `http://localhost:3002`.

---

# 🛡️ Envio de avaliações

O `POST /avaliacoes/loja/:lojaId` é público, então o servidor valida: loja existente, nota inteira de 1 a 5 e comentário com até 500 caracteres. O nome da filial é definido pelo servidor, e há limite de 30 envios a cada 10 minutos por IP.

## Notas baixas também geram alerta por e-mail

Toda avaliação é gravada no banco e aparece no dashboard, nas métricas e nos relatórios. As com nota **menor que 4** (em qualquer loja ou no Televendas) também geram um alerta por e-mail para `EMAIL_AVALIACAO_DESTINO`.

- Se o e-mail falhar, a falha fica só no log do servidor: a avaliação já está salva e o cliente vê a confirmação normalmente.
- Sem SMTP configurado no `.env`, não há alerta por e-mail.
- Até novembro de 2026 as notas menores que 4 iam **só** por e-mail e não eram gravadas; essas avaliações antigas não aparecem no dashboard nem nos relatórios.

---

# 📲 Envio pelo WhatsApp

Há dois modos, e o painel escolhe sozinho conforme o servidor:

1. **Sem configuração (padrão)**: o ícone do WhatsApp ao lado de cada supervisor abre a conversa com a mensagem pronta (`wa.me`), e o PDF ou a imagem é anexado à mão (baixado, ou pelo botão Compartilhar no celular). Não custa nada e não precisa de cadastro na Meta.
2. **Envio direto (API oficial do WhatsApp, da Meta)**: o servidor manda o PDF para os supervisores sem abrir o WhatsApp, inclusive todas as filiais de uma vez.

## Configurar o envio direto

1. Em [developers.facebook.com](https://developers.facebook.com), crie um app do tipo **Empresa** e adicione o produto **WhatsApp**, ligado ao Business Manager da Novamix.
2. Registre e verifique o número que vai enviar os relatórios. Ele **não pode estar em uso no app comum do WhatsApp** (use um número dedicado ou migre um existente). Anote o **Phone number ID**.
3. Crie um **usuário do sistema** no Business Manager com a permissão `whatsapp_business_messaging` e gere um **token permanente**.
4. Em **Modelos de mensagem**, crie e envie para aprovação um modelo:
   - Nome: `relatorio_avaliacoes`, categoria **Utilidade**, idioma **Português (BR)**
   - Cabeçalho: **Documento**
   - Corpo (sugestão):
     ```
     Olá! Segue o relatório de avaliações de atendimento da Novamix.

     Filial: {{1}}
     Período: {{2}}
     ```
     O servidor preenche `{{1}}` com o nome da filial (ex.: `Prado`) e `{{2}}` com o período (ex.: `semana de 07/11 a 13/11/2026`).
5. Preencha no `server/.env`: `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` (e `WHATSAPP_TEMPLATE`/`WHATSAPP_TEMPLATE_IDIOMA` se usar outro nome ou idioma). Reinicie o servidor.

Observações:

- A Meta cobra por mensagem de modelo enviada (tabela por país no site da Meta). São poucas mensagens por semana.
- Com o app em modo de teste, a Meta só entrega para até 5 números cadastrados como destinatários de teste. O erro aparece no painel ao lado do nome do supervisor.
- "Enviado" no painel significa que a Meta aceitou a mensagem. Se o número não tiver WhatsApp, a falha só aparece depois, nos relatórios da Meta.
- O PDF passa pelo nginx do client, que aceita até 20 MB em `/api/` (`client_max_body_size`). Se houver outro proxy na frente, ele também precisa aceitar arquivos desse tamanho.

## Tabela de supervisores

O servidor cria a tabela ao subir. Se o usuário do banco não tiver permissão de `CREATE`, rode no schema `avaliacoes`:

```sql
CREATE TABLE IF NOT EXISTS supervisores (
  id SERIAL PRIMARY KEY,
  idfilial INTEGER NOT NULL,
  nome VARCHAR(80) NOT NULL,
  whatsapp VARCHAR(15) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

O WhatsApp é gravado só com dígitos e DDI (`5521999999999`). No painel basta digitar DDD e número.

---

# 👨‍💻 Desenvolvedores

- **Marlon Alves** (Front-end) — https://github.com/marlonalvees
- **Matheus Carvalho** — https://github.com/matheuscrvlh

# 📄 Licença

Projeto privado, desenvolvido exclusivamente para a Novamix Food Service.
