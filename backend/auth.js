const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem estar definidos.');
}

const isProduction = process.env.NODE_ENV === 'production';

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/refresh',
};

function buildClaims(user) {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const result = await db.query(
      'SELECT id, email, password, role FROM users WHERE email = $1 LIMIT 1',
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const claims = buildClaims(user);

    const accessToken = jwt.sign(claims, ACCESS_SECRET, { expiresIn: '15m' });

    const refreshToken = jwt.sign(
      { userId: user.id, tokenType: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('access_token', accessToken, accessCookieOptions);
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token ausente.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({ error: 'Refresh token inválido.' });
    }

    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1 LIMIT 1',
      [decoded.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const accessToken = jwt.sign(buildClaims(user), ACCESS_SECRET, {
      expiresIn: '15m',
    });

    res.cookie('access_token', accessToken, accessCookieOptions);
    return res.json({ success: true });
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido ou expirado.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/refresh' });
  return res.status(204).end();
});

function authMiddleware(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    id: req.user.userId,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = {
  router,
  authMiddleware,
};
