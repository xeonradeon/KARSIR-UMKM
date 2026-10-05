import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;

  const stats = db.getDashboardStats(outletId);
  return NextResponse.json({ success: true, data: stats });
}
