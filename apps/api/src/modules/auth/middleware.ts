import type { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../../utils/jwt.js';
import { prisma } from '../../db/prisma.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  try {
    const payload = verifyJwt(auth.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ message: 'Invalid user' });
      return;
    }
    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
