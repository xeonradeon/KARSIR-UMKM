'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah, calculateChange } from '@/lib/finance';
import { PaymentMethodType, Transaction } from '@/types';
import confetti from 'canvas-confetti';
import {
  Banknote,
  QrCode,
  Building2,
  CreditCard,
  Wallet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, activeOutlet, business, showToast } = useApp();
  const {
    items,
    customer,
    voucher,
    orderDiscountType,
    orderDiscountValue,
    pointsRedeemed,
    notes,
    totals,
    clearCart,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(totals.grandTotal);
  const [customCashInput, setCustomCashInput] = useState<string>(String(totals.grandTotal));
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>(notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync cash given when grand total changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCashGiven(totals.grandTotal);
      setCustomCashInput(String(totals.grandTotal));
      setCheckoutNotes(notes || '');
    }
  }, [isOpen, totals.grandTotal, notes]);

  if (!isOpen) return null;

  const change = calculateChange(cashGiven, totals.grandTotal);
  const isCashInsufficient = paymentMethod === 'CASH' && cashGiven < totals.grandTotal;

  // Quick cash options
  const quickCashPresets = [
    { label: 'Uang Pas', amount: totals.grandTotal },
    { label: 'Rp 20.000', amount: 20000 },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 500.000', amount: 500000 },
  ].filter((preset, idx) => idx === 0 || preset.amount >= totals.grandTotal);

  const handleCashPreset = (amount: number) => {
    setCashGiven(amount);
    setCustomCashInput(String(amount));
  };

  const handleCustomCashChange = (val: string) => {
    const numeric = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    setCashGiven(numeric);
    setCustomCashInput(val);
  };

  const handleProcessCheckout = async () => {
    if (isCashInsufficient) {
      showToast('error', 'Nominal pembayaran tunai kurang dari total belanja.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        outletId: activeOutlet.id,
        customerId: customer?.id || null,
        items,
        orderDiscountType,
        orderDiscountValue,
        voucherCode: voucher?.code || null,
        pointsRedeemed,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? cashGiven : totals.grandTotal,
        paymentReference: paymentReference || null,
        notes: checkoutNotes || null,
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        showToast('error', data.error?.message || data.message || 'Gagal memproses transaksi.');
        return;
      }

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast('success', 'Pembayaran berhasil diselesaikan!');
      clearCart();
      onClose();
      onSuccess(data.data);
    } catch (error: any) {
      showToast('error', error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Proses Pembayaran"
      description={`Total Tagihan: ${formatRupiah(totals.grandTotal)}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-left">
            <div className="text-[11px] text-slate-500">Total Tagihan</div>
            <div className="text-base font-black text-blue-600 dark:text-blue-400">
              {formatRupiah(totals.grandTotal)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              variant="success"
              onClick={handleProcessCheckout}
              isLoading={isSubmitting}
              disabled={isCashInsufficient}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Selesaikan Bayar
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Payment Method Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pilih Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'CASH', label: 'Tunai (Cash)', icon: <Banknote className="h-4 w-4" /> },
              { id: 'QRIS', label: 'QRIS', icon: <QrCode className="h-4 w-4" /> },
              { id: 'BANK_TRANSFER', label: 'Transfer Bank', icon: <Building2 className="h-4 w-4" /> },
              { id: 'DEBIT_CARD', label: 'Kartu Debit', icon: <CreditCard className="h-4 w-4" /> },
              { id: 'E_WALLET', label: 'E-Wallet', icon: <Wallet className="h-4 w-4" /> },
              { id: 'DEBT', label: 'Kasbon / Bon', icon: <FileText className="h-4 w-4" /> },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethodType)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  >
                    {method.icon}
                  </div>
                  <span className="text-xs">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method-Specific Inputs */}
        {paymentMethod === 'CASH' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nominal Uang Diterima
            </label>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickCashPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleCashPreset(preset.amount)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    cashGiven === preset.amount
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">
                Rp
              </span>
              <Input
                type="number"
                value={cashGiven || ''}
                onChange={(e) => handleCustomCashChange(e.target.value)}
                className="pl-10 text-base font-bold h-11"
                placeholder="0"
              />
            </div>

            {/* Kembalian / Change calculation box */}
            <div
              className={`flex items-center justify-between rounded-xl p-3 text-xs font-bold ${
                isCashInsufficient
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <span>{isCashInsufficient ? 'Uang Kurang:' : 'Kembalian:'}</span>
              <span className="text-base font-black">
                {formatRupiah(Math.abs(change))}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'QRIS' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Scan Kode QRIS (NMID: ID1020039201948)
            </div>
            {/* Visual QR Code Mockup */}
            <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-2xl bg-white p-3 shadow-md border border-slate-200 dark:border-slate-700">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-900 text-white font-mono text-[9px] p-2 text-center relative overflow-hidden">
                <QrCode className="h-28 w-28 text-white opacity-95" />
                <div className="absolute bg-white px-2 py-0.5 rounded text-[8px] font-black text-slate-900 shadow">
                  QRIS POS
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Nominal Otomatis:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {formatRupiah(totals.grandTotal)}
              </strong>
            </div>
            <Input
              placeholder="No. Referensi / RRN (Opsional)"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {paymentMethod === 'BANK_TRANSFER' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rekening Transfer Toko
            </div>
            <div className="space-y-2">
              {[
                { bank: 'BCA', acc: '829-019-4821', name: business.name },
                { bank: 'Mandiri', acc: '137-00-1928374-1', name: business.name },
              ].map((acc) => (
                <div
                  key={acc.bank}
                  className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs"
                >
                  <div>
                    <span className="font-bold text-blue-600">{acc.bank}: </span>
                    <span className="font-mono font-bold">{acc.acc}</span>
                    <div className="text-[10px] text-slate-400">a.n {acc.name}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(acc.acc);
                      showToast('info', `No. Rekening ${acc.bank} disalin.`);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Input
              placeholder="Nomor Referensi Transfer Bank (Opsional)"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {(paymentMethod === 'DEBIT_CARD' || paymentMethod === 'E_WALLET') && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
            <Input
              label="Nomor Approval / Trace / No. Referensi EDC"
              placeholder="Contoh: 092817"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
        )}

        {paymentMethod === 'DEBT' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <span>Pencatatan Kasbon / Piutang Pelanggan</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              {customer
                ? `Tagihan akan dicatat atas nama pelanggan: ${customer.name} (Hutang: ${formatRupiah(
                    customer.totalDebt
                  )})`
                : 'Peringatan: Anda belum memilih pelanggan terdaftar untuk pencatatan kasbon ini.'}
            </p>
          </div>
        )}

        {/* Transaction Notes */}
        <Input
          label="Catatan Nota Tambahan (Opsional)"
          placeholder="Contoh: Meja 4 / Bungkus / Kurir Grab"
          value={checkoutNotes}
          onChange={(e) => setCheckoutNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
};
