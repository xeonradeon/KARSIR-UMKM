import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';

const productSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  sku: z.string().min(1, 'SKU wajib diisi'),
  barcode: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  costPrice: z.number().min(0, 'Harga modal tidak boleh negatif'),
  sellingPrice: z.number().min(0, 'Harga jual tidak boleh negatif'),
  wholesalePrice: z.number().optional().nullable(),
  wholesaleMinQty: z.number().optional().nullable(),
  memberPrice: z.number().optional().nullable(),
  unit: z.string().default('pcs'),
  minStock: z.number().default(5),
  isFavorite: z.boolean().default(false),
  isActive: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  initialStock: z.number().default(0),
  outletId: z.string().optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string(),
        barcode: z.string().optional().nullable(),
        costPrice: z.number().optional().nullable(),
        sellingPrice: z.number(),
        stock: z.number().default(0),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const categoryId = searchParams.get('categoryId');
  const brandId = searchParams.get('brandId');
  const search = searchParams.get('search')?.toLowerCase();
  const barcode = searchParams.get('barcode');
  const stockStatus = searchParams.get('stockStatus'); // 'low', 'out', 'in'
  const isFavorite = searchParams.get('isFavorite');

  if (barcode) {
    const prod = db.getProductByBarcodeOrSku(barcode, outletId);
    if (!prod) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: prod });
  }

  let products = db.getProducts(outletId);

  if (categoryId && categoryId !== 'all') {
    products = products.filter((p) => p.categoryId === categoryId);
  }
  if (brandId && brandId !== 'all') {
    products = products.filter((p) => p.brandId === brandId);
  }
  if (isFavorite === 'true') {
    products = products.filter((p) => p.isFavorite);
  }
  if (stockStatus === 'low') {
    products = products.filter((p) => (p.stock || 0) <= p.minStock && (p.stock || 0) > 0);
  } else if (stockStatus === 'out') {
    products = products.filter((p) => (p.stock || 0) <= 0);
  } else if (stockStatus === 'in') {
    products = products.filter((p) => (p.stock || 0) > p.minStock);
  }

  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search) ||
        p.category?.name.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    data: products,
  });
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = requireAuth(req, PERMISSIONS.PRODUCTS_CREATE);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { initialStock, outletId, ...productData } = result.data;
    const business = db.getBusiness();

    // Check SKU duplicate
    const existing = db.getProductByBarcodeOrSku(productData.sku);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DUPLICATE_SKU', message: `SKU "${productData.sku}" sudah digunakan.` },
        },
        { status: 400 }
      );
    }

    const createdProduct = db.createProduct(
      {
        ...productData,
        businessId: business.id,
        variants: productData.variants?.map((v, i) => ({
          ...v,
          id: `var_${Date.now()}_${i}`,
          productId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      },
      initialStock,
      outletId || user?.outletId || undefined
    );

    // Audit Log
    db.createAuditLog({
      businessId: business.id,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: 'PRODUCT_CREATE',
      entity: 'Product',
      entityId: createdProduct.id,
      metadata: JSON.stringify({ name: createdProduct.name, sku: createdProduct.sku }),
    });

    return NextResponse.json({
      success: true,
      data: createdProduct,
      message: 'Produk berhasil ditambahkan.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message || 'Gagal menyimpan produk.' },
      },
      { status: 500 }
    );
  }
}
