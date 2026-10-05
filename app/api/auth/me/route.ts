import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const sessionUser = getAuthUser(req);
  if (!sessionUser) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Belum login.' },
      },
      { status: 401 }
    );
  }

  const user = db.getUserById(sessionUser.id);
  const business = db.getBusiness();
  const outlets = db.getOutlets();

  return NextResponse.json({
    success: true,
    data: {
      user: sessionUser,
      business,
      outlets,
    },
  });
}
