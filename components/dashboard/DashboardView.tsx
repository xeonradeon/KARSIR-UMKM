'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Product, Transaction } from '@/types';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Receipt,
  Package,
  Layers,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { activeOutlet, setCurrentView, user, business } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeOutlet]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?outletId=${activeOutlet.id}`).then((r) => r.json());
      if (res.success) {
        setStats(res.data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    todayRevenue,
    todayGrossProfit,
    todayItemsSold,
    todayTxCount,
    lowStockCount,
    outOfStockCount,
    last7Days,
    topProducts,
    recentTransactions,
  } = stats;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Outlet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Halo, {user?.name || 'Owner'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Berikut ringkasan performa penjualan dan operasional di{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{activeOutlet.name}</span>{' '}
            hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('reports')}
            leftIcon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          >
            Laporan Detail
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentView('pos')}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
          >
            Buka Kasir (POS)
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Hari Ini */}
        <Card className="p-5 relative overflow-hidden bg-linear-to-br from-blue-500/5 to-transparent border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Omset Hari Ini
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatRupiah(todayRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">
                {todayTxCount || 0} Transaksi
              </span>{' '}
              berhasil tercatat
            </div>
          </div>
        </Card>

        {/* Laba Kotor */}
        <Card className="p-5 relative overflow-hidden bg-linear-to-br from-emerald-500/5 to-transparent border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Estimasi Laba Kotor
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(todayGrossProfit)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Margin:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {todayRevenue > 0
                  ? `${Math.round((todayGrossProfit / todayRevenue) * 100)}%`
                  : '0%'}
              </span>{' '}
              dari omset
            </div>
          </div>
        </Card>

        {/* Produk Terjual */}
        <Card className="p-5 relative overflow-hidden bg-linear-to-br from-amber-500/5 to-transparent border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Produk Terjual
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {todayItemsSold || 0}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Rata-rata item per transaksi:{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {todayTxCount > 0 ? (todayItemsSold / todayTxCount).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Peringatan Stok */}
        <Card
          onClick={() => setCurrentView('inventory')}
          className="p-5 relative overflow-hidden bg-linear-to-br from-rose-500/5 to-transparent border-rose-100 dark:border-rose-900/40 cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Peringatan Stok
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {lowStockCount + outOfStockCount}{' '}
              <span className="text-sm font-semibold text-slate-400">SKU</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{outOfStockCount} Habis</span> • <span>{lowStockCount} Menipis</span>
              <ChevronRight className="h-3 w-3 ml-auto text-slate-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7 Days Sales Trend Chart */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tren Penjualan 7 Hari Terakhir
              </h2>
              <p className="text-xs text-slate-400">Grafik omset harian vs laba kotor</p>
            </div>
            <Badge variant="info" size="sm">
              7 Hari
            </Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatRupiah(Number(val))}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Omset"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Laba Kotor"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right 1 Col: Quick Action Hub & Shift Info */}
        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Pintasan Operasional Cepat
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentView('pos')}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-center hover:bg-blue-100/80 dark:border-blue-900 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Transaksi POS
                </span>
                <span className="text-[10px] text-blue-600/80 dark:text-blue-400">Kasir Cepat</span>
              </button>

              <button
                onClick={() => setCurrentView('products')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-center hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Package className="h-5 w-5 text-slate-700 dark:text-slate-300 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  + Produk Baru
                </span>
                <span className="text-[10px] text-slate-400">Katalog & Harga</span>
              </button>

              <button
                onClick={() => setCurrentView('shifts')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-center hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Clock className="h-5 w-5 text-slate-700 dark:text-slate-300 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Shift Kasir
                </span>
                <span className="text-[10px] text-slate-400">Tutup / Buka Kas</span>
              </button>

              <button
                onClick={() => setCurrentView('purchases')}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-center hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Boxes className="h-5 w-5 text-slate-700 dark:text-slate-300 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Kulakan / PO
                </span>
                <span className="text-[10px] text-slate-400">Beli dari Supplier</span>
              </button>
            </div>
          </Card>

          {/* Low Stock Warning Card */}
          {lowStockCount + outOfStockCount > 0 && (
            <Card
              onClick={() => setCurrentView('inventory')}
              className="p-4 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 cursor-pointer hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Perhatian: Stok Menipis ({lowStockCount + outOfStockCount} item)
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate">
                    Klik disini untuk melihat daftar stok & membuat Purchase Order (PO).
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Produk Terlaris (Top 5)
              </h2>
              <p className="text-xs text-slate-400">Berdasarkan kuantitas unit terjual</p>
            </div>
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {topProducts && topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((item: any, idx: number) => (
                <div
                  key={item.product?.id || idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.product?.name || 'Produk'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {item.product?.sku} • {item.product?.category?.name || 'Umum'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.unitsSold} {item.product?.unit || 'pcs'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {formatRupiah(item.revenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">Belum ada data penjualan.</p>
            )}
          </div>
        </Card>

        {/* Recent Transactions List */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Transaksi Kasir Terakhir
              </h2>
              <p className="text-xs text-slate-400">Nota penjualan realtime</p>
            </div>
            <button
              onClick={() => setCurrentView('transactions')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>Riwayat</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 5).map((tx: Transaction) => (
                <div
                  key={tx.id}
                  onClick={() => setCurrentView('transactions')}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-950 dark:text-blue-300">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {tx.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{tx.customerName || 'Umum'}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {formatRupiah(tx.grandTotal)}
                    </div>
                    <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'error'} size="sm">
                      {tx.status === 'COMPLETED' ? 'Lunas' : 'Refund'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">Belum ada transaksi hari ini.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
