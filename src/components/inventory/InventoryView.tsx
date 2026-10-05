import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import { Product, StockOpname, StockOpnameItem } from '@/types';
import {
  Boxes,
  ClipboardCheck,
  ArrowRightLeft,
  Search,
  Plus,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    outlets,
    activeOutlet,
    stockOpnames,
    addStockOpname,
    updateProductStock,
    showToast,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'stocks' | 'opname' | 'transfer'>('stocks');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Opname Form State
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [opnameNotes, setOpnameNotes] = useState('');
  const [opnameCounts, setOpnameCounts] = useState<Record<string, number>>({});

  // Transfer State
  const [transferFromOutlet, setTransferFromOutlet] = useState(activeOutlet.id);
  const [transferToOutlet, setTransferToOutlet] = useState(
    outlets.find((o) => o.id !== activeOutlet.id)?.id || outlets[0]?.id
  );
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState(1);
  const [transferNote, setTransferNote] = useState('');

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const handleStartOpname = () => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      initial[p.id] = p.stocks[activeOutlet.id] || 0;
    });
    setOpnameCounts(initial);
    setOpnameNotes('');
    setIsOpnameModalOpen(true);
  };

  const handleSaveOpname = () => {
    const items: StockOpnameItem[] = products.map((p) => {
      const systemStock = p.stocks[activeOutlet.id] || 0;
      const physicalStock = opnameCounts[p.id] ?? systemStock;
      const difference = physicalStock - systemStock;
      return {
        productId: p.id,
        productName: p.name,
        systemStock,
        physicalStock,
        difference,
        costDifference: difference * p.costPrice,
      };
    });

    const newOpname = addStockOpname({
      outletId: activeOutlet.id,
      outletName: activeOutlet.name,
      conductedBy: user.name,
      createdAt: new Date().toISOString(),
      items,
      notes: opnameNotes,
      status: 'APPROVED',
    });

    // Apply differences to product stock
    items.forEach((item) => {
      if (item.difference !== 0) {
        updateProductStock(
          item.productId,
          activeOutlet.id,
          item.difference,
          'ADJUSTMENT',
          `Hasil Opname #${newOpname.id.slice(-4)}`
        );
      }
    });

    setIsOpnameModalOpen(false);
    showToast('success', 'Hasil Stock Opname berhasil disimpan & disesuaikan!');
  };

  const handleExecuteTransfer = () => {
    if (transferFromOutlet === transferToOutlet) {
      showToast('error', 'Outlet asal dan tujuan tidak boleh sama!');
      return;
    }
    const prod = products.find((p) => p.id === transferProductId);
    if (!prod) return;

    const available = prod.stocks[transferFromOutlet] || 0;
    if (transferQty > available) {
      showToast('error', `Stok di outlet asal tidak mencukupi (Tersedia: ${available})`);
      return;
    }

    // Deduct from source
    updateProductStock(
      prod.id,
      transferFromOutlet,
      -transferQty,
      'TRANSFER',
      `Mutasi keluar ke ${outlets.find((o) => o.id === transferToOutlet)?.name}`
    );

    // Add to target
    updateProductStock(
      prod.id,
      transferToOutlet,
      transferQty,
      'TRANSFER',
      `Mutasi masuk dari ${outlets.find((o) => o.id === transferFromOutlet)?.name}`
    );

    showToast(
      'success',
      `Transfer ${transferQty} ${prod.unit} ${prod.name} berhasil dilakukan.`
    );
    setTransferQty(1);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Manajemen Stok & Opname
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrol stok fisik per cabang, audit opname selisih, dan mutasi barang antar outlet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleStartOpname}
            leftIcon={<ClipboardCheck className="h-4 w-4" />}
            className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
          >
            Mulai Stok Opname Fisik
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'stocks'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Status Stok Cabang
        </button>
        <button
          onClick={() => setActiveTab('opname')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'opname'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Riwayat Opname ({stockOpnames.length})
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'transfer'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Transfer Antar Cabang
        </button>
      </div>

      {/* TAB 1: STOCKS */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <Card className="overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">HPP Satuan</th>
                  {outlets.map((o) => (
                    <th key={o.id} className="py-3 px-4 text-center">
                      {o.name}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Total Nilai Aset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const totalAllOutlets = (Object.values(p.stocks) as number[]).reduce((a, b) => a + (b || 0), 0);
                  const totalAssetVal = totalAllOutlets * p.costPrice;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-4">{formatRupiah(p.costPrice)}</td>
                      {outlets.map((o) => {
                        const s = p.stocks[o.id] || 0;
                        return (
                          <td key={o.id} className="py-3 px-4 text-center">
                            <Badge
                              variant={s <= 0 ? 'danger' : s <= p.minStock ? 'warning' : 'default'}
                              size="sm"
                            >
                              {s} {p.unit}
                            </Badge>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                        {formatRupiah(totalAssetVal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 2: OPNAME HISTORY */}
      {activeTab === 'opname' && (
        <div className="space-y-3">
          {stockOpnames.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Belum ada riwayat audit stok opname.
            </Card>
          ) : (
            stockOpnames.map((so) => (
              <Card key={so.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
                      Audit Opname #{so.id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Oleh: <strong>{so.conductedBy}</strong> di {so.outletName} |{' '}
                      {formatDateTime(so.createdAt)}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {so.status}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                      <tr>
                        <th className="py-2 px-3">Produk</th>
                        <th className="py-2 px-3 text-center">Sistem</th>
                        <th className="py-2 px-3 text-center">Fisik Nyata</th>
                        <th className="py-2 px-3 text-center">Selisih</th>
                        <th className="py-2 px-3 text-right">Nilai Selisih HPP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {so.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold">{it.productName}</td>
                          <td className="py-2 px-3 text-center">{it.systemStock}</td>
                          <td className="py-2 px-3 text-center font-bold">{it.physicalStock}</td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`font-bold ${
                                it.difference === 0
                                  ? 'text-slate-400'
                                  : it.difference > 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {it.difference > 0 ? `+${it.difference}` : it.difference}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatRupiah(it.costDifference)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: TRANSFER */}
      {activeTab === 'transfer' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Formulir Transfer / Mutasi Antar Cabang
            </h3>
            <p className="text-xs text-slate-500">Kirim stok barang dari satu cabang ke cabang lainnya</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dari Cabang Asal
              </label>
              <select
                value={transferFromOutlet}
                onChange={(e) => setTransferFromOutlet(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ke Cabang Tujuan
              </label>
              <select
                value={transferToOutlet}
                onChange={(e) => setTransferToOutlet(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Produk
            </label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Tersedia: {p.stocks[transferFromOutlet] || 0} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Transfer
              </label>
              <input
                type="number"
                value={transferQty}
                onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value)))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Mutasi
              </label>
              <input
                type="text"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="Contoh: Stok menipis"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleExecuteTransfer}
            leftIcon={<ArrowRightLeft className="h-4 w-4" />}
            className="w-full font-bold"
          >
            Kirim & Mutasikan Barang
          </Button>
        </Card>
      )}

      {/* MODAL: Stock Opname Counting */}
      <Modal
        isOpen={isOpnameModalOpen}
        onClose={() => setIsOpnameModalOpen(false)}
        title={`Audit Stok Opname Fisik — ${activeOutlet.name}`}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpnameModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveOpname} className="font-bold">
              Simpan & Sesuaikan Stok
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500">
            Masukkan jumlah fisik aktual yang dihitung di toko. Sistem akan otomatis menghitung selisih dan melakukan jurnal penyesuaian.
          </p>

          <div className="space-y-2">
            {products.map((p) => {
              const systemStock = p.stocks[activeOutlet.id] || 0;
              const physicalCount = opnameCounts[p.id] ?? systemStock;
              const diff = physicalCount - systemStock;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Stok Sistem: {systemStock} {p.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={physicalCount}
                      onChange={(e) =>
                        setOpnameCounts({
                          ...opnameCounts,
                          [p.id]: Number(e.target.value),
                        })
                      }
                      className="w-20 h-9 px-2 text-center font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />

                    <span
                      className={`w-12 text-right font-bold text-xs ${
                        diff === 0 ? 'text-slate-400' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
