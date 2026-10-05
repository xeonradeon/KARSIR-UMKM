import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { AppView, Role } from '@/types';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Receipt,
  Users,
  BarChart3,
  Tag,
  Store,
  Settings,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, user, products, activeOutlet } = useApp();
  const { heldOrders } = useCart();
  const [collapsed, setCollapsed] = useState(false);

  // Check low stock count
  const lowStockCount = products.filter((p) => {
    const stock = p.stocks[activeOutlet.id] || 0;
    return stock <= p.minStock;
  }).length;

  const navItems: NavItem[] = [
    {
      id: 'landing',
      label: 'Home & Overview',
      icon: Sparkles,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER', 'STAFF_INVENTORY'],
    },
    {
      id: 'pos',
      label: 'Kasir (POS)',
      icon: ShoppingCart,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
      badge: heldOrders.length > 0 ? `${heldOrders.length}` : undefined,
    },
    {
      id: 'dashboard',
      label: 'Dashboard Omset',
      icon: LayoutDashboard,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'products',
      label: 'Produk & Barcode',
      icon: Package,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF_INVENTORY'],
    },
    {
      id: 'inventory',
      label: 'Stok & Opname',
      icon: Boxes,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF_INVENTORY'],
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
    },
    {
      id: 'transactions',
      label: 'Riwayat Transaksi',
      icon: Receipt,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      id: 'shifts',
      label: 'Shift & Kas Laci',
      icon: Clock,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      id: 'customers',
      label: 'Pelanggan & CRM',
      icon: Users,
      allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      id: 'reports',
      label: 'Laporan Laba Rugi',
      icon: BarChart3,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'purchases',
      label: 'Purchase Order (PO)',
      icon: ClipboardList,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF_INVENTORY'],
    },
    {
      id: 'suppliers',
      label: 'Pemasok / Vendor',
      icon: Store,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF_INVENTORY'],
    },
    {
      id: 'promotions',
      label: 'Promo & Diskon',
      icon: Tag,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'employees',
      label: 'Karyawan & Staff',
      icon: Users,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'outlets',
      label: 'Cabang & Outlet',
      icon: Building2,
      allowedRoles: ['OWNER'],
    },
    {
      id: 'audit',
      label: 'Audit Log Sistem',
      icon: ShieldCheck,
      allowedRoles: ['OWNER'],
    },
    {
      id: 'settings',
      label: 'Pengaturan Toko',
      icon: Settings,
      allowedRoles: ['OWNER', 'MANAGER'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.allowedRoles.includes(user.role));

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-[#e2ded6] bg-[#fcfbf8] dark:border-[#2e3542] dark:bg-[#181b20] transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs'
                  : 'text-[#485060] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-current' : 'text-[#6c7585] dark:text-[#8d96a6]'
                }`}
              />

              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {!collapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-current'
                      : 'bg-[#e5e1d7] text-[#2c323e] dark:bg-[#2e3542] dark:text-[#f4f2ec]'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#1f232b] dark:bg-[#f5f4ef]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Collapse Button */}
      <div className="p-3 border-t border-[#e2ded6] dark:border-[#2e3542] shrink-0">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-[#6c7585] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-colors text-xs font-bold cursor-pointer min-h-[40px]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Kecilkan Menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
