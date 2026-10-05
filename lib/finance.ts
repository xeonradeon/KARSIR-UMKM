import Decimal from 'decimal.js';
import { CartItem, DiscountType, Voucher } from '@/types';

// Strict decimal precision configuration for financial correctness
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(value: number | string | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0);
  try {
    return new Decimal(value);
  } catch {
    return new Decimal(0);
  }
}

/**
 * Format number to Indonesian Rupiah currency string
 * Example: 25000 -> "Rp 25.000"
 */
export function formatRupiah(value: number | string | Decimal | null | undefined): string {
  const dec = toDecimal(value);
  const num = Math.round(dec.toNumber());
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Format decimal/number with Indonesian thousand separators without Rp prefix
 * Example: 25000 -> "25.000"
 */
export function formatNumber(value: number | string | Decimal | null | undefined): string {
  const dec = toDecimal(value);
  const num = Math.round(dec.toNumber());
  return num.toLocaleString('id-ID');
}

/**
 * Calculate Gross Profit & Margin
 * Profit = Total Revenue (excl. Tax) - Cost of Goods Sold (COGS)
 * Margin % = (Gross Profit / Total Revenue excl. Tax) * 100
 */
export function calculateProfitAndMargin(
  revenue: number | string | Decimal,
  cogs: number | string | Decimal
): { profit: number; marginPercent: number } {
  const revDec = toDecimal(revenue);
  const cogsDec = toDecimal(cogs);
  const profitDec = revDec.minus(cogsDec);

  let marginPercent = 0;
  if (revDec.greaterThan(0)) {
    marginPercent = profitDec.dividedBy(revDec).times(100).toDecimalPlaces(2).toNumber();
  }

  return {
    profit: profitDec.toNumber(),
    marginPercent: Math.max(0, marginPercent),
  };
}

/**
 * Calculate cart item subtotal and profit
 */
export function calculateCartItemTotals(
  item: Omit<CartItem, 'subtotal'>,
  priceType: 'NORMAL' | 'WHOLESALE' | 'MEMBER' = 'NORMAL'
): { appliedPrice: number; subtotal: number; profit: number } {
  let appliedPrice = item.unitPrice;
  if (priceType === 'WHOLESALE' && item.appliedPrice) {
    appliedPrice = item.appliedPrice;
  } else if (priceType === 'MEMBER' && item.appliedPrice) {
    appliedPrice = item.appliedPrice;
  }

  const priceDec = toDecimal(appliedPrice);
  const qtyDec = toDecimal(item.quantity);
  const discountDec = toDecimal(item.discount || 0);
  const costDec = toDecimal(item.unitCost || 0);

  const rawSubtotal = priceDec.times(qtyDec);
  const finalSubtotal = Decimal.max(0, rawSubtotal.minus(discountDec));
  const totalCost = costDec.times(qtyDec);
  const profit = finalSubtotal.minus(totalCost);

  return {
    appliedPrice: priceDec.toNumber(),
    subtotal: finalSubtotal.toNumber(),
    profit: profit.toNumber(),
  };
}

export interface CheckoutCalculationInput {
  items: CartItem[];
  orderDiscountType?: DiscountType;
  orderDiscountValue?: number; // e.g. 10 (%) or 20000 (Rp)
  voucher?: Voucher | null;
  taxRate?: number; // 0.11
  taxEnabled?: boolean;
  pointsRedeemed?: number; // Points to redeem
  pointRedeemRate?: number; // 1 point = Rp 100
}

export interface CheckoutCalculationResult {
  subtotal: number;
  itemDiscountTotal: number;
  orderDiscountTotal: number;
  voucherDiscount: number;
  pointsDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
}

/**
 * Comprehensive server-grade financial checkout calculator
 */
export function calculateCheckout(input: CheckoutCalculationInput): CheckoutCalculationResult {
  let subtotalDec = new Decimal(0);
  let itemDiscountTotalDec = new Decimal(0);
  let totalCostDec = new Decimal(0);

  for (const item of input.items) {
    const qty = toDecimal(item.quantity);
    const unitPrice = toDecimal(item.appliedPrice || item.unitPrice);
    const cost = toDecimal(item.unitCost || 0);
    const itemDisc = toDecimal(item.discount || 0);

    const lineTotal = unitPrice.times(qty);
    subtotalDec = subtotalDec.plus(lineTotal);
    itemDiscountTotalDec = itemDiscountTotalDec.plus(itemDisc);
    totalCostDec = totalCostDec.plus(cost.times(qty));
  }

  const netItemsTotal = Decimal.max(0, subtotalDec.minus(itemDiscountTotalDec));

  // Order-level discount
  let orderDiscountDec = new Decimal(0);
  if (input.orderDiscountValue && input.orderDiscountValue > 0) {
    if (input.orderDiscountType === 'PERCENTAGE') {
      const pct = toDecimal(input.orderDiscountValue).dividedBy(100);
      orderDiscountDec = netItemsTotal.times(pct).toDecimalPlaces(0);
    } else {
      orderDiscountDec = Decimal.min(netItemsTotal, toDecimal(input.orderDiscountValue));
    }
  }

  // Voucher discount
  let voucherDiscountDec = new Decimal(0);
  if (input.voucher && input.voucher.isActive) {
    const voucher = input.voucher;
    const minSpend = toDecimal(voucher.minSpend || 0);
    if (netItemsTotal.greaterThanOrEqualTo(minSpend)) {
      if (voucher.discountType === 'PERCENTAGE') {
        const pct = toDecimal(voucher.discountValue).dividedBy(100);
        let calcDisc = netItemsTotal.times(pct);
        if (voucher.maxDiscount && voucher.maxDiscount > 0) {
          calcDisc = Decimal.min(calcDisc, toDecimal(voucher.maxDiscount));
        }
        voucherDiscountDec = calcDisc.toDecimalPlaces(0);
      } else {
        voucherDiscountDec = Decimal.min(netItemsTotal, toDecimal(voucher.discountValue));
      }
    }
  }

  // Points redemption discount
  let pointsDiscountDec = new Decimal(0);
  if (input.pointsRedeemed && input.pointsRedeemed > 0) {
    const rate = toDecimal(input.pointRedeemRate || 100);
    const potentialDiscount = toDecimal(input.pointsRedeemed).times(rate);
    const currentRemaining = Decimal.max(
      0,
      netItemsTotal.minus(orderDiscountDec).minus(voucherDiscountDec)
    );
    pointsDiscountDec = Decimal.min(currentRemaining, potentialDiscount);
  }

  const taxableAmountDec = Decimal.max(
    0,
    netItemsTotal.minus(orderDiscountDec).minus(voucherDiscountDec).minus(pointsDiscountDec)
  );

  // Tax calculation
  let taxAmountDec = new Decimal(0);
  const taxRate = input.taxRate !== undefined ? input.taxRate : 0.11;
  if (input.taxEnabled) {
    taxAmountDec = taxableAmountDec.times(toDecimal(taxRate)).toDecimalPlaces(0);
  }

  const grandTotalDec = taxableAmountDec.plus(taxAmountDec);
  const grossProfitDec = taxableAmountDec.minus(totalCostDec);

  let marginPercent = 0;
  if (taxableAmountDec.greaterThan(0)) {
    marginPercent = grossProfitDec
      .dividedBy(taxableAmountDec)
      .times(100)
      .toDecimalPlaces(2)
      .toNumber();
  }

  return {
    subtotal: subtotalDec.toNumber(),
    itemDiscountTotal: itemDiscountTotalDec.toNumber(),
    orderDiscountTotal: orderDiscountDec.toNumber(),
    voucherDiscount: voucherDiscountDec.toNumber(),
    pointsDiscount: pointsDiscountDec.toNumber(),
    taxableAmount: taxableAmountDec.toNumber(),
    taxAmount: taxAmountDec.toNumber(),
    grandTotal: grandTotalDec.toNumber(),
    totalCost: totalCostDec.toNumber(),
    grossProfit: grossProfitDec.toNumber(),
    marginPercent: Math.max(0, marginPercent),
  };
}

/**
 * Calculate loyalty points earned for a purchase
 */
export function calculateLoyaltyPointsEarned(
  taxableAmount: number,
  pointsPerUnit: number = 10000
): number {
  if (taxableAmount <= 0 || pointsPerUnit <= 0) return 0;
  return Math.floor(taxableAmount / pointsPerUnit);
}
