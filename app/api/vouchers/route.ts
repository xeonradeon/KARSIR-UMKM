import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
  const vouchers = db.getVouchers();
  return NextResponse.json({ success: true, data: vouchers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate action (called from POS to validate coupon code)
  if (body.action === 'VALIDATE') {
    const { code, subtotal } = body;
    const res = db.validateVoucher(code, Number(subtotal));
    if (!res.valid) {
      return NextResponse.json({ success: false, message: res.message }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      data: res.voucher,
      message: 'Voucher berhasil diterapkan!',
    });
  }

  // Create voucher (Admin/Owner)
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SETTINGS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const business = db.getBusiness();
    const created = db.createVoucher({
      ...body,
      businessId: business.id,
      code: body.code.toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Voucher diskon berhasil dibuat.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal membuat voucher.' },
      },
      { status: 500 }
    );
  }
}
