import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CreditCard,
  QrCode,
  Banknote,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { transactions, products, activeOutlet, currentShift, setCurrentView } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month'>('today');

  // Filter transactions by outlet & time range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.status !== 'COMPLETED') return false;
      const isCurrentOutlet = t.outletId === activeOutlet.id;
      if (!isCurrentOutlet) return false;

      const trxTime = new Date(t.createdAt).getTime();
      const now = Date.now();

      if (timeRange === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return trxTime >= startOfDay.getTime();
      } else if (timeRange === '7days') {
        return trxTime >= now - 7 * 86400000;
      } else {
        return trxTime >= now - 30 * 86400000;
      }
    });
  }, [transactions, activeOutlet, timeRange]);

  // Aggregate Metrics
  const totalOmset = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [filteredTransactions]);

  const totalGrossProfit = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.grossProfit, 0);
  }, [filteredTransactions]);

  const totalTransactionsCount = filteredTransactions.length;

  const averageOrderValue = useMemo(() => {
    if (totalTransactionsCount === 0) return 0;
    return Math.round(totalOmset / totalTransactionsCount);
  }, [totalOmset, totalTransactionsCount]);

  // Best Selling Items
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.subtotal;
      });
    });

    return Object.entries(map)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      CASH: 0,
      QRIS: 0,
      DEBIT_EDC: 0,
      TRANSFER: 0,
      HUTANG_KASBON: 0,
    };

    filteredTransactions.forEach((t) => {
      map[t.payment.method] = (map[t.payment.method] || 0) + t.total;
    });

    return map;
  }, [filteredTransactions]);

  // Low stock products warning
  const lowStockItems = useMemo(() => {
    return products.filter((p) => {
      const stock = p.stocks[activeOutlet.id] || 0;
      return stock <= p.minStock;
    });
  }, [products, activeOutlet]);

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
            Dashboard Omset & Kinerja Toko
          </h1>
          <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-0.5">
            Analisis penjualan real-time di outlet: <strong>{activeOutlet.name}</strong>
          </p>
        </div>

        {/* Time range buttons */}
        <div className="flex items-center gap-1 bg-[#efece6] dark:bg-[#252b36] p-1 border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
              timeRange === 'today'
                ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs'
                : 'text-[#485060] dark:text-[#a0a8b7] hover:text-[#1a1d24]'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
              timeRange === '7days'
                ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs'
                : 'text-[#485060] dark:text-[#a0a8b7] hover:text-[#1a1d24]'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
              timeRange === 'month'
                ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs'
                : 'text-[#485060] dark:text-[#a0a8b7] hover:text-[#1a1d24]'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Omset */}
        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#70798a] uppercase tracking-wider">
              Total Omset (Revenue)
            </span>
            <div className="h-9 w-9 rounded-xl bg-[#efece6] dark:bg-[#252b36] text-[#1f232b] dark:text-[#f4f2ec] flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              {formatRupiah(totalOmset)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-[#485060] dark:text-[#a0a8b7] font-bold mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{totalTransactionsCount} Transaksi Selesai</span>
            </div>
          </div>
        </Card>

        {/* Laba Kotor / Margin */}
        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#70798a] uppercase tracking-wider">
              Laba Kotor (Gross Profit)
            </span>
            <div className="h-9 w-9 rounded-xl bg-[#efece6] dark:bg-[#252b36] text-[#1f232b] dark:text-[#f4f2ec] flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              {formatRupiah(totalGrossProfit)}
            </h3>
            <p className="text-[11px] text-[#70798a] mt-1">
              Margin:{' '}
              <strong>
                {totalOmset > 0 ? ((totalGrossProfit / totalOmset) * 100).toFixed(1) : 0}%
              </strong>{' '}
              dari omset kotor
            </p>
          </div>
        </Card>

        {/* Rata-rata Keranjang (AOV) */}
        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#70798a] uppercase tracking-wider">
              Rata-rata Nota (AOV)
            </span>
            <div className="h-9 w-9 rounded-xl bg-[#efece6] dark:bg-[#252b36] text-[#1f232b] dark:text-[#f4f2ec] flex items-center justify-center">
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              {formatRupiah(averageOrderValue)}
            </h3>
            <p className="text-[11px] text-[#70798a] mt-1">Nilai belanja per transaksi</p>
          </div>
        </Card>

        {/* Kas Laci Kasir */}
        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#70798a] uppercase tracking-wider">
              Kas Laci Shift Aktif
            </span>
            <div className="h-9 w-9 rounded-xl bg-[#efece6] dark:bg-[#252b36] text-[#1f232b] dark:text-[#f4f2ec] flex items-center justify-center">
              <Banknote className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              {currentShift
                ? formatRupiah(
                    currentShift.startingCash +
                      currentShift.totalCashSales -
                      currentShift.cashOutExpenses
                  )
                : 'Tutup'}
            </h3>
            <p className="text-[11px] text-[#70798a] mt-1">
              {currentShift ? `Kasir: ${currentShift.cashierName}` : 'Shift kasir belum dibuka'}
            </p>
          </div>
        </Card>
      </div>

      {/* MIDDLE SECTION: Best Sellers & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Best Selling Products */}
        <Card className="p-4 sm:p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Top 5 Produk Terlaris (Best Seller)
              </h3>
              <p className="text-xs text-[#70798a]">Paling banyak terjual dalam periode ini</p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setCurrentView('products')}
              rightIcon={<ArrowUpRight className="h-3 w-3" />}
            >
              Lihat Produk
            </Button>
          </div>

          {bestSellers.length === 0 ? (
            <div className="p-8 text-center text-[#70798a] text-xs">
              Belum ada data penjualan pada periode ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {bestSellers.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f6f2] dark:bg-[#20252e] border border-[#e2ded6] dark:border-[#2e3542]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] text-xs font-black">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#70798a]">
                        {item.qty} Terjual
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                      {formatRupiah(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment Methods Distribution */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
              Distribusi Metode Bayar
            </h3>
            <p className="text-xs text-[#70798a]">Persentase cara bayar pelanggan</p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Cash */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                <span className="flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5 text-[#485060] dark:text-[#a0a8b7]" />
                  <span>Tunai (Cash)</span>
                </span>
                <span>{formatRupiah(paymentBreakdown.CASH)}</span>
              </div>
              <div className="h-2 w-full bg-[#efece6] dark:bg-[#252b36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1f232b] dark:bg-[#f5f4ef] rounded-full"
                  style={{
                    width: `${totalOmset > 0 ? (paymentBreakdown.CASH / totalOmset) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* QRIS */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                <span className="flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-[#485060] dark:text-[#a0a8b7]" />
                  <span>QRIS Dinamis</span>
                </span>
                <span>{formatRupiah(paymentBreakdown.QRIS)}</span>
              </div>
              <div className="h-2 w-full bg-[#efece6] dark:bg-[#252b36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#373e4d] dark:bg-[#c9ced8] rounded-full"
                  style={{
                    width: `${totalOmset > 0 ? (paymentBreakdown.QRIS / totalOmset) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Debit EDC */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-[#485060] dark:text-[#a0a8b7]" />
                  <span>Debit EDC / Kartu</span>
                </span>
                <span>{formatRupiah(paymentBreakdown.DEBIT_EDC)}</span>
              </div>
              <div className="h-2 w-full bg-[#efece6] dark:bg-[#252b36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#555d6e] dark:bg-[#9aa2b0] rounded-full"
                  style={{
                    width: `${
                      totalOmset > 0 ? (paymentBreakdown.DEBIT_EDC / totalOmset) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Kasbon / Hutang */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                <span className="flex items-center gap-1.5">
                  <span>Hutang / Kasbon</span>
                </span>
                <span>{formatRupiah(paymentBreakdown.HUTANG_KASBON)}</span>
              </div>
              <div className="h-2 w-full bg-[#efece6] dark:bg-[#252b36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7b8496] dark:bg-[#555d6e] rounded-full"
                  style={{
                    width: `${
                      totalOmset > 0 ? (paymentBreakdown.HUTANG_KASBON / totalOmset) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* BOTTOM SECTION: Low Stock Warnings */}
      {lowStockItems.length > 0 && (
        <Card className="p-4 sm:p-5 border-[#e2ded6] dark:border-[#2e3542] bg-[#f7f6f2] dark:bg-[#1c2026] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-[#485060] dark:text-[#a0a8b7]" />
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Peringatan Stok Menipis ({lowStockItems.length} Produk)
              </h3>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setCurrentView('inventory')}
            >
              Kelola Stok
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#fcfbf8] dark:bg-[#20252e] border border-[#e2ded6] dark:border-[#2e3542] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#1a1d24] dark:text-[#f4f2ec]">{item.name}</div>
                  <div className="text-[10px] text-[#70798a]">Min. Stok: {item.minStock} {item.unit}</div>
                </div>
                <Badge variant="primary" size="sm">
                  Sisa: {item.stocks[activeOutlet.id] || 0} {item.unit}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
