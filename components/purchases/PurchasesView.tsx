'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { Purchase, Supplier, Product } from '@/types';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Building2,
  Package,
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { activeOutlet, user, showToast } = useApp();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Create PO Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>(
    []
  );

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, [activeOutlet]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/purchases?outletId=${activeOutlet.id}`).then((r) => r.json());
      if (res.success) setPurchases(res.data);
    } catch {
      showToast('Gagal memuat daftar pembelian.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers').then((r) => r.json());
      if (res.success) {
        setSuppliers(res.data);
        if (res.data.length > 0) setSelectedSupplierId(res.data[0].id);
      }
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?outletId=${activeOutlet.id}`).then((r) => r.json());
      if (res.success) setProducts(res.data);
    } catch {}
  };

  const openNewPoModal = () => {
    if (products.length === 0) {
      showToast('Harap buat data produk terlebih dahulu.', 'warning');
      return;
    }
    setPoItems([
      {
        productId: products[0].id,
        quantity: 10,
        unitCost: products[0].costPrice || 10000,
      },
    ]);
    setIsPoModalOpen(true);
  };

  const addPoItem = () => {
    if (products.length === 0) return;
    setPoItems([
      ...poItems,
      {
        productId: products[0].id,
        quantity: 10,
        unitCost: products[0].costPrice || 10000,
      },
    ]);
  };

  const updatePoItem = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index].productId = value;
      if (prod) updated[index].unitCost = prod.costPrice || 0;
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value);
    } else if (field === 'unitCost') {
      updated[index].unitCost = Number(value);
    }
    setPoItems(updated);
  };

  const removePoItem = (index: number) => {
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) {
      showToast('Lengkapi data item pembelian!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId: activeOutlet.id,
          supplierId: selectedSupplierId,
          createdById: user?.id || 'usr_owner',
          createdByName: user?.name || 'Owner',
          notes: poNotes,
          items: poItems,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Purchase Order (PO) berhasil dibuat!', 'success');
        setIsPoModalOpen(false);
        setPoNotes('');
        fetchPurchases();
      } else {
        showToast(res.message || 'Gagal membuat PO.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const handleReceiveGoods = async (po: Purchase) => {
    try {
      const res = await fetch(`/api/purchases/${po.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast(`Barang pada ${po.poNumber} berhasil diterima & stok otomatis bertambah!`, 'success');
        fetchPurchases();
      } else {
        showToast(res.message || 'Gagal menerima barang.', 'error');
      }
    } catch {
      showToast('Gagal menerima barang.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Pembelian & Kulakan Barang (PO)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Buat pesanan ke supplier dan terima barang untuk otomatis menambah stok & memperbarui HPP.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openNewPoModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Buat Order PO Baru
        </Button>
      </div>

      {/* PO List Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">No. PO & Waktu</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Daftar Barang Dipesan</th>
                <th className="py-3 px-4 text-right">Total Nilai Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi Penerimaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Memuat pesanan pembelian...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada riwayat Purchase Order (PO).
                  </td>
                </tr>
              ) : (
                purchases.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {po.poNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTime(po.createdAt)} • Oleh: {po.createdByName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {po.supplierName || 'Supplier'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="line-clamp-2 text-slate-600 dark:text-slate-300">
                        {po.items.map((it) => `${it.productName} (${it.quantity}x)`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatRupiah(po.grandTotal)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          po.status === 'RECEIVED'
                            ? 'success'
                            : po.status === 'ORDERED'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {po.status === 'RECEIVED' ? 'Diterima & Stok Masuk' : 'Sedang Dipesan'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {po.status === 'ORDERED' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => handleReceiveGoods(po)}
                        >
                          Terima Barang
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE PO MODAL */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Buat Purchase Order (PO) Baru"
        size="lg"
      >
        <form onSubmit={handleCreatePo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Supplier *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone || 'Supplier'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Outlet Penerima
              </label>
              <Input value={activeOutlet.name} disabled />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Daftar Barang yang Dipesan *
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addPoItem}>
                + Tambah Item
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {poItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <select
                    value={item.productId}
                    onChange={(e) => updatePoItem(idx, 'productId', e.target.value)}
                    className="flex-1 h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs dark:bg-slate-900 dark:border-slate-700"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (HPP: {formatRupiah(p.costPrice)})
                      </option>
                    ))}
                  </select>

                  <div className="w-20">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updatePoItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="h-9 text-center"
                    />
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updatePoItem(idx, 'unitCost', e.target.value)}
                      placeholder="Harga Beli"
                      className="h-9"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePoItem(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Pesanan
            </label>
            <Input
              placeholder="Contoh: Pengiriman sebelum jam 12 siang"
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Total Estimasi PO:
            </span>
            <span className="font-mono font-black text-blue-600 text-sm">
              {formatRupiah(poItems.reduce((s, it) => s + it.quantity * it.unitCost, 0))}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsPoModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan & Terbitkan PO
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
