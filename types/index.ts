// TypeScript definitions for POS UMKM All-in-One

export type RoleType = 'OWNER' | 'ADMIN' | 'CASHIER' | 'STAFF';

export type StockMovementType =
  | 'SALE'
  | 'PURCHASE'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'DAMAGE'
  | 'TRANSFER'
  | 'INITIAL';

export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'QRIS'
  | 'BANK_TRANSFER'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'E_WALLET'
  | 'DEBT'
  | 'OTHER';

export type ShiftStatus = 'OPEN' | 'CLOSED';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type PromotionType = 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';

export interface Business {
  id: string;
  name: string;
  legalName?: string | null;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  taxNumber?: string | null;
  taxRate: number; // 0.11
  taxEnabled: boolean;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  id: string;
  businessId: string;
  receiptHeader?: string | null;
  receiptFooter?: string | null;
  receiptShowLogo: boolean;
  receiptShowCustomer: boolean;
  receiptShowCashier: boolean;
  receiptFormat: '58mm' | '80mm' | 'A4';
  autoPrintReceipt: boolean;
  defaultPaymentMethod: PaymentMethod;
  loyaltyPointsPerUnit: number; // Rp 10.000 = 1 pt
  loyaltyRedeemRate: number;    // 1 pt = Rp 100
  minRedeemPoints: number;
  enableSoundEffects: boolean;
}

export interface Outlet {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  managerName?: string | null;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  businessId: string;
  outletId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  role: RoleType;
  isActive: boolean;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  businessId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  totalPurchases?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string | null;
  costPrice?: number | null;
  sellingPrice: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId?: string | null;
  brandId?: string | null;
  supplierId?: string | null;
  name: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  image?: string | null;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  memberPrice?: number | null;
  unit: string;
  minStock: number;
  isFavorite: boolean;
  isActive: boolean;
  hasVariants: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  brand?: Brand | null;
  supplier?: Supplier | null;
  variants?: ProductVariant[];
  stock?: number; // aggregated stock for active outlet
}

export interface InventoryItem {
  id: string;
  outletId: string;
  productId: string;
  quantity: number;
  minStock: number;
  product?: Product;
  outlet?: Outlet;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName?: string;
  outletId: string;
  userId?: string | null;
  userName?: string | null;
  type: StockMovementType;
  quantity: number;
  previousQty: number;
  newQty: number;
  referenceId?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  birthday?: string | null;
  notes?: string | null;
  totalSpend: number;
  totalVisits: number;
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  image?: string | null;
  unitCost: number;
  unitPrice: number;
  appliedPrice: number; // can be normal, wholesale, or member price
  priceType: 'NORMAL' | 'WHOLESALE' | 'MEMBER';
  quantity: number;
  discount: number; // item level discount
  subtotal: number;
  notes?: string;
  maxStock: number;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  profit: number;
  notes?: string | null;
}

export interface Payment {
  id: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  amountPaid: number;
  change: number;
  reference?: string | null;
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  outletId: string;
  cashierId: string;
  cashierName?: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  subtotal: number;
  itemDiscountTotal: number;
  orderDiscountTotal: number;
  voucherCode?: string | null;
  voucherDiscount: number;
  taxAmount: number;
  taxRate: number;
  grandTotal: number;
  totalCost: number;
  grossProfit: number;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsDiscount: number;
  status: TransactionStatus;
  notes?: string | null;
  refundReason?: string | null;
  refundedBy?: string | null;
  refundedAt?: string | null;
  shiftId?: string | null;
  createdAt: string;
  updatedAt: string;
  items: TransactionItem[];
  payments: Payment[];
}

export interface CashShift {
  id: string;
  registerId?: string | null;
  outletId: string;
  userId: string;
  userName?: string;
  status: ShiftStatus;
  openingCash: number;
  closingCash?: number | null;
  expectedCash?: number | null;
  difference?: number | null;
  cashSales: number;
  nonCashSales: number;
  cashInTotal: number;
  cashOutTotal: number;
  notes?: string | null;
  openedAt: string;
  closedAt?: string | null;
}

export interface Expense {
  id: string;
  shiftId?: string | null;
  outletId: string;
  amount: number;
  category: 'OPERATIONAL' | 'SUPPLIES' | 'MAINTENANCE' | 'REFUND' | 'OTHER';
  description: string;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  poNumber: string;
  outletId: string;
  supplierId: string;
  supplierName?: string;
  createdById: string;
  createdByName?: string;
  status: PurchaseStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  notes?: string | null;
  orderedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
}

export interface Promotion {
  id: string;
  businessId: string;
  name: string;
  type: PromotionType;
  value: number;
  minSpend?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  rulesJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  businessId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  outletId?: string | null;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PURCHASE' | 'REFUND' | 'CASH_DISCREPANCY' | 'SYSTEM';
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  sourceOutletId: string;
  sourceOutletName?: string;
  destOutletId: string;
  destOutletName?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  items?: { productId: string; productName: string; quantity: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
