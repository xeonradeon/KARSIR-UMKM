import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const registerSchema = z.object({
  businessName: z.string().min(2, 'Nama usaha minimal 2 karakter'),
  name: z.string().min(2, 'Nama pemilik minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

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

    const { businessName, name, email, phone, password } = result.data;

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
          },
        },
        { status: 400 }
      );
    }

    // Update or setup business
    db.updateBusiness({ name: businessName, email });
    const business = db.getBusiness();
    const outlets = db.getOutlets();
    const mainOutlet = outlets[0];

    const passwordHash = await hashPassword(password);
    const newUser = db.createUser({
      businessId: business.id,
      outletId: mainOutlet?.id || null,
      name,
      email,
      phone: phone || null,
      role: 'OWNER',
      isActive: true,
      avatar: null,
      passwordHash,
    });

    const sessionPayload = {
      id: newUser.id,
      businessId: newUser.businessId,
      outletId: newUser.outletId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: sessionPayload,
      },
      message: 'Pendaftaran berhasil!',
    });

    response.cookies.set({
      name: 'pos_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 3600,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal mendaftar.' },
      },
      { status: 500 }
    );
  }
}
