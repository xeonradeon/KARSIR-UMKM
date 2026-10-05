import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.AUDIT_VIEW);
  if (errorResponse) return errorResponse;

  const logs = db.getAuditLogs();
  return NextResponse.json({ success: true, data: logs });
}
