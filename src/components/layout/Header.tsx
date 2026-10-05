import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/utils/formatters';
import {
  Store,
  Search,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Maximize,
  Clock,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Role } from '@/types';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const {
    activeOutlet,
    outlets,
    setActiveOutlet,
    user,
    loginAs,
    currentShift,
    setCurrentView,
    soundEnabled,
    toggleSound,
    darkMode,
    toggleDarkMode,
    showToast,
  } = useApp();

  const { heldOrders } = useCart();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRoleSelect = (role: Role) => {
    loginAs(role);
    setShowRoleDropdown(false);
  };

  return (
    <header className="h-13 sm:h-16 border-b border-[#e2ded6] bg-[#fcfbf8] dark:border-[#2e3542] dark:bg-[#181b20] px-2.5 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Outlet Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-4">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
        >
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-2xl bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21] shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="hidden xs:block sm:block">
            <div className="text-xs sm:text-sm font-black tracking-tight text-[#1a1d24] dark:text-[#f4f2ec] flex items-center gap-1">
              <span>KasirKu</span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.2 rounded-md bg-[#efece6] text-[#333a47] dark:bg-[#252b36] dark:text-[#e4e2db]">
                UMKM
              </span>
              <span className="text-[8px] font-black tracking-wider px-1 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-500/20 hidden sm:inline">
                by SFG
              </span>
            </div>
            <p className="text-[9px] text-[#70798a] dark:text-[#9aa2b0] font-medium hidden sm:block">POS & ERP Bisnis</p>
          </div>
        </div>

        {/* Outlet Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOutletDropdown((prev) => !prev)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#f7f6f2] dark:bg-[#20252e] hover:bg-[#efece6] dark:hover:bg-[#262c37] text-[11px] sm:text-xs font-bold text-[#1f232b] dark:text-[#f4f2ec] transition-colors min-h-[32px] sm:min-h-[38px]"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#4a5568] dark:bg-[#a0aec0] shrink-0" />
            <span className="max-w-[75px] xs:max-w-[110px] sm:max-w-[170px] truncate">{activeOutlet.name}</span>
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#6c7585] shrink-0" />
          </button>

          {showOutletDropdown && (
            <div className="absolute left-0 mt-1.5 w-60 sm:w-64 rounded-xl sm:rounded-2xl border border-[#dcd7ce] bg-[#fcfbf8] p-1.5 sm:p-2 shadow-2xl dark:border-[#333b49] dark:bg-[#1c2026] z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[9px] sm:text-[10px] font-black text-[#7a8394] uppercase tracking-wider">
                Pilih Cabang / Outlet
              </div>
              {outlets.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => {
                    setActiveOutlet(outlet);
                    setShowOutletDropdown(false);
                    showToast('info', `Beralih ke outlet: ${outlet.name}`);
                  }}
                  className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors ${
                    activeOutlet.id === outlet.id
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                      : 'text-[#2b313d] dark:text-[#dcd9d2] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
                  }`}
                >
                  <div className="text-left">
                    <div>{outlet.name}</div>
                    <div className="text-[9px] opacity-75">{outlet.code} • Pajak {(outlet.taxRate * 100).toFixed(0)}%</div>
                  </div>
                  {outlet.isMain && (
                    <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-md border border-current opacity-80">
                      Pusat
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search & Shift status */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#f7f6f2] dark:bg-[#20252e] text-[#6c7585] hover:border-[#b8b2a5] dark:hover:border-[#485366] text-xs font-medium transition-all min-h-[36px]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Cari produk, transaksi, SKU</span>
          <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#e5e1d7] dark:bg-[#2e3542] text-[#2c323e] dark:text-[#f4f2ec] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Shift Cash Drawer Status */}
        <button
          onClick={() => setCurrentView('shifts')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-all min-h-[32px] sm:min-h-[36px] ${
            currentShift
              ? 'border-[#444c5d] bg-[#1f232b] text-[#f7f6f2] dark:border-[#c5bfb4] dark:bg-[#f5f4ef] dark:text-[#181b21]'
              : 'border-[#dcd7ce] bg-[#efece6] text-[#333a47] dark:border-[#333b49] dark:bg-[#20252e] dark:text-[#c4cad4]'
          }`}
          title="Status Shift Kasir"
        >
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">
            {currentShift ? `Kasir: ${formatRupiah(currentShift.startingCash + currentShift.totalCashSales - currentShift.cashOutExpenses)}` : 'Shift Tutup'}
          </span>
          <span className="sm:hidden">{currentShift ? 'Kasir' : 'Tutup'}</span>
        </button>

        {/* Quick Search on Mobile */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 rounded-lg sm:rounded-xl text-[#3b4251] dark:text-[#c4cad4] hover:bg-[#efece6] dark:hover:bg-[#252b36] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center border border-[#dcd7ce] dark:border-[#333b49]"
          title="Pencarian Cepat"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Held Orders quick badge */}
        {heldOrders.length > 0 && (
          <button
            onClick={() => setCurrentView('pos')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg sm:rounded-xl bg-[#282d38] text-[#f7f6f2] dark:bg-[#e4e1d8] dark:text-[#181b21] text-[10px] sm:text-xs font-black min-h-[32px]"
          >
            <span>Parkir ({heldOrders.length})</span>
          </button>
        )}
      </div>

      {/* Right Controls: Sound, Theme, Fullscreen, Role Switcher */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleSound}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#5c6475] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-colors min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
          title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#5c6475] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-colors min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#e2ded6]" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 rounded-xl text-[#5c6475] hover:text-[#1a1d24] dark:text-[#9aa2b0] dark:hover:text-[#f4f2ec] hover:bg-[#efece6] dark:hover:bg-[#252b36] transition-colors min-h-[36px] min-w-[36px] items-center justify-center"
          title="Layar Penuh (Kiosk Mode)"
        >
          <Maximize className="h-4 w-4" />
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative ml-0.5 sm:ml-1">
          <button
            onClick={() => setShowRoleDropdown((prev) => !prev)}
            className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-lg sm:rounded-2xl border border-[#dcd7ce] dark:border-[#333b49] bg-[#f7f6f2] dark:bg-[#20252e] hover:bg-[#efece6] dark:hover:bg-[#262c37] transition-all min-h-[32px] sm:min-h-[36px]"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md sm:rounded-xl object-cover ring-1 ring-[#383f4d]/30"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black text-[#1a1d24] dark:text-[#f4f2ec] leading-tight">
                {user.name}
              </div>
              <div className="text-[9px] font-bold text-[#626a7a] dark:text-[#a0a8b7] uppercase">
                {user.role}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#6c7585]" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-60 sm:w-64 rounded-xl sm:rounded-2xl border border-[#dcd7ce] bg-[#fcfbf8] p-1.5 sm:p-2 shadow-2xl dark:border-[#333b49] dark:bg-[#1c2026] z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[9px] sm:text-[10px] font-black text-[#7a8394] uppercase tracking-wider flex items-center justify-between">
                <span>Simulasi Peran (RBAC)</span>
                <ShieldCheck className="h-3.5 w-3.5 text-[#485060]" />
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleRoleSelect('OWNER')}
                  className={`w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs font-bold text-left transition-colors ${
                    user.role === 'OWNER'
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                      : 'text-[#2c323e] dark:text-[#dcd9d2] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
                  }`}
                >
                  <span className="text-sm sm:text-base">👑</span>
                  <div>
                    <div>Owner (Pemilik Toko)</div>
                    <div className="text-[9px] opacity-75">Akses penuh semua modul & audit</div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('MANAGER')}
                  className={`w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs font-bold text-left transition-colors ${
                    user.role === 'MANAGER'
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                      : 'text-[#2c323e] dark:text-[#dcd9d2] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
                  }`}
                >
                  <span className="text-sm sm:text-base">🛡️</span>
                  <div>
                    <div>Store Manager</div>
                    <div className="text-[9px] opacity-75">Laporan, stok, & operasional</div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('CASHIER')}
                  className={`w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs font-bold text-left transition-colors ${
                    user.role === 'CASHIER'
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                      : 'text-[#2c323e] dark:text-[#dcd9d2] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
                  }`}
                >
                  <span className="text-sm sm:text-base">🛒</span>
                  <div>
                    <div>Kasir (Cashier)</div>
                    <div className="text-[9px] opacity-75">Terminal POS, kas laci, & struk</div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('STAFF_INVENTORY')}
                  className={`w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs font-bold text-left transition-colors ${
                    user.role === 'STAFF_INVENTORY'
                      ? 'bg-[#1f232b] text-[#f7f6f2] dark:bg-[#f5f4ef] dark:text-[#181b21]'
                      : 'text-[#2c323e] dark:text-[#dcd9d2] hover:bg-[#efece6] dark:hover:bg-[#252b36]'
                  }`}
                >
                  <span className="text-sm sm:text-base">📦</span>
                  <div>
                    <div>Staff Gudang (Inventory)</div>
                    <div className="text-[9px] opacity-75">Stok opname, PO & mutasi barang</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
