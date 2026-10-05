'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from './ProductCard';
import { PosCart } from './PosCart';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Product, Category, Transaction } from '@/types';
import {
  Search,
  Barcode,
  Sparkles,
  Layers,
  Filter,
  ShoppingCart,
  Star,
} from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const { activeOutlet, currentView } = useApp();
  const { items, addItem, isCartDrawerOpen, setIsCartDrawerOpen } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [activeOutlet]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products?outletId=${activeOutlet.id}`).then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFavorite = !isFavoritesOnly || p.isFavorite;

    return matchCategory && matchSearch && matchFavorite;
  });

  const categoryTabs = [
    { id: 'all', label: 'Semua Produk' },
    ...categories.map((c) => ({
      id: c.id,
      label: c.name,
      count: products.filter((p) => p.categoryId === c.id).length,
    })),
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100/70 dark:bg-slate-950">
      {/* Left Area: Product Catalog Grid & Search Toolbar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-5">
        {/* Search, Scanner & Filter Controls */}
        <div className="space-y-3 shrink-0 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Cari nama produk, SKU, barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-white dark:bg-slate-900 h-11 text-xs sm:text-sm"
              />
            </div>

            <Button
              variant="outline"
              leftIcon={<Barcode className="h-4 w-4 text-blue-600" />}
              onClick={() => setIsScannerOpen(true)}
              className="bg-white dark:bg-slate-900 shrink-0 h-11"
            >
              Scan Barcode
            </Button>

            <button
              onClick={() => setIsFavoritesOnly(!isFavoritesOnly)}
              title="Filter Produk Favorit / Terlaris"
              className={`flex items-center justify-center h-11 w-11 rounded-xl border transition-colors shrink-0 ${
                isFavoritesOnly
                  ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:border-slate-700'
              }`}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          </div>

          {/* Category Tabs Carousel */}
          <Tabs
            tabs={categoryTabs}
            activeTab={activeCategory}
            onChange={(id) => setActiveCategory(id)}
            className="bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl"
          />
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto pr-1 pb-16 lg:pb-2">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-white/70 dark:bg-slate-900/70 animate-pulse border border-slate-200/50 dark:border-slate-800"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="Produk Tidak Ditemukan"
              description="Coba cari dengan kata kunci lain atau pilih kategori lain."
              actionText="Reset Pencarian"
              onAction={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setIsFavoritesOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addItem} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Desktop Area: Fixed Sticky POS Cart (Width 380px) */}
      <div className="hidden lg:flex flex-col w-96 shrink-0 border-l border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl z-10">
        <PosCart onCheckoutClick={() => setIsCheckoutOpen(true)} />
      </div>

      {/* Mobile Drawer Cart */}
      <Drawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        title="Keranjang Kasir"
        position="right"
        className="w-full sm:max-w-md"
      >
        <div className="h-[calc(100vh-8rem)]">
          <PosCart
            onCheckoutClick={() => {
              setIsCartDrawerOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        </div>
      </Drawer>

      {/* Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(tx) => {
          setCompletedTx(tx);
          fetchInitialData();
        }}
      />

      <ReceiptModal
        isOpen={!!completedTx}
        onClose={() => setCompletedTx(null)}
        transaction={completedTx}
      />
    </div>
  );
};
