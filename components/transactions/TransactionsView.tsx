'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Transaction } from '@/types';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Printer,
  Calendar,
  CreditCard,
  User,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { activeOutlet, user, showToast } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Receipt Modal
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Refund Modal
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<Transaction | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [activeOutlet]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?outletId=${activeOutlet.id}`).then((r) =>
        r.json()
      );
      if (res.success) setTransactions(res.data);
    } catch {
      showToast('Gagal memuat riwayat transaksi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForRefund || !refundReason.trim()) {
      showToast('Harap isi alasan refund / pembatalan!', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${selectedTxForRefund.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: refundReason,
          userId: user?.id,
          userName: user?.name,
          userRole: user?.role,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast(`Transaksi ${selectedTxForRefund.invoiceNumber} berhasil di-refund.`, 'success');
        setIsRefundModalOpen(false);
        setRefundReason('');
        fetchTransactions();
      } else {
        showToast(res.message || 'Gagal memproses refund.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  // Filtered list
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayment =
      paymentFilter === 'ALL' || t.payments.some((p) => p.method === paymentFilter);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  const totalOmset = filtered
    .filter((t) => t.status === 'COMPLETED')
    .reduce((s, t) => s + t.grandTotal, 0);

  const totalRefund = filtered
    .filter((t) => t.status === 'REFUNDED')
    .reduce((s, t) => s + t.grandTotal, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Riwayat Transaksi & Nota
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar seluruh struk/nota penjualan kasir di{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{activeOutlet.name}</span>.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Transaksi Sesuai Filter
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {filtered.length} Transaksi
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Omset Lunas
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRupiah(totalOmset)}
          </div>
        </Card>

        <Card className="p-4 bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Nilai Refund
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatRupiah(totalRefund)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Cari no. invoice, pelanggan, atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">Semua Metode Pembayaran</option>
            <option value="CASH">💵 Uang Tunai (Cash)</option>
            <option value="QRIS">📱 QRIS / E-Wallet</option>
            <option value="DEBIT_CARD">💳 Kartu Debit</option>
            <option value="TRANSFER">🏦 Transfer Bank</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">Semua Status</option>
            <option value="COMPLETED">✅ Selesai / Lunas</option>
            <option value="REFUNDED">🔄 Refund / Dibatalkan</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">No. Invoice & Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Ringkasan Item</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat transaksi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {t.invoiceNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatDateTime(t.createdAt)} • Kasir: {t.cashierName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.customerName || 'Pelanggan Umum'}
                      </div>
                      {t.customerPhone && (
                        <div className="text-[10px] text-slate-400">{t.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="line-clamp-1 text-slate-600 dark:text-slate-300">
                        {t.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.items.reduce((s, i) => s + i.quantity, 0)} total item
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="default" size="sm">
                        {t.payments[0]?.method || 'CASH'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(t.grandTotal)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={t.status === 'COMPLETED' ? 'success' : 'error'} size="sm">
                        {t.status === 'COMPLETED' ? 'Lunas' : 'Refund'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      {/* View Receipt */}
                      <button
                        onClick={() => {
                          setSelectedTxForReceipt(t);
                          setIsReceiptModalOpen(true);
                        }}
                        title="Lihat / Cetak Struk"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                      >
                        <Printer className="h-4 w-4" />
                      </button>

                      {/* Refund Button */}
                      {t.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedTxForRefund(t);
                            setIsRefundModalOpen(true);
                          }}
                          title="Refund / Batalkan Transaksi"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={selectedTxForReceipt}
      />

      {/* REFUND MODAL */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Refund & Pembatalan Transaksi"
        size="sm"
      >
        <form onSubmit={handleRefund} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
            <p>
              Melakukan refund pada nota <strong>{selectedTxForRefund?.invoiceNumber}</strong> akan:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Mengembalikan stok {selectedTxForRefund?.items.length} produk ke outlet.</li>
              <li>Mengurangi omset kasir shift ini senilai {selectedTxForRefund && formatRupiah(selectedTxForRefund.grandTotal)}.</li>
              <li>Mencatat jejak ke Log Audit Keamanan.</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alasan Refund *
            </label>
            <Input
              placeholder="Contoh: Barang cacat / pembeli salah pesan"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsRefundModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Konfirmasi Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
