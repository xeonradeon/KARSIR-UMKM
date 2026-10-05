import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
  const promotions = db.getPromotions();
  return NextResponse.json({ success: true, data: promotions });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SETTINGS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const business = db.getBusiness();
    const created = db.createPromotion({
      ...body,
      businessId: business.id,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Promosi berhasil dibuat.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal membuat promosi.' },
      },
      { status: 500 }
    );
  }
}
