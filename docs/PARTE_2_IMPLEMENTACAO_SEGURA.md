# Parte 2 — Implementação Segura

## Q4 — Backend seguro: autenticação

Arquivo: `backend/auth.js`

- V1: secrets em variáveis de ambiente.
- V2: query parametrizada.
- bcrypt para comparação de senha.
- V3: access token com 15 min e refresh token com 7 dias.
- V4/V5: cookies HttpOnly.
- `/refresh` emite novo access token.
- `authMiddleware` lê o cookie.

## Q5 — Backend seguro: pedidos

Arquivo: `backend/orders.js`

- V6: query parametrizada.
- V7: ownership check.
- V8: validação com Zod.
- V9: preço consultado no banco.
- V10: `requireRole('admin')`.

## Q6 — Frontend seguro

Arquivo: `frontend/App.jsx`

- V11: HTTPS.
- V12/V13: sem token nem role no localStorage.
- `credentials: 'include'`.
- V14: role consultada no servidor; proteção real permanece no backend.
- V15: comentários renderizados como texto puro.

## Q7 — Servidor seguro

Arquivo: `server.js`

- V16: CORS restrito.
- V17: JSON limitado a 16kb.
- V18: rate limiting global e no login.
- V19: Helmet + CSP.
- V20: sem stack trace em produção.
