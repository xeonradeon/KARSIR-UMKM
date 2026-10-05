'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  BarChart3,
  Menu,
  X,
  Boxes,
  Users,
  Clock,
  Settings,
  Truck,
  Building2,
  Tag,
  UserCog,
  Store,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const { items, setIsCartDrawerOpen } = useCart();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'pos', label: 'Kasir', icon: <ShoppingCart className="h-5 w-5" />, highlight: true },
    { id: 'products', label: 'Produk', icon: <Package className="h-5 w-5" /> },
    { id: 'transactions', label: 'Riwayat', icon: <Receipt className="h-5 w-5" /> },
    { id: 'reports', label: 'Laporan', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const secondaryMenus = [
    { id: 'inventory', label: 'Stok & Opname', icon: <Boxes className="h-5 w-5" /> },
    { id: 'shifts', label: 'Shift Kasir', icon: <Clock className="h-5 w-5" /> },
    { id: 'customers', label: 'Pelanggan & CRM', icon: <Users className="h-5 w-5" /> },
    { id: 'purchases', label: 'Pembelian (PO)', icon: <Truck className="h-5 w-5" /> },
    { id: 'suppliers', label: 'Data Supplier', icon: <Building2 className="h-5 w-5" /> },
    { id: 'promotions', label: 'Diskon & Voucher', icon: <Tag className="h-5 w-5" /> },
    { id: 'employees', label: 'Kelola Pegawai', icon: <UserCog className="h-5 w-5" /> },
    { id: 'outlets', label: 'Cabang Outlet', icon: <Store className="h-5 w-5" /> },
    { id: 'audit', label: 'Log Audit', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { id: 'settings', label: 'Pengaturan Bisnis', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Bottom Floating App Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 pb-safe">
        {mainTabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setIsMoreMenuOpen(false);
                setCurrentView(tab.id as any);
              }}
              className={cn(
                'relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer select-none',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              )}
            >
              {tab.highlight && items.length > 0 && (
                <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
              {tab.icon}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={cn(
            'flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer',
            isMoreMenuOpen ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Lainnya</span>
        </button>
      </nav>

      {/* Mobile More Menus Modal Sheet */}
      {isMoreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Menu Lengkap Aplikasi
              </h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="rounded-xl p-1 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {secondaryMenus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCurrentView(m.id as any);
                    setIsMoreMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <div className="text-blue-600 dark:text-blue-400">{m.icon}</div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
