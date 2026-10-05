import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDateTime } from '@/utils/formatters';
import { PurchaseOrder, PurchaseOrderItem } from '@/types';
import { ClipboardList, Plus, Search, CheckCircle2, Truck, Eye } from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    products,
    activeOutlet,
    addPurchaseOrder,
    receivePurchaseOrder,
    user,
    showToast,
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // New PO Form
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      quantity: 20,
      costPrice: products[0]?.costPrice || 10000,
      subtotal: (products[0]?.costPrice || 10000) * 20,
    },
  ]);
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    const prod = products[0];
    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: 10,
        costPrice: prod.costPrice,
        subtotal: prod.costPrice * 10,
      },
    ]);
  };

  const handleSavePO = () => {
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) return;

    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    addPurchaseOrder({
      poNumber,
      supplierId: sup.id,
      supplierName: sup.name,
      outletId: activeOutlet.id,
      outletName: activeOutlet.name,
      items,
      totalAmount,
      status: 'ORDERED',
      createdAt: new Date().toISOString(),
      notes,
    });

    setIsCreateModalOpen(false);
    showToast('success', `Purchase Order ${poNumber} berhasil diterbitkan.`);
  };

  const handleReceive = (po: PurchaseOrder) => {
    if (confirm(`Terima barang pesanan ${po.poNumber} dan masukkan ke stok gudang ${po.outletName}?`)) {
      receivePurchaseOrder(po.id);
      showToast('success', `Stok barang dari ${po.supplierName} telah masuk ke gudang!`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Purchase Order (PO) & Kulakan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemesanan bahan baku & restock produk dari supplier ke cabang
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Buat PO Baru
        </Button>
      </div>

      {/* PO Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
              <tr>
                <th className="py-3 px-4">No. PO</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Outlet Tujuan</th>
                <th className="py-3 px-4">Tanggal Order</th>
                <th className="py-3 px-4">Total Biaya Kulak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {po.poNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {po.supplierName}
                  </td>
                  <td className="py-3 px-4">{po.outletName}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDateTime(po.createdAt)}</td>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">
                    {formatRupiah(po.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={po.status === 'RECEIVED' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {po.status === 'RECEIVED' ? 'Diterima di Gudang' : 'Menunggu Pengiriman'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedPO(po)}
                        leftIcon={<Eye className="h-3 w-3" />}
                      >
                        Detail
                      </Button>
                      {po.status === 'ORDERED' && (
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => handleReceive(po)}
                          leftIcon={<Truck className="h-3 w-3" />}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                        >
                          Terima Barang
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Create PO */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Purchase Order (PO) Kulakan"
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSavePO} className="font-bold">
              Terbitkan Purchase Order
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Supplier / Vendor
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Item Produk yang Dipesan
              </label>
              <Button size="xs" variant="outline" onClick={handleAddItem}>
                + Tambah Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      const updated = [...items];
                      updated[idx] = {
                        ...updated[idx],
                        productId: prod.id,
                        productName: prod.name,
                        costPrice: prod.costPrice,
                        subtotal: prod.costPrice * updated[idx].quantity,
                      };
                      setItems(updated);
                    }
                  }}
                  className="flex-1 h-9 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const q = Math.max(1, Number(e.target.value));
                    const updated = [...items];
                    updated[idx].quantity = q;
                    updated[idx].subtotal = q * updated[idx].costPrice;
                    setItems(updated);
                  }}
                  placeholder="Qty"
                  className="w-16 h-9 px-2 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200"
                />

                <span className="w-24 text-right font-bold text-slate-900 dark:text-slate-100">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan PO
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pengiriman sebelum jam 12 siang"
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* MODAL: View PO Details */}
      {selectedPO && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPO(null)}
          title={`Detail PO: ${selectedPO.poNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <div>Supplier: <strong>{selectedPO.supplierName}</strong></div>
              <div>Outlet: <strong>{selectedPO.outletName}</strong></div>
              <div>Status: <strong>{selectedPO.status}</strong></div>
              {selectedPO.receivedAt && (
                <div>Diterima: <strong>{formatDateTime(selectedPO.receivedAt)}</strong></div>
              )}
            </div>

            <div className="space-y-1">
              {selectedPO.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{it.productName} ({it.quantity} x {formatRupiah(it.costPrice)})</span>
                  <span className="font-bold">{formatRupiah(it.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-sm pt-2">
              <span>Total Biaya</span>
              <span className="text-blue-600">{formatRupiah(selectedPO.totalAmount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
