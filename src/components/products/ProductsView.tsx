import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/utils/formatters';
import { Product, ProductVariant } from '@/types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Barcode,
  Printer,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    activeOutlet,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodePreviewProduct, setBarcodePreviewProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      return matchCat && matchQ;
    });
  }, [products, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setFormName('');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormBarcode(`899${Math.floor(100000000 + Math.random() * 900000000)}`);
    setFormCategoryId(categories[0]?.id || 'cat_all');
    setFormPrice(25000);
    setFormCostPrice(15000);
    setFormMinStock(5);
    setFormUnit('Pcs');
    setFormImageUrl('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80');
    setFormVariants([]);
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategoryId(p.categoryId);
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice);
    setFormMinStock(p.minStock);
    setFormUnit(p.unit);
    setFormImageUrl(p.imageUrl || '');
    setFormVariants(p.variants || []);
    setIsCreateModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formName.trim()) {
      showToast('error', 'Nama produk wajib diisi!');
      return;
    }

    const cat = categories.find((c) => c.id === formCategoryId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        sku: formSku,
        barcode: formBarcode,
        categoryId: formCategoryId,
        categoryName: cat?.name || 'Umum',
        price: formPrice,
        costPrice: formCostPrice,
        minStock: formMinStock,
        unit: formUnit,
        imageUrl: formImageUrl || undefined,
        variants: formVariants.length > 0 ? formVariants : undefined,
      });
      showToast('success', `Produk ${formName} berhasil diperbarui.`);
    } else {
      addProduct({
        name: formName,
        sku: formSku,
        barcode: formBarcode,
        categoryId: formCategoryId,
        categoryName: cat?.name || 'Umum',
        price: formPrice,
        costPrice: formCostPrice,
        minStock: formMinStock,
        unit: formUnit,
        imageUrl: formImageUrl || undefined,
        isActive: true,
        stocks: {
          [activeOutlet.id]: 25, // default initial stock for demo
        },
        variants: formVariants.length > 0 ? formVariants : undefined,
      });
      showToast('success', `Produk ${formName} berhasil ditambahkan.`);
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteProduct = (p: Product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${p.name}"?`)) {
      deleteProduct(p.id);
      showToast('info', `Produk ${p.name} telah dihapus.`);
    }
  };

  const addVariantField = () => {
    const newV: ProductVariant = {
      id: `v_${Date.now()}`,
      name: 'Ukuran L',
      sku: `${formSku}-L`,
      price: formPrice + 5000,
      costPrice: formCostPrice + 3000,
    };
    setFormVariants([...formVariants, newV]);
  };

  const removeVariant = (id: string) => {
    setFormVariants(formVariants.filter((v) => v.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Katalog Produk & Barcode
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola inventaris master, HPP modal, harga jual, dan barcode produk
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-bold bg-blue-600 shadow-md shadow-blue-500/25"
        >
          Tambah Produk Baru
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama produk, SKU, barcode..."
            className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">HPP (Modal)</th>
                <th className="py-3.5 px-4">Harga Jual</th>
                <th className="py-3.5 px-4">Margin Laba</th>
                <th className="py-3.5 px-4">Stok ({activeOutlet.code})</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const stock = p.stocks[activeOutlet.id] || 0;
                const margin = p.price - p.costPrice;
                const marginPercent = p.price > 0 ? ((margin / p.price) * 100).toFixed(1) : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {p.sku} | Barcode: {p.barcode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" size="sm">
                        {p.categoryName}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-500">
                      {formatRupiah(p.costPrice)}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-600">
                        {formatRupiah(margin)} ({marginPercent}%)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={stock <= 0 ? 'danger' : stock <= p.minStock ? 'warning' : 'success'}
                        size="sm"
                      >
                        {stock} {p.unit}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setBarcodePreviewProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Cetak Barcode Label"
                        >
                          <Barcode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Produk"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Hapus Produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Create & Edit Product */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveProduct} className="font-bold">
              Simpan Data Produk
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Produk *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: Kopi Susu Aren"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode SKU
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode Barcode (EAN-13 / UPC)
              </label>
              <input
                type="text"
                value={formBarcode}
                onChange={(e) => setFormBarcode(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Row 3: Pricing & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                HPP Modal (Rp)
              </label>
              <input
                type="number"
                value={formCostPrice}
                onChange={(e) => setFormCostPrice(Math.max(0, Number(e.target.value)))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => setFormPrice(Math.max(0, Number(e.target.value)))}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Satuan & Min Stok
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="Pcs/Cup"
                  className="w-1/2 h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <input
                  type="number"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(Number(e.target.value))}
                  placeholder="Min"
                  className="w-1/2 h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Foto Produk (URL Gambar)
            </label>
            <input
              type="text"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Row 5: Variants */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>Varian Produk (Ukuran/Rasa)</span>
              </span>
              <Button size="xs" variant="outline" onClick={addVariantField}>
                + Tambah Varian
              </Button>
            </div>

            {formVariants.length > 0 && (
              <div className="space-y-2">
                {formVariants.map((v, i) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...formVariants];
                        updated[i].name = e.target.value;
                        setFormVariants(updated);
                      }}
                      placeholder="Nama Varian"
                      className="flex-1 h-8 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const updated = [...formVariants];
                        updated[i].price = Number(e.target.value);
                        setFormVariants(updated);
                      }}
                      placeholder="Harga Jual"
                      className="w-24 h-8 px-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => removeVariant(v.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL: Barcode Print Preview */}
      {barcodePreviewProduct && (
        <Modal
          isOpen={true}
          onClose={() => setBarcodePreviewProduct(null)}
          title="Cetak Label Barcode Harga"
          maxWidth="sm"
          footer={
            <Button onClick={() => window.print()} leftIcon={<Printer className="h-4 w-4" />}>
              Cetak Barcode Label
            </Button>
          }
        >
          <div className="p-6 bg-white text-slate-900 text-center border border-slate-200 rounded-2xl space-y-3">
            <div className="text-xs font-black">{barcodePreviewProduct.name}</div>
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Barcode className="h-16 w-48 text-slate-900" />
              <span className="font-mono text-xs font-bold tracking-widest mt-1">
                {barcodePreviewProduct.barcode}
              </span>
            </div>
            <div className="text-base font-black text-slate-900">
              {formatRupiah(barcodePreviewProduct.price)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
