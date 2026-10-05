import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export async function GET() {
  const categories = db.getCategories();
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PRODUCTS_CREATE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = categorySchema.safeParse(body);

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
    const slug = result.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const created = db.createCategory({
      ...result.data,
      slug,
      businessId: business.id,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Kategori berhasil dibuat.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal membuat kategori.' },
      },
      { status: 500 }
    );
  }
}
