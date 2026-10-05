import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Download, Upload, RotateCcw, Volume2, Store } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    soundEnabled,
    toggleSound,
    backupDatabaseJSON,
    restoreDatabaseJSON,
    resetToInitialData,
    showToast,
  } = useApp();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [taxEnabled, setTaxEnabled] = useState(settings.taxEnabled);
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(settings.serviceFeeEnabled);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const handleSaveSettings = () => {
    updateSettings({
      name,
      tagline,
      phone,
      email,
      taxEnabled,
      serviceFeeEnabled,
      receiptFooter,
    });
    showToast('success', 'Pengaturan toko berhasil diperbarui!');
  };

  const handleDownloadBackup = () => {
    const jsonStr = backupDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kasirku_pos_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'File cadangan JSON database berhasil diunduh.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        restoreDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
          Pengaturan Toko & Konfigurasi Sistem
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Identitas bisnis, footer struk thermal, preferensi pajak, dan cadangan data
        </p>
      </div>

      {/* Store Identity Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Store className="h-4 w-4 text-blue-600" />
          <span>Profil & Identitas Bisnis</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Usaha / Toko *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon / CS
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Tax and Service charge toggles */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={taxEnabled}
              onChange={(e) => setTaxEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Aktifkan Pajak Restoran PB1 (11%) pada setiap transaksi
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={serviceFeeEnabled}
              onChange={(e) => setServiceFeeEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Aktifkan Biaya Layanan / Service Charge (5%) pada kasir
            </span>
          </label>
        </div>

        {/* Receipt Footer */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Pesan Penutup Struk Thermal (Receipt Footer)
          </label>
          <textarea
            rows={3}
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSaveSettings}
          leftIcon={<Save className="h-4 w-4" />}
          className="font-bold bg-blue-600"
        >
          Simpan Konfigurasi
        </Button>
      </Card>

      {/* Database Backup & Restore */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Cadangan & Pemulihan Data (Database Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          Unduh seluruh data produk, transaksi, riwayat shift, dan pelanggan dalam format JSON atau pulihkan data dari file sebelumnya.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadBackup}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Unduh Cadangan JSON
          </Button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Pulihkan Dari File JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data demo awal?')) {
                resetToInitialData();
              }
            }}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border-none font-bold"
          >
            Reset Database Demo
          </Button>
        </div>
      </Card>
    </div>
  );
};
