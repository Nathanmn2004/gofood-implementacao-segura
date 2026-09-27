const express = require('express');
const { z } = require('zod');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      qty: z.number().int().positive().max(100),
    })
  ).min(1).max(50),
  address: z.string().trim().min(5).max(300),
  couponCode: z.string().trim().max(50).optional(),
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    return next();
  };
}

router.get('/orders/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const result = await db.query(
      'SELECT id, user_id, items, total, address FROM orders WHERE id = $1',
      [id]
    );

    const order = result.rows[0];

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (Number(order.user_id) !== Number(req.user.userId)) {
      return res.status(403).json({ error: 'Você não pode acessar este pedido.' });
    }

    return res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders', authMiddleware, async (req, res, next) => {
  try {
    const parsed = orderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Dados do pedido inválidos.',
        details: parsed.error.flatten(),
      });
    }

    const { items, address } = parsed.data;
    const productIds = [...new Set(items.map((item) => item.productId))];

    const productResult = await db.query(
      'SELECT id, name, price FROM products WHERE id = ANY($1::int[])',
      [productIds]
    );

    if (productResult.rows.length !== productIds.length) {
      return res.status(400).json({ error: 'Um ou mais produtos são inválidos.' });
    }

    const catalog = new Map(
      productResult.rows.map((product) => [Number(product.id), product])
    );

    const normalizedItems = items.map((item) => {
      const product = catalog.get(item.productId);
      const unitPrice = Number(product.price);

      return {
        productId: item.productId,
        name: product.name,
        qty: item.qty,
        unitPrice,
        subtotal: unitPrice * item.qty,
      };
    });

    const total = normalizedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const insertResult = await db.query(
      `INSERT INTO orders (user_id, items, total, address)
       VALUES ($1, $2::jsonb, $3, $4)
       RETURNING id, user_id, items, total, address`,
      [
        req.user.userId,
        JSON.stringify(normalizedItems),
        total,
        address,
      ]
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/admin/orders',
  authMiddleware,
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const result = await db.query(
        'SELECT id, user_id, items, total, address FROM orders ORDER BY id DESC'
      );
      return res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = {
  router,
  requireRole,
  orderSchema,
};
