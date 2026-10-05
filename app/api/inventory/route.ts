import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const adjustSchema = z.object({
  action: z.enum(['ADJUST', 'TRANSFER', 'OPNAME']),
  productId: z.string().optional(),
  outletId: z.string().default('out_jakarta_selatan_01'),
  type: z
    .enum(['SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER', 'INITIAL'])
    .default('ADJUSTMENT'),
  quantity: z.number().optional(), // difference or added
  actualStock: z.number().optional(), // for opname
  reason: z.string().min(1, 'Alasan penyesuaian wajib diisi'),
  // For transfer
  sourceOutletId: z.string().optional(),
  destOutletId: z.string().optional(),
  items: z.array(z.object({ productId: string, quantity: z.number() })).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const view = searchParams.get('view'); // 'items', 'movements', 'alerts'

  if (view === 'movements') {
    const movements = db.getMovements(outletId);
    return NextResponse.json({ success: true, data: movements });
  }

  if (view === 'transfers') {
    const transfers = db.getTransfers();
    return NextResponse.json({ success: true, data: transfers });
  }

  const inventories = db.getInventories(outletId);
  return NextResponse.json({ success: true, data: inventories });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.INVENTORY_ADJUST);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (body.action === 'TRANSFER') {
      if (!body.sourceOutletId || !body.destOutletId || !body.items?.length) {
        return NextResponse.json(
          { success: false, message: 'Data transfer outlet tidak lengkap.' },
          { status: 400 }
        );
      }

      const res = db.transferStock({
        sourceOutletId: body.sourceOutletId,
        destOutletId: body.destOutletId,
        items: body.items,
        notes: body.reason,
        userId: user?.id,
        userName: user?.name,
      });

      if (!res.success) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: res.transfer,
        message: 'Transfer stok antar cabang berhasil diproses.',
      });
    }

    if (body.action === 'OPNAME') {
      // Stock Opname: compare current vs actual stock
      if (!body.productId || body.actualStock === undefined) {
        return NextResponse.json(
          { success: false, message: 'ID Produk dan Stok Fisik Aktual wajib diisi.' },
          { status: 400 }
        );
      }

      const currentInv = db.getInventories(body.outletId).find((i) => i.productId === body.productId);
      const prevQty = currentInv ? currentInv.quantity : 0;
      const diff = body.actualStock - prevQty;

      const res = db.adjustStock({
        productId: body.productId,
        outletId: body.outletId,
        type: 'ADJUSTMENT',
        quantity: diff,
        reason: `Stock Opname Fisik: ${body.reason} (Sebelumnya: ${prevQty}, Fisik: ${body.actualStock})`,
        userId: user?.id,
        userName: user?.name,
      });

      return NextResponse.json({
        success: true,
        data: { newStock: res.newStock, diff },
        message: 'Stock Opname berhasil disimpan.',
      });
    }

    // Default: Regular Stock Adjustment / Stock In / Stock Out
    if (!body.productId || body.quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'ID Produk dan Jumlah Penyesuaian wajib diisi.' },
        { status: 400 }
      );
    }

    const res = db.adjustStock({
      productId: body.productId,
      outletId: body.outletId,
      type: body.type || 'ADJUSTMENT',
      quantity: Number(body.quantity),
      reason: body.reason,
      userId: user?.id,
      userName: user?.name,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, message: res.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { newStock: res.newStock },
      message: 'Penyesuaian stok berhasil disimpan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal mengubah stok.' },
      },
      { status: 500 }
    );
  }
}
