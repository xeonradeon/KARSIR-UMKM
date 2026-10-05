import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = db.getProductById(id);
  if (!product) {
    return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PRODUCTS_EDIT);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const updated = db.updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
    }

    db.createAuditLog({
      businessId: updated.businessId,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PRODUCT_UPDATE',
      entity: 'Product',
      entityId: updated.id,
      metadata: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Produk berhasil diperbarui.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal memperbarui produk.' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PRODUCTS_DELETE);
  if (errorResponse) return errorResponse;

  const product = db.getProductById(id);
  if (!product) {
    return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
  }

  const deleted = db.deleteProduct(id);

  db.createAuditLog({
    businessId: product.businessId,
    userId: user?.id,
    userName: user?.name,
    userRole: user?.role,
    action: 'PRODUCT_DELETE',
    entity: 'Product',
    entityId: id,
    metadata: JSON.stringify({ name: product.name, sku: product.sku }),
  });

  return NextResponse.json({
    success: true,
    message: 'Produk berhasil dihapus.',
  });
}
