import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();

  let customers = db.getCustomers();
  if (search) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ success: true, data: customers });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.CUSTOMERS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message },
        },
        { status: 400 }
      );
    }

    const business = db.getBusiness();
    const created = db.createCustomer({
      ...result.data,
      businessId: business.id,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Pelanggan berhasil ditambahkan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menambahkan pelanggan.' },
      },
      { status: 500 }
    );
  }
}
