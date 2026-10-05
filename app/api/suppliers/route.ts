import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const suppliers = db.getSuppliers();
  return NextResponse.json({ success: true, data: suppliers });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SUPPLIERS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = supplierSchema.safeParse(body);

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
    const created = db.createSupplier({
      ...result.data,
      businessId: business.id,
      totalPurchases: 0,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Supplier berhasil ditambahkan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menambahkan supplier.' },
      },
      { status: 500 }
    );
  }
}
