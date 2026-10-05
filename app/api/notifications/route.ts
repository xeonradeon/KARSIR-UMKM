import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const notifications = db.getNotifications(outletId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return NextResponse.json({
    success: true,
    data: {
      items: notifications,
      unreadCount,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, all, outletId } = body;

    if (all) {
      db.markAllNotificationsRead(outletId);
      return NextResponse.json({ success: true, message: 'Semua notifikasi ditandai dibaca.' });
    }

    if (id) {
      db.markNotificationAsRead(id);
      return NextResponse.json({ success: true, message: 'Notifikasi ditandai dibaca.' });
    }

    return NextResponse.json({ success: false, message: 'ID notifikasi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
