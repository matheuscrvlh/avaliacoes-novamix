# Novamix – Avaliação de Atendimento

Front-end de avaliação de atendimento da **Novamix Food Service**, desenvolvido com React + TypeScript + Tailwind CSS.

---

## 🚀 Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure a URL do back-end
cp .env.example .env
# Abra o .env e altere VITE_API_URL para a URL real do servidor

# 3. Suba o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`.

---

## 🏗️ Estrutura do projeto

```
src/
├── components/
│   ├── ui/
│   │   ├── StarRating.tsx          # Componente de estrelas (1–5)
│   │   ├── TextAreaComentario.tsx  # Campo de texto opcional
│   │   ├── SubmitButton.tsx        # Botão com estado de loading
│   │   └── ErrorAlert.tsx          # Alerta de erro
│   ├── AvaliacaoForm.tsx           # Formulário completo
│   └── AvaliacaoSucesso.tsx        # Tela de confirmação
├── hooks/
│   └── useAvaliacao.ts             # Lógica de estado e envio
├── lib/
│   └── api.ts                      # Chamada HTTP (POST /avaliacoes)
├── pages/
│   └── AvaliacaoPage.tsx           # Página principal
├── types/
│   └── avaliacao.ts                # Tipos e constantes compartilhados
├── App.tsx
├── main.tsx
└── index.css
```

---

## 📡 Integração com o back-end

O arquivo `src/lib/api.ts` faz a chamada:

```
POST /avaliacoes
Content-Type: application/json

{
  "nota": 4,
  "comentario": "Ótimo atendimento!" // ou null se não preenchido
}
```

Para apontar para a URL correta, basta editar o `.env`:

```
VITE_API_URL=https://api.seuservidor.com
```

---

## 🎨 Cores da marca

| Variável Tailwind            | Hex       |
|-----------------------------|-----------|
| `novamix-orange`            | `#ff8d0a` |
| `novamix-orange-dk`         | `#ea8006` |
| `novamix-teal`              | `#00817d` |
| `novamix-amber`             | `#ff7f00` |
| `novamix-cream`             | `#FFF8F0` |

---

## 🛠️ Build para produção

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`.
