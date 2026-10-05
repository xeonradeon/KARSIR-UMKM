import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
  const users = db.getUsers();
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.EMPLOYEES_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, phone, role, password, outletId, permissions } = body;

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email pegawai sudah terdaftar.' },
        { status: 400 }
      );
    }

    const business = db.getBusiness();
    const passwordHash = await hashPassword(password || 'password123');

    const created = db.createUser({
      businessId: business.id,
      outletId: outletId || null,
      name,
      email,
      phone: phone || null,
      role: role || 'CASHIER',
      isActive: true,
      avatar: null,
      permissions: permissions || [],
      passwordHash,
    });

    db.createAuditLog({
      businessId: business.id,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'EMPLOYEE_CREATE',
      entity: 'User',
      entityId: created.id,
      metadata: JSON.stringify({ name: created.name, role: created.role }),
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Pegawai berhasil ditambahkan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menambahkan pegawai.' },
      },
      { status: 500 }
    );
  }
}
