import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppView,
  AuditLog,
  Category,
  Customer,
  Expense,
  Outlet,
  Product,
  Promotion,
  PurchaseOrder,
  Role,
  Shift,
  StockMutation,
  StockOpname,
  StoreSettings,
  Supplier,
  ToastMessage,
  Transaction,
  User,
} from '@/types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_OUTLETS,
  INITIAL_PRODUCTS,
  INITIAL_PROMOTIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_SHIFTS,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '@/data/initialData';
import { playSound } from '@/utils/formatters';

interface AppContextType {
  // Navigation & User
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User;
  users: User[];
  employees: User[];
  loginAs: (role: Role) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addEmployee: (user: Omit<User, 'id'>) => void;
  updateEmployee: (id: string, user: Partial<User>) => void;
  deleteEmployee: (id: string) => void;

  // Outlets
  outlets: Outlet[];
  activeOutlet: Outlet;
  setActiveOutlet: (outlet: Outlet) => void;
  addOutlet: (outlet: Omit<Outlet, 'id'>) => void;
  updateOutlet: (id: string, outlet: Partial<Outlet>) => void;
  deleteOutlet: (id: string) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  // Inventory & Stock
  updateProductStock: (productId: string, outletId: string, newQuantity: number, reason: string) => void;
  transferStock: (productId: string, fromOutletId: string, toOutletId: string, quantity: number, notes?: string) => void;
  stockOpnames: StockOpname[];
  submitStockOpname: (opname: Omit<StockOpname, 'id'>) => void;
  stockMutations: StockMutation[];

  // Transactions & Sales
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  refundTransaction: (id: string, reason: string) => void;
  voidTransaction: (id: string, reason: string) => void;

  // Shifts & Cash Register
  currentShift: Shift | null;
  shifts: Shift[];
  openShift: (startingCash: number, notes?: string) => void;
  startShift: (startingCash: number, notes?: string) => void;
  closeShift: (actualEndingCash: number, notes?: string) => void;
  endShift: (actualEndingCash: number, notes?: string) => void;
  recordCashMovement: (type: 'IN' | 'OUT', amount: number, reason: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'shiftId' | 'date' | 'actorName'>) => void;

  // Customers & CRM
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'totalVisits' | 'debtBalance'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  payCustomerDebt: (customerId: string, amount: number) => void;

  // Suppliers & PO
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  receivePurchaseOrder: (id: string) => void;

  // Promotions & Discounts
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  updatePromotion: (id: string, promo: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  togglePromotion: (id: string) => void;

  // Settings & Audit
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;

  // Database Backup & Restore
  backupDatabaseJSON: () => string;
  restoreDatabaseJSON: (jsonStr: string) => boolean;

  // UI States
  soundEnabled: boolean;
  toggleSound: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning' | string, message?: string, title?: string) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('kasirku_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [user, setUser] = useState<User>(() => users[0] || INITIAL_USERS[0]); // Default Owner
  const [outlets, setOutlets] = useState<Outlet[]>(() => {
    const saved = localStorage.getItem('kasirku_outlets');
    return saved ? JSON.parse(saved) : INITIAL_OUTLETS;
  });
  const [activeOutlet, setActiveOutlet] = useState<Outlet>(() => outlets[0] || INITIAL_OUTLETS[0]);

  // Data states with initial mock data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kasirku_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('kasirku_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('kasirku_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('kasirku_pos');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('kasirku_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('kasirku_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('kasirku_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_opnames');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMutations, setStockMutations] = useState<StockMutation[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_mutations');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kasirku_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('kasirku_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kasirku_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kasirku_outlets', JSON.stringify(outlets));
  }, [outlets]);

  useEffect(() => {
    localStorage.setItem('kasirku_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kasirku_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('kasirku_promos', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kasirku_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('kasirku_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('kasirku_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('kasirku_settings', JSON.stringify(settings));
  }, [settings]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const showToast = (
    typeOrMsg: 'success' | 'error' | 'info' | 'warning' | string,
    message?: string,
    title?: string
  ) => {
    let finalType: 'success' | 'error' | 'info' | 'warning' = 'info';
    let finalMsg = '';

    const validTypes = ['success', 'error', 'info', 'warning'];
    if (validTypes.includes(typeOrMsg)) {
      finalType = typeOrMsg as 'success' | 'error' | 'info' | 'warning';
      finalMsg = message || '';
    } else {
      finalMsg = typeOrMsg;
      if (message && validTypes.includes(message)) {
        finalType = message as 'success' | 'error' | 'info' | 'warning';
      }
    }

    const id = `tst_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, type: finalType, title, message: finalMsg };
    setToasts((prev) => [...prev, newToast]);

    if (soundEnabled) {
      if (finalType === 'success') playSound('success');
      else if (finalType === 'error') playSound('error');
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const log: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const loginAs = (role: Role) => {
    const found = users.find((u) => u.role === role) || users[0];
    setUser(found);
    addAuditLog('ROLE_SWITCH', 'AUTH', `Beralih peran menjadi ${found.name} (${role})`);
    showToast('success', `Berhasil masuk sebagai ${found.name} (${role})`);
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = { ...prodData, id };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('CREATE_PRODUCT', 'PRODUCTS', `Menambahkan produk baru: ${newProduct.name} (${newProduct.sku})`);
    showToast('success', `Produk ${newProduct.name} berhasil disimpan!`);
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodData } : p))
    );
    addAuditLog('UPDATE_PRODUCT', 'PRODUCTS', `Memperbarui data produk ID: ${id}`);
    showToast('success', 'Perubahan produk berhasil disimpan!');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('DELETE_PRODUCT', 'PRODUCTS', `Menghapus produk: ${prod?.name || id}`);
    showToast('info', 'Produk berhasil dihapus');
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const id = `cat_${Date.now()}`;
    const newCat: Category = { ...catData, id };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CREATE_CATEGORY', 'PRODUCTS', `Menambahkan kategori: ${newCat.name}`);
    showToast('success', `Kategori ${newCat.name} berhasil dibuat!`);
  };

  // Stock Management
  const updateProductStock = (productId: string, outletId: string, newQuantity: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const oldQty = prod.stocks[outletId] || 0;
    const diff = newQuantity - oldQty;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [outletId]: newQuantity,
            },
          };
        }
        return p;
      })
    );

    const mutation: StockMutation = {
      id: `mut_${Date.now()}`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId,
      outletName: outlets.find((o) => o.id === outletId)?.name || 'Outlet',
      type: 'ADJUSTMENT',
      quantityChange: diff,
      previousStock: oldQty,
      newStock: newQuantity,
      actorName: user.name,
      notes: reason,
    };
    setStockMutations((prev) => [mutation, ...prev]);
    addAuditLog('STOCK_ADJUST', 'INVENTORY', `Penyesuaian stok ${prod.name}: ${oldQty} -> ${newQuantity} (${reason})`);
    showToast('success', `Stok ${prod.name} diperbarui menjadi ${newQuantity}`);
  };

  const transferStock = (productId: string, fromOutletId: string, toOutletId: string, quantity: number, notes?: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const currentFrom = prod.stocks[fromOutletId] || 0;
    if (currentFrom < quantity) {
      showToast('error', 'Stok di outlet asal tidak mencukupi untuk transfer!');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [fromOutletId]: (p.stocks[fromOutletId] || 0) - quantity,
              [toOutletId]: (p.stocks[toOutletId] || 0) + quantity,
            },
          };
        }
        return p;
      })
    );

    const fromName = outlets.find((o) => o.id === fromOutletId)?.name || 'Outlet Asal';
    const toName = outlets.find((o) => o.id === toOutletId)?.name || 'Outlet Tujuan';

    const outMutation: StockMutation = {
      id: `mut_${Date.now()}_out`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId: fromOutletId,
      outletName: fromName,
      type: 'TRANSFER_OUT',
      quantityChange: -quantity,
      previousStock: currentFrom,
      newStock: currentFrom - quantity,
      actorName: user.name,
      notes: `Transfer ke ${toName}. ${notes || ''}`,
    };

    const inMutation: StockMutation = {
      id: `mut_${Date.now()}_in`,
      date: new Date().toISOString(),
      productId,
      productName: prod.name,
      outletId: toOutletId,
      outletName: toName,
      type: 'TRANSFER_IN',
      quantityChange: quantity,
      previousStock: prod.stocks[toOutletId] || 0,
      newStock: (prod.stocks[toOutletId] || 0) + quantity,
      actorName: user.name,
      notes: `Diterima dari ${fromName}. ${notes || ''}`,
    };

    setStockMutations((prev) => [inMutation, outMutation, ...prev]);
    addAuditLog('TRANSFER_STOCK', 'INVENTORY', `Transfer ${quantity} ${prod.unit} ${prod.name} dari ${fromName} ke ${toName}`);
    showToast('success', `Transfer ${quantity} ${prod.name} ke ${toName} berhasil!`);
  };

  const submitStockOpname = (opnameData: Omit<StockOpname, 'id'>) => {
    const id = `opn_${Date.now()}`;
    const newOpname: StockOpname = { ...opnameData, id };
    setStockOpnames((prev) => [newOpname, ...prev]);

    // Apply physical count to products
    opnameData.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            return {
              ...p,
              stocks: {
                ...p.stocks,
                [opnameData.outletId]: item.physicalStock,
              },
            };
          }
          return p;
        })
      );
    });

    addAuditLog('STOCK_OPNAME', 'INVENTORY', `Stock Opname ${newOpname.outletName}: Selisih biaya ${newOpname.totalDiscrepancyCost}`);
    showToast('success', 'Audit Stock Opname berhasil disimpan dan stok disinkronkan!');
  };

  // Transactions
  const addTransaction = (trxData: Omit<Transaction, 'id'>): Transaction => {
    const id = `trx_${Date.now()}`;
    const newTrx: Transaction = { ...trxData, id };
    setTransactions((prev) => [newTrx, ...prev]);

    // Deduct stock for each cart item
    newTrx.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            const current = p.stocks[newTrx.outletId] || 0;
            return {
              ...p,
              stocks: {
                ...p.stocks,
                [newTrx.outletId]: Math.max(0, current - item.quantity),
              },
            };
          }
          return p;
        })
      );
    });

    // Update customer points & visits if customer selected
    if (newTrx.customerId) {
      const earnedPoints = Math.floor(newTrx.total / (settings.pointsPerRupiah || 10000));
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newTrx.customerId) {
            const newSpent = c.totalSpent + newTrx.total;
            let tier: Customer['tier'] = 'BRONZE';
            if (newSpent >= 4000000) tier = 'PLATINUM';
            else if (newSpent >= 2000000) tier = 'GOLD';
            else if (newSpent >= 800000) tier = 'SILVER';

            return {
              ...c,
              points: c.points + earnedPoints,
              totalSpent: newSpent,
              totalVisits: c.totalVisits + 1,
              tier,
              lastVisit: new Date().toISOString(),
              debtBalance:
                newTrx.payment.method === 'HUTANG_KASBON'
                  ? c.debtBalance + newTrx.total
                  : c.debtBalance,
            };
          }
          return c;
        })
      );
    }

    // Update current shift totals
    setShifts((prev) =>
      prev.map((s) => {
        if (s.status === 'OPEN' && s.outletId === newTrx.outletId) {
          const isCash = newTrx.payment.method === 'CASH';
          return {
            ...s,
            totalSales: s.totalSales + newTrx.total,
            totalCashSales: isCash ? s.totalCashSales + newTrx.total : s.totalCashSales,
            totalNonCashSales: !isCash ? s.totalNonCashSales + newTrx.total : s.totalNonCashSales,
          };
        }
        return s;
      })
    );

    addAuditLog('TRANSACTION', 'POS', `Transaksi ${newTrx.invoiceNumber} senilai ${newTrx.total} (${newTrx.payment.method})`);
    return newTrx;
  };

  const refundTransaction = (id: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'REFUNDED', notes: reason };
        }
        return t;
      })
    );
    addAuditLog('REFUND_TRANSACTION', 'POS', `Refund transaksi ID ${id}: ${reason}`);
    showToast('info', 'Transaksi berhasil di-refund.');
  };

  const voidTransaction = (id: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, status: 'VOIDED', notes: reason };
        }
        return t;
      })
    );
    addAuditLog('VOID_TRANSACTION', 'POS', `Void transaksi ID ${id}: ${reason}`);
    showToast('warning', 'Transaksi telah di-void / dibatalkan.');
  };

  // Shifts
  const currentShift = shifts.find((s) => s.status === 'OPEN' && s.outletId === activeOutlet.id) || null;

  const openShift = (startingCash: number, notes?: string) => {
    const newShift: Shift = {
      id: `shf_${Date.now()}`,
      cashierId: user.id,
      cashierName: user.name,
      outletId: activeOutlet.id,
      startTime: new Date().toISOString(),
      startingCash,
      totalCashSales: 0,
      totalNonCashSales: 0,
      totalSales: 0,
      cashInExpenses: 0,
      cashOutExpenses: 0,
      status: 'OPEN',
      notes,
    };
    setShifts((prev) => [newShift, ...prev]);
    addAuditLog('OPEN_SHIFT', 'SHIFTS', `Membuka shift kasir modal awal Rp ${startingCash}`);
    showToast('success', `Shift kasir berhasil dibuka dengan modal Rp ${startingCash.toLocaleString('id-ID')}`);
  };

  const closeShift = (actualEndingCash: number, notes?: string) => {
    if (!currentShift) return;
    const expectedEndingCash =
      currentShift.startingCash +
      currentShift.totalCashSales +
      currentShift.cashInExpenses -
      currentShift.cashOutExpenses;

    const cashDifference = actualEndingCash - expectedEndingCash;

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === currentShift.id) {
          return {
            ...s,
            endTime: new Date().toISOString(),
            expectedEndingCash,
            actualEndingCash,
            cashDifference,
            status: 'CLOSED',
            notes: notes || s.notes,
          };
        }
        return s;
      })
    );

    addAuditLog(
      'CLOSE_SHIFT',
      'SHIFTS',
      `Tutup shift: Fisik Rp ${actualEndingCash}, Sistem Rp ${expectedEndingCash}, Selisih Rp ${cashDifference}`
    );
    showToast('success', 'Shift kasir berhasil ditutup dan laporan dicatat!');
  };

  const startShift = openShift;
  const endShift = closeShift;

  const recordCashMovement = (type: 'IN' | 'OUT', amount: number, reason: string) => {
    if (!currentShift) {
      showToast('error', 'Tidak ada shift kasir yang sedang aktif!');
      return;
    }

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === currentShift.id) {
          return {
            ...s,
            cashInExpenses: type === 'IN' ? (s.cashInExpenses || 0) + amount : s.cashInExpenses,
            cashOutExpenses: type === 'OUT' ? (s.cashOutExpenses || 0) + amount : s.cashOutExpenses,
          };
        }
        return s;
      })
    );

    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      shiftId: currentShift.id,
      outletId: activeOutlet.id,
      category: type === 'OUT' ? 'OPERASIONAL' : 'LAINNYA',
      amount,
      description: `[Petty Cash ${type === 'IN' ? 'Masuk' : 'Keluar'}] ${reason}`,
      date: new Date().toISOString(),
      actorName: user.name,
    };
    setExpenses((prev) => [newExp, ...prev]);

    addAuditLog('CASH_MOVEMENT', 'SHIFTS', `Kas ${type === 'IN' ? 'Masuk' : 'Keluar'} Rp ${amount}: ${reason}`);
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'shiftId' | 'date' | 'actorName'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp_${Date.now()}`,
      shiftId: currentShift?.id,
      date: new Date().toISOString(),
      actorName: user.name,
    };
    setExpenses((prev) => [newExp, ...prev]);

    // deduct from shift cash
    if (currentShift) {
      setShifts((prev) =>
        prev.map((s) => {
          if (s.id === currentShift.id) {
            return {
              ...s,
              cashOutExpenses: s.cashOutExpenses + newExp.amount,
            };
          }
          return s;
        })
      );
    }

    addAuditLog('EXPENSE', 'FINANCE', `Pengeluaran kas Rp ${newExp.amount} (${newExp.description})`);
    showToast('info', `Pengeluaran Rp ${newExp.amount.toLocaleString('id-ID')} dicatat`);
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'points' | 'totalSpent' | 'totalVisits' | 'debtBalance'>) => {
    const id = `cust_${Date.now()}`;
    const newCust: Customer = {
      ...custData,
      id,
      points: 0,
      totalSpent: 0,
      totalVisits: 0,
      debtBalance: 0,
      lastVisit: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog('CREATE_CUSTOMER', 'CRM', `Mendaftarkan member baru: ${newCust.name} (${newCust.phone})`);
    showToast('success', `Member ${newCust.name} berhasil didaftarkan!`);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    showToast('success', 'Data pelanggan berhasil diperbarui!');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Data pelanggan telah dihapus.');
  };

  const payCustomerDebt = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDebt = Math.max(0, c.debtBalance - amount);
          return { ...c, debtBalance: newDebt };
        }
        return c;
      })
    );
    addAuditLog('PAY_DEBT', 'CRM', `Pelunasan kasbon member ${customerId} sebesar Rp ${amount}`);
    showToast('success', `Pelunasan hutang/kasbon Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`);
  };

  // Outlets CRUD
  const addOutlet = (outletData: Omit<Outlet, 'id'>) => {
    const newOutlet: Outlet = {
      ...outletData,
      id: `out_${Date.now()}`,
    };
    setOutlets((prev) => [...prev, newOutlet]);
    addAuditLog('CREATE_OUTLET', 'OUTLET', `Tambah cabang baru: ${newOutlet.name} (${newOutlet.code})`);
    showToast('success', `Cabang ${newOutlet.name} berhasil ditambahkan!`);
  };

  const updateOutlet = (id: string, data: Partial<Outlet>) => {
    setOutlets((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...data };
          if (activeOutlet.id === id) {
            setActiveOutlet(updated);
          }
          return updated;
        }
        return o;
      })
    );
    addAuditLog('UPDATE_OUTLET', 'OUTLET', `Perbarui informasi cabang ID: ${id}`);
    showToast('success', 'Data cabang outlet berhasil diperbarui!');
  };

  const deleteOutlet = (id: string) => {
    if (outlets.length <= 1) {
      showToast('error', 'Tidak dapat menghapus cabang terakhir!');
      return;
    }
    const remaining = outlets.filter((o) => o.id !== id);
    setOutlets(remaining);
    if (activeOutlet.id === id) {
      setActiveOutlet(remaining[0]);
    }
    addAuditLog('DELETE_OUTLET', 'OUTLET', `Menghapus cabang ID: ${id}`);
    showToast('info', 'Cabang outlet telah dihapus.');
  };

  // Users / Employees CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('CREATE_USER', 'USERS', `Tambah user/karyawan: ${newUser.name} (${newUser.role})`);
    showToast('success', `Akun ${newUser.name} berhasil ditambahkan!`);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...data };
          if (user.id === id) {
            setUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    showToast('success', 'Data pengguna berhasil diperbarui!');
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      showToast('error', 'Tidak dapat menghapus user utama!');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('info', 'Pengguna telah dihapus.');
  };

  // Category CRUD
  const updateCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    showToast('success', `Kategori berhasil diubah menjadi "${name}"`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Kategori produk dihapus.');
  };

  // Suppliers & PO
  const addSupplier = (supData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supData, id: `sup_${Date.now()}` };
    setSuppliers((prev) => [...prev, newSup]);
    showToast('success', `Supplier ${newSup.name} ditambahkan!`);
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    showToast('success', 'Data supplier berhasil diperbarui!');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast('info', 'Supplier berhasil dihapus.');
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      poNumber,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog('CREATE_PO', 'PURCHASES', `Buat Purchase Order ${poNumber} total Rp ${newPO.totalAmount}`);
    showToast('success', `PO ${poNumber} berhasil dibuat!`);
  };

  const receivePurchaseOrder = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po || po.status === 'RECEIVED') return;

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'RECEIVED' } : p))
    );

    // Increase product stock
    po.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id === item.productId) {
            const currentStock = prod.stocks[po.outletId] || 0;
            return {
              ...prod,
              stocks: {
                ...prod.stocks,
                [po.outletId]: currentStock + item.quantity,
              },
            };
          }
          return prod;
        })
      );
    });

    addAuditLog('RECEIVE_PO', 'PURCHASES', `Penerimaan barang PO ${po.poNumber}`);
    showToast('success', `Barang PO ${po.poNumber} berhasil diterima dan stok ditambahkan!`);
  };

  // Promotions
  const addPromotion = (prmData: Omit<Promotion, 'id' | 'usageCount'>) => {
    const newPromo: Promotion = { ...prmData, id: `prm_${Date.now()}`, usageCount: 0 };
    setPromotions((prev) => [...prev, newPromo]);
    showToast('success', `Promo voucher ${newPromo.code} berhasil dibuat!`);
  };

  const updatePromotion = (id: string, data: Partial<Promotion>) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
    showToast('success', 'Data promo voucher diperbarui!');
  };

  const deletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Promo voucher telah dihapus.');
  };

  const togglePromotion = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'SETTINGS', 'Mengubah pengaturan toko & struk');
    showToast('success', 'Pengaturan toko berhasil disimpan!');
  };

  // JSON Database Backup & Restore
  const backupDatabaseJSON = () => {
    const fullDb = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      developer: 'SFG',
      app: 'KasirKu POS & ERP UMKM',
      users,
      outlets,
      products,
      categories,
      customers,
      suppliers,
      purchaseOrders,
      promotions,
      transactions,
      shifts,
      expenses,
      settings,
      stockOpnames,
      stockMutations,
      auditLogs,
    };
    return JSON.stringify(fullDb, null, 2);
  };

  const restoreDatabaseJSON = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.outlets && Array.isArray(data.outlets)) setOutlets(data.outlets);
      if (data.users && Array.isArray(data.users)) setUsers(data.users);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.suppliers && Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (data.promotions && Array.isArray(data.promotions)) setPromotions(data.promotions);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.shifts && Array.isArray(data.shifts)) setShifts(data.shifts);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.settings) setSettings(data.settings);
      showToast('success', 'Database berhasil dipulihkan dari cadangan JSON!');
      return true;
    } catch {
      showToast('error', 'Format file cadangan JSON tidak valid!');
      return false;
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setUser(INITIAL_USERS[0]);
    setOutlets(INITIAL_OUTLETS);
    setActiveOutlet(INITIAL_OUTLETS[0]);
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setPromotions(INITIAL_PROMOTIONS);
    setTransactions(INITIAL_TRANSACTIONS);
    setShifts(INITIAL_SHIFTS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStockOpnames([]);
    setStockMutations([]);
    showToast('info', 'Data toko berhasil di-reset ke nilai awal default!');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        user,
        users,
        employees: users,
        loginAs,
        addUser,
        updateUser,
        deleteUser,
        addEmployee: addUser,
        updateEmployee: updateUser,
        deleteEmployee: deleteUser,
        outlets,
        activeOutlet,
        setActiveOutlet,
        addOutlet,
        updateOutlet,
        deleteOutlet,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProductStock,
        transferStock,
        stockOpnames,
        submitStockOpname,
        stockMutations,
        transactions,
        addTransaction,
        refundTransaction,
        voidTransaction,
        currentShift,
        shifts,
        openShift,
        startShift,
        closeShift,
        endShift,
        recordCashMovement,
        expenses,
        addExpense,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        payCustomerDebt,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        purchaseOrders,
        createPurchaseOrder,
        receivePurchaseOrder,
        promotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
        togglePromotion,
        settings,
        updateSettings,
        auditLogs,
        addAuditLog,
        backupDatabaseJSON,
        restoreDatabaseJSON,
        soundEnabled,
        toggleSound,
        darkMode,
        toggleDarkMode,
        toasts,
        showToast,
        removeToast,
        resetAllData,
        resetToInitialData: resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
