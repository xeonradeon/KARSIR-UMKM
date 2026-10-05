'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Customer, Voucher, DiscountType } from '@/types';
import { calculateCartItemTotals, calculateCheckout, CheckoutCalculationResult } from '@/lib/finance';
import { useApp } from './AppContext';
import { playAddCartSound } from '@/lib/audio';

interface CartContextType {
  items: CartItem[];
  customer: Customer | null;
  voucher: Voucher | null;
  orderDiscountType: DiscountType;
  orderDiscountValue: number;
  pointsRedeemed: number;
  notes: string;
  totals: CheckoutCalculationResult;
  isCartDrawerOpen: boolean;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateItemDiscount: (productId: string, variantId: string | null, discountAmount: number) => void;
  updateItemNote: (productId: string, variantId: string | null, notes: string) => void;
  setCustomer: (customer: Customer | null) => void;
  applyVoucher: (voucher: Voucher | null) => void;
  setOrderDiscount: (type: DiscountType, value: number) => void;
  setPointsRedeemed: (points: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pos_umkm_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { business, settings, soundEnabled, showToast } = useApp();

  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [orderDiscountType, setOrderDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [orderDiscountValue, setOrderDiscountValue] = useState<number>(0);
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Restore cart on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items);
          if (parsed.customer) setCustomer(parsed.customer);
          if (parsed.voucher) setVoucher(parsed.voucher);
          if (parsed.notes) setNotes(parsed.notes);
        }
      }
    } catch {}
  }, []);

  // Persist cart to localStorage for recovery
  useEffect(() => {
    try {
      if (items.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify({ items, customer, voucher, notes })
        );
      }
    } catch {}
  }, [items, customer, voucher, notes]);

  // Recalculate price types when customer changes (Member price check)
  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        let appliedPrice = item.unitPrice;
        let priceType: 'NORMAL' | 'WHOLESALE' | 'MEMBER' = 'NORMAL';

        // Check wholesale
        const isWholesale =
          item.appliedPrice &&
          item.priceType === 'WHOLESALE' &&
          item.quantity >= 5; // wholesale threshold

        if (customer && !isWholesale) {
          // If customer has member price available
          priceType = 'NORMAL';
        }

        const totals = calculateCartItemTotals(item, priceType);
        return {
          ...item,
          appliedPrice: totals.appliedPrice,
          subtotal: totals.subtotal,
        };
      })
    );
  }, [customer]);

  const addItem = (product: Product, variant?: ProductVariant | null, qtyToAdd = 1) => {
    const targetVariantId = variant?.id || null;
    const baseSellingPrice = variant ? variant.sellingPrice : product.sellingPrice;
    const costPrice = variant?.costPrice !== undefined && variant?.costPrice !== null ? variant.costPrice : product.costPrice;
    const maxStock = variant ? variant.stock : product.stock || 999;

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product.id && i.variantId === targetVariantId
      );

      let newItems = [...prev];

      if (existingIdx > -1) {
        const current = newItems[existingIdx];
        const newQty = current.quantity + qtyToAdd;

        if (newQty > maxStock && maxStock > 0) {
          showToast('warning', `Stok ${product.name} hanya tersisa ${maxStock}.`);
          return prev;
        }

        // Check wholesale condition
        let appliedPrice = baseSellingPrice;
        let priceType: 'NORMAL' | 'WHOLESALE' | 'MEMBER' = 'NORMAL';

        if (
          product.wholesalePrice &&
          product.wholesaleMinQty &&
          newQty >= product.wholesaleMinQty
        ) {
          appliedPrice = product.wholesalePrice;
          priceType = 'WHOLESALE';
        } else if (customer && product.memberPrice) {
          appliedPrice = product.memberPrice;
          priceType = 'MEMBER';
        }

        const { subtotal } = calculateCartItemTotals({
          ...current,
          quantity: newQty,
          appliedPrice,
          unitPrice: baseSellingPrice,
        });

        newItems[existingIdx] = {
          ...current,
          quantity: newQty,
          appliedPrice,
          priceType,
          subtotal,
        };
      } else {
        if (qtyToAdd > maxStock && maxStock > 0) {
          showToast('warning', `Stok ${product.name} hanya tersisa ${maxStock}.`);
          return prev;
        }

        let appliedPrice = baseSellingPrice;
        let priceType: 'NORMAL' | 'WHOLESALE' | 'MEMBER' = 'NORMAL';

        if (
          product.wholesalePrice &&
          product.wholesaleMinQty &&
          qtyToAdd >= product.wholesaleMinQty
        ) {
          appliedPrice = product.wholesalePrice;
          priceType = 'WHOLESALE';
        } else if (customer && product.memberPrice) {
          appliedPrice = product.memberPrice;
          priceType = 'MEMBER';
        }

        const rawItem: Omit<CartItem, 'subtotal'> = {
          productId: product.id,
          variantId: targetVariantId,
          productName: product.name,
          variantName: variant?.name || null,
          sku: variant?.sku || product.sku,
          image: product.image || null,
          unitCost: costPrice,
          unitPrice: baseSellingPrice,
          appliedPrice,
          priceType,
          quantity: qtyToAdd,
          discount: 0,
          notes: '',
          maxStock,
        };

        const { subtotal } = calculateCartItemTotals(rawItem);
        newItems.push({ ...rawItem, subtotal });
      }

      if (soundEnabled) playAddCartSound();
      return newItems;
    });
  };

  const updateQuantity = (productId: string, variantId: string | null, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          if (quantity > item.maxStock && item.maxStock > 0) {
            showToast('warning', `Stok maksimal ${item.maxStock}.`);
            return item;
          }

          const { subtotal } = calculateCartItemTotals({
            ...item,
            quantity,
          });

          return { ...item, quantity, subtotal };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string, variantId: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const updateItemDiscount = (
    productId: string,
    variantId: string | null,
    discountAmount: number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const discount = Math.max(0, discountAmount);
          const { subtotal } = calculateCartItemTotals({
            ...item,
            discount,
          });
          return { ...item, discount, subtotal };
        }
        return item;
      })
    );
  };

  const updateItemNote = (productId: string, variantId: string | null, noteText: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, notes: noteText };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setVoucher(null);
    setOrderDiscountValue(0);
    setPointsRedeemed(0);
    setNotes('');
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const setOrderDiscount = (type: DiscountType, value: number) => {
    setOrderDiscountType(type);
    setOrderDiscountValue(Math.max(0, value));
  };

  const handleSetPointsRedeemed = (points: number) => {
    if (!customer) {
      setPointsRedeemed(0);
      return;
    }
    const maxRedeemable = Math.min(customer.points, points);
    setPointsRedeemed(Math.max(0, maxRedeemable));
  };

  // Grand Totals Computation
  const totals = calculateCheckout({
    items,
    orderDiscountType,
    orderDiscountValue,
    voucher,
    taxRate: business.taxRate,
    taxEnabled: business.taxEnabled,
    pointsRedeemed,
    pointRedeemRate: settings.loyaltyRedeemRate,
  });

  return (
    <CartContext.Provider
      value={{
        items,
        customer,
        voucher,
        orderDiscountType,
        orderDiscountValue,
        pointsRedeemed,
        notes,
        totals,
        isCartDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        updateItemDiscount,
        updateItemNote,
        setCustomer,
        applyVoucher: setVoucher,
        setOrderDiscount,
        setPointsRedeemed: handleSetPointsRedeemed,
        setNotes,
        clearCart,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
