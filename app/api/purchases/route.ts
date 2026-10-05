import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const purchases = db.getPurchases(outletId);
  return NextResponse.json({ success: true, data: purchases });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PURCHASES_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    const created = db.createPurchase({
      outletId: body.outletId || 'out_jakarta_selatan_01',
      supplierId: body.supplierId,
      createdById: user?.id || 'usr_staff_01',
      createdByName: user?.name || 'Staff',
      notes: body.notes,
      items: body.items,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Pesanan Pembelian (PO) berhasil dibuat.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal membuat PO.' },
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PURCHASES_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, status } = body;

    const updated = db.updatePurchaseStatus(id, status, user?.id, user?.name);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'PO tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        status === 'RECEIVED'
          ? 'Barang PO telah diterima dan stok otomatis ditambahkan.'
          : 'Status PO diperbarui.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal mengubah status PO.' },
      },
      { status: 500 }
    );
  }
}
