'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/lib/finance';
import { Plus, Check, AlertCircle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, variant?: ProductVariant | null) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isAddedAnim, setIsAddedAnim] = useState(false);

  const stock = product.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= product.minStock;

  const handleCardClick = () => {
    if (isOutOfStock) return;

    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setIsVariantModalOpen(true);
      return;
    }

    onAdd(product, null);
    triggerAddedFeedback();
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    onAdd(product, variant);
    setIsVariantModalOpen(false);
    triggerAddedFeedback();
  };

  const triggerAddedFeedback = () => {
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 300);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all duration-150 select-none dark:border-slate-800 dark:bg-slate-900',
          isOutOfStock
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:border-blue-400 hover:shadow-md active:scale-[0.98] cursor-pointer dark:hover:border-blue-600',
          isAddedAnim && 'ring-2 ring-blue-500 scale-[0.99]'
        )}
      >
        {/* Top Badges & Category */}
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex flex-wrap gap-1">
            {product.category && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {product.category.name}
              </span>
            )}
            {product.wholesalePrice && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Grosir
              </span>
            )}
          </div>

          {/* Stock Tag */}
          {isOutOfStock ? (
            <Badge variant="error" size="sm">
              Habis
            </Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm">
              Sisa {stock}
            </Badge>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400">Stok: {stock}</span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1 mb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <div className="text-[10px] text-slate-400 font-mono">
            {product.sku}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-xs font-black text-blue-600 dark:text-blue-400">
              {formatRupiah(product.sellingPrice)}
            </div>
            {product.hasVariants && (
              <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="h-2.5 w-2.5" />
                <span>{product.variants?.length} Varian</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-xl transition-colors',
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300'
            )}
          >
            {isAddedAnim ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {product.hasVariants && (
        <Modal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          size="sm"
          title={`Pilih Varian: ${product.name}`}
          description="Pilih salah satu varian yang dipesan pelanggan"
        >
          <div className="space-y-2">
            {product.variants?.map((v) => {
              const vOutOfStock = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  disabled={vOutOfStock}
                  onClick={() => handleSelectVariant(v)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    vOutOfStock
                      ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900'
                      : 'border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {v.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      SKU: {v.sku} • Stok: {v.stock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {formatRupiah(v.sellingPrice)}
                    </div>
                    {vOutOfStock ? (
                      <Badge variant="error" size="sm">
                        Habis
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        + Tambah
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
};
