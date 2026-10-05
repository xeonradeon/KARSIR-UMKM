'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/finance';
import { Product, Category, Brand, Supplier, WholesalePriceTier, ProductVariant } from '@/types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  Layers,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  Boxes,
  Printer,
  Download,
  Check,
  X,
  ShoppingCart,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';

export const ProductsView: React.FC = () => {
  const { activeOutlet, setCurrentView, showToast } = useApp();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterStockStatus, setFilterStockStatus] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    barcode: string;
    categoryId: string;
    supplierId: string;
    costPrice: number;
    sellingPrice: number;
    memberPrice: number;
    unit: string;
    minStock: number;
    initialStock: number;
    description: string;
    isActive: boolean;
    wholesaleTiers: WholesalePriceTier[];
    variants: ProductVariant[];
  }>({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    supplierId: '',
    costPrice: 0,
    sellingPrice: 0,
    memberPrice: 0,
    unit: 'pcs',
    minStock: 5,
    initialStock: 0,
    description: '',
    isActive: true,
    wholesaleTiers: [],
    variants: [],
  });

  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [activeOutlet]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?outletId=${activeOutlet.id}`).then((r) => r.json());
      if (res.success) setProducts(res.data);
    } catch {
      showToast('Gagal memuat daftar produk.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories').then((r) => r.json());
      if (res.success) setCategories(res.data);
    } catch {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers').then((r) => r.json());
      if (res.success) setSuppliers(res.data);
    } catch {}
  };

  const openCreateModal = () => {
    const randomSku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomBarcode = `899${Math.floor(100000000 + Math.random() * 900000000)}`;
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: randomSku,
      barcode: randomBarcode,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      costPrice: 0,
      sellingPrice: 0,
      memberPrice: 0,
      unit: 'pcs',
      minStock: 5,
      initialStock: 10,
      description: '',
      isActive: true,
      wholesaleTiers: [],
      variants: [],
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      memberPrice: product.memberPrice || 0,
      unit: product.unit,
      minStock: product.minStock,
      initialStock: product.stock,
      description: product.description || '',
      isActive: product.isActive,
      wholesaleTiers: product.wholesalePrices || [],
      variants: product.variants || [],
    });
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama produk wajib diisi!', 'warning');
      return;
    }
    if (formData.sellingPrice <= 0) {
      showToast('Harga jual harus lebih dari 0!', 'warning');
      return;
    }

    try {
      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}?outletId=${activeOutlet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            wholesalePrices: formData.wholesaleTiers,
          }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Produk berhasil diperbarui!', 'success');
          setIsFormModalOpen(false);
          fetchProducts();
        } else {
          showToast(res.message || 'Gagal menyimpan perubahan.', 'error');
        }
      } else {
        // Create
        const res = await fetch(`/api/products?outletId=${activeOutlet.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            wholesalePrices: formData.wholesaleTiers,
            initialStock: formData.initialStock,
          }),
        }).then((r) => r.json());

        if (res.success) {
          showToast('Produk baru berhasil ditambahkan!', 'success');
          setIsFormModalOpen(false);
          fetchProducts();
        } else {
          showToast(res.message || 'Gagal menambahkan produk.', 'error');
        }
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      }).then((r) => r.json());

      if (res.success) {
        showToast(`Produk "${productToDelete.name}" berhasil dihapus.`, 'info');
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        showToast(res.message || 'Gagal menghapus produk.', 'error');
      }
    } catch {
      showToast('Gagal menghapus produk.', 'error');
    }
  };

  // Render Barcode in Modal
  useEffect(() => {
    if (isBarcodeModalOpen && selectedBarcodeProduct && barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, selectedBarcodeProduct.barcode || selectedBarcodeProduct.sku, {
          format: 'CODE128',
          lineColor: '#000',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }
    }
  }, [isBarcodeModalOpen, selectedBarcodeProduct]);

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;

    let matchesStock = true;
    if (filterStockStatus === 'LOW') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (filterStockStatus === 'OUT') matchesStock = p.stock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Katalog & Manajemen Produk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola data barang, harga bertingkat/grosir, barcode, varian, dan stok minimum di{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{activeOutlet.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Tambah Produk Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Input
              placeholder="Cari nama barang, SKU, atau kode barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">Semua Kategori ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="LOW">⚠️ Stok Menipis (≤ Min Stok)</option>
              <option value="OUT">❌ Stok Habis (0)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table Card */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nama Produk & Barcode</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-center">Stok Outlet</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat daftar produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada produk yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.minStock;
                  const isOut = p.stock <= 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>SKU: {p.sku}</span>
                          {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          {p.variants && p.variants.length > 0 && (
                            <span className="text-blue-600 font-sans font-semibold">
                              ({p.variants.length} Varian)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="default" size="sm">
                          {p.category?.name || 'Umum'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {formatRupiah(p.costPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        <div>{formatRupiah(p.sellingPrice)}</div>
                        {p.memberPrice ? (
                          <div className="text-[10px] text-emerald-600 font-sans font-semibold">
                            Member: {formatRupiah(p.memberPrice)}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-xl text-xs ${
                            isOut
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isLow
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Min: {p.minStock}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={p.isActive ? 'success' : 'default'} size="sm">
                          {p.isActive ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        {/* Add to POS shortcut */}
                        <button
                          onClick={() => {
                            addItem(p);
                            showToast(`"${p.name}" ditambahkan ke keranjang kasir`, 'success');
                          }}
                          title="Tambah ke Keranjang Kasir"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>

                        {/* Barcode button */}
                        <button
                          onClick={() => {
                            setSelectedBarcodeProduct(p);
                            setIsBarcodeModalOpen(true);
                          }}
                          title="Lihat / Cetak Barcode"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50"
                        >
                          <Barcode className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Produk"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Hapus Produk"
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Produk *
              </label>
              <Input
                placeholder="Contoh: Kopi Susu Gula Aren 250ml"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SKU / Kode Barang *</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Barcode / EAN-13
              </label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="899..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kategori</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Satuan Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="pcs">pcs (Satuan Barang)</option>
                <option value="cup">cup (Gelas/Minuman)</option>
                <option value="porsi">porsi (Makanan)</option>
                <option value="box">box / dus</option>
                <option value="kg">kg (Kilogram)</option>
                <option value="gram">gram</option>
                <option value="liter">liter</option>
                <option value="botol">botol</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Harga Modal Pokok (HPP)
              </label>
              <Input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Harga Jual Normal *
              </label>
              <Input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Harga Khusus Member (CRM)
              </label>
              <Input
                type="number"
                value={formData.memberPrice}
                onChange={(e) => setFormData({ ...formData, memberPrice: Number(e.target.value) })}
                placeholder="Kosongkan jika sama"
              />
            </div>

            {!editingProduct && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Stok Awal di {activeOutlet.name}
                </label>
                <Input
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) =>
                    setFormData({ ...formData, initialStock: Number(e.target.value) })
                  }
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Batas Minimum Peringatan Stok
              </label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* BARCODE PREVIEW & PRINT MODAL */}
      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        title="Label & Barcode Produk"
        size="md"
      >
        <div className="space-y-4 text-center">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
            <div className="text-xs font-bold text-slate-900">
              {selectedBarcodeProduct?.name}
            </div>
            <div className="text-sm font-black text-blue-600">
              {selectedBarcodeProduct && formatRupiah(selectedBarcodeProduct.sellingPrice)}
            </div>
            <svg ref={barcodeSvgRef} className="max-w-full" />
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => {
                window.print();
              }}
            >
              Cetak Label Barcode
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Produk"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus produk{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              "{productToDelete?.name}"
            </strong>
            ? Data stok dan riwayat inventori terkait produk ini akan dihapus.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteProduct}>
              Ya, Hapus Produk
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
