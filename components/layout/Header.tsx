'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import {
  Store,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Search,
  ShoppingCart,
  Clock,
  UserCheck,
  ChevronDown,
  LogOut,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { formatRupiah } from '@/lib/finance';
import { Shift } from '@/types';

export const Header: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const {
    user,
    business,
    activeOutlet,
    outlets,
    setActiveOutlet,
    darkMode,
    toggleDarkMode,
    soundEnabled,
    toggleSound,
    currentView,
    setCurrentView,
    loginAs,
    logout,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const { items, setIsCartDrawerOpen } = useCart();

  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isOutletMenuOpen, setIsOutletMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Fetch active shift status
  useEffect(() => {
    fetch(`/api/shifts?outletId=${activeOutlet.id}&activeOnly=true`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setActiveShift(res.data);
      })
      .catch(() => {});
  }, [activeOutlet, currentView]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        {/* Left Side: Brand & Outlet Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-base shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {business.name}
                </span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  POS PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aplikasi Kasir UMKM
              </p>
            </div>
          </div>

          {/* Outlet Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsOutletMenuOpen(!isOutletMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="max-w-[120px] truncate">{activeOutlet.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isOutletMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pilih Cabang Aktif
                </div>
                {outlets.map((outlet) => (
                  <button
                    key={outlet.id}
                    onClick={() => {
                      setActiveOutlet(outlet);
                      setIsOutletMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-left transition-colors ${
                      activeOutlet.id === outlet.id
                        ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{outlet.name}</div>
                      <div className="text-[10px] text-slate-400">{outlet.address || outlet.code}</div>
                    </div>
                    {activeOutlet.id === outlet.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shift Status Indicator */}
          <div
            onClick={() => setCurrentView('shifts')}
            className="hidden lg:flex items-center gap-2 cursor-pointer"
          >
            {activeShift ? (
              <Badge variant="success" size="sm" className="cursor-pointer hover:opacity-90">
                <Clock className="h-3 w-3" />
                <span>Shift Aktif: {activeShift.cashierName}</span>
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="cursor-pointer hover:opacity-90">
                <Clock className="h-3 w-3" />
                <span>Shift Belum Dibuka</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Right Side: Quick Search, Sound, Theme, Notif, Role Switcher, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Shortcut Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Cari produk / aksi...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              Ctrl+K
            </kbd>
          </button>

          {/* POS Action Fast Button */}
          {currentView !== 'pos' && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<ShoppingCart className="h-4 w-4" />}
              onClick={() => setCurrentView('pos')}
              className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700"
            >
              Buka Kasir
            </Button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Ubah Tema Gelap/Terang"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifDrawerOpen(true)}
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600"></span>
                </span>
              )}
            </button>
          </div>

          {/* Active Cart Quick Trigger (Mobile or Floating) */}
          {items.length > 0 && (
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </button>
          )}

          {/* Role Switcher & User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1.5 pl-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-900 dark:text-blue-200">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {user?.role || 'GUEST'}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 mr-1" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                  <Badge variant="info" size="sm" className="mt-1">
                    {user?.role}
                  </Badge>
                </div>

                <div className="p-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ganti Demo Peran (RBAC Test)
                  </div>
                  <button
                    onClick={() => {
                      loginAs('OWNER');
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>Owner / Pemilik (Akses Penuh)</span>
                    {user?.role === 'OWNER' && <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('MANAGER');
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>Manager Toko</span>
                    {user?.role === 'MANAGER' && <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('CASHIER');
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>Kasir (POS & Shift)</span>
                    {user?.role === 'CASHIER' && <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      loginAs('STAFF_INVENTORY');
                      setIsRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>Staff Gudang & Stok</span>
                    {user?.role === 'STAFF_INVENTORY' && (
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-100 p-1 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      setCurrentView('landing');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Halaman Depan / Landing</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <Drawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        title="Pusat Notifikasi & Peringatan"
        footer={
          <div className="flex w-full justify-between items-center">
            <span className="text-xs text-slate-500">{notifications.length} notifikasi</span>
            <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
              Tandai Semua Dibaca
            </Button>
          </div>
        }
      >
        <div className="space-y-2.5">
          {notifications.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">Tidak ada notifikasi baru.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`rounded-2xl border p-3.5 transition-colors cursor-pointer ${
                  notif.isRead
                    ? 'border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-900/60 opacity-70'
                    : 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {notif.title}
                  </h4>
                  <Badge
                    size="sm"
                    variant={
                      notif.type === 'STOCK_ALERT'
                        ? 'warning'
                        : notif.type === 'SHIFT'
                        ? 'info'
                        : 'default'
                    }
                  >
                    {notif.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  );
};
