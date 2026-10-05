'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp, AppView } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/finance';
import { Product } from '@/types';
import {
  Search,
  Package,
  ShoppingCart,
  Receipt,
  Boxes,
  Users,
  BarChart3,
  Settings,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentView, activeOutlet } = useApp();
  const { addItem } = useCart();

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?outletId=${activeOutlet.id}`).then((r) => r.json());
      if (res.success) setProducts(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const navShortcuts = [
    { label: 'Buka Kasir (POS)', icon: <ShoppingCart className="h-4 w-4" />, view: 'pos' },
    { label: 'Kelola Katalog Produk', icon: <Package className="h-4 w-4" />, view: 'products' },
    { label: 'Riwayat Transaksi', icon: <Receipt className="h-4 w-4" />, view: 'transactions' },
    { label: 'Stok & Stock Opname', icon: <Boxes className="h-4 w-4" />, view: 'inventory' },
    { label: 'Laporan Keuangan', icon: <BarChart3 className="h-4 w-4" />, view: 'reports' },
    { label: 'Data Pelanggan (CRM)', icon: <Users className="h-4 w-4" />, view: 'customers' },
    { label: 'Pengaturan Usaha', icon: <Settings className="h-4 w-4" />, view: 'settings' },
  ];

  const filteredShortcuts = navShortcuts.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectNav = (view: AppView) => {
    setCurrentView(view);
    onClose();
  };

  const handleSelectProduct = (product: Product) => {
    addItem(product);
    setCurrentView('pos');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Cari produk, SKU, barcode, atau navigasi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="text-base h-12"
          />
        </div>

        {/* Product Search Results */}
        {filteredProducts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Produk Ditemukan ({filteredProducts.length})
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-blue-50 hover:border-blue-200 cursor-pointer dark:border-slate-800 dark:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 font-bold text-xs text-blue-600 dark:bg-slate-800 dark:border-slate-700">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>SKU: {p.sku}</span>
                        {p.barcode && <span>• Barcode: {p.barcode}</span>}
                        <span>• Stok: {p.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {formatRupiah(p.sellingPrice)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      + Tambah ke POS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Shortcuts */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pintasan Menu Cepat
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {filteredShortcuts.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSelectNav(s.view as AppView)}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-slate-400">{s.icon}</div>
                  <span>{s.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
