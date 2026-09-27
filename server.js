require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { router: authRouter } = require('./backend/auth');
const { router: ordersRouter } = require('./backend/orders');

const app = express();
const PORT = process.env.PORT || 3000;
const SPA_ORIGIN = process.env.SPA_ORIGIN || 'https://localhost:5173';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", SPA_ORIGIN],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

app.use(
  cors({
    origin: SPA_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

app.use('/api', globalLimiter);
app.use('/api/login', loginLimiter);

app.use('/api', authRouter);
app.use('/api', ordersRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  const payload = {
    error: 'Erro interno do servidor.',
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.details = err.message;
  }

  res.status(500).json(payload);
});

app.listen(PORT, () => {
  console.log(`GoFood API executando na porta ${PORT}`);
});
