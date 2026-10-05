import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, generateInvoiceNumber, playSound } from '@/utils/formatters';
import { Product, PaymentMethod, Transaction } from '@/types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Tag,
  User,
  Utensils,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  Printer,
  AlertCircle,
  FileText,
  Percent,
  X,
  Camera,
  FolderOpen,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PosTerminal: React.FC = () => {
  const {
    products,
    categories,
    activeOutlet,
    user,
    customers,
    addTransaction,
    settings,
    soundEnabled,
    showToast,
  } = useApp();

  const {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    updateItemNotes,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    tableNumber,
    setTableNumber,
    orderNotes,
    appliedPromotion,
    applyPromotion,
    removePromotion,
    customDiscount,
    setCustomDiscount,
    heldOrders,
    holdCurrentOrder,
    restoreHeldOrder,
    deleteHeldOrder,
    itemCount,
    subtotal,
    discountTotal,
    taxTotal,
    serviceFeeTotal,
    grandTotal,
    totalCost,
  } = useCart();

  // Mobile active tab ('catalog' or 'cart') for seamless mobile/tablet experience
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Modals state
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [isCustomDiscountModalOpen, setIsCustomDiscountModalOpen] = useState<boolean>(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState<boolean>(false);
  const [isBarcodeScannerModalOpen, setIsBarcodeScannerModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [paymentRefNumber, setPaymentRefNumber] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');

  // Active note editing item
  const [noteEditingItemId, setNoteEditingItemId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesCategory =
        selectedCategory === 'cat_all' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode scan input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku === barcodeInput.trim()
    );
    if (found) {
      if (found.variants && found.variants.length > 0) {
        setSelectedProductForVariant(found);
      } else {
        addToCart(found);
        showToast('success', `+ ${found.name} dimasukkan ke keranjang`);
      }
      setBarcodeInput('');
    } else {
      showToast('error', `Produk barcode ${barcodeInput} tidak ditemukan!`);
    }
  };

  // Quick cash calculations
  const quickCashOptions = useMemo(() => {
    const total = grandTotal;
    if (total <= 0) return [];
    const exact = total;
    const next5k = Math.ceil(total / 5000) * 5000;
    const next10k = Math.ceil(total / 10000) * 10000;
    const next20k = Math.ceil(total / 20000) * 20000;
    const next50k = Math.ceil(total / 50000) * 50000;
    const next100k = Math.ceil(total / 100000) * 100000;

    const set = new Set([exact, next5k, next10k, next20k, next50k, next100k]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 5);
  }, [grandTotal]);

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      showToast('warning', 'Keranjang masih kosong!');
      return;
    }
    setPaymentMethod('CASH');
    setCashGiven(grandTotal);
    setPaymentRefNumber('');
    setIsPaymentModalOpen(true);
  };

  const handleCompleteTransaction = () => {
    if (paymentMethod === 'CASH' && cashGiven < grandTotal) {
      showToast('error', 'Uang tunai yang diterima kurang dari total belanja!');
      return;
    }

    const change = paymentMethod === 'CASH' ? Math.max(0, cashGiven - grandTotal) : 0;

    const newTrx = addTransaction({
      invoiceNumber: generateInvoiceNumber(),
      outletId: activeOutlet.id,
      outletName: activeOutlet.name,
      cashierId: user.id,
      cashierName: user.name,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      tableNumber: tableNumber || undefined,
      items: [...cart],
      subtotal,
      discountAmount: discountTotal,
      discountNote: appliedPromotion ? appliedPromotion.name : undefined,
      taxAmount: taxTotal,
      serviceFeeAmount: serviceFeeTotal,
      total: grandTotal,
      totalCost,
      grossProfit: grandTotal - totalCost,
      payment: {
        method: paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? cashGiven : grandTotal,
        change,
        referenceNumber:
          paymentRefNumber ||
          (paymentMethod === 'QRIS'
            ? `QRIS-${Math.floor(10000000 + Math.random() * 90000000)}`
            : undefined),
        bankName: paymentMethod === 'DEBIT_EDC' || paymentMethod === 'TRANSFER' ? selectedBank : undefined,
      },
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      notes: orderNotes || undefined,
    });

    setLastCompletedTransaction(newTrx);
    setIsPaymentModalOpen(false);
    clearCart();

    // Trigger celebration effects
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    if (soundEnabled) playSound('cash');

    setIsReceiptModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-[#f7f6f2] dark:bg-[#14171c]">
      {/* MOBILE / TABLET VIEW SWITCHER TABS (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center justify-between p-1.5 border-b border-[#e2ded6] dark:border-[#2e3542] bg-[#fcfbf8] dark:bg-[#181b20] shrink-0">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => setMobileTab('catalog')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer ${
              mobileTab === 'catalog'
                ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                : 'bg-[#efece6] text-[#485060] dark:bg-[#252b36] dark:text-[#9aa2b0]'
            }`}
          >
            <span>Katalog</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/20 font-bold">
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer ${
              mobileTab === 'cart'
                ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                : 'bg-[#efece6] text-[#485060] dark:bg-[#252b36] dark:text-[#9aa2b0]'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Keranjang ({itemCount})</span>
            {grandTotal > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/20 font-bold">
                {formatRupiah(grandTotal)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* LEFT COLUMN: Products Catalog & Categories */}
      <div
        className={`flex-1 flex-col h-full overflow-hidden border-r border-[#e2ded6] dark:border-[#2e3542] ${
          mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Top Control Bar: Search & Barcode & Categories */}
        <div className="p-3 sm:p-4 bg-[#fcfbf8] dark:bg-[#181b20] border-b border-[#e2ded6] dark:border-[#2e3542] space-y-2.5 sm:space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#70798a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, SKU, atau barcode..."
                className="w-full h-10 pl-9 pr-3 text-xs font-bold bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#1f232b]/20 focus:border-[#1f232b] text-[#1a1d24] dark:text-[#f4f2ec] placeholder:text-[#8e97a6] min-h-[42px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#70798a] hover:text-[#1a1d24] p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Direct Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative hidden md:flex items-center">
              <Barcode className="absolute left-3 top-3 h-4 w-4 text-[#70798a]" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode / Enter"
                className="w-44 h-10 pl-9 pr-3 text-xs font-mono font-bold bg-[#f7f6f2] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#1f232b]/20 focus:border-[#1f232b] text-[#1a1d24] dark:text-[#f4f2ec] min-h-[42px]"
              />
            </form>

            {/* Camera Barcode Scanner Trigger Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBarcodeScannerModalOpen(true)}
              leftIcon={<Camera className="h-4 w-4" />}
              className="h-10 px-3 shrink-0"
              title="Buka Kamera Barcode Scanner"
            >
              <span className="hidden sm:inline">Scanner</span>
            </Button>
          </div>

          {/* Categories Pill Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all select-none min-h-[38px] cursor-pointer ${
                    isSelected
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs'
                      : 'bg-[#efece6] text-[#3b4251] dark:bg-[#252b36] dark:text-[#dcd9d2] hover:bg-[#e4e0d7] dark:hover:bg-[#2f3745]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24 lg:pb-4">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#70798a]">
              <Search className="h-12 w-12 stroke-[1.5] mb-3 opacity-40" />
              <p className="text-sm font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                Tidak ada produk yang cocok
              </p>
              <p className="text-xs text-[#70798a] mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((product) => {
                const stock = product.stocks[activeOutlet.id] || 0;
                const isOutOfStock = stock <= 0;
                const hasVariants = product.variants && product.variants.length > 0;

                return (
                  <Card
                    key={product.id}
                    onClick={() => {
                      if (hasVariants) {
                        setSelectedProductForVariant(product);
                      } else {
                        addToCart(product);
                      }
                    }}
                    className={`relative overflow-hidden flex flex-col justify-between p-2.5 sm:p-3 cursor-pointer group transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-50 bg-[#efece6] dark:bg-[#181b20] border-dashed'
                        : 'hover:border-[#7a8394] hover:shadow-md active:scale-95'
                    }`}
                  >
                    {/* Image / Thumbnail */}
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#efece6] dark:bg-[#252b36] mb-2">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#70798a] font-bold text-xs">
                          PRODUK
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-1.5 right-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md shadow-xs ${
                            isOutOfStock
                              ? 'bg-[#1f232b] text-[#f7f6f2] border border-[#3e4757]'
                              : stock <= product.minStock
                              ? 'bg-[#2b313d] text-[#f7f6f2]'
                              : 'bg-[#16191e]/85 text-[#f7f6f2]'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Stok: ${stock}`}
                        </span>
                      </div>

                      {/* Variant Indicator */}
                      {hasVariants && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#1f232b] text-[#f7f6f2] backdrop-blur-md">
                            {product.variants?.length} Varian
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name & SKU */}
                    <div>
                      <h4 className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-[#70798a] mt-0.5 font-mono">
                        {product.sku}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-2 pt-2 border-t border-[#e2ded6] dark:border-[#2e3542] flex items-center justify-between">
                      <span className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                        {formatRupiah(product.price)}
                      </span>
                      <div className="h-7 w-7 rounded-xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* STICKY BOTTOM QUICK CHECKOUT BAR FOR MOBILE (When items exist & in catalog view) */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-[#fcfbf8]/95 dark:bg-[#1c2026]/95 border-t border-[#e2ded6] dark:border-[#2e3542] backdrop-blur-md z-30 shadow-2xl flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-[#70798a] font-bold">
                {itemCount} item di keranjang
              </div>
              <div className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                {formatRupiah(grandTotal)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMobileTab('cart')}
                className="h-11 px-3"
              >
                Lihat
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenPayment}
                className="h-11 px-5 font-black text-xs"
              >
                Bayar Sekarang
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: POS Cart & Order Actions */}
      <div
        className={`w-full lg:w-96 xl:w-[420px] flex-col h-full bg-[#fcfbf8] dark:bg-[#181b20] shadow-xl select-none ${
          mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Customer & Order Header */}
        <div className="p-3 sm:p-3.5 border-b border-[#e2ded6] dark:border-[#2e3542] space-y-2 bg-[#f7f6f2] dark:bg-[#181b20] shrink-0">
          <div className="flex items-center gap-2">
            {/* Customer Picker Button */}
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#fcfbf8] dark:bg-[#20252e] hover:bg-[#efece6] dark:hover:bg-[#282f3a] text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] transition-colors min-h-[40px] cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 text-[#485060] dark:text-[#a0a8b7] shrink-0" />
                <span className="truncate">
                  {selectedCustomer
                    ? `${selectedCustomer.name} (${selectedCustomer.tier})`
                    : 'Pilih Pelanggan / Member'}
                </span>
              </div>
              {selectedCustomer && (
                <span className="text-[10px] bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] px-1.5 py-0.5 rounded-md font-bold">
                  {selectedCustomer.points} P
                </span>
              )}
            </button>

            {/* Table Number Input (F&B) */}
            <div className="w-28 relative">
              <Utensils className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#70798a]" />
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="No. Meja"
                className="w-full h-10 pl-8 pr-2 text-xs font-bold bg-[#fcfbf8] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-xl text-[#1a1d24] dark:text-[#f4f2ec] min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#70798a]">
              <div className="h-12 w-12 rounded-2xl bg-[#efece6] dark:bg-[#252b36] flex items-center justify-center mb-3 text-[#485060] dark:text-[#a0a8b7]">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                Keranjang Kasir Kosong
              </p>
              <p className="text-[11px] text-[#70798a] mt-1">
                Pilih menu di katalog atau scan barcode untuk menambahkan item.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileTab('catalog')}
                className="mt-4 lg:hidden text-xs font-bold"
              >
                Kembali ke Katalog
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] bg-[#fcfbf8] dark:bg-[#1c2026] space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec] truncate">
                      {item.productName}
                    </h5>
                    {item.variantName && (
                      <span className="text-[10px] font-bold text-[#70798a]">
                        Varian: {item.variantName}
                      </span>
                    )}
                    <div className="text-[11px] font-semibold text-[#70798a]">
                      {formatRupiah(item.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper (min 40px touch zone) */}
                  <div className="flex items-center gap-1.5 bg-[#efece6] dark:bg-[#252b36] p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 rounded-lg bg-[#fcfbf8] dark:bg-[#1c2026] text-[#1a1d24] dark:text-[#f4f2ec] flex items-center justify-center hover:bg-[#e4e0d7] transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 rounded-lg bg-[#fcfbf8] dark:bg-[#1c2026] text-[#1a1d24] dark:text-[#f4f2ec] flex items-center justify-center hover:bg-[#e4e0d7] transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal & Notes Button */}
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#e2ded6] dark:border-[#2e3542]">
                  <button
                    onClick={() => {
                      setNoteEditingItemId(item.id);
                      setNoteInput(item.notes || '');
                    }}
                    className="text-[11px] text-[#70798a] hover:text-[#1a1d24] dark:hover:text-[#f4f2ec] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{item.notes ? `Catatan: "${item.notes}"` : '+ Catatan khusus'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-[#1a1d24] dark:text-[#f4f2ec]">
                      {formatRupiah(item.subtotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-[#8d96a6] hover:text-[#1a1d24] dark:hover:text-[#f4f2ec] transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Payment Trigger */}
        <div className="p-3 sm:p-3.5 border-t border-[#e2ded6] dark:border-[#2e3542] bg-[#f7f6f2] dark:bg-[#181b20] space-y-2.5 shrink-0">
          {/* Promo Code & Custom Discount Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#fcfbf8] dark:bg-[#20252e] text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] min-h-[38px] cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Tag className="h-3.5 w-3.5 text-[#485060] dark:text-[#a0a8b7] shrink-0" />
                <span className="truncate">
                  {appliedPromotion ? appliedPromotion.code : 'Kode Promo'}
                </span>
              </div>
              {appliedPromotion && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removePromotion();
                  }}
                  className="font-black text-xs ml-1"
                >
                  ✕
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCustomDiscountModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#fcfbf8] dark:bg-[#20252e] text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] flex items-center gap-1 min-h-[38px] cursor-pointer"
            >
              <Percent className="h-3.5 w-3.5 text-[#485060] dark:text-[#a0a8b7]" />
              <span>{customDiscount.value > 0 ? `${customDiscount.value}%` : 'Diskon'}</span>
            </button>

            <button
              onClick={() => setIsHeldOrdersModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#efece6] dark:bg-[#252b36] text-[#1a1d24] dark:text-[#f4f2ec] text-xs font-black flex items-center gap-1 min-h-[38px] cursor-pointer"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>({heldOrders.length})</span>
            </button>
          </div>

          {/* Breakdown summary */}
          <div className="space-y-1 text-xs text-[#5c6475] dark:text-[#9aa2b0]">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} item)</span>
              <span className="font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                {formatRupiah(subtotal)}
              </span>
            </div>

            {discountTotal > 0 && (
              <div className="flex justify-between font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                <span>Diskon / Voucher</span>
                <span>- {formatRupiah(discountTotal)}</span>
              </div>
            )}

            {settings.taxEnabled && taxTotal > 0 && (
              <div className="flex justify-between">
                <span>PB1 / Pajak ({(activeOutlet.taxRate * 100).toFixed(0)}%)</span>
                <span>{formatRupiah(taxTotal)}</span>
              </div>
            )}

            {settings.serviceFeeEnabled && serviceFeeTotal > 0 && (
              <div className="flex justify-between">
                <span>Biaya Layanan ({(activeOutlet.serviceFeeRate * 100).toFixed(0)}%)</span>
                <span>{formatRupiah(serviceFeeTotal)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-[#e2ded6] dark:border-[#2e3542] text-[#1a1d24] dark:text-[#f4f2ec]">
              <span className="text-xs font-black uppercase tracking-wider">Total Tagihan</span>
              <span className="text-base sm:text-lg font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => holdCurrentOrder()}
              disabled={cart.length === 0}
              className="text-xs h-11"
            >
              Parkir
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="text-xs h-11"
            >
              Batal
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="text-xs h-11 font-black"
            >
              Bayar (F9)
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL: Variant Selector */}
      {selectedProductForVariant && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProductForVariant(null)}
          title={`Pilih Varian: ${selectedProductForVariant.name}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0]">
              Silakan tentukan pilihan varian atau ukuran yang diinginkan:
            </p>
            <div className="space-y-2">
              {selectedProductForVariant.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    addToCart(selectedProductForVariant, v);
                    setSelectedProductForVariant(null);
                    showToast('success', `+ ${selectedProductForVariant.name} (${v.name})`);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] hover:border-[#7a8394] bg-[#fcfbf8] dark:bg-[#1c2026] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-all text-left group min-h-[48px] cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                      {v.name}
                    </div>
                    <div className="text-[10px] text-[#70798a] font-mono">{v.sku}</div>
                  </div>
                  <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                    {formatRupiah(v.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Item Custom Notes */}
      {noteEditingItemId && (
        <Modal
          isOpen={true}
          onClose={() => setNoteEditingItemId(null)}
          title="Tambah Catatan Menu"
          maxWidth="sm"
          footer={
            <Button
              onClick={() => {
                updateItemNotes(noteEditingItemId, noteInput);
                setNoteEditingItemId(null);
              }}
            >
              Simpan Catatan
            </Button>
          }
        >
          <div className="space-y-2">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Contoh: Less ice, gula dipisah, ekstra sambal..."
              rows={3}
              className="w-full p-3 text-xs bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl focus:ring-2 focus:ring-[#1f232b]/20 text-[#1a1d24] dark:text-[#f4f2ec]"
            />
          </div>
        </Modal>
      )}

      {/* MODAL: Customer Selection */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Pilih Pelanggan / Member CRM"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0]">Pilih pelanggan untuk poin loyalitas:</p>
            {selectedCustomer && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setSelectedCustomer(null);
                  setIsCustomerModalOpen(false);
                }}
              >
                Hapus Pelanggan
              </Button>
            )}
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c);
                  setIsCustomerModalOpen(false);
                  showToast('success', `Pelanggan ${c.name} dipilih`);
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                  selectedCustomer?.id === c.id
                    ? 'border-[#1f232b] bg-[#efece6] dark:border-[#f5f4ef] dark:bg-[#252b36]'
                    : 'border-[#e2ded6] dark:border-[#2e3542] hover:border-[#7a8394] bg-[#fcfbf8] dark:bg-[#1c2026]'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-[#70798a]">
                    HP: {c.phone} | Total Belanja: {formatRupiah(c.totalSpent)}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="primary" size="sm">
                    {c.tier}
                  </Badge>
                  <div className="text-[10px] text-[#5c6475] dark:text-[#9aa2b0] font-bold mt-1">{c.points} Poin</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: Promo Voucher */}
      <Modal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title="Pasang Kode Voucher Promo"
        maxWidth="sm"
        footer={
          <Button
            onClick={() => {
              if (applyPromotion(promoCodeInput)) {
                setIsPromoModalOpen(false);
                setPromoCodeInput('');
              }
            }}
          >
            Terapkan Voucher
          </Button>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
            placeholder="Ketik kode (Contoh: DISKON10)"
            className="w-full h-11 px-3 text-xs uppercase font-mono font-bold bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl"
          />
          <div className="text-[11px] text-[#70798a]">
            Promo yang tersedia: <strong>DISKON10</strong> (10% off), <strong>HEMAT15K</strong> (Rp 15.000 off)
          </div>
        </div>
      </Modal>

      {/* MODAL: Custom Discount */}
      <Modal
        isOpen={isCustomDiscountModalOpen}
        onClose={() => setIsCustomDiscountModalOpen(false)}
        title="Diskon Manual Tagihan"
        maxWidth="sm"
        footer={
          <Button
            onClick={() => {
              setIsCustomDiscountModalOpen(false);
              showToast('success', 'Diskon manual diterapkan');
            }}
          >
            Simpan Diskon
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setCustomDiscount({ ...customDiscount, type: 'percent' })}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border min-h-[40px] cursor-pointer ${
                customDiscount.type === 'percent'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                  : 'border-[#dcd7ce] text-[#485060] dark:border-[#333b49] dark:text-[#a0a8b7]'
              }`}
            >
              Persen (%)
            </button>
            <button
              onClick={() => setCustomDiscount({ ...customDiscount, type: 'fixed' })}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border min-h-[40px] cursor-pointer ${
                customDiscount.type === 'fixed'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                  : 'border-[#dcd7ce] text-[#485060] dark:border-[#333b49] dark:text-[#a0a8b7]'
              }`}
            >
              Nominal (Rp)
            </button>
          </div>

          <input
            type="number"
            value={customDiscount.value || ''}
            onChange={(e) =>
              setCustomDiscount({ ...customDiscount, value: Math.max(0, Number(e.target.value)) })
            }
            placeholder={customDiscount.type === 'percent' ? 'Contoh: 10' : 'Contoh: 15000'}
            className="w-full h-11 px-3 text-xs font-bold bg-[#f7f6f2] dark:bg-[#181b20] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl"
          />
        </div>
      </Modal>

      {/* MODAL: Held / Parked Orders */}
      <Modal
        isOpen={isHeldOrdersModalOpen}
        onClose={() => setIsHeldOrdersModalOpen(false)}
        title={`Daftar Pesanan Terparkir (${heldOrders.length})`}
        maxWidth="lg"
      >
        <div className="space-y-3">
          {heldOrders.length === 0 ? (
            <p className="text-xs text-[#70798a] text-center py-6">
              Tidak ada pesanan yang sedang diparkir.
            </p>
          ) : (
            heldOrders.map((h) => {
              const holdTotal = h.items.reduce((s, i) => s + i.quantity * i.price, 0);
              return (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] flex items-center justify-between bg-[#fcfbf8] dark:bg-[#1c2026]"
                >
                  <div>
                    <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec] flex items-center gap-2">
                      <span>{h.orderNumber}</span>
                      {h.tableNumber && (
                        <span className="text-[10px] bg-[#efece6] dark:bg-[#252b36] px-1.5 py-0.5 rounded-md font-bold">
                          {h.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#70798a] mt-0.5">
                      {h.customerName || 'Pelanggan Umum'} | {h.items.length} item ({formatRupiah(holdTotal)})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => {
                        restoreHeldOrder(h.id);
                        setIsHeldOrdersModalOpen(false);
                      }}
                    >
                      Buka Pesanan
                    </Button>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => deleteHeldOrder(h.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* MODAL: Barcode Scanner Camera Simulator */}
      <Modal
        isOpen={isBarcodeScannerModalOpen}
        onClose={() => setIsBarcodeScannerModalOpen(false)}
        title="Kamera Barcode Scanner POS"
        maxWidth="md"
      >
        <div className="space-y-4 text-center">
          <div className="relative aspect-video rounded-2xl bg-[#16191e] flex flex-col items-center justify-center text-white overflow-hidden border-2 border-[#383f4d]">
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-[#dcd7ce]/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="h-0.5 w-full bg-[#f5f4ef] shadow-md shadow-[#f5f4ef]/50 animate-pulse" />
            </div>
            <Camera className="h-10 w-10 text-[#70798a] mb-2 opacity-50" />
            <p className="text-xs text-[#e4e2db] font-bold">
              Arahkan barcode produk ke dalam kotak scanner
            </p>
          </div>

          <p className="text-xs text-[#70798a]">
            Klik salah satu barcode cepat untuk simulasi pemindaian:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  addToCart(p);
                  setIsBarcodeScannerModalOpen(false);
                  showToast('success', `Scanned: ${p.name}`);
                }}
                className="p-3 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] bg-[#fcfbf8] dark:bg-[#1c2026] text-left hover:border-[#7a8394] text-xs min-h-[44px] cursor-pointer"
              >
                <div className="font-bold truncate text-[#1a1d24] dark:text-[#f4f2ec]">{p.name}</div>
                <div className="text-[10px] text-[#70798a] font-mono">{p.barcode}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL: Payment Checkout */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pembayaran Transaksi Kasir"
        maxWidth="2xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <div className="text-xs text-[#5c6475] dark:text-[#9aa2b0]">
              Total Tagihan: <strong className="text-[#1a1d24] dark:text-[#f4f2ec] text-sm">{formatRupiah(grandTotal)}</strong>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleCompleteTransaction}
                disabled={paymentMethod === 'CASH' && cashGiven < grandTotal}
                className="px-6 font-bold"
              >
                Selesaikan Pembayaran (Enter)
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Payment Method Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[48px] cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21] font-bold shadow-xs'
                  : 'border-[#e2ded6] text-[#485060] dark:border-[#2e3542] dark:text-[#9aa2b0] bg-[#fcfbf8] dark:bg-[#1c2026]'
              }`}
            >
              <Banknote className="h-5 w-5" />
              <span className="text-xs">Tunai (Cash)</span>
            </button>

            <button
              onClick={() => setPaymentMethod('QRIS')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[48px] cursor-pointer ${
                paymentMethod === 'QRIS'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21] font-bold shadow-xs'
                  : 'border-[#e2ded6] text-[#485060] dark:border-[#2e3542] dark:text-[#9aa2b0] bg-[#fcfbf8] dark:bg-[#1c2026]'
              }`}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-xs">QRIS Instan</span>
            </button>

            <button
              onClick={() => setPaymentMethod('DEBIT_EDC')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[48px] cursor-pointer ${
                paymentMethod === 'DEBIT_EDC'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21] font-bold shadow-xs'
                  : 'border-[#e2ded6] text-[#485060] dark:border-[#2e3542] dark:text-[#9aa2b0] bg-[#fcfbf8] dark:bg-[#1c2026]'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Debit EDC</span>
            </button>

            <button
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[48px] cursor-pointer ${
                paymentMethod === 'TRANSFER'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21] font-bold shadow-xs'
                  : 'border-[#e2ded6] text-[#485060] dark:border-[#2e3542] dark:text-[#9aa2b0] bg-[#fcfbf8] dark:bg-[#1c2026]'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Transfer</span>
            </button>

            <button
              onClick={() => setPaymentMethod('HUTANG_KASBON')}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 min-h-[48px] cursor-pointer ${
                paymentMethod === 'HUTANG_KASBON'
                  ? 'border-[#1f232b] bg-[#1f232b] text-[#f7f6f2] dark:border-[#f5f4ef] dark:bg-[#f5f4ef] dark:text-[#181b21] font-bold shadow-xs'
                  : 'border-[#e2ded6] text-[#485060] dark:border-[#2e3542] dark:text-[#9aa2b0] bg-[#fcfbf8] dark:bg-[#1c2026]'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs">Kasbon / Hutang</span>
            </button>
          </div>

          {/* Details based on Payment Method */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 bg-[#f7f6f2] dark:bg-[#181b20] p-4 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542]">
              <div>
                <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                  Uang Tunai Diterima (Rp)
                </label>
                <input
                  type="number"
                  autoFocus
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Math.max(0, Number(e.target.value)))}
                  className="w-full h-12 px-4 text-lg font-black text-[#1a1d24] dark:text-[#f4f2ec] bg-[#fcfbf8] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl min-h-[48px]"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {quickCashOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCashGiven(amount)}
                    className="px-3.5 py-2 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#fcfbf8] dark:bg-[#20252e] text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] hover:border-[#7a8394] min-h-[40px] cursor-pointer"
                  >
                    {amount === grandTotal ? 'Uang Pas' : formatRupiah(amount)}
                  </button>
                ))}
              </div>

              {/* Change summary */}
              <div className="flex justify-between items-center pt-3 border-t border-[#e2ded6] dark:border-[#2e3542]">
                <span className="text-xs font-bold text-[#70798a]">Kembalian:</span>
                <span className="text-base font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                  {cashGiven >= grandTotal
                    ? formatRupiah(cashGiven - grandTotal)
                    : `Kurang ${formatRupiah(grandTotal - cashGiven)}`}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
            <div className="flex flex-col items-center justify-center p-6 bg-[#f7f6f2] dark:bg-[#181b20] rounded-2xl border border-[#e2ded6] dark:border-[#2e3542] text-center space-y-3">
              <div className="h-44 w-44 bg-white p-3 rounded-2xl shadow-md border border-[#e2ded6] flex flex-col items-center justify-center">
                <QrCode className="h-32 w-32 text-[#1a1d24]" />
                <span className="text-[9px] font-bold text-[#70798a]">NMID: ID10200392019</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec]">
                  Scan QRIS Dinamis (Gopay, OVO, Dana, BCA, ShopeePay, LinkAja)
                </p>
                <p className="text-[11px] text-[#70798a] mt-0.5">
                  Total Tagihan: <strong>{formatRupiah(grandTotal)}</strong>
                </p>
              </div>
            </div>
          )}

          {(paymentMethod === 'DEBIT_EDC' || paymentMethod === 'TRANSFER') && (
            <div className="space-y-3 bg-[#f7f6f2] dark:bg-[#181b20] p-4 rounded-2xl border border-[#e2ded6] dark:border-[#2e3542]">
              <div>
                <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                  Pilih Bank / Mesin EDC
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-11 px-3 bg-[#fcfbf8] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-xs font-bold min-h-[44px]"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="CIMB">CIMB Niaga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1d24] dark:text-[#f4f2ec] mb-1">
                  Nomor Referensi / Approval Code EDC (Opsional)
                </label>
                <input
                  type="text"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  placeholder="Contoh: REF-88910293"
                  className="w-full h-11 px-3 bg-[#fcfbf8] dark:bg-[#20252e] border border-[#dcd7ce] dark:border-[#333b49] rounded-2xl text-xs font-bold min-h-[44px]"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'HUTANG_KASBON' && (
            <div className="p-4 bg-[#efece6] dark:bg-[#252b36] rounded-2xl border border-[#dcd7ce] dark:border-[#333b49] text-xs text-[#1a1d24] dark:text-[#f4f2ec] space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-[#485060]" />
                <span>Peringatan Pembayaran Kasbon</span>
              </div>
              <p>
                Tagihan senilai <strong>{formatRupiah(grandTotal)}</strong> akan dicatat ke saldo hutang member{' '}
                <strong>{selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum'}</strong>.
              </p>
              {!selectedCustomer && (
                <p className="text-[#3b4251] dark:text-[#c4cad4] font-bold">
                  * Harap pilih member terlebih dahulu agar hutang tercatat pada database pelanggan!
                </p>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: Printable Thermal Receipt */}
      {lastCompletedTransaction && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Transaksi Berhasil!"
          maxWidth="sm"
          footer={
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-4 w-4" />}
                className="flex-1"
              >
                Cetak Struk
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 font-bold"
              >
                Transaksi Baru
              </Button>
            </div>
          }
        >
          {/* Thermal Paper Look */}
          <div className="p-4 bg-white text-[#1a1d24] font-mono text-[11px] border border-[#dcd7ce] rounded-2xl shadow-inner space-y-3">
            <div className="text-center space-y-0.5">
              <h4 className="text-xs font-bold">{settings.name}</h4>
              <p className="text-[10px] text-[#70798a]">{settings.tagline}</p>
              <p className="text-[10px] text-[#70798a]">{activeOutlet.address}</p>
              <p className="text-[10px] text-[#70798a]">Telp: {activeOutlet.phone}</p>
            </div>

            <div className="border-t border-b border-dashed border-[#dcd7ce] py-1.5 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No: {lastCompletedTransaction.invoiceNumber}</span>
                <span>{new Date(lastCompletedTransaction.createdAt).toLocaleTimeString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir: {lastCompletedTransaction.cashierName}</span>
                <span>{lastCompletedTransaction.payment.method}</span>
              </div>
              {lastCompletedTransaction.customerName && (
                <div>Pelanggan: {lastCompletedTransaction.customerName}</div>
              )}
              {lastCompletedTransaction.tableNumber && (
                <div>Meja: {lastCompletedTransaction.tableNumber}</div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {lastCompletedTransaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{item.productName}</span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                  <div className="text-[10px] text-[#70798a]">
                    {item.quantity} x {formatRupiah(item.price)}
                    {item.notes && ` (${item.notes})`}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-dashed border-[#dcd7ce] pt-1.5 space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(lastCompletedTransaction.subtotal)}</span>
              </div>
              {lastCompletedTransaction.discountAmount > 0 && (
                <div className="flex justify-between text-[#5c6475]">
                  <span>Diskon</span>
                  <span>- {formatRupiah(lastCompletedTransaction.discountAmount)}</span>
                </div>
              )}
              {lastCompletedTransaction.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Pajak PB1</span>
                  <span>{formatRupiah(lastCompletedTransaction.taxAmount)}</span>
                </div>
              )}
              {lastCompletedTransaction.serviceFeeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatRupiah(lastCompletedTransaction.serviceFeeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs pt-1 border-t border-[#1a1d24]">
                <span>TOTAL</span>
                <span>{formatRupiah(lastCompletedTransaction.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] pt-1">
                <span>Bayar ({lastCompletedTransaction.payment.method})</span>
                <span>{formatRupiah(lastCompletedTransaction.payment.amountPaid)}</span>
              </div>
              {lastCompletedTransaction.payment.change > 0 && (
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Kembalian</span>
                  <span>{formatRupiah(lastCompletedTransaction.payment.change)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-[#70798a] pt-2 border-t border-dashed border-[#dcd7ce] space-y-0.5">
              <p className="whitespace-pre-line">{settings.receiptFooter}</p>
              <p className="text-[9px] text-[#9ba4b5] pt-1">Sistem KasirKu • SFG Developer</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
