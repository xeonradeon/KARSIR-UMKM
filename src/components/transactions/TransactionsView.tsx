import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import { Transaction } from '@/types';
import {
  Receipt,
  Search,
  Printer,
  Ban,
  Download,
  Filter,
  CreditCard,
  QrCode,
  Banknote,
  Eye,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, activeOutlet, settings, voidTransaction, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [receiptTrx, setReceiptTrx] = useState<Transaction | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchOutlet = t.outletId === activeOutlet.id;
      const matchMethod = methodFilter === 'ALL' || t.payment.method === methodFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        t.invoiceNumber.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        t.cashierName.toLowerCase().includes(q);

      return matchOutlet && matchMethod && matchQ;
    });
  }, [transactions, activeOutlet, methodFilter, searchQuery]);

  const handleVoid = () => {
    if (!selectedTrx) return;
    if (!voidReason.trim()) {
      showToast('error', 'Alasan pembatalan (Void) wajib diisi!');
      return;
    }

    voidTransaction(selectedTrx.id, voidReason);
    setIsVoidModalOpen(false);
    setSelectedTrx(null);
    setVoidReason('');
  };

  const handleExportCSV = () => {
    const headers = ['No. Invoice', 'Tanggal', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.invoiceNumber,
      formatDateTime(t.createdAt),
      t.cashierName,
      t.customerName || '-',
      t.payment.method,
      t.subtotal,
      t.discountAmount,
      t.taxAmount,
      t.total,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_transaksi_${activeOutlet.code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'File CSV transaksi berhasil diunduh.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Riwayat Transaksi & Struk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh penjualan di outlet <strong>{activeOutlet.name}</strong>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          leftIcon={<Download className="h-4 w-4" />}
          className="font-bold"
        >
          Ekspor CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. invoice, nama pelanggan, kasir..."
            className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Semua Cara Bayar</option>
            <option value="CASH">Tunai (Cash)</option>
            <option value="QRIS">QRIS Dinamis</option>
            <option value="DEBIT_EDC">Debit EDC</option>
            <option value="TRANSFER">Transfer Bank</option>
            <option value="HUTANG_KASBON">Kasbon / Hutang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="py-3.5 px-4">Invoice</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Kasir / Meja</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {t.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{formatDateTime(t.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{t.cashierName}</div>
                    {t.tableNumber && (
                      <span className="text-[10px] text-slate-400">Meja: {t.tableNumber}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {t.customerName || 'Umum'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="default" size="sm">
                      {t.payment.method}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">
                    {formatRupiah(t.total)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={t.status === 'COMPLETED' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTrx(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setReceiptTrx(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                        title="Cetak Ulang Struk"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      {t.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedTrx(t);
                            setIsVoidModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                          title="Void / Batalkan Transaksi"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Detail View */}
      {selectedTrx && !isVoidModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTrx(null)}
          title={`Detail Transaksi: ${selectedTrx.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={selectedTrx.status === 'COMPLETED' ? 'success' : 'danger'}>
                  {selectedTrx.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDateTime(selectedTrx.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{selectedTrx.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{selectedTrx.customerName || 'Umum'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-500 uppercase text-[10px]">Item Belanja</div>
              {selectedTrx.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <div>
                    <span className="font-semibold">{it.productName}</span>
                    <span className="text-slate-400 ml-1">({it.quantity} x {formatRupiah(it.price)})</span>
                  </div>
                  <span className="font-bold">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedTrx.subtotal)}</span>
              </div>
              {selectedTrx.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon</span>
                  <span>- {formatRupiah(selectedTrx.discountAmount)}</span>
                </div>
              )}
              {selectedTrx.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Pajak PB1</span>
                  <span>{formatRupiah(selectedTrx.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1">
                <span>Total</span>
                <span className="text-blue-600">{formatRupiah(selectedTrx.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Void Confirmation */}
      {isVoidModalOpen && selectedTrx && (
        <Modal
          isOpen={true}
          onClose={() => setIsVoidModalOpen(false)}
          title={`Batalkan Transaksi (Void) ${selectedTrx.invoiceNumber}`}
          maxWidth="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsVoidModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleVoid}>
                Konfirmasi Void
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-rose-600 font-semibold">
              Pembatalan transaksi akan mengembalikan stok produk ke gudang dan mengurangi omset kasir.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Pembatalan (Void Reason) *
              </label>
              <input
                type="text"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Contoh: Salah input pesanan / Pelanggan komplain"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Print Receipt Preview */}
      {receiptTrx && (
        <Modal
          isOpen={true}
          onClose={() => setReceiptTrx(null)}
          title="Cetak Struk Transaksi"
          maxWidth="sm"
          footer={
            <Button onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" />}>
              Cetak Sekarang
            </Button>
          }
        >
          <div className="p-4 bg-white text-slate-900 font-mono text-[11px] border border-slate-200 rounded-xl space-y-2">
            <div className="text-center">
              <h4 className="font-bold">{settings.name}</h4>
              <p className="text-[10px] text-slate-500">{activeOutlet.address}</p>
            </div>
            <div className="border-t border-b border-dashed border-slate-300 py-1 text-[10px]">
              <div>No: {receiptTrx.invoiceNumber}</div>
              <div>Kasir: {receiptTrx.cashierName}</div>
              <div>Waktu: {formatDateTime(receiptTrx.createdAt)}</div>
            </div>
            <div className="space-y-1">
              {receiptTrx.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.productName} x{it.quantity}</span>
                  <span>{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-300 pt-1 font-bold flex justify-between">
              <span>TOTAL</span>
              <span>{formatRupiah(receiptTrx.total)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
