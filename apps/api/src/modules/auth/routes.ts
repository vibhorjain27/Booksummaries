import { Router } from 'express';
import { z } from 'zod';
import { signJwt } from '../../utils/jwt.js';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';

const loginSchema = z.object({
  email: z.string().email()
});

export const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: {
      email: parsed.data.email,
      timezone: env.DEFAULT_TIMEZONE,
      booksPerYearGoal: 120,
      paceMinutesPerDay: 60
    }
  });

  const token = signJwt({ sub: user.id, email: user.email });
  res.json({ token, user });
});
