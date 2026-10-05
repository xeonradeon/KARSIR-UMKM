import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET() {
  const business = db.getBusiness();
  const settings = db.getSettings();
  return NextResponse.json({
    success: true,
    data: {
      business,
      settings,
    },
  });
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.SETTINGS_MANAGE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { business, settings } = body;

    let updatedBusiness = db.getBusiness();
    let updatedSettings = db.getSettings();

    if (business) {
      updatedBusiness = db.updateBusiness(business);
    }
    if (settings) {
      updatedSettings = db.updateSettings(settings);
    }

    db.createAuditLog({
      businessId: updatedBusiness.id,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'SETTINGS_UPDATE',
      entity: 'BusinessSettings',
      metadata: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      data: {
        business: updatedBusiness,
        settings: updatedSettings,
      },
      message: 'Pengaturan berhasil disimpan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menyimpan pengaturan.' },
      },
      { status: 500 }
    );
  }
}
