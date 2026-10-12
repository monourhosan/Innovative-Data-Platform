import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'innovative-data-platform-super-secret-key-saif-2026';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: 'admin' | 'supervisor' | 'team_member';
  name: string;
}

/**
 * Hashes a plaintext password securely.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password with a hashed password.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT token containing user info.
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies auth user from Authorization header or Cookie.
 */
export function getAuthenticatedUser(req: NextRequest): JwtPayload | null {
  // 1. Try Bearer token in header (Android App & API clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // 2. Try auth_token cookie (Web browser session)
  const tokenCookie = req.cookies.get('auth_token');
  if (tokenCookie && tokenCookie.value) {
    return verifyToken(tokenCookie.value);
  }

  return null;
}
