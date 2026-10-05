import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, Customer, HeldOrder, Product, ProductVariant, Promotion } from '@/types';
import { useApp } from '@/context/AppContext';
import { playSound } from '@/utils/formatters';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  updateItemDiscount: (itemId: string, discountType?: 'percent' | 'fixed', discountValue?: number) => void;
  clearCart: () => void;

  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;

  appliedPromotion: Promotion | null;
  applyPromotion: (code: string) => boolean;
  removePromotion: () => void;

  customDiscount: { type: 'percent' | 'fixed'; value: number };
  setCustomDiscount: (disc: { type: 'percent' | 'fixed'; value: number }) => void;

  // Held Orders
  heldOrders: HeldOrder[];
  holdCurrentOrder: (note?: string) => void;
  restoreHeldOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;

  // Totals
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceFeeTotal: number;
  grandTotal: number;
  totalCost: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOutlet, promotions, settings, soundEnabled, showToast } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [customDiscount, setCustomDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({
    type: 'percent',
    value: 0,
  });
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const itemPrice = variant ? variant.price : product.price;
    const itemSku = variant ? variant.sku : product.sku;
    const uniqueKey = variant ? `${product.id}_${variant.id}` : product.id;

    // Check available stock
    const currentStock = product.stocks[activeOutlet.id] || 0;
    const existingItem = cart.find((i) => i.id === uniqueKey);
    const requestedQty = (existingItem?.quantity || 0) + quantity;

    if (currentStock <= 0) {
      showToast('warning', `Stok ${product.name} habis di outlet ini!`);
    }

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === uniqueKey);
      if (idx >= 0) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + quantity;
        updated[idx] = {
          ...updated[idx],
          quantity: newQty,
          subtotal: newQty * itemPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: uniqueKey,
          productId: product.id,
          productName: product.name,
          sku: itemSku,
          price: itemPrice,
          costPrice: product.costPrice,
          quantity,
          unit: product.unit,
          selectedVariant: variant,
          subtotal: quantity * itemPrice,
        };
        return [...prev, newItem];
      }
    });

    if (soundEnabled) playSound('beep');
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: qty,
              subtotal: qty * item.price,
            }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const updateItemDiscount = (
    itemId: string,
    discountType?: 'percent' | 'fixed',
    discountValue?: number
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let itemSub = item.quantity * item.price;
          if (discountType === 'percent' && discountValue) {
            itemSub -= (itemSub * discountValue) / 100;
          } else if (discountType === 'fixed' && discountValue) {
            itemSub = Math.max(0, itemSub - discountValue);
          }
          return {
            ...item,
            discountType,
            discountValue,
            subtotal: itemSub,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setTableNumber('');
    setOrderNotes('');
    setAppliedPromotion(null);
    setCustomDiscount({ type: 'percent', value: 0 });
  };

  const applyPromotion = (code: string): boolean => {
    const promo = promotions.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );
    if (!promo) {
      showToast('error', 'Kode voucher tidak valid atau sudah kedaluwarsa!');
      return false;
    }
    if (subtotal < promo.minPurchase) {
      showToast('warning', `Minimal belanja untuk voucher ini adalah Rp ${promo.minPurchase.toLocaleString('id-ID')}`);
      return false;
    }
    setAppliedPromotion(promo);
    showToast('success', `Voucher ${promo.name} berhasil dipasang!`);
    return true;
  };

  const removePromotion = () => {
    setAppliedPromotion(null);
  };

  // Held Orders
  const holdCurrentOrder = (note?: string) => {
    if (cart.length === 0) {
      showToast('warning', 'Keranjang belanja masih kosong!');
      return;
    }
    const orderNumber = `HOLD-${String(heldOrders.length + 1).padStart(3, '0')}`;
    const newHold: HeldOrder = {
      id: `hold_${Date.now()}`,
      orderNumber,
      customerName: selectedCustomer?.name,
      tableNumber,
      items: [...cart],
      createdAt: new Date().toISOString(),
      note: note || orderNotes,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    showToast('info', `Pesanan ${orderNumber} berhasil diparkir/disimpan.`);
  };

  const restoreHeldOrder = (orderId: string) => {
    const hold = heldOrders.find((h) => h.id === orderId);
    if (!hold) return;
    setCart(hold.items);
    setTableNumber(hold.tableNumber || '');
    setOrderNotes(hold.note || '');
    setHeldOrders((prev) => prev.filter((h) => h.id !== orderId));
    showToast('success', `Pesanan ${hold.orderNumber} dibuka kembali.`);
  };

  const deleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== orderId));
    showToast('info', 'Pesanan parkir telah dihapus.');
  };

  // Calculations
  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const rawSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [cart]);

  const totalCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  }, [cart]);

  const discountTotal = useMemo(() => {
    let disc = 0;
    // 1. Promo code
    if (appliedPromotion) {
      if (appliedPromotion.type === 'PERCENTAGE') {
        const calculated = (rawSubtotal * appliedPromotion.value) / 100;
        disc += appliedPromotion.maxDiscount
          ? Math.min(calculated, appliedPromotion.maxDiscount)
          : calculated;
      } else if (appliedPromotion.type === 'FIXED_AMOUNT') {
        disc += appliedPromotion.value;
      }
    }
    // 2. Custom discount
    if (customDiscount.value > 0) {
      if (customDiscount.type === 'percent') {
        disc += (rawSubtotal * customDiscount.value) / 100;
      } else {
        disc += customDiscount.value;
      }
    }
    return Math.min(rawSubtotal, disc);
  }, [rawSubtotal, appliedPromotion, customDiscount]);

  const subtotal = rawSubtotal;
  const taxableAmount = Math.max(0, subtotal - discountTotal);

  const taxTotal = useMemo(() => {
    if (!settings.taxEnabled) return 0;
    return Math.round(taxableAmount * (activeOutlet.taxRate || settings.taxRate || 0.11));
  }, [taxableAmount, settings.taxEnabled, settings.taxRate, activeOutlet.taxRate]);

  const serviceFeeTotal = useMemo(() => {
    if (!settings.serviceFeeEnabled) return 0;
    return Math.round(taxableAmount * (activeOutlet.serviceFeeRate || settings.serviceFeeRate || 0.05));
  }, [taxableAmount, settings.serviceFeeEnabled, settings.serviceFeeRate, activeOutlet.serviceFeeRate]);

  const grandTotal = Math.max(0, taxableAmount + taxTotal + serviceFeeTotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        updateItemNotes,
        updateItemDiscount,
        clearCart,
        selectedCustomer,
        setSelectedCustomer,
        tableNumber,
        setTableNumber,
        orderNotes,
        setOrderNotes,
        appliedPromotion,
        applyPromotion,
        removePromotion,
        customDiscount,
        setCustomDiscount,
        heldOrders,
        holdCurrentOrder,
        restoreHeldOrder,
        deleteHeldOrder,
        itemCount,
        subtotal,
        discountTotal,
        taxTotal,
        serviceFeeTotal,
        grandTotal,
        totalCost,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
