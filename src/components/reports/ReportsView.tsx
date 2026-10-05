import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/utils/formatters';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, shifts, activeOutlet, showToast } = useApp();

  const [datePeriod, setDatePeriod] = useState<'thisMonth' | 'lastMonth' | 'allTime'>('thisMonth');

  // Filter completed transactions
  const validTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.status === 'COMPLETED' && t.outletId === activeOutlet.id
    );
  }, [transactions, activeOutlet]);

  // Aggregate P&L Financials
  const grossRevenue = validTransactions.reduce((s, t) => s + t.subtotal, 0);
  const discountsGiven = validTransactions.reduce((s, t) => s + t.discountAmount, 0);
  const netSales = grossRevenue - discountsGiven;

  const totalCOGS = validTransactions.reduce((s, t) => s + t.totalCost, 0);
  const grossProfit = netSales - totalCOGS;

  const totalTaxCollected = validTransactions.reduce((s, t) => s + t.taxAmount, 0);
  const totalServiceFeeCollected = validTransactions.reduce((s, t) => s + t.serviceFeeAmount, 0);

  // Operating Expenses from Petty cash out
  const operationalExpenses = shifts.reduce((s, sh) => s + sh.cashOutExpenses, 0);

  const netOperatingProfit = grossProfit - operationalExpenses;

  const handleExportCSV = () => {
    const data = [
      ['LAPORAN LABA RUGI (PROFIT & LOSS STATEMENT)'],
      ['Outlet', activeOutlet.name],
      ['Tanggal Ekspor', new Date().toLocaleDateString('id-ID')],
      [''],
      ['KOMPONEN', 'NOMINAL (IDR)'],
      ['Pendapatan Kotor (Gross Sales)', grossRevenue],
      ['Diskon & Potongan Voucher', -discountsGiven],
      ['Penjualan Bersih (Net Sales)', netSales],
      ['Harga Pokok Penjualan (HPP / COGS)', -totalCOGS],
      ['LABA KOTOR (GROSS PROFIT)', grossProfit],
      ['Biaya Operasional Toko (Petty Cash)', -operationalExpenses],
      ['LABA BERSIH OPERASIONAL (NET PROFIT)', netOperatingProfit],
      [''],
      ['Pajak PB1 Restoran Terkumpul', totalTaxCollected],
      ['Biaya Layanan Service Charge', totalServiceFeeCollected],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      data.map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_laba_rugi_${activeOutlet.code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Laporan Laba Rugi berhasil diekspor ke CSV.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Laporan Keuangan & Laba Rugi (P&L)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar pendapatan, HPP modal produk, margin laba kotor, dan laba operasional bersih
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleExportCSV}
          leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Ekspor Laporan P&L (CSV)
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Penjualan Bersih (Net Sales)</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatRupiah(netSales)}
          </h3>
          <p className="text-[11px] text-slate-400">Total belanja setelah dipotong diskon</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Laba Kotor (Gross Profit)</span>
          <h3 className="text-2xl font-black text-emerald-600">
            {formatRupiah(grossProfit)}
          </h3>
          <p className="text-[11px] text-slate-400">
            Margin: <strong>{netSales > 0 ? ((grossProfit / netSales) * 100).toFixed(1) : 0}%</strong>
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Laba Bersih Operasional</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatRupiah(netOperatingProfit)}
          </h3>
          <p className="text-[11px] text-slate-400">Setelah dikurangi biaya operasional petty cash</p>
        </Card>
      </div>

      {/* Comprehensive Income Statement Breakdown */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Laporan Laba Rugi Komprehensif (Income Statement)
          </h3>
          <p className="text-xs text-slate-500">Cabang: {activeOutlet.name}</p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
          {/* Revenue */}
          <div className="py-3 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              1. PENDAPATAN PENJUALAN
            </div>
            <div className="flex justify-between pl-4">
              <span>Penjualan Kotor (Gross Sales)</span>
              <span className="font-semibold">{formatRupiah(grossRevenue)}</span>
            </div>
            <div className="flex justify-between pl-4 text-rose-500">
              <span>Diskon & Voucher Kupon</span>
              <span>- {formatRupiah(discountsGiven)}</span>
            </div>
            <div className="flex justify-between pl-4 pt-1 font-bold text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800">
              <span>Total Penjualan Bersih (Net Sales)</span>
              <span>{formatRupiah(netSales)}</span>
            </div>
          </div>

          {/* COGS */}
          <div className="py-3 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              2. HARGA POKOK PENJUALAN (HPP / COGS)
            </div>
            <div className="flex justify-between pl-4 text-rose-500">
              <span>HPP Modal Produk Terjual</span>
              <span>- {formatRupiah(totalCOGS)}</span>
            </div>
            <div className="flex justify-between pl-4 pt-1 font-bold text-emerald-600 border-t border-slate-100 dark:border-slate-800">
              <span>LABA KOTOR (GROSS PROFIT)</span>
              <span>{formatRupiah(grossProfit)}</span>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="py-3 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              3. BIAYA OPERASIONAL (EXPENSES)
            </div>
            <div className="flex justify-between pl-4 text-rose-500">
              <span>Petty Cash & Biaya Operasional Kasir</span>
              <span>- {formatRupiah(operationalExpenses)}</span>
            </div>
            <div className="flex justify-between pl-4 pt-1 font-black text-sm text-blue-600 dark:text-blue-400 border-t border-slate-100 dark:border-slate-800">
              <span>LABA BERSIH OPERASIONAL (NET PROFIT)</span>
              <span>{formatRupiah(netOperatingProfit)}</span>
            </div>
          </div>

          {/* Tax & Service */}
          <div className="py-3 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              4. TITIPAN PAJAK & SERVICE FEE (NON-REVENUE)
            </div>
            <div className="flex justify-between pl-4">
              <span>Pajak Restoran PB1 (11%) Terkumpul</span>
              <span>{formatRupiah(totalTaxCollected)}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span>Biaya Layanan Service Charge (5%)</span>
              <span>{formatRupiah(totalServiceFeeCollected)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
