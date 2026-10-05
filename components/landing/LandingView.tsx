'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  BarChart3,
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Store,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentView, activeOutlet, user, loginAs } = useApp();

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-10 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-blue-900/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>POS Kasir & ERP UMKM All-in-One</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Aplikasi Kasir Pintar & Manajemen Bisnis Terintegrasi.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Solusi kasir lengkap untuk F&B, Retail, dan Jasa. Dilengkapi transaksi kilat POS, barcode scanner, multi-outlet, kontrol stok opname, laporan laba rugi (P&L), struk thermal, dan program loyalitas CRM.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={() => setCurrentView('POS')}
              leftIcon={<ShoppingCart className="h-5 w-5" />}
              className="bg-blue-500 hover:bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30 px-6"
            >
              Buka Mesin Kasir POS
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentView('DASHBOARD')}
              leftIcon={<LayoutDashboard className="h-5 w-5" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold px-6"
            >
              Dashboard Analitik
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* QUICK LAUNCH GRID */}
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4">
          Modul & Fitur Utama Aplikasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* POS Terminal */}
          <Card
            onClick={() => setCurrentView('POS')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Terminal Kasir (POS)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Katalog produk visual, pencarian kilat, kamera barcode scanner, diskon, custom notes, dan cetak nota.
              </p>
            </div>
          </Card>

          {/* Dashboard */}
          <Card
            onClick={() => setCurrentView('DASHBOARD')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Dashboard & KPI Omset
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ringkasan omset hari ini, laba kotor, produk terlaris, status kas laci, dan peringatan stok menipis.
              </p>
            </div>
          </Card>

          {/* Product Management */}
          <Card
            onClick={() => setCurrentView('PRODUCTS')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Katalog Produk & Barcode
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kelola SKU, harga jual, HPP modal, kategori produk, varian, dan cetak label barcode.
              </p>
            </div>
          </Card>

          {/* Inventory */}
          <Card
            onClick={() => setCurrentView('INVENTORY')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Boxes className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Stok Opname & Mutasi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pantau stok real-time, audit fisik selisih opname, jejak mutasi barang, dan transfer antar cabang.
              </p>
            </div>
          </Card>

          {/* CRM & Customers */}
          <Card
            onClick={() => setCurrentView('CUSTOMERS')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pelanggan & Loyalitas (CRM)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Database member, tier membership, akumulasi poin belanja, riwayat transaksi, dan kasbon.
              </p>
            </div>
          </Card>

          {/* Reports & Financials */}
          <Card
            onClick={() => setCurrentView('REPORTS')}
            className="p-5 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Laporan Keuangan & Laba Rugi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                P&L Statement, grafik tren omset harian, distribusi metode bayar, dan ekspor spreadsheet Excel/CSV.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* DEMO ROLE SWITCHER BAR */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Uji Coba Peran Pengguna (RBAC Simulation)
            </h3>
            <p className="text-xs text-slate-500">
              Login saat ini: <strong>{user?.name}</strong> ({user?.role}) di outlet <strong>{activeOutlet.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant={user?.role === 'OWNER' ? 'primary' : 'outline'}
            onClick={() => loginAs('OWNER')}
          >
            👑 Owner (Full Access)
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'MANAGER' ? 'primary' : 'outline'}
            onClick={() => loginAs('MANAGER')}
          >
            🛡️ Manager Toko
          </Button>
          <Button
            size="sm"
            variant={user?.role === 'CASHIER' ? 'primary' : 'outline'}
            onClick={() => loginAs('CASHIER')}
          >
            🛒 Kasir (POS Only)
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
