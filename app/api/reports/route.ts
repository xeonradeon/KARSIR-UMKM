import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';
import { calculateProfitAndMargin } from '@/lib/finance';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId') || undefined;
  const range = searchParams.get('range') || '7d'; // 'today', '7d', '30d', 'all', 'custom'
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const now = new Date();
  let startTime = 0;
  let endTime = now.getTime();

  if (range === 'today') {
    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  } else if (range === '7d') {
    startTime = now.getTime() - 7 * 24 * 3600 * 1000;
  } else if (range === '30d') {
    startTime = now.getTime() - 30 * 24 * 3600 * 1000;
  } else if (range === 'custom' && startDateParam) {
    startTime = new Date(startDateParam).getTime();
    if (endDateParam) endTime = new Date(endDateParam).getTime() + 24 * 3600 * 1000;
  }

  const allTransactions = db.getTransactions({ outletId }).filter((t) => t.status === 'COMPLETED');
  const filteredTx = allTransactions.filter((t) => {
    const time = new Date(t.createdAt).getTime();
    return time >= startTime && time <= endTime;
  });

  // Summary Metrics
  const totalRevenue = filteredTx.reduce((sum, t) => sum + t.grandTotal, 0);
  const totalCogs = filteredTx.reduce((sum, t) => sum + t.totalCost, 0);
  const totalTax = filteredTx.reduce((sum, t) => sum + t.taxAmount, 0);
  const totalDiscount = filteredTx.reduce(
    (sum, t) => sum + t.itemDiscountTotal + t.orderDiscountTotal + t.voucherDiscount + t.pointsDiscount,
    0
  );
  const netRevenue = totalRevenue - totalTax;
  const { profit: grossProfit, marginPercent: grossMargin } = calculateProfitAndMargin(netRevenue, totalCogs);

  const totalTransactions = filteredTx.length;
  const totalItemsSold = filteredTx.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const averageBasketValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  // Payment Breakdown
  const paymentMap: Record<string, { method: string; count: number; total: number }> = {};
  for (const t of filteredTx) {
    for (const p of t.payments) {
      if (!paymentMap[p.method]) {
        paymentMap[p.method] = { method: p.method, count: 0, total: 0 };
      }
      paymentMap[p.method].count += 1;
      paymentMap[p.method].total += p.amount;
    }
  }

  // Cashier Breakdown
  const cashierMap: Record<
    string,
    { cashierId: string; cashierName: string; transactions: number; revenue: number }
  > = {};
  for (const t of filteredTx) {
    if (!cashierMap[t.cashierId]) {
      cashierMap[t.cashierId] = {
        cashierId: t.cashierId,
        cashierName: t.cashierName || 'Kasir',
        transactions: 0,
        revenue: 0,
      };
    }
    cashierMap[t.cashierId].transactions += 1;
    cashierMap[t.cashierId].revenue += t.grandTotal;
  }

  // Product Performance Breakdown
  const productMap: Record<
    string,
    {
      productId: string;
      productName: string;
      sku: string;
      unitsSold: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }
  > = {};

  for (const t of filteredTx) {
    for (const item of t.items) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          unitsSold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };
      }
      const p = productMap[item.productId];
      p.unitsSold += item.quantity;
      p.revenue += item.subtotal;
      const lineCost = item.unitCost * item.quantity;
      p.cost += lineCost;
      p.profit += item.subtotal - lineCost;
    }
  }

  const productList = Object.values(productMap).map((p) => ({
    ...p,
    margin: p.revenue > 0 ? Math.round(((p.profit / p.revenue) * 100) * 10) / 10 : 0,
  }));

  const bestSellers = [...productList].sort((a, b) => b.unitsSold - a.unitsSold);
  const mostProfitable = [...productList].sort((a, b) => b.profit - a.profit);

  // Time-series Chart Data (Daily breakdown)
  const daysCount = Math.max(1, Math.min(30, Math.ceil((endTime - startTime) / (24 * 3600 * 1000))));
  const chartData: { date: string; revenue: number; profit: number; cogs: number; transactions: number }[] = [];

  for (let i = 0; i < daysCount; i++) {
    const curStart = startTime + i * 24 * 3600 * 1000;
    const curEnd = curStart + 24 * 3600 * 1000;
    const curDate = new Date(curStart);
    const dateLabel = `${curDate.getDate()}/${curDate.getMonth() + 1}`;

    const dayTx = filteredTx.filter((t) => {
      const time = new Date(t.createdAt).getTime();
      return time >= curStart && time < curEnd;
    });

    const dayRev = dayTx.reduce((s, t) => s + t.grandTotal, 0);
    const dayProf = dayTx.reduce((s, t) => s + t.grossProfit, 0);
    const dayCogs = dayTx.reduce((s, t) => s + t.totalCost, 0);

    chartData.push({
      date: dateLabel,
      revenue: dayRev,
      profit: dayProf,
      cogs: dayCogs,
      transactions: dayTx.length,
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalCogs,
        grossProfit,
        grossMargin,
        totalTax,
        totalDiscount,
        totalTransactions,
        totalItemsSold,
        averageBasketValue,
      },
      chartData,
      payments: Object.values(paymentMap),
      cashiers: Object.values(cashierMap),
      bestSellers: bestSellers.slice(0, 10),
      mostProfitable: mostProfitable.slice(0, 10),
    },
  });
}
