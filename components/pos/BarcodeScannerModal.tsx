'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { playScanSound } from '@/lib/audio';
import { Barcode, Search, Check, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const { activeOutlet, showToast } = useApp();
  const { addItem } = useCart();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      setIsSearching(true);
      const res = await fetch(`/api/products?barcode=${encodeURIComponent(code)}&outletId=${activeOutlet.id}`);
      const data = await res.json();

      if (data.success && data.data) {
        playScanSound();
        addItem(data.data);
        setLastScanned(`${data.data.name} (SKU: ${data.data.sku})`);
        setBarcodeInput('');
        showToast('success', `Ditambahkan: ${data.data.name}`);
      } else {
        showToast('error', `Barcode atau SKU "${code}" tidak ditemukan.`);
      }
    } catch {
      showToast('error', 'Gagal memindai barcode.');
    } finally {
      setIsSearching(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Scanner Barcode / SKU"
      description="Gunakan scanner barcode USB/Bluetooth atau ketik manual"
    >
      <div className="space-y-4 text-center">
        {/* Animated Scanner Visual Box */}
        <div className="relative mx-auto flex h-32 w-full max-w-xs flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40 p-4 dark:border-blue-700 dark:bg-blue-950/20 overflow-hidden">
          <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-sm shadow-rose-500 animate-bounce" />
          <Barcode className="h-16 w-16 text-blue-600 dark:text-blue-400 opacity-80" />
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mt-2">
            Arahkan scanner ke kode barcode
          </span>
        </div>

        <form onSubmit={handleScanSubmit} className="space-y-3">
          <Input
            ref={inputRef}
            placeholder="Scan barcode atau ketik SKU disini..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="text-center text-base font-bold font-mono h-12"
            autoFocus
          />
          <div className="flex justify-center gap-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSearching}
              leftIcon={<Search className="h-4 w-4" />}
            >
              Cari & Tambah ke POS
            </Button>
          </div>
        </form>

        {/* Recent scan result */}
        {lastScanned && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 animate-in fade-in">
            <Check className="h-4 w-4" />
            <span>Berhasil ditambah: {lastScanned}</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400">
          💡 Tips: Scanner barcode hardware bertindak seperti keyboard yang otomatis menekan Enter setelah scan.
        </div>
      </div>
    </Modal>
  );
};
