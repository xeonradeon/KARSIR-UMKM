import {
  Business,
  BusinessSettings,
  Outlet,
  User,
  Category,
  Brand,
  Supplier,
  Product,
  ProductVariant,
  InventoryItem,
  InventoryMovement,
  Customer,
  Transaction,
  CashShift,
  Expense,
  Purchase,
  Promotion,
  Voucher,
  Notification,
  AuditLog,
  StockTransfer,
  CartItem,
  StockMovementType,
  PaymentMethod,
} from '@/types';
import {
  INITIAL_BUSINESS_ID,
  INITIAL_OUTLET_MAIN_ID,
  SEED_BUSINESS,
  SEED_SETTINGS,
  SEED_OUTLETS,
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_SUPPLIERS,
  SEED_PRODUCTS,
  SEED_INVENTORIES,
  SEED_CUSTOMERS,
  SEED_VOUCHERS,
  SEED_PROMOTIONS,
  SEED_ACTIVE_SHIFT,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_PURCHASES,
  generateSeedTransactions,
} from './seed-data';
import { calculateCheckout, calculateLoyaltyPointsEarned } from '@/lib/finance';

class DatabaseStore {
  private business: Business = { ...SEED_BUSINESS };
  private settings: BusinessSettings = { ...SEED_SETTINGS };
  private outlets: Outlet[] = [...SEED_OUTLETS];
  private users: (User & { passwordHash: string })[] = [...SEED_USERS];
  private categories: Category[] = [...SEED_CATEGORIES];
  private brands: Brand[] = [...SEED_BRANDS];
  private suppliers: Supplier[] = [...SEED_SUPPLIERS];
  private products: Product[] = JSON.parse(JSON.stringify(SEED_PRODUCTS));
  private inventories: InventoryItem[] = JSON.parse(JSON.stringify(SEED_INVENTORIES));
  private movements: InventoryMovement[] = [];
  private customers: Customer[] = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
  private transactions: Transaction[] = generateSeedTransactions();
  private shifts: CashShift[] = [{ ...SEED_ACTIVE_SHIFT }];
  private expenses: Expense[] = [];
  private purchases: Purchase[] = JSON.parse(JSON.stringify(SEED_PURCHASES));
  private promotions: Promotion[] = [...SEED_PROMOTIONS];
  private vouchers: Voucher[] = [...SEED_VOUCHERS];
  private notifications: Notification[] = [...SEED_NOTIFICATIONS];
  private auditLogs: AuditLog[] = [...SEED_AUDIT_LOGS];
  private transfers: StockTransfer[] = [];

  constructor() {
    // Initial movement log generation for seed transactions
    this.initSeedMovements();
  }

  private initSeedMovements() {
    for (const prod of this.products) {
      this.movements.push({
        id: `mov_init_${prod.id}`,
        productId: prod.id,
        productName: prod.name,
        outletId: INITIAL_OUTLET_MAIN_ID,
        type: 'INITIAL',
        quantity: 100,
        previousQty: 0,
        newQty: 100,
        reason: 'Stok Awal Sistem',
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      });
    }
  }

  // --- BUSINESS & SETTINGS ---
  getBusiness(): Business {
    return { ...this.business };
  }

  updateBusiness(data: Partial<Business>): Business {
    this.business = { ...this.business, ...data, updatedAt: new Date().toISOString() };
    return { ...this.business };
  }

  getSettings(): BusinessSettings {
    return { ...this.settings };
  }

  updateSettings(data: Partial<BusinessSettings>): BusinessSettings {
    this.settings = { ...this.settings, ...data, businessId: this.business.id };
    return { ...this.settings };
  }

  // --- OUTLETS ---
  getOutlets(): Outlet[] {
    return [...this.outlets];
  }

  getOutletById(id: string): Outlet | undefined {
    return this.outlets.find((o) => o.id === id);
  }

  createOutlet(data: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'>): Outlet {
    const newOutlet: Outlet = {
      ...data,
      id: `out_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.outlets.push(newOutlet);
    return newOutlet;
  }

  updateOutlet(id: string, data: Partial<Outlet>): Outlet | null {
    const idx = this.outlets.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.outlets[idx] = { ...this.outlets[idx], ...data, updatedAt: new Date().toISOString() };
    return this.outlets[idx];
  }

  // --- USERS & AUTH ---
  getUsers(): User[] {
    return this.users.map(({ passwordHash, ...user }) => user);
  }

  getUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { passwordHash: string }): User {
    const newUser = {
      ...data,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  updateUser(id: string, data: Partial<User & { passwordHash?: string }>): User | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date().toISOString() };
    const { passwordHash, ...safeUser } = this.users[idx];
    return safeUser;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLen;
  }

  // --- CATEGORIES & BRANDS ---
  getCategories(): Category[] {
    return [...this.categories];
  }

  createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const newCat: Category = {
      ...data,
      id: `cat_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.categories.push(newCat);
    return newCat;
  }

  updateCategory(id: string, data: Partial<Category>): Category | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...data, updatedAt: new Date().toISOString() };
    return this.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < initialLen;
  }

  getBrands(): Brand[] {
    return [...this.brands];
  }

  createBrand(name: string): Brand {
    const newBrand: Brand = {
      id: `brd_${Date.now()}`,
      businessId: this.business.id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.brands.push(newBrand);
    return newBrand;
  }

  // --- SUPPLIERS ---
  getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  }

  createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const newSup: Supplier = {
      ...data,
      id: `sup_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.suppliers.push(newSup);
    return newSup;
  }

  updateSupplier(id: string, data: Partial<Supplier>): Supplier | null {
    const idx = this.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.suppliers[idx] = { ...this.suppliers[idx], ...data, updatedAt: new Date().toISOString() };
    return this.suppliers[idx];
  }

  deleteSupplier(id: string): boolean {
    const initialLen = this.suppliers.length;
    this.suppliers = this.suppliers.filter((s) => s.id !== id);
    return this.suppliers.length < initialLen;
  }

  // --- PRODUCTS & INVENTORY ---
  getProducts(outletId = INITIAL_OUTLET_MAIN_ID): Product[] {
    return this.products.map((p) => {
      const inv = this.inventories.find(
        (i) => i.productId === p.id && i.outletId === outletId
      );
      const category = this.categories.find((c) => c.id === p.categoryId) || null;
      const brand = this.brands.find((b) => b.id === p.brandId) || null;
      const supplier = this.suppliers.find((s) => s.id === p.supplierId) || null;

      return {
        ...p,
        stock: inv ? inv.quantity : 0,
        category,
        brand,
        supplier,
      };
    });
  }

  getProductById(id: string, outletId = INITIAL_OUTLET_MAIN_ID): Product | null {
    const p = this.products.find((prod) => prod.id === id);
    if (!p) return null;

    const inv = this.inventories.find(
      (i) => i.productId === p.id && i.outletId === outletId
    );
    const category = this.categories.find((c) => c.id === p.categoryId) || null;
    const brand = this.brands.find((b) => b.id === p.brandId) || null;
    const supplier = this.suppliers.find((s) => s.id === p.supplierId) || null;

    return {
      ...p,
      stock: inv ? inv.quantity : 0,
      category,
      brand,
      supplier,
    };
  }

  getProductByBarcodeOrSku(code: string, outletId = INITIAL_OUTLET_MAIN_ID): Product | null {
    const cleaned = code.trim().toLowerCase();
    const p = this.products.find(
      (prod) =>
        prod.barcode?.toLowerCase() === cleaned ||
        prod.sku.toLowerCase() === cleaned ||
        prod.variants?.some(
          (v) => v.barcode?.toLowerCase() === cleaned || v.sku.toLowerCase() === cleaned
        )
    );
    if (!p) return null;
    return this.getProductById(p.id, outletId);
  }

  createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    initialStock = 0,
    outletId = INITIAL_OUTLET_MAIN_ID
  ): Product {
    const newProduct: Product = {
      ...data,
      id: `prd_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.push(newProduct);

    // Create inventory record for main outlet
    const inv: InventoryItem = {
      id: `inv_${Date.now()}`,
      outletId,
      productId: newProduct.id,
      quantity: initialStock,
      minStock: newProduct.minStock,
      updatedAt: new Date().toISOString(),
    };
    this.inventories.push(inv);

    if (initialStock > 0) {
      this.recordMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        outletId,
        type: 'INITIAL',
        quantity: initialStock,
        previousQty: 0,
        newQty: initialStock,
        reason: 'Stok Awal Produk Baru',
      });
    }

    return this.getProductById(newProduct.id, outletId)!;
  }

  updateProduct(id: string, data: Partial<Product>, outletId = INITIAL_OUTLET_MAIN_ID): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    this.products[idx] = {
      ...this.products[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.getProductById(id, outletId);
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    this.inventories = this.inventories.filter((i) => i.productId !== id);
    return this.products.length < initialLen;
  }

  // --- INVENTORY OPERATIONS ---
  getInventories(outletId = INITIAL_OUTLET_MAIN_ID): (InventoryItem & { product: Product })[] {
    return this.inventories
      .filter((i) => !outletId || i.outletId === outletId)
      .map((inv) => {
        const product = this.getProductById(inv.productId, inv.outletId)!;
        return {
          ...inv,
          product,
        };
      })
      .filter((item) => item.product !== null);
  }

  adjustStock(params: {
    productId: string;
    outletId: string;
    type: StockMovementType;
    quantity: number; // positive or negative
    reason: string;
    userId?: string;
    userName?: string;
  }): { success: boolean; newStock: number; message?: string } {
    const { productId, outletId, type, quantity, reason, userId, userName } = params;

    let inv = this.inventories.find(
      (i) => i.productId === productId && i.outletId === outletId
    );

    const prevQty = inv ? inv.quantity : 0;
    const newQty = prevQty + quantity;

    if (newQty < 0) {
      return { success: false, newStock: prevQty, message: 'Stok tidak mencukupi untuk pengurangan ini.' };
    }

    if (inv) {
      inv.quantity = newQty;
      inv.updatedAt = new Date().toISOString();
    } else {
      inv = {
        id: `inv_${Date.now()}`,
        outletId,
        productId,
        quantity: newQty,
        minStock: 5,
        updatedAt: new Date().toISOString(),
      };
      this.inventories.push(inv);
    }

    const prod = this.products.find((p) => p.id === productId);

    this.recordMovement({
      productId,
      productName: prod?.name || 'Produk',
      outletId,
      userId,
      userName,
      type,
      quantity,
      previousQty: prevQty,
      newQty,
      reason,
    });

    // Check low stock warning
    if (prod && newQty <= prod.minStock) {
      this.createNotification({
        outletId,
        title: newQty === 0 ? 'Stok Habis!' : 'Peringatan Stok Menipis!',
        message: `Stok produk ${prod.name} sisa ${newQty} ${prod.unit} (Batas minimum: ${prod.minStock}).`,
        type: newQty === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        linkUrl: '/inventory',
      });
    }

    return { success: true, newStock: newQty };
  }

  recordMovement(
    data: Omit<InventoryMovement, 'id' | 'createdAt'>
  ): InventoryMovement {
    const newMovement: InventoryMovement = {
      ...data,
      id: `mov_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.movements.unshift(newMovement);
    return newMovement;
  }

  getMovements(outletId?: string): InventoryMovement[] {
    if (!outletId) return [...this.movements];
    return this.movements.filter((m) => m.outletId === outletId);
  }

  transferStock(params: {
    sourceOutletId: string;
    destOutletId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
    userId?: string;
    userName?: string;
  }): { success: boolean; transfer?: StockTransfer; message?: string } {
    const { sourceOutletId, destOutletId, items, notes, userId, userName } = params;

    // Check stocks
    for (const it of items) {
      const sourceInv = this.inventories.find(
        (i) => i.productId === it.productId && i.outletId === sourceOutletId
      );
      if (!sourceInv || sourceInv.quantity < it.quantity) {
        const prod = this.products.find((p) => p.id === it.productId);
        return {
          success: false,
          message: `Stok ${prod?.name || 'produk'} di outlet asal tidak mencukupi untuk transfer.`,
        };
      }
    }

    const sourceOutlet = this.getOutletById(sourceOutletId);
    const destOutlet = this.getOutletById(destOutletId);

    const transferItemsFormatted = items.map((it) => {
      const prod = this.products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod?.name || 'Produk',
        quantity: it.quantity,
      };
    });

    // Execute transfer
    for (const it of items) {
      const prod = this.products.find((p) => p.id === it.productId);

      // Decrement source
      this.adjustStock({
        productId: it.productId,
        outletId: sourceOutletId,
        type: 'TRANSFER',
        quantity: -it.quantity,
        reason: `Transfer ke ${destOutlet?.name || 'Outlet Lain'}`,
        userId,
        userName,
      });

      // Increment dest
      this.adjustStock({
        productId: it.productId,
        outletId: destOutletId,
        type: 'TRANSFER',
        quantity: it.quantity,
        reason: `Terima transfer dari ${sourceOutlet?.name || 'Outlet Asal'}`,
        userId,
        userName,
      });
    }

    const transfer: StockTransfer = {
      id: `trf_${Date.now()}`,
      transferNumber: `TRF-${Date.now().toString().slice(-6)}`,
      sourceOutletId,
      sourceOutletName: sourceOutlet?.name,
      destOutletId,
      destOutletName: destOutlet?.name,
      status: 'COMPLETED',
      notes,
      items: transferItemsFormatted,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transfers.unshift(transfer);

    return { success: true, transfer };
  }

  getTransfers(): StockTransfer[] {
    return [...this.transfers];
  }

  // --- CUSTOMERS & LOYALTY ---
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  getCustomerById(id: string): Customer | null {
    return this.customers.find((c) => c.id === id) || null;
  }

  createCustomer(data: Omit<Customer, 'id' | 'totalSpend' | 'totalVisits' | 'points' | 'tier' | 'createdAt' | 'updatedAt'>): Customer {
    const newCustomer: Customer = {
      ...data,
      id: `cst_${Date.now()}`,
      totalSpend: 0,
      totalVisits: 0,
      points: 0,
      tier: 'BRONZE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.customers.unshift(newCustomer);
    return newCustomer;
  }

  updateCustomer(id: string, data: Partial<Customer>): Customer | null {
    const idx = this.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.customers[idx] = {
      ...this.customers[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.customers[idx];
  }

  deleteCustomer(id: string): boolean {
    const initialLen = this.customers.length;
    this.customers = this.customers.filter((c) => c.id !== id);
    return this.customers.length < initialLen;
  }

  // --- TRANSACTIONS & POS CHECKOUT ---
  getTransactions(params?: {
    outletId?: string;
    cashierId?: string;
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Transaction[] {
    let result = [...this.transactions];

    if (params?.outletId) {
      result = result.filter((t) => t.outletId === params.outletId);
    }
    if (params?.cashierId) {
      result = result.filter((t) => t.cashierId === params.cashierId);
    }
    if (params?.customerId) {
      result = result.filter((t) => t.customerId === params.customerId);
    }
    if (params?.status) {
      result = result.filter((t) => t.status === params.status);
    }
    if (params?.startDate) {
      const start = new Date(params.startDate).getTime();
      result = result.filter((t) => new Date(t.createdAt).getTime() >= start);
    }
    if (params?.endDate) {
      const end = new Date(params.endDate).getTime();
      result = result.filter((t) => new Date(t.createdAt).getTime() <= end);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.invoiceNumber.toLowerCase().includes(q) ||
          t.customerName?.toLowerCase().includes(q) ||
          t.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTransactionById(id: string): Transaction | null {
    return this.transactions.find((t) => t.id === id || t.invoiceNumber === id) || null;
  }

  createTransaction(params: {
    outletId: string;
    cashierId: string;
    cashierName: string;
    customerId?: string | null;
    items: CartItem[];
    orderDiscountType?: 'PERCENTAGE' | 'FIXED';
    orderDiscountValue?: number;
    voucherCode?: string | null;
    pointsRedeemed?: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    paymentReference?: string | null;
    notes?: string | null;
    shiftId?: string | null;
  }): { success: boolean; transaction?: Transaction; message?: string } {
    const {
      outletId,
      cashierId,
      cashierName,
      customerId,
      items,
      orderDiscountType,
      orderDiscountValue,
      voucherCode,
      pointsRedeemed = 0,
      paymentMethod,
      amountPaid,
      paymentReference,
      notes,
      shiftId,
    } = params;

    if (!items || items.length === 0) {
      return { success: false, message: 'Keranjang belanja kosong.' };
    }

    // Check inventory stock availability
    for (const item of items) {
      const inv = this.inventories.find(
        (i) => i.productId === item.productId && i.outletId === outletId
      );
      if (!inv || inv.quantity < item.quantity) {
        return {
          success: false,
          message: `Stok produk "${item.productName}" tidak mencukupi (Tersedia: ${inv ? inv.quantity : 0}).`,
        };
      }
    }

    // Voucher check
    let appliedVoucher: Voucher | null = null;
    if (voucherCode) {
      const v = this.vouchers.find(
        (vch) => vch.code.toUpperCase() === voucherCode.toUpperCase() && vch.isActive
      );
      if (v) appliedVoucher = v;
    }

    // Customer check
    const customer = customerId ? this.getCustomerById(customerId) : null;

    // Financial Calculation
    const calc = calculateCheckout({
      items,
      orderDiscountType,
      orderDiscountValue,
      voucher: appliedVoucher,
      taxRate: this.business.taxRate,
      taxEnabled: this.business.taxEnabled,
      pointsRedeemed: customer ? pointsRedeemed : 0,
      pointRedeemRate: this.settings.loyaltyRedeemRate,
    });

    if (paymentMethod === 'CASH' && amountPaid < calc.grandTotal) {
      return {
        success: false,
        message: `Uang tunai yang dibayarkan kurang dari total belanja (${calc.grandTotal}).`,
      };
    }

    const change = paymentMethod === 'CASH' ? amountPaid - calc.grandTotal : 0;
    const pointsEarned = customer
      ? calculateLoyaltyPointsEarned(calc.taxableAmount, this.settings.loyaltyPointsPerUnit)
      : 0;

    const now = new Date();
    const invoiceNumber = `INV/${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}/${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const txId = `tx_${Date.now()}`;

    const txItems = items.map((it, idx) => {
      const lineCost = (it.unitCost || 0) * it.quantity;
      const lineSubtotal = (it.appliedPrice || it.unitPrice) * it.quantity - (it.discount || 0);
      const lineProfit = lineSubtotal - lineCost;

      return {
        id: `txi_${txId}_${idx}`,
        transactionId: txId,
        productId: it.productId,
        variantId: it.variantId || null,
        productName: it.productName,
        variantName: it.variantName || null,
        sku: it.sku,
        quantity: it.quantity,
        unitCost: it.unitCost || 0,
        unitPrice: it.appliedPrice || it.unitPrice,
        discount: it.discount || 0,
        subtotal: lineSubtotal,
        profit: lineProfit,
        notes: it.notes || null,
      };
    });

    const newTransaction: Transaction = {
      id: txId,
      invoiceNumber,
      outletId,
      cashierId,
      cashierName,
      customerId: customer?.id || null,
      customerName: customer ? customer.name : 'Pelanggan Umum (Guest)',
      customerPhone: customer ? customer.phone : null,
      subtotal: calc.subtotal,
      itemDiscountTotal: calc.itemDiscountTotal,
      orderDiscountTotal: calc.orderDiscountTotal,
      voucherCode: appliedVoucher ? appliedVoucher.code : null,
      voucherDiscount: calc.voucherDiscount,
      taxAmount: calc.taxAmount,
      taxRate: this.business.taxRate,
      grandTotal: calc.grandTotal,
      totalCost: calc.totalCost,
      grossProfit: calc.grossProfit,
      pointsEarned,
      pointsRedeemed: customer ? pointsRedeemed : 0,
      pointsDiscount: calc.pointsDiscount,
      status: 'COMPLETED',
      notes: notes || null,
      shiftId: shiftId || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items: txItems,
      payments: [
        {
          id: `pay_${txId}`,
          transactionId: txId,
          method: paymentMethod,
          amount: calc.grandTotal,
          amountPaid: paymentMethod === 'CASH' ? amountPaid : calc.grandTotal,
          change,
          reference: paymentReference || null,
          status: 'SUCCESS',
          createdAt: now.toISOString(),
        },
      ],
    };

    // 1. Deduct Inventory & Record Movements
    for (const item of items) {
      this.adjustStock({
        productId: item.productId,
        outletId,
        type: 'SALE',
        quantity: -item.quantity,
        reason: `Penjualan ${invoiceNumber}`,
        userId: cashierId,
        userName: cashierName,
      });
    }

    // 2. Update Customer Stats & Loyalty
    if (customer) {
      customer.totalSpend += calc.grandTotal;
      customer.totalVisits += 1;
      customer.points = customer.points - pointsRedeemed + pointsEarned;
      if (customer.totalSpend > 2000000) customer.tier = 'PLATINUM';
      else if (customer.totalSpend > 1000000) customer.tier = 'GOLD';
      else if (customer.totalSpend > 300000) customer.tier = 'SILVER';
      this.updateCustomer(customer.id, customer);
    }

    // 3. Update Voucher usage
    if (appliedVoucher) {
      appliedVoucher.usedCount += 1;
    }

    // 4. Update Shift Cash
    const activeShift = this.getActiveShift(outletId);
    if (activeShift) {
      if (paymentMethod === 'CASH') {
        activeShift.cashSales += calc.grandTotal;
      } else {
        activeShift.nonCashSales += calc.grandTotal;
      }
    }

    // 5. Save Transaction
    this.transactions.unshift(newTransaction);

    // 6. Audit Log
    this.createAuditLog({
      businessId: this.business.id,
      userId: cashierId,
      userName: cashierName,
      userRole: 'CASHIER',
      action: 'TRANSACTION_CREATE',
      entity: 'Transaction',
      entityId: newTransaction.id,
      metadata: JSON.stringify({
        invoiceNumber,
        grandTotal: calc.grandTotal,
        paymentMethod,
        itemsCount: items.length,
      }),
    });

    return { success: true, transaction: newTransaction };
  }

  refundTransaction(params: {
    transactionId: string;
    reason: string;
    userId: string;
    userName: string;
    userRole: string;
  }): { success: boolean; message?: string; transaction?: Transaction } {
    const tx = this.getTransactionById(params.transactionId);
    if (!tx) return { success: false, message: 'Transaksi tidak ditemukan.' };
    if (tx.status === 'REFUNDED') {
      return { success: false, message: 'Transaksi ini sudah pernah di-refund.' };
    }

    tx.status = 'REFUNDED';
    tx.refundReason = params.reason;
    tx.refundedBy = params.userName;
    tx.refundedAt = new Date().toISOString();
    tx.updatedAt = new Date().toISOString();

    // Restore inventory
    for (const item of tx.items) {
      this.adjustStock({
        productId: item.productId,
        outletId: tx.outletId,
        type: 'RETURN',
        quantity: item.quantity,
        reason: `Refund Transaksi ${tx.invoiceNumber}: ${params.reason}`,
        userId: params.userId,
        userName: params.userName,
      });
    }

    // Reverse customer spend & points
    if (tx.customerId) {
      const cust = this.getCustomerById(tx.customerId);
      if (cust) {
        cust.totalSpend = Math.max(0, cust.totalSpend - tx.grandTotal);
        cust.points = Math.max(0, cust.points - tx.pointsEarned + tx.pointsRedeemed);
        this.updateCustomer(cust.id, cust);
      }
    }

    // Reverse shift cash if active
    const activeShift = this.getActiveShift(tx.outletId);
    if (activeShift) {
      const cashPay = tx.payments.find((p) => p.method === 'CASH');
      if (cashPay) {
        activeShift.cashSales = Math.max(0, activeShift.cashSales - tx.grandTotal);
      } else {
        activeShift.nonCashSales = Math.max(0, activeShift.nonCashSales - tx.grandTotal);
      }
    }

    // Audit Log
    this.createAuditLog({
      businessId: this.business.id,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: 'TRANSACTION_REFUND',
      entity: 'Transaction',
      entityId: tx.id,
      metadata: JSON.stringify({
        invoiceNumber: tx.invoiceNumber,
        grandTotal: tx.grandTotal,
        reason: params.reason,
      }),
    });

    return { success: true, transaction: tx };
  }

  // --- CASH SHIFTS & EXPENSES ---
  getActiveShift(outletId = INITIAL_OUTLET_MAIN_ID): CashShift | undefined {
    return this.shifts.find((s) => s.outletId === outletId && s.status === 'OPEN');
  }

  getShifts(outletId?: string): CashShift[] {
    if (!outletId) return [...this.shifts];
    return this.shifts.filter((s) => s.outletId === outletId);
  }

  openShift(params: {
    outletId: string;
    userId: string;
    userName: string;
    openingCash: number;
    registerId?: string;
  }): { success: boolean; shift?: CashShift; message?: string } {
    const existing = this.getActiveShift(params.outletId);
    if (existing) {
      return { success: false, message: 'Masih ada shift kasir yang aktif di outlet ini. Harap tutup shift sebelumnya.' };
    }

    const newShift: CashShift = {
      id: `shf_${Date.now()}`,
      registerId: params.registerId || 'reg_01',
      outletId: params.outletId,
      userId: params.userId,
      userName: params.userName,
      status: 'OPEN',
      openingCash: params.openingCash,
      cashSales: 0,
      nonCashSales: 0,
      cashInTotal: 0,
      cashOutTotal: 0,
      openedAt: new Date().toISOString(),
    };
    this.shifts.unshift(newShift);

    this.createAuditLog({
      businessId: this.business.id,
      userId: params.userId,
      userName: params.userName,
      userRole: 'CASHIER',
      action: 'SHIFT_OPEN',
      entity: 'CashShift',
      entityId: newShift.id,
      metadata: JSON.stringify({ openingCash: params.openingCash }),
    });

    return { success: true, shift: newShift };
  }

  closeShift(params: {
    shiftId: string;
    closingCash: number;
    notes?: string;
    userId: string;
    userName: string;
  }): { success: boolean; shift?: CashShift; message?: string } {
    const shift = this.shifts.find((s) => s.id === params.shiftId);
    if (!shift) return { success: false, message: 'Shift tidak ditemukan.' };
    if (shift.status === 'CLOSED') return { success: false, message: 'Shift ini sudah ditutup.' };

    const expectedCash = shift.openingCash + shift.cashSales + shift.cashInTotal - shift.cashOutTotal;
    const difference = params.closingCash - expectedCash;

    shift.status = 'CLOSED';
    shift.closingCash = params.closingCash;
    shift.expectedCash = expectedCash;
    shift.difference = difference;
    shift.notes = params.notes || null;
    shift.closedAt = new Date().toISOString();

    if (Math.abs(difference) > 0) {
      this.createNotification({
        outletId: shift.outletId,
        title: 'Selisih Kas Kasir!',
        message: `Shift ${shift.userName} ditutup dengan selisih kas ${difference > 0 ? '+Rp ' + difference.toLocaleString('id-ID') : '-Rp ' + Math.abs(difference).toLocaleString('id-ID')}.`,
        type: 'CASH_DISCREPANCY',
        linkUrl: '/shifts',
      });
    }

    this.createAuditLog({
      businessId: this.business.id,
      userId: params.userId,
      userName: params.userName,
      userRole: 'CASHIER',
      action: 'SHIFT_CLOSE',
      entity: 'CashShift',
      entityId: shift.id,
      metadata: JSON.stringify({
        openingCash: shift.openingCash,
        cashSales: shift.cashSales,
        closingCash: params.closingCash,
        expectedCash,
        difference,
      }),
    });

    return { success: true, shift };
  }

  recordExpense(params: {
    outletId: string;
    shiftId?: string;
    amount: number;
    category: 'OPERATIONAL' | 'SUPPLIES' | 'MAINTENANCE' | 'REFUND' | 'OTHER';
    description: string;
    receiptUrl?: string;
  }): Expense {
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      outletId: params.outletId,
      shiftId: params.shiftId,
      amount: params.amount,
      category: params.category,
      description: params.description,
      receiptUrl: params.receiptUrl,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);

    // Update active shift cashOut
    if (params.shiftId) {
      const shift = this.shifts.find((s) => s.id === params.shiftId);
      if (shift) {
        shift.cashOutTotal += params.amount;
      }
    }

    return newExpense;
  }

  getExpenses(outletId?: string): Expense[] {
    if (!outletId) return [...this.expenses];
    return this.expenses.filter((e) => e.outletId === outletId);
  }

  // --- PURCHASING ---
  getPurchases(outletId?: string): Purchase[] {
    if (!outletId) return [...this.purchases];
    return this.purchases.filter((p) => p.outletId === outletId);
  }

  getPurchaseById(id: string): Purchase | null {
    return this.purchases.find((p) => p.id === id || p.poNumber === id) || null;
  }

  createPurchase(data: {
    outletId: string;
    supplierId: string;
    createdById: string;
    createdByName: string;
    notes?: string;
    items: { productId: string; quantity: number; unitCost: number }[];
  }): Purchase {
    const sup = this.getSupplierById(data.supplierId);
    const poNumber = `PO-${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    let subtotal = 0;
    const pItems = data.items.map((it, idx) => {
      const prod = this.products.find((p) => p.id === it.productId);
      const lineSubtotal = it.quantity * it.unitCost;
      subtotal += lineSubtotal;

      return {
        id: `poi_${Date.now()}_${idx}`,
        purchaseId: '',
        productId: it.productId,
        productName: prod?.name || 'Produk',
        quantity: it.quantity,
        unitCost: it.unitCost,
        subtotal: lineSubtotal,
      };
    });

    const newPurchase: Purchase = {
      id: `po_${Date.now()}`,
      poNumber,
      outletId: data.outletId,
      supplierId: data.supplierId,
      supplierName: sup?.name,
      createdById: data.createdById,
      createdByName: data.createdByName,
      status: 'ORDERED',
      subtotal,
      taxAmount: 0,
      discountAmount: 0,
      grandTotal: subtotal,
      notes: data.notes || null,
      orderedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: pItems,
    };

    newPurchase.items.forEach((it) => (it.purchaseId = newPurchase.id));
    this.purchases.unshift(newPurchase);

    return newPurchase;
  }

  updatePurchaseStatus(
    id: string,
    status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED',
    userId?: string,
    userName?: string
  ): Purchase | null {
    const po = this.getPurchaseById(id);
    if (!po) return null;

    const prevStatus = po.status;
    po.status = status;
    po.updatedAt = new Date().toISOString();

    // If marked as RECEIVED and wasn't received before -> increase stock automatically
    if (status === 'RECEIVED' && prevStatus !== 'RECEIVED') {
      po.receivedAt = new Date().toISOString();
      for (const item of po.items) {
        this.adjustStock({
          productId: item.productId,
          outletId: po.outletId,
          type: 'PURCHASE',
          quantity: item.quantity,
          reason: `Penerimaan Barang ${po.poNumber}`,
          userId,
          userName,
        });

        // Also update product cost price if changed
        const prod = this.products.find((p) => p.id === item.productId);
        if (prod && item.unitCost > 0) {
          prod.costPrice = item.unitCost;
        }
      }

      // Update supplier total purchases
      if (po.supplierId) {
        const sup = this.getSupplierById(po.supplierId);
        if (sup) {
          sup.totalPurchases = (sup.totalPurchases || 0) + po.grandTotal;
        }
      }
    }

    return po;
  }

  // --- PROMOTIONS & VOUCHERS ---
  getPromotions(): Promotion[] {
    return [...this.promotions];
  }

  createPromotion(data: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>): Promotion {
    const newPromo: Promotion = {
      ...data,
      id: `prm_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.promotions.push(newPromo);
    return newPromo;
  }

  getVouchers(): Voucher[] {
    return [...this.vouchers];
  }

  validateVoucher(code: string, subtotal: number): { valid: boolean; voucher?: Voucher; message?: string } {
    const v = this.vouchers.find((item) => item.code.toUpperCase() === code.toUpperCase());
    if (!v) return { valid: false, message: 'Kode voucher tidak ditemukan.' };
    if (!v.isActive) return { valid: false, message: 'Voucher sedang tidak aktif.' };

    const now = new Date().getTime();
    if (new Date(v.startDate).getTime() > now) {
      return { valid: false, message: 'Voucher belum berlaku.' };
    }
    if (new Date(v.endDate).getTime() < now) {
      return { valid: false, message: 'Voucher telah kedaluwarsa.' };
    }
    if (v.usedCount >= v.usageLimit) {
      return { valid: false, message: 'Kuota pemakaian voucher telah habis.' };
    }
    if (subtotal < v.minSpend) {
      return { valid: false, message: `Minimal belanja untuk voucher ini adalah Rp ${v.minSpend.toLocaleString('id-ID')}.` };
    }

    return { valid: true, voucher: v };
  }

  createVoucher(data: Omit<Voucher, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Voucher {
    const newVoucher: Voucher = {
      ...data,
      id: `vch_${Date.now()}`,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vouchers.push(newVoucher);
    return newVoucher;
  }

  // --- NOTIFICATIONS & AUDIT ---
  getNotifications(outletId?: string): Notification[] {
    if (!outletId) return [...this.notifications];
    return this.notifications.filter((n) => !n.outletId || n.outletId === outletId);
  }

  markNotificationAsRead(id: string): void {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) n.isRead = true;
  }

  markAllNotificationsRead(outletId?: string): void {
    this.notifications.forEach((n) => {
      if (!outletId || !n.outletId || n.outletId === outletId) {
        n.isRead = true;
      }
    });
  }

  createNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...data,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  getAuditLogs(businessId = INITIAL_BUSINESS_ID): AuditLog[] {
    return this.auditLogs.filter((l) => l.businessId === businessId);
  }

  createAuditLog(data: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      ...data,
      id: `aud_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  // --- DASHBOARD & ANALYTICS STATS ---
  getDashboardStats(outletId = INITIAL_OUTLET_MAIN_ID) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const outletTx = this.transactions.filter(
      (t) => (!outletId || t.outletId === outletId) && t.status === 'COMPLETED'
    );

    const todayTx = outletTx.filter((t) => new Date(t.createdAt).getTime() >= todayStart);

    const todayRevenue = todayTx.reduce((acc, t) => acc + t.grandTotal, 0);
    const todayGrossProfit = todayTx.reduce((acc, t) => acc + t.grossProfit, 0);
    const todayItemsSold = todayTx.reduce(
      (acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // Low stock count
    const outletInvs = this.getInventories(outletId);
    const lowStockCount = outletInvs.filter((i) => i.quantity <= i.minStock).length;
    const outOfStockCount = outletInvs.filter((i) => i.quantity <= 0).length;

    // Active customers
    const activeCustomersCount = this.customers.length;

    // Last 7 Days Revenue Trend
    const last7Days: { date: string; revenue: number; profit: number; transactions: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 3600 * 1000;

      const dayTx = outletTx.filter((t) => {
        const time = new Date(t.createdAt).getTime();
        return time >= dayStart && time < dayEnd;
      });

      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      const rev = dayTx.reduce((acc, t) => acc + t.grandTotal, 0);
      const prof = dayTx.reduce((acc, t) => acc + t.grossProfit, 0);

      last7Days.push({
        date: dateStr,
        revenue: rev,
        profit: prof,
        transactions: dayTx.length,
      });
    }

    // Top Selling Products
    const productSalesMap: Record<
      string,
      { product: Product; unitsSold: number; revenue: number; profit: number }
    > = {};

    for (const t of outletTx) {
      for (const item of t.items) {
        if (!productSalesMap[item.productId]) {
          const prod = this.getProductById(item.productId, outletId);
          if (prod) {
            productSalesMap[item.productId] = {
              product: prod,
              unitsSold: 0,
              revenue: 0,
              profit: 0,
            };
          }
        }
        if (productSalesMap[item.productId]) {
          productSalesMap[item.productId].unitsSold += item.quantity;
          productSalesMap[item.productId].revenue += item.subtotal;
          productSalesMap[item.productId].profit += item.profit;
        }
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Recent 6 transactions
    const recentTransactions = outletTx.slice(0, 6);

    return {
      todayRevenue,
      todayTransactions: todayTx.length,
      todayGrossProfit,
      todayItemsSold,
      lowStockCount,
      outOfStockCount,
      activeCustomersCount,
      last7Days,
      topProducts,
      recentTransactions,
    };
  }
}

// Global Singleton Database Instance
const globalForDb = globalThis as unknown as { posDbInstance: DatabaseStore | undefined };
export const db = globalForDb.posDbInstance ?? new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForDb.posDbInstance = db;
