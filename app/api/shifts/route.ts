import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || 'out_jakarta_selatan_01';
  const activeOnly = searchParams.get('activeOnly') === 'true';

  if (activeOnly) {
    const activeShift = db.getActiveShift(outletId);
    return NextResponse.json({ success: true, data: activeShift || null });
  }

  const shifts = db.getShifts(outletId);
  const activeShift = db.getActiveShift(outletId);
  const expenses = db.getExpenses(outletId);

  return NextResponse.json({
    success: true,
    data: {
      activeShift: activeShift || null,
      history: shifts,
      expenses,
    },
  });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SHIFTS_OPEN);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const action = body.action; // 'OPEN', 'CLOSE', 'EXPENSE'

    if (action === 'OPEN') {
      const res = db.openShift({
        outletId: body.outletId || 'out_jakarta_selatan_01',
        userId: user?.id || 'usr_cashier_01',
        userName: user?.name || 'Kasir',
        openingCash: Number(body.openingCash || 0),
        registerId: body.registerId,
      });

      if (!res.success) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: res.shift,
        message: 'Shift kasir berhasil dibuka.',
      });
    }

    if (action === 'CLOSE') {
      const res = db.closeShift({
        shiftId: body.shiftId,
        closingCash: Number(body.closingCash || 0),
        notes: body.notes,
        userId: user?.id || 'usr_cashier_01',
        userName: user?.name || 'Kasir',
      });

      if (!res.success) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: res.shift,
        message: 'Shift kasir berhasil ditutup.',
      });
    }

    if (action === 'EXPENSE') {
      const expense = db.recordExpense({
        outletId: body.outletId || 'out_jakarta_selatan_01',
        shiftId: body.shiftId,
        amount: Number(body.amount),
        category: body.category || 'OPERATIONAL',
        description: body.description,
      });

      return NextResponse.json({
        success: true,
        data: expense,
        message: 'Pengeluaran kas berhasil dicatat.',
      });
    }

    return NextResponse.json({ success: false, message: 'Action tidak dikenal.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal memproses shift.' },
      },
      { status: 500 }
    );
  }
}
