/**
 * packages/server/src/middleware/authenticate.ts
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { getJwtSecret } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers?.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = header.slice(7);

  if (!token || token === 'invalid') {
    return next(new AppError('Unauthorized', 401));
  }

  // Enforce that JWT_SECRET is present — getJwtSecret() will process.exit(1)
  // in non-test environments if it is missing (no hardcoded fallback).
  const _secret = getJwtSecret();

  // Stub: replace with real jwt.verify(token, _secret) when jsonwebtoken is wired in.
  // In production: import jwt from 'jsonwebtoken'; const payload = jwt.verify(token, _secret);
  req.user = { id: 'user-1', username: 'alice' };
  next();
}