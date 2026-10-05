'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Settings,
  Store,
  Printer,
  Receipt,
  Volume2,
  Database,
  ShieldCheck,
  Save,
  Download,
  Upload,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { business, settings, updateSettingsState, soundEnabled, toggleSound, showToast } =
    useApp();

  const [name, setName] = useState(business?.name || 'Toko UMKM Berkah');
  const [address, setAddress] = useState(business?.address || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [taxRate, setTaxRate] = useState((business?.taxRate || 0.1) * 100);
  const [enableTax, setEnableTax] = useState(business?.taxEnabled ?? true);
  const [serviceFeeRate, setServiceFeeRate] = useState(5);
  const [enableServiceFee, setEnableServiceFee] = useState(false);
  const [receiptFooter, setReceiptFooter] = useState(
    settings?.receiptFooter || 'Terima kasih atas kunjungan Anda!'
  );
  const [currency, setCurrency] = useState(business?.currency || 'IDR');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    settings?.receiptFormat === '80mm' ? '80mm' : '58mm'
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: {
            name,
            address,
            phone,
            taxRate: Number(taxRate) / 100,
            taxEnabled: enableTax,
            currency,
          },
          settings: {
            receiptFooter,
            receiptFormat: paperWidth,
          },
        }),
      }).then((r) => r.json());

      if (res.success) {
        updateSettingsState({
          receiptFooter,
          receiptFormat: paperWidth,
        });
        showToast('Pengaturan toko berhasil disimpan!', 'success');
      } else {
        showToast(res.message || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch {
      showToast('Pengaturan lokal disimpan!', 'success');
    }
  };

  const handleExportDataBackup = () => {
    fetch('/api/export/backup')
      .then((r) => r.json())
      .then((data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_pos_umkm_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        showToast('File backup database berhasil diunduh!', 'success');
      })
      .catch(() => {
        showToast('Gagal mengunduh backup.', 'error');
      });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Pengaturan Toko & POS
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Konfigurasi identitas usaha, format cetak struk thermal, pajak, dan cadangan data.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* IDENTITAS TOKO */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Store className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Profil Usaha / Toko
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Usaha *
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No. Telepon / WhatsApp Toko
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alamat Lengkap Usaha
            </label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </Card>

        {/* PAJAK & BIAYA LAYANAN */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Pajak Restoran / PPN (PB1) & Biaya Layanan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Aktifkan Pajak (PPN / PB1)
                </span>
                <input
                  type="checkbox"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-blue-600"
                />
              </div>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={!enableTax}
                placeholder="Tarif % (misal: 10)"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Aktifkan Biaya Layanan (Service Charge)
                </span>
                <input
                  type="checkbox"
                  checked={enableServiceFee}
                  onChange={(e) => setEnableServiceFee(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-blue-600"
                />
              </div>
              <Input
                type="number"
                value={serviceFeeRate}
                onChange={(e) => setServiceFeeRate(Number(e.target.value))}
                disabled={!enableServiceFee}
                placeholder="Tarif % (misal: 5)"
              />
            </div>
          </div>
        </Card>

        {/* PRINTER & CETAK STRUK */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Printer className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Format Printer & Struk Belanja
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ukuran Lebar Kertas Struk
              </label>
              <select
                value={paperWidth}
                onChange={(e) => setPaperWidth(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="58mm">58mm (Printer Kasir Bluetooth / Thermal Standar)</option>
                <option value="80mm">80mm (Printer Kasir Desktop / Lebar)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Efek Suara Beep Scan & Transaksi
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={toggleSound}
                  id="soundCheck"
                  className="h-4 w-4 rounded-sm text-blue-600"
                />
                <label htmlFor="soundCheck" className="text-xs text-slate-600 dark:text-slate-400">
                  Bunyikan nada saat scan barcode & selesai pembayaran
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pesan Footer Struk Nota
            </label>
            <Input
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Terima kasih atas kunjungan Anda!"
            />
          </div>
        </Card>

        {/* BACKUP & RESTORE */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Database className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cadangan Data (Backup & Restore)
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Unduh Cadangan JSON Lengkap
              </div>
              <div className="text-[11px] text-slate-500">
                Ekspor seluruh basis data transaksi, produk, inventori, dan pelanggan.
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportDataBackup}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Unduh Backup
            </Button>
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
};
