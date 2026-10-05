import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { User, RoleType } from '@/types';
import { hasPermission } from '@/lib/permissions';

const AUTH_SECRET = process.env.AUTH_SECRET || 'pos-umkm-super-secret-jwt-key-2026-secure';

export interface SessionUser {
  id: string;
  businessId: string;
  outletId?: string | null;
  name: string;
  email: string;
  role: RoleType;
  permissions?: string[];
}

export interface TokenPayload extends SessionUser {
  exp: number;
  iat: number;
}

/**
 * Hash password securely using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Encode base64url string
 */
function base64url(source: string): string {
  const buff = Buffer.from(source);
  return buff.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Sign JWT token using HMAC-SHA256
 */
export function signToken(user: SessionUser, expiresInHours = 24): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    ...user,
    iat: now,
    exp: now + expiresInHours * 3600,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    const payloadJson = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return {
      id: payload.id,
      businessId: payload.businessId,
      outletId: payload.outletId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from Request (cookie or Authorization header)
 */
export function getAuthUser(req: NextRequest): SessionUser | null {
  // Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) return user;
  }

  // Check pos_token cookie
  const cookie = req.cookies.get('pos_token');
  if (cookie?.value) {
    const user = verifyToken(cookie.value);
    if (user) return user;
  }

  return null;
}

/**
 * Guard API route with permission check
 */
export function requireAuth(
  req: NextRequest,
  requiredPermission?: string
): { user: SessionUser | null; errorResponse: NextResponse | null } {
  const user = getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Sesi telah berakhir. Silakan login kembali.' },
        },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission, user.permissions)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki hak akses untuk tindakan ini.',
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
