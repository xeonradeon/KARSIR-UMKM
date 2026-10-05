import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const checkoutItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional().nullable(),
  productName: z.string(),
  variantName: z.string().optional().nullable(),
  sku: z.string(),
  image: z.string().optional().nullable(),
  unitCost: z.number().default(0),
  unitPrice: z.number(),
  appliedPrice: z.number(),
  priceType: z.enum(['NORMAL', 'WHOLESALE', 'MEMBER']).default('NORMAL'),
  quantity: z.number().min(1),
  discount: z.number().default(0),
  subtotal: z.number(),
  notes: z.string().optional(),
  maxStock: z.number().default(999),
});

const checkoutSchema = z.object({
  outletId: z.string().default('out_jakarta_selatan_01'),
  customerId: z.string().optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, 'Keranjang belanja tidak boleh kosong'),
  orderDiscountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  orderDiscountValue: z.number().optional(),
  voucherCode: z.string().optional().nullable(),
  pointsRedeemed: z.number().optional().default(0),
  paymentMethod: z.enum([
    'CASH',
    'QRIS',
    'BANK_TRANSFER',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'E_WALLET',
    'DEBT',
    'OTHER',
  ]),
  amountPaid: z.number().min(0),
  paymentReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const cashierId = searchParams.get('cashierId') || undefined;
  const customerId = searchParams.get('customerId') || undefined;
  const status = searchParams.get('status') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const search = searchParams.get('search') || undefined;

  const transactions = db.getTransactions({
    outletId,
    cashierId,
    customerId,
    status,
    startDate,
    endDate,
    search,
  });

  return NextResponse.json({ success: true, data: transactions });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.POS_VIEW);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message },
        },
        { status: 400 }
      );
    }

    const {
      outletId,
      customerId,
      items,
      orderDiscountType,
      orderDiscountValue,
      voucherCode,
      pointsRedeemed,
      paymentMethod,
      amountPaid,
      paymentReference,
      notes,
      shiftId,
    } = result.data;

    const res = db.createTransaction({
      outletId,
      cashierId: user?.id || 'usr_cashier_01',
      cashierName: user?.name || 'Kasir',
      customerId,
      items: items as any,
      orderDiscountType,
      orderDiscountValue,
      voucherCode,
      pointsRedeemed,
      paymentMethod,
      amountPaid,
      paymentReference,
      notes,
      shiftId,
    });

    if (!res.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'CHECKOUT_FAILED', message: res.message || 'Gagal memproses transaksi.' },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.transaction,
      message: 'Transaksi berhasil diselesaikan!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Terjadi kesalahan sistem.' },
      },
      { status: 500 }
    );
  }
}
