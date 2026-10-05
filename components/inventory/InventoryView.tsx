'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/lib/finance';
import { InventoryItem, InventoryMovement, Product, StockTransfer } from '@/types';
import {
  Boxes,
  ArrowUpDown,
  History,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Truck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { activeOutlet, outlets, user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENTS' | 'TRANSFERS'>('STOCK');
  const [inventories, setInventories] = useState<(InventoryItem & { product: Product })[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<
    (InventoryItem & { product: Product }) | null
  >(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'ADJUSTMENT' | 'DAMAGE' | 'EXPIRED' | 'CORRECTION'>(
    'ADJUSTMENT'
  );
  const [adjustReason, setAdjustReason] = useState('');

  // Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [destOutletId, setDestOutletId] = useState(
    outlets.find((o) => o.id !== activeOutlet.id)?.id || ''
  );
  const [transferProductId, setTransferProductId] = useState('');
  const [transferQty, setTransferQty] = useState(1);
  const [transferNotes, setTransferNotes] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, [activeOutlet]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [invRes, movRes, trfRes] = await Promise.all([
        fetch(`/api/inventory?outletId=${activeOutlet.id}`).then((r) => r.json()),
        fetch(`/api/inventory/movements?outletId=${activeOutlet.id}`).then((r) => r.json()),
        fetch('/api/inventory/transfers').then((r) => r.json()),
      ]);

      if (invRes.success) setInventories(invRes.data);
      if (movRes.success) setMovements(movRes.data);
      if (trfRes.success) setTransfers(trfRes.data);
    } catch {
      showToast('Gagal memuat data inventori.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;
    if (adjustQty === 0) {
      showToast('Jumlah perubahan stok tidak boleh 0!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItemForAdjust.productId,
          outletId: activeOutlet.id,
          type: adjustType,
          quantity: adjustQty,
          reason: adjustReason || `Penyesuaian stok manual (${adjustType})`,
          userId: user?.id,
          userName: user?.name,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Stok berhasil disesuaikan!', 'success');
        setIsAdjustModalOpen(false);
        setAdjustQty(0);
        setAdjustReason('');
        fetchInventoryData();
      } else {
        showToast(res.message || 'Gagal menyesuaikan stok.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi.', 'error');
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destOutletId || !transferProductId || transferQty <= 0) {
      showToast('Harap lengkapi formulir transfer!', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceOutletId: activeOutlet.id,
          destOutletId,
          items: [{ productId: transferProductId, quantity: transferQty }],
          notes: transferNotes,
          userId: user?.id,
          userName: user?.name,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showToast('Transfer stok antar cabang berhasil dijalankan!', 'success');
        setIsTransferModalOpen(false);
        setTransferQty(1);
        setTransferNotes('');
        fetchInventoryData();
      } else {
        showToast(res.message || 'Gagal melakukan transfer stok.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const filteredInventories = inventories.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventories.filter((i) => i.quantity <= i.minStock).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Manajemen Stok & Opname
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau stok fisik real-time, lakukan Stock Opname, mutasi penyesuaian, dan transfer antar cabang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {outlets.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (inventories.length > 0) setTransferProductId(inventories[0].productId);
                setIsTransferModalOpen(true);
              }}
              leftIcon={<Truck className="h-4 w-4 text-blue-600" />}
            >
              Transfer Antar Cabang
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={fetchInventoryData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'STOCK'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Daftar Stok & Opname ({inventories.length})</span>
          {lowStockCount > 0 && (
            <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px]">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MOVEMENTS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'MOVEMENTS'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Jejak Mutasi Stok ({movements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSFERS')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'TRANSFERS'
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Riwayat Transfer Cabang ({transfers.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK & OPNAME */}
      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="w-full sm:w-96">
                <Input
                  placeholder="Cari nama barang atau SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="text-xs text-slate-500">
                Menampilkan <strong>{filteredInventories.length}</strong> produk di{' '}
                <strong className="text-blue-600">{activeOutlet.name}</strong>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Nama Produk & SKU</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Stok Sistem</th>
                    <th className="py-3 px-4 text-center">Min. Stok</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Penyesuaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredInventories.map((item) => {
                    const isLow = item.quantity > 0 && item.quantity <= item.minStock;
                    const isOut = item.quantity <= 0;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            SKU: {item.product.sku}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant="default" size="sm">
                            {item.product.category?.name || 'Umum'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-center font-bold font-mono text-sm">
                          <span
                            className={
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-900 dark:text-slate-100'
                            }
                          >
                            {item.quantity} {item.product.unit}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {item.minStock} {item.product.unit}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <Badge variant="error" size="sm">
                              Habis
                            </Badge>
                          ) : isLow ? (
                            <Badge variant="warning" size="sm">
                              Menipis
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm">
                              Aman
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItemForAdjust(item);
                              setAdjustQty(0);
                              setIsAdjustModalOpen(true);
                            }}
                          >
                            Sesuaikan Stok
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MUTATION LOGS */}
      {activeTab === 'MOVEMENTS' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Riwayat Mutasi Stok Otomatis
            </h3>
            <span className="text-xs text-slate-400">Dicatat realtime saat transaksi / opname</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4 text-center">Tipe Mutasi</th>
                  <th className="py-3 px-4 text-center">Perubahan</th>
                  <th className="py-3 px-4 text-center">Stok Akhir</th>
                  <th className="py-3 px-4">Keterangan / Alasan</th>
                  <th className="py-3 px-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDateTime(m.createdAt)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {m.productName}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          m.type === 'SALE'
                            ? 'default'
                            : m.type === 'PURCHASE'
                            ? 'success'
                            : m.type === 'RETURN'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {m.type}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center font-bold font-mono">
                      <span className={m.quantity >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.newQty}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {m.reason || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-500">{m.userName || 'Sistem'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: TRANSFERS */}
      {activeTab === 'TRANSFERS' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Riwayat Transfer Antar Outlet
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">No. Transfer</th>
                  <th className="py-3 px-4">Dari Outlet</th>
                  <th className="py-3 px-4">Tujuan Outlet</th>
                  <th className="py-3 px-4">Barang Ditransfer</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada catatan transfer antar outlet.
                    </td>
                  </tr>
                ) : (
                  transfers.map((trf) => (
                    <tr key={trf.id}>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {trf.transferNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {trf.sourceOutletName}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {trf.destOutletName}
                      </td>
                      <td className="py-3 px-4">
                        {trf.items.map((i) => (
                          <div key={i.productId}>
                            {i.productName} ({i.quantity} pcs)
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success" size="sm">
                          {trf.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(trf.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ADJUST STOCK MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Penyesuaian Stok (Stock Opname)"
        size="md"
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {selectedItemForAdjust?.product.name}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Stok saat ini di {activeOutlet.name}:{' '}
              <strong>
                {selectedItemForAdjust?.quantity} {selectedItemForAdjust?.product.unit}
              </strong>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Jenis Penyesuaian
            </label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ADJUSTMENT">Stock Opname Fisik (Koreksi Selisih)</option>
              <option value="DAMAGE">Barang Rusak / Pecah</option>
              <option value="EXPIRED">Barang Kedaluwarsa (Expired)</option>
              <option value="CORRECTION">Koreksi Salah Input</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Perubahan Kuantitas (+ untuk menambah, - untuk mengurangi)
            </label>
            <Input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              placeholder="Contoh: -2 atau +5"
              required
            />
            {selectedItemForAdjust && (
              <p className="text-[11px] text-slate-400 mt-1">
                Hasil stok baru:{' '}
                <strong className="text-blue-600">
                  {selectedItemForAdjust.quantity + adjustQty} {selectedItemForAdjust.product.unit}
                </strong>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alasan / Catatan Penyesuaian
            </label>
            <Input
              placeholder="Contoh: Hasil cek fisik tanggal..."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAdjustModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Penyesuaian
            </Button>
          </div>
        </form>
      </Modal>

      {/* TRANSFER MODAL */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Stok ke Cabang Lain"
        size="md"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Outlet Asal
            </label>
            <Input value={activeOutlet.name} disabled />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Outlet Tujuan *
            </label>
            <select
              value={destOutletId}
              onChange={(e) => setDestOutletId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {outlets
                .filter((o) => o.id !== activeOutlet.id)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.address || o.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih Produk *
            </label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {inventories.map((i) => (
                <option key={i.productId} value={i.productId}>
                  {i.product.name} (Tersedia: {i.quantity} {i.product.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Jumlah Transfer *
            </label>
            <Input
              type="number"
              min={1}
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Catatan</label>
            <Input
              placeholder="Contoh: Permintaan stok darurat"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Jalankan Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
