# ⭐ Sistema de Avaliações - Novamix Food Service

Sistema completo de avaliações desenvolvido para a **Novamix Food Service**, permitindo que clientes avaliem o atendimento das lojas através de um formulário simples e intuitivo.

O projeto possui:

- ✅ Área pública para clientes enviarem avaliações
- ✅ Dashboard administrativo
- ✅ Sistema de autenticação
- ✅ Filtros avançados
- ✅ Exportação CSV
- ✅ Paginação
- ✅ Dark Mode
- ✅ Integração com avaliação no Google
- ✅ Responsividade Mobile/Desktop

---

# 📸 Preview

## Tela de Avaliação

![Preview Avaliação](./screenshots/avaliacao.png)

---

## Dashboard Administrativo

![Preview Dashboard](./screenshots/dashboard.png)
![Preview Dashboard](./screenshots/dashboard2.png)

---

## Mobile

<p align="center">
  <img src="./screenshots/mobile.png" alt="Preview Mobile" width="300" />
</p>

---

# 🚀 Link do Projeto

### Área pública do cliente

🔗 https://avaliacoes.lojanovamix.com.br/?loja=1

> O parâmetro `?loja=1` identifica automaticamente qual filial está sendo avaliada.

---

# 🧠 Funcionalidades

## 👤 Área do Cliente

- Avaliação de 1 a 5 estrelas
- Comentário opcional
- Feedback visual animado
- Redirecionamento para avaliação no Google ao enviar 5 estrelas
- Identificação automática da loja via URL
- Layout responsivo
- Interface moderna e intuitiva

---

## 🔐 Área Administrativa

- Login protegido com JWT
- Dashboard de avaliações
- Visualização completa dos feedbacks
- Paginação dinâmica
- Filtros por:
  - Loja
  - Nota
- Ordenação de colunas
- Exportação CSV
- Seleção múltipla
- Dark Mode

---

# 🛠️ Tecnologias Utilizadas

## Front-end

- React
- TypeScript
- Vite
- TailwindCSS

---

## Back-end

- Node.js
- Express
- SQLite
- JWT
- bcryptjs
- Docker

---

# 📂 Estrutura do Projeto

```bash
avaliacoes-novamix/
│
├── backend/
│   ├── database/
│   ├── routes/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── docker-compose.yml
```

---

# ⚙️ Como Rodar o Projeto

## 📦 Clonar o repositório

```bash
git clone https://github.com/seuusuario/avaliacoes-novamix.git
```

---

# 🔥 Front-end

```bash
cd frontend

npm install

npm run dev
```

---

# 🔥 Back-end

```bash
cd backend

npm install

npm run dev
```

---

# 🐳 Rodando com Docker

```bash
docker-compose up --build
```

---

# 🔐 Autenticação

O sistema utiliza:

- JWT para autenticação
- bcryptjs para criptografia de senhas

Rotas administrativas protegidas.

---

# 📊 Dashboard

O dashboard possui:

- Estatísticas gerais
- Média de avaliações
- Percentual de notas 5
- Quantidade de comentários
- Tabela interativa
- Filtros avançados
- Paginação configurável

---

# 📁 Exportação CSV

As avaliações podem ser exportadas diretamente em CSV:

- Todas avaliações
- Apenas selecionadas
- Dados filtrados

---

# 🌙 Dark Mode

O painel administrativo possui suporte a Dark Mode para melhor experiência visual.

---

# 📱 Responsividade

O sistema foi desenvolvido pensando em:

- Desktop
- Tablet
- Mobile

---

# 🎯 Objetivo do Projeto

O principal objetivo do sistema é permitir que a Novamix acompanhe a satisfação dos clientes em tempo real, coletando feedbacks importantes para melhorar continuamente o atendimento das lojas.

---

# 👨‍💻 Desenvolvedores

### Marlon Alves

- Front-end Developer

GitHub:
https://github.com/marlonalvees

---

### Matheus Carvalho

GitHub:
https://github.com/matheuscrvlh

---

# 📄 Licença

Este projeto é privado e desenvolvido exclusivamente para a Novamix Food Service.
