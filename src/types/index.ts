export type Role = 'OWNER' | 'MANAGER' | 'CASHIER' | 'STAFF_INVENTORY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  outletId: string;
  assignedOutletId?: string;
  pin?: string;
}

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  taxRate: number; // e.g. 0.11 for 11%
  serviceFeeRate: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size L", "Ice / Less Sugar"
  price: number;
  costPrice?: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  price: number; // selling price
  costPrice: number; // HPP (Harga Pokok Penjualan)
  stocks: Record<string, number>; // outletId -> quantity
  minStock: number;
  unit: string; // pcs, cup, box, porsi, kg, botol
  imageUrl?: string;
  description?: string;
  variants?: ProductVariant[];
  isActive: boolean;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  productName: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  unit: string;
  selectedVariant?: ProductVariant;
  notes?: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  subtotal: number;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT_EDC' | 'TRANSFER' | 'HUTANG_KASBON';

export interface PaymentDetails {
  method: PaymentMethod;
  amountPaid: number;
  change: number;
  referenceNumber?: string;
  bankName?: string;
}

export interface HeldOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  tableNumber?: string;
  items: CartItem[];
  createdAt: string;
  note?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  outletId: string;
  outletName: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountNote?: string;
  taxAmount: number;
  serviceFeeAmount: number;
  total: number;
  totalCost: number; // Total HPP
  grossProfit: number; // total - totalCost
  payment: PaymentDetails;
  status: 'COMPLETED' | 'REFUNDED' | 'VOIDED';
  createdAt: string;
  notes?: string;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  costPrice: number;
  financialImpact: number;
  reason: string;
}

export interface StockOpname {
  id: string;
  date: string;
  outletId: string;
  outletName: string;
  auditorName: string;
  items: StockOpnameItem[];
  totalDiscrepancyCost: number;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface StockMutation {
  id: string;
  date: string;
  productId: string;
  productName: string;
  outletId: string;
  outletName: string;
  type: 'SALE' | 'PURCHASE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'RETURN';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceInvoice?: string;
  actorName: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  costPerUnit: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  outletId: string;
  outletName: string;
  date: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
}

export type CustomerTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  tier: CustomerTier;
  points: number;
  totalSpent: number;
  totalVisits: number;
  debtBalance: number; // Hutang / Kasbon
  lastVisit?: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  outletId: string;
  startTime: string;
  endTime?: string;
  startingCash: number; // Modal Awal
  expectedEndingCash?: number;
  actualEndingCash?: number;
  cashDifference?: number;
  difference?: number;
  totalCashSales: number;
  totalNonCashSales: number;
  totalSales: number;
  cashInExpenses: number; // Kas Masuk lain
  cashOutExpenses: number; // Kas Keluar / Pengeluaran operasional
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface Expense {
  id: string;
  shiftId?: string;
  outletId: string;
  category: 'OPERASIONAL' | 'GAJI' | 'KONSUMSI' | 'BAHAN_BAKU' | 'LISTRIK_AIR' | 'LAINNYA';
  amount: number;
  description: string;
  date: string;
  actorName: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxEnabled: boolean;
  taxRate: number; // e.g. 0.11 for 11%
  serviceFeeEnabled: boolean;
  serviceFeeRate: number; // e.g. 0.05 for 5%
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  paperWidth: '58mm' | '80mm';
  enableSound: boolean;
  autoPrintReceipt: boolean;
  pointsPerRupiah: number; // e.g. 1 point per 10.000 spent
  pointRedemptionRate: number; // 1 point = Rp 100
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'transactions'
  | 'shifts'
  | 'customers'
  | 'promotions'
  | 'reports'
  | 'employees'
  | 'outlets'
  | 'audit'
  | 'settings';
