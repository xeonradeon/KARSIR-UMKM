import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import { Promotion } from '@/types';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const { promotions, addPromotion, updatePromotion, deletePromotion, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [value, setValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(50000);
  const [maxDiscount, setMaxDiscount] = useState<number>(20000);
  const [isActive, setIsActive] = useState<boolean>(true);

  const openCreate = () => {
    setEditingPromo(null);
    setCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setName('Promo Spesial KasirKu');
    setType('PERCENTAGE');
    setValue(10);
    setMinPurchase(50000);
    setMaxDiscount(20000);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingPromo(p);
    setCode(p.code);
    setName(p.name);
    setType(p.type);
    setValue(p.value);
    setMinPurchase(p.minPurchase);
    setMaxDiscount(p.maxDiscount || 0);
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      showToast('error', 'Kode voucher dan nama promo wajib diisi!');
      return;
    }

    if (editingPromo) {
      updatePromotion(editingPromo.id, {
        code: code.toUpperCase(),
        name,
        type,
        value,
        minPurchase,
        maxDiscount: maxDiscount || undefined,
        isActive,
      });
      showToast('success', `Promo ${name} diperbarui.`);
    } else {
      addPromotion({
        code: code.toUpperCase(),
        name,
        type,
        value,
        minPurchase,
        maxDiscount: maxDiscount || undefined,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        isActive,
      });
      showToast('success', `Promo voucher ${code} berhasil dibuat.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: Promotion) => {
    if (confirm(`Hapus promo "${p.name}"?`)) {
      deletePromotion(p.id);
      showToast('info', `Promo ${p.name} telah dihapus.`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Promosi & Kode Voucher Diskon
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kupon potongan persen, diskon nominal rupiah, dan batas minimal belanja
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreate}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Buat Promo Baru
        </Button>
      </div>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((p) => (
          <Card key={p.id} className="p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black font-mono tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900">
                  {p.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {p.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Tipe Potongan:</span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {p.type === 'PERCENTAGE' ? `${p.value}% Diskon` : formatRupiah(p.value)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Minimal Belanja:</span>
                <span>{formatRupiah(p.minPurchase)}</span>
              </div>
              {p.maxDiscount && (
                <div className="flex justify-between">
                  <span>Maksimal Diskon:</span>
                  <span>{formatRupiah(p.maxDiscount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Badge variant={p.isActive ? 'success' : 'default'} size="sm">
                {p.isActive ? 'Sedang Aktif' : 'Nonaktif'}
              </Badge>
              <span className="text-[10px] text-slate-400">
                Berlaku s/d {formatDateTime(p.endDate)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL: Promo Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? `Edit Promo: ${editingPromo.name}` : 'Buat Voucher Promo Baru'}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSave} className="font-bold">
              Simpan Promo
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Kupon Voucher *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DISKON10"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Diskon
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="PERCENTAGE">Persen (%)</option>
                <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Promo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Diskon Pelajar 10%"
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nilai Diskon
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min Belanja (Rp)
              </label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Maks Diskon (Rp)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
