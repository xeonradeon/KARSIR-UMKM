'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/finance';
import { CartItem, Customer, Voucher } from '@/types';
import {
  Trash2,
  Plus,
  Minus,
  User,
  Tag,
  Percent,
  Coins,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';

interface PosCartProps {
  onCheckoutClick: () => void;
}

export const PosCart: React.FC<PosCartProps> = ({ onCheckoutClick }) => {
  const { business, settings, showToast } = useApp();
  const {
    items,
    customer,
    voucher,
    orderDiscountType,
    orderDiscountValue,
    pointsRedeemed,
    notes,
    totals,
    updateQuantity,
    removeItem,
    updateItemDiscount,
    updateItemNote,
    setCustomer,
    applyVoucher,
    setOrderDiscount,
    setPointsRedeemed,
    setNotes,
    clearCart,
  } = useCart();

  // Modals inside Cart
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Edit item states
  const [editingItemNote, setEditingItemNote] = useState<{
    item: CartItem;
    text: string;
  } | null>(null);
  const [editingItemDisc, setEditingItemDisc] = useState<{
    item: CartItem;
    amount: number;
  } | null>(null);

  // Customers list
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Voucher input
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Order Discount
  const [tempDiscType, setTempDiscType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [tempDiscVal, setTempDiscVal] = useState<number>(0);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers').then((r) => r.json());
      if (res.success) setCustomers(res.data);
    } catch {}
  };

  const handleOpenCustomerModal = () => {
    fetchCustomers();
    setIsCustomerModalOpen(true);
  };

  const handleSelectCustomer = (c: Customer) => {
    setCustomer(c);
    setIsCustomerModalOpen(false);
    showToast('success', `Pelanggan dipilih: ${c.name}`);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    try {
      setIsCreatingCustomer(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        setIsCustomerModalOpen(false);
        setNewCustName('');
        setNewCustPhone('');
        showToast('success', `Pelanggan baru berhasil dibuat: ${data.data.name}`);
      }
    } catch {
      showToast('error', 'Gagal mendaftarkan pelanggan.');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleValidateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    try {
      setIsValidatingVoucher(true);
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VALIDATE',
          code: voucherCodeInput.trim(),
          subtotal: totals.subtotal,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        applyVoucher(data.data);
        setIsVoucherModalOpen(false);
        setVoucherCodeInput('');
        showToast('success', `Voucher "${data.data.code}" berhasil diterapkan!`);
      } else {
        showToast('error', data.message || 'Kode voucher tidak valid.');
      }
    } catch {
      showToast('error', 'Gagal memvalidasi voucher.');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleSaveOrderDiscount = () => {
    setOrderDiscount(tempDiscType, tempDiscVal);
    setIsDiscountModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 select-none">
      {/* Top Customer / Quick Tag Bar */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        {customer ? (
          <div className="flex items-center justify-between flex-1 rounded-xl bg-blue-50/80 px-3 py-1.5 dark:bg-blue-950/40">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                <User className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-100 flex items-center gap-1.5">
                  <span>{customer.name}</span>
                  <Badge variant="purple" size="sm">
                    {customer.tier}
                  </Badge>
                </div>
                <div className="text-[10px] text-blue-700 dark:text-blue-300">
                  {customer.points} Poin • Hutang: {formatRupiah(customer.totalDebt)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setCustomer(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenCustomerModal}
            className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 transition-colors w-full justify-center"
          >
            <User className="h-3.5 w-3.5" />
            <span>+ Pilih / Tambah Pelanggan (CRM)</span>
          </button>
        )}

        {items.length > 0 && (
          <button
            onClick={clearCart}
            title="Kosongkan Keranjang"
            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Cart Items Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 mb-2">
              <Tag className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Keranjang Masih Kosong
            </p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mt-0.5">
              Pilih produk dari katalog di sebelah kiri untuk memulai transaksi kasir.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2 transition-all"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {item.productName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.variantName && (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        [{item.variantName}]
                      </span>
                    )}
                    {item.priceType === 'WHOLESALE' && (
                      <Badge variant="amber" size="sm">
                        Grosir
                      </Badge>
                    )}
                    {item.priceType === 'MEMBER' && (
                      <Badge variant="purple" size="sm">
                        Member
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {formatRupiah(item.subtotal)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    @{formatRupiah(item.appliedPrice)}
                  </div>
                </div>
              </div>

              {/* Note or Discount details if set */}
              {(item.notes || item.discount > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {item.notes && (
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Catatan: {item.notes}
                    </span>
                  )}
                  {item.discount > 0 && (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Diskon: -{formatRupiah(item.discount)}
                    </span>
                  )}
                </div>
              )}

              {/* Quantity Stepper & Action Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setEditingItemNote({ item, text: item.notes || '' })
                    }
                    title="Tambah Catatan Item"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setEditingItemDisc({ item, amount: item.discount })
                    }
                    title="Diskon Item"
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
                  >
                    <Percent className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.variantId, item.quantity - 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[20px] text-center text-xs font-bold text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.variantId, item.quantity + 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Discount Actions */}
      {items.length > 0 && (
        <div className="border-t border-slate-200/80 bg-slate-50/75 p-3 dark:border-slate-800 dark:bg-slate-950/50 space-y-2.5">
          {/* Quick Buttons: Voucher, Order Disc, Points */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                voucher
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <Tag className="h-3 w-3" />
              <span>{voucher ? `Voucher: ${voucher.code}` : '+ Voucher'}</span>
            </button>

            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                orderDiscountValue > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <Percent className="h-3 w-3" />
              <span>
                {orderDiscountValue > 0
                  ? `Diskon: ${
                      orderDiscountType === 'PERCENTAGE'
                        ? `${orderDiscountValue}%`
                        : formatRupiah(orderDiscountValue)
                    }`
                  : '+ Diskon Nota'}
              </span>
            </button>

            {customer && customer.points > 0 && (
              <button
                onClick={() => {
                  if (pointsRedeemed > 0) {
                    setPointsRedeemed(0);
                  } else {
                    setPointsRedeemed(customer.points);
                  }
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  pointsRedeemed > 0
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                }`}
              >
                <Coins className="h-3 w-3" />
                <span>
                  {pointsRedeemed > 0 ? `Poin: ${pointsRedeemed} pts` : `Tukar Poin (${customer.points})`}
                </span>
              </button>
            )}
          </div>

          {/* Breakdown Lines */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatRupiah(totals.subtotal)}
              </span>
            </div>

            {totals.itemDiscountTotal > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Diskon Item</span>
                <span>-{formatRupiah(totals.itemDiscountTotal)}</span>
              </div>
            )}

            {totals.orderDiscountTotal > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Diskon Nota</span>
                <span>-{formatRupiah(totals.orderDiscountTotal)}</span>
              </div>
            )}

            {totals.voucherDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Voucher Promo</span>
                <span>-{formatRupiah(totals.voucherDiscount)}</span>
              </div>
            )}

            {totals.pointsDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Poin Loyalitas</span>
                <span>-{formatRupiah(totals.pointsDiscount)}</span>
              </div>
            )}

            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>PPN ({business.taxRate}%)</span>
                <span>{formatRupiah(totals.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                TOTAL BAYAR
              </span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                {formatRupiah(totals.grandTotal)}
              </span>
            </div>
          </div>

          {/* Big Checkout Trigger Button */}
          <Button
            size="lg"
            variant="primary"
            className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
            onClick={onCheckoutClick}
            leftIcon={<CreditCard className="h-5 w-5" />}
          >
            Bayar • {formatRupiah(totals.grandTotal)}
          </Button>
        </div>
      )}

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        size="md"
        title="Pilih Pelanggan (CRM)"
        description="Gunakan member untuk poin reward dan harga member"
      >
        <div className="space-y-4">
          <Input
            placeholder="Cari nama atau no. telepon..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />

          <div className="max-h-52 overflow-y-auto space-y-1.5">
            {customers
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.phone?.includes(customerSearch)
              )
              .map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer dark:border-slate-800 dark:bg-slate-900 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.phone || '-'} • {c.points} Poin
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    {c.tier}
                  </Badge>
                </div>
              ))}
          </div>

          {/* Quick Create New Customer Form */}
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              + Daftarkan Pelanggan Baru
            </div>
            <form onSubmit={handleCreateCustomer} className="flex gap-2">
              <Input
                placeholder="Nama"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="No. WhatsApp"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="h-9 text-xs"
              />
              <Button size="sm" type="submit" isLoading={isCreatingCustomer}>
                Simpan
              </Button>
            </form>
          </div>
        </div>
      </Modal>

      {/* Voucher Code Modal */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        size="sm"
        title="Gunakan Voucher Diskon"
        description="Masukkan kode voucher promosi aktif"
      >
        <form onSubmit={handleValidateVoucher} className="space-y-4">
          <Input
            placeholder="Contoh: PROMO10K / DISKON50"
            value={voucherCodeInput}
            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
            className="text-center font-bold tracking-widest uppercase h-11"
            autoFocus
          />
          <div className="flex gap-2">
            {voucher && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  applyVoucher(null);
                  setIsVoucherModalOpen(false);
                }}
              >
                Hapus Voucher
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isValidatingVoucher}
            >
              Terapkan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Discount Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        size="sm"
        title="Diskon Seluruh Nota"
        description="Pilih persentase atau potongan nominal tetap"
      >
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setTempDiscType('PERCENTAGE')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                tempDiscType === 'PERCENTAGE'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500'
              }`}
            >
              Persen (%)
            </button>
            <button
              onClick={() => setTempDiscType('FIXED')}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                tempDiscType === 'FIXED'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500'
              }`}
            >
              Nominal (Rp)
            </button>
          </div>

          <Input
            type="number"
            placeholder={tempDiscType === 'PERCENTAGE' ? 'Contoh: 10' : 'Contoh: 15000'}
            value={tempDiscVal || ''}
            onChange={(e) => setTempDiscVal(Number(e.target.value))}
            className="text-center text-lg font-bold"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOrderDiscount('PERCENTAGE', 0);
                setIsDiscountModalOpen(false);
              }}
            >
              Hapus Diskon
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveOrderDiscount}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Item Note Modal */}
      {editingItemNote && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItemNote(null)}
          size="sm"
          title={`Catatan: ${editingItemNote.item.productName}`}
        >
          <div className="space-y-3">
            <Input
              placeholder="Contoh: Kurang manis / Tanpa pedas"
              value={editingItemNote.text}
              onChange={(e) =>
                setEditingItemNote({ ...editingItemNote, text: e.target.value })
              }
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  updateItemNote(
                    editingItemNote.item.productId,
                    editingItemNote.item.variantId,
                    editingItemNote.text
                  );
                  setEditingItemNote(null);
                }}
              >
                Simpan Catatan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Item Discount Modal */}
      {editingItemDisc && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItemDisc(null)}
          size="sm"
          title={`Diskon Item: ${editingItemDisc.item.productName}`}
        >
          <div className="space-y-3">
            <Input
              type="number"
              label="Potongan Nominal (Rp)"
              placeholder="0"
              value={editingItemDisc.amount || ''}
              onChange={(e) =>
                setEditingItemDisc({ ...editingItemDisc, amount: Number(e.target.value) })
              }
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  updateItemDiscount(
                    editingItemDisc.item.productId,
                    editingItemDisc.item.variantId,
                    editingItemDisc.amount
                  );
                  setEditingItemDisc(null);
                }}
              >
                Terapkan Diskon
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
