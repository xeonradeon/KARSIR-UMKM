'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/finance';
import {
  BarChart3,
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserCheck,
  Receipt,
  FileSpreadsheet,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReportsView: React.FC = () => {
  const { activeOutlet, showToast } = useApp();

  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [activeOutlet, range]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?outletId=${activeOutlet.id}&range=${range}`).then((r) =>
        r.json()
      );
      if (res.success) setReportData(res.data);
    } catch {
      showToast('Gagal memuat laporan keuangan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!reportData) return;
    const { summary, chartData, bestSellers } = reportData;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'LAPORAN KEUANGAN & PENJUALAN POS UMKM\n';
    csvContent += `Outlet,${activeOutlet.name}\n`;
    csvContent += `Periode,${range}\n\n`;

    csvContent += 'RINGKASAN LABA RUGI\n';
    csvContent += `Total Omset Kotor,${summary.totalRevenue}\n`;
    csvContent += `Pajak PB1,${summary.totalTax}\n`;
    csvContent += `Total Diskon,${summary.totalDiscount}\n`;
    csvContent += `HPP / Modal Barang Terjual,${summary.totalCogs}\n`;
    csvContent += `Laba Kotor (Gross Profit),${summary.grossProfit}\n`;
    csvContent += `Margin Laba Kotor,${summary.grossMargin}%\n`;
    csvContent += `Total Transaksi,${summary.totalTransactions}\n`;
    csvContent += `Rata-rata Keranjang (Basket Size),${summary.averageBasketValue}\n\n`;

    csvContent += 'TREN HARIAN\n';
    csvContent += 'Tanggal,Omset,Laba Kotor,HPP,Jumlah Transaksi\n';
    chartData.forEach((row: any) => {
      csvContent += `${row.date},${row.revenue},${row.profit},${row.cogs},${row.transactions}\n`;
    });

    csvContent += '\nPRODUK TERLARIS\n';
    csvContent += 'Nama Produk,SKU,Unit Terjual,Omset,Laba,Margin %\n';
    bestSellers.forEach((p: any) => {
      csvContent += `"${p.productName}",${p.sku},${p.unitsSold},${p.revenue},${p.profit},${p.margin}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_POS_${activeOutlet.code}_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan CSV berhasil diunduh!', 'success');
  };

  if (loading || !reportData) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const { summary, chartData, payments, cashiers, bestSellers, mostProfitable } = reportData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Laporan Keuangan & Laba Rugi (P&L)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis profitabilitas, HPP, performa kasir, dan tren penjualan di{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{activeOutlet.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  range === r
                    ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {r === 'today' ? 'Hari Ini' : r === '7d' ? '7 Hari' : r === '30d' ? '30 Hari' : 'Semua'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="h-4 w-4 text-emerald-600" />}
          >
            Ekspor Excel/CSV
          </Button>
        </div>
      </div>

      {/* LABA RUGI SUMMARY CARD (P&L) */}
      <Card className="p-6 bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Laporan Laba Rugi Sederhana (Income Statement)
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Kinerja Keuangan Periode {range.toUpperCase()}
            </h2>
          </div>
          <Badge variant="success" size="lg">
            Margin Laba Kotor: {summary.grossMargin}%
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Total Penjualan (Omset)</span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {formatRupiah(summary.totalRevenue)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {summary.totalTransactions} transaksi berhasil
            </div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-rose-400 font-bold uppercase">Modal Pokok (HPP / COGS)</span>
            <div className="text-xl font-black text-rose-300 font-mono mt-1">
              -{formatRupiah(summary.totalCogs)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Biaya modal barang terjual
            </div>
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <span className="text-[11px] text-emerald-400 font-bold uppercase">Laba Kotor (Gross Profit)</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatRupiah(summary.grossProfit)}
            </div>
            <div className="text-[10px] text-emerald-300 mt-1 font-semibold">
              Omset - HPP Barang
            </div>
          </div>

          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Rata-rata Nota (Basket Size)</span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {formatRupiah(summary.averageBasketValue)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {summary.totalItemsSold} total item terjual
            </div>
          </div>
        </div>
      </Card>

      {/* SALES TREND CHART */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Grafik Penjualan & Laba Harian
            </h3>
            <p className="text-xs text-slate-400">Tren omset vs laba kotor harian</p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Laba Kotor"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProf)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2-Col Breakdown: Payment Methods & Cashier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Distribusi Metode Pembayaran
          </h3>

          <div className="space-y-3">
            {payments.map((p: any, idx: number) => {
              const pct = summary.totalRevenue > 0 ? Math.round((p.total / summary.totalRevenue) * 100) : 0;
              return (
                <div key={p.method} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">
                      {p.method === 'CASH'
                        ? '💵 Uang Tunai (Cash)'
                        : p.method === 'QRIS'
                        ? '📱 QRIS / E-Wallet'
                        : p.method === 'DEBIT_CARD'
                        ? '💳 Kartu Debit'
                        : '🏦 Transfer Bank'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(p.total)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Cashier Performance */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Produktivitas Kasir (Cashier Performance)
          </h3>

          <div className="space-y-2.5">
            {cashiers.map((c: any) => (
              <div
                key={c.cashierId}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-950 dark:text-blue-300">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {c.cashierName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {c.transactions} transaksi kasir
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                    {formatRupiah(c.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* TOP SELLING & MOST PROFITABLE PRODUCTS TABLE */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Peringkat Produk Terlaris & Margin Laba
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nama Produk & SKU</th>
                <th className="py-3 px-4 text-center">Unit Terjual</th>
                <th className="py-3 px-4 text-right">Total Omset</th>
                <th className="py-3 px-4 text-right">Total HPP</th>
                <th className="py-3 px-4 text-right">Laba Kotor</th>
                <th className="py-3 px-4 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {bestSellers.map((p: any) => (
                <tr key={p.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {p.productName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</div>
                  </td>

                  <td className="py-3 px-4 text-center font-bold font-mono text-slate-800 dark:text-slate-200">
                    {p.unitsSold} pcs
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatRupiah(p.revenue)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {formatRupiah(p.cost)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                    {formatRupiah(p.profit)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.margin > 30 ? 'success' : 'default'} size="sm">
                      {p.margin}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
