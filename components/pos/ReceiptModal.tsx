'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Printer, Share2, MessageSquare, Download, CheckCircle2, Copy } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { business, activeOutlet, settings, showToast } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm' | 'A4'>('58mm');

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReceipt = `
================================
${business.name.toUpperCase()}
${activeOutlet.name} - ${activeOutlet.address || ''}
Telp: ${business.phone || '-'}
================================
No. Nota : ${transaction.invoiceNumber}
Waktu    : ${formatDateTime(transaction.createdAt)}
Kasir    : ${transaction.cashierName}
Pelanggan: ${transaction.customerName || 'Umum'}
--------------------------------
${transaction.items
  .map(
    (item) =>
      `${item.productName}${item.variantName ? ` (${item.variantName})` : ''}\n  ${
        item.quantity
      } x ${formatRupiah(item.appliedPrice)} = ${formatRupiah(item.subtotal)}`
  )
  .join('\n')}
--------------------------------
Subtotal : ${formatRupiah(transaction.subtotal)}
${transaction.itemDiscountTotal > 0 ? `Diskon Item: -${formatRupiah(transaction.itemDiscountTotal)}\n` : ''}${
      transaction.orderDiscountTotal > 0
        ? `Diskon Nota: -${formatRupiah(transaction.orderDiscountTotal)}\n`
        : ''
    }${
      transaction.voucherDiscount > 0
        ? `Voucher: -${formatRupiah(transaction.voucherDiscount)}\n`
        : ''
    }${
      transaction.pointsDiscount > 0
        ? `Poin: -${formatRupiah(transaction.pointsDiscount)}\n`
        : ''
    }Pajak (${business.taxRate}%): ${formatRupiah(transaction.taxAmount)}
TOTAL    : ${formatRupiah(transaction.grandTotal)}
================================
Bayar (${transaction.paymentMethod}): ${formatRupiah(transaction.amountPaid)}
Kembali  : ${formatRupiah(transaction.change)}
================================
${settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}
Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.
    `.trim();

    navigator.clipboard.writeText(textReceipt);
    showToast('success', 'Struk teks berhasil disalin ke clipboard.');
  };

  const handleShareWhatsApp = () => {
    const customerPhone = transaction.customer?.phone || '';
    const textReceipt = encodeURIComponent(
      `*${business.name}*\nNo. Nota: ${transaction.invoiceNumber}\nTotal: ${formatRupiah(
        transaction.grandTotal
      )}\nStatus: LUNAS\n\nTerima kasih telah berbelanja!`
    );

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
    const url = finalPhone
      ? `https://wa.me/${finalPhone}?text=${textReceipt}`
      : `https://wa.me/?text=${textReceipt}`;

    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Struk Pembayaran / Nota"
      description={`Nomor Nota: ${transaction.invoiceNumber}`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaperSize('58mm')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                paperSize === '58mm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => setPaperSize('80mm')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                paperSize === '80mm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              80mm
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<MessageSquare className="h-4 w-4 text-emerald-600" />}
              onClick={handleShareWhatsApp}
            >
              WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={handleCopyText}
            >
              Salin Teks
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={handlePrint}
            >
              Cetak Struk
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Receipt Paper Visual Container */}
      <div className="flex justify-center p-2">
        <div
          ref={receiptRef}
          className={`printable-receipt receipt-${paperSize} bg-white text-slate-900 border border-slate-200 p-6 rounded-xl shadow-xs font-mono text-xs leading-relaxed max-w-sm w-full`}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
            <h2 className="text-sm font-black tracking-tight">{business.name}</h2>
            <p className="text-[11px] text-slate-600">
              {activeOutlet.name} — {activeOutlet.address || 'Jakarta'}
            </p>
            {business.phone && <p className="text-[10px] text-slate-500">Telp: {business.phone}</p>}
          </div>

          {/* Metadata */}
          <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Nota:</span>
              <span className="font-bold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatDateTime(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kasir:</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pelanggan:</span>
              <span className="font-semibold">{transaction.customerName || 'Umum'}</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="font-bold text-[11px]">
                  {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ''}
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>
                    {item.quantity} x {formatRupiah(item.appliedPrice)}
                    {item.discount > 0 ? ` (disc: -${formatRupiah(item.discount)})` : ''}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.itemDiscountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon Produk</span>
                <span>-{formatRupiah(transaction.itemDiscountTotal)}</span>
              </div>
            )}
            {transaction.orderDiscountTotal > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon Nota</span>
                <span>-{formatRupiah(transaction.orderDiscountTotal)}</span>
              </div>
            )}
            {transaction.voucherDiscount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Voucher ({transaction.voucherCode})</span>
                <span>-{formatRupiah(transaction.voucherDiscount)}</span>
              </div>
            )}
            {transaction.pointsDiscount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Poin Loyalitas ({transaction.pointsRedeemed} pts)</span>
                <span>-{formatRupiah(transaction.pointsDiscount)}</span>
              </div>
            )}
            {transaction.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>PPN ({business.taxRate}%)</span>
                <span>{formatRupiah(transaction.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.grandTotal)}</span>
            </div>
          </div>

          {/* Payment & Change */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Metode Bayar</span>
              <span className="font-bold">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Bayar</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 space-y-1">
            <p className="text-[10px] text-slate-500">{settings.receiptFooter}</p>
            <p className="text-[9px] text-slate-400">Powered by POS UMKM All-in-One</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
