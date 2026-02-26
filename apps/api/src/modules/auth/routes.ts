import { Router } from 'express';
import { z } from 'zod';
import { signJwt } from '../../utils/jwt.js';
import { store } from '../../db/store.js';

const loginSchema = z.object({
  email: z.string().email()
});

export const authRoutes = Router();

authRoutes.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    return;
  }

  const user = store.users.find((item) => item.email === parsed.data.email);
  if (!user) {
    res.status(404).json({ message: 'User not found in MVP seed dataset' });
    return;
  }

  const token = signJwt({ sub: user.id, email: user.email });
  res.json({ token, user });
});
