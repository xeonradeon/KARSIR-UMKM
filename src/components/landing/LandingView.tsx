import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
  Receipt,
  Clock,
  ClipboardList,
  Store,
  Tag,
  ShieldCheck,
  Building2,
  Settings,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentView, activeOutlet, user, loginAs } = useApp();

  return (
    <div className="min-h-full p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#1f232b] text-[#f7f6f2] p-5 sm:p-8 lg:p-10 shadow-xl border border-[#2d3440] dark:bg-[#1c2026] dark:border-[#2e3542]">
        <div className="relative z-10 max-w-3xl space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a303b] border border-[#3b4352] text-[#f7f6f2] text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>POS Kasir & ERP UMKM Terpadu</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Aplikasi Kasir Pintar & Manajemen Bisnis Terintegrasi.
          </h1>

          <p className="text-xs sm:text-sm text-[#b8c0cf] max-w-2xl leading-relaxed">
            Solusi kasir lengkap untuk F&B, Retail, dan Jasa. Dilengkapi transaksi kilat POS, barcode scanner, multi-outlet, kontrol stok opname, laporan laba rugi (P&L), cetak struk thermal, kas laci / shift kasir, dan program loyalitas CRM.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setCurrentView('pos')}
              leftIcon={<ShoppingCart className="h-5 w-5" />}
              className="bg-[#f5f4ef] text-[#181b21] hover:bg-[#e4e2da] dark:bg-[#f5f4ef] dark:text-[#181b21] font-black px-6"
            >
              Buka Mesin Kasir POS
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              leftIcon={<LayoutDashboard className="h-5 w-5" />}
              className="bg-[#2a303b] hover:bg-[#343c49] text-[#f7f6f2] border-[#3e4757] font-bold px-6"
            >
              Dashboard Analitik
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH GRID */}
      <div>
        <h2 className="text-sm sm:text-base font-black text-[#1a1d24] dark:text-[#f4f2ec] mb-3.5 sm:mb-4 flex items-center gap-2">
          <span>Modul & Fitur Utama Aplikasi</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* POS Terminal */}
          <Card
            onClick={() => setCurrentView('pos')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Terminal Kasir (POS)
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Katalog produk visual, scan barcode, diskon promo, split notes, pembayaran QRIS/Tunai, dan struk thermal.
              </p>
            </div>
          </Card>

          {/* Dashboard */}
          <Card
            onClick={() => setCurrentView('dashboard')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Dashboard & KPI Omset
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Ringkasan omset real-time, laba kotor, produk best seller, kas laci hari ini, dan grafik penjualan.
              </p>
            </div>
          </Card>

          {/* Products */}
          <Card
            onClick={() => setCurrentView('products')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Katalog Produk & Barcode
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Kelola SKU, harga jual & HPP modal, kategori produk, varian ukuran/rasa, serta barcode generator.
              </p>
            </div>
          </Card>

          {/* Inventory */}
          <Card
            onClick={() => setCurrentView('inventory')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <Boxes className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Stok Opname & Mutasi
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Pantau stok per cabang, audit fisik selisih opname, kartu stok mutasi, dan transfer antar gudang.
              </p>
            </div>
          </Card>

          {/* Transactions */}
          <Card
            onClick={() => setCurrentView('transactions')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <Receipt className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Riwayat Transaksi & Struk
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Daftar lengkap invoice transaksi, cetak ulang struk thermal, filter metode bayar, dan refund/void.
              </p>
            </div>
          </Card>

          {/* Shifts & Cash Drawer */}
          <Card
            onClick={() => setCurrentView('shifts')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Shift Kasir & Kas Laci
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Modal awal kasir, pencatatan kas masuk/keluar petty cash, dan perhitungan selisih tutup shift.
              </p>
            </div>
          </Card>

          {/* Customers CRM */}
          <Card
            onClick={() => setCurrentView('customers')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Pelanggan & CRM Member
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Tier member (Bronze-Platinum), poin loyalitas, riwayat belanja, dan pencatatan kasbon/hutang.
              </p>
            </div>
          </Card>

          {/* Reports & Financials */}
          <Card
            onClick={() => setCurrentView('reports')}
            className="p-4 sm:p-5 cursor-pointer hover:border-[#8d96a6] hover:shadow-md transition-all space-y-2.5 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#70798a] group-hover:text-[#1a1d24] dark:group-hover:text-[#f4f2ec] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1a1d24] dark:text-[#f4f2ec]">
                Laporan Keuangan P&L
              </h3>
              <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-1 leading-relaxed">
                Laporan Laba Rugi komprehensif, HPP, margin kotor, pajak & service charge, dan ekspor spreadsheet CSV.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* DEMO ROLE SWITCHER BAR */}
      <Card className="p-4 sm:p-6 bg-[#f7f6f2] dark:bg-[#1c2026] border-[#e2ded6] dark:border-[#2e3542] space-y-3">
        <div>
          <h3 className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec]">
            Uji Coba Peran Pengguna (Role-Based Access Control)
          </h3>
          <p className="text-xs text-[#5c6475] dark:text-[#9aa2b0] mt-0.5">
            Pengguna aktif: <strong>{user?.name}</strong> ({user?.role}) di outlet <strong>{activeOutlet.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant={user?.role === 'OWNER' ? 'primary' : 'outline'}
            onClick={() => loginAs('OWNER')}
          >
            👑 Owner
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'MANAGER' ? 'primary' : 'outline'}
            onClick={() => loginAs('MANAGER')}
          >
            🛡️ Manager
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'CASHIER' ? 'primary' : 'outline'}
            onClick={() => loginAs('CASHIER')}
          >
            🛒 Kasir
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'STAFF_INVENTORY' ? 'primary' : 'outline'}
            onClick={() => loginAs('STAFF_INVENTORY')}
          >
            📦 Staff Gudang
          </Button>
        </div>
      </Card>
    </div>
  );
};
