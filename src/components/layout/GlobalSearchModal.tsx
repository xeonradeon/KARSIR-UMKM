import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah } from '@/utils/formatters';
import { Search, Package, Users, Receipt, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, transactions, setCurrentView } = useApp();
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      )
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
    : [];

  const matchedTransactions = q
    ? transactions.filter(
        (t) =>
          t.invoiceNumber.toLowerCase().includes(q) ||
          (t.customerName && t.customerName.toLowerCase().includes(q))
      )
    : [];

  const handleSelectProduct = (prod: (typeof products)[0]) => {
    addToCart(prod);
    setCurrentView('pos');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-4">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#70798a]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama produk, SKU, barcode, pelanggan, no. struk..."
            className="w-full h-12 pl-12 pr-4 bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-sm font-bold text-[#1a1d24] dark:text-[#f4f2ec] placeholder:text-[#8e97a6] focus:outline-hidden focus:ring-2 focus:ring-[#1f232b]/20 focus:border-[#1f232b] dark:focus:ring-[#f5f4ef]/20 dark:focus:border-[#f5f4ef]"
          />
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {q && (
            <>
              {/* Products match */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-[#7a8394] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    <span>Produk ({matchedProducts.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] hover:border-[#b8b2a5] dark:hover:border-[#485366] bg-[#fcfbf8] dark:bg-[#1c2026] hover:bg-[#efece6] dark:hover:bg-[#252b36] cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-[#efece6] dark:bg-[#252b36] flex items-center justify-center text-[#70798a]">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-[#70798a] font-mono">
                              SKU: {p.sku} | Barcode: {p.barcode}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                            {formatRupiah(p.price)}
                          </div>
                          <span className="text-[10px] font-bold text-[#485060] dark:text-[#a0a8b7] flex items-center gap-0.5 justify-end">
                            + Ke POS <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers match */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-[#7a8394] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>Pelanggan / Member ({matchedCustomers.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCurrentView('customers');
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] hover:border-[#b8b2a5] bg-[#fcfbf8] dark:bg-[#1c2026] cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                            {c.name} ({c.tier})
                          </div>
                          <div className="text-[11px] text-[#70798a]">
                            HP: {c.phone} | Poin: {c.points}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#485060] dark:text-[#a0a8b7]">
                          {formatRupiah(c.totalSpent)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions match */}
              {matchedTransactions.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-[#7a8394] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Struk / Invoice ({matchedTransactions.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedTransactions.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setCurrentView('transactions');
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] hover:border-[#b8b2a5] bg-[#fcfbf8] dark:bg-[#1c2026] cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                            {t.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-[#70798a]">
                            Kasir: {t.cashierName} | {t.payment.method}
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                          {formatRupiah(t.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length === 0 &&
                matchedCustomers.length === 0 &&
                matchedTransactions.length === 0 && (
                  <div className="p-8 text-center text-[#70798a] text-xs">
                    Tidak ditemukan data untuk "{query}".
                  </div>
                )}
            </>
          )}

          {!q && (
            <div className="p-6 text-center space-y-2 text-[#70798a] text-xs">
              <p>Mulai ketik untuk mencari apapun secara instan.</p>
              <div className="flex items-center justify-center gap-2 text-[11px]">
                <kbd className="px-2 py-0.5 bg-[#efece6] dark:bg-[#252b36] rounded-md font-mono">ESC</kbd>
                <span>untuk menutup</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
