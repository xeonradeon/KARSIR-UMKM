'use client';

import React from 'react';
import { useApp, AppView } from '@/context/AppContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  Building2,
  Receipt,
  Clock,
  Users,
  BarChart3,
  Tag,
  UserCog,
  Store,
  FileSpreadsheet,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  permission?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, user, unreadNotifsCount } = useApp();

  const navGroups: NavGroup[] = [
    {
      title: 'UTAMA',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
          permission: PERMISSIONS.DASHBOARD_VIEW,
        },
        {
          id: 'pos',
          label: 'Kasir (POS)',
          icon: <ShoppingCart className="h-4 w-4" />,
          permission: PERMISSIONS.POS_VIEW,
        },
      ],
    },
    {
      title: 'KATALOG & STOK',
      items: [
        {
          id: 'products',
          label: 'Produk & Barcode',
          icon: <Package className="h-4 w-4" />,
          permission: PERMISSIONS.PRODUCTS_VIEW,
        },
        {
          id: 'inventory',
          label: 'Stok & Opname',
          icon: <Boxes className="h-4 w-4" />,
          permission: PERMISSIONS.INVENTORY_VIEW,
        },
        {
          id: 'purchases',
          label: 'Pembelian (PO)',
          icon: <Truck className="h-4 w-4" />,
          permission: PERMISSIONS.PURCHASES_MANAGE,
        },
        {
          id: 'suppliers',
          label: 'Data Supplier',
          icon: <Building2 className="h-4 w-4" />,
          permission: PERMISSIONS.SUPPLIERS_MANAGE,
        },
      ],
    },
    {
      title: 'PENJUALAN & OPERASIONAL',
      items: [
        {
          id: 'transactions',
          label: 'Transaksi & Nota',
          icon: <Receipt className="h-4 w-4" />,
          permission: PERMISSIONS.TRANSACTIONS_VIEW,
        },
        {
          id: 'shifts',
          label: 'Shift Kasir',
          icon: <Clock className="h-4 w-4" />,
          permission: PERMISSIONS.SHIFTS_VIEW,
        },
        {
          id: 'customers',
          label: 'Pelanggan & CRM',
          icon: <Users className="h-4 w-4" />,
          permission: PERMISSIONS.CUSTOMERS_VIEW,
        },
      ],
    },
    {
      title: 'STRATEGI & PENGATURAN',
      items: [
        {
          id: 'reports',
          label: 'Laporan & Finansial',
          icon: <BarChart3 className="h-4 w-4" />,
          permission: PERMISSIONS.REPORTS_VIEW,
        },
        {
          id: 'promotions',
          label: 'Diskon & Voucher',
          icon: <Tag className="h-4 w-4" />,
          permission: PERMISSIONS.SETTINGS_MANAGE,
        },
        {
          id: 'employees',
          label: 'Kelola Pegawai',
          icon: <UserCog className="h-4 w-4" />,
          permission: PERMISSIONS.EMPLOYEES_MANAGE,
        },
        {
          id: 'outlets',
          label: 'Cabang Outlet',
          icon: <Store className="h-4 w-4" />,
          permission: PERMISSIONS.SETTINGS_MANAGE,
        },
        {
          id: 'audit',
          label: 'Audit Log & Jejak',
          icon: <FileSpreadsheet className="h-4 w-4" />,
          permission: PERMISSIONS.AUDIT_VIEW,
        },
        {
          id: 'settings',
          label: 'Pengaturan Bisnis',
          icon: <Settings className="h-4 w-4" />,
          permission: PERMISSIONS.SETTINGS_MANAGE,
        },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group) => {
          // Filter items by user role permissions
          const visibleItems = group.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(user?.role, item.permission, user?.permissions);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {group.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer',
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={cn(isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                          isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Offline Status Badge */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold">Mode Siap Offline</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500/90 mt-1 leading-tight">
            Transaksi kasir otomatis disimpan & aman bila internet terputus.
          </p>
        </div>
      </div>
    </aside>
  );
};
