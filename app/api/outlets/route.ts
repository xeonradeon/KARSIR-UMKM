import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
  const outlets = db.getOutlets();
  return NextResponse.json({ success: true, data: outlets });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SETTINGS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const business = db.getBusiness();

    const created = db.createOutlet({
      ...body,
      businessId: business.id,
      code: body.code.toUpperCase(),
      isMain: body.isMain || false,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Cabang outlet berhasil ditambahkan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menambahkan cabang.' },
      },
      { status: 500 }
    );
  }
}
