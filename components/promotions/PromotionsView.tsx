'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Voucher, Promotion } from '@/types';
import { Tag, Plus, Percent, DollarSign, Calendar, Copy, Check } from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const { showToast } = useApp();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Voucher modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(50000);
  const [maxDiscount, setMaxDiscount] = useState<number>(20000);
  const [usageLimit, setUsageLimit] = useState<number>(100);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vouchers').then((r) => r.json());
      if (res.success) setVouchers(res.data);
    } catch {
      showToast('Gagal memuat voucher.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Kode voucher wajib diisi!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          discountValue,
          minSpend,
          maxDiscount: discountType === 'PERCENTAGE' ? maxDiscount : null,
          usageLimit,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          isActive: true,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Voucher diskon baru berhasil dibuat!', 'success');
        setIsVoucherModalOpen(false);
        setCode('');
        fetchVouchers();
      } else {
        showToast(res.message || 'Gagal membuat voucher.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Diskon & Voucher Promo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Buat kode kupon diskon dan promosi musiman yang dapat diaplikasikan langsung di kasir POS.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setCode(`PROMO${Math.floor(10 + Math.random() * 90)}`);
            setIsVoucherModalOpen(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Buat Voucher Baru
        </Button>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((v) => (
          <Card key={v.id} className="p-5 space-y-4 relative overflow-hidden border-blue-100 dark:border-blue-900/40">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100 tracking-wider">
                    {v.code}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    Sisa Kuota: {v.usageLimit - v.usedCount} / {v.usageLimit}
                  </div>
                </div>
              </div>

              <Badge variant={v.isActive ? 'success' : 'default'} size="sm">
                {v.isActive ? 'Aktif' : 'Non-Aktif'}
              </Badge>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nilai Potongan:</span>
                <strong className="text-emerald-600">
                  {v.discountType === 'PERCENTAGE'
                    ? `${v.discountValue}% (Maks ${v.maxDiscount ? formatRupiah(v.maxDiscount) : 'Tak Hingga'})`
                    : formatRupiah(v.discountValue)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Minimal Belanja:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  {formatRupiah(v.minSpend)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Berlaku s/d: {new Date(v.endDate).toLocaleDateString('id-ID')}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(v.code);
                  showToast(`Kode "${v.code}" disalin!`, 'info');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                <span>Salin</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE VOUCHER MODAL */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        title="Buat Kode Voucher Baru"
        size="md"
      >
        <form onSubmit={handleCreateVoucher} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Kode Kupon / Voucher *
            </label>
            <Input
              placeholder="Contoh: MERDEKA17"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tipe Diskon
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Besar Potongan *
              </label>
              <Input
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Minimal Belanja (Rp)
              </label>
              <Input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(Number(e.target.value))}
              />
            </div>

            {discountType === 'PERCENTAGE' && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Maksimal Diskon (Rp)
                </label>
                <Input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Batas Kuota Pemakaian (Kali)
            </label>
            <Input
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsVoucherModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan & Aktifkan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
