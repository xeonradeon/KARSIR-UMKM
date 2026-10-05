import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = db.getUserByEmail(email);

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password salah, atau akun dinonaktifkan.',
          },
        },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password salah.',
          },
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      businessId: user.businessId,
      outletId: user.outletId,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const token = signToken(sessionPayload);

    // Audit log
    db.createAuditLog({
      businessId: user.businessId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      metadata: JSON.stringify({ ip: req.headers.get('x-forwarded-for') || '127.0.0.1' }),
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: sessionPayload,
      },
      message: 'Login berhasil.',
    });

    // Set secure cookie
    response.cookies.set({
      name: 'pos_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 3600, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Terjadi kesalahan pada server.',
        },
      },
      { status: 500 }
    );
  }
}
