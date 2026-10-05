import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const transaction = db.getTransactionById(id);
  if (!transaction) {
    return NextResponse.json({ success: false, message: 'Transaksi tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: transaction });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.POS_REFUND);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const reason = body.reason || 'Permintaan pelanggan / pembatalan nota';

    const result = db.refundTransaction({
      transactionId: id,
      reason,
      userId: user?.id || 'usr_owner_01',
      userName: user?.name || 'Authorized User',
      userRole: user?.role || 'OWNER',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.transaction,
      message: 'Transaksi berhasil di-refund dan stok barang dikembalikan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal memproses refund.' },
      },
      { status: 500 }
    );
  }
}
