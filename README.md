# GoFood — Implementação Segura

Projeto acadêmico da disciplina **Engenharia de Sistemas Distribuídos — UFPB**.

Este repositório reúne a resolução das **Partes 1 e 2** do exercício prático de Segurança em SPA da GoFood, uma aplicação com SPA React + API REST Node.js/Express.

## Estrutura

```text
.
├── backend/
│   ├── auth.js
│   ├── db.js
│   └── orders.js
├── frontend/
│   └── App.jsx
├── docs/
│   ├── PARTE_1_ANALISE.md
│   └── PARTE_2_IMPLEMENTACAO_SEGURA.md
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Vulnerabilidades corrigidas

V1 a V20 do enunciado, incluindo SQL Injection, IDOR, fraude de preço, XSS, CORS aberto, ausência de rate limiting, falta de headers de segurança e exposição de stack trace.

## Como executar

```bash
npm install
cp .env.example .env
npm start
```

Configure o PostgreSQL e ajuste `DATABASE_URL`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`.

## Documentação

- [Parte 1 — Análise](docs/PARTE_1_ANALISE.md)
- [Parte 2 — Implementação Segura](docs/PARTE_2_IMPLEMENTACAO_SEGURA.md)
