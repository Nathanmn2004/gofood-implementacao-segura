# Parte 1 — Análise

## Q1 — Mapeamento OWASP Top 10

| Código | Vulnerabilidade | OWASP Top 10 (2021) | Vetor de ataque |
|---|---|---|---|
| V1 | Secret JWT hardcoded | A02 — Cryptographic Failures | Exposição do código revela a chave e permite forjar JWTs. |
| V2 | SQL montado por concatenação no login | A03 — Injection | Payload SQL pode alterar a cláusula WHERE e burlar autenticação. |
| V3 | JWT sem expiração | A07 — Identification and Authentication Failures | Token roubado permanece útil por tempo indefinido. |
| V4 | Token e role retornados no body | A07 — Identification and Authentication Failures | Segredos e dados de autorização ficam acessíveis ao frontend. |
| V5 | Token transportado pelo header controlado pelo cliente | A07 — Identification and Authentication Failures | O token fica mais exposto a JavaScript e roubo de sessão. |
| V6 | ID da rota concatenado no SQL | A03 — Injection | Permite SQL Injection e UNION SELECT. |
| V7 | Sem ownership check | A01 — Broken Access Control | IDOR/BOLA: usuário acessa pedido de outro usuário. |
| V8 | Sem validação de input | A03 — Injection | Dados inesperados/maliciosos chegam à lógica e ao banco. |
| V9 | Preço confiado ao cliente | A04 — Insecure Design | Usuário altera o preço no payload e frauda o total. |
| V10 | Rota admin sem role check | A01 — Broken Access Control | Qualquer autenticado acessa dados administrativos. |
| V11 | Uso de HTTP | A02 — Cryptographic Failures | Tráfego pode ser interceptado/alterado. |
| V12 | JWT no localStorage | A07 — Identification and Authentication Failures | XSS consegue ler e exfiltrar o token. |
| V13 | Role no localStorage | A01 — Broken Access Control | Usuário pode alterar a role no navegador. |
| V14 | Painel admin baseado no estado do cliente | A01 — Broken Access Control | Interface pode ser liberada por manipulação do frontend. |
| V15 | dangerouslySetInnerHTML sem sanitização | A03 — Injection | Stored XSS executa JavaScript no navegador das vítimas. |
| V16 | CORS aberto | A05 — Security Misconfiguration | Origens não confiáveis podem interagir com a API. |
| V17 | JSON sem limite | A05 — Security Misconfiguration | Bodies enormes podem causar consumo excessivo de recursos. |
| V18 | Sem rate limiting | A07 — Identification and Authentication Failures | Facilita brute force, credential stuffing e abuso. |
| V19 | Sem Helmet/headers de segurança | A05 — Security Misconfiguration | Ausência de CSP e outros headers amplia a superfície de ataque. |
| V20 | Stack trace exposto | A05 — Security Misconfiguration | Revela detalhes internos úteis a atacantes. |

## Q2 — Roubo de token via XSS

O payload malicioso é persistido no comentário. Quando a vítima abre o produto, `dangerouslySetInnerHTML` interpreta o conteúdo como HTML, o `onerror` é executado, o JWT é lido do `localStorage` e enviado ao domínio do atacante.

A V10 permite que o token válido de um usuário comum acesse `/admin/orders`, porque há autenticação, mas não autorização por role.

Com cookie `HttpOnly`, JavaScript não consegue ler diretamente o token. Isso reduz a exfiltração, embora não elimine o impacto de XSS.

## Q3 — SQL Injection

No login, a entrada `' OR '1'='1' --` transforma a condição em verdadeira e comenta a checagem de senha.

Em `/orders/:id`, um `UNION SELECT` pode combinar a consulta de pedidos com dados da tabela `users`.

Se o atacante também obtiver o secret JWT hardcoded, ele pode assinar tokens arbitrários e não depende necessariamente das senhas obtidas.
